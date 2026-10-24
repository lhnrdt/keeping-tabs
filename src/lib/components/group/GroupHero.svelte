<script lang="ts">
	// Group header: tinted band with a topographic pattern, the name in the display serif,
	// and where you stand ("You get back €300.00", "Ben owes you €300.00").
	import AnimatedAmount from '#lib/components/AnimatedAmount.svelte';
	import ThemePattern from '#lib/components/illustrations/ThemePattern.svelte';
	import { useIdentity } from '#lib/group/identity.svelte.ts';
	import { namesById, type Member } from '#lib/group/members.ts';
	import { openLine } from '#lib/group/open-line.ts';
	import { betweenYou } from '#lib/people-summary.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { Transfer } from '#lib/settle.ts';
	import Icon from '#lib/components/Icon.svelte';
	import { kindIcons } from '#lib/group/kind-style.ts';
	import type { GroupKind } from '#lib/group/kinds.ts';
	import { groupTintClass, type Tint } from '#lib/tints.ts';

	type Props = {
		group: { name: string; currency: string; kind: GroupKind; tint: Tint | null };
		members: Member[];
		balances: Record<string, number>;
		/** The group's payments to settle up */
		transfers: Transfer[];
	};

	let { group, members, balances, transfers }: Props = $props();

	const identity = useIdentity();
	const names = $derived(namesById(members));
	const myBalance = $derived(identity.memberId ? (balances[identity.memberId] ?? 0) : null);

	/** Suggested payments you're part of, phrased from your side */
	const myTransfers = $derived(
		identity.memberId
			? betweenYou(transfers, identity.memberId).map(({ memberId, amount }) =>
					openLine(names.get(memberId) ?? '?', amount, group.currency)
				)
			: []
	);
</script>

<header
	class="{groupTintClass(
		group.tint
	)} relative mx-4 mt-2 overflow-hidden rounded-3xl bg-(--tint-bg) px-5 pt-5 pb-6 text-(--tint-fg)"
>
	<ThemePattern />
	<div class="relative">
		<Icon name={kindIcons[group.kind]} size={28} />
		<h1 class="font-display text-4xl leading-tight font-semibold">{group.name}</h1>
		{#if myBalance !== null}
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
