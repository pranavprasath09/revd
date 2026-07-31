import { useMemo } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import SEOHead from "@/components/ui/SEOHead";
import PageHeader, { StatCluster } from "@/components/pitwall/PageHeader";
import PWButton from "@/components/pitwall/Button";
import ScoreBar, { ScoreCell } from "@/components/pitwall/ScoreBar";
import { useAuthContext } from "@/context/AuthContext";
import { CARS, carPath } from "@/lib/carData";
import { RELIABILITY, severityColor } from "@/lib/guides";
import { reliabilityColor } from "@/lib/themes";
import type { Car } from "@/types/car";

const slugify = (s: string) => s.toLowerCase().replace(/\s+/g, "-");

const SECTION_LABEL =
  "font-mono text-[9px] uppercase tracking-[0.24em] text-text-secondary";
const HEAD_ROW =
  "grid h-[30px] items-center border-b border-accent font-mono text-[9px] uppercase tracking-[0.2em] text-text-secondary";

function findCar(make?: string, model?: string): Car | undefined {
  if (!make || !model) return undefined;
  return CARS.find(
    (c) => slugify(c.make) === make && slugify(c.model) === model,
  );
}

export default function ReliabilityPage() {
  const { make, model } = useParams();
  const navigate = useNavigate();
  const { isPremium } = useAuthContext();

  const car = useMemo(() => findCar(make, model), [make, model]);
  const data = car ? RELIABILITY.get(car.id) : undefined;

  const verdict = (score: number) =>
    score >= 80 ? "Buy freely" : score >= 65 ? "Inspect first" : "Specialist only";

  // Other scored models by the same make
  const siblings = useMemo(
    () =>
      car
        ? CARS.filter(
            (c) => c.make === car.make && c.id !== car.id && RELIABILITY.has(c.id),
          )
        : [],
    [car],
  );

  if (!car || !data) {
    return (
      <div className="page-enter px-6 pb-[72px] pt-[34px] md:px-11">
        <SEOHead
          title="Report not found"
          description="No reliability report at this address."
        />
        <div className="font-mono text-[9px] uppercase tracking-[0.24em] text-signal-red">
          Error
        </div>
        <h1 className="mt-2 font-mono text-[56px] font-bold leading-[0.9] tracking-[-0.045em] md:text-[96px]">
          404
        </h1>
        <p className="mt-4 max-w-[460px] text-[15px] leading-relaxed text-text-secondary">
          No reliability report at that address.
        </p>
        <div className="mt-7">
          <Link
            to="/reliability"
            className="border-b border-accent pb-1 font-mono text-[10px] uppercase tracking-[0.2em] text-accent"
          >
            Back to the index
          </Link>
        </div>
      </div>
    );
  }

  const highCount = data.issues.filter(
    (i) => i.severity.toLowerCase() === "high",
  ).length;

  return (
    <div className="page-enter pb-[72px]">
      <SEOHead
        title={`${data.make} ${data.model} ${data.generation} Reliability`}
        description={`Reliability report for the ${data.make} ${data.model} (${data.generation}) — score, known faults, and buying notes.`}
      />

      <PageHeader
        breadcrumb={[
          { label: "Reliability" },
          { label: data.make },
          { label: data.model, accent: true },
        ]}
        title={`${data.make} ${data.model}`.toUpperCase()}
        titleSize={44}
        right={
          <StatCluster
            stats={[
              {
                label: "Score",
                value: String(data.overallScore),
                color: reliabilityColor(data.overallScore),
              },
              { label: "Faults", value: String(data.issues.length) },
              {
                label: "High sev.",
                value: String(highCount),
                color:
                  highCount > 0
                    ? "var(--color-signal-red)"
                    : "var(--color-text-primary)",
              },
            ]}
          />
        }
      />

      <div className="border-t border-accent px-6 pt-[26px] md:px-11">
        {/* Verdict strip */}
        <div className="flex flex-wrap items-center gap-5">
          <img
            src={car.heroImage}
            alt=""
            className="h-[46px] w-[76px] object-cover grayscale-[0.35]"
          />
          <div className="max-w-[300px] flex-1">
            <ScoreBar score={data.overallScore} flex height={5} />
          </div>
          <span
            className="font-mono text-base font-semibold"
            style={{ color: reliabilityColor(data.overallScore) }}
          >
            {data.overallScore}
          </span>
          <span className="font-mono text-[9px] uppercase tracking-[0.18em] text-text-secondary">
            {verdict(data.overallScore)}
          </span>
          <span className="font-mono text-[10px] text-text-muted">
            {data.generation} · {car.years}
          </span>
        </div>
        <p className="mt-4 max-w-[720px] text-sm leading-relaxed text-text-secondary">
          {data.summary}
        </p>

        {/* Fault ledger */}
        <div className={`${SECTION_LABEL} pb-2.5 pt-[34px]`}>Fault ledger</div>
        <div className="overflow-x-auto">
          <div className="min-w-[560px]">
            <div
              className={HEAD_ROW}
              style={{ gridTemplateColumns: "40px 1fr 116px 148px 124px" }}
            >
              <span>#</span>
              <span>Fault</span>
              <span>Severity</span>
              <span>Mileage</span>
              <span className="text-right">Est. cost</span>
            </div>
            {data.issues.map((issue, i) => {
              const locked = issue.isPremium && !isPremium;
              return (
                <div
                  key={issue.id}
                  className="grid min-h-9 items-center border-b border-border-hair py-2 transition-colors duration-100 hover:bg-bg-elevated"
                  style={{ gridTemplateColumns: "40px 1fr 116px 148px 124px" }}
                >
                  <span className="font-mono text-[10px] text-text-secondary">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span className="flex min-w-0 flex-col gap-1 pr-6">
                    <span className="flex items-center gap-2.5 text-sm font-medium text-text-primary">
                      {issue.name}
                      {issue.isPremium && (
                        <span className="border border-accent px-1.5 py-px font-mono text-[8px] uppercase tracking-[0.18em] text-accent">
                          Pro
                        </span>
                      )}
                    </span>
                    {!locked && (
                      <span className="text-[13px] leading-relaxed text-text-secondary">
                        {issue.description}
                      </span>
                    )}
                  </span>
                  <span
                    className="font-mono text-[11px] uppercase tracking-[0.08em]"
                    style={{ color: severityColor(issue.severity) }}
                  >
                    {issue.severity}
                  </span>
                  <span className="font-mono text-[11px] text-text-secondary">
                    {locked ? "—" : (issue.mileageRange ?? "—")}
                  </span>
                  <span className="text-right font-mono text-[13px] text-text-primary">
                    {locked ? "—" : (issue.fixCostEstimate ?? "—")}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
        {data.issues.some((i) => i.isPremium) && !isPremium && (
          <p className="mt-3 font-mono text-[10px] uppercase tracking-[0.14em] text-text-muted">
            Pro faults show cost and mileage with a{" "}
            <Link to="/premium" className="text-accent">
              premium membership
            </Link>
          </p>
        )}

        {/* Buying notes */}
        {data.buyingTips.length > 0 && (
          <>
            <div className={`${SECTION_LABEL} pb-2.5 pt-[34px]`}>
              Buying notes
            </div>
            {data.buyingTips.map((tip, i) => (
              <div
                key={tip}
                className="grid grid-cols-[40px_1fr] items-baseline border-b border-border-hair py-2.5"
              >
                <span className="font-mono text-[10px] text-accent">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span className="max-w-[720px] text-sm leading-relaxed text-text-secondary">
                  {tip}
                </span>
              </div>
            ))}
          </>
        )}

        <div className="mt-7 flex flex-wrap gap-3">
          <Link to={carPath(car)}>
            <PWButton variant="secondary">Full spec sheet</PWButton>
          </Link>
          <Link to={`/mods/${slugify(car.make)}/${slugify(car.model)}`}>
            <PWButton variant="quiet">Mod guides</PWButton>
          </Link>
        </div>

        {/* Other scored models from the same make */}
        {siblings.length > 0 && (
          <>
            <div className={`${SECTION_LABEL} pb-2.5 pt-12`}>
              More {data.make} reports
            </div>
            <div
              className={HEAD_ROW}
              style={{ gridTemplateColumns: "1fr 88px 176px" }}
            >
              <span>Car</span>
              <span>Gen</span>
              <span>Score</span>
            </div>
            {siblings.map((c) => (
              <div
                key={c.id}
                onClick={() =>
                  navigate(`/reliability/${slugify(c.make)}/${slugify(c.model)}`)
                }
                className="grid h-11 cursor-pointer items-center border-b border-border-hair transition-colors duration-100 hover:bg-bg-elevated"
                style={{ gridTemplateColumns: "1fr 88px 176px" }}
              >
                <span className="flex min-w-0 items-center gap-3">
                  <img
                    src={c.heroImage}
                    alt=""
                    loading="lazy"
                    className="h-7 w-[46px] shrink-0 object-cover grayscale-[0.4]"
                  />
                  <span className="truncate text-sm font-semibold tracking-[-0.015em] text-text-primary">
                    {c.make} {c.model}
                  </span>
                </span>
                <span className="font-mono text-xs font-semibold text-accent">
                  {c.generation}
                </span>
                <ScoreCell
                  score={RELIABILITY.get(c.id)!.overallScore}
                  flex
                  height={5}
                  emphasize
                />
              </div>
            ))}
          </>
        )}
      </div>
    </div>
  );
}
