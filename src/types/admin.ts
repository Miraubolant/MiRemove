export interface UserStats {
  id: string;
  user_id: string;
  email: string;
  processed_images: number;
  success_count: number;
  failure_count: number;
  total_processing_time: number;
  is_admin: boolean;
  created_at: string;
  resize_count: number;
  ai_count: number;
  crop_head_count: number;
  all_processing_count: number;
  resize_processing_time: number;
  ai_processing_time: number;
  crop_head_processing_time: number;
  all_processing_time: number;
  groups?: Array<{
    id: string;
    name: string;
  }>;
}

export interface Group {
  id: string;
  name: string;
  image_limit: number;
  member_count?: number;
  total_processed?: number;
  stats?: {
    success_rate?: number;
    avg_processing_time?: number;
    total_processing_time?: number;
    operations?: {
      resize: { count: number; time: number };
      ai: { count: number; time: number };
      crop_head: { count: number; time: number };
      all: { count: number; time: number };
    };
  };
}

export interface GroupMember {
  id: string;
  user_id: string;
  email: string;
  processed_images?: number;
  success_rate?: number;
  avg_processing_time?: number;
  total_processing_time?: number;
}