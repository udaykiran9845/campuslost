import { Suspense } from 'react'

export const dynamic = 'force-dynamic'
import { createClient } from '@/lib/supabase/server'
import ItemCard from '@/components/ItemCard'
import SearchFilter from '@/components/SearchFilter'
import { PlusCircle, Package } from 'lucide-react'
import Link from 'next/link'
import type { Item } from '@/types'

interface PageProps {
  searchParams: { type?: string; category?: string; q?: string }
}

async function ItemGrid({ searchParams }: PageProps) {
  const supabase = createClient()

  let query = supabase
    .from('items')
    .select('*, profiles(full_name, email)')
    .order('created_at', { ascending: false })

  if (searchParams.type === 'lost' || searchParams.type === 'found') {
    query = query.eq('type', searchParams.type)
  }
  if (searchParams.category) {
    query = query.eq('category', searchParams.category)
  }
  if (searchParams.q) {
    query = query.or(
      `title.ilike.%${searchParams.q}%,description.ilike.%${searchParams.q}%,location.ilike.%${searchParams.q}%`
    )
  }

  const { data: items, error } = await query.limit(60)

  if (error) {
    const isTableMissing = error.message?.includes('relation') || error.code === '42P01'
    return (
      <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center">
        <p className="font-semibold text-red-700">
          {isTableMissing ? '⚠️ Database not set up yet' : 'Failed to load items'}
        </p>
        <p className="mt-1 text-sm text-red-600">
          {isTableMissing
            ? 'Run supabase/schema.sql in your Supabase SQL Editor, then refresh.'
            : error.message}
        </p>
        <code className="mt-2 block rounded bg-red-100 px-3 py-1.5 text-xs text-red-800">
          {error.code}: {error.message}
        </code>
      </div>
    )
  }

  if (!items || items.length === 0) {
    return (
      <div className="py-24 text-center">
        <Package size={48} className="mx-auto mb-4 text-gray-300" />
        <h3 className="text-lg font-semibold text-gray-900">No items found</h3>
        <p className="mt-1 text-sm text-gray-500">
          {searchParams.q || searchParams.type || searchParams.category
            ? 'Try adjusting your search or filters.'
            : 'Be the first to post a lost or found item!'}
        </p>
        <Link href="/post" className="btn-primary mt-4 inline-flex">
          <PlusCircle size={16} />
          Post an Item
        </Link>
      </div>
    )
  }

  // Separate lost and found for stats
  const lostCount = items.filter((i: Item) => i.type === 'lost').length
  const foundCount = items.filter((i: Item) => i.type === 'found').length

  return (
    <>
      <p className="mb-4 text-sm text-gray-500">
        Showing {items.length} item{items.length !== 1 ? 's' : ''}
        {lostCount > 0 && foundCount > 0 && ` · ${lostCount} lost · ${foundCount} found`}
      </p>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item: Item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </>
  )
}

export default function HomePage({ searchParams }: PageProps) {
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      {/* Hero */}
      <div className="mb-8 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campus Lost & Found</h1>
          <p className="mt-1 text-gray-500">
            Lost something? Found something? Post it here — we'll help connect you.
          </p>
        </div>
        <Link href="/post" className="btn-primary shrink-0">
          <PlusCircle size={18} />
          Post an Item
        </Link>
      </div>

      {/* Search & Filters */}
      <div className="mb-8">
        <Suspense fallback={<div className="h-28 rounded-2xl bg-gray-100 animate-pulse" />}>
          <SearchFilter />
        </Suspense>
      </div>

      {/* Item Grid */}
      <Suspense
        fallback={
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="card h-72 animate-pulse bg-gray-100" />
            ))}
          </div>
        }
      >
        <ItemGrid searchParams={searchParams} />
      </Suspense>
    </div>
  )
}
