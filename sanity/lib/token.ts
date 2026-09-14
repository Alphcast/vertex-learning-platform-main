import "server-only";

/**
 * The dataset is private, so every read is token authenticated. This module is server-only:
 * importing it from a client component is a build error, not a leaked credential.
 */
export const readToken = process.env.SANITY_API_READ_TOKEN || "";
