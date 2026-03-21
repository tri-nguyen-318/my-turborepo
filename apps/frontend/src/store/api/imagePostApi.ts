import { apiSlice } from './baseApi';

export interface ImagePost {
  id: number;
  userId: number | null;
  userName: string;
  caption: string;
  url: string;
  likes: number;
  comments: number;
  userLiked: boolean;
  blurDataUrl: string | null;
  createdAt: string;
}

export interface ImagePostComment {
  id: number;
  imagePostId: number;
  userId: number;
  userName: string;
  body: string;
  createdAt: string;
}

export interface ImagePostPage {
  data: ImagePost[];
  total: number;
  page: number;
  hasMore: boolean;
}

export const imagePostApi = apiSlice.injectEndpoints({
  endpoints: builder => ({
    listImagePosts: builder.query<ImagePostPage, number>({
      query: page => `/api/image-posts?page=${page}`,
      providesTags: ['ImagePosts'],
      serializeQueryArgs: ({ endpointName }) => endpointName,
      merge: (cache, response) => {
        if (response.page === 1) {
          cache.data = response.data;
        } else {
          cache.data.push(...response.data);
        }
        cache.total = response.total;
        cache.page = response.page;
        cache.hasMore = response.hasMore;
      },
      forceRefetch: ({ currentArg, previousArg }) => currentArg !== previousArg,
    }),
    toggleLike: builder.mutation<{ liked: boolean; likes: number }, number>({
      query: id => ({ url: `/api/image-posts/${id}/like`, method: 'POST' }),
    }),
    listComments: builder.query<ImagePostComment[], number>({
      query: id => `/api/image-posts/${id}/comments`,
      providesTags: (_, __, id) => [{ type: 'ImagePostComments', id }],
    }),
    addComment: builder.mutation<ImagePostComment, { postId: number; body: string }>({
      query: ({ postId, body }) => ({
        url: `/api/image-posts/${postId}/comments`,
        method: 'POST',
        body: { body },
      }),
      invalidatesTags: (_, __, { postId }) => [
        { type: 'ImagePostComments', id: postId },
        'ImagePosts',
      ],
    }),
    createPost: builder.mutation<ImagePost, { url: string; caption: string; blurDataUrl?: string }>(
      {
        query: body => ({ url: `/api/image-posts`, method: 'POST', body }),
        invalidatesTags: ['ImagePosts'],
      },
    ),
    deletePost: builder.mutation<{ deleted: boolean }, number>({
      query: id => ({ url: `/api/image-posts/${id}`, method: 'DELETE' }),
      invalidatesTags: ['ImagePosts'],
    }),
  }),
});

export const {
  useListImagePostsQuery,
  useToggleLikeMutation,
  useListCommentsQuery,
  useAddCommentMutation,
  useCreatePostMutation,
  useDeletePostMutation,
} = imagePostApi;
