import { getContext, setContext } from 'svelte';
import type { GroupMember } from './members';

const KEY = Symbol('identity');

/**
 * Which member this device is in a group (A-4, A-5). The server decides (device identity,
 * A-12); this only exposes it to the group's components and holds the "switching" state.
 */
export class Identity {
	/** The visitor asked to switch member */
	switching = $state(false);

	constructor(private readonly members: () => GroupMember[]) {}

	get me(): GroupMember | null {
		return this.members().find((member) => member.mine) ?? null;
	}

	get memberId(): string | null {
		return this.me?.id ?? null;
	}
}

export const provideIdentity = (identity: Identity) => setContext(KEY, identity);

export const useIdentity = () => getContext<Identity>(KEY);
