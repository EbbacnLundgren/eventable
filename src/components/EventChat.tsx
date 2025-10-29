// 'use client'

// import { useEffect, useState } from 'react'
// import { StreamChat, UserResponse } from 'stream-chat'
// import {
//   Chat,
//   Channel,
//   ChannelHeader,
//   MessageList,
//   MessageInput,
// } from 'stream-chat-react'

// interface EventChatProps {
//   eventId: string
//   supabaseUserId: string
//   eventMemberIds: string[]
//   eventName: string
// }

// export default function EventChat({
//   eventId,
//   supabaseUserId,
//   eventMemberIds,
//   eventName,
// }: EventChatProps) {
//   const [client, setClient] = useState<StreamChat | null>(null)
//   const [channel, setChannel] = useState<any>(null)

//   useEffect(() => {
//     async function initChat() {
//       // Hämta token från API
//       const res = await fetch('/api/stream-token', {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify({ supabaseUserId }),
//       })

//       const data = await res.json()

//       console.log('Stream user:', data.user)
//       console.log('Stream token:', data.token)

//       if (!data.user || !data.token) return

//       const chatClient = StreamChat.getInstance(
//         process.env.NEXT_PUBLIC_STREAM_API_KEY!
//       )

//       // data.user kan bara ha id och andra extra fält
//       await chatClient.connectUser({ id: data.user.id }, data.token)

//       const eventChannel = chatClient.channel('messaging', `event-${eventId}`, {
//         members: eventMemberIds,
//         // Lägg event name i extraData, inte direkt som name
//         eventName,
//       } as unknown as any)

//       try {
//         await eventChannel.create()
//       } catch {
//         console.log('Channel already exists')
//       }

//       const membersToAdd = eventMemberIds.filter((id) => id !== supabaseUserId)
//       if (membersToAdd.length > 0) {
//         await eventChannel.addMembers(membersToAdd)
//       }

//       await eventChannel.watch()

//       setClient(chatClient)
//       setChannel(eventChannel)
//     }

//     initChat()

//     return () => {
//       client?.disconnectUser()
//     }
//   }, [eventId, supabaseUserId, eventMemberIds, eventName])

//   if (!client || !channel) return <div>Laddar chat för {eventName}...</div>

//   return (
//     <Chat client={client} theme="messaging light">
//       <Channel channel={channel}>
//         <ChannelHeader />
//         <MessageList />
//         <MessageInput />
//       </Channel>
//     </Chat>
//   )
// }
