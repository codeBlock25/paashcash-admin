export function BannerLoading() {
  return (
    <div
      role="status"
      className="space-y-4 animate-pulse"
      aria-label="Loading banners"
    >
      <div className="h-10 rounded-lg bg-[#f2f1f4]" />
      <div className="h-16 rounded-lg bg-[#f7f6f8]" />
      <div className="h-16 rounded-lg bg-[#f7f6f8]" />
      <div className="h-16 rounded-lg bg-[#f7f6f8]" />
    </div>
  );
}
