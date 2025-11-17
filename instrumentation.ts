import { NODE_ENV } from "./lib/constants";

export function initInstrumentation() {
  if (NODE_ENV === "production") {
    console.log("Instrumentation initialized");
  }
}
