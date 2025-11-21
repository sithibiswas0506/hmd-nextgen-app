import { createClient } from '@supabase/supabase-js'

// Supabase client (demo placeholder).
// If `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` are not set we export
// a safe no-op stub so the app doesn't crash in demos or GitHub Pages.

const _meta: any = import.meta
const url = _meta.env?.VITE_SUPABASE_URL
const anonKey = _meta.env?.VITE_SUPABASE_ANON_KEY

// Exported type any to keep this file simple for the demo scaffold.
export let supabase: any

if (url && anonKey) {
	supabase = createClient(String(url), String(anonKey))
} else {
	// No-op stub matching the small subset of API used by the demo Chat UI.
	const noopPromise = async (result: any) => ({ data: result, error: null })

	supabase = {
		from: (/* table: string */) => ({
			select: async () => ({ data: [], error: null }),
			insert: async () => ({ data: null, error: null }),
			order: () => ({ select: async () => ({ data: [], error: null }) }),
			limit: () => ({ select: async () => ({ data: [], error: null }) }),
		}),
		// channel / realtime placeholder (no-op)
		channel: () => ({
			on: () => ({ subscribe: async () => ({}) }),
			subscribe: async () => ({}),
			remove: () => {},
		}),
		// helper to keep other calls safe
		rpc: async () => ({ data: null, error: null }),
	}

	// eslint-disable-next-line no-console
	console.warn('Supabase not configured — using demo stub. Set VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to enable.')
}

// In demo mode the exported `supabase` will be a harmless stub that resolves
// queries with empty results instead of throwing an error about missing URL.
