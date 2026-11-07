<script lang="ts">
	import { enhance } from '$app/forms';
	import { sealing } from '#lib/crypto/seal-form.ts';
	import { resolve } from '$app/paths';
	import { List, ListButton, ListItem } from 'konsta/svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { kindLabels, tintLabels } from '#lib/group/kind-style.ts';
	import type { GroupKind } from '#lib/group/kinds.ts';
	import { tabAction } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';

	import type { Member } from '#lib/group/members.ts';
	import type { DefaultSplit } from '#lib/split/default-split.ts';
	import { formatSplitInput } from '#lib/split/inputs.ts';
	import type { Tint } from '#lib/tints.ts';

	type Group = {
		shareToken: string;
		name: string;
		description: string | null;
		currency: string;
		kind: GroupKind;
		tint: Tint | null;
		simplifyDebts: boolean;
		/** New expenses' split (#41), null = equal */
		defaultSplit: DefaultSplit | null;
	};

	type Props = { group: Group; members: Member[]; hasPassword: boolean };

	let { group, members, hasPassword }: Props = $props();

	const href = $derived(resolve('/g/[token]/edit', { token: group.shareToken }));

	/** "Anna 60 % · Ben 40 %" or "Anna 2 · Ben 1" */
	const splitText = $derived.by(() => {
		const split = group.defaultSplit;
		if (!split) return '';
		return members
			.map((member) => {
				const value = formatSplitInput(split.mode, split.inputs[member.id] ?? 0, group.currency);
				return `${member.name} ${split.mode === 'percent' ? `${value} %` : value}`;
			})
			.join(' · ');
	});
</script>

<!-- In the edit form's order; each setting there opens it, like any settings row (not a field) -->
<List strong inset role="region" aria-label={m.group_details()}>
	<ListItem link {href} title={m.field_group_name()} after={group.name} />
	{#if group.description}
		<ListItem
			link
			{href}
			strongTitle={false}
			title={m.field_description()}
			text={group.description}
		/>
	{/if}
	<ListItem
		link
		{href}
		title={m.field_simplify_debts()}
		after={group.simplifyDebts ? m.on() : m.off()}
	/>
	<ListItem link {href} title={m.field_group_kind()} after={kindLabels[group.kind]()} />
	<ListItem
		link
		{href}
		title={m.field_group_color()}
		after={group.tint ? tintLabels[group.tint]() : m.tint_auto()}
	/>
	<ListItem title={m.field_currency()} after={group.currency} />
	{#if group.defaultSplit}
		<ListItem strongTitle={false} title={m.field_default_split()} text={splitText}>
			{#snippet after()}
				<!-- Back to an equal split for new expenses (red, like every reset) -->
				<form
					method="POST"
					action={tabAction('clearDefaultSplit', 'group')}
					use:enhance={sealing(['clearDefaultSplit'])}
				>
					<button type="submit" class="text-sm font-medium tone-destructive"
						>{m.default_split_reset()}</button
					>
				</form>
			{/snippet}
		</ListItem>
	{:else}
		<ListItem title={m.field_default_split()} after={m.default_split_equal()} />
	{/if}
	<ListItem
		link
		title={m.field_group_password()}
		after={hasPassword ? m.on() : m.off()}
		href={resolve('/g/[token]/password', { token: group.shareToken })}
	/>
	<ListButton {href}>
		<Icon name="edit" />
		{m.edit_group()}
	</ListButton>
</List>
