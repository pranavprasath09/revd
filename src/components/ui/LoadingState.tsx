export default function LoadingState() {
  return (
    <div className="px-6 py-12 md:px-11">
      <div className="space-y-4">
        <div className="h-8 w-1/3 animate-pulse bg-bg-surface" />
        <div className="h-4 w-2/3 animate-pulse bg-bg-surface" />
        <div className="h-4 w-1/2 animate-pulse bg-bg-surface" />
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-64 animate-pulse bg-bg-surface" />
          ))}
        </div>
      </div>
    </div>
  );
}
