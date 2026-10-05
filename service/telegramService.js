import axios from "axios";
import { config } from "../config.js";
import { log, safeError } from "./logger.js";

const telegramApi = axios.create({
  baseURL: `https://api.telegram.org/bot${config.botToken}`,
  timeout: 10000,
});

async function callTelegram(method, payload, context = {}) {
  const started = Date.now();
  log("telegram.request", { ...context, method });
  try {
    const { data, status } = await telegramApi.post(method, payload);
    if (!data.ok) {
      const error = new Error("Telegram request failed");
      error.response = { status, data: { error_code: data.error_code } };
      throw error;
    }
    log("telegram.success", { ...context, method, status, durationMs: Date.now() - started });
    return data.result;
  } catch (error) {
    log ("telegram.failed", { ...context, method, ...safeError(error), durationMs: Date.now() - started }, "error");
    throw error;
  }
}

export function sendMessage(chatId, text, context = {}) {
  return callTelegram("/sendMessage", {
    chat_id: chatId,
    text,
  }, context);
}

export function setWebhook(url) {
  return callTelegram("/setWebhook", {
    url,
    secret_token: config.webhookSecret,
    allowed_updates: ["message"],
  });
}

export function getWebhookInfo() {
  return callTelegram("/getWebhookInfo", {});
}
