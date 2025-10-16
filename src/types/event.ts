export interface Event {
  id: number
  name: string
  location: string
  date: string
  time?: number
  description?: string
  participants?: string[]
  image?: string
}
