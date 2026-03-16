import { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import type { Car } from "@/types/car";

interface SearchBarProps {
  cars: Car[];
  placeholder?: string;
}

export default function SearchBar({ cars, placeholder = "Search cars..." }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();

  const results = query.length >= 2
    ? cars.filter((car) => {
        const search = query.toLowerCase();
        return (
          car.make.toLowerCase().includes(search) ||
          car.model.toLowerCase().includes(search) ||
          car.generation.toLowerCase().includes(search) ||
          `${car.make} ${car.model}`.toLowerCase().includes(search)
        );
      }).slice(0, 5)
    : [];

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  function handleSelect(car: Car) {
    const path = `/cars/${car.make.toLowerCase()}/${car.model.toLowerCase().replace(/\s+/g, "-")}/${car.years.split("–")[0]}`;
    setQuery("");
    setIsOpen(false);
    navigate(path);
  }

  return (
    <div ref={wrapperRef} className="relative w-full max-w-xl mx-auto">
      <div className="relative group">
        <svg
          className="absolute left-5 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted transition-colors group-focus-within:text-accent-red"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
          />
        </svg>
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className="h-14 w-full rounded-full border border-white/10 bg-white/5 pl-14 pr-6 font-body text-sm text-white placeholder:text-text-muted backdrop-blur-md transition-all duration-300 focus:border-accent-red/50 focus:outline-none focus:shadow-[0_0_30px_8px_rgba(230,57,70,0.15)] sm:h-16 sm:text-base"
        />
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute top-full z-50 mt-3 w-full overflow-hidden rounded-2xl border border-white/10 bg-bg-elevated/95 shadow-2xl shadow-black/50 backdrop-blur-xl">
          {results.map((car) => (
            <li key={car.id}>
              <button
                type="button"
                onClick={() => handleSelect(car)}
                className="flex w-full items-center gap-4 px-5 py-3.5 text-left transition-colors hover:bg-white/5"
              >
                <img
                  src={car.heroImage}
                  alt={`${car.make} ${car.model}`}
                  loading="lazy"
                  onError={(e) => { (e.target as HTMLImageElement).src = "https://images.unsplash.com/photo-1492144534655-ae79c964c9d7?w=800&q=80"; }}
                  className="h-10 w-14 rounded-lg object-cover"
                />
                <div>
                  <p className="font-display text-lg uppercase tracking-wide text-white">
                    {car.make} {car.model}{" "}
                    <span className="text-accent-red">{car.generation}</span>
                  </p>
                  <p className="font-mono text-xs text-text-secondary">
                    {car.years} · {car.engines[0].power} · {car.performance.drivetrain}
                  </p>
                </div>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
