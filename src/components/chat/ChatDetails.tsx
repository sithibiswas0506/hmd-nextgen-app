import React, { useState } from 'react'
import { Contact } from './types'

type Details = {
  media: Array<any>
  files: Array<any>
  links: Array<any>
}

type Props = {
  selected: Contact | null
  details: Details
  onBack: () => void
}

export default function ChatDetails({ selected, details, onBack }: Props) {
  const [tab, setTab] = useState<'media' | 'files' | 'links'>('media')
  return (
    <div className="details-page">
      <div className="details-header">
        <button className="back" onClick={onBack}>Back</button>
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          {selected && <img src={selected.avatar} style={{ width: 48, height: 48, borderRadius: 8, objectFit: 'cover' }} />}
          <div>
            <strong>{selected?.name ?? 'Contact'}</strong>
            <div style={{ fontSize: 12, color: '#666' }}>{selected?.status}</div>
          </div>
        </div>
      </div>

      <div className="details-content">
        <div className="tabs" style={{ marginTop: 12 }}>
          <div className={`tab ${tab === 'media' ? 'active' : ''}`} onClick={() => setTab('media')}>Photos & Videos</div>
          <div className={`tab ${tab === 'files' ? 'active' : ''}`} onClick={() => setTab('files')}>Files</div>
          <div className={`tab ${tab === 'links' ? 'active' : ''}`} onClick={() => setTab('links')}>Links</div>
        </div>

        {tab === 'media' && (
          <div className="gallery">
            {details.media.length ? details.media.map((m: any) => (
              <img key={m.id} src={m.url} alt={m.caption || ''} />
            )) : <div style={{ color: '#666' }}>No photos or videos</div>}
          </div>
        )}

        {tab === 'files' && (
          <div className="file-list">
            {details.files.length ? details.files.map((f: any) => (
              <div key={f.id} className="file-item"><span className="file-icon">📄</span> <a href={f.url}>{f.name}</a> <span style={{ marginLeft: 8, color: '#666' }}>{f.size}</span></div>
            )) : <div style={{ color: '#666' }}>No files</div>}
          </div>
        )}

        {tab === 'links' && (
          <div className="links-list">
            {details.links.length ? details.links.map((l: any) => (
              <a key={l.id} href={l.url} target="_blank" rel="noreferrer">{l.title || l.url}</a>
            )) : <div style={{ color: '#666' }}>No links</div>}
          </div>
        )}
      </div>
    </div>
  )
}
