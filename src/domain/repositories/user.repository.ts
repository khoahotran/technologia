import type { UserProfile } from "@/src/domain/models/user.model";

export interface IUserRepository {
  getMe(): Promise<UserProfile>;
}
