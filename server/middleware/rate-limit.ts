import rateLimit from "express-rate-limit";

export const pentestStartRateLimit = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 5,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    message: "Too many pentest requests. Please wait before starting another job."
  }
});
