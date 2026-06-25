import { useState, useCallback } from "react";
import { supabase, isMissingColumn } from "@/lib/supabase";
import { useAuthContext } from "@/context/AuthContext";
import type {
  BuildLog,
  BuildEntry,
  CreateBuildLogInput,
  CreateBuildEntryInput,
} from "@/types/buildlog";
import { notifyOnBuildLike } from "@/lib/notifications";
import { prepareImageForUpload } from "@/lib/upload";

const BUILD_LOG_BASE_COLUMNS =
  "id, owner_id, car_id, title, description, is_public, total_cost, created_at, updated_at";
// like_count / entry_count are migration-015 counters; selected when present.
const BUILD_LOG_COLUMNS = `${BUILD_LOG_BASE_COLUMNS}, like_count, entry_count`;
const BUILD_ENTRY_COLUMNS =
  "id, build_log_id, title, body, cost, entry_date, images, created_at";
// Most entries a build-detail page will render before it's clearly abusive.
const MAX_ENTRIES = 200;
// File size is validated by validateImageFile in upload.ts

export default function useBuildLogs() {
  const { user } = useAuthContext();
  // Starts true: consumers fetch on mount; false flashed the empty state first
  const [loading, setLoading] = useState(true);

  // ─── Fetch all public build logs ───────────────────────────
  const fetchBuildLogs = useCallback(async (): Promise<BuildLog[]> => {
    setLoading(true);
    try {
      const run = (cols: string) =>
        supabase
          .from("build_logs")
          .select(cols)
          .eq("is_public", true)
          .order("created_at", { ascending: false })
          .limit(50);

      let { data, error } = await run(BUILD_LOG_COLUMNS);
      if (error && isMissingColumn(error)) ({ data, error } = await run(BUILD_LOG_BASE_COLUMNS));

      if (error) throw error;
      return (data as unknown as BuildLog[]) ?? [];
    } catch (err) {
      console.error("Failed to fetch build logs:", (err as Error).message);
      return [];
    } finally {
      setLoading(false);
    }
  }, []);

  // ─── Fetch single build log ────────────────────────────────
  const fetchBuildLog = useCallback(
    async (id: string): Promise<BuildLog | null> => {
      try {
        const run = (cols: string) =>
          supabase.from("build_logs").select(cols).eq("id", id).single();

        let { data, error } = await run(BUILD_LOG_COLUMNS);
        if (error && isMissingColumn(error)) ({ data, error } = await run(BUILD_LOG_BASE_COLUMNS));

        if (error) throw error;
        return data as unknown as BuildLog;
      } catch (err) {
        console.error("Failed to fetch build log:", (err as Error).message);
        return null;
      }
    },
    []
  );

  // ─── Fetch entries for a build log ─────────────────────────
  const fetchEntries = useCallback(
    async (buildLogId: string): Promise<BuildEntry[]> => {
      try {
        const { data, error } = await supabase
          .from("build_entries")
          .select(BUILD_ENTRY_COLUMNS)
          .eq("build_log_id", buildLogId)
          .order("entry_date", { ascending: false })
          .limit(MAX_ENTRIES);

        if (error) throw error;
        return (data as BuildEntry[]) ?? [];
      } catch (err) {
        console.error("Failed to fetch entries:", (err as Error).message);
        return [];
      }
    },
    []
  );

  // ─── Create build log ─────────────────────────────────────
  const createBuildLog = useCallback(
    async (
      input: CreateBuildLogInput
    ): Promise<{ data: BuildLog | null; error?: string }> => {
      if (!user) return { data: null, error: "Not signed in" };
      try {
        // Base columns only: a freshly inserted log has no counts to read, and
        // this stays valid whether or not migration 015 has added the counters.
        const { data, error } = await supabase
          .from("build_logs")
          .insert({ ...input, owner_id: user.id })
          .select(BUILD_LOG_BASE_COLUMNS)
          .single();

        if (error) throw error;
        return { data: data as BuildLog };
      } catch (err) {
        console.error("Failed to create build log:", (err as Error).message);
        return { data: null, error: (err as Error).message };
      }
    },
    [user]
  );

  // ─── Add entry with image uploads ──────────────────────────
  const addEntry = useCallback(
    async (
      input: CreateBuildEntryInput,
      photos: File[]
    ): Promise<{ data: BuildEntry | null; error?: string }> => {
      if (!user) return { data: null, error: "Not signed in" };

      // Validate + downscale (max 2048px edge, WebP) before upload
      const prepared: File[] = [];
      for (const file of photos) {
        try {
          prepared.push(await prepareImageForUpload(file));
        } catch (err) {
          return { data: null, error: (err as Error).message };
        }
      }

      const uploadedPaths: string[] = [];
      const uploadedUrls: string[] = [];

      try {
        // Upload images
        for (const file of prepared) {
          const ext = file.name.split(".").pop();
          const path = `${user.id}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
          const { error: uploadError } = await supabase.storage
            .from("builds")
            .upload(path, file);

          if (uploadError) throw uploadError;
          uploadedPaths.push(path);

          const { data: urlData } = supabase.storage
            .from("builds")
            .getPublicUrl(path);

          if (!urlData?.publicUrl)
            throw new Error("Failed to get public URL for uploaded photo");
          uploadedUrls.push(urlData.publicUrl);
        }

        // Insert entry
        const { data, error } = await supabase
          .from("build_entries")
          .insert({
            ...input,
            images: uploadedUrls,
          })
          .select(BUILD_ENTRY_COLUMNS)
          .single();

        if (error) throw error;

        // Update total_cost via SECURITY DEFINER RPC
        if (input.cost && input.cost > 0) {
          await supabase.rpc("increment_build_cost", {
            log_id: input.build_log_id,
            amount: input.cost,
          });
        }

        return { data: data as BuildEntry };
      } catch (err) {
        console.error("Failed to add entry:", (err as Error).message);
        // Cleanup uploaded files
        if (uploadedPaths.length > 0) {
          await supabase.storage
            .from("builds")
            .remove(uploadedPaths)
            .catch(() => {});
        }
        return { data: null, error: (err as Error).message };
      }
    },
    [user]
  );

  // ─── Delete build log ──────────────────────────────────────
  const deleteBuildLog = useCallback(
    async (id: string): Promise<boolean> => {
      if (!user) return false;
      try {
        const { error } = await supabase
          .from("build_logs")
          .delete()
          .eq("id", id)
          .eq("owner_id", user.id);

        if (error) throw error;
        return true;
      } catch (err) {
        console.error("Failed to delete build log:", (err as Error).message);
        return false;
      }
    },
    [user]
  );

  // ─── Like / Unlike ─────────────────────────────────────────
  const toggleLike = useCallback(
    async (buildLogId: string): Promise<boolean> => {
      if (!user) return false;
      try {
        const { data: existing } = await supabase
          .from("build_likes")
          .select("id")
          .eq("build_log_id", buildLogId)
          .eq("user_id", user.id)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("build_likes")
            .delete()
            .eq("id", existing.id);
        } else {
          await supabase
            .from("build_likes")
            .insert({ build_log_id: buildLogId, user_id: user.id });

          // Notify build owner via trusted RPC (non-blocking)
          notifyOnBuildLike(buildLogId).catch(() => {});
        }
        return true;
      } catch (err) {
        console.error("Failed to toggle like:", (err as Error).message);
        return false;
      }
    },
    [user]
  );

  // ─── Get like count + user liked status ────────────────────
  const getLikeInfo = useCallback(
    async (
      buildLogId: string
    ): Promise<{ count: number; liked: boolean }> => {
      try {
        const { count } = await supabase
          .from("build_likes")
          .select("*", { count: "exact", head: true })
          .eq("build_log_id", buildLogId);

        let liked = false;
        if (user) {
          const { data } = await supabase
            .from("build_likes")
            .select("id")
            .eq("build_log_id", buildLogId)
            .eq("user_id", user.id)
            .maybeSingle();
          liked = !!data;
        }

        return { count: count ?? 0, liked };
      } catch (err) {
        console.error("Failed to get like info:", (err as Error).message);
        return { count: 0, liked: false };
      }
    },
    [user]
  );

  // ─── Get entry count for a build log ───────────────────────
  const getEntryCount = useCallback(
    async (buildLogId: string): Promise<number> => {
      try {
        const { count } = await supabase
          .from("build_entries")
          .select("*", { count: "exact", head: true })
          .eq("build_log_id", buildLogId);
        return count ?? 0;
      } catch {
        return 0;
      }
    },
    []
  );

  return {
    loading,
    fetchBuildLogs,
    fetchBuildLog,
    fetchEntries,
    createBuildLog,
    addEntry,
    deleteBuildLog,
    toggleLike,
    getLikeInfo,
    getEntryCount,
  };
}
