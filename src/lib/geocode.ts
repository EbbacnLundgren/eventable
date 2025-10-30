import { NominatimClient } from '@navega/nominatim-client'

const client = new NominatimClient({
  userAgent: 'EventableApp',
  referrer: 'https://eventableproject.vercel.app',
})

export async function geocodeAddress(address: string) {
  if (!address) return null
  try {
    const results = await client.search(address)
    if (results.length > 0) {
      const { lat, lon, display_name } = results[0]
      return { lat: parseFloat(lat), lon: parseFloat(lon), display_name }
    }
  } catch (e) {
    console.error('Geocoding failed:', e)
  }
  return null
}
