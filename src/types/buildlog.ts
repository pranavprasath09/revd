export interface BuildLog {
  id: string;
  owner_id: string;
  car_id: string;
  title: string;
  description: string | null;
  is_public: boolean;
  total_cost: number;
  created_at: string;
  updated_at: string;
}

export interface BuildEntry {
  id: string;
  build_log_id: string;
  title: string;
  body: string | null;
  cost: number;
  entry_date: string;
  images: string[];
  created_at: string;
}

export interface BuildLike {
  id: string;
  build_log_id: string;
  user_id: string;
}

export interface CreateBuildLogInput {
  car_id: string;
  title: string;
  description?: string;
  is_public?: boolean;
}

export interface CreateBuildEntryInput {
  build_log_id: string;
  title: string;
  body?: string;
  cost?: number;
  entry_date?: string;
}
