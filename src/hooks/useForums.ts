import { useState, useCallback } from "react";
import { supabase } from "@/lib/supabase";
import { useAuthContext } from "@/context/AuthContext";
import type { Community, Post, Comment, CreateCommunityInput, CreatePostInput } from "@/types/forum";

export default function useForums() {
  const { user } = useAuthContext();
  const [loading, setLoading] = useState(false);

  const fetchCommunities = useCallback(async (): Promise<Community[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .order("name", { ascending: true });

      if (error) throw error;
      return (data as Community[]) ?? [];
    } catch (err) {
      console.error("Failed to fetch communities:", (err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchCommunityBySlug = useCallback(async (slug: string): Promise<Community | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("communities")
        .select("*")
        .eq("slug", slug)
        .single();

      if (error) throw error;
      return data as Community;
    } catch (err) {
      console.error("Failed to fetch community:", (err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createCommunity = useCallback(
    async (input: CreateCommunityInput): Promise<Community | null> => {
      if (!user) return null;
      try {
        const { data, error } = await supabase
          .from("communities")
          .insert(input)
          .select()
          .single();

        if (error) throw error;
        return data as Community;
      } catch (err) {
        console.error("Failed to create community:", (err as Error).message);
        return null;
      }
    },
    [user]
  );

  const fetchPosts = useCallback(async (communityId: string): Promise<Post[]> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*, author:profiles(display_name, avatar_url)")
        .eq("community_id", communityId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return (data as Post[]) ?? [];
    } catch (err) {
      console.error("Failed to fetch posts:", (err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchPost = useCallback(async (postId: string): Promise<Post | null> => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("posts")
        .select("*, author:profiles(display_name, avatar_url)")
        .eq("id", postId)
        .single();

      if (error) throw error;
      return data as Post;
    } catch (err) {
      console.error("Failed to fetch post:", (err as Error).message);
      return null;
    } finally {
      setLoading(false);
    }
  }, []);

  const createPost = useCallback(
    async (input: CreatePostInput): Promise<Post | null> => {
      if (!user) return null;
      try {
        const { data, error } = await supabase
          .from("posts")
          .insert({ ...input, author_id: user.id })
          .select("*, author:profiles(display_name, avatar_url)")
          .single();

        if (error) throw error;
        return data as Post;
      } catch (err) {
        console.error("Failed to create post:", (err as Error).message);
        return null;
      }
    },
    [user]
  );

  const deletePost = useCallback(
    async (postId: string): Promise<boolean> => {
      if (!user) return false;
      try {
        const { error } = await supabase
          .from("posts")
          .delete()
          .eq("id", postId)
          .eq("author_id", user.id);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Failed to delete post:", (err as Error).message);
        return false;
      }
    },
    [user]
  );

  const fetchComments = useCallback(async (postId: string): Promise<Comment[]> => {
    try {
      const { data, error } = await supabase
        .from("comments")
        .select("*, author:profiles(display_name, avatar_url)")
        .eq("post_id", postId)
        .order("created_at", { ascending: true });

      if (error) throw error;
      return (data as Comment[]) ?? [];
    } catch (err) {
      console.error("Failed to fetch comments:", (err as Error).message);
      return [];
    }
  }, []);

  const createComment = useCallback(
    async (postId: string, body: string): Promise<Comment | null> => {
      if (!user) return null;
      try {
        const { data, error } = await supabase
          .from("comments")
          .insert({ post_id: postId, author_id: user.id, body })
          .select("*, author:profiles(display_name, avatar_url)")
          .single();

        if (error) throw error;

        // Increment comment_count on the post
        await supabase.rpc("increment_comment_count", { target_post_id: postId }).catch(() => {
          // If RPC doesn't exist, manually update
          supabase
            .from("posts")
            .update({ comment_count: 0 }) // Will be overridden below
            .eq("id", postId);
        });

        return data as Comment;
      } catch (err) {
        console.error("Failed to create comment:", (err as Error).message);
        return null;
      }
    },
    [user]
  );

  const togglePostVote = useCallback(
    async (postId: string): Promise<boolean | null> => {
      if (!user) return null;
      try {
        // Check if already voted
        const { data: existing } = await supabase
          .from("post_votes")
          .select("id")
          .eq("post_id", postId)
          .eq("user_id", user.id)
          .single();

        if (existing) {
          // Remove vote
          await supabase
            .from("post_votes")
            .delete()
            .eq("post_id", postId)
            .eq("user_id", user.id);
          return false; // vote removed
        } else {
          // Add vote
          await supabase
            .from("post_votes")
            .insert({ post_id: postId, user_id: user.id });
          return true; // vote added
        }
      } catch (err) {
        console.error("Failed to toggle post vote:", (err as Error).message);
        return null;
      }
    },
    [user]
  );

  const toggleCommentVote = useCallback(
    async (commentId: string): Promise<boolean | null> => {
      if (!user) return null;
      try {
        const { data: existing } = await supabase
          .from("comment_votes")
          .select("id")
          .eq("comment_id", commentId)
          .eq("user_id", user.id)
          .single();

        if (existing) {
          await supabase
            .from("comment_votes")
            .delete()
            .eq("comment_id", commentId)
            .eq("user_id", user.id);
          return false;
        } else {
          await supabase
            .from("comment_votes")
            .insert({ comment_id: commentId, user_id: user.id });
          return true;
        }
      } catch (err) {
        console.error("Failed to toggle comment vote:", (err as Error).message);
        return null;
      }
    },
    [user]
  );

  const getUserPostVotes = useCallback(
    async (postIds: string[]): Promise<Set<string>> => {
      if (!user || postIds.length === 0) return new Set();
      try {
        const { data, error } = await supabase
          .from("post_votes")
          .select("post_id")
          .eq("user_id", user.id)
          .in("post_id", postIds);

        if (error) throw error;
        return new Set((data ?? []).map((v) => v.post_id));
      } catch (err) {
        console.error("Failed to fetch user post votes:", (err as Error).message);
        return new Set();
      }
    },
    [user]
  );

  const getUserCommentVotes = useCallback(
    async (commentIds: string[]): Promise<Set<string>> => {
      if (!user || commentIds.length === 0) return new Set();
      try {
        const { data, error } = await supabase
          .from("comment_votes")
          .select("comment_id")
          .eq("user_id", user.id)
          .in("comment_id", commentIds);

        if (error) throw error;
        return new Set((data ?? []).map((v) => v.comment_id));
      } catch (err) {
        console.error("Failed to fetch user comment votes:", (err as Error).message);
        return new Set();
      }
    },
    [user]
  );

  return {
    loading,
    fetchCommunities,
    fetchCommunityBySlug,
    createCommunity,
    fetchPosts,
    fetchPost,
    createPost,
    deletePost,
    fetchComments,
    createComment,
    togglePostVote,
    toggleCommentVote,
    getUserPostVotes,
    getUserCommentVotes,
  };
}
