export interface SheetColumn<T> {
  key: string;
  label: React.ReactNode;
  /** Grid track, e.g. "44px" or "1fr". Header and body share one template. */
  width: string;
  align?: "left" | "right";
  sortable?: boolean;
  /** Hide this column below md (the 3–4 columns that matter stay). */
  optional?: boolean;
  render: (row: T, index: number) => React.ReactNode;
}

const alignClass = (align?: "left" | "right") =>
  align === "right" ? "text-right justify-self-end" : "";

/**
 * The timing sheet — everything tabular in Pit Wall is a variant of this.
 * Header and body rows share the same grid template so columns cannot drift.
 */
export default function Sheet<T>({
  columns,
  rows,
  rowKey,
  onSort,
  onRowClick,
  onRowHover,
  rowHeight = 44,
  renderExpanded,
  expandedKey,
}: {
  columns: SheetColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  /** Called with the column key when a sortable header is clicked. */
  onSort?: (key: string) => void;
  onRowClick?: (row: T, index: number) => void;
  /** Fires as the pointer enters a row — drives hover preview panels. */
  onRowHover?: (row: T, index: number) => void;
  rowHeight?: number;
  /** Render prop for the bay/expandable pattern. */
  renderExpanded?: (row: T, index: number) => React.ReactNode;
  expandedKey?: string | null;
}) {
  const template = columns.map((c) => c.width).join(" ");
  const mdTemplate = columns
    .filter((c) => !c.optional)
    .map((c) => c.width)
    .join(" ");

  return (
    <div>
      {/* Header row — 34px, accent bottom border */}
      <div
        className="grid h-[34px] items-center border-b border-accent font-mono text-[9px] uppercase tracking-[0.2em] text-text-secondary max-md:[grid-template-columns:var(--sheet-cols-sm)] md:[grid-template-columns:var(--sheet-cols)]"
        style={
          {
            "--sheet-cols": template,
            "--sheet-cols-sm": mdTemplate,
          } as React.CSSProperties
        }
        role="row"
      >
        {columns.map((c) =>
          c.sortable && onSort ? (
            <button
              key={c.key}
              onClick={() => onSort(c.key)}
              className={`cursor-pointer whitespace-nowrap bg-transparent p-0 text-left font-mono text-[9px] uppercase tracking-[0.2em] text-text-secondary transition-colors duration-100 hover:text-accent ${alignClass(c.align)} ${c.optional ? "max-md:hidden" : ""}`}
            >
              {c.label}
            </button>
          ) : (
            <span
              key={c.key}
              className={`whitespace-nowrap ${alignClass(c.align)} ${c.optional ? "max-md:hidden" : ""}`}
            >
              {c.label}
            </span>
          ),
        )}
      </div>

      {/* Body rows — hairline separators, elevated hover */}
      {rows.map((row, i) => {
        const key = rowKey(row, i);
        const open = expandedKey != null && key === expandedKey;
        return (
          <div key={key}>
            <div
              role="row"
              onClick={onRowClick ? () => onRowClick(row, i) : undefined}
              onMouseEnter={onRowHover ? () => onRowHover(row, i) : undefined}
              className={`group grid items-center border-b border-border-hair transition-colors duration-100 hover:bg-bg-elevated max-md:[grid-template-columns:var(--sheet-cols-sm)] md:[grid-template-columns:var(--sheet-cols)] ${
                onRowClick ? "cursor-pointer" : ""
              }`}
              style={
                {
                  minHeight: rowHeight,
                  "--sheet-cols": template,
                  "--sheet-cols-sm": mdTemplate,
                } as React.CSSProperties
              }
            >
              {columns.map((c) => (
                <span
                  key={c.key}
                  className={`min-w-0 ${alignClass(c.align)} ${c.optional ? "max-md:hidden" : ""}`}
                >
                  {c.render(row, i)}
                </span>
              ))}
            </div>
            {open && renderExpanded && renderExpanded(row, i)}
          </div>
        );
      })}
    </div>
  );
}

/** Zero-padded position number — turns accent on row hover. */
export function PosCell({ index }: { index: number }) {
  return (
    <span className="font-mono text-[11px] text-text-muted transition-colors duration-100 group-hover:text-accent">
      {String(index + 1).padStart(2, "0")}
    </span>
  );
}

/** Car cell — 46×28 grayscale thumbnail, name, years. */
export function CarCell({
  hero,
  name,
  years,
}: {
  hero: string;
  name: string;
  years?: string;
}) {
  return (
    <span className="flex min-w-0 items-center gap-3 pr-5">
      <img
        src={hero}
        alt=""
        loading="lazy"
        className="h-7 w-[46px] shrink-0 object-cover grayscale-[0.4]"
      />
      <span className="overflow-hidden text-ellipsis whitespace-nowrap text-sm font-semibold tracking-[-0.015em] text-text-primary">
        {name}
      </span>
      {years && (
        <span className="whitespace-nowrap font-mono text-[10px] text-text-muted max-lg:hidden">
          {years}
        </span>
      )}
    </span>
  );
}

export interface LedgerColumn<T> {
  key: string;
  label: React.ReactNode;
  width: string;
  align?: "left" | "right";
  render: (row: T, index: number) => React.ReactNode;
}

/**
 * Nested ledger — the table inside a bay, parts list, or fault sheet.
 * 28px header, 36px rows, closing accent-ruled total row.
 */
export function Ledger<T>({
  columns,
  rows,
  rowKey,
  total,
}: {
  columns: LedgerColumn<T>[];
  rows: T[];
  rowKey: (row: T, index: number) => string;
  /** Total row — label + accent figure, right-aligned in the last two columns. */
  total?: { label: string; value: string };
}) {
  const template = columns.map((c) => c.width).join(" ");
  return (
    <div>
      <div
        className="grid h-7 items-center border-b border-border-rule font-mono text-[9px] uppercase tracking-[0.2em] text-text-secondary"
        style={{ gridTemplateColumns: template }}
      >
        {columns.map((c) => (
          <span key={c.key} className={alignClass(c.align)}>
            {c.label}
          </span>
        ))}
      </div>
      {rows.map((row, i) => (
        <div
          key={rowKey(row, i)}
          className="grid min-h-9 items-center border-b border-border-hair"
          style={{ gridTemplateColumns: template }}
        >
          {columns.map((c) => (
            <span key={c.key} className={`min-w-0 ${alignClass(c.align)}`}>
              {c.render(row, i)}
            </span>
          ))}
        </div>
      ))}
      {total && (
        <div
          className="grid h-10 items-center border-t border-accent"
          style={{ gridTemplateColumns: template }}
        >
          {columns.map((c, i) => {
            if (i === columns.length - 2)
              return (
                <span
                  key={c.key}
                  className="font-mono text-[9px] uppercase tracking-[0.2em] text-text-secondary"
                >
                  {total.label}
                </span>
              );
            if (i === columns.length - 1)
              return (
                <span
                  key={c.key}
                  className="text-right font-mono text-[15px] font-semibold text-accent"
                >
                  {total.value}
                </span>
              );
            return <span key={c.key} />;
          })}
        </div>
      )}
    </div>
  );
}
