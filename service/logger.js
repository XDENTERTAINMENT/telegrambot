// Only pass application-defined labels and non-sensitive counters to this logger.
// Never pass requests, payloads, headers, URLs, tokens, or whole errors.
export function log(event, details = {}, level = "info") {
  const output = JSON.stringify({ time: new Date().toISOString(), level, event, ...details });
  (level === "error" ? console.error : level === "warn" ? console.warn : console.log)(output);
}

export function safeError(error) {
  const allowedCodes = ["ECONNREFUSED", "ECONNRESET", "ECONNABORTED", "ETIMEDOUT", "ENOTFOUND", "EAI_AGAIN", "ERR_NETWORK", "ERR_BAD_REQUEST", "ERR_BAD_RESPONSE"];
  return {
    code: allowedCodes.includes(error?.code) ? error.code : "REQUEST_FAILED",
    ...(Number.isInteger(error?.response?.status) ? { status: error.response.status } : {}),
    ...(Number.isInteger(error?.response?.data?.error_code) ? { telegramCode: error.response.data.error_code } : {}),
  };
}
