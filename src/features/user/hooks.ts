import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';

import { getProfile, updateProfile, changePassword, uploadAvatar } from './api';

import { useLanguage } from '@/providers/language.provider';
import { toErrorMessage } from '@/utils/error-message';

const USER_KEY = ['user', 'profile'] as const;

export function useProfile() {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    const query = useQuery({
        queryKey: USER_KEY,
        queryFn: getProfile,
    });

    const updateMutation = useMutation({
        mutationFn: updateProfile,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_KEY });
            toast.success(t('profile_updated', {}, 'Profile updated successfully'));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, 'failed_update_profile')));
        },
    });

    const passwordMutation = useMutation({
        mutationFn: changePassword,
        onSuccess: () => {
            toast.success(t('password_changed', {}, 'Password changed successfully'));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, 'failed_change_password')));
        },
    });

    const avatarMutation = useMutation({
        mutationFn: uploadAvatar,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: USER_KEY });
            toast.success(t('avatar_updated', {}, 'Avatar updated successfully'));
        },
        onError: (error: unknown) => {
            toast.error(t(toErrorMessage(error, 'failed_update_avatar')));
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
