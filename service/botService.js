import { sendMessage } from "./telegramService.js";
import { log } from "./logger.js";

export async function handleUpdate(update, context = {}) {
  const message = update?.message;

  // Ignore updates without a text message.
  if (!message || typeof message.text !== "string") {
    log("bot.update_ignored", { ...context, reason: "no_text_message" });
    return;
  }

  if (!Number.isSafeInteger(message.chat?.id)) {
    log("bot.update_ignored", { ...context, reason: "invalid_chat" }, "warn");
    return;
  }

  const chatId = message.chat.id;
  const text = message.text.trim();

  // Supports /start, /start with arguments, and /start@BotName.
  const command = text.split(/\s+/)[0].split("@")[0];

  if (command === "/start") {
    log("bot.command", { ...context, command: "start" });
    await sendMessage(
      chatId,
      "Welcome! 👋 Your bot is working. Send me a message.",
      context
    );
    return;
  }

  log("bot.message", { ...context, action: "reply" });
  await sendMessage(chatId, "I received your message ✅", context);
}
