import { randomSecret } from './secrets';

export const SHARE_TOKEN_PATTERN = /^[A-Za-z0-9_-]{22}$/;

/** Random, URL-safe secret for a group's share link: 128 bits (A-2). */
export const newShareToken = () => randomSecret(16);
