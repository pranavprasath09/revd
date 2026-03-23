import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAuthContext } from "@/context/AuthContext";
import useForums from "@/hooks/useForums";
import type { Community } from "@/types/forum";

function CommunityCard({ community, isPremiumUser }: { community: Community; isPremiumUser: boolean }) {
  const locked = community.is_premium_only && !isPremiumUser;

  return (
    <Link
      to={locked ? "/premium" : `/communities/${community.slug}`}
      className={`group rounded-xl border bg-bg-surface p-6 transition-all duration-300 hover:shadow-lg ${
        locked
          ? "border-accent-red/20 opacity-80 hover:border-accent-red/40 hover:shadow-accent-red/5"
          : "border-border hover:border-accent-red/30 hover:shadow-accent-red/5"
      }`}
    >
      <div className="flex items-start gap-4">
        {/* Icon */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-bg-elevated border border-border text-2xl">
          {locked ? (
            <svg className="h-6 w-6 text-accent-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z" />
            </svg>
          ) : (
            community.icon || "💬"
          )}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-display text-xl uppercase tracking-wide text-text-primary leading-tight group-hover:text-accent-red transition-colors">
              {community.name}
            </h3>
            {community.is_premium_only && (
              <span className="rounded-full bg-accent-red/10 px-2 py-0.5 font-body text-[9px] font-bold uppercase tracking-wider text-accent-red">
                PRO
              </span>
            )}
          </div>
          {community.description && (
            <p className="mt-1.5 font-body text-sm text-text-secondary leading-relaxed line-clamp-2">
              {community.description}
            </p>
          )}
          <div className="mt-3 flex items-center gap-1.5">
            <svg
              className="h-3.5 w-3.5 text-text-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="font-mono text-xs font-bold text-text-muted">
              {community.member_count} members
            </span>
          </div>
        </div>
      </div>
    </Link>
  );
}

export default function CommunitiesPage() {
  const { user, isPremium } = useAuthContext();
  const { loading, fetchCommunities } = useForums();
  const [communities, setCommunities] = useState<Community[]>([]);

  useEffect(() => {
    fetchCommunities().then(setCommunities);
  }, [fetchCommunities]);

  return (
    <div className="page-enter">
      <SEOHead
        title="Communities"
        description="Join car communities on RevD. JDM, European, American Muscle, and more."
        canonicalUrl="https://revhub.com/communities"
      />

      {/* Header */}
      <div className="border-b border-border bg-bg-surface/50">
        <PageWrapper>
          <div className="py-10 sm:py-14">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="font-body text-[11px] font-bold uppercase tracking-widest text-accent-red mb-3">
                  Forums
                </p>
                <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wide text-text-primary leading-none">
                  Communities
                </h1>
                <p className="font-body mt-3 max-w-2xl text-base text-text-secondary leading-relaxed">
                  Find your people. Join a community, start a conversation, and connect with enthusiasts who share your passion.
                </p>
              </div>

              {user && (
                <Link
                  to="/communities/create"
                  className="shrink-0 inline-flex items-center gap-2 rounded-lg bg-accent-red px-5 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
                >
                  <svg
                    className="h-4 w-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                  </svg>
                  Create Community
                </Link>
              )}
            </div>
          </div>
        </PageWrapper>
      </div>

      {/* Content */}
      <PageWrapper>
        <div className="py-8">
          {loading ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div
                  key={i}
                  className="h-36 animate-pulse rounded-xl bg-bg-surface"
                />
              ))}
            </div>
          ) : communities.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {communities.map((community) => (
                <CommunityCard key={community.id} community={community} isPremiumUser={isPremium} />
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-bg-surface border border-border">
                <span className="text-3xl">💬</span>
              </div>
              <h2 className="font-display text-2xl uppercase tracking-wide text-text-primary mb-2">
                No Communities Yet
              </h2>
              <p className="font-body text-sm text-text-secondary max-w-md">
                Communities are coming soon. Check back later.
              </p>
            </div>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}
