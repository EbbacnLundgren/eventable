'use client'

import { useEffect, useState } from 'react'
import { StreamChat, Channel as StreamChannel, UserResponse } from 'stream-chat'

import {
  Chat,
  Channel,
  ChannelHeader,
  MessageList,
  MessageInput,
} from 'stream-chat-react'
import 'stream-chat-react/dist/css/v2/index.css'

interface EventChatProps {
  eventId: string
}

export default function EventChat({ eventId }: EventChatProps) {
  const [chatClient, setChatClient] = useState<StreamChat | null>(null)
  const [channel, setChannel] = useState<StreamChannel | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let client: StreamChat | null = null

    async function initChat() {
      setLoading(true)

      try {
        const res = await fetch('/api/stream-token')
        const data: { token: string; user: UserResponse } = await res.json()
        if (!data.token || !data.user) {
          console.error('Ingen token eller user från API')
          return
        }

        // Skapar en ny lokal instans för varje event
        client = new StreamChat(process.env.NEXT_PUBLIC_STREAM_API_KEY!)

        // Koppla användaren
        await client.connectUser(data.user, data.token)

        // Skapar kanal unik per event
        const ch: StreamChannel = client.channel(
          'messaging',
          `event-${eventId}`
        )

        await ch.watch()

        setChatClient(client)
        setChannel(ch)
      } catch (err) {
        console.error('Error initializing chat:', err)
      } finally {
        setLoading(false)
      }
    }

    initChat()

    return () => {
      client?.disconnectUser()
    }
  }, [eventId])

  if (loading) return <div>Laddar chatten...</div>
  if (!chatClient || !channel)
    return <div>Misslyckades med att initiera chatten</div>

  return (
    <div className="flex flex-col flex-1 h-[90vh] max-w-4xl mx-auto bg-white rounded-2xl shadow-md overflow-hidden">
      <Chat client={chatClient} theme="messaging light">
        <Channel channel={channel}>
          <div className="flex flex-col h-full w-full">
            <div className="flex-1 overflow-y-auto px-4">
              <ChannelHeader />
              <MessageList />
            </div>
            <div className="border-t p-2 bg-gray-50">
              <MessageInput focus />
            </div>
          </div>
        </Channel>
      </Chat>
    </div>
  )
}
