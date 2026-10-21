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
	member_not_found: m.error_member_not_found,
	expense_title_required: m.error_expense_title_required,
	expense_title_too_long: m.error_expense_title_too_long,
	amount_invalid: m.error_amount_invalid,
	date_invalid: m.error_date_invalid,
	payer_invalid: m.error_payer_invalid,
	participants_required: m.error_participants_required,
	recipient_invalid: m.error_recipient_invalid,
	payment_same_member: m.error_payment_same_member
} satisfies Record<string, () => string>;

export type ErrorCode = keyof typeof errorMessages;

export const errorMessage = (code: ErrorCode | undefined) =>
	code ? errorMessages[code]() : undefined;
