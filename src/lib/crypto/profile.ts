// What's yours across groups (#110): your name and how to pay you. The server keeps them sealed with
// your vault key, which only your devices have, and each group gets its own copy of how to pay you,
// sealed with that group's key if it's encrypted. They're only readable by those who need them.
import { keyFor } from './keyring';
import { sealText, textContext } from './seal';
import { ensureVault } from './vault';

/** Sealed for yourself; a device without your vault shows it as empty (open-data.ts) */
export const PROFILE_CONTEXT = 'profile';

export const sealForMe = async (text: string) =>
	sealText(await ensureVault(), text, PROFILE_CONTEXT);

export type MyGroup = { memberId: string; keyId: string | null };

/** How to pay you, as each of your groups gets it; a group whose key isn't here is left out */
export async function paymentCopies(details: string, groups: readonly MyGroup[]) {
	const copies = await Promise.all(
		groups.map(async ({ memberId, keyId }) => {
			if (!keyId || !details) return { memberId, value: details || null };
			const key = await keyFor(keyId);
			if (!key) return null;
			const value = await sealText(key, details, textContext('payment', memberId));
			return { memberId, value };
		})
	);
	return copies.filter((copy) => copy !== null);
}

/** Puts how to pay you into a form for the profile's `payment` action */
export async function fillPaymentForm(form: FormData, details: string, groups: readonly MyGroup[]) {
	form.delete('paymentDetails');
	form.set('sealedPaymentDetails', details ? await sealForMe(details) : '');
	form.set('copies', JSON.stringify(await paymentCopies(details, groups)));
}
