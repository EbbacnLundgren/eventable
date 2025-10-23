export interface Event {
  id: number
  name: string
  location: string
  date: string
  time?: number
  description?: string
  participants?: string[]
  image?: string
  // optional owner id (supabase uuid) and a resolved host label (first/last or email)
  user_id?: string
  hostLabel?: string | null
}
