import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getProfile, updateProfile, changePassword, uploadAvatar } from './api';

const USER_KEY = ['user', 'profile'] as const;

export function useProfile() {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: USER_KEY,
        queryFn: getProfile,
    });

    const updateMutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: (_data) => {
            queryClient.setQueryData(USER_KEY, _data);
            toast.success('Profile updated successfully');
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : 'Failed to update profile';
            toast.error(message);
        },
    });

    const passwordMutation = useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            toast.success('Password changed successfully');
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : 'Failed to change password';
            toast.error(message);
        },
    });

    const avatarMutation = useMutation({
        mutationFn: uploadAvatar,
        onSuccess: (_data) => {
            queryClient.invalidateQueries({ queryKey: USER_KEY });
            toast.success('Avatar updated successfully');
        },
        onError: (error: unknown) => {
            const message = error instanceof Error ? error.message : 'Failed to update avatar';
            toast.error(message);
        },
    });

    return {
        ...query,
        profile: query.data,
        updateProfile: updateMutation.mutateAsync,
        isUpdating: updateMutation.isPending,
        changePassword: passwordMutation.mutateAsync,
        isChangingPassword: passwordMutation.isPending,
        uploadAvatar: avatarMutation.mutateAsync,
        isUploadingAvatar: avatarMutation.isPending,
    };
}
