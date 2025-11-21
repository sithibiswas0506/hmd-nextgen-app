import React, { KeyboardEvent } from 'react'
import { ArrowLeftIcon, InformationCircleIcon } from '@heroicons/react/24/solid'
import { Contact, Message } from './types'
import MessageBubble from './MessageBubble'

type Props = {
  selected: Contact | null
  messages: Message[]
  text: string
  setText: (s: string) => void
  onSend: () => void
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void
  isMobileView: boolean
  onToggleSidebar?: () => void
  selectedId: string | null
  messagesRef?: React.RefObject<HTMLDivElement>
  onBack?: () => void
  lastActive?: string | null
  formatTime?: (iso?: string) => string
  onDeleteMessage?: (id: string) => void
  onEditMessage?: (id: string) => void
  onReplyMessage?: (id: string) => void
  onPinMessage?: (id: string) => void
  onReportMessage?: (id: string) => void
  onForwardMessage?: (id: string) => void
  replyToMessage?: Message | null
  onCancelReply?: () => void
  editingMessageId?: string | null
  onCancelEdit?: () => void
}

export default function MessagePanel({ selected, messages, text, setText, onSend, onKeyDown, isMobileView, onToggleSidebar, selectedId, messagesRef, onBack, lastActive, formatTime }: Props) {
  if (!selected) {
    return (
      <main className="main empty-screen">
        <div className="header">
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <button className="mobile-toggle" onClick={() => { if (onToggleSidebar) onToggleSidebar() }}>☰</button>
            <div>
              <strong>Welcome</strong>
              <div style={{ fontSize: 12, color: '#666' }}>Open a chat or create a new one to start messaging.</div>
            </div>
          </div>
          <div>
            <button className="info-btn" disabled aria-label="Details">i</button>
          </div>
        </div>
        <div style={{ padding: 28, color: '#666' }}>No conversation selected. Choose a contact from the left or click "New chat" / "New group" to begin.</div>
      </main>
    )
  }

  return (
    <main className="main">
      <div className="header">
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <button className="back-btn" onClick={() => { if (onBack) onBack() }} aria-label="Back to list"><ArrowLeftIcon style={{ width: 18, height: 18 }} /></button>
          {selected && <img src={selected.avatar} style={{ width: 40, height: 40, borderRadius: 8, objectFit: 'cover' }} />}
          <div>
            <strong>{selected?.name ?? 'Select a chat'}</strong>
            <div style={{ fontSize: 12, color: '#666' }}>{lastActive ?? selected?.status}</div>
          </div>
        </div>
        <div>
          <button className="info-btn" onClick={() => { if (selectedId) window.location.hash = `#/chat/${selectedId}` }} aria-label="Chat details"><InformationCircleIcon style={{ width: 18, height: 18 }} /></button>
        </div>
      </div>

      <div className="messages" ref={messagesRef}>
        {messages.map((m, idx) => {
          const isLast = idx === messages.length - 1
          return (
            <MessageBubble
              key={m.id}
              m={m}
              isSelf={m.user === 'You'}
              showTimestamp={isLast}
              onToggleTimestamp={(id) => {
                const el = document.getElementById(`ts-${id}`)
                if (el) {
                  el.style.display = el.style.display === 'none' ? 'block' : 'none'
                }
              }}
              onCopy={(msg) => { try { navigator.clipboard.writeText(msg.text || '') } catch (e) {} }}
              onDelete={(msg) => { if (onDeleteMessage) onDeleteMessage(msg.id) }}
              onInfo={(msg) => { alert(`Message info:\nFrom: ${msg.user}\nAt: ${msg.created_at || ''}`) }}
              onEdit={(msg) => { if (onEditMessage) onEditMessage(msg.id) }}
              onReply={(msg) => { if (onReplyMessage) onReplyMessage(msg.id) }}
              onPin={(msg) => { if (onPinMessage) onPinMessage(msg.id) }}
              onReport={(msg) => { if (onReportMessage) onReportMessage(msg.id) }}
              onForward={(msg) => { if (onForwardMessage) onForwardMessage(msg.id) }}
              formatTime={(iso) => formatTime ? formatTime(iso) : (iso ? new Date(iso).toLocaleString() : '')}
            />
          )
        })}
      </div>

      <div style={{ padding: 8 }}>
        {/* reply / edit preview area would be rendered by parent via props when needed */}
      </div>

      <div className="chat-input">
        <input value={text} onChange={e => setText(e.target.value)} onKeyDown={onKeyDown} placeholder="Write a message..." />
        <button onClick={onSend}>Send</button>
      </div>
    </main>
  )
}
