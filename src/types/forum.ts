export interface Community {
  id: string;
  creator_id: string | null;
  name: string;
  slug: string;
  description: string | null;
  icon: string | null;
  banner_image: string | null;
  member_count: number;
  created_at: string;
}

export interface Post {
  id: string;
  community_id: string;
  author_id: string;
  title: string;
  body: string | null;
  image_url: string | null;
  upvotes: number;
  comment_count: number;
  created_at: string;
  // Joined fields
  author?: { display_name: string | null; avatar_url: string | null };
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  upvotes: number;
  created_at: string;
  // Joined fields
  author?: { display_name: string | null; avatar_url: string | null };
}

export interface CreateCommunityInput {
  name: string;
  slug: string;
  description?: string;
  icon?: string;
}

export interface CreatePostInput {
  community_id: string;
  title: string;
  body?: string;
  image_url?: string;
}
