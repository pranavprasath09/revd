import { useState, useMemo, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import { useAuthContext } from "@/context/AuthContext";
import useGarage from "@/hooks/useGarage";
import carsData from "@/data/cars.json";
import type { Car } from "@/types/car";
import type { GarageCar } from "@/types/garage";

const cars = carsData as Car[];

function carById(carId: string): Car | undefined {
  return cars.find((c) => c.id === carId || c.slug === carId);
}

// ─── Add Car Modal ─────────────────────────────────────────────
interface AddCarModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (carId: string, nickname?: string, year?: string) => void | Promise<void>;
  existingCarIds: string[];
}

function AddCarModal({ open, onClose, onAdd, existingCarIds }: AddCarModalProps) {
  const [search, setSearch] = useState("");
  const [selectedCar, setSelectedCar] = useState<Car | null>(null);
  const [nickname, setNickname] = useState("");
  const [year, setYear] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setSearch("");
      setSelectedCar(null);
      setNickname("");
      setYear("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  const results = useMemo(() => {
    if (search.length < 1) return [];
    const q = search.toLowerCase();
    return cars
      .filter((c) => {
        const hay = `${c.make} ${c.model} ${c.generation}`.toLowerCase();
        return hay.includes(q);
      })
      .slice(0, 8);
  }, [search]);

  async function handleSubmit() {
    if (!selectedCar) return;
    await onAdd(selectedCar.id, nickname.trim() || undefined, year.trim() || undefined);
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-bg-base shadow-2xl shadow-black/50">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-display text-xl uppercase tracking-wide text-text-primary">Add Car to Garage</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-bg-elevated hover:text-white transition-colors cursor-pointer"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div className="p-5 space-y-4">
          {!selectedCar ? (
            <>
              {/* Search for a car */}
              <div>
                <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
                  Search Our Database
                </label>
                <input
                  ref={inputRef}
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Type make, model, or generation..."
                  className="font-body w-full rounded-lg border border-border bg-bg-surface py-3 px-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25"
                />
              </div>

              {/* Results */}
              {results.length > 0 && (
                <div className="max-h-64 overflow-y-auto rounded-xl border border-border bg-bg-surface">
                  {results.map((car) => {
                    const alreadyAdded = existingCarIds.includes(car.id);
                    return (
                      <button
                        key={car.id}
                        type="button"
                        disabled={alreadyAdded}
                        onClick={() => setSelectedCar(car)}
                        className={`flex w-full items-center gap-4 px-4 py-3 text-left transition-colors border-b border-border last:border-0 ${
                          alreadyAdded
                            ? "opacity-40 cursor-not-allowed"
                            : "hover:bg-white/5 cursor-pointer"
                        }`}
                      >
                        <img
                          src={car.heroImage}
                          alt={`${car.make} ${car.model}`}
                          loading="lazy"
                          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80"; }}
                          className="h-10 w-14 rounded-lg object-cover"
                        />
                        <div className="flex-1 min-w-0">
                          <p className="font-display text-base uppercase tracking-wide text-text-primary truncate">
                            {car.make} {car.model}{" "}
                            <span className="text-accent-red">{car.generation}</span>
                          </p>
                          <p className="font-mono text-xs text-text-muted">{car.years}</p>
                        </div>
                        {alreadyAdded && (
                          <span className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">
                            In garage
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {search.length >= 1 && results.length === 0 && (
                <p className="text-center text-sm text-text-muted py-6">No cars found matching "{search}"</p>
              )}
            </>
          ) : (
            <>
              {/* Selected car confirmation */}
              <div className="flex items-center gap-4 rounded-xl border border-border bg-bg-surface p-4">
                <img
                  src={selectedCar.heroImage}
                  alt={`${selectedCar.make} ${selectedCar.model}`}
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80"; }}
                  className="h-14 w-20 rounded-lg object-cover"
                />
                <div className="flex-1">
                  <p className="font-display text-lg uppercase tracking-wide text-text-primary">
                    {selectedCar.make} {selectedCar.model}
                  </p>
                  <p className="font-mono text-xs text-text-muted">
                    {selectedCar.generation} · {selectedCar.years}
                  </p>
                </div>
                <button
                  onClick={() => setSelectedCar(null)}
                  className="text-xs text-accent-red hover:text-accent-hover transition-colors cursor-pointer"
                >
                  Change
                </button>
              </div>

              {/* Optional fields */}
              <div>
                <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
                  Nickname <span className="text-text-muted/50">(optional)</span>
                </label>
                <input
                  type="text"
                  value={nickname}
                  onChange={(e) => setNickname(e.target.value)}
                  placeholder='e.g. "Project Daily", "Track Beast"'
                  className="font-body w-full rounded-lg border border-border bg-bg-surface py-2.5 px-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25"
                />
              </div>

              <div>
                <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
                  Year <span className="text-text-muted/50">(optional)</span>
                </label>
                <input
                  type="text"
                  value={year}
                  onChange={(e) => setYear(e.target.value)}
                  placeholder="e.g. 2004"
                  className="font-body w-full rounded-lg border border-border bg-bg-surface py-2.5 px-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25"
                />
              </div>

              <button
                onClick={handleSubmit}
                className="w-full rounded-lg bg-accent-red py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover cursor-pointer"
              >
                Add to Garage
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── Add Mod Modal ─────────────────────────────────────────────
interface AddModModalProps {
  open: boolean;
  onClose: () => void;
  onAdd: (mod: { name: string; description: string; cost?: string; date?: string }) => void;
}

function AddModModal({ open, onClose, onAdd }: AddModModalProps) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [date, setDate] = useState("");
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setName("");
      setDescription("");
      setCost("");
      setDate("");
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [open]);

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onAdd({
      name: name.trim(),
      description: description.trim(),
      cost: cost.trim() || undefined,
      date: date.trim() || undefined,
    });
    onClose();
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg rounded-2xl border border-border bg-bg-base shadow-2xl shadow-black/50">
        <div className="flex items-center justify-between border-b border-border p-5">
          <h2 className="font-display text-xl uppercase tracking-wide text-text-primary">Add Mod</h2>
          <button
            onClick={onClose}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-text-muted hover:bg-bg-elevated hover:text-white transition-colors cursor-pointer"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          <div>
            <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
              Mod Name *
            </label>
            <input
              ref={inputRef}
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='e.g. "Cold Air Intake", "Coilovers", "Full Exhaust"'
              required
              className="font-body w-full rounded-lg border border-border bg-bg-surface py-2.5 px-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25"
            />
          </div>

          <div>
            <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
              Description
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Part numbers, brand, what it does, install notes..."
              rows={3}
              className="font-body w-full rounded-lg border border-border bg-bg-surface py-2.5 px-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25 resize-none"
            />
          </div>

          <div className="flex gap-4">
            <div className="flex-1">
              <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
                Cost <span className="text-text-muted/50">(optional)</span>
              </label>
              <input
                type="text"
                value={cost}
                onChange={(e) => setCost(e.target.value)}
                placeholder="e.g. $450"
                className="font-body w-full rounded-lg border border-border bg-bg-surface py-2.5 px-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25"
              />
            </div>
            <div className="flex-1">
              <label className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1.5 block">
                Date <span className="text-text-muted/50">(optional)</span>
              </label>
              <input
                type="text"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                placeholder="e.g. Mar 2024"
                className="font-body w-full rounded-lg border border-border bg-bg-surface py-2.5 px-4 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25"
              />
            </div>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-accent-red py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover cursor-pointer"
          >
            Add Mod
          </button>
        </form>
      </div>
    </div>
  );
}

// ─── Garage Car Card ───────────────────────────────────────────
interface GarageCarCardProps {
  garageCar: GarageCar;
  car: Car;
  onRemove: () => void;
  onUpdate: (updates: Partial<Pick<GarageCar, "nickname" | "year" | "notes">>) => void;
  onAddMod: () => void;
  onRemoveMod: (modId: string) => void;
}

function GarageCarCard({ garageCar, car, onRemove, onUpdate, onAddMod, onRemoveMod }: GarageCarCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(garageCar.notes);
  const [confirmDelete, setConfirmDelete] = useState(false);

  function saveNotes() {
    onUpdate({ notes: notesValue.trim() });
    setEditingNotes(false);
  }

  return (
    <div className="card-corner rounded-xl border border-white/5 bg-bg-surface overflow-hidden transition-all duration-300 animate-fade-up">
      {/* Hero */}
      <div className="relative h-44 sm:h-52 overflow-hidden cursor-pointer" onClick={() => setExpanded(!expanded)}>
        <img
          src={car.heroImage}
          alt={`${car.make} ${car.model}`}
          loading="lazy"
          onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80"; }}
          className="h-full w-full object-cover transition-transform duration-500 hover:scale-105"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-bg-surface via-bg-surface/30 to-transparent" />

        {/* Nickname / title overlay */}
        <div className="absolute bottom-4 left-4 right-4">
          {garageCar.nickname && (
            <p className="font-body text-xs font-bold uppercase tracking-wider text-accent-red mb-1">
              {garageCar.nickname}
            </p>
          )}
          <h3 className="font-display text-2xl uppercase tracking-wide text-white leading-tight">
            {garageCar.year ?? ""} {car.make} {car.model}
          </h3>
          <p className="font-mono text-xs text-white/60 mt-0.5">{car.generation} · {car.performance.drivetrain} · {car.engines[0].power}</p>
        </div>

        {/* Mod count badge */}
        <div className="absolute top-3 right-3 flex items-center gap-1.5 rounded-lg bg-bg-base/90 px-3 py-1.5 backdrop-blur-sm">
          <svg className="h-3.5 w-3.5 text-accent-red" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
            <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
          </svg>
          <span className="font-mono text-sm font-bold text-text-primary">{garageCar.mods.length}</span>
        </div>

        {/* Expand indicator */}
        <div className="absolute top-3 left-3">
          <svg
            className={`h-5 w-5 text-white/50 transition-transform duration-300 ${expanded ? "rotate-180" : ""}`}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {/* Expanded content */}
      {expanded && (
        <div className="border-t border-border">
          {/* Quick actions */}
          <div className="flex items-center gap-2 p-4 border-b border-border">
            <Link
              to={`/cars/${car.make.toLowerCase()}/${car.model.toLowerCase().replace(/\s+/g, "-")}/${car.years.split("–")[0]}`}
              className="font-body text-xs font-semibold text-accent-red hover:text-accent-hover transition-colors"
            >
              View Specs
            </Link>
            <span className="text-text-muted">·</span>
            <Link
              to={`/mods/${car.make.toLowerCase()}/${car.model.toLowerCase().replace(/\s+/g, "-")}`}
              className="font-body text-xs font-semibold text-accent-red hover:text-accent-hover transition-colors"
            >
              Mod Guide
            </Link>
            <span className="text-text-muted">·</span>
            <Link
              to={`/reliability/${car.make.toLowerCase()}/${car.model.toLowerCase().replace(/\s+/g, "-")}`}
              className="font-body text-xs font-semibold text-accent-red hover:text-accent-hover transition-colors"
            >
              Reliability
            </Link>
            <div className="flex-1" />
            {!confirmDelete ? (
              <button
                onClick={() => setConfirmDelete(true)}
                className="font-body text-xs font-semibold text-text-muted hover:text-red-400 transition-colors cursor-pointer"
              >
                Remove
              </button>
            ) : (
              <div className="flex items-center gap-2">
                <span className="font-body text-xs text-text-muted">Sure?</span>
                <button
                  onClick={onRemove}
                  className="font-body text-xs font-bold text-red-400 hover:text-red-300 transition-colors cursor-pointer"
                >
                  Yes, remove
                </button>
                <button
                  onClick={() => setConfirmDelete(false)}
                  className="font-body text-xs text-text-muted hover:text-white transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="p-4 border-b border-border">
            <div className="flex items-center justify-between mb-2">
              <p className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">Build Notes</p>
              {!editingNotes && (
                <button
                  onClick={() => { setNotesValue(garageCar.notes); setEditingNotes(true); }}
                  className="font-body text-[10px] font-semibold text-accent-red hover:text-accent-hover transition-colors cursor-pointer"
                >
                  {garageCar.notes ? "Edit" : "Add notes"}
                </button>
              )}
            </div>
            {editingNotes ? (
              <div className="space-y-2">
                <textarea
                  value={notesValue}
                  onChange={(e) => setNotesValue(e.target.value)}
                  placeholder="Describe your build — goals, current state, plans..."
                  rows={3}
                  className="font-body w-full rounded-lg border border-border bg-bg-base py-2.5 px-3 text-sm text-text-primary placeholder-text-muted outline-none transition-colors focus:border-accent-red/50 focus:ring-1 focus:ring-accent-red/25 resize-none"
                  autoFocus
                />
                <div className="flex justify-end gap-2">
                  <button
                    onClick={() => setEditingNotes(false)}
                    className="rounded-lg border border-border px-3 py-1.5 font-body text-xs font-semibold text-text-secondary hover:bg-bg-elevated transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={saveNotes}
                    className="rounded-lg bg-accent-red px-3 py-1.5 font-body text-xs font-bold text-white hover:bg-accent-hover transition-colors cursor-pointer"
                  >
                    Save
                  </button>
                </div>
              </div>
            ) : (
              <p className="font-body text-sm text-text-secondary leading-relaxed">
                {garageCar.notes || <span className="text-text-muted italic">No build notes yet.</span>}
              </p>
            )}
          </div>

          {/* Mods list */}
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <p className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">
                Mods & Modifications ({garageCar.mods.length})
              </p>
              <button
                onClick={onAddMod}
                className="inline-flex items-center gap-1 rounded-lg bg-accent-red/10 px-3 py-1.5 font-body text-xs font-bold text-accent-red hover:bg-accent-red/20 transition-colors cursor-pointer"
              >
                <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                </svg>
                Add Mod
              </button>
            </div>

            {garageCar.mods.length > 0 ? (
              <div className="space-y-2">
                {garageCar.mods.map((mod) => (
                  <div
                    key={mod.id}
                    className="group flex items-start gap-3 rounded-lg bg-white/[0.02] p-3 border border-white/5"
                  >
                    <div className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-accent-red" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-display text-sm uppercase tracking-wide text-text-primary">{mod.name}</p>
                        {mod.cost && (
                          <span className="font-mono text-[11px] text-accent-red">{mod.cost}</span>
                        )}
                        {mod.date && (
                          <span className="font-mono text-[11px] text-text-muted">{mod.date}</span>
                        )}
                      </div>
                      {mod.description && (
                        <p className="font-body text-xs text-text-secondary mt-0.5 leading-relaxed">{mod.description}</p>
                      )}
                    </div>
                    <button
                      onClick={() => onRemoveMod(mod.id)}
                      className="opacity-0 group-hover:opacity-100 shrink-0 text-text-muted hover:text-red-400 transition-all cursor-pointer"
                      title="Remove mod"
                    >
                      <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18 6L6 18M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-text-muted text-center py-6">
                No mods added yet. Track everything you've done to your build.
              </p>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Main Page ─────────────────────────────────────────────────
export default function GaragePage() {
  const { user } = useAuthContext();
  const { cars: garageCars, addCar, removeCar, updateCar, addMod, removeMod } = useGarage();
  const [addCarOpen, setAddCarOpen] = useState(false);
  const [addModTarget, setAddModTarget] = useState<string | null>(null);

  if (!user) {
    return (
      <div className="page-enter">
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <h1 className="font-display text-2xl uppercase tracking-wide text-text-primary mb-4">
            Sign In Required
          </h1>
          <p className="font-body text-sm text-text-secondary mb-6">
            You need to be signed in to access your garage.
          </p>
          <Link
            to="/sign-in?redirect=/garage"
            className="rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover"
          >
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  const totalMods = garageCars.reduce((sum, c) => sum + c.mods.length, 0);
  const existingCarIds = garageCars.map((c) => c.carId);

  return (
    <div className="page-enter">
      <SEOHead
        title="My Garage"
        description="Track your car builds, mods, and modifications. Your personal automotive workshop."
        canonicalUrl="https://revhub.com/garage"
      />

      {/* Hero header */}
      <div className="border-b border-border bg-bg-surface/50">
        <PageWrapper>
          <div className="py-10 sm:py-14">
            <p className="font-body text-[11px] font-bold uppercase tracking-widest text-accent-red mb-3">
              Personal Workshop
            </p>
            <h1 className="font-display text-4xl sm:text-5xl uppercase tracking-wide text-text-primary leading-none">
              My Garage
            </h1>
            <p className="font-body mt-3 max-w-2xl text-base text-text-secondary leading-relaxed">
              Track your builds, log every mod, and document your automotive journey.
              Everything saves automatically to your browser.
            </p>

            {/* Stats */}
            <div className="mt-8 flex flex-wrap gap-6">
              <div className="rounded-xl border border-border bg-bg-base px-5 py-3">
                <p className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">Cars</p>
                <p className="font-mono text-2xl font-bold text-text-primary">{garageCars.length}</p>
              </div>
              <div className="rounded-xl border border-border bg-bg-base px-5 py-3">
                <p className="font-body text-[10px] font-bold uppercase tracking-wider text-text-muted">Total Mods</p>
                <p className="font-mono text-2xl font-bold text-accent-red">{totalMods}</p>
              </div>
              <div className="flex-1" />
              <button
                onClick={() => setAddCarOpen(true)}
                className="self-center inline-flex items-center gap-2 rounded-lg bg-accent-red px-5 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                </svg>
                Add Car
              </button>
            </div>
          </div>
        </PageWrapper>
      </div>

      {/* Garage content */}
      <PageWrapper>
        <div className="py-8">
          {garageCars.length > 0 ? (
            <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
              {garageCars.map((gc) => {
                const car = carById(gc.carId);
                if (!car) return null;
                return (
                  <GarageCarCard
                    key={gc.id}
                    garageCar={gc}
                    car={car}
                    onRemove={() => removeCar(gc.id)}
                    onUpdate={(updates) => updateCar(gc.id, updates)}
                    onAddMod={() => setAddModTarget(gc.id)}
                    onRemoveMod={(modId) => removeMod(gc.id, modId)}
                  />
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-bg-surface border border-border">
                <svg className="h-10 w-10 text-text-muted" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124a17.902 17.902 0 0 0-3.213-9.193 2.056 2.056 0 0 0-1.58-.86H14.25M16.5 18.75h-2.25m0-11.177v-.958c0-.568-.422-1.048-.987-1.106a48.554 48.554 0 0 0-10.026 0 1.106 1.106 0 0 0-.987 1.106v7.635m12-6.677v6.677m0 4.5v-4.5m0 0h-12" />
                </svg>
              </div>
              <h2 className="font-display text-2xl uppercase tracking-wide text-text-primary mb-2">
                Your Garage is Empty
              </h2>
              <p className="font-body text-sm text-text-secondary max-w-md mb-6">
                Add your first car to start tracking your build. Log mods, notes, costs — everything in one place.
              </p>
              <button
                onClick={() => setAddCarOpen(true)}
                className="inline-flex items-center gap-2 rounded-lg bg-accent-red px-6 py-3 font-body text-sm font-bold uppercase tracking-wider text-white transition-colors hover:bg-accent-hover cursor-pointer"
              >
                <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 5v14M5 12h14" />
                </svg>
                Add Your First Car
              </button>
            </div>
          )}
        </div>
      </PageWrapper>

      {/* Modals */}
      <AddCarModal
        open={addCarOpen}
        onClose={() => setAddCarOpen(false)}
        onAdd={async (carId: string, nickname?: string, year?: string) => { await addCar(carId, nickname, year); }}
        existingCarIds={existingCarIds}
      />
      <AddModModal
        open={addModTarget !== null}
        onClose={() => setAddModTarget(null)}
        onAdd={(mod) => {
          if (addModTarget) addMod(addModTarget, mod);
        }}
      />
    </div>
  );
}
