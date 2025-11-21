export type Message = {
  id: string
  user: string
  text: string
  created_at?: string
  edited?: boolean
  edited_at?: string
  pinned?: boolean
  reply_to?: string | null
}

export type Contact = {
  id: string
  name: string
  status: string
  lastMessage: string
  avatar: string
  unread?: number
  archived?: boolean
  blocked?: boolean
  lastSeenMinutes?: number
  isGroup?: boolean
  pin?: boolean
}
