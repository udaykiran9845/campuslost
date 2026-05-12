import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Calendar, User } from 'lucide-react'
import type { Item } from '@/types'
import { CATEGORY_ICONS, CATEGORY_LABELS } from '@/types'

interface Props {
  item: Item
}

export default function ItemCard({ item }: Props) {
  const formattedDate = item.date_occurred
    ? new Date(item.date_occurred).toLocaleDateString('en-IN', {
        day: 'numeric',
        month: 'short',
      })
    : null

  const posterName =
    item.profiles?.full_name ||
    item.profiles?.email?.split('@')[0] ||
    'Anonymous'

  return (
    <Link href={`/items/${item.id}`} className="card group block transition hover:shadow-md hover:-translate-y-0.5">
      {/* Image */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-100">
        {item.image_url ? (
          <Image
            src={item.image_url}
            alt={item.title}
            fill
            className="object-cover transition group-hover:scale-105"
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-5xl">
            {CATEGORY_ICONS[item.category]}
          </div>
        )}

        {/* Type badge */}
        <div className="absolute left-3 top-3">
          <span className={item.type === 'lost' ? 'badge-lost' : 'badge-found'}>
            {item.type === 'lost' ? '🔴 Lost' : '🟢 Found'}
          </span>
        </div>

        {/* Status badge (if not open) */}
        {item.status !== 'open' && (
          <div className="absolute right-3 top-3">
            <span className={item.status === 'claimed' ? 'badge-claimed' : 'badge-resolved'}>
              {item.status === 'claimed' ? '⏳ Claimed' : '✅ Resolved'}
            </span>
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Category */}
        <p className="mb-1 text-xs font-medium text-blue-600 uppercase tracking-wide">
          {CATEGORY_ICONS[item.category]} {CATEGORY_LABELS[item.category]}
        </p>

        {/* Title */}
        <h3 className="mb-2 line-clamp-2 text-sm font-semibold text-gray-900 group-hover:text-blue-600">
          {item.title}
        </h3>

        {/* Description */}
        {item.description && (
          <p className="mb-3 line-clamp-2 text-xs text-gray-500">{item.description}</p>
        )}

        {/* Meta */}
        <div className="flex flex-col gap-1 text-xs text-gray-400">
          {item.location && (
            <span className="flex items-center gap-1">
              <MapPin size={11} />
              <span className="truncate">{item.location}</span>
            </span>
          )}
          {formattedDate && (
            <span className="flex items-center gap-1">
              <Calendar size={11} />
              {formattedDate}
            </span>
          )}
          <span className="flex items-center gap-1">
            <User size={11} />
            {posterName}
          </span>
        </div>
      </div>
    </Link>
  )
}
