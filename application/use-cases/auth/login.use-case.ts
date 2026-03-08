import { getErrorMessage } from "@/domain/errors";
import type { LoginDto } from "@/domain/user/dto/auth.dto";
import { loginUseCase as executeLogin } from "@/src/application/use-cases/login.use-case";

export type LoginResult =
  | { ok: true; userId: string | number }
  | { ok: false; error: string };

export async function loginUseCase(credentials: LoginDto): Promise<LoginResult> {
  try {
    const response = await executeLogin(credentials);
    return { ok: true, userId: response.userId };
  } catch (error) {
    return { ok: false, error: getErrorMessage(error) };
  }
}
