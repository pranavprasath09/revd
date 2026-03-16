import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "@/components/ui/SearchBar";
import carsData from "@/data/cars.json";
import type { Car } from "@/types/car";

const cars = carsData as Car[];

const POPULAR_SEARCHES = ["BMW E46", "Supra A80", "MX-5 Miata", "911 GT3", "Skyline R34"];

const HERO_WORDS: Array<{ text: string; red?: boolean }> = [
  { text: "EVERY" },
  { text: "CAR." },
  { text: "EVERY" },
  { text: "MOD." },
  { text: "ONE", red: true },
  { text: "PLATFORM.", red: true },
];

export default function AnimatedHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [visibleWords, setVisibleWords] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [showTags, setShowTags] = useState(false);

  // Word-by-word reveal
  useEffect(() => {
    const timers: ReturnType<typeof setTimeout>[] = [];
    HERO_WORDS.forEach((_, i) => {
      timers.push(setTimeout(() => setVisibleWords(i + 1), 200 + i * 150));
    });
    timers.push(setTimeout(() => setShowContent(true), 200 + HERO_WORDS.length * 150 + 200));
    timers.push(setTimeout(() => setShowTags(true), 200 + HERO_WORDS.length * 150 + 500));
    return () => timers.forEach(clearTimeout);
  }, []);

  // Canvas shader background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    function resize() {
      if (!canvas) return;
      const dpr = Math.min(window.devicePixelRatio, 2);
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx!.scale(dpr, dpr);
    }

    resize();
    window.addEventListener("resize", resize);

    function draw() {
      if (!canvas || !ctx) return;
      const w = canvas.getBoundingClientRect().width;
      const h = canvas.getBoundingClientRect().height;
      ctx.clearRect(0, 0, w, h);
      time += 0.002;

      // Large ambient orbs
      const orbs = [
        { x: w * 0.2 + Math.sin(time * 0.5) * w * 0.15, y: h * 0.3 + Math.cos(time * 0.4) * h * 0.2, r: Math.min(w, h) * 0.5, a: 0.15 },
        { x: w * 0.8 + Math.cos(time * 0.3) * w * 0.1, y: h * 0.2 + Math.sin(time * 0.6) * h * 0.15, r: Math.min(w, h) * 0.4, a: 0.1 },
        { x: w * 0.5 + Math.sin(time * 0.7) * w * 0.2, y: h * 0.7 + Math.cos(time * 0.5) * h * 0.1, r: Math.min(w, h) * 0.45, a: 0.08 },
        { x: w * 0.1 + Math.cos(time * 0.8) * w * 0.1, y: h * 0.8 + Math.sin(time * 0.3) * h * 0.1, r: Math.min(w, h) * 0.3, a: 0.12 },
        { x: w * 0.6 + Math.sin(time * 0.4) * w * 0.15, y: h * 0.4 + Math.cos(time * 0.7) * h * 0.2, r: Math.min(w, h) * 0.35, a: 0.06 },
      ];

      for (const orb of orbs) {
        const gradient = ctx.createRadialGradient(orb.x, orb.y, 0, orb.x, orb.y, orb.r);
        gradient.addColorStop(0, `rgba(230, 57, 70, ${orb.a})`);
        gradient.addColorStop(0.5, `rgba(180, 30, 50, ${orb.a * 0.3})`);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }

      // Grid overlay
      ctx.strokeStyle = "rgba(255, 255, 255, 0.012)";
      ctx.lineWidth = 1;
      const gridSize = 80;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }

      animationId = requestAnimationFrame(draw);
    }

    draw();
    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <section className="relative flex min-h-screen items-center justify-center overflow-hidden">
      {/* Canvas background */}
      <canvas ref={canvasRef} className="absolute inset-0 h-full w-full" aria-hidden="true" />

      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.04]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
        aria-hidden="true"
      />

      {/* Scanning red line */}
      <div className="scan-line absolute left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-accent-red/60 to-transparent" aria-hidden="true" />

      {/* Bottom gradient fade */}
      <div className="absolute bottom-0 left-0 right-0 h-48 bg-gradient-to-t from-bg-base to-transparent" aria-hidden="true" />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
        {/* Trust badge */}
        <div
          className={`mb-8 inline-flex items-center gap-2.5 rounded-full border border-white/10 bg-white/5 px-5 py-2 backdrop-blur-sm transition-all duration-700 ${showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
          style={{ transitionDelay: "0ms" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-red opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-red" />
          </span>
          <span className="font-body text-xs font-medium tracking-wide text-text-secondary">
            The enthusiast platform — built different
          </span>
        </div>

        {/* Headline — word by word */}
        <h1 className="font-display leading-none" style={{ fontSize: "clamp(60px, 12vw, 120px)", letterSpacing: "-0.04em" }}>
          {HERO_WORDS.map((word, i) => (
            <span key={i}>
              <span
                className={`inline-block ${word.red ? "text-accent-red" : "text-white"} ${i < visibleWords ? "animate-word" : "opacity-0"}`}
                style={{ animationDelay: `${i * 150}ms` }}
              >
                {word.text}
              </span>
              {/* Line breaks after "CAR." and "MOD." */}
              {(i === 1 || i === 3) ? <br className="hidden sm:block" /> : " "}
            </span>
          ))}
        </h1>

        {/* Subtitle */}
        <p
          className={`font-body mx-auto mt-8 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg md:text-xl transition-all duration-700 ${showContent ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
        >
          Specs, reliability data, mod guides, and breaking news for
          the cars you love. Built by enthusiasts, for enthusiasts.
        </p>

        {/* Search — pill shaped, frosted glass, red glow on focus */}
        <div
          className={`mx-auto mt-10 max-w-xl transition-all duration-700 delay-100 ${showContent ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
        >
          <SearchBar
            cars={cars}
            placeholder="Search any car — try 'Supra' or 'BMW E46'"
          />
        </div>

        {/* Popular searches — slide up */}
        <div className={`mt-6 flex flex-wrap items-center justify-center gap-2 ${showTags ? "" : "opacity-0"}`}>
          <span className="font-body text-[11px] font-bold uppercase tracking-widest text-text-muted animate-slide-up" style={{ animationDelay: "0ms" }}>
            Popular:
          </span>
          {POPULAR_SEARCHES.map((term, i) => (
            <Link
              key={term}
              to="/cars"
              className={`animate-slide-up rounded-full border border-white/10 bg-white/5 px-4 py-1.5 font-body text-xs font-medium text-text-secondary backdrop-blur-sm transition-all hover:border-accent-red/40 hover:bg-accent-red/10 hover:text-text-primary`}
              style={{ animationDelay: `${(i + 1) * 80}ms` }}
            >
              {term}
            </Link>
          ))}
        </div>

        {/* CTA buttons */}
        <div
          className={`mt-12 flex flex-wrap items-center justify-center gap-4 transition-all duration-700 delay-200 ${showContent ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <Link
            to="/cars"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-full bg-accent-red px-10 py-4 font-display text-lg uppercase tracking-wider text-white transition-all hover:bg-accent-hover hover:shadow-xl hover:shadow-accent-red/30"
          >
            <span className="relative z-10">Browse All Cars</span>
            <svg
              className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-1"
              viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
          <Link
            to="/compare"
            className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-10 py-4 font-display text-lg uppercase tracking-wider text-text-primary backdrop-blur-sm transition-all hover:border-white/30 hover:bg-white/10"
          >
            Compare Cars
          </Link>
        </div>
      </div>
    </section>
  );
}
