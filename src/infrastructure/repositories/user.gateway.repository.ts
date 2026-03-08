import type { UserProfile } from "@/src/domain/models/user.model";
import type { IUserRepository } from "@/src/domain/repositories/user.repository";
import { requestAndValidate } from "@/src/infrastructure/api/api-client";
import { userProfileResponseSchema } from "@/src/infrastructure/api/schemas";

export const userGatewayRepository: IUserRepository = {
  async getMe(): Promise<UserProfile> {
    const response = await requestAndValidate(
      {
        url: "/api/users/profile/me",
        method: "GET",
      },
      userProfileResponseSchema
    );

    return response.data;
  },
};
