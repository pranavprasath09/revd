import { useEffect, useMemo, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import { useAuthContext } from "@/context/AuthContext";
import useMeets from "@/hooks/useMeets";
import { supabase } from "@/lib/supabase";
import PWButton, { ToggleButton } from "@/components/pitwall/Button";
import type { Meet } from "@/types/meet";

const MEET_TYPES = ["All", "Cars & Coffee", "Track Day", "Cruise", "Show", "Private"];

const fallbackImage =
  "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80";

const MONTH_NAMES = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

function meetDay(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return {
    day: String(d.getDate()).padStart(2, "0"),
    weekday: d.toLocaleDateString("en-US", { weekday: "short" }),
    monthKey: `${d.getFullYear()}-${d.getMonth()}`,
    monthLabel: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear() !== new Date().getFullYear() ? d.getFullYear() : ""}`.trim(),
  };
}

export default function MeetsPage() {
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { loading, fetchMeets, rsvpToMeet, unrsvpFromMeet, getUserRsvps } =
    useMeets();
  const [meets, setMeets] = useState<Meet[]>([]);
  const [rsvpCounts, setRsvpCounts] = useState<Record<string, number>>({});
  const [myRsvps, setMyRsvps] = useState<Set<string>>(new Set());
  // Optimistic count deltas per meet
  const [deltas, setDeltas] = useState<Record<string, number>>({});
  const [activeType, setActiveType] = useState("All");

  useEffect(() => {
    fetchMeets().then(setMeets);
  }, [fetchMeets]);

  useEffect(() => {
    if (user) getUserRsvps().then((ids) => setMyRsvps(new Set(ids)));
  }, [user, getUserRsvps]);

  // Counts come from the denormalized meets.rsvp_count column (migration 015);
  // bounded fallback aggregation only when it isn't present yet.
  useEffect(() => {
    if (meets.length === 0) return;
    if (!meets.some((m) => m.rsvp_count === undefined)) return;

    let stale = false;
    supabase
      .from("meet_rsvps")
      .select("meet_id")
      .in("meet_id", meets.map((m) => m.id))
      .limit(2000)
      .then(({ data }) => {
        if (stale || !data) return;
        const counts: Record<string, number> = {};
        data.forEach((r) => {
          counts[r.meet_id] = (counts[r.meet_id] || 0) + 1;
        });
        setRsvpCounts(counts);
      });
    return () => {
      stale = true;
    };
  }, [meets]);

  const toggleRsvp = async (meet: Meet) => {
    if (!user) {
      navigate("/sign-in?redirect=/meets");
      return;
    }
    const going = myRsvps.has(meet.id);
    // Optimistic — flip immediately, revert on error
    setMyRsvps((prev) => {
      const next = new Set(prev);
      if (going) next.delete(meet.id);
      else next.add(meet.id);
      return next;
    });
    setDeltas((prev) => ({ ...prev, [meet.id]: (prev[meet.id] ?? 0) + (going ? -1 : 1) }));
    const ok = going ? await unrsvpFromMeet(meet.id) : await rsvpToMeet(meet.id);
    if (!ok) {
      setMyRsvps((prev) => {
        const next = new Set(prev);
        if (going) next.add(meet.id);
        else next.delete(meet.id);
        return next;
      });
      setDeltas((prev) => ({ ...prev, [meet.id]: (prev[meet.id] ?? 0) + (going ? 1 : -1) }));
    }
  };

  const filtered = useMemo(
    () =>
      activeType === "All" ? meets : meets.filter((m) => m.meet_type === activeType),
    [meets, activeType],
  );

  // Group by month, preserving date order
  const months = useMemo(() => {
    const out: { key: string; label: string; items: Meet[] }[] = [];
    for (const meet of filtered) {
      const { monthKey, monthLabel } = meetDay(meet.date);
      const last = out[out.length - 1];
      if (last && last.key === monthKey) last.items.push(meet);
      else out.push({ key: monthKey, label: monthLabel, items: [meet] });
    }
    return out;
  }, [filtered]);

  const countFor = (m: Meet) =>
    (m.rsvp_count ?? rsvpCounts[m.id] ?? 0) + (deltas[m.id] ?? 0);

  return (
    <div className="page-enter px-6 pb-20 pt-12 md:px-14">
      <SEOHead
        title="Car Meets"
        description="Find and join car meets near you. Cars & Coffee, track days, cruises, shows, and more."
        canonicalUrl="https://revhub.com/meets"
      />

      {/* Header */}
      <div className="flex flex-col gap-6 pb-[22px] md:flex-row md:items-end md:justify-between">
        <div>
          <div className="font-mono text-[9px] uppercase tracking-[0.28em] text-accent">
            The calendar
          </div>
          <h1 className="mt-2.5 font-editorial text-[44px] font-normal leading-none tracking-[-0.015em] text-text-primary md:text-[66px]">
            Meets
          </h1>
          <p className="mt-3.5 max-w-[520px] font-editorial text-lg italic text-text-secondary">
            Where people are actually going, in the order they are going there.
          </p>
        </div>
        <Link to={user ? "/meets/create" : "/sign-in?redirect=/meets/create"}>
          <PWButton variant="secondary">Host a meet</PWButton>
        </Link>
      </div>

      {/* Type words */}
      <div className="flex flex-wrap items-baseline gap-5 pb-2">
        {MEET_TYPES.map((t) => (
          <button
            key={t}
            onClick={() => setActiveType(t)}
            aria-pressed={activeType === t}
            className={`cursor-pointer border-b pb-[3px] font-mono text-[10px] uppercase tracking-[0.16em] transition-colors duration-100 ${
              activeType === t
                ? "border-accent text-accent"
                : "border-transparent text-text-secondary hover:text-accent"
            }`}
          >
            {t}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="space-y-px pt-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 animate-pulse bg-bg-surface" />
          ))}
        </div>
      ) : months.length === 0 ? (
        <div className="border-t border-accent pt-8">
          <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
            Nothing on the calendar
            {activeType !== "All" ? ` for ${activeType}` : ""}
          </p>
          <p className="mt-3 max-w-[460px] text-sm leading-relaxed text-text-secondary">
            Put something on it — the first meet listed here sets the pace.
          </p>
        </div>
      ) : (
        months.map((month) => (
          <div key={month.key} className="mt-[30px] border-t border-accent">
            <h2 className="mb-2 mt-4 font-editorial text-[34px] font-normal leading-none text-text-primary md:text-[46px]">
              {month.label}
            </h2>
            {month.items.map((meet) => {
              const { day, weekday } = meetDay(meet.date);
              const going = myRsvps.has(meet.id);
              const count = countFor(meet);
              const cap = meet.max_attendees;
              const spots = cap ? Math.max(0, cap - count) : null;
              return (
                <div
                  key={meet.id}
                  className="grid grid-cols-[64px_1fr] items-start gap-x-5 border-t border-border-alpha py-[26px] md:grid-cols-[108px_1fr_208px] md:gap-x-8"
                >
                  <div>
                    <div className="font-editorial text-[32px] leading-none text-text-primary md:text-[44px]">
                      {day}
                    </div>
                    <div className="mt-1.5 font-mono text-[9px] uppercase tracking-[0.2em] text-text-secondary">
                      {weekday}
                    </div>
                  </div>
                  <div className="min-w-0">
                    <Link to={`/meets/${meet.id}`}>
                      <h3 className="font-editorial text-[24px] font-normal leading-[1.12] text-text-primary transition-colors duration-150 hover:text-accent md:text-[30px]">
                        {meet.name}
                      </h3>
                    </Link>
                    {meet.location_name && (
                      <p className="mt-1.5 font-editorial text-[15px] italic text-text-secondary">
                        {meet.location_name}
                      </p>
                    )}
                    <div className="mt-3 flex flex-wrap gap-x-[18px] gap-y-1 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                      {meet.time && <span>{meet.time.slice(0, 5)}</span>}
                      <span>
                        {count}
                        {cap ? ` / ${cap}` : " going"}
                      </span>
                      {spots !== null && (
                        <span
                          style={{
                            color:
                              spots === 0
                                ? "var(--color-signal-red)"
                                : spots < 8
                                  ? "var(--color-accent)"
                                  : undefined,
                          }}
                        >
                          {spots === 0 ? "Waitlist" : `${spots} spots left`}
                        </span>
                      )}
                      {meet.meet_type && <span>{meet.meet_type}</span>}
                    </div>
                  </div>
                  <div className="col-span-2 mt-4 md:col-span-1 md:mt-0">
                    <Link to={`/meets/${meet.id}`} className="block max-md:hidden">
                      <img
                        src={meet.cover_image_url || fallbackImage}
                        alt=""
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = fallbackImage;
                        }}
                        className="block w-full object-cover"
                        style={{ aspectRatio: "4 / 3" }}
                      />
                    </Link>
                    <ToggleButton
                      on={going}
                      onClick={() => toggleRsvp(meet)}
                      className="mt-2.5 w-full py-2.5"
                    >
                      {going ? "Going" : "RSVP"}
                    </ToggleButton>
                  </div>
                </div>
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}
