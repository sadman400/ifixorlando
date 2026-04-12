export default function Loading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#f2f2f7] px-4 py-[calc(2rem+env(safe-area-inset-top))]">
      <div className="w-full max-w-sm rounded border border-gray-200/70 bg-white px-6 py-8 text-center">
        <div className="mx-auto h-10 w-10 animate-spin rounded-full border-[3px] border-gray-200 border-t-teal-600" />
        <p className="mt-5 text-[11px] font-semibold uppercase tracking-[0.16em] text-gray-500">
          Loading
        </p>
        <p className="mt-1 text-[14px] font-semibold text-gray-900">
          Preparing iFixOrlando for you.
        </p>
      </div>
    </main>
  );
}
