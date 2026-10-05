import { config } from "../config.js";
import { handleUpdate } from "../service/botService.js";
import { log, safeError } from "../service/logger.js";

export async function receiveMessage(req, res) {
  const secret = req.get("X-Telegram-Bot-Api-Secret-Token");

  if (secret !== config.webhookSecret) {
    log("webhook.rejected", { requestId: req.requestId, reason: "missing_or_invalid_secret" }, "warn");
    return res.sendStatus(403);
  }

  try {
    log("webhook.accepted", { requestId: req.requestId });
    await handleUpdate(req.body, { requestId: req.requestId });
    log("webhook.handled", { requestId: req.requestId });

    return res.sendStatus(200);
  } catch (error) {
    log("webhook.failed", { requestId: req.requestId, ...safeError(error) }, "error");

    return res.sendStatus(500);
  }
}
