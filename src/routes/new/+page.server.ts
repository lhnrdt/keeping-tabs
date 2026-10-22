import { fail, redirect } from '@sveltejs/kit';
import { resolve } from '$app/paths';
import type { ErrorCode } from '#lib/errors.ts';
import { getLocale } from '#lib/paraglide/runtime.js';
import { currencyOptions, DEFAULT_CURRENCY } from '#lib/server/currencies.ts';
import { createGroup } from '#lib/server/groups.ts';
import { ensurePerson, findPerson, setProfileName } from '#lib/server/people.ts';
import {
	normalizeText,
	parseCurrency,
	parseKind,
	parseTint,
	parseDescription,
	parseGroupName,
	parseMemberNames
} from '#lib/validation.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const person = await findPerson(locals.db, locals.deviceKey);
	return {
		currencies: currencyOptions(getLocale()),
		defaultCurrency: DEFAULT_CURRENCY,
		// Pre-fills "Your name" (A-13)
		profileName: person?.name ?? ''
	};
};

export const actions: Actions = {
	default: async ({ request, locals }) => {
		const form = await request.formData();
		const values = {
			name: String(form.get('name') ?? ''),
			description: String(form.get('description') ?? ''),
			currency: String(form.get('currency') ?? ''),
			kind: String(form.get('kind') ?? ''),
			tint: String(form.get('tint') ?? ''),
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
		const kind = parseKind(values.kind);
		if (!kind.ok) return invalid(kind.error);
		const tint = parseTint(values.tint);
		if (!tint.ok) return invalid(tint.error);
		// The creator comes first, so they become the acting member
		if (!normalizeText(values.you)) return invalid('member_name_required');
		const memberNames = parseMemberNames([values.you, ...values.members]);
		if (!memberNames.ok) return invalid(memberNames.error);

		const person = await ensurePerson(locals.db, locals.deviceKey);
		await setProfileName(locals.db, person.id, memberNames.value[0]);
		const { shareToken } = await createGroup(locals.db, {
			name: name.value,
			description: description.value,
			currency: currency.value,
			kind: kind.value,
			tint: tint.value,
			memberNames: memberNames.value,
			creatorPersonId: person.id
		});
		redirect(303, resolve('/g/[token]', { token: shareToken }));
	}
};
