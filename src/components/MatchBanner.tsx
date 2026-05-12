import Link from 'next/link'
import Image from 'next/image'
import { Sparkles, MapPin } from 'lucide-react'
import type { Item } from '@/types'
import { CATEGORY_ICONS } from '@/types'

interface Props {
  matches: Item[]
  sourceType: 'lost' | 'found'
}

export default function MatchBanner({ matches, sourceType }: Props) {
  if (matches.length === 0) return null

  const oppositeLabel = sourceType === 'lost' ? 'found' : 'lost'

  return (
    <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
      <div className="mb-3 flex items-center gap-2">
        <Sparkles size={18} className="text-amber-600" />
        <h3 className="text-sm font-semibold text-amber-900">
          {matches.length} possible match{matches.length > 1 ? 'es' : ''} found!
        </h3>
        <span className="text-xs text-amber-700">
          These {oppositeLabel} items might be yours
        </span>
      </div>

      <div className="flex flex-col gap-2">
        {matches.map(match => (
          <Link
            key={match.id}
            href={`/items/${match.id}`}
            className="flex items-center gap-3 rounded-xl bg-white px-3 py-2.5 shadow-sm transition hover:shadow-md"
          >
            {/* Thumbnail */}
            <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
              {match.image_url ? (
                <Image src={match.image_url} alt={match.title} fill className="object-cover" sizes="48px" />
              ) : (
                <div className="flex h-full w-full items-center justify-center text-xl">
                  {CATEGORY_ICONS[match.category]}
                </div>
              )}
            </div>

            {/* Info */}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-gray-900">{match.title}</p>
              {match.location && (
                <p className="flex items-center gap-1 text-xs text-gray-500">
                  <MapPin size={10} />
                  {match.location}
                </p>
              )}
            </div>

            <span className="badge-found text-xs">View →</span>
          </Link>
        ))}
      </div>
    </div>
  )
}
