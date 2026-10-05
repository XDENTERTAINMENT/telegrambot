import { config } from "../config.js";
import { getWebhookInfo } from "../service/telegramService.js";
import { log, safeError } from "../service/logger.js";

try {
  const expected = new URL("/telegram/webhook", config.publicBaseUrl).href;
  const info = await getWebhookInfo();
  const message = info.last_error_message || "";
  const status = message.match(/\b(4\d\d|5\d\d)\b/)?.[1];
  log("webhook.status", {
    registered: Boolean(info.url),
    matchesConfiguredUrl: info.url === expected,
    pendingUpdates: info.pending_update_count,
    lastErrorAt: info.last_error_date ? new Date(info.last_error_date * 1000).toISOString() : null,
    lastDeliveryIssue: !message ? "none" : status ? `http_${status}` : /timeout|timed out/i.test(message) ? "timeout" : /resolve/i.test(message) ? "dns" : "delivery_failed",
  });
  if (info.url !== expected) {
    log("webhook.action_needed", { action: "run_npm_run_webhook_set" }, "warn");
    process.exitCode = 1;
  }
} catch (error) {
  log("webhook.check_failed", safeError(error), "error");
  process.exitCode = 1;
}
