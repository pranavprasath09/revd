import { useMemo } from "react";
import { useParams, Link } from "react-router-dom";
import Badge from "@/components/ui/Badge";
import Button from "@/components/ui/Button";
import PremiumGate from "@/components/ui/PremiumGate";
import SEOHead from "@/components/ui/SEOHead";
import PageWrapper from "@/components/layout/PageWrapper";
import carsData from "@/data/cars.json";
import type { Car } from "@/types/car";

interface ReliabilityIssue {
  id: string;
  name: string;
  description: string;
  severity: "Low" | "Medium" | "High";
  isPremium: boolean;
  fixCostEstimate?: string;
  mileageRange?: string;
}

interface ReliabilityData {
  carId: string;
  make: string;
  model: string;
  generation: string;
  overallScore: number;
  summary: string;
  issues: ReliabilityIssue[];
  buyingTips: string[];
}

const reliabilityFiles: Record<string, ReliabilityData> = import.meta.glob(
  "@/data/reliability/*.json",
  { eager: true, import: "default" }
) as Record<string, ReliabilityData>;

const SEVERITY_BG: Record<string, string> = {
  Low: "bg-emerald-400",
  Medium: "bg-amber-400",
  High: "bg-red-400",
};

function findCar(make?: string, model?: string): Car | undefined {
  if (!make || !model) return undefined;
  const makeLower = make.toLowerCase();
  const modelLower = model.toLowerCase();
  return (carsData as Car[]).find(
    (car) =>
      car.make.toLowerCase() === makeLower &&
      car.model.toLowerCase().replace(/\s+/g, "-") === modelLower
  );
}

function findReliabilityData(slug: string): ReliabilityData | undefined {
  const entry = Object.entries(reliabilityFiles).find(([path]) =>
    path.endsWith(`/${slug}.json`)
  );
  return entry?.[1];
}

function getScoreColor(score: number): string {
  if (score >= 75) return "#22c55e";
  if (score >= 50) return "#eab308";
  return "#ef4444";
}

function getScoreLabel(score: number): string {
  if (score >= 85) return "Excellent";
  if (score >= 75) return "Good";
  if (score >= 60) return "Average";
  if (score >= 50) return "Below Average";
  return "Poor";
}

function ScoreGauge({ score }: { score: number }) {
  const color = getScoreColor(score);
  const label = getScoreLabel(score);
  const radius = 80;
  const strokeWidth = 10;
  const circumference = Math.PI * radius;
  const progress = (score / 100) * circumference;
  const cx = 100;
  const cy = 100;

  return (
    <div className="flex flex-col items-center">
      <svg
        width="200"
        height="120"
        viewBox="0 0 200 120"
        className="overflow-visible"
        aria-label={`Reliability score: ${score} out of 100`}
        role="img"
      >
        {/* Background arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke="#2a2a2a"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Score arc */}
        <path
          d={`M ${cx - radius} ${cy} A ${radius} ${radius} 0 0 1 ${cx + radius} ${cy}`}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={`${progress} ${circumference}`}
          className="transition-all duration-1000 ease-out"
        />
        {/* Score number */}
        <text
          x={cx}
          y={cy - 12}
          textAnchor="middle"
          className="fill-text-primary"
          style={{ fontSize: "42px", fontWeight: 800, letterSpacing: "-0.03em" }}
        >
          {score}
        </text>
        {/* Label */}
        <text
          x={cx}
          y={cy + 8}
          textAnchor="middle"
          className="fill-text-muted"
          style={{ fontSize: "11px", fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.1em" }}
        >
          {label}
        </text>
      </svg>
      <p className="text-xs text-text-muted mt-1">out of 100</p>
    </div>
  );
}

function IssueCard({ issue }: { issue: ReliabilityIssue }) {
  const hasPremiumContent =
    issue.isPremium && (issue.fixCostEstimate || issue.mileageRange);

  return (
    <div className="rounded-xl border border-border bg-bg-surface overflow-hidden">
      <div className="p-5 sm:p-6">
        {/* Header */}
        <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
          <div className="flex items-center gap-2.5">
            {/* Severity dot */}
            <span
              className={`h-2.5 w-2.5 rounded-full flex-shrink-0 ${SEVERITY_BG[issue.severity]}`}
              aria-hidden="true"
            />
            <h3 className="text-base font-bold tracking-tight text-text-primary">
              {issue.name}
            </h3>
          </div>
          <div className="flex items-center gap-2">
            {issue.isPremium && <Badge variant="premium">Premium</Badge>}
            <Badge variant="difficulty">{issue.severity}</Badge>
          </div>
        </div>

        {/* Description */}
        <p className="text-sm leading-relaxed text-text-secondary">
          {issue.description}
        </p>
      </div>

      {/* Premium-gated details */}
      {hasPremiumContent && (
        <div className="border-t border-border">
          <PremiumGate feature="Full Reliability Report">
            <div className="p-5 sm:p-6 flex flex-wrap gap-6">
              {issue.fixCostEstimate && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                    Est. Fix Cost
                  </p>
                  <p className="text-sm font-semibold text-text-primary">
                    {issue.fixCostEstimate}
                  </p>
                </div>
              )}
              {issue.mileageRange && (
                <div>
                  <p className="text-[10px] font-bold uppercase tracking-wider text-text-muted mb-1">
                    Typical Mileage
                  </p>
                  <p className="text-sm font-semibold text-text-primary">
                    {issue.mileageRange}
                  </p>
                </div>
              )}
            </div>
          </PremiumGate>
        </div>
      )}
    </div>
  );
}

export default function ReliabilityPage() {
  const { make, model } = useParams();

  const car = useMemo(() => findCar(make, model), [make, model]);
  const reliabilityData = useMemo(
    () => (car ? findReliabilityData(car.slug) : undefined),
    [car]
  );

  const displayMake = reliabilityData?.make ?? car?.make ?? make ?? "";
  const displayModel = reliabilityData?.model ?? car?.model ?? model ?? "";
  const displayGen = reliabilityData?.generation ?? car?.generation ?? "";

  const pageTitle = `${displayMake} ${displayModel}${displayGen ? ` ${displayGen}` : ""} Reliability`;
  const pageDescription = `Reliability report for the ${displayMake} ${displayModel}${displayGen ? ` (${displayGen})` : ""} — overall score, common issues, severity ratings, and buying tips.`;

  // Severity summary counts
  const severityCounts = useMemo(() => {
    if (!reliabilityData) return { Low: 0, Medium: 0, High: 0 };
    return reliabilityData.issues.reduce(
      (acc, issue) => {
        acc[issue.severity]++;
        return acc;
      },
      { Low: 0, Medium: 0, High: 0 } as Record<string, number>
    );
  }, [reliabilityData]);

  // Car not found
  if (!car) {
    return (
      <>
        <SEOHead title="Car Not Found" description="The requested car was not found." />
        <PageWrapper>
          <div className="flex flex-col items-center justify-center py-24 text-center">
            <div className="mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-bg-surface border border-border">
              <svg
                className="h-8 w-8 text-text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-text-primary mb-2">
              Car Not Found
            </h1>
            <p className="text-text-secondary mb-6 max-w-md">
              We couldn't find a car matching "{make} {model}" in our database.
            </p>
            <Link to="/cars">
              <Button variant="secondary" size="md">
                Browse All Cars
              </Button>
            </Link>
          </div>
        </PageWrapper>
      </>
    );
  }

  return (
    <div className="page-enter">
      <SEOHead
        title={pageTitle}
        description={pageDescription}
        canonicalUrl={`https://revhub.com/reliability/${make}/${model}`}
      />
      <PageWrapper>
        {/* Breadcrumb + back link */}
        <div className="mb-6">
          <Link
            to={`/cars/${make}/${model}`}
            className="inline-flex items-center gap-1.5 text-sm text-text-muted hover:text-text-secondary transition-colors"
          >
            <svg
              className="h-4 w-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <polyline points="15 18 9 12 15 6" />
            </svg>
            Back to {displayMake} {displayModel}
          </Link>
        </div>

        {/* Page header */}
        <header className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-widest text-accent-red mb-2">
            Reliability Report
          </p>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-text-primary leading-none">
            {displayMake} {displayModel}
          </h1>
          {displayGen && (
            <p className="mt-1.5 text-lg text-text-secondary font-medium">
              {displayGen} Generation
            </p>
          )}
        </header>

        {/* No reliability data state */}
        {!reliabilityData && (
          <div className="rounded-xl border border-border bg-bg-surface p-12 text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-bg-elevated">
              <svg
                className="h-7 w-7 text-text-muted"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={2}
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M9 12l2 2 4-4" />
                <path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20z" />
              </svg>
            </div>
            <h2 className="text-lg font-bold text-text-primary mb-2">
              No Reliability Data Available Yet
            </h2>
            <p className="text-sm text-text-secondary max-w-md mx-auto">
              We're still compiling reliability data for the {displayMake}{" "}
              {displayModel}. Check back soon — or browse our other reliability
              reports.
            </p>
          </div>
        )}

        {/* Reliability content */}
        {reliabilityData && (
          <>
            {/* Score + summary hero section */}
            <div className="rounded-xl border border-border bg-bg-surface p-6 sm:p-8 mb-8">
              <div className="flex flex-col sm:flex-row items-center gap-8">
                {/* Gauge */}
                <div className="flex-shrink-0">
                  <ScoreGauge score={reliabilityData.overallScore} />
                </div>

                {/* Summary + quick stats */}
                <div className="flex-1 text-center sm:text-left">
                  <p className="text-[10px] font-bold uppercase tracking-widest text-text-muted mb-2">
                    Overall Reliability
                  </p>
                  <p className="text-sm leading-relaxed text-text-secondary mb-5">
                    {reliabilityData.summary}
                  </p>

                  {/* Severity summary */}
                  <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-red-400" aria-hidden="true" />
                      <span className="text-xs text-text-secondary">
                        <span className="font-bold text-text-primary">{severityCounts.High}</span> High
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-400" aria-hidden="true" />
                      <span className="text-xs text-text-secondary">
                        <span className="font-bold text-text-primary">{severityCounts.Medium}</span> Medium
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-400" aria-hidden="true" />
                      <span className="text-xs text-text-secondary">
                        <span className="font-bold text-text-primary">{severityCounts.Low}</span> Low
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Common Issues */}
            <section className="mb-8">
              <h2 className="text-[11px] font-bold uppercase tracking-widest text-text-muted mb-4">
                Common Issues ({reliabilityData.issues.length})
              </h2>
              <div className="space-y-4">
                {reliabilityData.issues.map((issue) => (
                  <IssueCard key={issue.id} issue={issue} />
                ))}
              </div>
            </section>

            {/* Buying Tips */}
            {reliabilityData.buyingTips.length > 0 && (
              <section className="rounded-xl border border-border bg-bg-surface p-6 sm:p-8">
                <div className="flex items-center gap-2.5 mb-4">
                  <svg
                    className="h-5 w-5 text-accent-red"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth={2}
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="16" x2="12" y2="12" />
                    <line x1="12" y1="8" x2="12.01" y2="8" />
                  </svg>
                  <h2 className="text-lg font-bold tracking-tight text-text-primary">
                    What to Look for When Buying
                  </h2>
                </div>
                <ul className="space-y-3">
                  {reliabilityData.buyingTips.map((tip, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-accent-red" aria-hidden="true" />
                      <span className="text-sm leading-relaxed text-text-secondary">
                        {tip}
                      </span>
                    </li>
                  ))}
                </ul>
              </section>
            )}
          </>
        )}
      </PageWrapper>
    </div>
  );
}
