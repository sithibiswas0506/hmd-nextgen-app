import React from 'react'
import { Message } from './types'
import { EllipsisVerticalIcon, ClipboardDocumentIcon, TrashIcon, InformationCircleIcon } from '@heroicons/react/24/solid'

type Props = {
  m: Message
  isSelf: boolean
  showTimestamp: boolean
  onToggleTimestamp: (id: string) => void
  onCopy: (m: Message) => void
  onDelete: (m: Message) => void
  onInfo: (m: Message) => void
  onEdit: (m: Message) => void
  onReply: (m: Message) => void
  onPin: (m: Message) => void
  onReport: (m: Message) => void
  onForward: (m: Message) => void
  formatTime: (iso?: string) => string
}

export default function MessageBubble({ m, isSelf, showTimestamp, onToggleTimestamp, onCopy, onDelete, onInfo, formatTime }: Props) {
  const [menuOpen, setMenuOpen] = React.useState(false)

  return (
    <div className={`message ${isSelf ? 'self' : 'other'}`} onClick={() => onToggleTimestamp(m.id)}>
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 12, color: '#444', marginBottom: 6 }}>{m.user}</div>
          <div>{m.text}</div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <button className="dots" onClick={(e) => { e.stopPropagation(); setMenuOpen(prev => !prev) }} aria-label="message options"><EllipsisVerticalIcon style={{ width: 18, height: 18 }} /></button>
          {menuOpen && (
            <div className="menu" style={{ position: 'absolute', background: 'transparent', marginTop: 6 }}>
              <button onClick={(e) => { e.stopPropagation(); onReply(m); setMenuOpen(false) }}>Reply</button>
              {isSelf && <button onClick={(e) => { e.stopPropagation(); onEdit(m); setMenuOpen(false) }}>Edit</button>}
              <button onClick={(e) => { e.stopPropagation(); onForward(m); setMenuOpen(false) }}>Forward</button>
              <button onClick={(e) => { e.stopPropagation(); onCopy(m); setMenuOpen(false) }}><ClipboardDocumentIcon style={{ width: 16, height: 16 }} /> Copy</button>
              <button onClick={(e) => { e.stopPropagation(); onPin(m); setMenuOpen(false) }}>{m.pinned ? 'Unpin' : 'Pin'}</button>
              <button onClick={(e) => { e.stopPropagation(); onInfo(m); setMenuOpen(false) }}><InformationCircleIcon style={{ width: 16, height: 16 }} /> Info</button>
              <button onClick={(e) => { e.stopPropagation(); onReport(m); setMenuOpen(false) }}>Report</button>
              <button className="delete" onClick={(e) => { e.stopPropagation(); onDelete(m); setMenuOpen(false) }}><TrashIcon style={{ width: 16, height: 16 }} /> Delete</button>
            </div>
          )}
        </div>
      </div>
      {showTimestamp ? <div style={{ fontSize: 11, color: '#888', marginTop: 6 }}>{m.created_at ? formatTime(m.created_at) : ''}</div> : null}
    </div>
  )
}
