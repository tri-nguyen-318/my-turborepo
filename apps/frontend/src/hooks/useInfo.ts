import { useGetMyInfoQuery, useUpdateMyInfoMutation } from '@/store/api';
export type { PersonalInfo } from '@/store/api';

export const useGetInfo = () => useGetMyInfoQuery(undefined);

export const useUpdateInfo = () => {
  const [updateMyInfo, result] = useUpdateMyInfoMutation();
  return {
    ...result,
    mutateAsync: (data: Parameters<typeof updateMyInfo>[0]) => updateMyInfo(data).unwrap(),
  };
};
