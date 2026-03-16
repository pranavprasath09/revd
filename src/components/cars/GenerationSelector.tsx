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
                ? "border-accent bg-accent/10 text-accent"
                : "border-border text-text-secondary hover:border-border hover:text-text-primary"
            }`}
          >
            <span>{gen.generation}</span>
            <span
              className={`ml-2 text-xs font-medium ${
                isActive ? "text-accent/70" : "text-text-muted"
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
