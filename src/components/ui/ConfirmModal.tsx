import React from 'react'

type Props = {
  open: boolean
  title?: string
  message?: string
  confirmLabel?: string
  cancelLabel?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmModal({ open, title = 'Confirm', message = 'Are you sure?', confirmLabel = 'Yes, delete', cancelLabel = 'Cancel', onConfirm, onCancel }: Props) {
  if (!open) return null
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="confirm-title">
        <h3 id="confirm-title">{title}</h3>
        <div className="confirm-body">{message}</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end', marginTop: 12 }}>
          <button onClick={onCancel} className="btn btn-secondary">{cancelLabel}</button>
          <button onClick={onConfirm} className="btn btn-danger">{confirmLabel}</button>
        </div>
      </div>
    </div>
  )
}
