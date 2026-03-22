import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAuthContext } from "@/context/AuthContext";
import useGarage from "@/hooks/useGarage";
import useBuildLogs from "@/hooks/useBuildLogs";
import carsData from "@/data/cars.json";
import type { Car } from "@/types/car";
import type { GarageCar } from "@/types/garage";

const cars = carsData as Car[];

function getCarInfo(gc: GarageCar): { name: string; image: string | null } {
  const staticCar = cars.find(
    (c) => c.id === gc.carId || c.slug === gc.carId
  );
  const name = gc.nickname
    ? gc.nickname
    : staticCar
      ? `${gc.year ?? ""} ${staticCar.make} ${staticCar.model}`.trim()
      : gc.carId;
  return { name, image: staticCar?.heroImage ?? null };
}

export default function CreateBuildPage() {
  const { user } = useAuthContext();
  const { cars: garageCars, loading: garageLoading } = useGarage();
  const { createBuildLog } = useBuildLogs();
  const navigate = useNavigate();

  const [step, setStep] = useState<1 | 2>(1);
  const [selectedCar, setSelectedCar] = useState<GarageCar | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const fallbackImage =
    "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80";

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!selectedCar || !title.trim()) return;

    setSubmitting(true);
    setError("");

    try {
      const result = await createBuildLog({
        car_id: selectedCar.id,
        title: title.trim(),
        description: description.trim() || undefined,
      });

      if (result.data) {
        navigate(`/builds/${result.data.id}`);
      } else {
        setError(result.error ?? "Failed to create build log. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  // Auth gate
  if (!user) {
    return (
      <div className="page-enter">
        <SEOHead title="Start a Build" description="Document your car build on RevD." />
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-bg-surface border border-border">
            <svg
              className="h-10 w-10 text-text-muted"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
              />
            </svg>
          </div>
          <h2 className="font-display text-2xl uppercase tracking-wide text-text-primary mb-2">
            Sign In Required
          </h2>
          <p className="font-body text-sm text-text-secondary max-w-md mb-6">
            You need to be signed in to start a build log.
          </p>
          <Link
            to="/sign-in?redirect=/builds/create"
            className="inline-flex items-center gap-2 rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter">
      <SEOHead
        title="Start a Build"
        description="Pick a car from your garage and start documenting every mod, every dollar, every step."
      />

      {/* Header */}
      <div className="border-b border-border bg-bg-surface/50">
        <PageWrapper>
          <div className="py-10 sm:py-14">
            <Link
              to="/builds"
              className="font-body text-sm text-text-secondary hover:text-accent-red transition-colors inline-flex items-center gap-1 mb-4"
            >
              <svg
                className="h-4 w-4"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
              </svg>
              Back to Builds
            </Link>
            <p className="font-body text-[11px] font-bold uppercase tracking-widest text-accent-red mb-3">
              New Build
            </p>
            <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wide text-text-primary leading-none">
              Start a Build
            </h1>
            <p className="font-body mt-3 max-w-2xl text-base text-text-secondary leading-relaxed">
              Pick a car from your garage, give your build a name, and start documenting.
            </p>
          </div>
        </PageWrapper>
      </div>

      <PageWrapper>
        <div className="max-w-2xl py-8">
          {/* Step indicator */}
          <div className="flex items-center gap-3 mb-8">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm font-bold ${
                step === 1
                  ? "bg-accent-red text-white"
                  : "bg-bg-elevated text-text-muted"
              }`}
            >
              1
            </div>
            <div className="h-px flex-1 bg-border" />
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full font-mono text-sm font-bold ${
                step === 2
                  ? "bg-accent-red text-white"
                  : "bg-bg-elevated text-text-muted"
              }`}
            >
              2
            </div>
          </div>

          {/* Step 1: Pick a car */}
          {step === 1 && (
            <div>
              <h2 className="font-display text-2xl uppercase tracking-wide text-text-primary mb-2">
                Pick Your Car
              </h2>
              <p className="font-body text-sm text-text-secondary mb-6">
                Choose which car from your garage this build is for.
              </p>

              {garageLoading ? (
                <div className="space-y-3">
                  {[1, 2].map((i) => (
                    <div key={i} className="h-24 animate-pulse rounded-xl bg-bg-surface" />
                  ))}
                </div>
              ) : garageCars.length > 0 ? (
                <div className="space-y-3">
                  {garageCars.map((gc) => {
                    const info = getCarInfo(gc);
                    const selected = selectedCar?.id === gc.id;
                    return (
                      <button
                        key={gc.id}
                        type="button"
                        onClick={() => {
                          setSelectedCar(gc);
                          setStep(2);
                        }}
                        className={`flex w-full items-center gap-4 rounded-xl border p-4 text-left transition-all cursor-pointer ${
                          selected
                            ? "border-accent-red bg-accent-red/5"
                            : "border-white/10 bg-bg-surface hover:border-accent-red/30"
                        }`}
                      >
                        <div className="h-16 w-24 shrink-0 overflow-hidden rounded-lg">
                          <img
                            src={info.image || fallbackImage}
                            alt={info.name}
                            loading="lazy"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = fallbackImage;
                            }}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-lg uppercase tracking-wide text-text-primary truncate">
                            {info.name}
                          </p>
                          {gc.notes && (
                            <p className="font-body text-xs text-text-muted line-clamp-1 mt-0.5">
                              {gc.notes}
                            </p>
                          )}
                        </div>
                        <svg
                          className="h-5 w-5 shrink-0 text-text-muted"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                        </svg>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div className="rounded-xl border border-border bg-bg-surface p-8 text-center">
                  <p className="font-body text-sm text-text-muted mb-4">
                    You need at least one car in your garage to start a build.
                  </p>
                  <Link
                    to="/garage"
                    className="inline-flex items-center gap-2 rounded-lg bg-accent-red px-5 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
                  >
                    Go to Garage
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Build details */}
          {step === 2 && selectedCar && (
            <form onSubmit={handleSubmit} className="space-y-6">
              <h2 className="font-display text-2xl uppercase tracking-wide text-text-primary mb-2">
                Build Details
              </h2>

              {/* Selected car preview */}
              {(() => {
                const info = getCarInfo(selectedCar);
                return (
                  <div className="flex items-center gap-4 rounded-xl border border-white/10 bg-bg-surface p-4">
                    <div className="h-12 w-18 shrink-0 overflow-hidden rounded-lg">
                      <img
                        src={info.image || fallbackImage}
                        alt={info.name}
                        className="h-full w-full object-cover"
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-display text-base uppercase tracking-wide text-text-primary truncate">
                        {info.name}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="text-xs text-accent-red hover:text-accent-hover transition-colors cursor-pointer"
                    >
                      Change
                    </button>
                  </div>
                );
              })()}

              {/* Title */}
              <div>
                <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
                  Build Title *
                </label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder='e.g. "Project Track Weapon", "Daily to Weekend Warrior"'
                  required
                  className="font-body w-full rounded-lg border border-border bg-bg-surface py-3 px-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25"
                />
              </div>

              {/* Description */}
              <div>
                <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
                  Description <span className="text-text-muted/50">(optional)</span>
                </label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="What's the vision for this build? Goals, timeline, budget..."
                  rows={4}
                  className="font-body w-full rounded-lg border border-border bg-bg-surface py-3 px-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25 resize-none"
                />
              </div>

              {/* Error */}
              {error && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-4 py-3">
                  <p className="font-body text-sm text-red-400">{error}</p>
                </div>
              )}

              {/* Submit */}
              <button
                type="submit"
                disabled={submitting || !title.trim()}
                className="w-full rounded-lg bg-accent-red py-3.5 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {submitting ? "Creating..." : "Create Build Log"}
              </button>
            </form>
          )}
        </div>
      </PageWrapper>
    </div>
  );
}
