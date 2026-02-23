import { describe, it, expect, vi, beforeEach } from 'vitest'
import { UserRepository } from '../user.repository'
import { httpClient } from '@/infrastructure/http/client'

vi.mock('@/infrastructure/http/client', () => ({
    httpClient: {
        get: vi.fn(),
        put: vi.fn(),
        post: vi.fn(),
    }
}))

describe('UserRepository', () => {
    beforeEach(() => {
        vi.clearAllMocks()
    })

    // Mock data matching UserProfileSchema exactly
    const mockProfile = {
        userId: 1,
        email: 'test@example.com',
        username: 'testuser',
        firstName: 'Test',
        lastName: 'User',
        phoneNumber: '0912345678',
        imageUrl: '/avatar.png',
        displayName: 'Test User',
        role: 'USER'
    }

    describe('getMe', () => {
        it('should fetch and parse user profile', async () => {
            vi.mocked(httpClient.get).mockResolvedValue({
                data: { data: mockProfile }
            })

            const result = await UserRepository.getMe()

            expect(httpClient.get).toHaveBeenCalledWith('/users/profile/me')
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
            const updatedProfile = {
                ...mockProfile,
                firstName: 'Updated',
                email: 'updated@example.com',
                displayName: 'Updated User'
            }

            vi.mocked(httpClient.put).mockResolvedValue({
                data: { data: updatedProfile }
            })

            const result = await UserRepository.updateMe(updateDto)

            expect(httpClient.put).toHaveBeenCalledWith('/users/profile/me', updateDto)
            expect(result.firstName).toBe('Updated')
            expect(result.displayName).toBe('Updated User')
        })
    })

    describe('changeAvatar', () => {
        it('should upload avatar via FormData', async () => {
            const file = new File(['content'], 'avatar.png', { type: 'image/png' })

            vi.mocked(httpClient.put).mockResolvedValue({
                data: { data: { avatarUrl: '/new-avatar.png' } }
            })

            const result = await UserRepository.changeAvatar(file)

            expect(httpClient.put).toHaveBeenCalledWith(
                '/users/change-avatar/me',
                expect.any(FormData),
                expect.objectContaining({
                    headers: { 'Content-Type': 'multipart/form-data' }
                })
            )

            // Verify FormData contains the file
            const callArgs = vi.mocked(httpClient.put).mock.calls[0]
            const formDataArg = callArgs[1] as FormData
            expect(formDataArg.get('avatar')).toBe(file)

            expect(result.avatarUrl).toBe('/new-avatar.png')
        })
    })

    describe('changePassword', () => {
        it('should call change password endpoint', async () => {
            const dto = { oldPassword: 'oldpass123', newPassword: 'newpass456' }
            vi.mocked(httpClient.put).mockResolvedValue({ data: {} })

            await UserRepository.changePassword(dto)
            expect(httpClient.put).toHaveBeenCalledWith('/users/change-password/me', dto)
        })
    })
})
