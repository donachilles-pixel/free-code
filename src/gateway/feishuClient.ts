import type { FeishuGatewayConfig } from './config.js'

type TenantTokenResponse = {
  code?: number
  msg?: string
  tenant_access_token?: string
  expire?: number
}

type FeishuApiResponse = {
  code?: number
  msg?: string
  data?: unknown
}

export type FeishuSendTarget = {
  receiveId: string
  receiveIdType: FeishuGatewayConfig['receiveIdType']
}

export class FeishuClient {
  private tenantToken: string | undefined
  private tenantTokenExpiresAt = 0

  constructor(private readonly config: FeishuGatewayConfig) {}

  async sendText(target: FeishuSendTarget, text: string): Promise<void> {
    const token = await this.getTenantAccessToken()
    const url = new URL(`${this.config.apiBaseUrl}/im/v1/messages`)
    url.searchParams.set('receive_id_type', target.receiveIdType)

    const response = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        receive_id: target.receiveId,
        msg_type: 'text',
        content: JSON.stringify({ text }),
      }),
    })

    const body = (await response.json().catch(() => ({}))) as FeishuApiResponse
    if (!response.ok || body.code !== 0) {
      throw new Error(
        `Feishu send message failed: HTTP ${response.status} code ${body.code ?? 'unknown'} ${body.msg ?? ''}`.trim(),
      )
    }
  }

  private async getTenantAccessToken(): Promise<string> {
    if (this.tenantToken && Date.now() < this.tenantTokenExpiresAt) {
      return this.tenantToken
    }

    const response = await fetch(
      `${this.config.apiBaseUrl}/auth/v3/tenant_access_token/internal`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          app_id: this.config.appId,
          app_secret: this.config.appSecret,
        }),
      },
    )
    const body = (await response.json().catch(() => ({}))) as TenantTokenResponse
    if (!response.ok || body.code !== 0 || !body.tenant_access_token) {
      throw new Error(
        `Feishu tenant_access_token failed: HTTP ${response.status} code ${body.code ?? 'unknown'} ${body.msg ?? ''}`.trim(),
      )
    }

    this.tenantToken = body.tenant_access_token
    const expireMs = Math.max(60, (body.expire ?? 7200) - 60) * 1000
    this.tenantTokenExpiresAt = Date.now() + expireMs
    return this.tenantToken
  }
}
