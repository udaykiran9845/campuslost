export const dynamic = 'force-dynamic'

import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { findMatches } from '@/lib/matching'
import MatchBanner from '@/components/MatchBanner'
import ClaimActions from '@/components/ClaimActions'
import { MapPin, Calendar, User, ArrowLeft, CheckCircle2 } from 'lucide-react'
import type { Item } from '@/types'
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/types'

interface PageProps {
  params: { id: string }
  searchParams: { posted?: string }
}

export default async function ItemPage({ params, searchParams }: PageProps) {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Fetch item
  const { data: item, error } = await supabase
    .from('items')
    .select('*, profiles(full_name, email)')
    .eq('id', params.id)
    .single()

  if (error || !item) notFound()

  // Fetch claims (only if poster)
  let claims: any[] = []
  if (user?.id === item.posted_by) {
    const { data } = await supabase
      .from('claims')
      .select('*, profiles(full_name, email)')
      .eq('item_id', item.id)
      .order('created_at', { ascending: true })
    claims = data ?? []
  }

  // Check if current user has already claimed
  let userClaim = null
  if (user && user.id !== item.posted_by) {
    const { data } = await supabase
      .from('claims')
      .select('*')
      .eq('item_id', item.id)
      .eq('claimant_id', user.id)
      .maybeSingle()
    userClaim = data
  }

  // Find matches for this item
  let matches: Item[] = []
  if (item.status === 'open') {
    const { data: allItems } = await supabase
      .from('items')
      .select('*')
      .neq('id', item.id)
      .eq('status', 'open')
    if (allItems) {
      matches = findMatches(item as Item, allItems as Item[])
    }
  }

  const isOwner = user?.id === item.posted_by
  const posterName =
    item.profiles?.full_name ||
    item.profiles?.email?.split('@')[0] ||
    'Anonymous'

  const formattedDate = item.date_occurred
    ? new Date(item.date_occurred).toLocaleDateString('en-IN', {
        weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
      })
    : null

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      {/* Back */}
      <Link href="/" className="mb-6 inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700">
        <ArrowLeft size={16} />
        Back to feed
      </Link>

      {/* Just posted banner */}
      {searchParams.posted && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-green-200 bg-green-50 px-4 py-3">
          <CheckCircle2 size={20} className="text-green-600" />
          <div>
            <p className="text-sm font-semibold text-green-800">Item posted successfully!</p>
            <p className="text-xs text-green-700">
              We'll show you any matching items below.
            </p>
          </div>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-5">
        {/* Image + meta */}
        <div className="md:col-span-3">
          <div className="card overflow-hidden">
            {/* Image */}
            <div className="relative aspect-[4/3] w-full bg-gray-100">
              {item.image_url ? (
                <Image
                  src={item.image_url}
                  alt={item.title}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 60vw"
                  priority
                />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-8xl">
                  {CATEGORY_ICONS[item.category as keyof typeof CATEGORY_ICONS]}
                </div>
              )}

              {/* Badges */}
              <div className="absolute left-3 top-3 flex gap-2">
                <span className={item.type === 'lost' ? 'badge-lost' : 'badge-found'}>
                  {item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}
                </span>
                {item.status !== 'open' && (
                  <span className={item.status === 'claimed' ? 'badge-claimed' : 'badge-resolved'}>
                    {item.status === 'claimed' ? '⏳ Claimed' : '✅ Resolved'}
                  </span>
                )}
              </div>
            </div>

            {/* Details */}
            <div className="p-5">
              <p className="mb-1 text-xs font-medium uppercase tracking-wide text-blue-600">
                {CATEGORY_ICONS[item.category as keyof typeof CATEGORY_ICONS]}{' '}
                {CATEGORY_LABELS[item.category as keyof typeof CATEGORY_LABELS]}
              </p>
              <h1 className="mb-3 text-xl font-bold text-gray-900">{item.title}</h1>

              {item.description && (
                <p className="mb-4 text-sm text-gray-600 leading-relaxed">{item.description}</p>
              )}

              <div className="space-y-2 border-t border-gray-100 pt-4">
                {item.location && (
                  <div className="flex items-start gap-2 text-sm text-gray-600">
                    <MapPin size={15} className="mt-0.5 shrink-0 text-gray-400" />
                    {item.location}
                  </div>
                )}
                {formattedDate && (
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Calendar size={15} className="text-gray-400" />
                    {item.date_occurred && new Date(item.date_occurred) > new Date()
                      ? 'Date not specified'
                      : formattedDate}
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-gray-600">
                  <User size={15} className="text-gray-400" />
                  Posted by {posterName}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right panel — claim / matches */}
        <div className="flex flex-col gap-4 md:col-span-2">
          {/* Claim actions */}
          <ClaimActions
            item={item as Item}
            user={user}
            isOwner={isOwner}
            userClaim={userClaim}
            claims={claims}
          />

          {/* Match banner */}
          {matches.length > 0 && (
            <MatchBanner matches={matches} sourceType={item.type as 'lost' | 'found'} />
          )}
        </div>
      </div>
    </div>
  )
}
