export type ItemType = 'lost' | 'found'
export type ItemStatus = 'open' | 'claimed' | 'resolved'
export type ItemCategory =
  | 'wallet'
  | 'id_card'
  | 'phone'
  | 'keys'
  | 'bag'
  | 'laptop'
  | 'glasses'
  | 'other'
export type ClaimStatus = 'pending' | 'confirmed' | 'rejected'

export interface Profile {
  id: string
  full_name: string | null
  email: string | null
  created_at: string
}

export interface Item {
  id: string
  type: ItemType
  title: string
  description: string | null
  category: ItemCategory
  location: string | null
  date_occurred: string | null
  image_url: string | null
  status: ItemStatus
  posted_by: string
  created_at: string
  profiles?: Profile | null
  claims?: Claim[]
}

export interface Claim {
  id: string
  item_id: string
  claimant_id: string
  message: string | null
  status: ClaimStatus
  created_at: string
  profiles?: Profile | null
  items?: Item
}

export const CATEGORY_LABELS: Record<ItemCategory, string> = {
  wallet: 'Wallet',
  id_card: 'ID Card',
  phone: 'Phone',
  keys: 'Keys',
  bag: 'Bag',
  laptop: 'Laptop / Charger',
  glasses: 'Glasses',
  other: 'Other',
}

export const CATEGORY_ICONS: Record<ItemCategory, string> = {
  wallet: '👜',
  id_card: '🪪',
  phone: '📱',
  keys: '🔑',
  bag: '🎒',
  laptop: '💻',
  glasses: '👓',
  other: '📦',
}
