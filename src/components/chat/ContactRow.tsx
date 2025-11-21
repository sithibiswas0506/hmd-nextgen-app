import React from 'react'
import { Contact, Message } from './types'
import { createPortal } from 'react-dom'
import { EllipsisVerticalIcon, MapPinIcon, ArchiveBoxIcon, FlagIcon, TrashIcon, NoSymbolIcon } from '@heroicons/react/24/solid'

type Props = {
  c: Contact
  meta: { text: string, time: string, sender: string }
  isMobileView: boolean
  activeMenuId: string | null
  setActiveMenuId: (id: string | null) => void
  onSelect: (id: string) => void
  onDelete: (id: string) => void
  onArchive: (id: string) => void
  onBlock: (id: string) => void
  onReport: (id: string) => void
  onUnarchive: (id: string) => void
  onToggleRead: (id: string) => void
  onTogglePin: (id: string) => void
}

const ContactRow = ({ c, meta, isMobileView, activeMenuId, setActiveMenuId, onSelect, onDelete, onArchive, onBlock, onReport, onUnarchive, onToggleRead, onTogglePin }: Props) => {
  const preview = c.isGroup && meta.sender ? `${meta.sender}: ${meta.text}` : meta.text
  const btnRef = React.useRef<HTMLButtonElement | null>(null)
  const [menuPos, setMenuPos] = React.useState<{ top: number; left: number; placeAbove?: boolean } | null>(null)

  function toggleMenu(e: React.MouseEvent) {
    e.stopPropagation()
    const open = activeMenuId !== c.id
    if (!open) {
      setActiveMenuId(null)
      setMenuPos(null)
      return
    }
    // compute position for fixed popup to avoid clipping
    const btn = btnRef.current
    if (btn) {
      const rect = btn.getBoundingClientRect()
      const MENU_W = 220
      const MENU_H = 240
      let left = Math.min(rect.left, window.innerWidth - MENU_W - 8)
      left = Math.max(8, left)
      let top = rect.bottom + 8
      let placeAbove = false
      if (top + MENU_H > window.innerHeight) {
        top = rect.top - MENU_H - 8
        placeAbove = true
      }
      setMenuPos({ top, left, placeAbove })
      setActiveMenuId(c.id)
    } else {
      setActiveMenuId(c.id)
    }
  }

  return (
    <div key={c.id} className={`contact ${c.pin ? 'pinned' : ''}`} onClick={() => { onSelect(c.id); if (isMobileView) {/* sidebar hide handled by parent */} }}>
      <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
        <div className="avatar-wrap">
          <img src={c.avatar} alt="avatar" className="avatar" />
        </div>
        <div className="meta">
          <div className={`name ${c.unread && c.unread > 0 ? 'unread' : ''}`}>
            {c.name}
            {c.pin ? <MapPinIcon className="pin-indicator icon-svg" title="Pinned" /> : null}
            {c.blocked ? <span style={{ color: '#b33', fontSize: 12, marginLeft: 6 }}>(blocked)</span> : null}
          </div>
          <div className="sub"><span className="preview">{preview}</span><span className="time">{meta.time}</span></div>
        </div>
      </div>
      <div className="contact-right">
        {c.unread ? <div className="badge">{c.unread}</div> : null}
        <div className="contact-menu">
          <button ref={btnRef} className="dots" onClick={toggleMenu} aria-label="more">
            <EllipsisVerticalIcon className="dots-icon icon-svg" />
          </button>
          {activeMenuId === c.id && (
            menuPos ? createPortal(
              <div className="menu-fixed" style={{ position: 'fixed', top: menuPos.top, left: menuPos.left, zIndex: 220 }}>
                <div className="menu" style={{ width: 220 }}>
                  <button onClick={(e) => { e.stopPropagation(); onTogglePin(c.id); setActiveMenuId(null); setMenuPos(null) }}>
                    <MapPinIcon className="menu-icon icon-svg" />
                    {c.pin ? 'Unpin' : 'Pin'}
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onToggleRead(c.id); setActiveMenuId(null); setMenuPos(null) }}>
                    <ArchiveBoxIcon className="menu-icon icon-svg" />
                    {c.unread && c.unread > 0 ? 'Mark as read' : 'Mark as unread'}
                  </button>
                  {!c.archived ? (
                    <button onClick={(e) => { e.stopPropagation(); onArchive(c.id); setActiveMenuId(null); setMenuPos(null) }}>
                      <ArchiveBoxIcon className="menu-icon icon-svg" />
                      Archive
                    </button>
                  ) : (
                    <button onClick={(e) => { e.stopPropagation(); onUnarchive(c.id); setActiveMenuId(null); setMenuPos(null) }}>
                      <ArchiveBoxIcon className="menu-icon icon-svg" />
                      Unarchive
                    </button>
                  )}
                  <button onClick={(e) => { e.stopPropagation(); onBlock(c.id); setActiveMenuId(null); setMenuPos(null) }}>
                    <NoSymbolIcon className="menu-icon icon-svg" />
                    Block
                  </button>
                  <button onClick={(e) => { e.stopPropagation(); onReport(c.id); setActiveMenuId(null); setMenuPos(null) }}>
                    <FlagIcon className="menu-icon icon-svg" />
                    Report
                  </button>
                  <div className="menu-separator" />
                  <button className="delete" onClick={(e) => { e.stopPropagation(); onDelete(c.id); setActiveMenuId(null); setMenuPos(null) }}>
                    <TrashIcon className="menu-icon icon-svg" />
                    Delete
                  </button>
                </div>
              </div>, document.body
            ) : (
              <div className="menu">
                <button onClick={(e) => { e.stopPropagation(); onTogglePin(c.id); setActiveMenuId(null) }}>
                  <MapPinIcon className="menu-icon icon-svg" />
                  {c.pin ? 'Unpin' : 'Pin'}
                </button>
                <button onClick={(e) => { e.stopPropagation(); onToggleRead(c.id); setActiveMenuId(null) }}>
                  <ArchiveBoxIcon className="menu-icon icon-svg" />
                  {c.unread && c.unread > 0 ? 'Mark as read' : 'Mark as unread'}
                </button>
                {!c.archived ? (
                  <button onClick={(e) => { e.stopPropagation(); onArchive(c.id); setActiveMenuId(null) }}>
                    <ArchiveBoxIcon className="menu-icon icon-svg" />
                    Archive
                  </button>
                ) : (
                  <button onClick={(e) => { e.stopPropagation(); onUnarchive(c.id); setActiveMenuId(null) }}>
                    <ArchiveBoxIcon className="menu-icon icon-svg" />
                    Unarchive
                  </button>
                )}
                <button onClick={(e) => { e.stopPropagation(); onBlock(c.id); setActiveMenuId(null) }}>
                  <NoSymbolIcon className="menu-icon icon-svg" />
                  Block
                </button>
                <button onClick={(e) => { e.stopPropagation(); onReport(c.id); setActiveMenuId(null) }}>
                  <FlagIcon className="menu-icon icon-svg" />
                  Report
                </button>
                <div className="menu-separator" />
                <button className="delete" onClick={(e) => { e.stopPropagation(); onDelete(c.id); setActiveMenuId(null) }}>
                  <TrashIcon className="menu-icon icon-svg" />
                  Delete
                </button>
              </div>
            )
          )}
        </div>
      </div>
    </div>
  )
}

export default ContactRow
