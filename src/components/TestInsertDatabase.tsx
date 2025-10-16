'use client'

import { useState } from 'react'
import { supabase } from '@/lib/client'

export default function TestInsert() {
    const [message, setMessage] = useState('')

    const handleInsert = async () => {
        const { data, error } = await supabase.from('google_users').insert({
            email: 'test@example.com',
            created_at: new Date().toISOString(),
            first_name: 'Test',
            last_name: 'User',
            avatar_url: '',
            phone_nbr: ''
        })

        if (error) {
            console.error(error)
            setMessage('Error: ' + error.message)
        } else {
            console.log(data)
            setMessage('Inserted successfully!')
        }
    }

    return (
        <div className="p-4">
            <button
                onClick={handleInsert}
                className="px-4 py-2 bg-blue-500 text-white rounded"
            >
                Insert test user
            </button>
            {message && <p className="mt-2">{message}</p>}
        </div>
    )
}
