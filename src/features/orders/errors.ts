export class UnknownContractError extends Error {
    constructor(message: string) {
        super(message);
        this.name = "UnknownContractError";
    }
}
