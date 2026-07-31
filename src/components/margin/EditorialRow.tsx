import { Link } from "react-router-dom";

/** Kicker row — mono accent word, short rule, muted timestamp. */
export function KickerRule({
  kicker,
  info,
  tracking = "0.2em",
}: {
  kicker: string;
  info?: string;
  tracking?: string;
}) {
  return (
    <div
      className="flex items-center gap-3 font-mono text-[9px] uppercase text-accent"
      style={{ letterSpacing: tracking }}
    >
      <span>{kicker}</span>
      <span className="h-px w-[30px] bg-border-rule" />
      {info && <span className="text-text-muted">{info}</span>}
    </div>
  );
}

/**
 * Editorial feed entry — kicker rule, serif headline, italic byline and an
 * action slot beside a captioned margin image.
 */
export default function EditorialRow({
  kicker,
  timestamp,
  title,
  byline,
  actions,
  image,
  caption,
  to,
}: {
  kicker: string;
  timestamp?: string;
  title: string;
  byline?: string;
  actions?: React.ReactNode;
  image?: string;
  caption?: string;
  to?: string;
}) {
  const headline = (
    <h3 className="mt-3 font-editorial text-[24px] font-normal leading-[1.12] text-text-primary transition-colors duration-150 hover:text-accent md:text-[32px]">
      {title}
    </h3>
  );
  return (
    <div className="grid gap-8 border-b border-border-alpha py-[30px] md:grid-cols-[1fr_208px]">
      <div>
        <KickerRule kicker={kicker} info={timestamp} />
        {to ? <Link to={to}>{headline}</Link> : headline}
        {byline && (
          <p className="mt-2 font-editorial text-[15px] italic text-text-secondary">
            {byline}
          </p>
        )}
        {actions && <div className="mt-[18px] flex items-center gap-4">{actions}</div>}
      </div>
      {image && (
        <div>
          <img
            src={image}
            alt=""
            loading="lazy"
            className="block w-full object-cover"
            style={{ aspectRatio: "4 / 3" }}
          />
          {caption && (
            <p className="mt-2 font-editorial text-xs italic text-text-muted">
              {caption}
            </p>
          )}
        </div>
      )}
    </div>
  );
}
