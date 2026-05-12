'use client'

import { useRouter, useSearchParams } from 'next/navigation'
import { useCallback } from 'react'
import { Search } from 'lucide-react'
import type { ItemCategory } from '@/types'
import { CATEGORY_LABELS } from '@/types'

const TYPE_FILTERS = [
  { value: '', label: 'All' },
  { value: 'lost', label: '🔴 Lost' },
  { value: 'found', label: '🟢 Found' },
]

const CATEGORIES: { value: string; label: string }[] = [
  { value: '', label: 'All Categories' },
  ...Object.entries(CATEGORY_LABELS).map(([value, label]) => ({ value, label })),
]

export default function SearchFilter() {
  const router = useRouter()
  const searchParams = useSearchParams()

  const currentType = searchParams.get('type') ?? ''
  const currentCategory = searchParams.get('category') ?? ''
  const currentQuery = searchParams.get('q') ?? ''

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString())
      if (value) {
        params.set(key, value)
      } else {
        params.delete(key)
      }
      router.push(`/?${params.toString()}`)
    },
    [router, searchParams]
  )

  return (
    <div className="space-y-4">
      {/* Search bar */}
      <div className="relative">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          placeholder="Search lost & found items…"
          defaultValue={currentQuery}
          onChange={e => updateParam('q', e.target.value)}
          className="input pl-10"
        />
      </div>

      {/* Type filter pills */}
      <div className="flex flex-wrap gap-2">
        {TYPE_FILTERS.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateParam('type', value)}
            className={`rounded-full border px-4 py-1.5 text-sm font-medium transition ${
              currentType === value
                ? 'border-blue-600 bg-blue-600 text-white'
                : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Category filter */}
      <div className="flex flex-wrap gap-2">
        {CATEGORIES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => updateParam('category', value)}
            className={`rounded-full border px-3 py-1 text-xs font-medium transition ${
              currentCategory === value
                ? 'border-blue-600 bg-blue-50 text-blue-700'
                : 'border-gray-200 bg-white text-gray-500 hover:border-gray-300 hover:bg-gray-50'
            }`}
          >
            {label}
          </button>
        ))}
      </div>
    </div>
  )
}
