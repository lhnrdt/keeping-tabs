<script lang="ts">
	// Who an equal split is for: everyone as a chip with their share, all in at first; a tap leaves
	// someone out or brings them back. Checkboxes underneath, sent either way.
	import Avatar from '#lib/components/Avatar.svelte';
	import type { GroupMember } from '#lib/group/members.ts';
	import { formatAmount, parseAmount, splitEqual } from '#lib/money.ts';
	import { getLocale } from '#lib/paraglide/runtime.js';

	type Props = {
		members: GroupMember[];
		/** Who takes part, as saved or chosen before */
		selected: string[];
		/** The amount in the group's currency, as typed */
		amount: string;
		currency: string;
		legend: string;
	};

	let { members, selected, amount, currency, legend }: Props = $props();

	let picked = $state((() => [...selected])());

	const shares = $derived.by(() => {
		const cents = parseAmount(amount.trim(), currency);
		const inside = members.filter((member) => picked.includes(member.id));
		if (!cents || inside.length === 0) return new Map<string, number>();
		return new Map(
			splitEqual(
				cents,
				inside.map((member) => member.id)
			).map((share) => [share.memberId, share.shareCents])
		);
	});
	const money = (cents: number) => formatAmount(cents, currency, getLocale());
</script>

<fieldset class="flex flex-col">
	<legend class="sr-only">{legend}</legend>
	<div class="flex flex-wrap gap-2">
		{#each members as member (member.id)}
			{@const share = shares.get(member.id)}
			<label
				class="flex min-h-12 cursor-pointer items-center gap-2 rounded-2xl border border-transparent bg-surface-muted py-1.5 ps-1.5 pe-3.5 text-sm transition-colors has-checked:border-accent has-checked:bg-accent-soft/50 has-focus-visible:ring-2 dark:bg-surface-muted-night dark:has-checked:border-accent-night dark:has-checked:bg-accent-soft-night/50 {picked.includes(
					member.id
				)
					? ''
					: 'text-muted opacity-70'}"
			>
				<input
					class="sr-only"
					type="checkbox"
					name="participants"
					value={member.id}
					bind:group={picked}
				/>
				<Avatar id={member.avatarId} name={member.name} avatar={member.avatar} size="sm" />
				<span class="flex flex-col leading-tight">
					<span class="font-medium">{member.name}</span>
					<span class="text-xs text-muted tabular-nums"
						>{share === undefined ? '–' : money(share)}</span
					>
				</span>
			</label>
		{/each}
	</div>
</fieldset>
