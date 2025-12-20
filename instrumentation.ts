import { NODE_ENV } from "./lib/constants";

export function initInstrumentation() {
  if (NODE_ENV === "production") {
    // eslint-disable-next-line no-console
    console.log("Instrumentation initialized");
  }
}
