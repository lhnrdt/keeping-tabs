import { getContext, setContext } from 'svelte';
import type { GroupMember } from './members';

const KEY = Symbol('identity');

/**
 * Which member you are in a group (A-4, A-5). The server decides (device identity, A-12);
 * this only exposes it to the group's components.
 */
export class Identity {
	/** "Not you?" sheet is open */
	showing = $state(false);

	constructor(
		private readonly members: () => GroupMember[],
		/** Whether you can still step back (you haven't added or changed anything) */
		private readonly stepBack: () => boolean
	) {}

	get me(): GroupMember | null {
		return this.members().find((member) => member.mine) ?? null;
	}

	get memberId(): string | null {
		return this.me?.id ?? null;
	}

	get canStepBack(): boolean {
		return this.stepBack();
	}
}

export const provideIdentity = (identity: Identity) => setContext(KEY, identity);

export const useIdentity = () => getContext<Identity>(KEY);
