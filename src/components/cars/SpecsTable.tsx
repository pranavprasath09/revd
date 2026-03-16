interface SpecRow {
  label: string;
  value: string | number;
}

interface SpecsTableProps {
  specs: SpecRow[];
  title?: string;
}

export default function SpecsTable({ specs, title }: SpecsTableProps) {
  return (
    <div>
      {title && (
        <h3 className="mb-4 text-xs font-bold uppercase tracking-wider text-text-muted">
          {title}
        </h3>
      )}
      <div className="overflow-hidden rounded-xl border border-border">
        {specs.map((spec, index) => (
          <div
            key={spec.label}
            className={`flex items-center justify-between px-5 py-3.5 ${
              index % 2 === 0 ? "bg-bg-surface" : "bg-bg-surface/50"
            } ${index !== specs.length - 1 ? "border-b border-border/50" : ""}`}
          >
            <span className="text-xs font-medium uppercase tracking-wider text-text-muted">
              {spec.label}
            </span>
            <span className="font-semibold text-text-primary">{spec.value}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
