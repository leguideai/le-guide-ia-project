export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          email: string | null
          whatsapp: string | null
          country: string | null
          city: string | null
          sector: string | null
          role: 'student' | 'admin' | 'instructor'
          avatar_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id: string
          full_name?: string | null
          email?: string | null
          whatsapp?: string | null
          country?: string | null
          city?: string | null
          sector?: string | null
          role?: 'student' | 'admin' | 'instructor'
          avatar_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          full_name?: string | null
          email?: string | null
          whatsapp?: string | null
          country?: string | null
          city?: string | null
          sector?: string | null
          role?: 'student' | 'admin' | 'instructor'
          avatar_url?: string | null
          updated_at?: string
        }
      }
      registrations: {
        Row: {
          id: string
          full_name: string
          email: string
          whatsapp: string
          country: string | null
          profil: string | null
          source: string | null
          status: 'inscrit' | 'chaud' | 'paye' | 'inactif'
          notes: string | null
          created_at: string
        }
        Insert: {
          id?: string
          full_name: string
          email: string
          whatsapp: string
          country?: string | null
          profil?: string | null
          source?: string | null
          status?: 'inscrit' | 'chaud' | 'paye' | 'inactif'
          notes?: string | null
          created_at?: string
        }
        Update: {
          full_name?: string
          email?: string
          whatsapp?: string
          country?: string | null
          profil?: string | null
          source?: string | null
          status?: 'inscrit' | 'chaud' | 'paye' | 'inactif'
          notes?: string | null
        }
      }
      payments: {
        Row: {
          id: string
          registration_id: string | null
          user_id: string | null
          amount: number | null
          currency: string | null
          method: string
          status: 'pending' | 'confirmed' | 'failed'
          transaction_ref: string | null
          confirmed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          registration_id?: string | null
          user_id?: string | null
          amount?: number | null
          currency?: string | null
          method: string
          status?: 'pending' | 'confirmed' | 'failed'
          transaction_ref?: string | null
          confirmed_at?: string | null
          created_at?: string
        }
        Update: {
          registration_id?: string | null
          user_id?: string | null
          amount?: number | null
          currency?: string | null
          method?: string
          status?: 'pending' | 'confirmed' | 'failed'
          transaction_ref?: string | null
          confirmed_at?: string | null
        }
      }
      courses: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          thumbnail_url: string | null
          price: number
          currency: string
          is_published: boolean
          is_free: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          thumbnail_url?: string | null
          price?: number
          currency?: string
          is_published?: boolean
          is_free?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          title?: string
          slug?: string
          description?: string | null
          thumbnail_url?: string | null
          price?: number
          currency?: string
          is_published?: boolean
          is_free?: boolean
          updated_at?: string
        }
      }
      modules: {
        Row: {
          id: string
          course_id: string
          title: string
          description: string | null
          position: number
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          course_id: string
          title: string
          description?: string | null
          position?: number
          is_published?: boolean
          created_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          position?: number
          is_published?: boolean
        }
      }
      lessons: {
        Row: {
          id: string
          module_id: string
          title: string
          description: string | null
          video_url: string | null
          video_duration: number | null
          pdf_url: string | null
          position: number
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          module_id: string
          title: string
          description?: string | null
          video_url?: string | null
          video_duration?: number | null
          pdf_url?: string | null
          position?: number
          is_published?: boolean
          created_at?: string
        }
        Update: {
          title?: string
          description?: string | null
          video_url?: string | null
          video_duration?: number | null
          pdf_url?: string | null
          position?: number
          is_published?: boolean
        }
      }
      user_courses: {
        Row: {
          id: string
          user_id: string
          course_id: string
          payment_id: string | null
          enrolled_at: string
          expires_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          payment_id?: string | null
          enrolled_at?: string
          expires_at?: string | null
        }
        Update: { expires_at?: string | null }
      }
      user_progress: {
        Row: {
          id: string
          user_id: string
          lesson_id: string
          completed: boolean
          watch_time: number
          last_watched_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          lesson_id: string
          completed?: boolean
          watch_time?: number
          last_watched_at?: string | null
          created_at?: string
        }
        Update: {
          completed?: boolean
          watch_time?: number
          last_watched_at?: string | null
        }
      }
      certificates: {
        Row: {
          id: string
          user_id: string
          course_id: string
          issued_at: string
          certificate_url: string | null
          share_token: string
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          issued_at?: string
          certificate_url?: string | null
          share_token?: string
        }
        Update: { certificate_url?: string | null }
      }
      resources: {
        Row: {
          id: string
          title: string
          slug: string
          description: string | null
          category: string | null
          file_url: string | null
          thumbnail_url: string | null
          is_free: boolean
          download_count: number
          is_published: boolean
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          description?: string | null
          category?: string | null
          file_url?: string | null
          thumbnail_url?: string | null
          is_free?: boolean
          download_count?: number
          is_published?: boolean
          created_at?: string
        }
        Update: {
          title?: string
          slug?: string
          description?: string | null
          category?: string | null
          file_url?: string | null
          thumbnail_url?: string | null
          is_free?: boolean
          is_published?: boolean
        }
      }
      posts: {
        Row: {
          id: string
          title: string
          slug: string
          excerpt: string | null
          content: string | null
          thumbnail_url: string | null
          category: string | null
          author_id: string | null
          is_published: boolean
          published_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          title: string
          slug: string
          excerpt?: string | null
          content?: string | null
          thumbnail_url?: string | null
          category?: string | null
          author_id?: string | null
          is_published?: boolean
          published_at?: string | null
          created_at?: string
        }
        Update: {
          title?: string
          slug?: string
          excerpt?: string | null
          content?: string | null
          thumbnail_url?: string | null
          category?: string | null
          is_published?: boolean
          published_at?: string | null
        }
      }
      newsletter_subscribers: {
        Row: {
          id: string
          email: string
          name: string | null
          status: 'active' | 'unsubscribed'
          subscribed_at: string
        }
        Insert: {
          id?: string
          email: string
          name?: string | null
          status?: 'active' | 'unsubscribed'
          subscribed_at?: string
        }
        Update: { name?: string | null; status?: 'active' | 'unsubscribed' }
      }
      service_requests: {
        Row: {
          id: string
          company_name: string | null
          contact_name: string
          email: string
          phone: string | null
          company_size: string | null
          sector: string | null
          service_type: string | null
          participants: number | null
          budget: string | null
          timeline: string | null
          message: string | null
          status: 'new' | 'contacted' | 'quoted' | 'won' | 'lost'
          assigned_to: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_name?: string | null
          contact_name: string
          email: string
          phone?: string | null
          company_size?: string | null
          sector?: string | null
          service_type?: string | null
          participants?: number | null
          budget?: string | null
          timeline?: string | null
          message?: string | null
          status?: 'new' | 'contacted' | 'quoted' | 'won' | 'lost'
          assigned_to?: string | null
          created_at?: string
        }
        Update: {
          status?: 'new' | 'contacted' | 'quoted' | 'won' | 'lost'
          assigned_to?: string | null
        }
      }
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: Record<string, never>
  }
}
