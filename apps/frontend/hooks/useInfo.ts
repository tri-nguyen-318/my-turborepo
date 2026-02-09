import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { infoApi, PersonalInfo } from '@/lib/api/info/infoApi';
import { useAuth } from '@/app/[locale]/providers/AuthProvider';

export const useGetInfo = () => {
  const { accessToken } = useAuth();
  
  return useQuery({
    queryKey: ['personalInfo'],
    queryFn: () => {
        if (!accessToken) return null;
        return infoApi.getMyInfo(accessToken);
    },
    enabled: !!accessToken,
  });
};

export const useUpdateInfo = () => {
  const { accessToken } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (info: PersonalInfo) => {
        if (!accessToken) throw new Error("No access token");
        return infoApi.updateMyInfo(info, accessToken);
    },
    onMutate: async (newInfo) => {
      // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
      await queryClient.cancelQueries({ queryKey: ['personalInfo'] });

      // Snapshot the previous value
      const previousInfo = queryClient.getQueryData(['personalInfo']);

      // Optimistically update to the new value
      queryClient.setQueryData(['personalInfo'], (old: PersonalInfo) => ({ ...old, ...newInfo }));

      // Return a context object with the snapshotted value
      return { previousInfo };
    },
    onError: (err, newInfo, context) => {
      // If the mutation fails, use the context returned from onMutate to roll back
      if (context?.previousInfo) {
        queryClient.setQueryData(['personalInfo'], context.previousInfo);
      }
    },
    onSuccess: (data) => {
      // Update with the actual server response
      queryClient.setQueryData(['personalInfo'], data);
      queryClient.invalidateQueries({ queryKey: ['personalInfo'] });
    },
  });
};
