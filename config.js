import { loadEnvFile } from "node:process";

try {
  loadEnvFile(new URL("./.env", import.meta.url));
} catch (error) {
  if (error.code !== "ENOENT") throw error;
}

function required(name) {
  const value = process.env[name]?.trim();

  if (!value) {
    throw new Error(`Missing environment variable: ${name}`);
  }

  return value;
}

export const config = {
  port: Number(process.env.PORT || 3000),
  botToken: required("TELEGRAM_BOT_TOKEN"),
  webhookSecret: required("TELEGRAM_WEBHOOK_SECRET"),
  publicBaseUrl: process.env.PUBLIC_BASE_URL?.trim(),
};