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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      cart: {
        Row: {
          id: string
          user_id: string
          product_id: string
          quantity: number
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          product_id: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          product_id?: string
          quantity?: number
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cart_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cart_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      bookings: {
        Row: {
          amount: number | null
          booking_date: string
          booking_time: string
          created_at: string
          profile_id: string | null
          id: string
          notes: string | null
          owner_email: string
          owner_name: string
          owner_phone: string
          pet_name: string
          pet_type: string
          provider_id: string | null
          service_category: string | null
          service_name: string | null
          service_pricing_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number | null
          booking_date: string
          booking_time: string
          created_at?: string
          profile_id?: string | null
          id?: string
          notes?: string | null
          owner_email: string
          owner_name: string
          owner_phone: string
          pet_name: string
          pet_type: string
          provider_id?: string | null
          service_category?: string | null
          service_name?: string | null
          service_pricing_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number | null
          booking_date?: string
          booking_time?: string
          created_at?: string
          profile_id?: string | null
          id?: string
          notes?: string | null
          owner_email?: string
          owner_name?: string
          owner_phone?: string
          pet_name?: string
          pet_type?: string
          provider_id?: string | null
          service_category?: string | null
          service_name?: string | null
          service_pricing_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "bookings_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "bookings_service_pricing_id_fkey"
            columns: ["service_pricing_id"]
            isOneToOne: false
            referencedRelation: "service_pricing"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          booking_id: string | null
          created_at: string
          id: string
          is_read: boolean | null
          message: string
          notification_type: string
          payment_id: string | null
          recipient_id: string | null
          recipient_type: string
          title: string
        }
        Insert: {
          booking_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message: string
          notification_type: string
          payment_id?: string | null
          recipient_id?: string | null
          recipient_type: string
          title: string
        }
        Update: {
          booking_id?: string | null
          created_at?: string
          id?: string
          is_read?: boolean | null
          message?: string
          notification_type?: string
          payment_id?: string | null
          recipient_id?: string | null
          recipient_type?: string
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notifications_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          booking_id: string
          created_at: string
          currency: string | null
          id: string
          razorpay_order_id: string | null
          razorpay_payment_id: string | null
          razorpay_signature: string | null
          status: Database["public"]["Enums"]["payment_status"]
          updated_at: string
        }
        Insert: {
          amount: number
          booking_id: string
          created_at?: string
          currency?: string | null
          id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Update: {
          amount?: number
          booking_id?: string
          created_at?: string
          currency?: string | null
          id?: string
          razorpay_order_id?: string | null
          razorpay_payment_id?: string | null
          razorpay_signature?: string | null
          status?: Database["public"]["Enums"]["payment_status"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: false
            referencedRelation: "bookings"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email_address: string | null
          password: string | null
          mobile_number: string | null
          address: string | null
          avatar_url: string | null
          city: string | null
          state: string | null
          preferred_location: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          full_name?: string | null
          email_address?: string | null
          password?: string | null
          mobile_number?: string | null
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          state?: string | null
          preferred_location?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email_address?: string | null
          password?: string | null
          mobile_number?: string | null
          address?: string | null
          avatar_url?: string | null
          city?: string | null
          state?: string | null
          preferred_location?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      provider_availability: {
        Row: {
          created_at: string
          day_of_week: number
          end_time: string
          id: string
          is_available: boolean | null
          provider_id: string
          start_time: string
        }
        Insert: {
          created_at?: string
          day_of_week: number
          end_time: string
          id?: string
          is_available?: boolean | null
          provider_id: string
          start_time: string
        }
        Update: {
          created_at?: string
          day_of_week?: number
          end_time?: string
          id?: string
          is_available?: boolean | null
          provider_id?: string
          start_time?: string
        }
        Relationships: [
          {
            foreignKeyName: "provider_availability_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_pricing: {
        Row: {
          created_at: string
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          name: string
          price: number
          provider_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          price: number
          provider_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          price?: number
          provider_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_pricing_provider_id_fkey"
            columns: ["provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      service_providers: {
        Row: {
          address: string | null
          category: Database["public"]["Enums"]["service_category"]
          created_at: string
          description: string | null
          email: string | null
          id: string
          image: string | null
          is_active: boolean | null
          name: string
          open_time: string | null
          close_time: string | null
          phone: string | null
          price_range: string | null
          rating: number | null
          review_count: number | null
          services: string[] | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          category: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          name: string
          open_time?: string | null
          close_time?: string | null
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          category?: Database["public"]["Enums"]["service_category"]
          created_at?: string
          description?: string | null
          email?: string | null
          id?: string
          image?: string | null
          is_active?: boolean | null
          name?: string
          open_time?: string | null
          close_time?: string | null
          phone?: string | null
          price_range?: string | null
          rating?: number | null
          review_count?: number | null
          services?: string[] | null
          updated_at?: string
          user_id?: string
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
      categories: {
        Row: {
          id: string
          name: string
          description: string | null
          icon: string | null
          image: string | null
          is_active: boolean | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          icon?: string | null
          image?: string | null
          is_active?: boolean | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          icon?: string | null
          image?: string | null
          is_active?: boolean | null
          created_at?: string
        }
        Relationships: []
      }
      products: {
        Row: {
          id: string
          name: string
          description: string | null
          price: number
          category: string
          image: string | null
          stock: number
          brand: string | null
          rating: number | null
          review_count: number | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          price: number
          category: string
          image?: string | null
          stock?: number
          brand?: string | null
          rating?: number | null
          review_count?: number | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          price?: number
          category?: string
          image?: string | null
          stock?: number
          brand?: string | null
          rating?: number | null
          review_count?: number | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          id: string
          profile_id: string | null
          total_amount: number
          status: string
          payment_status: string
          shipping_address: Json | null
          billing_address: Json | null
          notes: string | null
          display_id: string | null
          estimated_delivery: string | null
          tracking_updates: Json | null
          payment_method: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          profile_id?: string | null
          total_amount: number
          status?: string
          payment_status?: string
          shipping_address?: Json | null
          billing_address?: Json | null
          notes?: string | null
          display_id?: string | null
          estimated_delivery?: string | null
          tracking_updates?: Json | null
          payment_method?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          profile_id?: string | null
          total_amount?: number
          status?: string
          payment_status?: string
          shipping_address?: Json | null
          billing_address?: Json | null
          notes?: string | null
          display_id?: string | null
          estimated_delivery?: string | null
          tracking_updates?: Json | null
          payment_method?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "orders_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          id: string
          order_id: string
          product_id: string | null
          product_name: string | null
          quantity: number
          price: number
          created_at: string
        }
        Insert: {
          id?: string
          order_id: string
          product_id?: string | null
          product_name?: string | null
          quantity: number
          price: number
          created_at?: string
        }
        Update: {
          id?: string
          order_id?: string
          product_id?: string | null
          product_name?: string | null
          quantity?: number
          price?: number
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews: {
        Row: {
          id: string
          user_id: string | null
          product_id: string | null
          service_provider_id: string | null
          booking_id: string | null
          order_id: string | null
          rating: number
          comment: string | null
          is_verified_purchase: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          service_provider_id?: string | null
          booking_id?: string | null
          order_id?: string | null
          rating: number
          comment?: string | null
          is_verified_purchase?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          product_id?: string | null
          service_provider_id?: string | null
          booking_id?: string | null
          order_id?: string | null
          rating?: number
          comment?: string | null
          is_verified_purchase?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_service_provider_id_fkey"
            columns: ["service_provider_id"]
            isOneToOne: false
            referencedRelation: "service_providers"
            referencedColumns: ["id"]
          },
        ]
      }
      ngo: {
        Row: {
          id: string
          name: string
          description: string | null
          address: string | null
          city: string | null
          state: string | null
          pincode: string | null
          phone: string | null
          email: string | null
          website: string | null
          image_url: string | null
          mission_statement: string | null
          animals_count: number | null
          adoption_count: number | null
          rating: number | null
          review_count: number | null
          founded_year: number | null
          volunteer_count: number | null
          latitude: number | null
          longitude: number | null
          is_verified: boolean | null
          is_active: boolean | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          image_url?: string | null
          mission_statement?: string | null
          animals_count?: number | null
          adoption_count?: number | null
          rating?: number | null
          review_count?: number | null
          founded_year?: number | null
          volunteer_count?: number | null
          latitude?: number | null
          longitude?: number | null
          is_verified?: boolean | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          pincode?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          image_url?: string | null
          mission_statement?: string | null
          animals_count?: number | null
          adoption_count?: number | null
          rating?: number | null
          review_count?: number | null
          founded_year?: number | null
          volunteer_count?: number | null
          latitude?: number | null
          longitude?: number | null
          is_verified?: boolean | null
          is_active?: boolean | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      shelter_animals: {
        Row: {
          id: string
          ngo_id: string
          name: string
          type: string
          breed: string | null
          age_months: number | null
          gender: string | null
          description: string | null
          image_url: string | null
          health_status: string | null
          vaccination_status: string | null
          neutered_spayed: boolean | null
          adoption_status: string
          admission_date: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          ngo_id: string
          name: string
          type: string
          breed?: string | null
          age_months?: number | null
          gender?: string | null
          description?: string | null
          image_url?: string | null
          health_status?: string | null
          vaccination_status?: string | null
          neutered_spayed?: boolean | null
          adoption_status?: string
          admission_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          ngo_id?: string
          name?: string
          type?: string
          breed?: string | null
          age_months?: number | null
          gender?: string | null
          description?: string | null
          image_url?: string | null
          health_status?: string | null
          vaccination_status?: string | null
          neutered_spayed?: boolean | null
          adoption_status?: string
          admission_date?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "shelter_animals_ngo_id_fkey"
            columns: ["ngo_id"]
            isOneToOne: false
            referencedRelation: "ngo"
            referencedColumns: ["id"]
          },
        ]
      }
      adoption_requests: {
        Row: {
          id: string
          user_id: string | null
          animal_id: string
          ngo_id: string
          status: string
          requested_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id?: string | null
          animal_id: string
          ngo_id: string
          status?: string
          requested_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string | null
          animal_id?: string
          ngo_id?: string
          status?: string
          requested_at?: string
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "adoption_requests_animal_id_fkey"
            columns: ["animal_id"]
            isOneToOne: false
            referencedRelation: "shelter_animals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "adoption_requests_ngo_id_fkey"
            columns: ["ngo_id"]
            isOneToOne: false
            referencedRelation: "ngo"
            referencedColumns: ["id"]
          },
        ]
      }
      donations: {
        Row: {
          id: string
          ngo_id: string
          donor_id: string | null
          amount: number | null
          currency: string | null
          payment_id: string | null
          donation_type: string | null
          description: string | null
          status: string
          created_at: string
        }
        Insert: {
          id?: string
          ngo_id: string
          donor_id?: string | null
          amount?: number | null
          currency?: string | null
          payment_id?: string | null
          donation_type?: string | null
          description?: string | null
          status?: string
          created_at?: string
        }
        Update: {
          id?: string
          ngo_id?: string
          donor_id?: string | null
          amount?: number | null
          currency?: string | null
          payment_id?: string | null
          donation_type?: string | null
          description?: string | null
          status?: string
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "donations_ngo_id_fkey"
            columns: ["ngo_id"]
            isOneToOne: false
            referencedRelation: "ngo"
            referencedColumns: ["id"]
          },
        ]
      }
      sessions: {
        Row: {
          id: string
          user_id: string
          token: string
          expires_at: string
          ip_address: string | null
          user_agent: string | null
          created_at: string
          last_activity: string
        }
        Insert: {
          id?: string
          user_id: string
          token: string
          expires_at: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          last_activity?: string
        }
        Update: {
          id?: string
          user_id?: string
          token?: string
          expires_at?: string
          ip_address?: string | null
          user_agent?: string | null
          created_at?: string
          last_activity?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_provider_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "provider" | "customer"
      booking_status: "pending" | "confirmed" | "completed" | "cancelled"
      payment_status: "pending" | "paid" | "failed" | "refunded"
      service_category: "clinic" | "grooming" | "boarding" | "training"
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
      app_role: ["admin", "provider", "customer"],
      booking_status: ["pending", "confirmed", "completed", "cancelled"],
      payment_status: ["pending", "paid", "failed", "refunded"],
      service_category: ["clinic", "grooming", "boarding", "training"],
    },
  },
} as const
