/**
 * Formats a params object by converting fromDate and toDate fields to ISO strings.
 * This ensures compatibility with Java Spring backends expecting ISO-8601 format.
 */
export function formatParamsWithDates<T extends Record<string, any>>(params: T): T {
    const formatted = { ...params } as Record<string, any>;

    if (formatted["fromDate"]) {
        try {
            formatted["fromDate"] = new Date(formatted["fromDate"]).toISOString().replace("Z", "");
        } catch (e) {
            console.error("Invalid fromDate", e);
        }
    }

    if (formatted["toDate"]) {
        try {
            formatted["toDate"] = new Date(formatted["toDate"]).toISOString().replace("Z", "");
        } catch (e) {
            console.error("Invalid toDate", e);
        }
    }

    if (formatted["sortBy"] && typeof formatted["sortBy"] === "string") {
        formatted["sortBy"] = formatted["sortBy"]
            .replace(/([a-z])([A-Z])/g, "$1_$2")
            .toLowerCase();
    }

    return formatted as T;
}
