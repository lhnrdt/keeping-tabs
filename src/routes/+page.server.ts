import { fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { ErrorCode } from '#lib/errors.ts';
import { getLocale } from '#lib/paraglide/runtime.js';
import { currencyOptions, DEFAULT_CURRENCY } from '#lib/server/currencies.ts';
import { createGroup } from '#lib/server/groups.ts';
import {
	normalizeText,
	parseCurrency,
	parseDescription,
	parseGroupName,
	parseMemberNames
} from '#lib/validation.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = () => ({
	currencies: currencyOptions(getLocale()),
	defaultCurrency: DEFAULT_CURRENCY
});

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const values = {
			name: String(form.get('name') ?? ''),
			description: String(form.get('description') ?? ''),
			currency: String(form.get('currency') ?? ''),
			you: String(form.get('you') ?? ''),
			members: form.getAll('member').map(String)
		};
		const invalid = (error: ErrorCode) => fail(400, { error, values });

		const name = parseGroupName(values.name);
		if (!name.ok) return invalid(name.error);
		const description = parseDescription(values.description);
		if (!description.ok) return invalid(description.error);
		const currency = parseCurrency(values.currency);
		if (!currency.ok) return invalid(currency.error);
		// The creator comes first, so they become the acting member
		if (!normalizeText(values.you)) return invalid('member_name_required');
		const memberNames = parseMemberNames([values.you, ...values.members]);
		if (!memberNames.ok) return invalid(memberNames.error);

		const { shareToken, creatorId } = await createGroup(locals.db, {
			name: name.value,
			description: description.value,
			currency: currency.value,
			memberNames: memberNames.value
		});
		redirect(303, `${resolve('/g/[token]', { token: shareToken })}?me=${creatorId}`);
	}
};
