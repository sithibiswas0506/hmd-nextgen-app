import React, { useEffect, useRef, useState } from 'react'
import contactsData from '../data/contacts.json'
import chatsData from '../data/chats.json'
import detailsData from '../data/details.json'
import ChatDetails from './chat/ChatDetails'
import { ChatBubbleLeftEllipsisIcon, UsersIcon } from '@heroicons/react/24/solid'
import { Contact, Message } from './chat/types'
import PickerModal from './chat/PickerModal'
import ContactRow from './chat/ContactRow'
import MessagePanel from './chat/MessagePanel'
import ConfirmModal from './ui/ConfirmModal'
import ReportModal from './ui/ReportModal'

export default function Chat() {
  const [contacts, setContacts] = useState<Contact[]>(() => {
    const base: Contact[] = (contactsData as any).map((c: any, idx: number) => ({
      ...c,
      unread: idx % 5 === 0 ? 2 : 0,
      archived: false,
      blocked: false,
      lastSeenMinutes: c.status === 'online' ? 0 : (idx * 3) + 5,
      isGroup: (c.id || '').startsWith('g') || (c.status && c.status.includes('members')),
      pin: false
    }))
    try {
      if (typeof window !== 'undefined') {
        const saved = window.localStorage.getItem('hmd_contacts')
        if (saved) {
          const parsed = JSON.parse(saved)
          if (Array.isArray(parsed) && parsed.length) return parsed as Contact[]
        }
      }
    } catch (e) {
      // ignore and fall back to base
    }
    return base
  })
  const [selectedId, setSelectedId] = useState<string | null>(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = window.localStorage.getItem('selectedChatId')
        if (saved) return saved
      }
    } catch (e) {}
    // Do not auto-open the first chat on app load; show placeholder instead
    return null
  })
  const [query, setQuery] = useState('')
  const [messages, setMessages] = useState<Message[]>([])
  const [text, setText] = useState('')
  const listRef = useRef<HTMLDivElement | null>(null)
  const [tab, setTab] = useState<'media' | 'files' | 'links'>('media')
  const [showSidebar, setShowSidebar] = useState<boolean>(true)
  const [isMobileView, setIsMobileView] = useState<boolean>(() => (typeof window !== 'undefined' ? window.innerWidth <= 900 : false))
  const [activeMenuId, setActiveMenuId] = useState<string | null>(null)
  const [filters, setFilters] = useState({ unread: false, group: false, archived: false })
  const [showUserPicker, setShowUserPicker] = useState<boolean>(false)
  const [pickerMode, setPickerMode] = useState<'single' | 'multi'>('single')
  const [pickerSelection, setPickerSelection] = useState<Record<string, boolean>>({})
  const [groupName, setGroupName] = useState<string>('')
  const [groupPhoto, setGroupPhoto] = useState<string>('')
  const [groupDescription, setGroupDescription] = useState<string>('')
  const [groupError, setGroupError] = useState<string>('')
  const [pickerError, setPickerError] = useState<string>('')
  const [notice, setNotice] = useState<string>('')
  const [confirmOpen, setConfirmOpen] = useState<boolean>(false)
  const [confirmTarget, setConfirmTarget] = useState<{ id: string, action: 'delete' | 'archive' | 'block' } | null>(null)
  const [reportOpen, setReportOpen] = useState<boolean>(false)
  const [reportTargetId, setReportTargetId] = useState<string | null>(null)
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null)
  const [replyToId, setReplyToId] = useState<string | null>(null)
  const [forwardMessageId, setForwardMessageId] = useState<string | null>(null)
  const [forwardSourceId, setForwardSourceId] = useState<string | null>(null)

  // Handle hash routing to open details page: #/chat/:id
  const [isDetailsOpen, setIsDetailsOpen] = useState<boolean>(() => {
    return /^#\/chat\/.+/.test(window.location.hash)
  })

  useEffect(() => {
    function onHashChange() {
      const hash = window.location.hash
      const match = hash.match(/^#\/chat\/(.+)$/)
      if (match) {
        const id = match[1]
        setSelectedId(id)
        setIsDetailsOpen(true)
        // load messages for selected
        const cmsgs = (chatsData as any)[id] as Message[] | undefined
        setMessages(cmsgs ? cmsgs : [])
      } else {
        setIsDetailsOpen(false)
      }
    }

    window.addEventListener('hashchange', onHashChange)
    // run on mount in case hash already present
    onHashChange()
    return () => window.removeEventListener('hashchange', onHashChange)
  }, [])

  // track mobile viewport so we can change sidebar behaviour
  useEffect(() => {
    function onResize() {
      setIsMobileView(window.innerWidth <= 900)
      if (window.innerWidth > 900) setShowSidebar(true)
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  // close menus when clicking outside
  useEffect(() => {
    function onDoc(e: MouseEvent) {
      const target = e.target as HTMLElement
      if (!target.closest || !target.closest('.contact-menu')) {
        setActiveMenuId(null)
      }
    }
    document.addEventListener('click', onDoc)
    return () => document.removeEventListener('click', onDoc)
  }, [])

  // persist contacts whenever they change (so created groups are saved)
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') window.localStorage.setItem('hmd_contacts', JSON.stringify(contacts))
    } catch (e) {}
  }, [contacts])

  // load saved chats into in-memory chatsData on mount
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        const saved = window.localStorage.getItem('hmd_chats')
        if (saved) {
          const parsed = JSON.parse(saved)
          Object.keys(parsed).forEach(k => { (chatsData as any)[k] = parsed[k] })
        }
      }
    } catch (e) {}
  }, [])

  // persist selected chat across refreshes
  useEffect(() => {
    try {
      if (typeof window !== 'undefined') {
        if (selectedId) window.localStorage.setItem('selectedChatId', selectedId)
        else window.localStorage.removeItem('selectedChatId')
      }
    } catch (e) {}
  }, [selectedId])

  // Load messages when selectedId changes (so selecting a contact shows messages immediately)
  useEffect(() => {
    if (selectedId) {
      const cmsgs = (chatsData as any)[selectedId] as Message[] | undefined
      setMessages(cmsgs ? cmsgs : [])
    } else {
      setMessages([])
    }
  }, [selectedId])

  function formatTime(iso?: string) {
    if (!iso) return ''
    const d = new Date(iso)
    const now = new Date()

    const diffMs = now.getTime() - d.getTime()
    const diffSec = Math.floor(diffMs / 1000)
    const diffMin = Math.floor(diffSec / 60)
    const diffHr = Math.floor(diffMin / 60)

    // under 1 minute
    if (diffSec < 60) return 'just now'
    // under 1 hour
    if (diffMin < 60) return `${diffMin} min ago`
    // same day -> hours
    if (d.toDateString() === now.toDateString()) return `${diffHr} hr ago`

    // yesterday
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate())
    const startOfYesterday = new Date(startOfToday)
    startOfYesterday.setDate(startOfToday.getDate() - 1)
    if (d >= startOfYesterday && d < startOfToday) return 'Yesterday'

    // same week (ISO week: within last 7 days and not today/yesterday)
    const diffDays = Math.floor(diffMs / (24 * 60 * 60 * 1000))
    if (diffDays < 7) {
      // return weekday name (e.g., Monday)
      return d.toLocaleDateString(undefined, { weekday: 'long' })
    }

    // same year -> 'DD Mon' (e.g., 10 Nov)
    if (d.getFullYear() === now.getFullYear()) {
      const day = String(d.getDate()).padStart(2, '0')
      const monthShort = d.toLocaleDateString(undefined, { month: 'short' })
      return `${day} ${monthShort}`
    }

    // other years -> 'Mon YY' (e.g., Nov 23)
    const monthShort = d.toLocaleDateString(undefined, { month: 'short' })
    const yearShort = String(d.getFullYear()).slice(-2)
    return `${monthShort} ${yearShort}`
  }

  function getLastMeta(id: string) {
    const arr = (chatsData as any)[id] as Message[] | undefined
    if (arr && arr.length) {
      const last = arr[arr.length - 1]
      const time = formatTime(last.created_at)
      const sender = last.user === 'You' ? 'You' : (last.user || '')
      return { text: last.text, time, sender }
    }
    // fallback to contact's lastMessage (no time)
    const c = contacts.find(x => x.id === id)
    return { text: c?.lastMessage || '', time: '', sender: '' }
  }

  useEffect(() => {
    const el = listRef.current
    if (el) el.scrollTop = el.scrollHeight
  }, [messages])

  function sendMessage() {
    if (!text.trim()) return
    const id = selectedId
    // If editing an existing message, update it instead of creating a new one
    if (editingMessageId && id) {
      try {
        const arr = (chatsData as any)[id] as Message[] | undefined
        if (!arr) return
        const next = arr.map(m => m.id === editingMessageId ? { ...m, text, edited: true, edited_at: new Date().toISOString() } : m)
        ;(chatsData as any)[id] = next
        // persist
        try { if (typeof window !== 'undefined') {
          const savedChats = JSON.parse(window.localStorage.getItem('hmd_chats') || '{}')
          savedChats[id] = next
          window.localStorage.setItem('hmd_chats', JSON.stringify(savedChats))
        } } catch (e) {}
        setMessages(next)
        setNotice('Message edited')
        setTimeout(() => setNotice(''), 2000)
      } catch (e) {}
      setEditingMessageId(null)
      setText('')
      setReplyToId(null)
      return
    }

    // create new message (optionally a reply)
    const msg: Message = { id: String(Date.now()), user: 'You', text, created_at: new Date().toISOString(), reply_to: replyToId || null }
    setMessages((prev: Message[]) => [...prev, msg])
    setText('')
    setReplyToId(null)
    // persist to chatsData (in-memory demo). In a real app this would call the DB.
    try {
      if (id) {
        const arr = (chatsData as any)[id] as Message[] | undefined
        if (arr) arr.push(msg)
        else (chatsData as any)[id] = [msg]
        // persist chats to localStorage for demo persistence
        try {
          if (typeof window !== 'undefined') {
            const savedChats = JSON.parse(window.localStorage.getItem('hmd_chats') || '{}')
            savedChats[id] = (chatsData as any)[id]
            window.localStorage.setItem('hmd_chats', JSON.stringify(savedChats))
          }
        } catch (e) {}
        // if this chat was archived, unarchive it when a new message arrives
        setContacts(prev => prev.map(c => c.id === id ? { ...c, archived: false } : c))
      }
    } catch (e) {
      // ignore for demo
    }
  }

  // Delete (unsend) a message by id for the currently selected chat
  function deleteMessage(messageId: string) {
    const id = selectedId
    if (!id) return
    try {
      const arr = (chatsData as any)[id] as Message[] | undefined
      if (!arr) return
      const next = arr.filter(m => m.id !== messageId)
      ;(chatsData as any)[id] = next
      // persist chats to localStorage
      try {
        if (typeof window !== 'undefined') {
          const savedChats = JSON.parse(window.localStorage.getItem('hmd_chats') || '{}')
          savedChats[id] = next
          window.localStorage.setItem('hmd_chats', JSON.stringify(savedChats))
        }
      } catch (e) {}
      // update local messages state so UI refreshes
      setMessages(next)
      // unarchive chat on new message didn't apply here; we may reorder contacts
    } catch (e) {
      // ignore for demo
    }
  }

  // send message on Enter
  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === 'Enter') {
      e.preventDefault()
      sendMessage()
    }
  }

  const filtered = contacts.filter((c: Contact) => c.name.toLowerCase().includes(query.toLowerCase()))
    .filter(c => {
      if (filters.unread && !(c.unread && c.unread > 0)) return false
      if (filters.group && !c.isGroup) return false
      if (filters.archived && !c.archived) return false
      if (!filters.archived && c.archived) return false
      return true
    }).sort((a, b) => {
      // pins first
      if (a.pin && !b.pin) return -1
      if (!a.pin && b.pin) return 1

      // then by most recent message time (descending)
      function lastTimestamp(c: Contact) {
        try {
          const arr = (chatsData as any)[c.id] as Message[] | undefined
          if (arr && arr.length) {
            const last = arr[arr.length - 1]
            return last && last.created_at ? new Date(last.created_at).getTime() : 0
          }
        } catch (e) {}
        // fallback to lastSeenMinutes (smaller means more recent)
        if (typeof c.lastSeenMinutes === 'number') return Date.now() - (c.lastSeenMinutes * 60 * 1000)
        return 0
      }
      const ta = lastTimestamp(a)
      const tb = lastTimestamp(b)
      return tb - ta
    })
  const selected = contacts.find((c: Contact) => c.id === selectedId) || null

  function createChat() {
    // open single-user picker to start a private chat
    setPickerMode('single')
    // reset selection
    const map: Record<string, boolean> = {}
    contacts.forEach(c => { if (!c.isGroup) map[c.id] = false })
    setPickerSelection(map)
    setPickerError('')
    setShowUserPicker(true)
  }

  function createGroup() {
    // open multi-user picker to create a group
    setPickerMode('multi')
    const map: Record<string, boolean> = {}
    contacts.forEach(c => { if (!c.isGroup) map[c.id] = false })
    setPickerSelection(map)
    setGroupName('')
    setGroupPhoto('')
    setGroupDescription('')
    setGroupError('')
    setPickerError('')
    setShowUserPicker(true)
  }

  function togglePickerChoice(id: string) {
    setPickerSelection(prev => ({ ...prev, [id]: !prev[id] }))
  }

  function startPrivateChatFromPicker() {
    const selected = Object.keys(pickerSelection).find(k => pickerSelection[k])
    if (!selected) { setPickerError('Please select a user to start chat'); return }
    // open existing contact or create quick chat entry
    setSelectedId(selected)
    setShowUserPicker(false)
    if (isMobileView) setShowSidebar(false)
  }

  async function createGroupFromPicker() {
    const members = Object.keys(pickerSelection).filter(k => pickerSelection[k])
    if (!members.length) { setGroupError('Please select at least one member'); return }
    if (!groupName.trim()) { setGroupError('Please enter a group name'); return }
    setGroupError('')
    const id = `g${Date.now()}`
    const newC: Contact = {
      id,
      name: groupName.trim(),
      status: `${members.length + 1} members`,
      lastMessage: groupDescription || '',
      avatar: groupPhoto || `https://images.unsplash.com/photo-1522071820081-009f0129c71c?w=100&h=100&crop=faces&fit=crop`,
      unread: 0,
      pin: false,
      archived: false,
      blocked: false,
      lastSeenMinutes: 0,
      isGroup: true
    }
    setContacts(prev => {
      const next = [newC, ...prev]
      try { if (typeof window !== 'undefined') window.localStorage.setItem('hmd_contacts', JSON.stringify(next)) } catch (e) {}
      return next
    })
    // initialize empty messages for the new group in local storage store for chats
    try {
      if (typeof window !== 'undefined') {
        const savedChats = JSON.parse(window.localStorage.getItem('hmd_chats') || '{}')
        savedChats[id] = []
        window.localStorage.setItem('hmd_chats', JSON.stringify(savedChats))
      }
    } catch (e) {}
    setSelectedId(id)
    setShowUserPicker(false)
    // reset group form
    setGroupName('')
    setGroupPhoto('')
    setGroupDescription('')
    setGroupError('')
    if (isMobileView) setShowSidebar(false)
  }

  function handleDelete(id: string) {
    // kept for backward-compat if called directly; prefer promptDelete
    setContacts(prev => prev.filter(c => c.id !== id))
    if (selectedId === id) setSelectedId(null)
  }

  function promptDelete(id: string) {
    setConfirmTarget({ id, action: 'delete' })
    setConfirmOpen(true)
  }

  function promptBlock(id: string) {
    setConfirmTarget({ id, action: 'block' })
    setConfirmOpen(true)
  }

  function executeConfirm() {
    if (!confirmTarget) return
    const { id, action } = confirmTarget
    if (action === 'delete') {
      setContacts(prev => prev.filter(c => c.id !== id))
      if (selectedId === id) setSelectedId(null)
    } else if (action === 'archive') {
      setContacts(prev => prev.map(c => c.id === id ? { ...c, archived: true } : c))
      if (selectedId === id) setSelectedId(null)
    } else if (action === 'block') {
      setContacts(prev => prev.map(c => c.id === id ? { ...c, blocked: true, name: `${c.name} (Blocked)` } : c))
      if (selectedId === id) setSelectedId(null)
    }
    setConfirmOpen(false)
    setConfirmTarget(null)
  }

  function cancelConfirm() {
    setConfirmOpen(false)
    setConfirmTarget(null)
  }

  function handleArchive(id: string) {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, archived: true } : c))
    if (selectedId === id) setSelectedId(null)
  }

  function handleUnarchive(id: string) {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, archived: false } : c))
  }

  function handleReport(id: string) {
    setNotice('Reported contact — thank you.')
    setTimeout(() => setNotice(''), 3000)
  }

  function handleToggleRead(id: string) {
    setContacts(prev => prev.map(c => {
      if (c.id !== id) return c
      if (c.unread && c.unread > 0) {
        // mark read
        setNotice('Notifications cleared')
        setTimeout(() => setNotice(''), 2000)
        return { ...c, unread: 0 }
      }
      // mark unread (set to 1)
      setNotice('1 unread')
      setTimeout(() => setNotice(''), 2000)
      return { ...c, unread: 1 }
    }))
  }

  function promptReport(id: string) {
    setReportTargetId(id)
    setReportOpen(true)
  }

  function executeReport(payload: { topics: string[]; note?: string }) {
    const id = reportTargetId
    if (!id) return
    try {
      const existing = JSON.parse(window.localStorage.getItem('hmd_reports') || '[]')
      const item = { id: `r${Date.now()}`, contactId: id, topics: payload.topics, note: payload.note || '', reporter: 'You', created_at: new Date().toISOString() }
      existing.push(item)
      window.localStorage.setItem('hmd_reports', JSON.stringify(existing))
      setNotice('Report submitted — thank you.')
      setTimeout(() => setNotice(''), 3000)
    } catch (e) {
      // ignore
    }
    setReportOpen(false)
    setReportTargetId(null)
  }

  function toggleFilter(key: keyof typeof filters) {
    setFilters(prev => {
      // single-select: clicking an active filter turns it off; otherwise activate only this one
      const isActive = prev[key]
      return { unread: false, group: false, archived: false, ...(isActive ? {} : { [key]: true }) }
    })
  }

  function handlePin(id: string) {
    setContacts(prev => prev.map(c => c.id === id ? { ...c, pin: !c.pin } : c))
  }

  // Start editing an existing message: prefill the input and set editing id
  function startEdit(messageId: string) {
    if (!selectedId) return
    try {
      const arr = (chatsData as any)[selectedId] as Message[] | undefined
      const msg = arr ? arr.find((m: Message) => m.id === messageId) : null
      if (!msg) return
      setEditingMessageId(messageId)
      setText(msg.text)
      setNotice('Editing message')
      setTimeout(() => setNotice(''), 1800)
    } catch (e) {}
  }

  // Start replying to a message: prefill input and set replyToId
  function startReply(messageId: string) {
    if (!selectedId) return
    try {
      const arr = (chatsData as any)[selectedId] as Message[] | undefined
      const msg = arr ? arr.find((m: Message) => m.id === messageId) : null
      if (!msg) return
      setReplyToId(messageId)
      setText(`@${msg.user} ${msg.text}`)
      setNotice('Replying')
      setTimeout(() => setNotice(''), 1400)
    } catch (e) {}
  }

  // Start forwarding a message: open the picker in multi-select mode
  function startForwardMessage(messageId: string) {
    if (!selectedId) return
    setForwardMessageId(messageId)
    setForwardSourceId(selectedId)
    setPickerMode('multi')
    const map: Record<string, boolean> = {}
    contacts.forEach(c => { if (!c.isGroup) map[c.id] = false })
    setPickerSelection(map)
    setPickerError('')
    setShowUserPicker(true)
  }

  // Confirm forward to selected contact ids
  function confirmForward(selectedIds: string[]) {
    if (!forwardMessageId || !forwardSourceId) {
      setShowUserPicker(false)
      setForwardMessageId(null)
      setForwardSourceId(null)
      return
    }
    try {
      const srcArr = (chatsData as any)[forwardSourceId] as Message[] | undefined
      const orig = srcArr ? srcArr.find((m: Message) => m.id === forwardMessageId) : null
      if (!orig) throw new Error('Original message not found')
      selectedIds.forEach(tid => {
        const fmsg: Message = { id: String(Date.now()) + Math.floor(Math.random() * 1000), user: 'You', text: `Fwd: ${orig.user}: ${orig.text}`, created_at: new Date().toISOString() }
        const arr = (chatsData as any)[tid] as Message[] | undefined
        if (arr) arr.push(fmsg)
        else (chatsData as any)[tid] = [fmsg]
        try { if (typeof window !== 'undefined') {
          const savedChats = JSON.parse(window.localStorage.getItem('hmd_chats') || '{}')
          savedChats[tid] = (chatsData as any)[tid]
          window.localStorage.setItem('hmd_chats', JSON.stringify(savedChats))
        } } catch (e) {}
        // unarchive target if needed
        setContacts(prev => prev.map(c => c.id === tid ? { ...c, archived: false } : c))
      })
      setNotice('Message forwarded')
      setTimeout(() => setNotice(''), 2200)
    } catch (e) {
      setNotice('Unable to forward message')
      setTimeout(() => setNotice(''), 2000)
    }
    setShowUserPicker(false)
    setForwardMessageId(null)
    setForwardSourceId(null)
  }

  function cancelEdit() {
    setEditingMessageId(null)
    setText('')
    setNotice('')
  }

  function cancelReply() {
    setReplyToId(null)
    setText('')
    setNotice('')
  }

  // Toggle pinned flag on a message
  function togglePinMessage(messageId: string) {
    const id = selectedId
    if (!id) return
    try {
      const arr = (chatsData as any)[id] as Message[] | undefined
      if (!arr) return
      const next = arr.map((m: Message) => m.id === messageId ? { ...m, pinned: !m.pinned } : m)
      ;(chatsData as any)[id] = next
      try { if (typeof window !== 'undefined') {
        const savedChats = JSON.parse(window.localStorage.getItem('hmd_chats') || '{}')
        savedChats[id] = next
        window.localStorage.setItem('hmd_chats', JSON.stringify(savedChats))
      } } catch (e) {}
      setMessages(next)
      setNotice('Message pin updated')
      setTimeout(() => setNotice(''), 1400)
    } catch (e) {}
  }

  // Report a specific message (opens report modal for the contact)
  function startReportMessage(messageId: string) {
    if (!selectedId) return
    setReportTargetId(selectedId)
    setReportOpen(true)
    setNotice('Reporting message — please provide details')
    setTimeout(() => setNotice(''), 2000)
  }

  // If details view is open via hash, render the separate ChatDetails component
  if (isDetailsOpen && selectedId) {
    const selected = contacts.find((c: Contact) => c.id === selectedId) || null
    const details = (detailsData as any)[selectedId] || { media: [], files: [], links: [] }
    return (
      <ChatDetails
        selected={selected}
        details={details}
        onBack={() => { window.location.hash = ''; setIsDetailsOpen(false) }}
      />
    )
  }

  return (
    <div className="layout">
      {notice ? <div className="notice" style={{ position: 'fixed', top: 12, right: 12, background: '#222', color: '#fff', padding: '8px 12px', borderRadius: 6, zIndex: 60 }}>{notice}</div> : null}
      {isMobileView && showSidebar && <div className="overlay" onClick={() => setShowSidebar(false)} />}
      <aside className={`sidebar ${showSidebar ? 'visible' : 'hidden'}`}>
        <div className="top">
          <div className="search">
            <input placeholder="Search contacts..." value={query} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setQuery(e.target.value)} />
          </div>
          <div className="actions">
            <button title="New chat" onClick={createChat} aria-label="New chat"><ChatBubbleLeftEllipsisIcon style={{ width: 18, height: 18 }} /></button>
            <button title="New group" onClick={createGroup} aria-label="New group"><UsersIcon style={{ width: 18, height: 18 }} /></button>
          </div>
        </div>

        <div className="filters-row">
          <button className={`filter ${!filters.unread && !filters.group && !filters.archived ? 'active' : ''}`} onClick={() => setFilters({ unread: false, group: false, archived: false })}>All</button>
          <button className={`filter ${filters.unread ? 'active' : ''}`} onClick={() => toggleFilter('unread')}>Unread</button>
          <button className={`filter ${filters.group ? 'active' : ''}`} onClick={() => toggleFilter('group')}>Group chat</button>
          <button className={`filter ${filters.archived ? 'active' : ''}`} onClick={() => toggleFilter('archived')}>Archive chats</button>
        </div>

        <PickerModal
          show={showUserPicker}
          onClose={() => { setShowUserPicker(false); setPickerError(''); setGroupError('') }}
          contacts={contacts}
          pickerMode={pickerMode}
          pickerSelection={pickerSelection}
          togglePickerChoice={togglePickerChoice}
          groupName={groupName}
          setGroupName={setGroupName}
          groupPhoto={groupPhoto}
          setGroupPhoto={setGroupPhoto}
          groupDescription={groupDescription}
          setGroupDescription={setGroupDescription}
          groupError={groupError}
          pickerError={pickerError}
          setPickerError={setPickerError}
          startPrivateChatFromPicker={startPrivateChatFromPicker}
          createGroupFromPicker={createGroupFromPicker}
        />

        <div className="contacts">
          {filtered.map(c => {
            const meta = getLastMeta(c.id)
            return (
              <ContactRow
                key={c.id}
                c={c}
                meta={meta}
                isMobileView={isMobileView}
                activeMenuId={activeMenuId}
                setActiveMenuId={setActiveMenuId}
                onSelect={(id) => {
                  const target = contacts.find(x => x.id === id)
                  if (target?.blocked) {
                    setNotice('This contact is blocked. Unblock to open chat.')
                    setTimeout(() => setNotice(''), 2500)
                    return
                  }
                  // open the chat and mark notifications for this chat as read
                  setSelectedId(id)
                  setContacts((prev: Contact[]) => prev.map(c => c.id === id ? { ...c, unread: 0 } : c))
                  if (isMobileView) setShowSidebar(false)
                }}
                onDelete={promptDelete}
                onArchive={handleArchive}
                onBlock={promptBlock}
                onReport={promptReport}
                onUnarchive={handleUnarchive}
                onToggleRead={handleToggleRead}
                onTogglePin={handlePin}
              />
            )
          })}
        </div>
      </aside>

      <ConfirmModal
        open={confirmOpen}
        title={confirmTarget?.action === 'delete' ? 'Delete chat' : (confirmTarget?.action === 'archive' ? 'Archive chat' : 'Confirm')}
        message={confirmTarget?.action === 'delete' ? 'Are you sure you want to delete this chat? This cannot be undone.' : (confirmTarget?.action === 'archive' ? 'Move this chat to archive?' : 'Confirm action?')}
        confirmLabel={confirmTarget?.action === 'delete' ? 'Delete' : 'Confirm'}
        cancelLabel="Cancel"
        onConfirm={executeConfirm}
        onCancel={cancelConfirm}
      />

      <ReportModal
        open={reportOpen}
        contactName={contacts.find(c => c.id === reportTargetId)?.name || null}
        onClose={() => { setReportOpen(false); setReportTargetId(null) }}
        onSubmit={executeReport}
      />

      <MessagePanel
          onConfirmSelection={confirmForward}
        messages={messages}
        text={text}
        setText={setText}
        onSend={sendMessage}
        onKeyDown={onKeyDown}
        isMobileView={isMobileView}
        onToggleSidebar={() => setShowSidebar(prev => !prev)}
        selectedId={selectedId}
        messagesRef={listRef}
        onBack={() => { setSelectedId(null); if (isMobileView) setShowSidebar(true) }}
        lastActive={selected ? (selected.lastSeenMinutes === 0 ? 'online' : formatTime(new Date(Date.now() - ((selected.lastSeenMinutes || 0) * 60 * 1000)).toISOString())) : null}
        formatTime={formatTime}
        onDeleteMessage={(id) => deleteMessage(id)}
        onEditMessage={(id) => startEdit(id)}
        onReplyMessage={(id) => startReply(id)}
        onPinMessage={(id) => togglePinMessage(id)}
        onReportMessage={(id) => startReportMessage(id)}
      />
    </div>
  )
}
