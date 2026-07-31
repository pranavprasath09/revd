import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import { useAuthContext } from "@/context/AuthContext";
import useGarage from "@/hooks/useGarage";
import PageHeader, { StatCluster } from "@/components/pitwall/PageHeader";
import PWButton from "@/components/pitwall/Button";
import Field, { TextareaField } from "@/components/pitwall/Field";
import { Ledger, type LedgerColumn } from "@/components/pitwall/Sheet";
import { CARS, money } from "@/lib/carData";
import type { Car } from "@/types/car";
import type { GarageCar, GarageMod } from "@/types/garage";

function carById(carId: string): Car | undefined {
  return CARS.find((c) => c.id === carId || c.slug === carId);
}

/** "$1,240" / "1240" → 1240. Unparseable costs count as zero. */
function parseCost(cost?: string): number {
  if (!cost) return 0;
  const n = Number(cost.replace(/[^0-9.]/g, ""));
  return Number.isFinite(n) ? n : 0;
}

const bayTotal = (gc: GarageCar) =>
  gc.mods.reduce((sum, m) => sum + parseCost(m.cost), 0);

const addedLabel = (iso: string) => {
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? "—"
    : d.toLocaleDateString("en-US", { month: "short", year: "numeric" });
};

/* ── Pit Wall modal frame ─────────────────────────────────────── */
function Modal({
  title,
  onClose,
  children,
}: {
  title: string;
  onClose: () => void;
  children: React.ReactNode;
}) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className="relative w-full max-w-lg border border-border-rule bg-bg-base"
      >
        <div className="flex items-center justify-between border-b border-accent px-5 py-4">
          <h2 className="font-mono text-[11px] font-bold uppercase tracking-[0.2em] text-accent">
            {title}
          </h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="cursor-pointer font-mono text-[13px] text-text-secondary transition-colors duration-100 hover:text-text-primary"
          >
            ×
          </button>
        </div>
        <div className="max-h-[70vh] overflow-y-auto p-5">{children}</div>
      </div>
    </div>
  );
}

/* ── Add Car (bay) modal ──────────────────────────────────────── */
function AddBayModal({
  onClose,
  onAdd,
  existingCarIds,
}: {
  onClose: () => void;
  onAdd: (carId: string, nickname?: string, year?: string) => void | Promise<void>;
  existingCarIds: string[];
}) {
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<Car | null>(null);
  const [nickname, setNickname] = useState("");
  const [year, setYear] = useState("");

  const results = useMemo(() => {
    if (search.length < 1) return [];
    const q = search.toLowerCase();
    return CARS.filter((c) =>
      `${c.make} ${c.model} ${c.generation}`.toLowerCase().includes(q),
    ).slice(0, 8);
  }, [search]);

  return (
    <Modal title="Open a bay" onClose={onClose}>
      {!selected ? (
        <div className="flex flex-col gap-4">
          <Field
            label="Search the database"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Make, model, or generation"
            autoFocus
          />
          {results.length > 0 && (
            <div className="border-t border-border-rule">
              {results.map((car) => {
                const added = existingCarIds.includes(car.id);
                return (
                  <button
                    key={car.id}
                    type="button"
                    disabled={added}
                    onClick={() => setSelected(car)}
                    className={`grid w-full grid-cols-[46px_1fr_auto] items-center gap-3 border-b border-border-hair py-2.5 text-left transition-colors duration-100 ${
                      added
                        ? "cursor-not-allowed opacity-40"
                        : "cursor-pointer hover:bg-bg-elevated"
                    }`}
                  >
                    <img
                      src={car.heroImage}
                      alt=""
                      loading="lazy"
                      className="h-7 w-[46px] object-cover grayscale-[0.4]"
                    />
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold tracking-[-0.015em] text-text-primary">
                        {car.make} {car.model}{" "}
                        <span className="font-mono text-xs text-accent">
                          {car.generation}
                        </span>
                      </span>
                      <span className="font-mono text-[10px] text-text-muted">
                        {car.years}
                      </span>
                    </span>
                    {added && (
                      <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-muted">
                        In garage
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          )}
          {search.length >= 1 && results.length === 0 && (
            <p className="py-4 text-center font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
              No cars match “{search}”
            </p>
          )}
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          <div className="flex items-center gap-4 border border-border-alpha p-3.5">
            <img
              src={selected.heroImage}
              alt=""
              className="h-10 w-16 object-cover grayscale-[0.35]"
            />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold tracking-[-0.015em] text-text-primary">
                {selected.make} {selected.model}
              </p>
              <p className="font-mono text-[10px] text-text-secondary">
                {selected.generation} · {selected.years}
              </p>
            </div>
            <button
              onClick={() => setSelected(null)}
              className="cursor-pointer font-mono text-[9px] uppercase tracking-[0.18em] text-accent hover:text-accent-hover"
            >
              Change
            </button>
          </div>
          <div className="grid grid-cols-2 gap-5">
            <Field
              label="Nickname"
              value={nickname}
              maxLength={100}
              onChange={(e) => setNickname(e.target.value)}
              placeholder="Track Rat"
            />
            <Field
              label="Year"
              value={year}
              maxLength={10}
              onChange={(e) => setYear(e.target.value)}
              placeholder="2003"
            />
          </div>
          <PWButton
            onClick={async () => {
              await onAdd(
                selected.id,
                nickname.trim() || undefined,
                year.trim() || undefined,
              );
              onClose();
            }}
          >
            Open bay
          </PWButton>
        </div>
      )}
    </Modal>
  );
}

/* ── Add Mod modal ────────────────────────────────────────────── */
function AddModModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (mod: Omit<GarageMod, "id">) => void;
}) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [cost, setCost] = useState("");
  const [date, setDate] = useState("");

  return (
    <Modal title="Log a mod" onClose={onClose}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (!name.trim()) return;
          onAdd({
            name: name.trim(),
            description: description.trim(),
            cost: cost.trim() || undefined,
            date: date.trim() || undefined,
          });
          onClose();
        }}
        className="flex flex-col gap-5"
      >
        <Field
          label="Item"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Bilstein B14 coilovers"
          required
          autoFocus
        />
        <TextareaField
          label="Detail"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Part numbers, brand, install notes"
          rows={3}
        />
        <div className="grid grid-cols-2 gap-5">
          <Field
            label="Cost"
            value={cost}
            onChange={(e) => setCost(e.target.value)}
            placeholder="$450"
          />
          <Field
            label="Fitted"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            placeholder="Mar 2024"
          />
        </div>
        <PWButton type="submit">Log mod</PWButton>
      </form>
    </Modal>
  );
}

/* ── Expanded bay panel ───────────────────────────────────────── */
function BayPanel({
  gc,
  car,
  onUpdate,
  onAddMod,
  onRemoveMod,
  onRemove,
}: {
  gc: GarageCar;
  car: Car;
  onUpdate: (updates: Partial<Pick<GarageCar, "nickname" | "year" | "notes">>) => void;
  onAddMod: () => void;
  onRemoveMod: (modId: string) => void;
  onRemove: () => void;
}) {
  const [editingNotes, setEditingNotes] = useState(false);
  const [notesValue, setNotesValue] = useState(gc.notes);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const slug = (s: string) => s.toLowerCase().replace(/\s+/g, "-");
  const linkClass =
    "font-mono text-[10px] uppercase tracking-[0.16em] text-text-secondary transition-colors duration-100 hover:text-accent";

  const ledgerColumns: LedgerColumn<GarageMod>[] = [
    {
      key: "n",
      label: "#",
      width: "40px",
      render: (_, i) => (
        <span className="font-mono text-[10px] text-text-secondary">
          {String(i + 1).padStart(2, "0")}
        </span>
      ),
    },
    {
      key: "item",
      label: "Item",
      width: "minmax(160px, 268px)",
      render: (m) => (
        <span className="text-sm font-medium text-text-primary">{m.name}</span>
      ),
    },
    {
      key: "detail",
      label: "Detail",
      width: "1fr",
      render: (m) => (
        <span className="block truncate pr-6 text-[13px] text-text-secondary">
          {m.description || "—"}
        </span>
      ),
    },
    {
      key: "date",
      label: "Fitted",
      width: "108px",
      render: (m) => (
        <span className="font-mono text-[11px] text-text-secondary">
          {m.date ?? "—"}
        </span>
      ),
    },
    {
      key: "cost",
      label: "Cost",
      width: "108px",
      align: "right",
      render: (m) => (
        <span className="font-mono text-[13px] text-text-primary">
          {m.cost ?? "—"}
        </span>
      ),
    },
    {
      key: "remove",
      label: "",
      width: "36px",
      align: "right",
      render: (m) => (
        <button
          onClick={() => onRemoveMod(m.id)}
          title="Remove mod"
          aria-label={`Remove ${m.name}`}
          className="cursor-pointer font-mono text-[11px] text-text-muted transition-colors duration-100 hover:text-signal-red"
        >
          ×
        </button>
      ),
    },
  ];

  return (
    <div className="border-b border-border-hair bg-bg-surface px-6 pb-[30px] pt-[26px] md:px-11">
      {/* Notes */}
      <div className="mb-[22px] flex items-baseline gap-3.5">
        <span className="shrink-0 font-mono text-[9px] uppercase tracking-[0.2em] text-text-secondary">
          Notes
        </span>
        {editingNotes ? (
          <div className="flex w-full max-w-[720px] flex-col gap-2">
            <TextareaField
              label=""
              value={notesValue}
              onChange={(e) => setNotesValue(e.target.value)}
              placeholder="Goals, current state, plans"
              rows={2}
              autoFocus
            />
            <div className="flex gap-3">
              <PWButton
                variant="secondary"
                type="button"
                onClick={() => {
                  onUpdate({ notes: notesValue.trim() });
                  setEditingNotes(false);
                }}
              >
                Save
              </PWButton>
              <button
                onClick={() => setEditingNotes(false)}
                className={`${linkClass} cursor-pointer`}
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          <button
            onClick={() => {
              setNotesValue(gc.notes);
              setEditingNotes(true);
            }}
            className="max-w-[720px] cursor-pointer text-left text-sm leading-[1.55] text-text-primary hover:text-accent"
            title="Edit notes"
          >
            {gc.notes || (
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
                + Add notes
              </span>
            )}
          </button>
        )}
      </div>

      {/* Mod ledger */}
      {gc.mods.length > 0 ? (
        <Ledger
          columns={ledgerColumns}
          rows={gc.mods}
          rowKey={(m) => m.id}
          total={{ label: "Total", value: money(bayTotal(gc)) }}
        />
      ) : (
        <p className="border-t border-border-rule py-4 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
          No mods logged for this bay yet
        </p>
      )}

      {/* Actions */}
      <div className="mt-5 flex flex-wrap items-center gap-5">
        <PWButton variant="secondary" onClick={onAddMod}>
          + Log mod
        </PWButton>
        <Link to={`/cars/${slug(car.make)}/${slug(car.model)}/${car.years.split("–")[0]}`} className={linkClass}>
          Specs
        </Link>
        <Link to={`/mods/${slug(car.make)}/${slug(car.model)}`} className={linkClass}>
          Mod guide
        </Link>
        <Link to={`/reliability/${slug(car.make)}/${slug(car.model)}`} className={linkClass}>
          Reliability
        </Link>
        <span className="flex-1" />
        {!confirmDelete ? (
          <button
            onClick={() => setConfirmDelete(true)}
            className="cursor-pointer font-mono text-[10px] uppercase tracking-[0.16em] text-text-muted transition-colors duration-100 hover:text-signal-red"
          >
            Close bay
          </button>
        ) : (
          <span className="flex items-center gap-3 font-mono text-[10px] uppercase tracking-[0.16em]">
            <span className="text-text-muted">Sure?</span>
            <button
              onClick={onRemove}
              className="cursor-pointer text-signal-red hover:opacity-80"
            >
              Yes, close it
            </button>
            <button
              onClick={() => setConfirmDelete(false)}
              className="cursor-pointer text-text-secondary hover:text-text-primary"
            >
              Cancel
            </button>
          </span>
        )}
      </div>
    </div>
  );
}

/* ── Page ─────────────────────────────────────────────────────── */
export default function GaragePage() {
  const { user, loading: authLoading } = useAuthContext();
  const {
    cars: garageCars,
    loading: garageLoading,
    addCar,
    removeCar,
    updateCar,
    addMod,
    removeMod,
  } = useGarage();
  const [addBayOpen, setAddBayOpen] = useState(false);
  const [addModTarget, setAddModTarget] = useState<string | null>(null);
  // Single-open accordion — clicking the open bay closes it
  const [openBay, setOpenBay] = useState<string | null>(null);

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
        <PageHeader kicker="Personal workshop" title="GARAGE" />
        <div className="px-6 md:px-11">
          <p className="max-w-[460px] text-sm leading-relaxed text-text-secondary">
            The garage is your workshop — bays, ledgers, and every dollar
            logged. Sign in to open yours.
          </p>
          <div className="mt-6">
            <Link to="/sign-in?redirect=/garage">
              <PWButton>Sign in</PWButton>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const totalMods = garageCars.reduce((sum, c) => sum + c.mods.length, 0);
  const totalSpend = garageCars.reduce((sum, c) => sum + bayTotal(c), 0);
  const existingCarIds = garageCars.map((c) => c.carId);

  return (
    <div className="page-enter pb-14">
      <SEOHead
        title="My Garage"
        description="Track your car builds, mods, and modifications. Your personal automotive workshop."
        canonicalUrl="https://revhub.com/garage"
      />

      <PageHeader
        kicker="Personal workshop"
        title="GARAGE"
        right={
          <StatCluster
            stats={[
              { label: "Bays", value: String(garageCars.length) },
              { label: "Mods logged", value: String(totalMods) },
              {
                label: "Spend",
                value: money(totalSpend),
                color: "var(--color-accent)",
              },
            ]}
          />
        }
      />

      <div className="border-t border-accent">
        {garageLoading ? (
          <div className="space-y-px p-6 md:p-11">
            {[1, 2].map((i) => (
              <div key={i} className="h-[74px] animate-pulse bg-bg-surface" />
            ))}
          </div>
        ) : (
          <>
            {garageCars.map((gc, i) => {
              const car = carById(gc.carId);
              if (!car) return null;
              const open = openBay === gc.id;
              return (
                <div key={gc.id}>
                  <button
                    onClick={() => setOpenBay(open ? null : gc.id)}
                    aria-expanded={open}
                    className="grid min-h-[74px] w-full cursor-pointer grid-cols-[56px_92px_1fr_40px] items-center px-6 text-left transition-colors duration-100 hover:bg-bg-elevated md:grid-cols-[56px_92px_1fr_132px_108px_120px_40px] md:px-11 border-b border-border-hair"
                  >
                    <span className="font-mono text-[11px] text-text-secondary">
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <img
                      src={car.heroImage}
                      alt=""
                      loading="lazy"
                      className="h-[46px] w-[76px] object-cover grayscale-[0.35]"
                    />
                    <span className="flex min-w-0 flex-col gap-[3px] pl-5">
                      {gc.nickname && (
                        <span className="font-mono text-[10px] uppercase tracking-[0.18em] text-accent">
                          {gc.nickname}
                        </span>
                      )}
                      <span className="truncate text-[17px] font-semibold tracking-[-0.02em] text-text-primary">
                        {gc.year ? `${gc.year} ` : ""}
                        {car.make} {car.model}
                      </span>
                      <span className="font-mono text-[10px] text-text-secondary">
                        {car.generation} · {car.performance.drivetrain} ·{" "}
                        {car.engines[0]?.power}
                      </span>
                    </span>
                    <span className="hidden flex-col gap-[3px] md:flex">
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-secondary">
                        Mods
                      </span>
                      <span className="font-mono text-[15px] font-semibold text-text-primary">
                        {gc.mods.length}
                      </span>
                    </span>
                    <span className="hidden flex-col gap-[3px] md:flex">
                      <span className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-secondary">
                        Logged
                      </span>
                      <span className="font-mono text-[15px] font-semibold text-accent">
                        {money(bayTotal(gc))}
                      </span>
                    </span>
                    <span className="hidden font-mono text-[9px] uppercase tracking-[0.18em] text-text-secondary md:block">
                      {addedLabel(gc.addedAt)}
                    </span>
                    <span className="text-right font-mono text-[13px] text-accent">
                      {open ? "−" : "+"}
                    </span>
                  </button>
                  {open && (
                    <BayPanel
                      gc={gc}
                      car={car}
                      onUpdate={(updates) => updateCar(gc.id, updates)}
                      onAddMod={() => setAddModTarget(gc.id)}
                      onRemoveMod={(modId) => removeMod(gc.id, modId)}
                      onRemove={() => {
                        setOpenBay(null);
                        removeCar(gc.id);
                      }}
                    />
                  )}
                </div>
              );
            })}

            <div className="flex items-center gap-4 border-b border-border-hair px-6 py-5 md:px-11">
              <PWButton variant="secondary" onClick={() => setAddBayOpen(true)}>
                + Add bay
              </PWButton>
              <span className="font-mono text-[10px] uppercase tracking-[0.14em] text-text-secondary max-md:hidden">
                {garageCars.length > 0
                  ? "Click a bay to open its ledger"
                  : "Open your first bay to start the ledger"}
              </span>
            </div>
          </>
        )}
      </div>

      {addBayOpen && (
        <AddBayModal
          onClose={() => setAddBayOpen(false)}
          onAdd={async (carId, nickname, year) => {
            await addCar(carId, nickname, year);
          }}
          existingCarIds={existingCarIds}
        />
      )}
      {addModTarget && (
        <AddModModal
          onClose={() => setAddModTarget(null)}
          onAdd={(mod) => addMod(addModTarget, mod)}
        />
      )}
    </div>
  );
}
