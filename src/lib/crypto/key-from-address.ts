// A group link's key in the address (#110). Apart from the keyring, which the service worker uses too
// and which has no address to look at.
import { rememberKey } from './keyring';
import { isKey } from './seal';

const HASH_KEY = /(?:^#|&)key=([\w-]{43})(?:&|$)/;

/** A group link's key, if the address has one: kept, and taken out of the address */
export async function takeKeyFromAddress() {
	const key = HASH_KEY.exec(location.hash)?.[1];
	if (!isKey(key)) return undefined;
	const id = await rememberKey(key);
	history.replaceState(history.state, '', `${location.pathname}${location.search}`);
	return { key, id };
}
