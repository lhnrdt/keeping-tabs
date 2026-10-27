<script lang="ts">
	// Adding or editing an expense, in the order it's thought of: what it was, how much, who
	// paid and how it's split, then category and when. One flat form without cards; the save
	// button stays at the bottom of the screen (GroupForm).
	import PlainField from '#lib/components/fields/PlainField.svelte';
	import CategoryPicker from '#lib/components/pickers/CategoryPicker.svelte';
	import GroupForm from '#lib/components/group/GroupForm.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import type { ExpenseCategory } from '#lib/expense/categories.ts';
	import { RATE_CURRENCIES } from '#lib/expense/exchange.ts';
	import { learnCategories } from '#lib/expense/learned.ts';
	import { useIdentity } from '#lib/group/identity.svelte.ts';
	import type { GroupMember } from '#lib/group/members.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { canBeDefault } from '#lib/split/default-split.ts';
	import { isSplitMode, SPLIT_MODES, type SplitMode } from '#lib/split/modes.ts';
	import { SEVERAL_PAYERS } from '#lib/validation.ts';
	import AmountCurrencyField from './AmountCurrencyField.svelte';
	import DateChips from './DateChips.svelte';
	import ParticipantChecklist from './ParticipantChecklist.svelte';
	import PayerAmounts from './PayerAmounts.svelte';
	import SplitInputs from './SplitInputs.svelte';
	import TitleNoteField from './TitleNoteField.svelte';

	type Props = {
		members: GroupMember[];
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
	// What the form starts from; from there, what's typed
	const initial = () => ({
		title: values.title,
		amount: values.amount,
		currency: values.currency,
		date: values.date,
		paidBy: values.paidBy,
		splitMode: values.splitMode,
		groupCurrency: currency,
		firstMember: members[0]?.id
	});
	// Follow what's typed: the category guess, the shares and the conversion show it live
	let title = $state(initial().title);
	let amount = $state(initial().amount);
	let amountCurrency = $state(initial().currency || initial().groupCurrency);
	let date = $state(initial().date);
	let converted = $state('');
	let payer = $state(initial().paidBy || identity.memberId || initial().firstMember);
	let mode = $state<SplitMode>(
		isSplitMode(initial().splitMode) ? (initial().splitMode as SplitMode) : 'equal'
	);

	const saved = $derived(
		values.currency && values.rate
			? { currency: values.currency, date: values.date, rate: values.rate }
			: undefined
	);
	const currencies = $derived([
		...new Set([currency, ...(values.currency ? [values.currency] : []), ...RATE_CURRENCIES])
	]);
	const modeLabels: Record<SplitMode, () => string> = {
		equal: m.split_equal,
		exact: m.split_exact,
		percent: m.split_percent,
		shares: m.split_shares,
		adjust: m.split_adjust
	};
</script>

<GroupForm {error} {submitLabel} {offlineToken}>
	{#if offlineToken}<input type="hidden" name="clientId" value={clientId} />{/if}
	<div class="flex flex-col gap-4 px-4 pt-2 pb-4">
		<TitleNoteField bind:title notes={values.notes} />
		<AmountCurrencyField
			bind:amount
			bind:currency={amountCurrency}
			bind:converted
			groupCurrency={currency}
			{currencies}
			{date}
			{saved}
		/>

		<div class="grid grid-cols-2 gap-2.5">
			<PlainField label={m.field_paid_by()} icon="paidBy" arrow>
				{#snippet children(id)}
					<select {id} name="paidBy" bind:value={payer}>
						{#each members as member (member.id)}
							<option value={member.id}>{member.name}</option>
						{/each}
						<option value={SEVERAL_PAYERS}>{m.payers_several()}</option>
					</select>
				{/snippet}
			</PlainField>
			<PlainField label={m.field_split()} arrow>
				{#snippet children(id)}
					<select {id} name="splitMode" bind:value={mode}>
						{#each SPLIT_MODES as option (option)}
							<option value={option}>{modeLabels[option]()}</option>
						{/each}
					</select>
				{/snippet}
			</PlainField>
		</div>

		{#if payer === SEVERAL_PAYERS}
			<PayerAmounts {members} {currency} amount={converted} initial={values.payers ?? {}} />
		{/if}
		{#if mode === 'equal'}
			<ParticipantChecklist
				{members}
				selected={values.participants}
				amount={converted}
				{currency}
			/>
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
				<label class="-mt-2 flex cursor-pointer items-center gap-3 text-sm">
					<input
						type="checkbox"
						name="makeDefault"
						class="size-[18px] shrink-0 accent-accent dark:accent-accent-night"
					/>
					{m.default_split_remember()}
				</label>
			{/if}
		{/if}

		<CategoryPicker value={values.category} {title} learned={learnCategories(chosen)} />
		<DateChips bind:date />
		{#if canRepeat}
			<PlainField label={m.field_repeats()} icon="repeats" arrow>
				{#snippet children(id)}
					<select {id} name="repeats">
						<option value="">{m.repeats_never()}</option>
						<option value="weekly">{m.repeats_weekly()}</option>
						<option value="monthly">{m.repeats_monthly()}</option>
						<option value="yearly">{m.repeats_yearly()}</option>
					</select>
				{/snippet}
			</PlainField>
		{/if}
	</div>
</GroupForm>
