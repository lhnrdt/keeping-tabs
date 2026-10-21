import { getContext, setContext } from 'svelte';
import { getMe, setMe } from '#lib/device.ts';

const KEY = Symbol('identity');

/** Which member this device acts as in a group (A-4, A-5). */
export class Identity {
	memberId = $state<string | null>(null);
	/** False until read from device storage, so nothing flashes during SSR/hydration */
	ready = $state(false);
	/** The visitor asked to switch member */
	switching = $state(false);

	constructor(readonly groupId: string) {}

	load() {
		this.memberId = getMe(this.groupId);
		this.ready = true;
	}

	choose(memberId: string) {
		setMe(this.groupId, memberId);
		this.memberId = memberId;
		this.switching = false;
	}
}

export const provideIdentity = (identity: Identity) => setContext(KEY, identity);

export const useIdentity = () => getContext<Identity>(KEY);
