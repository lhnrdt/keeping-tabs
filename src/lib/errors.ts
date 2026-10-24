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
	payment_same_member: m.error_payment_same_member,
	member_taken: m.error_member_taken,
	not_a_member: m.error_not_a_member,
	device_link_invalid: m.error_device_link_invalid,
	recovery_key_invalid: m.error_recovery_key_invalid,
	device_not_found: m.error_device_not_found,
	passkey_failed: m.error_passkey_failed,
	kind_invalid: m.error_kind_invalid,
	tint_invalid: m.error_tint_invalid,
	category_invalid: m.error_category_invalid,
	split_mode_invalid: m.error_split_mode_invalid,
	split_input_invalid: m.error_split_input_invalid,
	split_amounts_mismatch: m.error_split_amounts_mismatch,
	split_percent_mismatch: m.error_split_percent_mismatch,
	split_adjust_too_large: m.error_split_adjust_too_large,
	import_not_splitwise: m.error_import_not_splitwise,
	import_empty: m.error_import_empty,
	import_file_missing: m.error_import_file_missing,
	import_too_large: m.error_import_too_large,
	import_people_invalid: m.error_import_people_invalid,
	already_member: m.error_already_member,
	group_not_restorable: m.error_group_not_restorable,
	settings_invalid: m.error_settings_invalid,
	member_has_taken_part: m.error_member_has_taken_part,
	member_not_settled: m.error_member_not_settled
} satisfies Record<string, () => string>;

export type ErrorCode = keyof typeof errorMessages;

export const errorMessage = (code: ErrorCode | undefined) =>
	code ? errorMessages[code]() : undefined;
