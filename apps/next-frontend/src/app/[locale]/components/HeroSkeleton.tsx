import { Skeleton } from '@/components/ui/skeleton';

export const HeroSkeleton = () => (
  <section className="relative mb-8 w-full overflow-hidden rounded-xl border border-border/50 bg-linear-to-br from-primary/10 via-background to-secondary/10 py-12 shadow-sm md:py-24 lg:py-32">
    <div className="container px-4 md:px-6">
      <div className="mb-4 flex justify-end">
        <Skeleton className="h-9 w-40" />
      </div>
      <div className="flex w-full flex-col items-start gap-8 md:flex-row md:gap-12">
        {/* Avatar */}
        <Skeleton className="h-32 w-32 flex-shrink-0 rounded-full md:h-48 md:w-48" />

        {/* Info */}
        <div className="flex w-full flex-1 flex-col space-y-6">
          <div className="space-y-2">
            <Skeleton className="h-10 w-64" />
            <Skeleton className="h-6 w-40" />
          </div>
          <div className="space-y-2 border-l-4 border-primary/40 pl-4">
            <Skeleton className="h-4 w-full max-w-lg" />
            <Skeleton className="h-4 w-5/6 max-w-lg" />
            <Skeleton className="h-4 w-4/6 max-w-lg" />
          </div>
          <div className="grid w-full max-w-2xl grid-cols-1 gap-4 md:grid-cols-2">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-5 w-40" />
            ))}
          </div>
        </div>
      </div>
    </div>
  </section>
);
