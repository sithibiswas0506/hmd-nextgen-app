import React from 'react'
import { Contact } from './types'

type Props = {
  show: boolean
  onClose: () => void
  contacts: Contact[]
  pickerMode: 'single' | 'multi'
  pickerSelection: Record<string, boolean>
  togglePickerChoice: (id: string) => void
  groupName: string
  setGroupName: (s: string) => void
  groupPhoto: string
  setGroupPhoto: (s: string) => void
  groupDescription: string
  setGroupDescription: (s: string) => void
  groupError: string
  pickerError?: string
  setPickerError?: (s: string) => void
  startPrivateChatFromPicker: () => void
  createGroupFromPicker: () => void
  onConfirmSelection?: (ids: string[]) => void
}

export default function PickerModal({ show, onClose, contacts, pickerMode, pickerSelection, togglePickerChoice, groupName, setGroupName, groupPhoto, setGroupPhoto, groupDescription, setGroupDescription, groupError, pickerError, setPickerError, startPrivateChatFromPicker, createGroupFromPicker }: Props) {
  const [search, setSearch] = React.useState<string>('')
  if (!show) return null
  const items = contacts.filter(c => !c.isGroup && c.name.toLowerCase().includes(search.toLowerCase()))
  return (
    <div className="picker-overlay" onClick={onClose}>
      <div className="picker-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{pickerMode === 'single' ? 'Start new chat' : 'Create group'}</h3>
        <div style={{ marginTop: 8 }}>
          <input placeholder="Search contacts..." value={search} onChange={e => setSearch(e.target.value)} style={{ width: '100%', padding: 8, marginBottom: 8 }} />
        </div>
        {pickerMode === 'multi' && (
          <div style={{ marginTop: 4 }}>
            <div style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
              <input placeholder="Group name" value={groupName} onChange={e => setGroupName(e.target.value)} style={{ flex: 1, padding: 8 }} />
              <input placeholder="Photo URL (optional)" value={groupPhoto} onChange={e => setGroupPhoto(e.target.value)} style={{ flex: 1, padding: 8 }} />
            </div>
            <textarea placeholder="Short description (optional)" value={groupDescription} onChange={e => setGroupDescription(e.target.value)} style={{ width: '100%', padding: 8, minHeight: 60 }} />
            {groupError ? <div style={{ color: '#b33', marginTop: 8 }}>{groupError}</div> : null}
          </div>
        )}

        <div className="picker-list">
          {items.map(c => (
            <label key={c.id} className="picker-item">
              <input
                type={pickerMode === 'single' ? 'radio' : 'checkbox'}
                name="picker"
                checked={!!pickerSelection[c.id]}
                onChange={() => { togglePickerChoice(c.id); if (pickerError && setPickerError) setPickerError('') }}
              />
              <img src={c.avatar} alt="a" className="avatar" style={{ width: 36, height: 36 }} />
              <div style={{ marginLeft: 8 }}>{c.name}</div>
            </label>
          ))}
          {items.length === 0 && <div style={{ padding: 12, color: '#666' }}>No contacts match your search.</div>}
        </div>
        {pickerError ? <div style={{ color: '#b33', marginTop: 8 }}>{pickerError}</div> : null}

        <div className="actions" style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={() => { onClose(); if (setPickerError) setPickerError('') }}>Cancel</button>
          {pickerMode === 'single' ? (
            onConfirmSelection ? (
              <button onClick={() => {
                const sel = Object.keys(pickerSelection).filter(k => pickerSelection[k])
                onConfirmSelection(sel)
              }}>Confirm</button>
            ) : (
              <button onClick={startPrivateChatFromPicker}>Start chat</button>
            )
          ) : (
            onConfirmSelection ? (
              <button onClick={() => {
                const sel = Object.keys(pickerSelection).filter(k => pickerSelection[k])
                onConfirmSelection(sel)
              }}>Confirm</button>
            ) : (
              <button onClick={createGroupFromPicker}>Create group</button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
