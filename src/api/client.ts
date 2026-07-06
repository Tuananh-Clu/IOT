const baseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const isApiConfigured = Boolean(baseUrl && anonKey)

function headers(extra?: HeadersInit): HeadersInit {
  return {
    apikey: anonKey!,
    Authorization: `Bearer ${anonKey}`,
    'Content-Type': 'application/json',
    ...extra,
  }
}

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${baseUrl}/rest/v1/${path}`, { headers: headers() })
  if (!response.ok) {
    throw new Error(`Request failed (${response.status}): ${path}`)
  }
  return response.json() as Promise<T>
}

export async function apiPatch(path: string, body: Record<string, unknown>): Promise<void> {
  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    method: 'PATCH',
    headers: headers({ Prefer: 'return=minimal' }),
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(`Update failed (${response.status}): ${path}`)
  }
}

export async function apiPost(path: string, body: Record<string, unknown>): Promise<void> {
  const response = await fetch(`${baseUrl}/rest/v1/${path}`, {
    method: 'POST',
    headers: headers({ Prefer: 'return=minimal' }),
    body: JSON.stringify(body),
  })
  if (!response.ok) {
    throw new Error(`Create failed (${response.status}): ${path}`)
  }
}
