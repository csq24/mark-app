export type Profile = {
  id: string
  updated_at: string
  full_name: string | null
  boat_name: string | null
  share_spots: boolean
  username?: string | null
  created_at?: string
}

export type ProfileUpdate = Partial<
  Pick<Profile, 'full_name' | 'boat_name' | 'share_spots'>
>

export type Mark = {
  id: string
  user_id: string
  name: string
  latitude: number
  longitude: number
  description: string | null
  created_at: string
}

export type MarkRow = Pick<Mark, 'id' | 'name'>

export type MarkInsert = Pick<
  Mark,
  'name' | 'latitude' | 'longitude' | 'description'
>

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
        Insert: Pick<Profile, 'id'> & Partial<ProfileUpdate>
        Update: Partial<ProfileUpdate>
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
    }
    Views: EmptyRecord
    Functions: {
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
