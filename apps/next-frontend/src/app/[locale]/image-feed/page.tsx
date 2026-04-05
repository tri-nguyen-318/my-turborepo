'use client';

import { useEffect, useRef, useState } from 'react';
import { useTranslations } from 'next-intl';
import { useSelector } from 'react-redux';
import { useWindowVirtualizer } from '@tanstack/react-virtual';
import type { RootState } from '@/store/store';
import { useListImagePostsQuery } from '@/store/api';
import { PostCard } from './PostCard';
import { NewPostForm } from './NewPostForm';

function PostSkeleton() {
  return (
    <div className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
      <div className="flex items-center gap-3 p-4">
        <div className="h-10 w-10 animate-pulse rounded-full bg-muted" />
        <div className="space-y-1.5">
          <div className="h-3.5 w-28 animate-pulse rounded bg-muted" />
          <div className="h-3 w-16 animate-pulse rounded bg-muted" />
        </div>
      </div>
      <div className="aspect-4/3 animate-pulse bg-muted" />
      <div className="space-y-2 p-4">
        <div className="h-3 w-3/4 animate-pulse rounded bg-muted" />
        <div className="h-3 w-1/2 animate-pulse rounded bg-muted" />
      </div>
    </div>
  );
}

export default function ImageFeedPage() {
  const authLoading = useSelector((state: RootState) => state.auth.loading);
  const user = useSelector((state: RootState) => state.auth.user);
  const [page, setPage] = useState(1);
  const { data, isLoading, isFetching, isError } = useListImagePostsQuery(page, {
    skip: authLoading,
  });
  const t = useTranslations('imageFeed');

  const posts = data?.data ?? [];
  const listRef = useRef<HTMLDivElement>(null);

  const virtualizer = useWindowVirtualizer({
    count: posts.length,
    estimateSize: () => 520,
    overscan: 3,
    scrollMargin: listRef.current?.offsetTop ?? 0,
    measureElement: el => el.getBoundingClientRect().height,
  });

  const virtualItems = virtualizer.getVirtualItems();

  // trigger next page when last visible item is near the end
  useEffect(() => {
    const last = virtualItems[virtualItems.length - 1];
    if (!last) return;
    if (last.index >= posts.length - 3 && data?.hasMore && !isFetching) {
      setPage(p => p + 1);
    }
  }, [virtualItems, posts.length, data?.hasMore, isFetching]);

  return (
    <main className="mx-auto min-h-screen w-full max-w-xl px-4 py-8">
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold tracking-tight">{t('title')}</h1>
          {user && <NewPostForm />}
        </div>
        <p className="mt-1 text-sm text-muted-foreground">
          {data ? t('postsCount', { count: data.total }) : t('loading')} · {t('subtitle')}
        </p>
      </div>

      {isError && <p className="text-sm text-destructive">{t('error')}</p>}

      {isLoading ? (
        <div className="flex flex-col gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      ) : (
        <div ref={listRef} style={{ height: virtualizer.getTotalSize(), position: 'relative' }}>
          {virtualItems.map(item => (
            <div
              key={item.key}
              data-index={item.index}
              ref={virtualizer.measureElement}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                transform: `translateY(${item.start - virtualizer.options.scrollMargin}px)`,
              }}
            >
              <div className="pb-4">
                <PostCard post={posts[item.index]} />
              </div>
            </div>
          ))}
        </div>
      )}

      {isFetching && !isLoading && (
        <div className="mt-4 flex flex-col gap-4">
          {Array.from({ length: 2 }).map((_, i) => (
            <PostSkeleton key={i} />
          ))}
        </div>
      )}
    </main>
  );
}
