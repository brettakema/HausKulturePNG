export type EntryCategory = 'song' | 'attire' | 'dance' | 'place';
export type MediaType = 'audio' | 'image' | 'video' | 'link';

export type CulturalEntry = {
  id: string;
  title: string;
  description: string;
  category: EntryCategory;
  province: string;
  community: string;
  language: string;
  media_path: string | null;
  media_url: string | null;
  media_type: MediaType | null;
  lyrics: string | null;
  created_by: string;
  created_at: string;
  status: 'pending' | 'published';
};

export type CulturalEntryRecord = Omit<CulturalEntry, 'media_url' | 'media_path'> & {
  media_path: string | null;
};

export type Database = {
  public: {
    Tables: {
      cultural_entries: {
        Row: CulturalEntryRecord;
        Insert: Omit<CulturalEntryRecord, 'id' | 'created_at'>;
        Update: Partial<Omit<CulturalEntryRecord, 'id' | 'created_at'>>;
        Relationships: [];
      };
      profiles: {
        Row: {
          id: string;
          display_name: string;
          created_at: string;
        };
        Insert: {
          id: string;
          display_name: string;
        };
        Update: {
          display_name?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
