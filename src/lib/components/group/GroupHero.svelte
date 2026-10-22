<script lang="ts">
	// Group header: tinted band with a topographic pattern, the name in the display serif,
	// and where you stand ("You get back €300.00", "Ben owes you €300.00").
	import AnimatedAmount from '#lib/components/AnimatedAmount.svelte';
	import Topography from '#lib/components/illustrations/Topography.svelte';
	import { useIdentity } from '#lib/group/identity.svelte.ts';
	import { namesById, type Member } from '#lib/group/members.ts';
	import { formatAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { suggestTransfers } from '#lib/settle.ts';
	import { tintClass } from '#lib/tints.ts';

	type Props = {
		group: { id: string; name: string; currency: string };
		members: Member[];
		balances: Record<string, number>;
	};

	let { group, members, balances }: Props = $props();

	const identity = useIdentity();
	const names = $derived(namesById(members));
	const myBalance = $derived(identity.memberId ? (balances[identity.memberId] ?? 0) : null);
	const money = (amount: number) => formatAmount(amount, group.currency, getLocale());

	/** Suggested payments you're part of, phrased from your side */
	const myTransfers = $derived(
		suggestTransfers(new Map(members.map((member) => [member.id, balances[member.id] ?? 0])))
			.filter((t) => t.from === identity.memberId || t.to === identity.memberId)
			.map((t) =>
				t.to === identity.memberId
					? m.hero_owes_you({ name: names.get(t.from) ?? '?', amount: money(t.amountCents) })
					: m.hero_you_owe({ name: names.get(t.to) ?? '?', amount: money(t.amountCents) })
			)
	);
</script>

<header
	class="{tintClass(
		group.id
	)} relative mx-4 mt-2 overflow-hidden rounded-3xl bg-(--tint-bg) px-5 pt-5 pb-6 text-(--tint-fg)"
>
	<Topography />
	<div class="relative">
		<h1 class="font-display text-4xl leading-tight font-semibold">{group.name}</h1>
		{#if identity.ready && myBalance !== null}
			<p class="mt-4 text-sm font-medium opacity-80">
				{myBalance > 0 ? m.hero_get_back() : myBalance < 0 ? m.hero_owe() : m.hero_settled()}
			</p>
			{#if myBalance !== 0}
				<p class="font-display text-3xl font-semibold tabular-nums">
					<AnimatedAmount amount={Math.abs(myBalance)} currency={group.currency} />
				</p>
			{/if}
			{#each myTransfers as line (line)}
				<p class="mt-1 text-sm opacity-80">{line}</p>
			{/each}
		{/if}
	</div>
</header>
