import type { Item, ItemCategory } from '@/types'

const STOP_WORDS = new Set([
  'a', 'an', 'the', 'and', 'or', 'but', 'in', 'on', 'at', 'to', 'for',
  'of', 'with', 'my', 'i', 'it', 'is', 'was', 'found', 'lost', 'have',
  'has', 'had', 'this', 'that', 'near', 'inside', 'outside', 'some',
])

function getKeywords(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .split(/\s+/)
    .filter(w => w.length > 2 && !STOP_WORDS.has(w))
}

function scoreItems(source: Item, candidate: Item): number {
  let score = 0

  // Same category is the strongest signal
  if (source.category === candidate.category) score += 6

  // Keyword overlap in title and description
  const sourceWords = getKeywords(
    (source.title ?? '') + ' ' + (source.description ?? '')
  )
  const candidateWords = getKeywords(
    (candidate.title ?? '') + ' ' + (candidate.description ?? '')
  )
  const overlap = sourceWords.filter(w => candidateWords.includes(w))
  score += overlap.length * 2

  // Location similarity
  if (source.location && candidate.location) {
    const sLoc = source.location.toLowerCase()
    const cLoc = candidate.location.toLowerCase()
    if (sLoc === cLoc) score += 4
    else if (sLoc.includes(cLoc) || cLoc.includes(sLoc)) score += 2
  }

  // Date proximity — items within 7 days of each other are more likely related
  if (source.date_occurred && candidate.date_occurred) {
    const days = Math.abs(
      new Date(source.date_occurred).getTime() -
        new Date(candidate.date_occurred).getTime()
    ) / (1000 * 60 * 60 * 24)
    if (days <= 1) score += 3
    else if (days <= 3) score += 2
    else if (days <= 7) score += 1
  }

  return score
}

export function findMatches(source: Item, allItems: Item[]): Item[] {
  const oppositeType = source.type === 'lost' ? 'found' : 'lost'

  return allItems
    .filter(
      item =>
        item.type === oppositeType &&
        item.status === 'open' &&
        item.id !== source.id &&
        item.posted_by !== source.posted_by
    )
    .map(item => ({ item, score: scoreItems(source, item) }))
    .filter(r => r.score >= 4)
    .sort((a, b) => b.score - a.score)
    .slice(0, 3)
    .map(r => r.item)
}
