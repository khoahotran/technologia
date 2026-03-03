/**
 * Structured Logging System
 *
 * Moved from lib/logger.ts to shared/utils/logger.ts.
 */

// ===========================================
// Types
// ===========================================

export type LogLevel = "debug" | "info" | "warn" | "error";

export type UserActionType =
    | "ADD_TO_CART"
    | "REMOVE_FROM_CART"
    | "UPDATE_CART_QUANTITY"
    | "CHECKOUT_START"
    | "CHECKOUT_COMPLETE"
    | "SEARCH"
    | "FILTER"
    | "VIEW_PRODUCT"
    | "ADD_TO_WISHLIST"
    | "REMOVE_FROM_WISHLIST"
    | "LOGIN"
    | "LOGOUT"
    | "REGISTER"
    | "PROFILE_UPDATE"
    | "PASSWORD_CHANGE";

export interface LogEntry {
    timestamp: string;
    level: LogLevel;
    message: string;
    context?: Record<string, unknown> | undefined;
    error?: Error | null | undefined;
    userId?: string | null | undefined;
    sessionId?: string | null | undefined;
    requestId?: string | null | undefined;
}

export interface UserActionEntry {
    timestamp: string;
    action: UserActionType;
    data: Record<string, unknown>;
    userId?: string | null;
    sessionId?: string | null;
}

/**
 * Log transport interface for extensibility
 */
export interface LogTransport {
    log(entry: LogEntry): void;
    action(entry: UserActionEntry): void;
}

// ===========================================
// Console Transport (Default)
// ===========================================

const consoleTransport: LogTransport = {
    log(entry: LogEntry): void {
        const { level, message, context, error, timestamp } = entry;
        const prefix = `[${timestamp}] [${level.toUpperCase()}]`;

        const logFn = {
            debug: console.warn,
            info: console.warn,
            warn: console.warn,
            error: console.error,
        }[level];

        if (context && Object.keys(context).length > 0) {
            logFn(`${prefix} ${message}`, context);
        } else {
            logFn(`${prefix} ${message}`);
        }

        if (error) {
            console.error(`${prefix} Error details:`, error);
        }
    },

    action(entry: UserActionEntry): void {
        const { action, data, timestamp, userId } = entry;
        console.warn(
            `[${timestamp}] [ACTION] ${action}`,
            { ...data, userId }
        );
    },
};

// ===========================================
// Logger Configuration
// ===========================================

interface LoggerConfig {
    minLevel: LogLevel;
    enabled: boolean;
    includeTimestamp: boolean;
    getUserId?: () => string | null;
    getSessionId?: () => string | null;
}

const LOG_LEVELS: Record<LogLevel, number> = {
    debug: 0,
    info: 1,
    warn: 2,
    error: 3,
};

// ===========================================
// Logger Class
// ===========================================

class Logger {
    private config: LoggerConfig;
    private transports: LogTransport[] = [];
    private actionQueue: UserActionEntry[] = [];
    private flushInterval: NodeJS.Timeout | null = null;

    constructor(config?: Partial<LoggerConfig>) {
        this.config = {
            minLevel: process.env.NODE_ENV === "production" ? "info" : "debug",
            enabled: true,
            includeTimestamp: true,
            ...config,
        };
        this.transports.push(consoleTransport);
    }

    addTransport(transport: LogTransport): void {
        this.transports.push(transport);
    }

    configure(config: Partial<LoggerConfig>): void {
        this.config = { ...this.config, ...config };
    }

    setUserIdGetter(getter: () => string | null): void {
        this.config.getUserId = getter;
    }

    setSessionIdGetter(getter: () => string | null): void {
        this.config.getSessionId = getter;
    }

    private shouldLog(level: LogLevel): boolean {
        if (!this.config.enabled) return false;
        return LOG_LEVELS[level] >= LOG_LEVELS[this.config.minLevel];
    }

    private createEntry(
        level: LogLevel,
        message: string,
        context?: Record<string, unknown>,
        error?: Error | null
    ): LogEntry {
        return {
            timestamp: this.config.includeTimestamp
                ? new Date().toISOString()
                : "",
            level,
            message,
            context,
            error,
            userId: this.config.getUserId?.() ?? null,
            sessionId: this.config.getSessionId?.() ?? null,
        };
    }

    private dispatch(entry: LogEntry): void {
        for (const transport of this.transports) {
            try {
                transport.log(entry);
            } catch {
                // Silently fail
            }
        }
    }

    debug(message: string, context?: Record<string, unknown>): void {
        if (this.shouldLog("debug")) {
            this.dispatch(this.createEntry("debug", message, context));
        }
    }

    info(message: string, context?: Record<string, unknown>): void {
        if (this.shouldLog("info")) {
            this.dispatch(this.createEntry("info", message, context));
        }
    }

    warn(message: string, context?: Record<string, unknown>): void {
        if (this.shouldLog("warn")) {
            this.dispatch(this.createEntry("warn", message, context));
        }
    }

    error(
        message: string,
        error?: Error | unknown,
        context?: Record<string, unknown>
    ): void {
        if (this.shouldLog("error")) {
            const errorObj = error instanceof Error ? error : null;
            this.dispatch(this.createEntry("error", message, context, errorObj));
        }
    }

    action(action: UserActionType, data: Record<string, unknown> = {}): void {
        const entry: UserActionEntry = {
            timestamp: new Date().toISOString(),
            action,
            data,
            userId: this.config.getUserId?.() ?? null,
            sessionId: this.config.getSessionId?.() ?? null,
        };

        for (const transport of this.transports) {
            try {
                transport.action(entry);
            } catch { }
        }
        this.actionQueue.push(entry);
    }

    getQueuedActions(): UserActionEntry[] {
        return [...this.actionQueue];
    }

    clearActionQueue(): void {
        this.actionQueue = [];
    }

    startAutoFlush(
        flushFn: (actions: UserActionEntry[]) => Promise<void>,
        intervalMs: number = 30000
    ): void {
        this.stopAutoFlush();
        this.flushInterval = setInterval(async () => {
            const actions = this.getQueuedActions();
            if (actions.length > 0) {
                try {
                    await flushFn(actions);
                    this.clearActionQueue();
                } catch (error) {
                    this.error("Failed to flush action queue", error);
                }
            }
        }, intervalMs);
    }

    stopAutoFlush(): void {
        if (this.flushInterval) {
            clearInterval(this.flushInterval);
            this.flushInterval = null;
        }
    }
}

export const logger = new Logger();

export function createScopedLogger(
    scope: string,
    defaultContext?: Record<string, unknown>
) {
    return {
        debug: (message: string, context?: Record<string, unknown>) =>
            logger.debug(`[${scope}] ${message}`, { ...defaultContext, ...context }),
        info: (message: string, context?: Record<string, unknown>) =>
            logger.info(`[${scope}] ${message}`, { ...defaultContext, ...context }),
        warn: (message: string, context?: Record<string, unknown>) =>
            logger.warn(`[${scope}] ${message}`, { ...defaultContext, ...context }),
        error: (
            message: string,
            error?: Error | unknown,
            context?: Record<string, unknown>
        ) =>
            logger.error(`[${scope}] ${message}`, error, {
                ...defaultContext,
                ...context,
            }),
    };
}

export { Logger };
