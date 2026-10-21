import { m } from '#lib/paraglide/messages.js';

/** Validation errors returned by form actions; translated on the client. */
export const errorMessages = {
	group_name_required: m.error_group_name_required,
	group_name_too_long: m.error_group_name_too_long,
	description_too_long: m.error_description_too_long,
	currency_invalid: m.error_currency_invalid,
	member_name_required: m.error_member_name_required,
	member_name_too_long: m.error_member_name_too_long,
	member_name_taken: m.error_member_name_taken,
	member_not_found: m.error_member_not_found
} satisfies Record<string, () => string>;

export type ErrorCode = keyof typeof errorMessages;

export const errorMessage = (code: ErrorCode | undefined) =>
	code ? errorMessages[code]() : undefined;
