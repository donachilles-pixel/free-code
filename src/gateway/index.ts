import { getFocusGatewayConfig, isFocusGatewayRequested } from './config.js'
import { FeishuGateway } from './feishuGateway.js'

let gateway: FeishuGateway | null = null

export function isFocusGatewayEnabled(): boolean {
  return isFocusGatewayRequested()
}

export function getOrCreateFocusGateway(): FeishuGateway | null {
  const config = getFocusGatewayConfig()
  if (!config) return null
  if (!gateway) {
    gateway = new FeishuGateway(config)
  }
  return gateway
}

export function getRunningFocusGateway(): FeishuGateway | null {
  return gateway?.isRunning ? gateway : null
}

export async function stopFocusGateway(): Promise<void> {
  const current = gateway
  gateway = null
  await current?.stop()
}
