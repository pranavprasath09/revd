export interface Album {
  id: string;
  creator_id: string;
  title: string;
  description: string | null;
  cover_image: string | null;
  car_tags: string[];
  is_public: boolean;
  created_at: string;
}

export interface AlbumPhoto {
  id: string;
  album_id: string;
  image_url: string;
  caption: string | null;
  car_tag: string | null;
  order_index: number;
  created_at: string;
}

export interface Follow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
}

export interface CreateAlbumInput {
  title: string;
  description?: string;
  cover_image?: string;
  car_tags?: string[];
  is_public?: boolean;
}
