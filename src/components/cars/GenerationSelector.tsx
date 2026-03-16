interface Generation {
  id: string;
  generation: string;
  years: string;
}

interface GenerationSelectorProps {
  generations: Generation[];
  activeId: string;
  onChange: (id: string) => void;
}

export default function GenerationSelector({
  generations,
  activeId,
  onChange,
}: GenerationSelectorProps) {
  return (
    <div className="flex flex-wrap gap-2">
      {generations.map((gen) => {
        const isActive = gen.id === activeId;
        return (
          <button
            key={gen.id}
            type="button"
            onClick={() => onChange(gen.id)}
            className={`cursor-pointer rounded-xl border px-4 py-2.5 text-sm font-semibold transition-all duration-200 ${
              isActive
                ? "border-accent-red bg-accent-red/10 text-accent-red"
                : "border-border text-text-secondary hover:border-border hover:text-text-primary"
            }`}
          >
            <span className="font-display uppercase">{gen.generation}</span>
            <span
              className={`font-mono ml-2 text-xs font-medium ${
                isActive ? "text-accent-red/70" : "text-text-muted"
              }`}
            >
              {gen.years}
            </span>
          </button>
        );
      })}
    </div>
  );
}
