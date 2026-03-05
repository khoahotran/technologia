import { describe, it, expect, vi, beforeEach } from 'vitest'

import { UserRepository } from '../user.repository'

import { fetchWithToken } from '@/infrastructure/http'

vi.mock('@/infrastructure/http', () => ({
    fetchWithToken: vi.fn(),
}))

vi.mock('@/infrastructure/persistence/storage', () => ({
    authStorage: {
        setTokens: vi.fn(),
        getAccessToken: vi.fn(),
        clearTokens: vi.fn(),
    }
}))

describe('UserRepository', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // Mock data matching UserProfileResponseSchema
    const mockProfileResponse = {
        status: 200,
        message: 'Get user profile successfully!',
        data: {
            userId: 1,
            email: 'test@example.com',
            username: 'testuser',
            firstName: 'Test',
            lastName: 'User',
            phoneNumber: '0912345678',
            imageUrl: '/avatar.png',
            displayName: 'Test User',
        }
    }

    describe('getMe', () => {
        it('should fetch and parse user profile', async () => {
            vi.mocked(fetchWithToken).mockResolvedValue(mockProfileResponse)

            const result = await UserRepository.getMe()

            expect(fetchWithToken).toHaveBeenCalledWith(
                '/users/profile/me',
                { method: 'GET' }
            )
            expect(result.email).toBe('test@example.com')
            expect(result.userId).toBe(1)
            expect(result.displayName).toBe('Test User')
        })
    })

    describe('updateMe', () => {
        it('should update and return parsed profile', async () => {
            const updateDto = {
                firstname: 'Updated',
                lastname: 'User',
                email: 'updated@example.com',
                phoneNumber: '0912345678',
                displayName: 'Updated User'
            }
            const updatedResponse = {
                ...mockProfileResponse,
                data: {
                    ...mockProfileResponse.data,
                    firstName: 'Updated',
                    email: 'updated@example.com',
                    displayName: 'Updated User'
                }
            }

            vi.mocked(fetchWithToken).mockResolvedValue(updatedResponse)

            const result = await UserRepository.updateMe(updateDto)

            expect(fetchWithToken).toHaveBeenCalledWith(
                '/users/profile/me',
                {
                    method: 'PUT',
                    body: updateDto,
                }
            )
            expect(result.firstName).toBe('Updated')
            expect(result.displayName).toBe('Updated User')
        })
    })

    describe('changeAvatar', () => {
        it('should upload avatar via FormData', async () => {
            const file = new File(['content'], 'avatar.png', { type: 'image/png' })
            const avatarResponse = {
                status: 200,
                message: 'Change avatar successfully!',
                data: { avatarUrl: '/new-avatar.png' }
            }

            vi.mocked(fetchWithToken).mockResolvedValue(avatarResponse)

            const result = await UserRepository.changeAvatar(file)

            // Verify call
            const callArgs = vi.mocked(fetchWithToken).mock.calls[0]!
            expect(callArgs[0]).toBe('/users/change-avatar/me')
            expect(callArgs[1]!.method).toBe('PUT')

            expect(result.avatarUrl).toBe('/new-avatar.png')
        })
    })

    describe('changePassword', () => {
        it('should call change password endpoint', async () => {
            const dto = { oldPassword: 'oldpass123', newPassword: 'newpass456' }
            const emptyResponse = {
                status: 200,
                message: 'Change password successfully!',
                data: null
            }

            vi.mocked(fetchWithToken).mockResolvedValue(emptyResponse)

            await UserRepository.changePassword(dto)

            expect(fetchWithToken).toHaveBeenCalledWith(
                '/users/change-password/me',
                {
                    method: 'PUT',
                    body: {
                        oldPassword: dto.oldPassword,
                        newPassword: dto.newPassword,
                    },
                }
            )
        })
    })
})
