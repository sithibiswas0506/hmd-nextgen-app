// Cloudflare R2 storage helpers (demo placeholders)
// TODO: integrate for file uploads (images, attachments) in chat.
// Notes:
// - Cloudflare R2 is an S3-compatible API. For browser uploads, you typically create signed PUT URLs from a server or use a worker.
// - Keep secrets server-side: `CF_R2_SECRET_ACCESS_KEY` should never be in client JS.

// Example placeholder functions (no-op in demo)
export async function uploadFilePlaceholder(file: File): Promise<{ url?: string; error?: string }> {
  // Replace with a server endpoint that signs/uploads to R2, or use a Cloudflare Worker.
  return { error: 'R2 not configured in demo' }
}

export async function getFileUrlPlaceholder(key: string): Promise<string | null> {
  // Return a public URL for an object (if configured)
  return null
}
