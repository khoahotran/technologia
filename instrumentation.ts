// app/instrumentation.ts
export function initInstrumentation() {
  if (process.env.NODE_ENV === "production") {
    // Ví dụ: setup Sentry
    // import * as Sentry from "@sentry/nextjs";
    // Sentry.init({ dsn: process.env.SENTRY_DSN });
    console.log("Instrumentation initialized");
  }
}
