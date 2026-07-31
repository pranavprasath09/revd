import { useCallback, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import { useAuthContext } from "@/context/AuthContext";
import useMeets from "@/hooks/useMeets";
import { supabase } from "@/lib/supabase";
import OpeningSpread from "@/components/margin/OpeningSpread";
import FolioStats from "@/components/margin/FolioStats";
import SectionRule from "@/components/margin/SectionRule";
import IndexList, {
  IdxAccent,
  IdxMuted,
  IdxName,
  IdxNum,
} from "@/components/margin/IndexList";
import { ToggleButton } from "@/components/pitwall/Button";
import { CARS } from "@/lib/carData";
import type { Meet } from "@/types/meet";

const fallbackImage =
  "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=800&q=80";

function formatTime(timeStr: string): string {
  const [h, m] = timeStr.split(":");
  const hour = parseInt(h, 10);
  const ampm = hour >= 12 ? "PM" : "AM";
  return `${hour % 12 || 12}:${m} ${ampm}`;
}

function shortDate(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function monthName(dateStr: string): string {
  const date = new Date(dateStr + "T00:00:00");
  return date.toLocaleDateString("en-US", { month: "long" });
}

interface Attendee {
  user_id: string;
  display_name: string | null;
  avatar_url: string | null;
}

// Cap the attendee index; the true total comes from a head COUNT, not this list.
const MAX_ATTENDEE_AVATARS = 100;

export default function MeetDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuthContext();
  const navigate = useNavigate();
  const { fetchMeet, deleteMeet, unrsvpFromMeet } = useMeets();

  const [meet, setMeet] = useState<Meet | null>(null);
  const [loading, setLoading] = useState(true);
  const [attendees, setAttendees] = useState<Attendee[]>([]);
  const [totalAttendees, setTotalAttendees] = useState(0);
  // Attendees' garage cars — drives the hover plate in the index
  const [attendeeCars, setAttendeeCars] = useState<Record<string, string>>({});
  const [hasRsvped, setHasRsvped] = useState(false);
  const [rsvpLoading, setRsvpLoading] = useState(false);
  const [rsvpError, setRsvpError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [creatorName, setCreatorName] = useState<string | null>(null);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    if (!id) return;
    let stale = false;
    setLoading(true);
    setRsvpError(null);
    fetchMeet(id).then((data) => {
      if (stale) return;
      setMeet(data);
      setLoading(false);
    });
    return () => {
      stale = true;
    };
  }, [id, fetchMeet]);

  // Attendees, then their profiles in a second query (not an embed — see
  // migration 014 note: meet_rsvps.user_id may still point at auth.users).
  const loadAttendees = useCallback(async (): Promise<{
    list: Attendee[];
    total: number;
  }> => {
    if (!id) return { list: [], total: 0 };

    const { count } = await supabase
      .from("meet_rsvps")
      .select("*", { count: "exact", head: true })
      .eq("meet_id", id);

    const { data: rsvps, error } = await supabase
      .from("meet_rsvps")
      .select("user_id")
      .eq("meet_id", id)
      .order("created_at", { ascending: true })
      .limit(MAX_ATTENDEE_AVATARS);

    if (error) {
      console.error("Failed to load attendees:", error.message);
      return { list: [], total: count ?? 0 };
    }
    if (!rsvps || rsvps.length === 0) return { list: [], total: count ?? 0 };

    const userIds = rsvps.map((r) => r.user_id);
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select("id, display_name, avatar_url")
      .in("id", userIds);
    if (profilesError) {
      console.error("Failed to load attendee profiles:", profilesError.message);
    }
    const byId = new Map(
      (profiles ?? []).map((p) => [
        p.id,
        { display_name: p.display_name, avatar_url: p.avatar_url },
      ]),
    );

    const list = userIds.map((userId) => ({
      user_id: userId,
      display_name: byId.get(userId)?.display_name ?? null,
      avatar_url: byId.get(userId)?.avatar_url ?? null,
    }));
    return { list, total: count ?? list.length };
  }, [id]);

  useEffect(() => {
    let stale = false;
    loadAttendees().then(({ list, total }) => {
      if (stale) return;
      setAttendees(list);
      setTotalAttendees(total);
    });
    return () => {
      stale = true;
    };
  }, [loadAttendees]);

  // What each attendee drives — first garage car per user, one bounded query
  useEffect(() => {
    if (attendees.length === 0) return;
    let stale = false;
    supabase
      .from("garage_cars")
      .select("user_id, car_id, created_at")
      .in("user_id", attendees.map((a) => a.user_id))
      .order("created_at", { ascending: true })
      .limit(300)
      .then(({ data }) => {
        if (stale || !data) return;
        const map: Record<string, string> = {};
        data.forEach((gc) => {
          if (!map[gc.user_id]) map[gc.user_id] = gc.car_id;
        });
        setAttendeeCars(map);
      });
    return () => {
      stale = true;
    };
  }, [attendees]);

  useEffect(() => {
    if (!user || !id) return;
    let stale = false;
    supabase
      .from("meet_rsvps")
      .select("id")
      .eq("meet_id", id)
      .eq("user_id", user.id)
      .then(({ data }) => {
        if (!stale) setHasRsvped((data?.length ?? 0) > 0);
      });
    return () => {
      stale = true;
    };
  }, [user, id]);

  useEffect(() => {
    if (!meet) return;
    supabase
      .from("profiles")
      .select("display_name")
      .eq("id", meet.creator_id)
      .single()
      .then(({ data }) => {
        setCreatorName(data?.display_name ?? "Anonymous");
      });
  }, [meet]);

  async function handleRsvp() {
    if (!id) return;
    if (!user) {
      navigate(`/sign-in?redirect=/meets/${id}`);
      return;
    }
    setRsvpLoading(true);
    setRsvpError(null);
    if (hasRsvped) {
      const success = await unrsvpFromMeet(id);
      if (success) {
        setHasRsvped(false);
        const { list, total } = await loadAttendees();
        setAttendees(list);
        setTotalAttendees(total);
      } else {
        setRsvpError("Couldn't cancel your RSVP. Please try again.");
      }
    } else {
      try {
        const { error } = await supabase
          .from("meet_rsvps")
          .insert({ meet_id: id, user_id: user.id });
        if (error) throw error;
        setHasRsvped(true);
        const { list, total } = await loadAttendees();
        setAttendees(list);
        setTotalAttendees(total);
      } catch (err) {
        const message = (err as Error).message;
        console.error("Failed to RSVP:", message);
        if (message.includes("This meet is full")) {
          setRsvpError("This meet is full.");
          const { list, total } = await loadAttendees();
          setAttendees(list);
          setTotalAttendees(total);
        } else {
          setRsvpError(message || "Couldn't RSVP. Please try again.");
        }
      }
    }
    setRsvpLoading(false);
  }

  function handleShare() {
    const url = window.location.href;
    if (navigator.share) {
      navigator.share({ title: meet?.name ?? "Car Meet on RevD", url }).catch(() => {});
    } else {
      navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }

  if (loading) {
    return (
      <div className="page-enter">
        <div className="h-[440px] animate-pulse bg-bg-surface" />
        <div className="space-y-4 px-6 py-8 md:px-14">
          <div className="h-10 w-2/3 animate-pulse bg-bg-surface" />
          <div className="h-32 animate-pulse bg-bg-surface" />
        </div>
      </div>
    );
  }

  if (!meet) {
    return (
      <div className="page-enter px-6 pb-20 pt-12 md:px-14">
        <SEOHead title="Meet not found" description="This meet doesn't exist." />
        <h1 className="font-editorial text-[62px] font-normal leading-none text-text-primary">
          Not found
        </h1>
        <p className="mt-4 max-w-[460px] font-editorial text-lg italic text-text-secondary">
          This meet may have been removed, or the link is wrong.
        </p>
        <Link
          to="/meets"
          className="mt-7 inline-block border-b border-accent pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-text-primary hover:text-accent"
        >
          Back to the calendar →
        </Link>
      </div>
    );
  }

  const isOwner = user?.id === meet.creator_id;
  const cap = meet.max_attendees;
  const spots = cap ? Math.max(0, cap - totalAttendees) : null;

  const facts = [
    { label: "Date", value: shortDate(meet.date) },
    ...(meet.time ? [{ label: "Roll out", value: formatTime(meet.time) }] : []),
    ...(meet.location_name
      ? [{ label: "Meet point", value: meet.location_name }]
      : []),
    ...(meet.meet_type ? [{ label: "Type", value: meet.meet_type }] : []),
  ];

  const indexItems = attendees.map((a, i) => {
    const car = attendeeCars[a.user_id]
      ? CARS.find(
          (c) =>
            c.id === attendeeCars[a.user_id] || c.slug === attendeeCars[a.user_id],
        )
      : undefined;
    return {
      key: a.user_id,
      image: car?.heroImage ?? meet.cover_image_url ?? fallbackImage,
      to: `/profile/${a.user_id}`,
      name: a.display_name ?? "Anonymous",
      gen: car?.generation ?? "—",
      carName: car ? `${car.make} ${car.model}` : "No car on file",
      num: String(i + 1).padStart(2, "0"),
      car,
    };
  });

  return (
    <div className="page-enter pb-20">
      <SEOHead
        title={meet.name}
        description={
          meet.description ??
          `${meet.name} — ${shortDate(meet.date)}${meet.location_name ? ` at ${meet.location_name}` : ""}. RSVP on RevD.`
        }
        ogImage={meet.cover_image_url ?? undefined}
      />

      <OpeningSpread
        kicker={`Meets / ${monthName(meet.date)}`}
        headline={meet.name}
        standfirst={
          meet.description && (
            <span className="font-editorial text-[19px] italic leading-[1.5]">
              {meet.description}
            </span>
          )
        }
        facts={facts}
        actions={
          <>
            <ToggleButton
              on={hasRsvped}
              disabled={rsvpLoading}
              onClick={handleRsvp}
              className="px-7 py-3.5 text-[11px] tracking-[0.2em]"
            >
              {rsvpLoading
                ? "…"
                : hasRsvped
                  ? "You're going"
                  : "RSVP to this meet"}
            </ToggleButton>
            <button
              onClick={handleShare}
              className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.2em] text-text-secondary transition-colors duration-100 hover:text-accent"
            >
              {copied ? "Link copied ✓" : "Share"}
            </button>
            {isOwner &&
              (!confirmDelete ? (
                <button
                  onClick={() => setConfirmDelete(true)}
                  className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.2em] text-text-muted transition-colors duration-100 hover:text-signal-red"
                >
                  Delete
                </button>
              ) : (
                <span className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em]">
                  <button
                    disabled={deleting}
                    onClick={async () => {
                      setDeleting(true);
                      const ok = await deleteMeet(meet.id);
                      if (ok) navigate("/meets");
                      else setDeleting(false);
                    }}
                    className="cursor-pointer text-signal-red hover:opacity-80"
                  >
                    {deleting ? "Deleting…" : "Confirm delete"}
                  </button>
                  <button
                    onClick={() => setConfirmDelete(false)}
                    className="cursor-pointer text-text-secondary hover:text-text-primary"
                  >
                    Keep it
                  </button>
                </span>
              ))}
          </>
        }
        image={meet.cover_image_url || fallbackImage}
        alt={meet.name}
        caption={meet.location_name ?? undefined}
      />

      {rsvpError && (
        <p className="border-b border-border-alpha px-6 py-3 font-mono text-[10px] uppercase tracking-[0.14em] text-signal-red md:px-14">
          {rsvpError}
        </p>
      )}

      <FolioStats
        stats={[
          { value: String(totalAttendees), label: "Attending" },
          { value: cap ? String(cap) : "Open", label: "Capacity" },
          {
            value: spots === null ? "—" : spots === 0 ? "Full" : String(spots),
            label: "Spots left",
          },
          { value: creatorName ?? "—", label: "Hosted by" },
        ]}
      />

      {/* Who's coming — the index pattern */}
      <div className="px-6 pt-11 md:px-14">
        <SectionRule title="Who's coming" note="Hover to see the car" />
      </div>
      {indexItems.length === 0 ? (
        <p className="px-6 py-8 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted md:px-14">
          Nobody yet — the first RSVP opens the index
        </p>
      ) : (
        <div className="pl-6 md:pl-14 lg:pr-14">
          <IndexList
            items={indexItems}
            gridTemplate="46px 1fr 96px 116px"
            renderCells={(a) => (
              <>
                <IdxNum>{a.num}</IdxNum>
                <IdxName>{a.name}</IdxName>
                <IdxAccent>{a.gen}</IdxAccent>
                <IdxMuted>{a.carName}</IdxMuted>
              </>
            )}
            renderPanel={(a) => (
              <>
                <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-accent">
                  Attending
                </div>
                <p className="mt-2 font-editorial text-[26px] text-text-primary">
                  {a.name}
                </p>
                <p className="mt-1 font-editorial text-[15px] italic text-text-secondary">
                  {a.car
                    ? `${a.car.make} ${a.car.model}, ${a.car.generation} — ${a.car.engines[0]?.power ?? ""}.`
                    : "No car on file yet."}
                </p>
              </>
            )}
          />
        </div>
      )}
    </div>
  );
}
