export interface UserStats {
  id: string;
  user_id: string;
  email: string;
  user_level: 'free' | 'premium' | 'admin';
  image_limit: number;
  processed_images: number;
  bg_removal_count: number;
  resize_count: number;
  head_crop_count: number;
  is_admin: boolean;
  created_at: string;
  last_active?: string;
  is_active: boolean;
  groups?: Array<{
    id: string;
    name: string;
  }>;
}

export interface Group {
  id: string;
  name: string;
  description?: string;
  image_limit: number;
  current_month_operations: number;
  current_month_start: string;
  is_active: boolean;
  member_count?: number;
  total_processed?: number;
  created_at: string;
  updated_at: string;
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
  user_level: string;
  processed_images?: number;
  bg_removal_count?: number;
  resize_count?: number;
  head_crop_count?: number;
  last_active?: string;
  joined_at?: string;
}

export interface DashboardStats {
  users: {
    total: number;
    active_today: number;
    active_week: number;
  };
  operations: {
    today: number;
    week: number;
    month: number;
    success_rate: number;
    avg_processing_time_ms: number;
  };
  top_users: Array<{
    email: string;
    total_ops: number;
    user_level: string;
    last_active: string;
  }>;
  operations_breakdown: {
    bg_removal: number;
    resize: number;
    head_crop: number;
  };
  recent_activity: Array<{
    operation_type: string;
    operations_count: number;
    success: boolean;
    created_at: string;
    email: string;
  }>;
  generated_at: string;
}

export interface UserDetailedStats {
  profile: {
    email: string;
    user_level: string;
    image_limit: number;
    created_at: string;
    last_active: string;
  };
  current_month: {
    bg_removal_count: number;
    resize_count: number;
    head_crop_count: number;
    total_operations: number;
    remaining: number;
    month_start: string;
  };
  monthly_history: Array<{
    year_month: string;
    total_operations: number;
    bg_removal_count: number;
    resize_count: number;
    head_crop_count: number;
  }>;
  recent_operations: Array<{
    operation_type: string;
    operations_count: number;
    success: boolean;
    processing_time_ms?: number;
    created_at: string;
  }>;
  groups: Array<{
    name: string;
    image_limit: number;
    current_month_operations: number;
    joined_at: string;
  }>;
}