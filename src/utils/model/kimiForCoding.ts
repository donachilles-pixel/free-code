import { isEnvTruthy } from '../envUtils.js'

export const KIMI_FOR_CODING_DEFAULT_BASE_URL =
  'https://api.kimi.com/coding/'
export const KIMI_FOR_CODING_DEFAULT_MODEL = 'kimi-for-coding'
export const KIMI_FOR_CODING_CONTEXT_WINDOW = 262_144
export const KIMI_FOR_CODING_MAX_OUTPUT_TOKENS = 32_768

export function isKimiForCodingBaseUrl(baseUrl: string | undefined): boolean {
  if (!baseUrl) return false

  try {
    const url = new URL(baseUrl)
    const host = url.hostname.toLowerCase()
    const path = url.pathname.replace(/\/+$/g, '').toLowerCase()
    return (
      host === 'api.kimi.com' &&
      (path === '/coding' || path.startsWith('/coding/'))
    )
  } catch {
    return false
  }
}

export function isKimiForCodingEnabled(): boolean {
  return (
    isEnvTruthy(process.env.CLAUDE_CODE_USE_KIMI_FOR_CODING) ||
    isKimiForCodingBaseUrl(process.env.ANTHROPIC_BASE_URL)
  )
}

function ensureTrailingSlash(url: string): string {
  return url.endsWith('/') ? url : `${url}/`
}

function normalizeKimiForCodingBaseUrl(baseUrl: string): string {
  try {
    const url = new URL(baseUrl)
    const path = url.pathname.replace(/\/+$/g, '')
    if (path.toLowerCase().endsWith('/v1')) {
      url.pathname = `${path.slice(0, -3)}/`
      return url.toString()
    }
  } catch {
    // Fall through to simple trailing-slash normalization.
  }
  return ensureTrailingSlash(baseUrl)
}

export function getKimiForCodingBaseURL(): string {
  return normalizeKimiForCodingBaseUrl(
    process.env.KIMI_FOR_CODING_BASE_URL ||
      process.env.ANTHROPIC_BASE_URL ||
      KIMI_FOR_CODING_DEFAULT_BASE_URL,
  )
}

export function getKimiForCodingModel(): string {
  return process.env.KIMI_FOR_CODING_MODEL || KIMI_FOR_CODING_DEFAULT_MODEL
}

export function getKimiForCodingApiKey(): string | undefined {
  return (
    process.env.KIMI_FOR_CODING_API_KEY ||
    process.env.KIMI_API_KEY ||
    process.env.ANTHROPIC_AUTH_TOKEN
  )
}

export function isKimiForCodingModel(model: string): boolean {
  const m = model.toLowerCase()
  const configured = getKimiForCodingModel().toLowerCase()
  return (
    m === configured ||
    m === KIMI_FOR_CODING_DEFAULT_MODEL ||
    m.includes('kimi-for-coding') ||
    m.includes('kimi-k2')
  )
}
