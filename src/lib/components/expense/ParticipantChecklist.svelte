<script lang="ts">
	// Who shares an equal split: one quiet line ("Everyone · €19.92 each") that opens to a
	// checklist. Most expenses are shared by everyone, so the list stays folded until needed;
	// its checkboxes are sent either way.
	import Avatar from '#lib/components/Avatar.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import type { GroupMember } from '#lib/group/members.ts';
	import { formatAmount, parseAmount, splitEqual } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';

	type Props = {
		members: GroupMember[];
		/** Who takes part, as saved or chosen before */
		selected: string[];
		/** The amount in the group's currency, as typed */
		amount: string;
		currency: string;
	};

	let { members, selected, amount, currency }: Props = $props();

	let picked = $state((() => [...selected])());
	let open = $state(false);

	const inside = $derived(members.filter((member) => picked.includes(member.id)));
	const shares = $derived.by(() => {
		const cents = parseAmount(amount.trim(), currency);
		if (!cents || inside.length === 0) return new Map<string, number>();
		return new Map(
			splitEqual(
				cents,
				inside.map((member) => member.id)
			).map((share) => [share.memberId, share.shareCents])
		);
	});
	const money = (cents: number) => formatAmount(cents, currency, getLocale());
	const listFormat = new Intl.ListFormat(getLocale(), { type: 'conjunction' });
	const summary = $derived.by(() => {
		const who =
			inside.length === members.length
				? m.split_everyone()
				: listFormat.format(inside.map((member) => member.name));
		const each = Math.min(...shares.values());
		return shares.size ? m.split_each({ who, amount: money(each) }) : who;
	});
</script>

<div class="-mt-2 flex flex-col">
	<button
		type="button"
		class="flex min-h-10 items-center gap-2 text-start text-sm text-muted"
		aria-expanded={open}
		onclick={() => (open = !open)}
	>
		<span class="flex flex-none" aria-hidden="true">
			{#each inside as member (member.id)}
				<span class="-me-1.5 rounded-full ring-2 ring-canvas dark:ring-canvas-night">
					<Avatar id={member.avatarId} name={member.name} avatar={member.avatar} size="xs" />
				</span>
			{/each}
		</span>
		<span class="ms-2 flex-1" data-testid="split-between">{summary}</span>
		<Icon name="expand" size={16} class="transition-transform {open ? 'rotate-180' : ''}" />
	</button>
	<fieldset class="flex flex-col" hidden={!open}>
		<legend class="sr-only">{m.field_split_between()}</legend>
		{#each members as member (member.id)}
			{@const share = shares.get(member.id)}
			<label
				class="flex min-h-10 cursor-pointer items-center gap-3 text-sm {picked.includes(member.id)
					? ''
					: 'text-muted'}"
			>
				<input
					type="checkbox"
					name="participants"
					value={member.id}
					class="size-[18px] flex-none accent-accent dark:accent-accent-night"
					bind:group={picked}
				/>
				<span class="flex-1">{member.name}</span>
				<span class="tabular-nums">{share === undefined ? '–' : money(share)}</span>
			</label>
		{/each}
	</fieldset>
</div>
