interface CategoryFilterProps {
  categories: string[];
  active: string;
  onChange: (category: string) => void;
}

export default function CategoryFilter({
  categories,
  active,
  onChange,
}: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
      {categories.map((category) => {
        const isActive = category === active;
        return (
          <button
            key={category}
            type="button"
            onClick={() => onChange(category)}
            className={`shrink-0 cursor-pointer rounded-full px-5 py-2 font-body text-xs font-bold uppercase tracking-wider transition-all duration-200 ${
              isActive
                ? "bg-accent-red text-white shadow-md shadow-accent-red/25"
                : "border border-border bg-bg-surface text-text-secondary hover:border-accent-red/40 hover:text-text-primary"
            }`}
          >
            {category}
          </button>
        );
      })}
    </div>
  );
}
