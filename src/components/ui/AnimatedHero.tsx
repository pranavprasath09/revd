import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "react-router-dom";

const HERO_IMAGE = "https://images.unsplash.com/photo-1656760128444-be65de47e198?w=1920&q=100";

export default function AnimatedHero() {
  const heroRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number>(0);
  const [loaded, setLoaded] = useState(false);
  const [step, setStep] = useState(0); // 0=nothing, 1=badge, 2=line1, 3=line2, 4=subtitle, 5=buttons

  // Staggered text reveal
  useEffect(() => {
    const timers = [
      setTimeout(() => setStep(1), 300),   // badge
      setTimeout(() => setStep(2), 450),   // line 1
      setTimeout(() => setStep(3), 600),   // line 2
      setTimeout(() => setStep(4), 750),   // subtitle
      setTimeout(() => setStep(5), 900),   // buttons
    ];
    return () => timers.forEach(clearTimeout);
  }, []);

  // Parallax scroll handler with rAF
  const handleScroll = useCallback(() => {
    if (rafId.current) return;
    rafId.current = requestAnimationFrame(() => {
      const scrollY = window.scrollY;
      if (imageRef.current) {
        imageRef.current.style.transform = `translateY(${scrollY * 0.5}px) scale(${1.1 - Math.min(scrollY * 0.0001, 0.1)})`;
      }
      if (scrollIndicatorRef.current) {
        scrollIndicatorRef.current.style.opacity = scrollY > 50 ? "0" : "1";
      }
      rafId.current = 0;
    });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [handleScroll]);

  // Preload hero image
  useEffect(() => {
    const img = new Image();
    img.onload = () => setLoaded(true);
    img.src = HERO_IMAGE;
  }, []);

  return (
    <section
      ref={heroRef}
      className="relative flex min-h-screen items-center overflow-hidden"
    >
      {/* Full viewport parallax image */}
      <div
        ref={imageRef}
        className="absolute inset-0 will-change-transform"
        style={{
          transform: "translateY(0) scale(1.1)",
          animation: loaded ? "hero-zoom-in 2s cubic-bezier(0.16, 1, 0.3, 1) forwards" : "none",
        }}
      >
        <img
          src={HERO_IMAGE}
          alt="Porsche 918 Spyder — high performance automotive"
          className={`h-full w-full object-cover transition-opacity duration-1000 ${loaded ? "opacity-100" : "opacity-0"}`}
        />
      </div>

      {/* Dark overlay gradient */}
      <div
        className="absolute inset-0"
        style={{
          background: "linear-gradient(to bottom, transparent 0%, rgba(15,15,15,0.3) 50%, #0f0f0f 100%)",
        }}
        aria-hidden="true"
      />

      {/* Subtle vignette */}
      <div
        className="absolute inset-0"
        style={{
          background: "radial-gradient(ellipse at center, transparent 40%, rgba(15,15,15,0.5) 100%)",
        }}
        aria-hidden="true"
      />

      {/* Content — center-left, 40% from top */}
      <div className="relative z-10 mx-auto w-full max-w-7xl px-6 sm:px-10" style={{ marginTop: "-10vh" }}>
        {/* Red pill badge */}
        <div
          className={`mb-6 transition-all duration-700 ease-out ${step >= 1 ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
        >
          <span className="inline-flex items-center gap-2 rounded-full bg-accent-red/90 px-4 py-1.5 font-body text-[11px] font-bold uppercase tracking-[0.2em] text-white">
            <span className="h-1.5 w-1.5 rounded-full bg-white animate-pulse" />
            The Enthusiast Platform
          </span>
        </div>

        {/* Main headline */}
        <h1 className="font-display leading-[0.9]" style={{ fontSize: "clamp(56px, 10vw, 96px)" }}>
          <span
            className={`block text-white transition-all duration-700 ease-out ${step >= 2 ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
          >
            BUILT FOR THE
          </span>
          <span
            className={`block text-accent-red transition-all duration-700 ease-out ${step >= 3 ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
          >
            OBSESSED.
          </span>
        </h1>

        {/* Subtitle */}
        <p
          className={`mt-6 max-w-lg font-body text-base leading-relaxed text-white/50 sm:text-lg transition-all duration-700 ease-out ${step >= 4 ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
        >
          Every spec. Every mod. Every story. One platform.
        </p>

        {/* CTA Buttons */}
        <div
          className={`mt-8 flex flex-wrap items-center gap-4 transition-all duration-700 ease-out ${step >= 5 ? "translate-y-0 opacity-100" : "translate-y-5 opacity-0"}`}
        >
          <Link
            to="/cars"
            className="group inline-flex items-center gap-2 rounded-lg bg-accent-red px-8 py-3.5 font-display text-lg uppercase tracking-wider text-white transition-all hover:bg-accent-hover hover:shadow-xl hover:shadow-accent-red/25"
          >
            Explore Cars
            <svg
              className="h-4 w-4 transition-transform group-hover:translate-x-1"
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
          <button
            type="button"
            className="inline-flex items-center gap-2.5 rounded-lg border border-white/20 bg-white/5 px-8 py-3.5 font-display text-lg uppercase tracking-wider text-white backdrop-blur-sm transition-all hover:border-white/40 hover:bg-white/10"
          >
            {/* Play icon */}
            <svg
              className="h-4 w-4"
              viewBox="0 0 16 16"
              fill="currentColor"
              aria-hidden="true"
            >
              <path d="M4 2.5v11l10-5.5L4 2.5z" />
            </svg>
            Watch Intro
          </button>
        </div>
      </div>

      {/* Scroll indicator — bottom center */}
      <div
        ref={scrollIndicatorRef}
        className="absolute bottom-8 left-1/2 z-10 -translate-x-1/2 transition-opacity duration-500"
      >
        <div className="flex flex-col items-center gap-2">
          <span className="font-body text-[10px] uppercase tracking-[0.3em] text-white/30">
            Scroll
          </span>
          <div className="relative h-10 w-6 rounded-full border-2 border-white/20">
            <div className="animate-scroll-mouse absolute left-1/2 top-2 h-2 w-1 -translate-x-1/2 rounded-full bg-white/60" />
          </div>
        </div>
      </div>
    </section>
  );
}
