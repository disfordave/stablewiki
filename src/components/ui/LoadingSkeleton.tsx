export function LoadingSkeleton() {
  return (
    <div className="h-full">
      <div className="mt-2 h-12 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-900"></div>
      <div className="mt-4 h-48 w-full animate-pulse rounded-xl bg-gray-100 dark:bg-gray-900"></div>
    </div>
  );
}
