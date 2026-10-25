<script lang="ts">
	// Groups deleted recently, with a way to bring them back (G-3) or remove them for good (#118).
	import { BlockTitle, List, ListItem } from 'konsta/svelte';
	import FormError from '#lib/components/FormError.svelte';
	import GroupTile from '#lib/components/GroupTile.svelte';
	import DeleteGroupNow from './DeleteGroupNow.svelte';
	import RestoreGroup from './RestoreGroup.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import type { GroupKind } from '#lib/group/kinds.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { Tint } from '#lib/tints.ts';

	type Deleted = {
		id: string;
		name: string;
		kind: GroupKind;
		tint: Tint | null;
		restorableUntil: string;
	};

	let { groups, error }: { groups: Deleted[]; error?: ErrorCode } = $props();

	const dateFormat = new Intl.DateTimeFormat(getLocale(), { dateStyle: 'medium' });
</script>

{#if groups.length}
	<section aria-labelledby="recently-deleted">
		<BlockTitle id="recently-deleted">{m.recently_deleted_title()}</BlockTitle>
		<List strong inset>
			{#each groups as group (group.id)}
				<ListItem
					title={group.name}
					subtitle={m.restorable_until({
						date: dateFormat.format(new Date(group.restorableUntil))
					})}
				>
					{#snippet media()}
						<GroupTile kind={group.kind} tint={group.tint} />
					{/snippet}
					{#snippet after()}
						<DeleteGroupNow groupId={group.id} name={group.name} />
						<RestoreGroup groupId={group.id} />
					{/snippet}
				</ListItem>
			{/each}
		</List>
		<FormError {error} />
	</section>
{/if}
