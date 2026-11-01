<script lang="ts">
	// Who had what (#53): a row per receipt item with its price and the people who shared it, and
	// what that makes for each person, live, by the same code as the server. What the items
	// don't cover (tip, tax) is shared in proportion.
	import Icon from '#lib/components/Icon.svelte';
	import { errorMessage } from '#lib/errors.ts';
	import type { Member } from '#lib/group/members.ts';
	import { amountInputValue, currencySymbol, formatAmount, parseAmount } from '#lib/money.ts';
	import { calmMove, calmSlide } from '#lib/motion/calm.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { itemShares, itemsTotal, type ExpenseItem, type TypedItem } from '#lib/split/items.ts';

	type Props = {
		members: Member[];
		/** The group's currency, for the shares */
		currency: string;
		/** The amount as typed, and the currency it's typed in */
		amount: string;
		amountCurrency: string;
		/** The amount in the group's currency, as typed */
		converted: string;
		/** The items to start with: the field's JSON */
		initial: string;
	};

	let { members, currency, amount, amountCurrency, converted, initial }: Props = $props();

	const everyone = () => members.map((member) => member.id);
	const blank = (): TypedItem => ({ name: '', price: '', memberIds: everyone() });
	const startWith = (): TypedItem[] => {
		try {
			const items = JSON.parse(initial) as TypedItem[];
			return items.length ? items : [blank()];
		} catch {
			return [blank()];
		}
	};
	let items = $state(startWith());

	const money = (cents: number, code = currency) => formatAmount(cents, code, getLocale());
	const parsed = $derived(
		items.flatMap<ExpenseItem>((item) => {
			const cents = parseAmount(item.price.trim(), amountCurrency);
			return cents !== null && item.memberIds.length
				? [{ name: item.name, cents, memberIds: item.memberIds }]
				: [];
		})
	);
	const typedTotal = $derived(parseAmount(amount.trim(), amountCurrency) ?? 0);
	const groupAmount = $derived(parseAmount(converted.trim(), currency) ?? 0);
	const left = $derived(typedTotal - itemsTotal(parsed));
	const result = $derived(
		parsed.length && typedTotal && groupAmount
			? itemShares(parsed, typedTotal, groupAmount)
			: undefined
	);
	const shareOf = (memberId: string) =>
		result?.ok
			? (result.value.find((share) => share.memberId === memberId)?.shareCents ?? 0)
			: null;

	const toggle = (item: TypedItem, memberId: string) => {
		item.memberIds = item.memberIds.includes(memberId)
			? item.memberIds.filter((id) => id !== memberId)
			: [...item.memberIds, memberId];
	};
	const symbol = $derived(currencySymbol(amountCurrency, getLocale()));
</script>

<input type="hidden" name="items" value={JSON.stringify(items)} />
<div class="-mt-1 flex flex-col gap-4" role="group" aria-label={m.split_items()}>
	{#each items as item, i (item)}
		<div class="flex flex-col gap-2" transition:calmSlide animate:calmMove>
			<div class="flex items-center gap-2">
				<span class="field-well flex-1">
					<input
						aria-label={m.item_name({ number: i + 1 })}
						placeholder={m.item_name_placeholder()}
						maxlength="80"
						autocomplete="off"
						bind:value={item.name}
					/>
				</span>
				<span class="field-well w-28 flex-none">
					<input
						class="text-end tabular-nums"
						aria-label={m.item_price({ number: i + 1 })}
						inputmode="decimal"
						autocomplete="off"
						placeholder={amountInputValue(0, amountCurrency)}
						bind:value={item.price}
					/>
					<span class="flex-none pe-3 text-xs text-muted" aria-hidden="true">{symbol}</span>
				</span>
				{#if items.length > 1}
					<button
						type="button"
						class="grid size-11 flex-none place-items-center tone-destructive"
						aria-label={m.item_remove({ number: i + 1 })}
						onclick={() => items.splice(i, 1)}
					>
						<Icon name="remove" size={18} />
					</button>
				{/if}
			</div>
			<div class="flex flex-wrap gap-1.5" role="group" aria-label={m.item_who({ number: i + 1 })}>
				{#each members as member (member.id)}
					<button
						type="button"
						class="choice-pill !min-h-9 !px-3"
						aria-pressed={item.memberIds.includes(member.id)}
						onclick={() => toggle(item, member.id)}>{member.name}</button
					>
				{/each}
			</div>
		</div>
	{/each}
	<button
		type="button"
		class="flex min-h-10 items-center gap-1.5 self-start text-sm font-medium text-accent dark:text-accent-night"
		onclick={() => items.push(blank())}
	>
		<Icon name="add" size={16} />
		{m.item_add()}
	</button>
	<div class="flex flex-col gap-1 text-sm" aria-live="polite" data-testid="item-summary">
		{#each members as member (member.id)}
			{@const share = shareOf(member.id)}
			{#if share}
				<p class="flex justify-between">
					<span>{member.name}</span>
					<span class="tabular-nums">{money(share)}</span>
				</p>
			{/if}
		{/each}
		{#if result && !result.ok}
			<p class="tone-destructive">{errorMessage(result.error)}</p>
		{:else if result?.ok && left > 0}
			<p class="text-muted">{m.items_left({ amount: money(left, amountCurrency) })}</p>
		{/if}
	</div>
</div>
