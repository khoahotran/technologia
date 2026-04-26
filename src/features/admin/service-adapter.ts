export class UnknownAdminApiError extends Error {
    constructor(message = "UNKNOWN: This admin capability is not documented yet.") {
        super(message);
        this.name = "UnknownAdminApiError";
    }
}

export const ADMIN_UNKNOWN_API_MESSAGE = "UNKNOWN: This admin capability is not documented yet.";

export function unknownAdminApi(message?: string): never {
    throw new UnknownAdminApiError(message ?? ADMIN_UNKNOWN_API_MESSAGE);
}
