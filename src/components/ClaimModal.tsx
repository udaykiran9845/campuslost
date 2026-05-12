'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { X, Send } from 'lucide-react'

interface Props {
  itemId: string
  itemTitle: string
  onClose: () => void
}

export default function ClaimModal({ itemId, itemTitle, onClose }: Props) {
  const [message, setMessage] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    setError('')

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      setError('You must be signed in to claim an item.')
      setLoading(false)
      return
    }

    const { error: claimError } = await supabase.from('claims').insert({
      item_id: itemId,
      claimant_id: user.id,
      message: message.trim() || null,
    })

    if (claimError) {
      if (claimError.code === '23505') {
        setError('You have already submitted a claim for this item.')
      } else {
        setError(claimError.message)
      }
      setLoading(false)
      return
    }

    // Update item status to claimed
    await supabase.from('items').update({ status: 'claimed' }).eq('id', itemId)

    router.refresh()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-lg font-bold text-gray-900">Claim this item</h2>
            <p className="mt-0.5 text-sm text-gray-500 line-clamp-1">"{itemTitle}"</p>
          </div>
          <button onClick={onClose} className="rounded-lg p-1 hover:bg-gray-100">
            <X size={20} />
          </button>
        </div>

        <p className="mb-4 rounded-xl bg-blue-50 px-3 py-2 text-xs text-blue-700">
          Your message will be sent to the poster. Only one claim is accepted at a time — the poster will confirm or reject yours.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="mb-1.5 block text-sm font-medium text-gray-700">
              Why is this yours? <span className="text-gray-400">(optional but recommended)</span>
            </label>
            <textarea
              value={message}
              onChange={e => setMessage(e.target.value)}
              placeholder="Describe something specific about the item that proves it's yours — a scratch, what's inside, etc."
              rows={4}
              className="input resize-none"
              maxLength={500}
            />
            <p className="mt-1 text-right text-xs text-gray-400">{message.length}/500</p>
          </div>

          {error && (
            <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-600">{error}</p>
          )}

          <div className="flex gap-3">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary flex-1">
              <Send size={15} />
              {loading ? 'Sending…' : 'Submit Claim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
