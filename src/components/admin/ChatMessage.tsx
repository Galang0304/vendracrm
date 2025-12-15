'use client'

import React from 'react'
import { User, Bot } from 'lucide-react'

interface ChatMessageProps {
  message: string | null | undefined
  isUser: boolean
  timestamp: Date
}

export default function ChatMessage({ message, isUser, timestamp }: ChatMessageProps) {
  // Debug logging
  if (!message) {
    console.warn('ChatMessage received empty message:', { message, isUser, timestamp })
  }
  
  const formatAIMessage = (text: string) => {
    // Handle undefined or null text
    if (!text || typeof text !== 'string') {
      return '<p class="text-gray-500 italic">No message content</p>'
    }
    
    // Replace markdown-style formatting
    let formatted = text
      // Bold text
      .replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold text-gray-900">$1</strong>')
      // Italic text
      .replace(/\*(.*?)\*/g, '<em class="italic text-gray-700">$1</em>')
      // Headers
      .replace(/^### (.*$)/gm, '<h3 class="text-lg font-bold text-gray-900 mt-4 mb-2">$1</h3>')
      .replace(/^## (.*$)/gm, '<h2 class="text-xl font-bold text-gray-900 mt-4 mb-2">$1</h2>')
      .replace(/^# (.*$)/gm, '<h1 class="text-2xl font-bold text-gray-900 mt-4 mb-2">$1</h1>')
      // Code blocks
      .replace(/`([^`]+)`/g, '<code class="bg-gray-100 px-2 py-1 rounded text-sm font-mono text-gray-800">$1</code>')
      // Line breaks
      .replace(/\n\n/g, '</p><p class="mb-3">')
      .replace(/\n/g, '<br/>')

    // Handle numbered lists
    formatted = formatted.replace(/^(\d+)\.\s+\*\*(.*?)\*\*:\s*(.*$)/gm, (match, num, title, content) => {
      return `<div class="mb-4">
        <div class="flex items-start space-x-3">
          <div class="bg-blue-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm font-semibold flex-shrink-0 mt-0.5">
            ${num}
          </div>
          <div class="flex-1">
            <h4 class="font-semibold text-gray-900 mb-1">${title}</h4>
            <p class="text-gray-700 text-sm leading-relaxed">${content}</p>
          </div>
        </div>
      </div>`
    })

    // Handle bullet points
    formatted = formatted.replace(/^[•\-\*]\s+\*\*(.*?)\*\*:\s*(.*$)/gm, (match, title, content) => {
      return `<div class="flex items-start space-x-3 mb-2">
        <div class="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0"></div>
        <div class="flex-1">
          <span class="font-semibold text-gray-900">${title}:</span>
          <span class="text-gray-700 ml-1">${content}</span>
        </div>
      </div>`
    })

    // Handle simple bullet points
    formatted = formatted.replace(/^[•\-\*]\s+(.*$)/gm, (match, content) => {
      return `<div class="flex items-start space-x-3 mb-2">
        <div class="w-2 h-2 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
        <div class="flex-1 text-gray-700">${content}</div>
      </div>`
    })

    // Handle metrics/stats (format: "Key: Value")
    formatted = formatted.replace(/^([A-Za-z\s]+):\s*(Rp\s*[\d,\.]+|[\d,\.]+\s*[%\w]*|[A-Za-z\s]+)$/gm, (match, key, value) => {
      return `<div class="flex justify-between items-center py-1 border-b border-gray-100 last:border-b-0">
        <span class="text-gray-600 text-sm">${key.trim()}</span>
        <span class="font-semibold text-gray-900 text-sm">${value.trim()}</span>
      </div>`
    })

    // Wrap in paragraph if not already formatted
    if (!formatted.includes('<div') && !formatted.includes('<h') && !formatted.includes('<p')) {
      formatted = `<p class="mb-3">${formatted}</p>`
    }

    return formatted
  }

  const formatTimestamp = (date: Date) => {
    return date.toLocaleTimeString('id-ID', { 
      hour: '2-digit', 
      minute: '2-digit' 
    })
  }

  return (
    <div className={`flex items-start space-x-3 mb-6 ${isUser ? 'flex-row-reverse space-x-reverse' : ''}`}>
      {/* Avatar */}
      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
        isUser 
          ? 'bg-blue-500 text-white' 
          : 'bg-green-500 text-white'
      }`}>
        {isUser ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
      </div>

      {/* Message Content */}
      <div className={`flex-1 max-w-[80%] ${isUser ? 'text-right' : ''}`}>
        <div className={`inline-block p-4 rounded-lg ${
          isUser 
            ? 'bg-blue-500 text-white' 
            : 'bg-gray-50 border border-gray-200'
        }`}>
          {isUser ? (
            <p className="text-white">{message || 'No message'}</p>
          ) : (
            <div 
              className="text-gray-800 leading-relaxed"
              dangerouslySetInnerHTML={{ 
                __html: formatAIMessage(message || '') 
              }}
            />
          )}
        </div>
        
        {/* Timestamp */}
        <div className={`text-xs text-gray-500 mt-1 ${isUser ? 'text-right' : 'text-left'}`}>
          {formatTimestamp(timestamp)}
        </div>
      </div>
    </div>
  )
}
