// Deleted groups can be restored for a while before they are gone for good (G-3).

export const DELETED_GROUP_DAYS = 30;

const DAY_MS = 24 * 60 * 60 * 1000;

/** The last moment a group deleted at `deletedAt` can still be restored. */
export const restorableUntil = (deletedAt: Date) =>
	new Date(deletedAt.getTime() + DELETED_GROUP_DAYS * DAY_MS);

export const isRestorable = (deletedAt: Date, now = new Date()) =>
	now <= restorableUntil(deletedAt);
