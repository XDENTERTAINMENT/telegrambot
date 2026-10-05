import { config } from "../config.js";
import { log, safeError } from "../service/logger.js";
import {
  setWebhook,
  getWebhookInfo,
} from "../service/telegramService.js";

async function main() {
  if (!config.publicBaseUrl) {
    throw new Error("Missing environment variable: PUBLIC_BASE_URL");
  }

  const baseUrl = new URL(config.publicBaseUrl);

  if (baseUrl.protocol !== "https:") {
    throw new Error("PUBLIC_BASE_URL must use HTTPS");
  }

  const webhookUrl = new URL("/telegram/webhook", baseUrl).href;

  await setWebhook(webhookUrl);

  const info = await getWebhookInfo();

  log("webhook.registered", {
    matchesConfiguredUrl: info.url === webhookUrl,
    pendingUpdates: info.pending_update_count,
    hasHistoricalDeliveryError: Boolean(info.last_error_message),
  });
}

main().catch((error) => {
  log("webhook.setup_failed", safeError(error), "error");

  process.exitCode = 1;
});
