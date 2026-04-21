import type { Message } from '../types/message.js'
import { getAssistantMessageText, getContentText } from '../utils/messages.js'
import { jsonStringify } from '../utils/slowOperations.js'

const DEFAULT_LIMIT = 3000

function truncate(text: string, limit: number): string {
  if (text.length <= limit) return text
  return `${text.slice(0, Math.max(0, limit - 1))}…`
}

function stringifyUnknown(value: unknown, limit: number): string {
  if (typeof value === 'string') {
    return truncate(value, limit)
  }
  try {
    return truncate(jsonStringify(value), limit)
  } catch {
    return '(unserializable)'
  }
}

function extractToolResultText(message: Message, limit: number): string | null {
  if (message.type !== 'user') return null
  const content = message.message.content
  if (!Array.isArray(content)) return null

  const parts: string[] = []
  for (const block of content) {
    if (block.type !== 'tool_result') continue
    if (typeof block.content === 'string') {
      parts.push(block.content)
    } else if (Array.isArray(block.content)) {
      const text = getContentText(block.content)
      if (text) parts.push(text)
    }
  }

  const text = parts.join('\n').trim()
  return text ? truncate(text, limit) : null
}

function extractToolUseText(message: Message, limit: number): string | null {
  if (message.type !== 'assistant') return null
  const content = message.message.content
  if (!Array.isArray(content)) return null

  const lines: string[] = []
  for (const block of content) {
    if (block.type !== 'tool_use') continue
    lines.push(
      `[Tool] ${block.name}: ${stringifyUnknown(block.input, Math.min(limit, 600))}`,
    )
  }
  return lines.length > 0 ? lines.join('\n') : null
}

export function formatMessageForGateway(
  message: Message,
  limit = DEFAULT_LIMIT,
): string | null {
  if (message.type === 'assistant') {
    const text = getAssistantMessageText(message)
    const toolUseText = extractToolUseText(message, limit)
    const parts = [text, toolUseText].filter(Boolean)
    return parts.length > 0 ? truncate(`[Focus Code]\n${parts.join('\n')}`, limit) : null
  }

  if (message.type === 'system' && 'content' in message && !message.isMeta) {
    return truncate(`[Focus Code system]\n${message.content}`, limit)
  }

  const toolResultText = extractToolResultText(message, limit)
  if (toolResultText) {
    return truncate(`[Tool result]\n${toolResultText}`, limit)
  }

  return null
}
