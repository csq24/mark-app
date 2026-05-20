export type Profile = {
  id: string
  updated_at: string
  full_name: string | null
  boat_name: string | null
  share_spots: boolean
  show_friend_spots: boolean
  username: string
  created_at?: string
}

export type ProfileUpdate = Partial<
  Pick<Profile, 'full_name' | 'boat_name' | 'share_spots' | 'show_friend_spots'>
>

export type Friend = {
  id: string
  user_id: string
  friend_id: string
  created_at: string
  source: string
}

export type MarketplaceCategory =
  | 'rods_reels'
  | 'tackle'
  | 'electronics'
  | 'engines'
  | 'boat_gear'
  | 'clothing'
  | 'services'
  | 'other'

export type MarketplaceCondition = 'new' | 'like_new' | 'good' | 'fair'

export type MarketplaceListingStatus = 'active' | 'sold' | 'removed'

export type MarketplaceListing = {
  id: string
  user_id: string
  category: MarketplaceCategory
  title: string
  description: string
  price_cents: number
  condition: MarketplaceCondition
  photo_url: string | null
  status: MarketplaceListingStatus
  created_at: string
  updated_at: string
}

export type MarketplaceListingInsert = {
  user_id: string
  category: MarketplaceCategory
  title: string
  description: string
  price_cents: number
  condition: MarketplaceCondition
  photo_url?: string | null
}

export type MarketplaceConversation = {
  id: string
  listing_id: string
  buyer_id: string
  seller_id: string
  created_at: string
  updated_at: string
}

export type MarketplaceMessage = {
  id: string
  conversation_id: string
  sender_id: string
  body: string
  created_at: string
}

export type MarketplaceMessageInsert = {
  conversation_id: string
  sender_id: string
  body: string
}

export type MarketplaceAuthor = {
  full_name: string | null
  boat_name: string | null
  username: string
}

export type Mark = {
  id: string
  user_id: string
  name: string
  latitude: number
  longitude: number
  description: string | null
  photo_url: string | null
  created_at: string
}

export type MarkRow = Pick<Mark, 'id' | 'name'>

export type MarkInsert = Pick<
  Mark,
  'name' | 'latitude' | 'longitude' | 'description'
> & {
  photo_url?: string | null
}

export type MarkOwnerProfile = Pick<
  Profile,
  'full_name' | 'boat_name' | 'username'
>

export type MarkWithOwner = Mark & {
  profiles: MarkOwnerProfile | null
}

export type Catch = {
  id: string
  user_id: string
  mark_id: string | null
  fish_type: string
  weight_lbs: number | null
  water_depth_ft: number | null
  notes: string | null
  photo_url: string | null
  created_at: string
}

export type CatchInsert = {
  user_id: string
  mark_id?: string | null
  fish_type: string
  weight_lbs?: number | null
  water_depth_ft?: number | null
  notes?: string | null
  photo_url?: string | null
}

export type ForumCategory =
  | 'offshore'
  | 'inshore'
  | 'charters'
  | 'gear'
  | 'beginner'
  | 'general'

export type ForumPost = {
  id: string
  user_id: string
  category: ForumCategory
  title: string
  body: string
  created_at: string
  updated_at: string
}

export type ForumPostInsert = {
  user_id: string
  category: ForumCategory
  title: string
  body: string
}

export type ForumReply = {
  id: string
  post_id: string
  user_id: string
  parent_id: string | null
  body: string
  created_at: string
}

export type ForumReplyInsert = {
  post_id: string
  user_id: string
  parent_id?: string | null
  body: string
}

type EmptyRecord = Record<string, never>

export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: Profile
        Insert: Pick<Profile, 'id'> & Partial<ProfileUpdate> & { username?: string }
        Update: Partial<ProfileUpdate> & { username?: string }
        Relationships: []
      }
      marks: {
        Row: Mark
        Insert: MarkInsert & { user_id: string }
        Update: Partial<MarkInsert>
        Relationships: []
      }
      catches: {
        Row: Catch
        Insert: CatchInsert
        Update: Partial<CatchInsert>
        Relationships: []
      }
      forum_posts: {
        Row: ForumPost
        Insert: ForumPostInsert
        Update: Partial<ForumPostInsert>
        Relationships: []
      }
      forum_replies: {
        Row: ForumReply
        Insert: ForumReplyInsert
        Update: Partial<Pick<ForumReplyInsert, 'body'>>
        Relationships: []
      }
      friends: {
        Row: Friend
        Insert: Pick<Friend, 'user_id' | 'friend_id'> & { source?: string }
        Update: Partial<Pick<Friend, 'source'>>
        Relationships: []
      }
      marketplace_listings: {
        Row: MarketplaceListing
        Insert: MarketplaceListingInsert
        Update: Partial<MarketplaceListingInsert & { status?: MarketplaceListingStatus }>
        Relationships: []
      }
      marketplace_conversations: {
        Row: MarketplaceConversation
        Insert: Pick<MarketplaceConversation, 'listing_id' | 'buyer_id' | 'seller_id'>
        Update: never
        Relationships: []
      }
      marketplace_messages: {
        Row: MarketplaceMessage
        Insert: MarketplaceMessageInsert
        Update: never
        Relationships: []
      }
    }
    Views: EmptyRecord
    Functions: {
      start_marketplace_conversation: {
        Args: { p_listing_id: string }
        Returns: string
      }
      seed_demo_bots: {
        Args: { bot_count?: number }
        Returns: {
          bots_created: number
          marks_created: number
          bots: {
            id: string
            email: string
            full_name: string
            boat_name: string
            marks: number
          }[]
        }
      }
    }
    Enums: EmptyRecord
    CompositeTypes: EmptyRecord
  }
}
