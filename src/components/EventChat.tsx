'use client'

import { useEffect, useState } from 'react'
import { StreamChat } from 'stream-chat'
import {
    Chat,
    Channel,
    ChannelHeader,
    MessageList,
    MessageInput,
} from 'stream-chat-react'
import 'stream-chat-react/dist/css/v2/index.css'

export default function EventChat() {
    const [chatClient, setChatClient] = useState<StreamChat | null>(null)
    const [channel, setChannel] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function initChat() {
            const res = await fetch('/api/stream-token')
            const data = await res.json()
            if (!data.token) {
                console.error('Ingen token')
                return
            }

            const client = StreamChat.getInstance(
                process.env.NEXT_PUBLIC_STREAM_API_KEY!
            )

            await client.connectUser(data.user, data.token)

            // Hårdkodad testkanal
            const ch = client.channel('messaging', 'test-channel', {
                name: 'Test Chat',
            } as any)
            await ch.watch()

            setChatClient(client)
            setChannel(ch)
            setLoading(false)
        }

        initChat()

        return () => {
            chatClient?.disconnectUser()
        }
    }, [])

    if (loading) return <div>Laddar chatten...</div>
    if (!chatClient || !channel) return <div>Misslyckades med att initiera chatten</div>

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
