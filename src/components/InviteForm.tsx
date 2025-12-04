'use client'

import React, { useState } from 'react'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export default function InviteForm({ eventUrl }: { eventUrl: string }) {
    const [email, setEmail] = useState('')
    const [status, setStatus] = useState<null | string>(null)

    async function sendInvite(e: React.FormEvent) {
        e.preventDefault()
        setStatus('Skickar...')

        try {
            const { error } = await supabase.functions.invoke('send-invite', {
                method: 'POST',
                body: { email, eventUrl, from: 'Eventable <noreply@eventable.se>' },
            })

            if (error) {
                setStatus('Fel vid skickning: ' + error.message)
                return
            }

            setStatus('Skickat!')
            setEmail('')
        } catch (err) {
            console.error(err)
            setStatus('Fel vid skickning')
        }
    }

    return (
        <form onSubmit={sendInvite}>
            <label>
                Kompis email
                <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                />
            </label>
            <button type="submit">Skicka inbjudan</button>
            {status && <div>{status}</div>}
        </form>
    )
}