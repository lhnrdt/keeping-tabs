<script lang="ts">
	import { Block, BlockTitle, List } from 'konsta/svelte';
	import Fold from '#lib/components/Fold.svelte';
	import Field from '#lib/components/Field.svelte';
	import AmountField from '#lib/components/fields/AmountField.svelte';
	import DateField from '#lib/components/fields/DateField.svelte';
	import MemberSelect from '#lib/components/fields/MemberSelect.svelte';
	import CategoryPicker from '#lib/components/pickers/CategoryPicker.svelte';
	import GroupForm from '#lib/components/group/GroupForm.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import type { ExpenseCategory } from '#lib/expense/categories.ts';
	import { learnCategories } from '#lib/expense/learned.ts';
	import { useIdentity } from '#lib/group/identity.svelte.ts';
	import type { Member } from '#lib/group/members.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { LIMITS } from '#lib/validation.ts';
	import { isSplitMode, type SplitMode } from '#lib/split/modes.ts';
	import ParticipantChecklist from './ParticipantChecklist.svelte';
	import SplitInputs from './SplitInputs.svelte';
	import SplitModePicker from './SplitModePicker.svelte';
	import TwoPersonPresets from './TwoPersonPresets.svelte';
	import PayerAmounts from './PayerAmounts.svelte';
	import { SEVERAL_PAYERS } from '#lib/validation.ts';
	import { presetOf } from '#lib/split/presets.ts';
	import { convert, parseRate, RATE_CURRENCIES } from '#lib/expense/exchange.ts';
	import { amountInputValue, currencyLabel, formatAmount, parseAmount } from '#lib/money.ts';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import { canBeDefault } from '#lib/split/default-split.ts';

	type Props = {
		members: Member[];
		currency: string;
		/** Raw form values; empty strings for a new expense */
		values: {
			title: string;
			/** A note on it (#123) */
			notes: string;
			/** The amount's currency when not the group's (#54), and the rate it was saved with */
			currency?: string;
			rate?: string;
			/** With paidBy "several" (#39): what each paid as typed, by member id */
			payers?: Record<string, string>;
			amount: string;
			date: string;
			paidBy: string;
			participants: string[];
			category: string;
			splitMode: string;
			/** Split inputs by member id, for the unequal modes */
			inputs: Record<string, string>;
		};
		/** The group's hand-chosen categories, newest first */
		chosen: { title: string; category: ExpenseCategory | null }[];
		error?: ErrorCode;
		submitLabel: string;
		/** A new expense can repeat (#45) */
		canRepeat?: boolean;
		/** A new expense waits on the device when the connection is gone (#55) */
		offlineToken?: string;
	};

	let {
		members,
		currency,
		values,
		chosen,
		error,
		submitLabel,
		canRepeat = false,
		offlineToken
	}: Props = $props();
	// Its id, made here: sending it again after a lost connection can't add it twice (#55)
	const clientId = crypto.randomUUID();

	const identity = useIdentity();
	// Follows the typed title, so the automatic category can show its guess
	let title = $derived(values.title);
	// Follows the typed amount, so the split shows each share live
	let amount = $derived(values.amount);
	// Another currency (#54): typed in it, split and kept in the group's at the rate
	let amountCurrency = $derived(values.currency || currency);
	let rate = $derived(values.rate ?? '');
	// The day's rate, looked up and not typed: a saved one stays until the currency or date
	// changes. The date follows its field (both from the first values)
	const startWith = () => ({ saved: Boolean(values.rate), date: values.date });
	let keepRate = $state(startWith().saved);
	let date = $state(startWith().date);
	let rateFailed = $state(false);
	let showSource = $state(false);
	const foreign = $derived(amountCurrency !== currency);
	const converted = $derived.by(() => {
		if (!foreign) return amount;
		const typed = parseAmount(amount.trim(), amountCurrency);
		const parsed = parseRate(rate);
		return typed && parsed
			? amountInputValue(
					convert({ currency: amountCurrency, amountCents: typed, rate: parsed }, currency),
					currency
				)
			: '';
	});
	const currencies = $derived([
		...new Set([currency, ...(values.currency ? [values.currency] : []), ...RATE_CURRENCIES])
	]);
	// Without an answer (offline), the server looks it up when the expense is saved
	$effect(() => {
		if (!foreign || keepRate) return;
		const query = new URLSearchParams({ from: amountCurrency, to: currency, date });
		rateFailed = false;
		fetch(`/fx?${query}`)
			.then((response) => response.json() as Promise<{ rate: string | null }>)
			.then((answer) => {
				if (answer.rate) rate = answer.rate;
				else rateFailed = true;
			})
			.catch(() => (rateFailed = true));
	});
	let mode = $derived<SplitMode>(isSplitMode(values.splitMode) ? values.splitMode : 'equal');
	const paidBy = $derived(values.paidBy || identity.memberId || members[0]?.id);
	// Follows the payer choice: several people show what each paid (#39)
	let payer = $derived(paidBy);
	// Two people: quick choices instead of the payer and split (#40), unless more is wanted
	const pair = $derived.by(() => {
		const me = identity.memberId;
		const other = members.find((member) => member.id !== me);
		return members.length === 2 && me && other ? { me, other } : null;
	});
	let preset = $derived(pair ? presetOf(values, { me: pair.me, other: pair.other.id }) : null);
	let more = $state(false);
	const quick = $derived(pair !== null && preset !== null && !more);
	// Less used choices are folded away, so the form stays short (#123); open when one is set
	const moreOpen = $derived(values.notes !== '' || Boolean(values.currency));
</script>

<GroupForm {error} {submitLabel} {offlineToken}>
	{#if offlineToken}<input type="hidden" name="clientId" value={clientId} />{/if}
	<!-- Listens around the list, so the list keeps only list items -->
	<div
		class="contents"
		onchange={(event) => {
			const field = event.target as HTMLSelectElement;
			if (field.name === 'paidBy') payer = field.value;
			if (field.name === 'currency') {
				amountCurrency = field.value;
				keepRate = false;
				rate = '';
			}
			if (field.name === 'date') {
				date = field.value;
				keepRate = false;
			}
		}}
	>
		<List strong inset>
			<Field
				label={m.field_expense_title()}
				placeholder={m.placeholder_expense_title()}
				name="title"
				required
				maxlength={LIMITS.expenseTitle}
				bind:value={title}
			/>
			<AmountField bind:value={amount} currency={amountCurrency} />
			<DateField value={values.date} />
			{#if !quick}
				<MemberSelect
					label={m.field_paid_by()}
					name="paidBy"
					{members}
					value={paidBy}
					extra={{ value: SEVERAL_PAYERS, label: m.payers_several() }}
				/>
			{/if}
		</List>
		{#if foreign}
			<input type="hidden" name="rate" value={rate} />
			<Block class="!-mt-4 !mb-4">
				<p class="text-sm text-muted" aria-live="polite" data-testid="converted">
					<!-- Where the rate comes from, for whoever wonders: a faint "i" to tap -->
					<button
						type="button"
						class="float-end ms-2 size-5 rounded-full text-xs opacity-50"
						aria-expanded={showSource}
						aria-label={m.rate_source_label()}
						onclick={() => (showSource = !showSource)}>i</button
					>
					{converted
						? m.converted_amount({
								amount: formatAmount(parseAmount(converted, currency) ?? 0, currency, getLocale())
							})
						: rate || !amount.trim()
							? ''
							: rateFailed
								? m.converted_rate_later()
								: m.converted_looking_up()}
				</p>
				{#if showSource}
					<p class="mt-1 text-xs text-muted opacity-75">{m.rate_source()}</p>
				{/if}
			</Block>
		{/if}
		<Fold title={m.expense_more()} open={moreOpen}>
			<List nested class="!my-0">
				<Field
					label={m.field_currency()}
					name="currency"
					type="select"
					dropdown
					value={amountCurrency}
				>
					{#each currencies as code (code)}
						<option value={code} selected={code === amountCurrency}
							>{currencyLabel(code, getLocale())}</option
						>
					{/each}
				</Field>
				{#if canRepeat}
					<Field label={m.field_repeats()} name="repeats" type="select" dropdown value="">
						<option value="">{m.repeats_never()}</option>
						<option value="weekly">{m.repeats_weekly()}</option>
						<option value="monthly">{m.repeats_monthly()}</option>
						<option value="yearly">{m.repeats_yearly()}</option>
					</Field>
				{/if}
				<Field
					label={m.field_note()}
					placeholder={m.placeholder_note()}
					name="notes"
					type="textarea"
					inputClass="!h-24 resize-none"
					maxlength={LIMITS.expenseNote}
					value={values.notes}
				/>
			</List>
		</Fold>
	</div>
	{#if !quick && payer === SEVERAL_PAYERS}
		<PayerAmounts {members} {currency} amount={converted} initial={values.payers ?? {}} />
	{/if}

	<BlockTitle>{m.field_split()}</BlockTitle>
	{#if quick && pair && preset}
		<TwoPersonPresets me={pair.me} other={pair.other} bind:preset onMore={() => (more = true)} />
	{:else}
		<SplitModePicker bind:mode />
		{#if mode === 'equal'}
			<ParticipantChecklist {members} selected={values.participants} />
		{:else}
			<SplitInputs
				{mode}
				{members}
				{currency}
				amount={converted}
				initial={{
					mode: isSplitMode(values.splitMode) ? values.splitMode : 'equal',
					inputs: values.inputs
				}}
			/>
			{#if canBeDefault(mode)}
				<!-- Remember this split for the group's new expenses (#41) -->
				<Block class="!-mt-2 !mb-4">
					<label class="flex cursor-pointer items-center gap-3 text-sm">
						<input
							type="checkbox"
							name="makeDefault"
							class="h-5 w-5 shrink-0 accent-accent dark:accent-accent-night"
						/>
						{m.default_split_remember()}
					</label>
				</Block>
			{/if}
		{/if}
	{/if}

	<!-- A card, not a List: pickers are fieldsets, not list items (#79) -->
	<Block strong inset class="!px-0 !py-3">
		<CategoryPicker value={values.category} {title} learned={learnCategories(chosen)} />
	</Block>
</GroupForm>
