<script lang="ts">
	// Adding or editing an expense, in the order it's thought of: what it was, how much, who
	// paid and how it's split, then category and when. One flat form without cards; the save
	// button stays at the bottom of the screen (GroupForm).
	import { resolve } from '$app/paths';
	import PlainField from '#lib/components/fields/PlainField.svelte';
	import CategoryPicker from '#lib/components/pickers/CategoryPicker.svelte';
	import GroupForm from '#lib/components/group/GroupForm.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import type { ExpenseCategory } from '#lib/expense/categories.ts';
	import { announceExpense } from '#lib/expense/announce.ts';
	import { RATE_CURRENCIES } from '#lib/expense/exchange.ts';
	import { sendReceipt } from '#lib/expense/send-receipt.ts';
	import { learnCategories } from '#lib/expense/learned.ts';
	import { useIdentity } from '#lib/group/identity.svelte.ts';
	import type { GroupKind } from '#lib/group/kinds.ts';
	import type { GroupMember } from '#lib/group/members.ts';
	import { calmSlide } from '#lib/motion/calm.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { canBeDefault } from '#lib/split/default-split.ts';
	import { ITEMS_MODE } from '#lib/split/items.ts';
	import { isSplitMode, SPLIT_MODES, type SplitMode } from '#lib/split/modes.ts';
	import { SEVERAL_PAYERS } from '#lib/validation.ts';
	import AmountCurrencyField from './AmountCurrencyField.svelte';
	import DateChips from './DateChips.svelte';
	import DrivingFields from './DrivingFields.svelte';
	import ParticipantChecklist from './ParticipantChecklist.svelte';
	import ItemSplit from './ItemSplit.svelte';
	import NewExpensePhotos from './NewExpensePhotos.svelte';
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
			/** In car groups: the odometer reading and litres of fuel, as typed */
			odometer?: string;
			litres?: string;
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
			/** With splitMode "items": the receipt's items as JSON (#53) */
			items?: string;
		};
		/** The group's hand-chosen categories, newest first */
		chosen: { title: string; category: ExpenseCategory | null }[];
		error?: ErrorCode;
		submitLabel: string;
		/** A new expense can repeat (#45) */
		canRepeat?: boolean;
		/** The group's type: what categories it offers; a car group notes km and fuel */
		kind: GroupKind;
		/** A new expense waits on the device when the connection is gone (#55) */
		offlineToken?: string;
		/** The expense being edited; a new one gets its id here */
		expenseId?: string;
	};

	let {
		members,
		currency,
		values,
		chosen,
		error,
		submitLabel,
		canRepeat = false,
		kind,
		offlineToken,
		expenseId
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
	let mode = $state<SplitMode | typeof ITEMS_MODE>(
		initial().splitMode === ITEMS_MODE
			? ITEMS_MODE
			: isSplitMode(initial().splitMode)
				? (initial().splitMode as SplitMode)
				: 'equal'
	);

	const saved = $derived(
		values.currency && values.rate
			? { currency: values.currency, date: values.date, rate: values.rate }
			: undefined
	);
	const currencies = $derived([
		...new Set([currency, ...(values.currency ? [values.currency] : []), ...RATE_CURRENCIES])
	]);
	// Photos of the receipt on a new expense go out once it's saved, under the id it was given
	// (the same page handles them as when editing). If one doesn't arrive, on to that page.
	let photos = $state<Blob[]>([]);
	const expensePage = () =>
		resolve('/g/[token]/expenses/[id]', { token: offlineToken ?? '', id: clientId });
	async function afterSaving() {
		// Before anything else: the photos may take a while
		const announced = offlineToken
			? announceExpense(offlineToken, clientId, `${amount} ${amountCurrency}`)
			: undefined;
		let missing = false;
		for (const photo of photos) {
			const refused = await sendReceipt(photo, expensePage()).catch(() => 'receipt_invalid');
			if (refused) missing = true;
		}
		await announced;
		return missing ? expensePage() : undefined;
	}

	const modeLabels: Record<SplitMode, () => string> = {
		equal: m.split_equal,
		exact: m.split_exact,
		percent: m.split_percent,
		shares: m.split_shares,
		adjust: m.split_adjust
	};
</script>

<GroupForm
	{error}
	{submitLabel}
	{offlineToken}
	sealed={['title', 'notes', 'items']}
	sealRow={expenseId ?? clientId}
	onSaved={offlineToken ? afterSaving : undefined}
>
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
		<!-- Also when the group is no car group anymore: saving must not lose what's noted -->
		{#if kind === 'car' || values.odometer || values.litres}
			<DrivingFields odometer={values.odometer ?? ''} litres={values.litres ?? ''} />
		{/if}

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
						<option value={ITEMS_MODE}>{m.split_items()}</option>
					</select>
				{/snippet}
			</PlainField>
		</div>

		{#if payer === SEVERAL_PAYERS}
			<div transition:calmSlide>
				<PayerAmounts {members} {currency} amount={converted} initial={values.payers ?? {}} />
			</div>
		{/if}
		{#if mode === ITEMS_MODE}
			<ItemSplit
				{members}
				{currency}
				{amount}
				{amountCurrency}
				{converted}
				initial={values.items ?? ''}
			/>
		{:else if mode === 'equal'}
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

		<CategoryPicker value={values.category} {title} learned={learnCategories(chosen)} {kind} />
		<DateChips bind:date />
		{#if offlineToken}<NewExpensePhotos onchange={(chosen) => (photos = chosen)} />{/if}
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
