import { createServer, type Server } from 'http'
import type { FocusGatewayConfig } from './config.js'
import { FeishuClient, type FeishuSendTarget } from './feishuClient.js'

type FeishuSdkModule = typeof import('@larksuiteoapi/node-sdk')
type FeishuWsClient = InstanceType<FeishuSdkModule['WSClient']>

type GatewayCallbacks = {
  onPrompt(text: string): void
  onInterrupt(): void
}

type PermissionResponse = {
  behavior: 'allow' | 'deny'
  from: 'feishu'
}

type PermissionRequest = {
  requestId: string
  toolName: string
  description: string
  inputPreview: string
}

type FeishuEventBody = {
  challenge?: string
  token?: string
  encrypt?: string
  header?: {
    event_id?: string
    event_type?: string
    token?: string
  }
  event?: {
    sender?: {
      sender_id?: {
        open_id?: string
        user_id?: string
        union_id?: string
      }
    }
    message?: {
      message_id?: string
      chat_id?: string
      chat_type?: string
      message_type?: string
      content?: string
    }
  }
  type?: string
}

type FeishuMessageEvent = {
  event_id?: string
  token?: string
  sender?: {
    sender_id?: {
      open_id?: string
      user_id?: string
      union_id?: string
    }
  }
  message?: {
    message_id?: string
    chat_id?: string
    chat_type?: string
    message_type?: string
    content?: string
  }
}

const PERMISSION_REPLY_RE =
  /^\s*(y|yes|同意|批准|允许|n|no|否|拒绝|拒绝执行)\s+([a-km-z]{5})\s*$/i

function parseTextContent(raw: string | undefined): string | null {
  if (!raw) return null
  try {
    const content = JSON.parse(raw) as { text?: unknown }
    if (typeof content.text !== 'string') return null
    return content.text
      .replace(/<at\s+[^>]*>.*?<\/at>/g, '')
      .replace(/\u00a0/g, ' ')
      .trim()
  } catch {
    return null
  }
}

function isAllowWord(word: string): boolean {
  return ['y', 'yes', '同意', '批准', '允许'].includes(word.toLowerCase())
}

function splitText(text: string, maxChars: number): string[] {
  if (text.length <= maxChars) return [text]
  const chunks: string[] = []
  for (let i = 0; i < text.length; i += maxChars) {
    chunks.push(text.slice(i, i + maxChars))
  }
  return chunks
}

export class FeishuGateway {
  private readonly client: FeishuClient
  private server: Server | undefined
  private wsClient: FeishuWsClient | undefined
  private running = false
  private callbacks: GatewayCallbacks | undefined
  private activeTarget: FeishuSendTarget | undefined
  private readonly seenMessageIds = new Set<string>()
  private readonly pendingPermissionHandlers = new Map<
    string,
    (response: PermissionResponse) => void
  >()
  private readonly pendingOutbound: string[] = []
  private sendChain: Promise<void> = Promise.resolve()

  constructor(private readonly config: FocusGatewayConfig) {
    this.client = new FeishuClient(config.feishu)
    if (config.feishu.chatId) {
      this.activeTarget = {
        receiveId: config.feishu.chatId,
        receiveIdType: config.feishu.receiveIdType,
      }
    }
  }

  get isRunning(): boolean {
    return this.running
  }

  get listenUrl(): string {
    return `http://${this.config.host}:${this.config.port}${this.config.path}`
  }

  get callbackUrl(): string {
    return this.config.publicUrl ?? this.listenUrl
  }

  get shouldSendTranscript(): boolean {
    return this.config.sendTranscript
  }

  get startupMessage(): string {
    if (this.config.eventMode === 'websocket') {
      return 'Feishu gateway started in SDK long-connection mode. No callback URL is required.'
    }
    return `Feishu gateway listening at ${this.listenUrl}. Configure Feishu callback URL as ${this.callbackUrl}.`
  }

  get statusMessage(): string {
    if (this.config.eventMode === 'websocket') {
      const reconnectInfo = this.wsClient?.getReconnectInfo()
      const suffix = reconnectInfo?.nextConnectTime
        ? ` Next reconnect: ${new Date(reconnectInfo.nextConnectTime).toLocaleString()}.`
        : ''
      return `[Focus Code gateway] running. Feishu SDK long-connection mode; no callback URL is required.${suffix}`
    }
    return `[Focus Code gateway] running. Callback URL: ${this.callbackUrl}`
  }

  async start(callbacks: GatewayCallbacks): Promise<void> {
    this.callbacks = callbacks
    if (this.running) return

    if (this.config.eventMode === 'websocket') {
      await this.startWebSocket()
      this.running = true
      return
    }

    await this.startCallbackServer()
    this.running = true
  }

  private async startCallbackServer(): Promise<void> {
    this.server = createServer((request, response) => {
      void this.handleRequest(request, response).catch(error => {
        response.statusCode = 500
        response.setHeader('Content-Type', 'application/json')
        response.end(JSON.stringify({ error: String(error) }))
      })
    })

    try {
      await new Promise<void>((resolve, reject) => {
        this.server!.once('error', reject)
        this.server!.listen(this.config.port, this.config.host, () => {
          this.server!.off('error', reject)
          resolve()
        })
      })
    } catch (error) {
      const server = this.server
      this.server = undefined
      server?.close()
      throw error
    }
  }

  private async startWebSocket(): Promise<void> {
    const Lark = await import('@larksuiteoapi/node-sdk')
    const logger = {
      error: () => undefined,
      warn: () => undefined,
      info: () => undefined,
      debug: () => undefined,
      trace: () => undefined,
    }
    const eventDispatcher = new Lark.EventDispatcher({
      logger,
      loggerLevel: Lark.LoggerLevel.error,
    }).register({
      'im.message.receive_v1': async (data: FeishuMessageEvent) => {
        await this.handleMessageEvent(data)
      },
    })
    const wsClient = new Lark.WSClient({
      appId: this.config.feishu.appId,
      appSecret: this.config.feishu.appSecret,
      logger,
      loggerLevel: Lark.LoggerLevel.error,
    })
    this.wsClient = wsClient
    await wsClient.start({ eventDispatcher })
  }

  async stop(): Promise<void> {
    const server = this.server
    const wsClient = this.wsClient
    this.server = undefined
    this.wsClient = undefined
    this.running = false
    this.callbacks = undefined
    this.pendingPermissionHandlers.clear()
    wsClient?.close({ force: true })
    if (server) {
      await new Promise<void>(resolve => server.close(() => resolve()))
    }
  }

  onPermissionResponse(
    requestId: string,
    handler: (response: PermissionResponse) => void,
  ): () => void {
    const key = requestId.toLowerCase()
    this.pendingPermissionHandlers.set(key, handler)
    return () => {
      this.pendingPermissionHandlers.delete(key)
    }
  }

  sendPermissionRequest(request: PermissionRequest): void {
    const text = [
      '[Focus Code 权限确认]',
      `回复: yes ${request.requestId} 或 no ${request.requestId}`,
      `工具: ${request.toolName}`,
      `说明: ${request.description}`,
      '输入预览:',
      request.inputPreview,
    ].join('\n')
    this.sendText(text)
  }

  sendText(text: string): void {
    for (const chunk of splitText(text, this.config.maxMessageChars)) {
      this.enqueueSend(chunk)
    }
  }

  private enqueueSend(text: string): void {
    const target = this.activeTarget
    if (!target) {
      this.pendingOutbound.push(text)
      if (this.pendingOutbound.length > 20) this.pendingOutbound.shift()
      return
    }

    this.sendChain = this.sendChain
      .then(() => this.client.sendText(target, text))
      .catch(() => undefined)
  }

  private rememberChat(chatId: string | undefined): void {
    if (!chatId || this.activeTarget) return
    this.activeTarget = { receiveId: chatId, receiveIdType: 'chat_id' }
    const pending = this.pendingOutbound.splice(0)
    for (const text of pending) {
      this.enqueueSend(text)
    }
  }

  private isAuthorized(event: FeishuMessageEvent): boolean {
    const chatId = event.message?.chat_id
    const openId = event.sender?.sender_id?.open_id
    const { allowedChatIds, allowedOpenIds, chatId: configuredChatId } =
      this.config.feishu

    if (allowedChatIds.size > 0 && (!chatId || !allowedChatIds.has(chatId))) {
      return false
    }
    if (allowedOpenIds.size > 0 && (!openId || !allowedOpenIds.has(openId))) {
      return false
    }
    if (
      allowedChatIds.size === 0 &&
      configuredChatId &&
      chatId &&
      configuredChatId !== chatId
    ) {
      return false
    }
    if (
      allowedChatIds.size === 0 &&
      !configuredChatId &&
      this.activeTarget?.receiveId &&
      this.activeTarget.receiveIdType === 'chat_id' &&
      chatId &&
      this.activeTarget.receiveId !== chatId
    ) {
      return false
    }
    return true
  }

  private validateToken(body: FeishuEventBody): boolean {
    const expected = this.config.feishu.verificationToken
    if (!expected) return true
    return body.token === expected || body.header?.token === expected
  }

  private async handleRequest(
    request: import('http').IncomingMessage,
    response: import('http').ServerResponse,
  ): Promise<void> {
    if (request.method !== 'POST' || request.url?.split('?')[0] !== this.config.path) {
      response.statusCode = 404
      response.end('not found')
      return
    }

    const rawBody = await new Promise<string>((resolve, reject) => {
      const chunks: Buffer[] = []
      request.on('data', chunk => chunks.push(Buffer.from(chunk)))
      request.on('end', () => resolve(Buffer.concat(chunks).toString('utf8')))
      request.on('error', reject)
    })

    const body = JSON.parse(rawBody) as FeishuEventBody
    if (!this.validateToken(body)) {
      response.statusCode = 401
      response.end(JSON.stringify({ error: 'invalid token' }))
      return
    }

    response.setHeader('Content-Type', 'application/json')
    if (body.challenge || body.type === 'url_verification') {
      response.end(JSON.stringify({ challenge: body.challenge }))
      return
    }
    if (body.encrypt) {
      response.statusCode = 400
      response.end(
        JSON.stringify({
          error:
            'encrypted Feishu callbacks are not supported; disable event encryption for this gateway',
        }),
      )
      return
    }

    if (body.header?.event_type === 'im.message.receive_v1') {
      await this.handleCallbackMessage(body)
    }

    response.end(JSON.stringify({ code: 0 }))
  }

  private async handleCallbackMessage(body: FeishuEventBody): Promise<void> {
    await this.handleMessageEvent({
      event_id: body.header?.event_id,
      token: body.header?.token ?? body.token,
      sender: body.event?.sender,
      message: body.event?.message,
    })
  }

  private async handleMessageEvent(event: FeishuMessageEvent): Promise<void> {
    const message = event.message
    if (!message || message.message_type !== 'text') return
    if (message.message_id) {
      if (this.seenMessageIds.has(message.message_id)) return
      this.seenMessageIds.add(message.message_id)
      if (this.seenMessageIds.size > 500) {
        const first = this.seenMessageIds.values().next().value
        if (first) this.seenMessageIds.delete(first)
      }
    }
    if (!this.isAuthorized(event)) return

    this.rememberChat(message.chat_id)
    const text = parseTextContent(message.content)
    if (!text) return

    if (this.tryResolvePermission(text)) return
    if (this.tryHandleCommand(text)) return

    if (!this.config.allowSlashCommands && text.trim().startsWith('/')) {
      this.sendText('Slash commands are disabled for the Focus Code gateway.')
      return
    }

    this.callbacks?.onPrompt(text)
    if (this.config.ackInput) {
      this.sendText('[Focus Code gateway] 已收到，正在发送给会话。')
    }
  }

  private tryResolvePermission(text: string): boolean {
    const match = text.match(PERMISSION_REPLY_RE)
    if (!match) return false

    const behavior = isAllowWord(match[1]!) ? 'allow' : 'deny'
    const requestId = match[2]!.toLowerCase()
    const handler = this.pendingPermissionHandlers.get(requestId)
    if (!handler) {
      this.sendText(`[Focus Code gateway] 权限请求 ${requestId} 已过期或不存在。`)
      return true
    }

    this.pendingPermissionHandlers.delete(requestId)
    handler({ behavior, from: 'feishu' })
    this.sendText(
      `[Focus Code gateway] 已${behavior === 'allow' ? '批准' : '拒绝'} ${requestId}。`,
    )
    return true
  }

  private tryHandleCommand(text: string): boolean {
    const normalized = text.trim().toLowerCase()
    switch (normalized) {
      case '/help':
      case 'help':
        this.sendText(
          [
            'Focus Code gateway commands:',
            '- Send any text to submit it as the next prompt.',
            '- Reply "yes <code>" or "no <code>" to permission requests.',
            '- /interrupt cancels the active request.',
            '- /status shows gateway status.',
          ].join('\n'),
        )
        return true
      case '/status':
      case 'status':
        this.sendText(this.statusMessage)
        return true
      case '/interrupt':
      case 'interrupt':
      case '停止':
        this.callbacks?.onInterrupt()
        this.sendText('[Focus Code gateway] 已发送中断请求。')
        return true
      default:
        return false
    }
  }
}
