import test from "node:test";
import assert from "node:assert/strict";
import axios from "axios";

// Use dummy credentials and a fake transport: tests never contact Telegram.
process.env.TELEGRAM_BOT_TOKEN = "123:test-token-private";
process.env.TELEGRAM_WEBHOOK_SECRET = "test-secret-private";
const calls = [];
let fail = false;
axios.defaults.adapter = async (request) => {
  calls.push({ method: request.url, payload: JSON.parse(request.data) });
  if (fail) {
    const error = new Error("private-message-content test-secret-private test-token-private");
    error.code = "ERR_BAD_RESPONSE";
    error.response = { status: 502, data: { description: error.message } };
    throw error;
  }
  return { data: { ok: true, result: {} }, status: 200, headers: {}, config: request };
};
const { receiveMessage } = await import("../controller.js/messageController.js");

test("webhook authentication, replies, ignored updates, and safe failure logs", async () => {
  const output = [];
  const originals = { log: console.log, warn: console.warn, error: console.error };
  for (const key of Object.keys(originals)) console[key] = (line) => output.push(line);
  const receive = async (body, secret = process.env.TELEGRAM_WEBHOOK_SECRET) => {
    let status;
    await receiveMessage({ body, requestId: "test-request", get: () => secret }, { sendStatus: (value) => { status = value; } });
    return status;
  };
  try {
    const update = { message: { chat: { id: 123456789 }, text: "/start" } };
    assert.equal(await receive(update, "incorrect"), 403);
    assert.equal(calls.length, 0);
    assert.equal(await receive(update), 200);
    assert.equal(calls[0].method, "/sendMessage");
    assert.equal(calls[0].payload.chat_id, 123456789);
    assert.match(calls[0].payload.text, /Welcome/);
    assert.equal(await receive({ message: { chat: { id: 123456789 }, text: "private-message-content" } }), 200);
    assert.match(calls[1].payload.text, /received/);
    assert.equal(await receive({}), 200);
    assert.equal(calls.length, 2);
    fail = true;
    assert.equal(await receive(update), 500);
    const logs = output.join("\n");
    for (const secret of ["test-token-private", "test-secret-private", "private-message-content", "123456789"]) {
      assert.equal(logs.includes(secret), false);
    }
    for (const event of ["webhook.rejected", "webhook.accepted", "bot.command", "telegram.request", "telegram.success", "telegram.failed", "webhook.failed"]) {
      assert.ok(output.some((line) => JSON.parse(line).event === event));
    }
  } finally {
    Object.assign(console, originals);
  }
});
