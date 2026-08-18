export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

type Relationship = {
  foreignKeyName: string;
  columns: string[];
  isOneToOne: boolean;
  referencedRelation: string;
  referencedColumns: string[];
};

type Table<Row, Insert, Update = Partial<Insert>, Relationships extends Relationship[] = []> = {
  Row: Row;
  Insert: Insert;
  Update: Update;
  Relationships: Relationships;
};

type Timestamps = {
  created_at: string;
  updated_at: string;
};

type FamilyRole = "owner" | "editor" | "viewer";
type MemberStatus = "pending" | "active" | "removed";
type MemoryStatus = "draft" | "published" | "archived" | "deleted";
type MediaType = "photo" | "video" | "audio" | "document";

export type Database = {
  public: {
    Tables: {
      profiles: Table<
        Timestamps & {
          id: string;
          display_name: string | null;
          avatar_url: string | null;
          timezone: string;
          locale: string;
          deleted_at: string | null;
        },
        {
          id: string;
          display_name?: string | null;
          avatar_url?: string | null;
          timezone?: string;
          locale?: string;
          deleted_at?: string | null;
        }
      >;
      families: Table<
        Timestamps & {
          id: string;
          name: string;
          slug: string | null;
          created_by: string;
          deleted_at: string | null;
        },
        {
          id?: string;
          name: string;
          slug?: string | null;
          created_by: string;
          deleted_at?: string | null;
        }
      >;
      family_members: Table<
        {
          id: string;
          family_id: string;
          user_id: string;
          role: FamilyRole;
          status: MemberStatus;
          joined_at: string;
          removed_at: string | null;
        },
        {
          id?: string;
          family_id: string;
          user_id: string;
          role?: FamilyRole;
          status?: MemberStatus;
          joined_at?: string;
          removed_at?: string | null;
        }
      >;
      family_invitations: Table<
        {
          id: string;
          family_id: string;
          email: string;
          role: FamilyRole;
          token_hash: string;
          invited_by: string;
          expires_at: string;
          accepted_at: string | null;
          revoked_at: string | null;
          created_at: string;
        },
        {
          id?: string;
          family_id: string;
          email: string;
          role?: FamilyRole;
          token_hash: string;
          invited_by: string;
          expires_at: string;
          accepted_at?: string | null;
          revoked_at?: string | null;
        }
      >;
      children: Table<
        Timestamps & {
          id: string;
          family_id: string;
          name: string;
          birth_date: string | null;
          conception_date: string | null;
          gender: string | null;
          photo_url: string | null;
          journey_type: string;
          created_by: string;
          deleted_at: string | null;
        },
        {
          id?: string;
          family_id: string;
          name: string;
          birth_date?: string | null;
          conception_date?: string | null;
          gender?: string | null;
          photo_url?: string | null;
          journey_type?: string;
          created_by: string;
          deleted_at?: string | null;
        }
      >;
      memories: Table<
        Timestamps & {
          id: string;
          family_id: string;
          child_id: string | null;
          milestone_id: string | null;
          title: string;
          description: string | null;
          memory_date: string;
          memory_time: string | null;
          location: string | null;
          mood: string | null;
          status: MemoryStatus;
          is_favorite: boolean;
          is_private: boolean;
          created_by: string;
          updated_by: string | null;
          version: number;
          deleted_at: string | null;
          purge_after: string | null;
        },
        {
          id?: string;
          family_id: string;
          child_id?: string | null;
          milestone_id?: string | null;
          title: string;
          description?: string | null;
          memory_date: string;
          memory_time?: string | null;
          location?: string | null;
          mood?: string | null;
          status?: MemoryStatus;
          is_favorite?: boolean;
          is_private?: boolean;
          created_by: string;
          updated_by?: string | null;
          version?: number;
          deleted_at?: string | null;
          purge_after?: string | null;
        },
        Partial<{
          id: string;
          family_id: string;
          child_id: string | null;
          milestone_id: string | null;
          title: string;
          description: string | null;
          memory_date: string;
          memory_time: string | null;
          location: string | null;
          mood: string | null;
          status: MemoryStatus;
          is_favorite: boolean;
          is_private: boolean;
          created_by: string;
          updated_by: string | null;
          version: number;
          deleted_at: string | null;
          purge_after: string | null;
        }>
      >;
      memory_media: Table<
        {
          id: string;
          memory_id: string;
          media_type: MediaType;
          provider: string;
          provider_asset_id: string;
          url: string;
          secure_url: string;
          thumbnail_url: string | null;
          file_name: string | null;
          mime_type: string | null;
          bytes: number | null;
          height: number | null;
          width: number | null;
          duration_seconds: number | null;
          metadata: Json;
          sort_order: number;
          created_at: string;
          deleted_at: string | null;
        },
        {
          id?: string;
          memory_id: string;
          media_type: MediaType;
          provider?: string;
          provider_asset_id: string;
          url: string;
          secure_url: string;
          thumbnail_url?: string | null;
          file_name?: string | null;
          mime_type?: string | null;
          bytes?: number | null;
          width?: number | null;
          height?: number | null;
          duration_seconds?: number | null;
          metadata?: Json;
          sort_order?: number;
          deleted_at?: string | null;
        },
        Partial<{
          id: string;
          memory_id: string;
          media_type: MediaType;
          provider: string;
          provider_asset_id: string;
          url: string;
          secure_url: string;
          thumbnail_url: string | null;
          file_name: string | null;
          mime_type: string | null;
          bytes: number | null;
          width: number | null;
          height: number | null;
          duration_seconds: number | null;
          metadata: Json;
          sort_order: number;
          deleted_at: string | null;
        }>,
        [
          {
            foreignKeyName: "memory_media_memory_id_fkey";
            columns: ["memory_id"];
            isOneToOne: false;
            referencedRelation: "memories";
            referencedColumns: ["id"];
          },
        ]
      >;
      collections: Table<
        Timestamps & {
          id: string;
          family_id: string;
          name: string;
          description: string | null;
          cover_media_id: string | null;
          collection_type: "manual" | "year" | "month" | "smart";
          criteria: Json;
          sort_order: number;
          created_by: string;
          deleted_at: string | null;
        },
        {
          id?: string;
          family_id: string;
          name: string;
          description?: string | null;
          cover_media_id?: string | null;
          collection_type?: "manual" | "year" | "month" | "smart";
          criteria?: Json;
          sort_order?: number;
          created_by: string;
          deleted_at?: string | null;
        }
      >;
      memory_collections: Table<
        { collection_id: string; memory_id: string; sort_order: number; added_at: string },
        { collection_id: string; memory_id: string; sort_order?: number; added_at?: string }
      >;
      growth_records: Table<
        Timestamps & {
          id: string;
          child_id: string;
          measurement_date: string;
          height_cm: number | null;
          weight_kg: number | null;
          head_circumference_cm: number | null;
          notes: string | null;
          created_by: string;
        },
        {
          id?: string;
          child_id: string;
          measurement_date: string;
          height_cm?: number | null;
          weight_kg?: number | null;
          head_circumference_cm?: number | null;
          notes?: string | null;
          created_by: string;
        }
      >;
      time_capsules: Table<
        Timestamps & {
          id: string;
          family_id: string;
          child_id: string | null;
          title: string;
          encrypted_content: string;
          encryption_version: number;
          unlock_at: string;
          created_by: string;
          recipient_user_id: string | null;
          deleted_at: string | null;
        },
        {
          id?: string;
          family_id: string;
          child_id?: string | null;
          title: string;
          encrypted_content: string;
          encryption_version?: number;
          unlock_at: string;
          created_by: string;
          recipient_user_id?: string | null;
          deleted_at?: string | null;
        }
      >;
    };
    Views: Record<string, never>;
    Functions: {
      accept_family_invitation: {
        Args: { p_token: string };
        Returns: string;
      };
      create_family_invitation: {
        Args: {
          p_family_id: string;
          p_email: string;
          p_role?: FamilyRole;
        };
        Returns: string;
      };
      get_family_members: {
        Args: { p_family_id: string };
        Returns: {
          id: string;
          user_id: string;
          role: FamilyRole;
          status: MemberStatus;
          joined_at: string | null;
          display_name: string | null;
        }[];
      };
      get_family_invitations: {
        Args: { p_family_id: string };
        Returns: {
          id: string;
          email: string;
          role: FamilyRole;
          expires_at: string;
          created_at: string;
        }[];
      };
      create_family: {
        Args: { p_name: string };
        Returns: Tables<"families">;
      };
      create_child: {
        Args: {
          p_family_id: string;
          p_name: string;
          p_birth_date?: string | null;
          p_conception_date?: string | null;
          p_gender?: string | null;
          p_photo_url?: string | null;
          p_journey_type?: string | null;
        };
        Returns: Tables<"children">;
      };
      get_my_families: {
        Args: Record<string, never>;
        Returns: Tables<"families">[];
      };
      get_family_memories: {
        Args: {
          p_family_id: string;
          p_limit?: number;
          p_offset?: number;
        };
        Returns: Tables<"memories">[];
      };
      create_memory: {
        Args: {
          p_family_id: string;
          p_title: string;
          p_description?: string | null;
          p_memory_date?: string;
          p_memory_time?: string | null;
          p_location?: string | null;
          p_mood?: string | null;
          p_child_id?: string | null;
          p_milestone_id?: string | null;
          p_status?: MemoryStatus;
          p_is_favorite?: boolean;
          p_is_private?: boolean;
        };
        Returns: Tables<"memories">;
      };
      attach_memory_media: {
        Args: {
          p_memory_id: string;
          p_media_type?: MediaType;
          p_provider?: string | null;
          p_provider_asset_id?: string | null;
          p_url?: string | null;
          p_secure_url?: string | null;
          p_thumbnail_url?: string | null;
          p_file_name?: string | null;
          p_mime_type?: string | null;
          p_bytes?: number | null;
          p_width?: number | null;
          p_height?: number | null;
        };
        Returns: Tables<"memory_media">;
      };
      get_memory_for_upload: {
        Args: { p_memory_id: string };
        Returns: { id: string; family_id: string }[];
      };
      get_memory: {
        Args: { p_id: string };
        Returns: Tables<"memories">;
      };
      get_memory_media: {
        Args: { p_memory_id: string };
        Returns: Tables<"memory_media">[];
      };
      get_collection_memories: {
        Args: { p_collection_id: string };
        Returns: Tables<"memories">[];
      };
      get_memory_collection_ids: {
        Args: { p_memory_id: string };
        Returns: string[];
      };
      add_memory_to_collection: {
        Args: { p_collection_id: string; p_memory_id: string };
        Returns: undefined;
      };
      remove_memory_from_collection: {
        Args: { p_collection_id: string; p_memory_id: string };
        Returns: undefined;
      };
      has_family_role: {
        Args: { target_family_id: string; allowed_roles: FamilyRole[] };
        Returns: boolean;
      };
      is_family_member: {
        Args: { target_family_id: string };
        Returns: boolean;
      };
    };
    Enums: {
      family_role: FamilyRole;
      member_status: MemberStatus;
      memory_status: MemoryStatus;
      media_type: MediaType;
      sync_status: "pending" | "syncing" | "synced" | "failed" | "conflict";
      job_status: "pending" | "processing" | "completed" | "failed" | "expired";
    };
    CompositeTypes: Record<string, never>;
  };
};

export type Tables<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Row"];
export type TablesInsert<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof Database["public"]["Tables"]> =
  Database["public"]["Tables"][T]["Update"];
