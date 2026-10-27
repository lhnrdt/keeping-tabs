<script lang="ts">
	// The amount with its currency right in front of it (#54). In another currency than the
	// group's, the day's rate is looked up (never typed) and "≈ €59.77" shows under it; tapping
	// that tells where the rate comes from. A saved rate stays while currency and date do.
	import PlainField from '#lib/components/fields/PlainField.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { convert, parseRate } from '#lib/expense/exchange.ts';
	import {
		amountInputValue,
		currencyLabel,
		currencySymbol,
		formatAmount,
		parseAmount
	} from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';

	type Props = {
		/** As typed, in `currency` */
		amount: string;
		/** The currency it's typed in */
		currency: string;
		groupCurrency: string;
		/** The currencies to choose from */
		currencies: string[];
		/** The expense's date, for the day's rate */
		date: string;
		/** The rate it was saved with, for that currency and date */
		saved?: { currency: string; date: string; rate: string };
		/** Out: the amount in the group's currency as typed, '' until known */
		converted?: string;
	};

	let {
		amount = $bindable(),
		currency = $bindable(),
		groupCurrency,
		currencies,
		date,
		saved,
		converted = $bindable()
	}: Props = $props();

	let looked = $state<{ key: string; rate: string | null } | null>(null);
	let showSource = $state(false);

	const foreign = $derived(currency !== groupCurrency);
	const key = $derived(`${currency}|${date}`);
	const keepsSaved = $derived(saved !== undefined && key === `${saved.currency}|${saved.date}`);
	const rate = $derived(
		keepsSaved ? (saved?.rate ?? '') : looked?.key === key ? (looked.rate ?? '') : ''
	);
	// Without an answer (offline), the server looks it up when the expense is saved
	const failed = $derived(!keepsSaved && looked?.key === key && looked.rate === null);

	$effect(() => {
		if (!foreign || keepsSaved || !date) return;
		const wanted = key;
		const query = new URLSearchParams({ from: currency, to: groupCurrency, date });
		fetch(`/fx?${query}`)
			.then((response) => response.json() as Promise<{ rate: string | null }>)
			.then((answer) => (looked = { key: wanted, rate: answer.rate }))
			.catch(() => (looked = { key: wanted, rate: null }));
	});

	$effect(() => {
		if (!foreign) {
			converted = amount;
			return;
		}
		const typed = parseAmount(amount.trim(), currency);
		const parsed = parseRate(rate);
		converted =
			typed && parsed
				? amountInputValue(
						convert({ currency, amountCents: typed, rate: parsed }, groupCurrency),
						groupCurrency
					)
				: '';
	});

	const symbol = $derived(currencySymbol(currency, getLocale()));
	const note = $derived(
		converted
			? m.converted_amount({
					amount: formatAmount(
						parseAmount(converted, groupCurrency) ?? 0,
						groupCurrency,
						getLocale()
					)
				})
			: !amount.trim()
				? ''
				: failed
					? m.converted_rate_later()
					: m.converted_looking_up()
	);
</script>

<PlainField label={`${m.field_amount()} (${symbol})`}>
	{#snippet children(id)}
		<!-- The symbol shows; the select over it does the choosing -->
		<span
			class="relative flex flex-none items-center gap-1 self-stretch border-e border-current/10 ps-3.5 pe-2.5 font-medium"
		>
			<span aria-hidden="true">{symbol}</span>
			<Icon name="expand" size={14} class="opacity-60" />
			<select
				name="currency"
				aria-label={m.field_currency()}
				class="absolute inset-0 !p-0 opacity-0"
				bind:value={currency}
			>
				{#each currencies as code (code)}
					<option value={code}>{currencyLabel(code, getLocale())}</option>
				{/each}
			</select>
		</span>
		<input
			{id}
			name="amount"
			inputmode="decimal"
			autocomplete="off"
			required
			placeholder={amountInputValue(0, currency)}
			class="tabular-nums"
			bind:value={amount}
		/>
	{/snippet}
	{#snippet below()}
		{#if foreign}
			<input type="hidden" name="rate" value={rate} />
			<button
				type="button"
				class="self-start text-start text-sm text-muted"
				aria-expanded={showSource}
				aria-label={m.rate_source_label()}
				aria-describedby="converted-note"
				onclick={() => (showSource = !showSource)}
			>
				<span id="converted-note" aria-live="polite" data-testid="converted">{note}</span>
			</button>
			{#if showSource}
				<p class="text-xs text-muted">{m.rate_source()}</p>
			{/if}
		{/if}
	{/snippet}
</PlainField>
