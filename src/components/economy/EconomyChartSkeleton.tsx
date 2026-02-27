'use client';

export function EconomyChartSkeleton() {
  return (
    <div className="bg-white border border-surface-border rounded-lg p-6 animate-pulse">
      {/* Title placeholder */}
      <div className="h-5 bg-gray-200 rounded w-56 mb-4" />
      {/* Chart area placeholder — matches 320px height */}
      <div className="h-80 bg-gray-100 rounded" />
      {/* Source attribution placeholder */}
      <div className="h-4 bg-gray-200 rounded w-48 mt-3" />
    </div>
  );
}
