export const dynamic = 'force-dynamic'

import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { PlusCircle, Package, Inbox } from 'lucide-react'
import type { Item, Claim } from '@/types'
import { CATEGORY_ICONS } from '@/types'

export default async function MyItemsPage() {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login?redirectTo=/my-items')

  // My posted items
  const { data: myItems } = await supabase
    .from('items')
    .select('*, claims(id, status)')
    .eq('posted_by', user.id)
    .order('created_at', { ascending: false })

  // My submitted claims
  const { data: myClaims } = await supabase
    .from('claims')
    .select('*, items(*, profiles(full_name, email))')
    .eq('claimant_id', user.id)
    .order('created_at', { ascending: false })

  const statusColor = {
    open: 'bg-blue-100 text-blue-700',
    claimed: 'bg-yellow-100 text-yellow-700',
    resolved: 'bg-green-100 text-green-700',
  }

  const claimStatusColor = {
    pending: 'bg-amber-100 text-amber-700',
    confirmed: 'bg-green-100 text-green-700',
    rejected: 'bg-red-100 text-red-700',
  }

  return (
    <div className="mx-auto max-w-4xl px-4 py-10">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Items</h1>
        <Link href="/post" className="btn-primary">
          <PlusCircle size={16} />
          Post Item
        </Link>
      </div>

      {/* My Posts */}
      <section className="mb-10">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Package size={20} className="text-blue-500" />
          Items I Posted
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-sm font-normal text-gray-500">
            {myItems?.length ?? 0}
          </span>
        </h2>

        {!myItems || myItems.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 py-12 text-center">
            <Package size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500">You haven't posted anything yet.</p>
            <Link href="/post" className="btn-primary mt-3 inline-flex">
              Post your first item
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {myItems.map((item: any) => {
              const pendingClaims = item.claims?.filter((c: any) => c.status === 'pending').length ?? 0
              return (
                <Link
                  key={item.id}
                  href={`/items/${item.id}`}
                  className="card flex items-center gap-4 p-4 transition hover:shadow-md"
                >
                  {/* Thumbnail */}
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {item.image_url ? (
                      <Image src={item.image_url} alt={item.title} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">
                        {CATEGORY_ICONS[item.category as keyof typeof CATEGORY_ICONS]}
                      </div>
                    )}
                  </div>

                  {/* Info */}
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">{item.title}</p>
                    <p className="text-xs text-gray-500">
                      {new Date(item.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>

                  {/* Badges */}
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${statusColor[item.status as keyof typeof statusColor]}`}>
                      {item.status}
                    </span>
                    {pendingClaims > 0 && (
                      <span className="rounded-full bg-orange-500 px-2 py-0.5 text-xs font-bold text-white">
                        {pendingClaims} claim{pendingClaims > 1 ? 's' : ''}
                      </span>
                    )}
                  </div>
                </Link>
              )
            })}
          </div>
        )}
      </section>

      {/* My Claims */}
      <section>
        <h2 className="mb-4 flex items-center gap-2 text-lg font-semibold text-gray-800">
          <Inbox size={20} className="text-purple-500" />
          My Claims
          <span className="rounded-full bg-gray-100 px-2 py-0.5 text-sm font-normal text-gray-500">
            {myClaims?.length ?? 0}
          </span>
        </h2>

        {!myClaims || myClaims.length === 0 ? (
          <div className="rounded-2xl border-2 border-dashed border-gray-200 py-12 text-center">
            <Inbox size={40} className="mx-auto mb-3 text-gray-300" />
            <p className="text-sm text-gray-500">You haven't claimed any items yet.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {myClaims.map((claim: any) => {
              const claimedItem = claim.items as Item
              return (
                <Link
                  key={claim.id}
                  href={`/items/${claim.item_id}`}
                  className="card flex items-center gap-4 p-4 transition hover:shadow-md"
                >
                  <div className="relative h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl bg-gray-100">
                    {claimedItem?.image_url ? (
                      <Image src={claimedItem.image_url} alt={claimedItem.title} fill className="object-cover" sizes="64px" />
                    ) : (
                      <div className="flex h-full w-full items-center justify-center text-2xl">
                        {claimedItem ? CATEGORY_ICONS[claimedItem.category] : '📦'}
                      </div>
                    )}
                  </div>

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-gray-900">{claimedItem?.title}</p>
                    <p className="text-xs text-gray-500">
                      Claimed {new Date(claim.created_at).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </p>
                  </div>

                  <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${claimStatusColor[claim.status as keyof typeof claimStatusColor]}`}>
                    {claim.status}
                  </span>
                </Link>
              )
            })}
          </div>
        )}
      </section>
    </div>
  )
}
