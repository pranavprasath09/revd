import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/context/AuthContext";
import type { Album, AlbumPhoto, CreateAlbumInput } from "@/types/photo";

export default function usePhotos() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const fetchAlbums = useCallback(async (): Promise<Album[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .eq("is_public", true)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as Album[]) ?? [];
    } catch (err) {
      console.error("Failed to fetch albums:", (err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAlbum = useCallback(async (id: string): Promise<Album | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .eq("id", id)
        .single();

      if (error) throw error;
      return data as Album;
    } catch (err) {
      console.error("Failed to fetch album:", (err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAlbumPhotos = useCallback(async (albumId: string): Promise<AlbumPhoto[]> => {
    try {
      const { data, error } = await supabase
        .from("album_photos")
        .select("*")
        .eq("album_id", albumId)
        .order("order_index", { ascending: true });

      if (error) throw error;
      return (data as AlbumPhoto[]) ?? [];
    } catch (err) {
      console.error("Failed to fetch album photos:", (err as Error).message);
      return [];
    }
  }, []);

  const fetchUserAlbums = useCallback(async (userId: string): Promise<Album[]> => {
    try {
      const { data, error } = await supabase
        .from("albums")
        .select("*")
        .eq("creator_id", userId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as Album[]) ?? [];
    } catch (err) {
      console.error("Failed to fetch user albums:", (err as Error).message);
      return [];
    }
  }, []);

  const createAlbum = useCallback(
    async (input: CreateAlbumInput, photos: File[]): Promise<Album | null> => {
      if (!user) return null;
      // Track uploaded paths for cleanup on failure
      const uploadedPaths: string[] = [];
      let albumId: string | null = null;

      try {
        // Upload photos to Supabase Storage
        const uploadedUrls: string[] = [];
        for (const file of photos) {
          const ext = file.name.split(".").pop();
          const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("photos")
            .upload(path, file);

          if (uploadError) throw uploadError;
          uploadedPaths.push(path);

          const { data: urlData } = supabase.storage
            .from("photos")
            .getPublicUrl(path);

          uploadedUrls.push(urlData.publicUrl);
        }

        // Create album record
        const { data: album, error: albumError } = await supabase
          .from("albums")
          .insert({
            ...input,
            creator_id: user.id,
            cover_image: uploadedUrls[0] || input.cover_image || null,
          })
          .select()
          .single();

        if (albumError) throw albumError;
        albumId = (album as Album).id;

        // Create album_photos records
        if (uploadedUrls.length > 0) {
          const photoRecords = uploadedUrls.map((url, i) => ({
            album_id: albumId!,
            image_url: url,
            order_index: i,
          }));

          const { error: photosError } = await supabase
            .from("album_photos")
            .insert(photoRecords);

          if (photosError) throw photosError;
        }

        return album as Album;
      } catch (err) {
        console.error("Failed to create album:", (err as Error).message);

        // Cleanup: delete album record if created
        if (albumId) {
          await supabase.from("albums").delete().eq("id", albumId).catch(() => {});
        }
        // Cleanup: delete uploaded files
        if (uploadedPaths.length > 0) {
          await supabase.storage.from("photos").remove(uploadedPaths).catch(() => {});
        }

        return null;
      }
    },
    [user]
  );

  const deleteAlbum = useCallback(
    async (albumId: string): Promise<boolean> => {
      if (!user) return false;
      try {
        const { error } = await supabase
          .from("albums")
          .delete()
          .eq("id", albumId)
          .eq("creator_id", user.id);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Failed to delete album:", (err as Error).message);
        return false;
      }
    },
    [user]
  );

  const followUser = useCallback(
    async (followingId: string): Promise<boolean> => {
      if (!user) return false;
      try {
        const { error } = await supabase
          .from("follows")
          .insert({ follower_id: user.id, following_id: followingId });

        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Failed to follow:", (err as Error).message);
        return false;
      }
    },
    [user]
  );

  const unfollowUser = useCallback(
    async (followingId: string): Promise<boolean> => {
      if (!user) return false;
      try {
        const { error } = await supabase
          .from("follows")
          .delete()
          .eq("follower_id", user.id)
          .eq("following_id", followingId);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Failed to unfollow:", (err as Error).message);
        return false;
      }
    },
    [user]
  );

  const isFollowing = useCallback(
    async (followingId: string): Promise<boolean> => {
      if (!user) return false;
      try {
        const { data, error } = await supabase
          .from("follows")
          .select("id")
          .eq("follower_id", user.id)
          .eq("following_id", followingId);

        if (error) throw error;
        return (data?.length ?? 0) > 0;
      } catch (err) {
        console.error("Failed to check follow:", (err as Error).message);
        return false;
      }
    },
    [user]
  );

  const getFollowerCount = useCallback(async (userId: string): Promise<number> => {
    try {
      const { count, error } = await supabase
        .from("follows")
        .select("*", { count: "exact", head: true })
        .eq("following_id", userId);

      if (error) throw error;
      return count ?? 0;
    } catch (err) {
      console.error("Failed to get follower count:", (err as Error).message);
      return 0;
    }
  }, []);

  return {
    loading,
    fetchAlbums,
    fetchAlbum,
    fetchAlbumPhotos,
    fetchUserAlbums,
    createAlbum,
    deleteAlbum,
    followUser,
    unfollowUser,
    isFollowing,
    getFollowerCount,
  };
}
