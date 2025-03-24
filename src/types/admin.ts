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