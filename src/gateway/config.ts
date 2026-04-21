import { isEnvTruthy } from '../utils/envUtils.js'

export type FocusGatewayProvider = 'feishu'
export type FocusGatewayEventMode = 'websocket' | 'callback'

export type FeishuGatewayConfig = {
  appId: string
  appSecret: string
  apiBaseUrl: string
  verificationToken?: string
  receiveIdType: 'chat_id' | 'open_id' | 'user_id' | 'union_id' | 'email'
  chatId?: string
  allowedChatIds: Set<string>
  allowedOpenIds: Set<string>
}

export type FocusGatewayConfig = {
  provider: FocusGatewayProvider
  eventMode: FocusGatewayEventMode
  host: string
  port: number
  path: string
  publicUrl?: string
  sendTranscript: boolean
  allowSlashCommands: boolean
  ackInput: boolean
  maxMessageChars: number
  feishu: FeishuGatewayConfig
}

const DEFAULT_HOST = '127.0.0.1'
const DEFAULT_PORT = 8787
const DEFAULT_PATH = '/feishu/events'
const DEFAULT_API_BASE_URL = 'https://open.feishu.cn/open-apis'
const DEFAULT_MAX_MESSAGE_CHARS = 3000

function readString(name: string): string | undefined {
  const value = process.env[name]?.trim()
  return value ? value : undefined
}

function readBoolean(name: string, defaultValue: boolean): boolean {
  const value = process.env[name]
  if (value === undefined) return defaultValue
  return isEnvTruthy(value)
}

function readNumber(name: string, defaultValue: number): number {
  const raw = process.env[name]
  if (!raw) return defaultValue
  const parsed = Number(raw)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : defaultValue
}

function readCsvSet(name: string): Set<string> {
  return new Set(
    (process.env[name] ?? '')
      .split(',')
      .map(item => item.trim())
      .filter(Boolean),
  )
}

function normalizePath(path: string | undefined): string {
  if (!path) return DEFAULT_PATH
  return path.startsWith('/') ? path : `/${path}`
}

function readReceiveIdType(): FeishuGatewayConfig['receiveIdType'] {
  const value = readString('FOCUS_CODE_FEISHU_RECEIVE_ID_TYPE')
  switch (value) {
    case 'chat_id':
    case 'open_id':
    case 'user_id':
    case 'union_id':
    case 'email':
      return value
    default:
      return 'chat_id'
  }
}

function readEventMode(): FocusGatewayEventMode {
  const value = (
    readString('FOCUS_CODE_GATEWAY_EVENT_MODE') ??
    readString('FOCUS_CODE_FEISHU_EVENT_MODE')
  )?.toLowerCase()

  switch (value) {
    case 'callback':
    case 'webhook':
    case 'http':
      return 'callback'
    case 'websocket':
    case 'ws':
    case 'long_connection':
    case 'long-connection':
      return 'websocket'
    default:
      // Preserve old callback deployments that already export a public URL,
      // while making new Feishu gateway sessions use SDK long connection mode.
      return readString('FOCUS_CODE_GATEWAY_PUBLIC_URL')
        ? 'callback'
        : 'websocket'
  }
}

export function isFocusGatewayRequested(): boolean {
  const provider = readString('FOCUS_CODE_GATEWAY')?.toLowerCase()
  return (
    provider === 'feishu' ||
    isEnvTruthy(process.env.FOCUS_CODE_GATEWAY_ENABLED) ||
    isEnvTruthy(process.env.FOCUS_CODE_FEISHU_ENABLED)
  )
}

export function getFocusGatewayConfig(): FocusGatewayConfig | null {
  if (!isFocusGatewayRequested()) {
    return null
  }

  const provider = (readString('FOCUS_CODE_GATEWAY') ?? 'feishu').toLowerCase()
  if (provider !== 'feishu') {
    throw new Error(`Unsupported Focus Code gateway provider: ${provider}`)
  }

  const appId = readString('FOCUS_CODE_FEISHU_APP_ID')
  const appSecret = readString('FOCUS_CODE_FEISHU_APP_SECRET')
  if (!appId || !appSecret) {
    throw new Error(
      'Feishu gateway requires FOCUS_CODE_FEISHU_APP_ID and FOCUS_CODE_FEISHU_APP_SECRET',
    )
  }

  return {
    provider: 'feishu',
    eventMode: readEventMode(),
    host: readString('FOCUS_CODE_GATEWAY_HOST') ?? DEFAULT_HOST,
    port: readNumber('FOCUS_CODE_GATEWAY_PORT', DEFAULT_PORT),
    path: normalizePath(readString('FOCUS_CODE_GATEWAY_PATH')),
    publicUrl: readString('FOCUS_CODE_GATEWAY_PUBLIC_URL'),
    sendTranscript: readBoolean('FOCUS_CODE_GATEWAY_SEND_TRANSCRIPT', true),
    allowSlashCommands: readBoolean(
      'FOCUS_CODE_GATEWAY_ALLOW_SLASH_COMMANDS',
      true,
    ),
    ackInput: readBoolean('FOCUS_CODE_GATEWAY_ACK_INPUT', true),
    maxMessageChars: readNumber(
      'FOCUS_CODE_GATEWAY_MAX_MESSAGE_CHARS',
      DEFAULT_MAX_MESSAGE_CHARS,
    ),
    feishu: {
      appId,
      appSecret,
      apiBaseUrl:
        readString('FOCUS_CODE_FEISHU_API_BASE_URL') ?? DEFAULT_API_BASE_URL,
      verificationToken: readString('FOCUS_CODE_FEISHU_VERIFICATION_TOKEN'),
      receiveIdType: readReceiveIdType(),
      chatId: readString('FOCUS_CODE_FEISHU_CHAT_ID'),
      allowedChatIds: readCsvSet('FOCUS_CODE_FEISHU_ALLOWED_CHAT_IDS'),
      allowedOpenIds: readCsvSet('FOCUS_CODE_FEISHU_ALLOWED_OPEN_IDS'),
    },
  }
}
