export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: {
          created_at: string
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      conversations: {
        Row: {
          created_at: string
          id: string
          last_message_at: string | null
          participant_ids: string[]
          unread_count: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_ids: string[]
          unread_count?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          last_message_at?: string | null
          participant_ids?: string[]
          unread_count?: number | null
        }
        Relationships: []
      }
      editor_favorites: {
        Row: {
          created_at: string | null
          editor_id: string
          id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          editor_id: string
          id?: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          editor_id?: string
          id?: string
          user_id?: string
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      portfolio_settings: {
        Row: {
          about: string | null
          categories: Json | null
          created_at: string | null
          featured_video: Json | null
          highlighted_videos: Json | null
          id: string
          portfolio_description: string | null
          portfolio_title: string | null
          showreel_thumbnail: string | null
          showreel_url: string | null
          specializations: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          about?: string | null
          categories?: Json | null
          created_at?: string | null
          featured_video?: Json | null
          highlighted_videos?: Json | null
          id?: string
          portfolio_description?: string | null
          portfolio_title?: string | null
          showreel_thumbnail?: string | null
          showreel_url?: string | null
          specializations?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          about?: string | null
          categories?: Json | null
          created_at?: string | null
          featured_video?: Json | null
          highlighted_videos?: Json | null
          id?: string
          portfolio_description?: string | null
          portfolio_title?: string | null
          showreel_thumbnail?: string | null
          showreel_url?: string | null
          specializations?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      portfolio_views: {
        Row: {
          browser: string | null
          device_type: string | null
          id: string
          portfolio_user_id: string | null
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          browser?: string | null
          device_type?: string | null
          id?: string
          portfolio_user_id?: string | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          browser?: string | null
          device_type?: string | null
          id?: string
          portfolio_user_id?: string | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: []
      }
      profile_likes: {
        Row: {
          created_at: string | null
          id: string
          profile_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          profile_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          profile_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profile_likes_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          bio: string | null
          created_at: string | null
          email: string | null
          id: string
          likes: number | null
          name: string | null
          portfolio_views: number | null
          role: string | null
          subscription_tier: string | null
        }
        Insert: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id: string
          likes?: number | null
          name?: string | null
          portfolio_views?: number | null
          role?: string | null
          subscription_tier?: string | null
        }
        Update: {
          avatar_url?: string | null
          bio?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          likes?: number | null
          name?: string | null
          portfolio_views?: number | null
          role?: string | null
          subscription_tier?: string | null
        }
        Relationships: []
      }
      subscribers: {
        Row: {
          created_at: string
          current_period_end: string | null
          email: string
          id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          subscription_status: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_period_end?: string | null
          email: string
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_period_end?: string | null
          email?: string
          id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          subscription_status?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      video_likes: {
        Row: {
          created_at: string | null
          id: string
          user_id: string
          video_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id: string
          video_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_likes_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      video_views: {
        Row: {
          browser: string | null
          device_type: string | null
          id: string
          video_id: string | null
          view_duration: number | null
          viewed_at: string
          viewer_id: string | null
        }
        Insert: {
          browser?: string | null
          device_type?: string | null
          id?: string
          video_id?: string | null
          view_duration?: number | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Update: {
          browser?: string | null
          device_type?: string | null
          id?: string
          video_id?: string | null
          view_duration?: number | null
          viewed_at?: string
          viewer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "video_views_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "videos"
            referencedColumns: ["id"]
          },
        ]
      }
      videos: {
        Row: {
          category_id: string
          created_at: string | null
          description: string | null
          id: string
          is_highlighted: boolean | null
          likes: number | null
          thumbnail_url: string | null
          title: string
          user_id: string
          video_url: string | null
          views: number | null
        }
        Insert: {
          category_id: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_highlighted?: boolean | null
          likes?: number | null
          thumbnail_url?: string | null
          title: string
          user_id: string
          video_url?: string | null
          views?: number | null
        }
        Update: {
          category_id?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_highlighted?: boolean | null
          likes?: number | null
          thumbnail_url?: string | null
          title?: string
          user_id?: string
          video_url?: string | null
          views?: number | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_current_user_send_to_conversation: {
        Args: { p_conversation_id: string }
        Returns: boolean
      }
      check_profile_like: {
        Args: { profile_id_param: string; user_id_param: string }
        Returns: boolean
      }
      check_video_like: {
        Args: { video_id_param: string; user_id_param: string }
        Returns: boolean
      }
      has_premium_access: {
        Args: { user_id_param: string }
        Returns: boolean
      }
      record_portfolio_view: {
        Args: {
          portfolio_user_id_param: string
          viewer_id_param: string
          device_type_param: string
          browser_param: string
        }
        Returns: undefined
      }
      record_video_view: {
        Args: {
          video_id_param: string
          viewer_id_param: string
          device_type_param: string
          browser_param: string
        }
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
