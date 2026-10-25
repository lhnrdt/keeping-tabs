<script lang="ts">
	// Settling up (#166): how much has been paid back vs. is still open (a meter in one ramp),
	// then who still pays whom, with how long they've owed.
	import Avatar from '#lib/components/Avatar.svelte';
	import type { GroupMember } from '#lib/group/members.ts';
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { Settling } from '#lib/insights/insights.ts';

	type Props = { settling: Settling; members: GroupMember[]; currency: string };

	let { settling, members, currency }: Props = $props();

	const byId = $derived(new Map(members.map((member) => [member.id, member])));
	const money = (amount: number) => formatAmount(amount, currency, getLocale());
	const date = (iso: string) =>
		new Intl.DateTimeFormat(getLocale(), {
			day: 'numeric',
			month: 'short',
			timeZone: 'UTC'
		}).format(new Date(`${iso}T00:00:00Z`));
	const total = $derived(settling.paidBack + settling.open);
	const share = $derived(total > 0 ? settling.paidBack / total : 1);
</script>

<div class="mx-4 rounded-2xl bg-surface px-4 py-3 dark:bg-surface-night">
	<p class="mb-2 flex justify-between text-sm">
		<span>{m.settling_paid_back({ amount: money(settling.paidBack) })}</span>
		<span class="text-muted">{m.settling_open({ amount: money(settling.open) })}</span>
	</p>
	<!-- A meter: the paid-back part in the accent on a lighter track of the same hue -->
	<div
		class="h-2.5 overflow-hidden rounded-full bg-accent/20 dark:bg-accent-night/25"
		role="meter"
		aria-valuemin="0"
		aria-valuemax="100"
		aria-valuenow={Math.round(share * 100)}
		aria-label={m.settling_meter()}
	>
		<div
			class="h-full rounded-full bg-accent dark:bg-accent-night"
			style:width="{share * 100}%"
		></div>
	</div>

	{#if settling.debts.length}
		<ul class="mt-4 space-y-3" aria-label={m.settling_debts()}>
			{#each settling.debts as debt (`${debt.from}-${debt.to}`)}
				{@const from = byId.get(debt.from)}
				{@const to = byId.get(debt.to)}
				{#if from && to}
					<li class="flex items-center gap-2">
						<Avatar id={from.avatarId} name={from.name} avatar={from.avatar} size="sm" />
						<span class="min-w-0 flex-1">
							<span class="block truncate text-sm font-medium"
								>{m.settling_pays({ from: from.name, to: to.name })}</span
							>
							{#if debt.since}
								<span class="block text-xs text-muted"
									>{m.settling_since({ date: date(debt.since) })}</span
								>
							{/if}
						</span>
						<span class="text-sm font-medium tabular-nums">{money(debt.amountCents)}</span>
					</li>
				{/if}
			{/each}
		</ul>
	{:else}
		<p class="mt-3 text-sm text-muted">{m.settling_done()}</p>
	{/if}
</div>
