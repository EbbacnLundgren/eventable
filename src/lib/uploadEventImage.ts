import { supabase } from "@/lib/client"

export async function uploadEventImage(file: File, eventId: number) {
  const fileExt = file.name.split(".").pop()
  const fileName = `${eventId}-${Date.now()}.${fileExt}`
  const filePath = fileName

  const { error: uploadError } = await supabase.storage
    .from("event-images")
    .upload(filePath, file, { upsert: true })

  if (uploadError) {
    console.error("Upload error:", uploadError)
    throw uploadError
  }

  const { data } = supabase.storage
    .from("event-images")
    .getPublicUrl(filePath)

  return data.publicUrl
}

