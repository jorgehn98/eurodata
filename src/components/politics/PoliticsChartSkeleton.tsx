'use client';

type PoliticsChartSkeletonProps = {
  height?: number;
};

export function PoliticsChartSkeleton({ height = 320 }: PoliticsChartSkeletonProps) {
  return (
    <div className="bg-white border border-surface-border rounded-lg p-6 animate-pulse">
      {/* Title placeholder */}
      <div className="h-5 bg-gray-200 rounded w-56 mb-4" />
      {/* Chart area placeholder — height configurable (320px default for chart cards) */}
      <div className="bg-gray-100 rounded" style={{ height }} />
      {/* Source attribution placeholder */}
      <div className="h-4 bg-gray-200 rounded w-48 mt-3" />
    </div>
  );
}
