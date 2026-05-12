'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import ClaimModal from './ClaimModal'
import { CheckCircle2, XCircle, LogIn, Clock, AlertTriangle } from 'lucide-react'
import type { Item, Claim } from '@/types'
import type { User } from '@supabase/supabase-js'

interface Props {
  item: Item
  user: User | null
  isOwner: boolean
  userClaim: Claim | null
  claims: Claim[]
}

export default function ClaimActions({ item, user, isOwner, userClaim, claims }: Props) {
  const [showClaimModal, setShowClaimModal] = useState(false)
  const [loadingId, setLoadingId] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleClaimAction = async (claimId: string, status: 'confirmed' | 'rejected') => {
    setLoadingId(claimId)

    await supabase.from('claims').update({ status }).eq('id', claimId)

    if (status === 'confirmed') {
      // Reject all other pending claims
      await supabase
        .from('claims')
        .update({ status: 'rejected' })
        .eq('item_id', item.id)
        .eq('status', 'pending')
        .neq('id', claimId)

      await supabase.from('items').update({ status: 'resolved' }).eq('id', item.id)
    } else if (status === 'rejected') {
      // Check if there are still pending claims; if not, reopen
      const { count } = await supabase
        .from('claims')
        .select('*', { count: 'exact', head: true })
        .eq('item_id', item.id)
        .eq('status', 'pending')
      if ((count ?? 0) === 0) {
        await supabase.from('items').update({ status: 'open' }).eq('id', item.id)
      }
    }

    setLoadingId(null)
    router.refresh()
  }

  // ---- OWNER VIEW ----
  if (isOwner) {
    return (
      <div className="card p-4">
        <h3 className="mb-3 font-semibold text-gray-900">
          Claims on your item
          {claims.length > 0 && (
            <span className="ml-2 rounded-full bg-blue-100 px-2 py-0.5 text-xs text-blue-700">
              {claims.length}
            </span>
          )}
        </h3>

        {item.status === 'resolved' && (
          <div className="mb-3 flex items-center gap-2 rounded-xl bg-green-50 px-3 py-2 text-sm text-green-700">
            <CheckCircle2 size={16} />
            Item marked as resolved!
          </div>
        )}

        {claims.length === 0 ? (
          <p className="text-sm text-gray-400">No claims yet.</p>
        ) : (
          <div className="space-y-3">
            {claims.map((claim: Claim) => (
              <div
                key={claim.id}
                className={`rounded-xl border p-3 ${
                  claim.status === 'confirmed'
                    ? 'border-green-200 bg-green-50'
                    : claim.status === 'rejected'
                    ? 'border-gray-200 bg-gray-50 opacity-60'
                    : 'border-blue-200 bg-blue-50'
                }`}
              >
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-sm font-medium text-gray-800">
                    {claim.profiles?.full_name || claim.profiles?.email?.split('@')[0] || 'Student'}
                  </span>
                  <span
                    className={`text-xs font-medium ${
                      claim.status === 'confirmed'
                        ? 'text-green-700'
                        : claim.status === 'rejected'
                        ? 'text-gray-500'
                        : 'text-blue-700'
                    }`}
                  >
                    {claim.status === 'pending' ? '⏳ Pending' : claim.status === 'confirmed' ? '✅ Confirmed' : '❌ Rejected'}
                  </span>
                </div>
                {claim.message && (
                  <p className="mb-2 text-xs text-gray-600 italic">"{claim.message}"</p>
                )}

                {claim.status === 'pending' && item.status !== 'resolved' && (
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleClaimAction(claim.id, 'confirmed')}
                      disabled={loadingId === claim.id}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg bg-green-600 py-1.5 text-xs font-semibold text-white transition hover:bg-green-700 disabled:opacity-50"
                    >
                      <CheckCircle2 size={13} />
                      Confirm
                    </button>
                    <button
                      onClick={() => handleClaimAction(claim.id, 'rejected')}
                      disabled={loadingId === claim.id}
                      className="flex flex-1 items-center justify-center gap-1 rounded-lg border border-red-300 py-1.5 text-xs font-semibold text-red-600 transition hover:bg-red-50 disabled:opacity-50"
                    >
                      <XCircle size={13} />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    )
  }

  // ---- NON-OWNER VIEW ----
  return (
    <div className="card p-4">
      <h3 className="mb-3 font-semibold text-gray-900">Is this yours?</h3>

      {item.status === 'resolved' && (
        <div className="flex items-center gap-2 rounded-xl bg-gray-50 px-3 py-3 text-sm text-gray-600">
          <CheckCircle2 size={16} className="text-green-500" />
          This item has been resolved and returned to its owner.
        </div>
      )}

      {item.status === 'open' && (
        <>
          {!user ? (
            <div className="rounded-xl bg-blue-50 p-3 text-center">
              <p className="mb-2 text-sm text-gray-600">Sign in to claim this item</p>
              <Link href={`/login?redirectTo=/items/${item.id}`} className="btn-primary w-full justify-center">
                <LogIn size={15} />
                Sign in to claim
              </Link>
            </div>
          ) : userClaim ? (
            <div className="rounded-xl bg-amber-50 px-3 py-3">
              <div className="flex items-center gap-2 text-sm font-medium text-amber-800">
                <Clock size={15} />
                {userClaim.status === 'pending'
                  ? 'Your claim is pending — the poster will review it.'
                  : userClaim.status === 'confirmed'
                  ? '✅ Your claim was confirmed!'
                  : '❌ Your claim was rejected. Contact the poster directly.'}
              </div>
              {userClaim.message && (
                <p className="mt-1.5 text-xs text-amber-700 italic">You wrote: "{userClaim.message}"</p>
              )}
            </div>
          ) : (
            <>
              <p className="mb-3 text-xs text-gray-500">
                Think this is yours? Submit a claim with a message to the poster — describe something specific that proves it's yours.
              </p>
              <button
                onClick={() => setShowClaimModal(true)}
                className="btn-primary w-full justify-center"
              >
                Claim this item
              </button>
            </>
          )}
        </>
      )}

      {item.status === 'claimed' && !userClaim && (
        <div className="flex items-start gap-2 rounded-xl bg-yellow-50 px-3 py-3 text-sm text-yellow-800">
          <AlertTriangle size={15} className="mt-0.5 shrink-0" />
          <span>Someone has already claimed this item. If it's yours, contact the poster directly.</span>
        </div>
      )}

      {showClaimModal && (
        <ClaimModal
          itemId={item.id}
          itemTitle={item.title}
          onClose={() => setShowClaimModal(false)}
        />
      )}
    </div>
  )
}
