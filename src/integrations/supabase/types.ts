export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      click_events: {
        Row: {
          created_at: string
          id: string
          kind: string
          meta: Json
        }
        Insert: {
          created_at?: string
          id?: string
          kind: string
          meta?: Json
        }
        Update: {
          created_at?: string
          id?: string
          kind?: string
          meta?: Json
        }
        Relationships: []
      }
      offers: {
        Row: {
          created_at: string
          currency: string | null
          description_ar: string | null
          description_en: string | null
          discount_label: string | null
          id: string
          image: string | null
          price: number | null
          status: Database["public"]["Enums"]["content_status"]
          title_ar: string
          title_en: string
          valid_until: string | null
        }
        Insert: {
          created_at?: string
          currency?: string | null
          description_ar?: string | null
          description_en?: string | null
          discount_label?: string | null
          id?: string
          image?: string | null
          price?: number | null
          status?: Database["public"]["Enums"]["content_status"]
          title_ar: string
          title_en: string
          valid_until?: string | null
        }
        Update: {
          created_at?: string
          currency?: string | null
          description_ar?: string | null
          description_en?: string | null
          discount_label?: string | null
          id?: string
          image?: string | null
          price?: number | null
          status?: Database["public"]["Enums"]["content_status"]
          title_ar?: string
          title_en?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      page_views: {
        Row: {
          created_at: string
          id: string
          path: string
          referrer: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          path: string
          referrer?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          path?: string
          referrer?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      request_status_history: {
        Row: {
          changed_by: string | null
          created_at: string
          id: string
          new_status: string
          old_status: string | null
          request_id: string
        }
        Insert: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status: string
          old_status?: string | null
          request_id: string
        }
        Update: {
          changed_by?: string | null
          created_at?: string
          id?: string
          new_status?: string
          old_status?: string | null
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "request_status_history_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          booking_type: string | null
          created_at: string
          id: string
          message: string | null
          name: string
          nationality: string | null
          notes: string | null
          passport_number: string | null
          persons: number | null
          phone: string
          service_slug: string | null
          service_type: Database["public"]["Enums"]["service_category"]
          status: Database["public"]["Enums"]["request_status"]
          travel_class: string | null
          travel_date: string | null
          updated_at: string
        }
        Insert: {
          booking_type?: string | null
          created_at?: string
          id?: string
          message?: string | null
          name: string
          nationality?: string | null
          notes?: string | null
          passport_number?: string | null
          persons?: number | null
          phone: string
          service_slug?: string | null
          service_type: Database["public"]["Enums"]["service_category"]
          status?: Database["public"]["Enums"]["request_status"]
          travel_class?: string | null
          travel_date?: string | null
          updated_at?: string
        }
        Update: {
          booking_type?: string | null
          created_at?: string
          id?: string
          message?: string | null
          name?: string
          nationality?: string | null
          notes?: string | null
          passport_number?: string | null
          persons?: number | null
          phone?: string
          service_slug?: string | null
          service_type?: Database["public"]["Enums"]["service_category"]
          status?: Database["public"]["Enums"]["request_status"]
          travel_class?: string | null
          travel_date?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      services: {
        Row: {
          category: Database["public"]["Enums"]["service_category"]
          created_at: string
          description_ar: string | null
          description_en: string | null
          id: string
          image: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["content_status"]
          tags: string[]
          title_ar: string
          title_en: string
          updated_at: string
        }
        Insert: {
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          image?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title_ar: string
          title_en: string
          updated_at?: string
        }
        Update: {
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          image?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["content_status"]
          tags?: string[]
          title_ar?: string
          title_en?: string
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          about_ar: string | null
          about_en: string | null
          gold_color: string
          hero_image_url: string | null
          hero_kicker_ar: string | null
          hero_kicker_en: string | null
          hero_sub_ar: string | null
          hero_sub_en: string | null
          hero_title_ar: string | null
          hero_title_en: string | null
          id: number
          logo_url: string | null
          primary_color: string
          updated_at: string
          whatsapp_number: string
        }
        Insert: {
          about_ar?: string | null
          about_en?: string | null
          gold_color?: string
          hero_image_url?: string | null
          hero_kicker_ar?: string | null
          hero_kicker_en?: string | null
          hero_sub_ar?: string | null
          hero_sub_en?: string | null
          hero_title_ar?: string | null
          hero_title_en?: string | null
          id?: number
          logo_url?: string | null
          primary_color?: string
          updated_at?: string
          whatsapp_number?: string
        }
        Update: {
          about_ar?: string | null
          about_en?: string | null
          gold_color?: string
          hero_image_url?: string | null
          hero_kicker_ar?: string | null
          hero_kicker_en?: string | null
          hero_sub_ar?: string | null
          hero_sub_en?: string | null
          hero_title_ar?: string | null
          hero_title_en?: string | null
          id?: number
          logo_url?: string | null
          primary_color?: string
          updated_at?: string
          whatsapp_number?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      find_user_id_by_email: { Args: { _email: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      list_admin_users: {
        Args: never
        Returns: {
          created_at: string
          email: string
          user_id: string
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "user"
      content_status: "active" | "draft" | "archived"
      request_status: "pending" | "in_progress" | "done" | "cancelled"
      service_category:
        | "travel"
        | "accommodation"
        | "packages"
        | "transportation"
        | "visa"
        | "egypt_security"
        | "religious"
        | "vip"
        | "additional"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["admin", "user"],
      content_status: ["active", "draft", "archived"],
      request_status: ["pending", "in_progress", "done", "cancelled"],
      service_category: [
        "travel",
        "accommodation",
        "packages",
        "transportation",
        "visa",
        "egypt_security",
        "religious",
        "vip",
        "additional",
      ],
    },
  },
} as const
