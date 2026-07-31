/**
 * Margin opening spread — text half beside a full-bleed photograph.
 *
 * The photo scrim here is deliberately not themed: it sits over a
 * photograph, never over page background, so a fixed dark scrim with light
 * type is correct and legible on every palette (FORMATS.md § Opening spread).
 */
export function SpreadImage({
  image,
  alt,
  caption,
  minHeight = 460,
}: {
  image: string;
  alt: string;
  caption?: string;
  minHeight?: number;
}) {
  return (
    <div className="relative overflow-hidden" style={{ minHeight }}>
      <img src={image} alt={alt} className="absolute inset-0 h-full w-full object-cover" />
      {caption && (
        <div
          className="absolute inset-x-0 bottom-0 px-8 py-[26px]"
          style={{
            background: "linear-gradient(to top, rgba(10,11,13,0.92), transparent)",
          }}
        >
          <p className="font-editorial text-[15px] italic text-white/[0.78]">{caption}</p>
        </div>
      )}
    </div>
  );
}

export default function OpeningSpread({
  kicker,
  headline,
  standfirst,
  actions,
  image,
  alt,
  caption,
  facts,
}: {
  kicker: string;
  /** Serif 76px headline — pass an <em className="..."> for the italic accent word. */
  headline: React.ReactNode;
  standfirst?: React.ReactNode;
  /** Link / button row under the standfirst. */
  actions?: React.ReactNode;
  image: string;
  alt: string;
  caption?: string;
  /** Optional serif fact grid (meet detail's date/time/location block). */
  facts?: { label: string; value: string }[];
}) {
  return (
    <div className="grid border-b border-border-alpha md:grid-cols-2">
      <div className="flex flex-col justify-center px-6 py-12 md:px-14 md:pb-[60px] md:pt-[68px]">
        <div className="mb-[22px] font-mono text-[9px] uppercase tracking-[0.28em] text-accent">
          {kicker}
        </div>
        <h1 className="font-editorial text-[44px] font-normal leading-[0.96] tracking-[-0.02em] text-text-primary md:text-[76px]">
          {headline}
        </h1>
        {standfirst && (
          <p
            className="mt-[26px] max-w-[460px] text-base leading-[1.65] text-text-secondary"
            style={{ textWrap: "pretty" }}
          >
            {standfirst}
          </p>
        )}
        {facts && (
          <div className="mt-7 grid grid-cols-2 gap-x-14 gap-y-5 md:w-max">
            {facts.map((f) => (
              <div key={f.label}>
                <div className="font-mono text-[9px] uppercase tracking-[0.22em] text-text-secondary">
                  {f.label}
                </div>
                <div className="mt-1 font-editorial text-2xl text-text-primary">
                  {f.value}
                </div>
              </div>
            ))}
          </div>
        )}
        {actions && <div className="mt-8 flex items-center gap-[26px]">{actions}</div>}
      </div>
      <SpreadImage image={image} alt={alt} caption={caption} />
    </div>
  );
}

/** The primary mono link with an accent underline. */
export function SpreadLink({
  children,
  primary = false,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement> & { primary?: boolean }) {
  return (
    <a
      className={`cursor-pointer font-mono text-[11px] uppercase tracking-[0.2em] transition-colors duration-100 ${
        primary
          ? "border-b border-accent pb-1 text-text-primary hover:text-accent"
          : "text-text-secondary hover:text-accent"
      }`}
      {...props}
    >
      {children}
    </a>
  );
}
