<script lang="ts">
	// Payments to settle the group (B-2, B-6); each opens a pre-filled payment.
	import { resolve } from '$app/paths';
	import { List, ListItem } from 'konsta/svelte';
	import EmptyState from '#lib/components/EmptyState.svelte';
	import AnimatedAmount from '#lib/components/AnimatedAmount.svelte';
	import IconBadge from '#lib/components/IconBadge.svelte';
	import { namesById, type Member } from '#lib/group/members.ts';
	import { transitionName } from '#lib/motion/in-place-transition.ts';
	import { m } from '#lib/paraglide/messages.js';
	import type { Transfer } from '#lib/settle.ts';

	type Props = {
		token: string;
		currency: string;
		members: Member[];
		transfers: Transfer[];
	};

	let { token, currency, members, transfers }: Props = $props();

	const names = $derived(namesById(members));

	const paymentHref = (from: string, to: string, amountCents: number) =>
		`${resolve('/g/[token]/payments/new', { token })}?${new URLSearchParams({
			from,
			to,
			amount: String(amountCents)
		})}`;
</script>

{#if transfers.length}
	<List strong inset role="region" aria-label={m.settle_title()}>
		{#each transfers as transfer (`${transfer.from}-${transfer.to}`)}
			<ListItem
				link
				href={paymentHref(transfer.from, transfer.to, transfer.amountCents)}
				title={m.settle_pays({
					from: names.get(transfer.from) ?? '?',
					to: names.get(transfer.to) ?? '?'
				})}
				style={transitionName('transfer', `${transfer.from}-${transfer.to}`)}
			>
				{#snippet media()}
					<IconBadge name="payment" />
				{/snippet}
				{#snippet after()}
					<span class="tabular-nums"
						><AnimatedAmount amount={transfer.amountCents} {currency} /></span
					>
				{/snippet}
			</ListItem>
		{/each}
	</List>
{:else}
	<EmptyState illustration="hills" text={m.settle_done()} role="status" />
{/if}
