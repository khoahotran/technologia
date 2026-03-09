
export type LogLevel = "debug" | "info" | "warn" | "error";

export type UserActionType =
    | "ADD_TO_CART"
    | "REMOVE_FROM_CART"
    | "UPDATE_CART_QUANTITY"
    | "CHECKOUT_START"
    | "CHECKOUT_COMPLETE"
    | "LOGIN"
    | "LOGOUT"
    | "ADD_TO_WISHLIST"
    | "REMOVE_FROM_WISHLIST";

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: Record<string, unknown>;
    error?: Error | null;
}

class Logger {
    private minLevel: LogLevel;

    constructor() {
        this.minLevel = process.env.NODE_ENV === "production" ? "info" : "debug";
    }

    private log(level: LogLevel, message: string, context?: Record<string, unknown>, error?: Error | null) {
        const timestamp = new Date().toISOString();
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

        const logFn = {
            debug: console.debug,
            info: console.info,
            warn: console.warn,
            error: console.error,
        }[level];

        if (context) {
            logFn(`${prefix} ${message}`, context);
        } else {
            logFn(`${prefix} ${message}`);
        }

        if (error) {
            console.error(`${prefix} Error details:`, error);
        }
    }

    debug(message: string, context?: Record<string, unknown>) {
        if (this.minLevel === "debug") this.log("debug", message, context);
    }

    info(message: string, context?: Record<string, unknown>) {
        this.log("info", message, context);
    }

    warn(message: string, context?: Record<string, unknown>) {
        this.log("warn", message, context);
    }

    error(message: string, error?: unknown, context?: Record<string, unknown>) {
        const errorObj = error instanceof Error ? error : null;
        this.log("error", message, context, errorObj);
    }

    action(action: UserActionType, data: Record<string, unknown> = {}) {
        const timestamp = new Date().toISOString();
        console.warn(`[${timestamp}] [ACTION] ${action}`, data);
    }
}

export const logger = new Logger();
