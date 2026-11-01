import { fail } from '@sveltejs/kit';
import { formatAvatar, parseAvatar } from '#lib/avatars.ts';
import type { ErrorCode } from '#lib/errors.ts';
import { ensurePerson, findPerson } from '#lib/server/people.ts';
import { saveSettings } from '#lib/server/settings.ts';
import { LIMITS, normalizeText } from '#lib/validation.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => {
	const person = await findPerson(locals.db, locals.deviceKey);
	return {
		personId: person?.id ?? null,
		name: person?.name ?? '',
		avatar: person?.avatar ?? null,
		paymentDetails: person?.paymentDetails ?? ''
	};
};

// Each saves on its own as soon as it changes (S-3)
export const actions: Actions = {
	name: async ({ locals, request }) => {
		const name = normalizeText((await request.formData()).get('name'));
		if (name.length > LIMITS.memberName) {
			return fail(400, { setting: 'name', error: 'member_name_too_long' as ErrorCode });
		}
		if (!name) return { setting: 'name' };
		const person = await ensurePerson(locals.db, locals.deviceKey);
		await saveSettings(locals.db, person.id, { name });
		return { setting: 'name' };
	},

	/** How to pay you (#47), shown to people in your groups when they pay you */
	payment: async ({ locals, request }) => {
		const details = normalizeText((await request.formData()).get('paymentDetails'));
		if (details.length > LIMITS.paymentDetails) {
			return fail(400, { setting: 'payment', error: 'payment_details_too_long' as ErrorCode });
		}
		const person = await ensurePerson(locals.db, locals.deviceKey);
		await saveSettings(locals.db, person.id, { paymentDetails: details || null });
		return { setting: 'payment' };
	},

	/** Your avatar (#61): an icon or "initials", on a tint */
	avatar: async ({ locals, request }) => {
		const form = await request.formData();
		const choice = parseAvatar(`${form.get('icon')}:${form.get('tint')}`);
		if (!choice) return fail(400, { setting: 'avatar', error: 'settings_invalid' as ErrorCode });
		const person = await ensurePerson(locals.db, locals.deviceKey);
		await saveSettings(locals.db, person.id, { avatar: formatAvatar(choice) });
		return { setting: 'avatar' };
	}
};
