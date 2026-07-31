import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import { useAuthContext } from "@/context/AuthContext";
import useGarage from "@/hooks/useGarage";
import useBuildLogs from "@/hooks/useBuildLogs";
import PageHeader from "@/components/pitwall/PageHeader";
import PWButton from "@/components/pitwall/Button";
import Field, { FormSection, TextareaField } from "@/components/pitwall/Field";
import { CARS } from "@/lib/carData";
import type { GarageCar } from "@/types/garage";

const fallbackImage =
  "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80";

function getCarInfo(gc: GarageCar): { name: string; image: string | null } {
  const staticCar = CARS.find((c) => c.id === gc.carId || c.slug === gc.carId);
  const name = gc.nickname
    ? gc.nickname
    : staticCar
      ? `${gc.year ?? ""} ${staticCar.make} ${staticCar.model}`.trim()
      : gc.carId;
  return { name, image: staticCar?.heroImage ?? null };
}

export default function CreateBuildPage() {
  const { user, loading: authLoading } = useAuthContext();
  const { cars: garageCars, loading: garageLoading } = useGarage();
  const { createBuildLog } = useBuildLogs();
  const navigate = useNavigate();

  const [selectedCar, setSelectedCar] = useState<GarageCar | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [triedSubmit, setTriedSubmit] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setTriedSubmit(true);
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

  if (authLoading) {
    return (
      <div className="page-enter px-6 py-[34px] md:px-11">
        <div className="h-12 w-1/3 animate-pulse bg-bg-surface" />
        <div className="mt-6 h-64 animate-pulse bg-bg-surface" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="page-enter">
        <SEOHead title="Start a Build" description="Document your car build on RevD." />
        <PageHeader
          breadcrumb={[{ label: "Builds" }, { label: "New", accent: true }]}
          title="START A BUILD"
        />
        <div className="px-6 md:px-11">
          <p className="max-w-[460px] text-sm leading-relaxed text-text-secondary">
            Sign in to start documenting — every mod, every dollar, every step.
          </p>
          <div className="mt-6">
            <Link to="/sign-in?redirect=/builds/create">
              <PWButton>Sign in</PWButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-enter pb-[72px]">
      <SEOHead
        title="Start a Build"
        description="Pick a car from your garage and start documenting every mod, every dollar, every step."
      />

      <PageHeader
        breadcrumb={[{ label: "Builds" }, { label: "New", accent: true }]}
        title="START A BUILD"
      />

      <form onSubmit={handleSubmit} className="max-w-[780px] px-6 md:px-11">
        <FormSection label="The car" />
        {garageLoading ? (
          <div className="space-y-px">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 animate-pulse bg-bg-surface" />
            ))}
          </div>
        ) : garageCars.length > 0 ? (
          <div>
            {garageCars.map((gc) => {
              const info = getCarInfo(gc);
              const selected = selectedCar?.id === gc.id;
              return (
                <button
                  key={gc.id}
                  type="button"
                  onClick={() => setSelectedCar(gc)}
                  aria-pressed={selected}
                  className={`grid w-full cursor-pointer grid-cols-[76px_1fr_20px] items-center gap-4 border-b border-border-hair py-3 text-left transition-colors duration-100 ${
                    selected ? "bg-bg-elevated" : "hover:bg-bg-elevated"
                  }`}
                >
                  <img
                    src={info.image || fallbackImage}
                    alt=""
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = fallbackImage;
                    }}
                    className="h-[46px] w-[76px] object-cover grayscale-[0.35]"
                  />
                  <span className="flex min-w-0 flex-col gap-0.5">
                    <span className="truncate text-[15px] font-semibold tracking-[-0.015em] text-text-primary">
                      {info.name}
                    </span>
                    {gc.notes && (
                      <span className="truncate font-mono text-[10px] text-text-muted">
                        {gc.notes}
                      </span>
                    )}
                  </span>
                  <span
                    className={`text-right font-mono text-[13px] ${selected ? "text-accent" : "text-text-muted"}`}
                  >
                    {selected ? "✓" : ""}
                  </span>
                </button>
              );
            })}
            {triedSubmit && !selectedCar && (
              <p className="mt-2 font-mono text-[10px] tracking-[0.08em] text-signal-red">
                Required — pick the car this build is for
              </p>
            )}
          </div>
        ) : (
          <div className="py-4">
            <p className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              You need at least one bay in your garage to start a build
            </p>
            <div className="mt-4">
              <Link to="/garage">
                <PWButton variant="secondary">Open the garage</PWButton>
              </Link>
            </div>
          </div>
        )}

        <FormSection label="The build" />
        <div className="flex flex-col gap-5">
          <Field
            label="Build name"
            value={title}
            maxLength={200}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="E46 Track Rat"
            error={
              triedSubmit && !title.trim()
                ? "Required — give the build a name"
                : undefined
            }
          />
          <TextareaField
            label="Goal"
            value={description}
            maxLength={5000}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="What's the vision — goals, timeline, budget"
            rows={4}
          />
        </div>

        {error && (
          <p className="mt-5 border border-signal-red px-4 py-3 font-mono text-[11px] uppercase tracking-[0.14em] text-signal-red">
            {error}
          </p>
        )}

        <div className="mt-10 flex items-center gap-[18px] border-t border-border-alpha pt-[22px]">
          <PWButton type="submit" disabled={submitting}>
            {submitting ? "Creating…" : "Create build"}
          </PWButton>
          <Link
            to="/builds"
            className="font-mono text-[10px] uppercase tracking-[0.18em] text-text-secondary transition-colors duration-100 hover:text-text-primary"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
