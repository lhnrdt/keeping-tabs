import { fail } from '@sveltejs/kit';
import { formatAvatar, parseAvatar } from '#lib/avatars.ts';
import type { ErrorCode } from '#lib/errors.ts';
import { isSealed } from '#lib/crypto/seal.ts';
import { listGroupsOf } from '#lib/server/groups.ts';
import { savePaymentCopies } from '#lib/server/payment-copies.ts';
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
		paymentDetails: person?.sealedPaymentDetails ?? person?.paymentDetails ?? '',
		groups: person
			? (await listGroupsOf(locals.db, person.id)).map(({ memberId, keyId }) => ({
					memberId,
					keyId
				}))
			: [],
		// From before these were sealed (#110): the browser seals them when it comes here
		readable: Boolean(person?.paymentDetails || (person?.name && !isSealed(person.name)))
	};
};

// Each saves on its own as soon as it changes (S-3)
export const actions: Actions = {
	name: async ({ locals, request }) => {
		const name = normalizeText((await request.formData()).get('name'));
		if (!isSealed(name) && (name as string).length > LIMITS.memberName) {
			return fail(400, { setting: 'name', error: 'member_name_too_long' as ErrorCode });
		}
		if (!name) return { setting: 'name' };
		const person = await ensurePerson(locals.db, locals.deviceKey);
		await saveSettings(locals.db, person.id, { name });
		return { setting: 'name' };
	},

	/** How to pay you (#47), shown to people in your groups when they pay you */
	payment: async ({ locals, request }) => {
		const form = await request.formData();
		const person = await ensurePerson(locals.db, locals.deviceKey);
		// Sealed in the browser, with a copy for each group (#110); without JavaScript, as typed
		const sealed = form.get('sealedPaymentDetails');
		if (sealed !== null) {
			if (
				(sealed && !isSealed(sealed)) ||
				!(await savePaymentCopies(locals.db, person.id, form.get('copies')))
			) {
				return fail(400, { setting: 'payment', error: 'settings_invalid' as ErrorCode });
			}
			await saveSettings(locals.db, person.id, {
				paymentDetails: null,
				sealedPaymentDetails: String(sealed) || null
			});
			return { setting: 'payment' };
		}
		const details = normalizeText(form.get('paymentDetails'));
		if (details.length > LIMITS.paymentDetails) {
			return fail(400, { setting: 'payment', error: 'payment_details_too_long' as ErrorCode });
		}
		await saveSettings(locals.db, person.id, { paymentDetails: details || null });
		return { setting: 'payment' };
	},

	/** A copy for one group, when it's missing or out of date; the rest stays as it is */
	paymentCopy: async ({ locals, request }) => {
		const person = await ensurePerson(locals.db, locals.deviceKey);
		const saved = await savePaymentCopies(
			locals.db,
			person.id,
			(await request.formData()).get('copies')
		);
		return saved ? {} : fail(400, { setting: 'payment', error: 'settings_invalid' as ErrorCode });
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
