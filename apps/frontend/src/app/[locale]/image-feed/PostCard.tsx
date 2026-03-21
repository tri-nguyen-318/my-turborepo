'use client';

import { useEffect, useRef, useState } from 'react';
import { Heart, MessageCircle, MoreHorizontal, Send, Share2, Trash2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { useTranslations } from 'next-intl';
import { useSelector } from 'react-redux';
import type { RootState } from '@/store/store';
import {
  useAddCommentMutation,
  useDeletePostMutation,
  useListCommentsQuery,
  useToggleLikeMutation,
  type ImagePost,
} from '@/store/api';

import { avatarColor, timeAgo } from './postCard.utils';

const OWNER_EMAIL = 'nguyenhuutri31081999nht@gmail.com';

function PostImage({ url, blurDataUrl }: { url: string; blurDataUrl: string | null }) {
  const [fullLoaded, setFullLoaded] = useState(false);
  const t = useTranslations('imageFeed');

  return (
    <div className="relative aspect-4/3 overflow-hidden bg-muted">
      {blurDataUrl && (
        <img
          src={blurDataUrl!}
          alt=""
          aria-hidden
          className={`absolute inset-0 h-full w-full scale-110 object-cover blur-2xl transition-opacity duration-700 ${fullLoaded ? 'opacity-0' : 'opacity-100'}`}
        />
      )}
      <img
        src={url}
        alt={t('postAlt')}
        className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${fullLoaded ? 'opacity-100' : 'opacity-0'}`}
        onLoad={() => setFullLoaded(true)}
      />
    </div>
  );
}

export function PostCard({ post }: { post: ImagePost }) {
  const t = useTranslations('imageFeed');
  const user = useSelector((state: RootState) => state.auth.user);
  const isOwner = user?.email === OWNER_EMAIL;

  const [liked, setLiked] = useState(post.userLiked);
  const [showComments, setShowComments] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [commentText, setCommentText] = useState('');
  const [copied, setCopied] = useState(false);

  const [toggleLike] = useToggleLikeMutation();
  const [addComment, { isLoading: addingComment }] = useAddCommentMutation();
  const [deletePost] = useDeletePostMutation();
  const { data: comments } = useListCommentsQuery(post.id, { skip: !showComments });

  const menuRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (!showMenu) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) setShowMenu(false);
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [showMenu]);

  async function handleLike() {
    if (!user) return;
    setLiked(v => !v);
    try {
      await toggleLike(post.id).unwrap();
    } catch {
      setLiked(v => !v);
    }
  }

  async function handleShare() {
    await navigator.clipboard.writeText(post.url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleDelete() {
    setShowMenu(false);
    setShowDeleteDialog(true);
  }

  async function confirmDelete() {
    setShowDeleteDialog(false);
    await deletePost(post.id);
  }

  async function handleAddComment(e: React.FormEvent) {
    e.preventDefault();
    if (!commentText.trim() || !user) return;
    await addComment({ postId: post.id, body: commentText.trim() });
    setCommentText('');
  }

  return (
    <>
      <article className="overflow-hidden rounded-xl border border-border bg-card shadow-sm">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-semibold text-white ${avatarColor(post.userName)}`}
            >
              {post.userName.charAt(0)}
            </div>
            <div>
              <p className="text-sm leading-tight font-semibold">{post.userName}</p>
              <p className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</p>
            </div>
          </div>

          {isOwner ? (
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setShowMenu(v => !v)}
                className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <MoreHorizontal className="h-5 w-5" />
              </button>
              {showMenu && (
                <div className="absolute top-8 right-0 z-10 min-w-32.5 rounded-lg border border-border bg-card py-1 shadow-lg">
                  <button
                    onClick={handleDelete}
                    className="flex w-full items-center gap-2 px-3 py-2 text-sm text-destructive hover:bg-muted"
                  >
                    <Trash2 className="h-4 w-4" />
                    {t('deletePost')}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button className="rounded-full p-1 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground">
              <MoreHorizontal className="h-5 w-5" />
            </button>
          )}
        </div>

        <PostImage url={post.url} blurDataUrl={post.blurDataUrl} />

        <div className="space-y-3 p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <button
                onClick={handleLike}
                disabled={!user}
                title={user ? undefined : t('loginToLike')}
                className={`flex items-center gap-1.5 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50 ${liked ? 'text-red-500' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <Heart
                  className={`h-5 w-5 transition-transform active:scale-125 ${liked ? 'fill-current' : ''}`}
                />
                <span>{post.likes + (liked ? 1 : 0)}</span>
              </button>
              <button
                onClick={() => setShowComments(v => !v)}
                className={`flex items-center gap-1.5 text-sm transition-colors ${showComments ? 'text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
              >
                <MessageCircle className="h-5 w-5" />
                <span>{post.comments}</span>
              </button>
              <button
                onClick={handleShare}
                className="relative flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
              >
                <Share2 className="h-5 w-5" />
                {copied && <span className="text-xs text-green-500">{t('copied')}</span>}
              </button>
            </div>
          </div>

          <p className="text-sm leading-relaxed">
            <span className="font-semibold">{post.userName}</span>&nbsp;{post.caption}
          </p>

          {showComments && (
            <div className="space-y-3 border-t border-border pt-3">
              {comments?.length === 0 && (
                <p className="text-xs text-muted-foreground">{t('noComments')}</p>
              )}
              {comments?.map(comment => (
                <div key={comment.id} className="flex gap-2">
                  <div
                    className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${avatarColor(comment.userName)}`}
                  >
                    {comment.userName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm">
                      <span className="font-semibold">{comment.userName}</span>&nbsp;{comment.body}
                    </p>
                    <p className="text-xs text-muted-foreground">{timeAgo(comment.createdAt)}</p>
                  </div>
                </div>
              ))}
              {user ? (
                <form onSubmit={handleAddComment} className="flex gap-2">
                  <input
                    value={commentText}
                    onChange={e => setCommentText(e.target.value)}
                    placeholder={t('commentPlaceholder')}
                    className="flex-1 rounded-lg border border-border bg-background px-3 py-1.5 text-sm outline-none focus:border-primary"
                  />
                  <button
                    type="submit"
                    disabled={!commentText.trim() || addingComment}
                    className="rounded-lg bg-primary px-3 py-1.5 text-primary-foreground disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                  </button>
                </form>
              ) : (
                <p className="text-xs text-muted-foreground">{t('loginToComment')}</p>
              )}
            </div>
          )}
        </div>
      </article>

      <Dialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{t('deletePost')}</DialogTitle>
            <DialogDescription>{t('deletePostDesc')}</DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>
              {t('cancel')}
            </Button>
            <Button variant="destructive" onClick={confirmDelete}>
              {t('delete')}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
