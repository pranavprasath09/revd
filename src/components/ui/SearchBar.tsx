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
    <div ref={wrapperRef} className="relative w-full max-w-xl">
      <div className="relative">
        <svg
          className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-text-muted"
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
          className="h-12 w-full rounded-xl border border-border bg-bg-surface pl-12 pr-4 text-sm text-text-primary placeholder:text-text-muted transition-colors focus:border-accent focus:outline-none sm:h-14 sm:text-base"
        />
      </div>

      {isOpen && results.length > 0 && (
        <ul className="absolute top-full z-50 mt-2 w-full overflow-hidden rounded-xl border border-border bg-bg-elevated shadow-2xl">
          {results.map((car) => (
            <li key={car.id}>
              <button
                type="button"
                onClick={() => handleSelect(car)}
                className="flex w-full items-center gap-3 px-4 py-3 text-left transition-colors hover:bg-bg-surface"
              >
                <img
                  src={car.heroImage}
                  alt={`${car.make} ${car.model}`}
                  className="h-10 w-14 rounded-md object-cover"
                />
                <div>
                  <p className="text-sm font-semibold text-text-primary">
                    {car.make} {car.model}{" "}
                    <span className="text-text-muted">{car.generation}</span>
                  </p>
                  <p className="text-xs text-text-secondary">
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
