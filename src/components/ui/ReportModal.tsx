import React from 'react'

type Props = {
  open: boolean
  contactName?: string | null
  onClose: () => void
  onSubmit: (payload: { topics: string[]; note?: string }) => void
}

const TOPICS = [
  'Spam',
  'Harassment',
  'Inappropriate content',
  'Fake account',
  'Other'
]

export default function ReportModal({ open, contactName = null, onClose, onSubmit }: Props) {
  const [selected, setSelected] = React.useState<Record<string, boolean>>({})
  const [note, setNote] = React.useState<string>('')

  React.useEffect(() => {
    if (!open) {
      setSelected({})
      setNote('')
    }
  }, [open])

  if (!open) return null
  function toggle(topic: string) {
    setSelected(prev => ({ ...prev, [topic]: !prev[topic] }))
  }
  function submit() {
    const topics = Object.keys(selected).filter(k => selected[k])
    if (topics.length === 0) return
    onSubmit({ topics, note: note.trim() || undefined })
  }

  return (
    <div className="confirm-overlay" onClick={onClose}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true">
        <h3>Report {contactName ? `— ${contactName}` : 'contact'}</h3>
        <div style={{ marginTop: 8 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {TOPICS.map(t => (
              <label key={t} style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <input type="checkbox" checked={!!selected[t]} onChange={() => toggle(t)} />
                <span>{t}</span>
              </label>
            ))}
          </div>
          <textarea placeholder="Optional note" value={note} onChange={(e) => setNote(e.target.value)} style={{ width: '100%', marginTop: 12, minHeight: 80, padding: 8 }} />
        </div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-danger" onClick={submit}>Submit Report</button>
        </div>
      </div>
    </div>
  )
}
