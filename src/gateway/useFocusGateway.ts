import type React from 'react'
import { useEffect, useRef } from 'react'
import type { Tool } from '../Tool.js'
import type { Message } from '../types/message.js'
import { logForDebugging } from '../utils/debug.js'
import { enqueue } from '../utils/messageQueueManager.js'
import { createSystemMessage } from '../utils/messages.js'
import { errorMessage } from '../utils/errors.js'
import {
  getOrCreateFocusGateway,
  isFocusGatewayEnabled,
  stopFocusGateway,
} from './index.js'
import { formatMessageForGateway } from './messageFormatter.js'

type UseFocusGatewayProps = {
  messages: Message[]
  tools: Tool[]
  setMessages: React.Dispatch<React.SetStateAction<Message[]>>
  abortControllerRef: React.RefObject<AbortController | null>
}

export function useFocusGateway({
  messages,
  tools: _tools,
  setMessages,
  abortControllerRef,
}: UseFocusGatewayProps): void {
  const lastForwardedIndexRef = useRef(messages.length)
  const messagesLengthRef = useRef(messages.length)
  const startedRef = useRef(false)
  messagesLengthRef.current = messages.length

  useEffect(() => {
    if (!isFocusGatewayEnabled()) return

    let gateway: ReturnType<typeof getOrCreateFocusGateway>
    try {
      gateway = getOrCreateFocusGateway()
    } catch (error) {
      const message = errorMessage(error)
      logForDebugging(`[gateway] Invalid Feishu gateway config: ${message}`, {
        level: 'error',
      })
      setMessages(prev => [
        ...prev,
        createSystemMessage(`Feishu gateway is not configured: ${message}`, 'warning'),
      ])
      return
    }
    if (!gateway) return

    let cancelled = false
    void gateway
      .start({
        onPrompt(text) {
          enqueue({
            mode: 'prompt',
            value: text,
            priority: 'next',
          })
        },
        onInterrupt() {
          abortControllerRef.current?.abort()
        },
      })
      .then(() => {
        if (cancelled) return
        startedRef.current = true
        lastForwardedIndexRef.current = messagesLengthRef.current
        setMessages(prev => [
          ...prev,
          createSystemMessage(gateway.startupMessage, 'info'),
        ])
      })
      .catch(error => {
        if (cancelled) return
        const message = errorMessage(error)
        logForDebugging(`[gateway] Failed to start Feishu gateway: ${message}`, {
          level: 'error',
        })
        setMessages(prev => [
          ...prev,
          createSystemMessage(`Feishu gateway failed to start: ${message}`, 'warning'),
        ])
      })

    return () => {
      cancelled = true
      startedRef.current = false
      void stopFocusGateway()
    }
  }, [abortControllerRef, setMessages])

  useEffect(() => {
    if (!startedRef.current) return
    const gateway = getOrCreateFocusGateway()
    if (!gateway || !gateway.shouldSendTranscript) return

    const start = lastForwardedIndexRef.current
    if (messages.length <= start) return
    lastForwardedIndexRef.current = messages.length

    for (const message of messages.slice(start)) {
      const text = formatMessageForGateway(message)
      if (text) {
        gateway.sendText(text)
      }
    }
  }, [messages])
}
