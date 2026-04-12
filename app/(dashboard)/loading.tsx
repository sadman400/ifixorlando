function LoadingBlock({
  className,
}: Readonly<{
  className: string;
}>) {
  return <div className={`animate-pulse rounded bg-gray-200 ${className}`} />;
}

export default function DashboardLoading() {
  return (
    <section className="space-y-5">
      <div>
        <LoadingBlock className="h-3 w-20" />
        <LoadingBlock className="mt-2 h-7 w-40" />
      </div>

      <div className="grid grid-cols-3 gap-3">
        {Array.from({ length: 3 }).map((_, index) => (
          <div
            key={index}
            className="rounded border border-gray-200/70 bg-white px-3 py-3"
          >
            <LoadingBlock className="h-3 w-12" />
            <LoadingBlock className="mt-2 h-5 w-16" />
          </div>
        ))}
      </div>

      <div className="space-y-6">
        {Array.from({ length: 2 }).map((_, groupIndex) => (
          <div key={groupIndex}>
            <LoadingBlock className="mb-2 h-3 w-20" />
            <div className="overflow-hidden rounded border border-gray-200/70 bg-white">
              {Array.from({ length: 3 }).map((__, rowIndex) => (
                <div
                  key={rowIndex}
                  className="flex items-center gap-4 border-b border-gray-100 px-4 py-3.5 last:border-b-0"
                >
                  <div className="h-10 w-10 shrink-0 animate-pulse rounded bg-gray-100" />
                  <div className="min-w-0 flex-1">
                    <LoadingBlock className="h-4 w-1/2" />
                    <LoadingBlock className="mt-1.5 h-3 w-1/3 bg-gray-100" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
