import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import { useAuthContext } from "@/context/AuthContext";
import useForums from "@/hooks/useForums";
import { supabase } from "@/lib/supabase";
import PWButton, { ToggleButton } from "@/components/pitwall/Button";
import { PullQuote } from "@/components/margin/SectionRule";
import type { Community } from "@/types/forum";

interface TopPost {
  title: string;
  upvotes: number;
  comment_count: number;
  community_id: string;
}

export default function CommunitiesPage() {
  const { user, isPremium } = useAuthContext();
  const navigate = useNavigate();
  const { loading, fetchCommunities, joinCommunity, leaveCommunity } = useForums();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [joined, setJoined] = useState<Set<string>>(new Set());
  const [topPost, setTopPost] = useState<TopPost | null>(null);

  useEffect(() => {
    fetchCommunities().then(setCommunities);
  }, [fetchCommunities]);

  // One query for the user's memberships across every room
  useEffect(() => {
    if (!user || communities.length === 0) return;
    let stale = false;
    supabase
      .from("community_members")
      .select("community_id")
      .eq("user_id", user.id)
      .in("community_id", communities.map((c) => c.id))
      .then(({ data }) => {
        if (!stale && data) setJoined(new Set(data.map((m) => m.community_id)));
      });
    return () => {
      stale = true;
    };
  }, [user, communities]);

  // Most argued over — the highest-voted post on file
  useEffect(() => {
    let stale = false;
    supabase
      .from("posts")
      .select("title, upvotes, comment_count, community_id")
      .order("upvotes", { ascending: false })
      .limit(1)
      .then(({ data }) => {
        if (!stale && data?.[0]) setTopPost(data[0] as TopPost);
      });
    return () => {
      stale = true;
    };
  }, []);

  const toggleJoin = async (community: Community) => {
    if (!user) {
      navigate("/sign-in?redirect=/communities");
      return;
    }
    const isIn = joined.has(community.id);
    // Optimistic — update immediately, revert on error
    setJoined((prev) => {
      const next = new Set(prev);
      if (isIn) next.delete(community.id);
      else next.add(community.id);
      return next;
    });
    const ok = isIn
      ? await leaveCommunity(community.id)
      : await joinCommunity(community.id);
    if (!ok) {
      setJoined((prev) => {
        const next = new Set(prev);
        if (isIn) next.add(community.id);
        else next.delete(community.id);
        return next;
      });
    }
  };

  const topPostRoom = topPost
    ? communities.find((c) => c.id === topPost.community_id)
    : null;

  return (
    <div className="page-enter px-6 pb-[72px] pt-12 md:px-14">
      <SEOHead
        title="Communities"
        description="Join car communities on RevD. JDM, European, American Muscle, and more."
        canonicalUrl="https://revhub.com/communities"
      />

      <div className="grid items-start gap-14 lg:grid-cols-[1fr_380px]">
        {/* Department list */}
        <div>
          <div className="border-b border-accent pb-[18px]">
            <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-accent">
              Forums
            </div>
            <h1 className="mt-2.5 font-editorial text-[44px] font-normal leading-none tracking-[-0.015em] text-text-primary md:text-[66px]">
              Departments
            </h1>
            <p
              className="mt-4 max-w-[520px] text-base leading-[1.65] text-text-secondary"
              style={{ textWrap: "pretty" }}
            >
              Find your people. Every room has its own weather.
            </p>
          </div>

          {loading ? (
            <div className="space-y-px py-6">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-24 animate-pulse bg-bg-surface" />
              ))}
            </div>
          ) : communities.length === 0 ? (
            <p className="py-10 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              No departments founded yet
            </p>
          ) : (
            communities.map((c, i) => {
              const locked = c.is_premium_only && !isPremium;
              const isIn = joined.has(c.id);
              return (
                <div
                  key={c.id}
                  onClick={() =>
                    navigate(locked ? "/premium" : `/communities/${c.slug}`)
                  }
                  className="grid cursor-pointer grid-cols-[52px_1fr] items-start gap-y-2 border-b border-border-alpha py-6 md:grid-cols-[52px_1fr_132px_128px]"
                >
                  <span className="pt-2.5 font-mono text-[10px] text-text-muted">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex min-w-0 flex-col gap-1.5 md:pr-7">
                    <span className="flex items-baseline gap-3">
                      <span className="font-editorial text-[24px] leading-[1.1] text-text-primary transition-colors duration-150 hover:text-accent md:text-[30px]">
                        {c.name}
                      </span>
                      {c.is_premium_only && (
                        <span className="border border-accent px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-[0.18em] text-accent">
                          Pro
                        </span>
                      )}
                    </span>
                    {c.description && (
                      <span className="font-editorial text-[15px] italic leading-[1.5] text-text-secondary">
                        {c.description}
                      </span>
                    )}
                    <span className="font-mono text-[10px] tracking-[0.12em] text-text-muted">
                      r/{c.slug}
                    </span>
                  </span>
                  <span className="pt-2.5 font-mono text-xs text-text-secondary max-md:hidden">
                    {c.member_count.toLocaleString()} members
                  </span>
                  <span
                    className="flex pt-1.5 md:justify-end"
                    onClick={(e) => e.stopPropagation()}
                  >
                    {locked ? (
                      <Link to="/premium">
                        <PWButton variant="secondary">Unlock</PWButton>
                      </Link>
                    ) : (
                      <ToggleButton on={isIn} onClick={() => toggleJoin(c)}>
                        {isIn ? "Joined" : "Join"}
                      </ToggleButton>
                    )}
                  </span>
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar */}
        <div className="border-border-alpha lg:border-l lg:pl-9">
          {topPost && (
            <>
              <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-accent">
                Most argued over
              </div>
              <div className="mt-5">
                <PullQuote
                  attribution={`${topPostRoom ? `r/${topPostRoom.slug} · ` : ""}${topPost.upvotes} votes · ${topPost.comment_count} replies`}
                >
                  “{topPost.title}”
                </PullQuote>
              </div>
            </>
          )}
          <div
            className={`${topPost ? "mt-8 border-t border-border-alpha pt-6" : ""}`}
          >
            <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-text-secondary">
              Your rooms
            </div>
            <p className="mt-3 font-editorial text-[22px] text-text-primary">
              {user
                ? `${joined.size} of ${communities.length} joined`
                : "Sign in to join"}
            </p>
          </div>
          <Link
            to={user ? "/communities/create" : "/sign-in?redirect=/communities/create"}
            className="mt-7 block"
          >
            <PWButton variant="secondary" className="w-full">
              Found a department
            </PWButton>
          </Link>
        </div>
      </div>
    </div>
  );
}
