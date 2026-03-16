import { useEffect, useRef, useState } from "react";
import { Link } from "react-router-dom";
import SearchBar from "@/components/ui/SearchBar";
import carsData from "@/data/cars.json";
import type { Car } from "@/types/car";

const cars = carsData as Car[];

const POPULAR_SEARCHES = ["BMW E46", "Supra A80", "MX-5 Miata", "911 GT3"];

export default function AnimatedHero() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
  }, []);

  // Animated gradient mesh on canvas
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
      time += 0.003;

      // Organic floating gradient orbs
      const orbs = [
        {
          x: w * 0.3 + Math.sin(time * 0.7) * w * 0.15,
          y: h * 0.4 + Math.cos(time * 0.5) * h * 0.2,
          r: Math.min(w, h) * 0.4,
          color: "rgba(230, 57, 70, 0.12)",
        },
        {
          x: w * 0.7 + Math.cos(time * 0.6) * w * 0.12,
          y: h * 0.3 + Math.sin(time * 0.8) * h * 0.15,
          r: Math.min(w, h) * 0.35,
          color: "rgba(230, 57, 70, 0.08)",
        },
        {
          x: w * 0.5 + Math.sin(time * 0.4) * w * 0.2,
          y: h * 0.6 + Math.cos(time * 0.3) * h * 0.15,
          r: Math.min(w, h) * 0.3,
          color: "rgba(255, 100, 100, 0.06)",
        },
        {
          x: w * 0.2 + Math.cos(time * 0.9) * w * 0.1,
          y: h * 0.7 + Math.sin(time * 0.6) * h * 0.1,
          r: Math.min(w, h) * 0.25,
          color: "rgba(180, 40, 50, 0.1)",
        },
      ];

      for (const orb of orbs) {
        const gradient = ctx.createRadialGradient(
          orb.x, orb.y, 0,
          orb.x, orb.y, orb.r
        );
        gradient.addColorStop(0, orb.color);
        gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
        ctx.fillStyle = gradient;
        ctx.fillRect(0, 0, w, h);
      }

      // Subtle grid lines
      ctx.strokeStyle = "rgba(255, 255, 255, 0.015)";
      ctx.lineWidth = 1;
      const gridSize = 60;
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
    <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
      {/* Animated canvas background */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 h-full w-full"
        aria-hidden="true"
      />

      {/* Noise overlay */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)' opacity='1'/%3E%3C/svg%3E")`,
          backgroundSize: "256px 256px",
        }}
        aria-hidden="true"
      />

      {/* Bottom gradient fade */}
      <div
        className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-bg-base to-transparent"
        aria-hidden="true"
      />

      {/* Content */}
      <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
        {/* Trust badge */}
        <div
          className={`mb-6 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-sm transition-all duration-700 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-accent-red opacity-75" />
            <span className="relative inline-flex h-2 w-2 rounded-full bg-accent-red" />
          </span>
          <span className="text-xs font-medium tracking-wide text-text-secondary">
            The enthusiast platform — built different
          </span>
        </div>

        {/* Headline */}
        <h1
          className={`text-editorial text-4xl font-black text-text-primary sm:text-6xl md:text-7xl lg:text-8xl transition-all duration-700 delay-100 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
        >
          Every car.{" "}
          <br className="hidden sm:block" />
          Every mod.{" "}
          <br className="hidden sm:block" />
          <span className="bg-gradient-to-r from-accent-red via-red-400 to-orange-400 bg-clip-text text-transparent">
            One platform.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`mx-auto mt-6 max-w-2xl text-base leading-relaxed text-text-secondary sm:text-lg md:text-xl transition-all duration-700 delay-200 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
        >
          Specs, reliability data, mod guides, and breaking news for
          the cars you love. Built by enthusiasts, for enthusiasts.
        </p>

        {/* Search */}
        <div
          className={`mx-auto mt-10 max-w-xl transition-all duration-700 delay-300 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-6 opacity-0"}`}
        >
          <SearchBar
            cars={cars}
            placeholder="Search any car — try 'Supra' or 'BMW E46'"
          />
        </div>

        {/* Popular searches */}
        <div
          className={`mt-6 flex flex-wrap items-center justify-center gap-2 transition-all duration-700 delay-[400ms] ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <span className="text-[11px] font-bold uppercase tracking-widest text-text-muted">
            Popular:
          </span>
          {POPULAR_SEARCHES.map((term) => (
            <Link
              key={term}
              to="/cars"
              className="rounded-full border border-white/10 bg-white/5 px-3.5 py-1 text-xs font-medium text-text-secondary backdrop-blur-sm transition-all hover:border-accent-red/40 hover:bg-accent-red/10 hover:text-text-primary"
            >
              {term}
            </Link>
          ))}
        </div>

        {/* CTA buttons */}
        <div
          className={`mt-10 flex flex-wrap items-center justify-center gap-4 transition-all duration-700 delay-500 ${isVisible ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0"}`}
        >
          <Link
            to="/cars"
            className="group relative inline-flex items-center gap-2 overflow-hidden rounded-xl bg-accent-red px-8 py-3.5 text-sm font-bold text-white transition-all hover:bg-accent-hover hover:shadow-lg hover:shadow-accent-red/25"
          >
            <span className="relative z-10">Browse All Cars</span>
            <svg
              className="relative z-10 h-4 w-4 transition-transform group-hover:translate-x-0.5"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden="true"
            >
              <path d="M3 8h10M9 4l4 4-4 4" />
            </svg>
          </Link>
          <Link
            to="/compare"
            className="inline-flex items-center gap-2 rounded-xl border border-white/15 bg-white/5 px-8 py-3.5 text-sm font-bold text-text-primary backdrop-blur-sm transition-all hover:border-white/25 hover:bg-white/10"
          >
            Compare Cars
          </Link>
        </div>
      </div>
    </section>
  );
}
