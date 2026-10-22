import { resolve } from '$app/paths';
import { createDeviceLink, ensurePerson, findPerson } from '#lib/server/people.ts';
import type { Actions, PageServerLoad } from './$types';

export const load: PageServerLoad = async ({ locals }) => ({
	hasIdentity: Boolean(await findPerson(locals.db, locals.deviceKey))
});

export const actions: Actions = {
	/** A one-time link for another device (A-14); the token travels in the URL fragment */
	createLink: async ({ locals, url }) => {
		const person = await ensurePerson(locals.db, locals.deviceKey);
		const token = await createDeviceLink(locals.db, person.id);
		return { link: `${new URL(resolve('/device/link'), url.origin).href}#${token}` };
	}
};
