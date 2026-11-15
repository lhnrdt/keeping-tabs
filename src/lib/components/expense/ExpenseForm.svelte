<script lang="ts">
	// Adding or editing an expense, in the order it's thought of: what it was, how much, who
	// paid and how it's split, then category and when. One flat form without cards; the save
	// button stays at the bottom of the screen (GroupForm).
	import Avatar from '#lib/components/Avatar.svelte';
	import type { IconName } from '#lib/icons.ts';
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
	import type { Frequency } from '#lib/expense/recurrence.ts';
	import { ITEMS_MODE } from '#lib/split/items.ts';
	import { isSplitMode, SPLIT_MODES, type SplitMode } from '#lib/split/modes.ts';
	import { parseExpense, SEVERAL_PAYERS } from '#lib/validation.ts';
	import { expenseValues } from '#lib/expense/form-values.ts';
	import { previewEntry } from '#lib/offline/preview.ts';
	import { PAID_BY_EACH } from '#lib/expense/paid-by-each.ts';
	import { frequencyLabels } from '#lib/expense/frequency-labels.ts';
	import { FREQUENCIES } from '#lib/expense/recurrence.ts';
	import AmountCurrencyField from './AmountCurrencyField.svelte';
	import DateChips from './DateChips.svelte';
	import DrivingFields from './DrivingFields.svelte';
	import ChoiceChips from './ChoiceChips.svelte';
	import { centOrder } from '#lib/split/cent-order.ts';
	import ParticipantChips from './ParticipantChips.svelte';
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
		/** Editing a repeating expense itself: how often, and it can't be "never" */
		repeats?: Frequency;
		/** The group's type: what categories it offers; a car group notes km and fuel */
		kind: GroupKind;
		/** A new expense waits on the device when the connection is gone (#55) */
		offlineToken?: string;
		/** The group's link token, so an edit can wait for the connection too (#347) */
		token?: string;
		/** The expense being edited; a new one gets its id here */
		expenseId?: string;
		/** Everyone's balance by member id: an odd cent shows with whoever owes the least */
		balances?: Record<string, number> | null;
	};

	let {
		members,
		currency,
		values,
		chosen,
		error,
		submitLabel,
		canRepeat = false,
		repeats,
		kind,
		offlineToken,
		token,
		expenseId,
		balances
	}: Props = $props();
	// The new expense's row in the list while it goes out (#347); none when it can't tell yet,
	// like an amount in another currency, whose rate only the server has
	function previewOf(typed: FormData, id: string) {
		const memberIds = members.map((member) => member.id);
		const parsed = parseExpense(expenseValues(typed, ''), {
			memberIds,
			currency,
			centOrder: cents
		});
		return parsed.ok ? previewEntry(id, parsed.value, identity.memberId) : undefined;
	}
	// Saved on the device at once when its row can be shown and nothing needs the server first,
	// like the photos, which go up once it's there
	const savesInstantly = (typed: FormData) =>
		photos.length === 0 && previewOf(typed, clientId) !== undefined;
	const cents = $derived(
		centOrder(
			members.map((member) => member.id),
			balances ?? undefined
		)
	);
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
	/** Someone else paid: all of them to choose from */
	let choosingPayer = $state(false);
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

	/** Up to six people as chips (and "Several people", "Everyone, already paid"); more, a dropdown */
	const PAYER_CHIPS_UP_TO = 8;
	const modeIcons: Record<SplitMode, IconName> = {
		equal: 'splitEqual',
		exact: 'splitExact',
		percent: 'splitPercent',
		shares: 'splitShares',
		adjust: 'splitAdjust'
	};
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
	offlineToken={offlineToken ?? (expenseId ? token : undefined)}
	pendingAs={expenseId ? { kind: 'edit', target: expenseId } : undefined}
	sealed={['title', 'notes', 'items']}
	sealRow={expenseId ?? clientId}
	announce={expenseId ? 'changed' : undefined}
	moment={expenseId ? undefined : { kind: 'added', id: clientId }}
	preview={expenseId ? undefined : previewOf}
	instantly={expenseId ? undefined : savesInstantly}
	onSaved={offlineToken && !expenseId ? afterSaving : undefined}
>
	{#if offlineToken && !expenseId}<input type="hidden" name="clientId" value={clientId} />{/if}
	<div class="flex flex-col gap-4 px-4 pt-2 pb-4">
		<div data-tour="expense-what"><TitleNoteField bind:title notes={values.notes} /></div>
		<div data-tour="expense-amount">
			<AmountCurrencyField
				bind:amount
				bind:currency={amountCurrency}
				bind:converted
				groupCurrency={currency}
				{currencies}
				{date}
				{saved}
			/>
		</div>
		<!-- Also when the group is no car group anymore: saving must not lose what's noted -->
		{#if kind === 'car' || values.odometer || values.litres}
			<DrivingFields odometer={values.odometer ?? ''} litres={values.litres ?? ''} />
		{/if}

		<!-- Three questions, each a tap: who paid, how it's split, who it's for -->
		{#if payer === identity.memberId && !choosingPayer}
			<!-- Most often you paid: that's one line, the others a tap away -->
			{@const you = members.find((member) => member.id === identity.memberId)}
			<div class="flex flex-col gap-2" data-tour="expense-paid-by">
				<span class="field-label">{m.form_who_paid()}</span>
				<div class="flex items-center gap-3">
					<input type="hidden" name="paidBy" value={payer} />
					<span
						class="flex h-10 items-center gap-2 rounded-full border border-accent bg-accent-soft/50 ps-1 pe-3.5 text-sm font-medium dark:border-accent-night dark:bg-accent-soft-night/50"
					>
						{#if you}<Avatar id={you.avatarId} name={you.name} avatar={you.avatar} size="sm" />{/if}
						{m.form_me()}
					</span>
					<button
						type="button"
						class="min-h-10 px-1 text-sm font-medium text-accent dark:text-accent-night"
						onclick={() => (choosingPayer = true)}>{m.form_someone_else()}</button
					>
				</div>
			</div>
		{:else}
			<ChoiceChips
				name="paidBy"
				legend={m.form_who_paid()}
				bind:value={payer}
				tour="expense-paid-by"
				chipsUpTo={PAYER_CHIPS_UP_TO}
				options={[
					// You as "Me", first: most often you're the one who paid
					...members
						.map((member) => ({
							value: member.id,
							label: member.id === identity.memberId ? m.form_me() : member.name,
							person: member
						}))
						.toSorted(
							(a, b) =>
								Number(b.value === identity.memberId) - Number(a.value === identity.memberId)
						),
					{ value: SEVERAL_PAYERS, label: m.payers_several(), icon: 'severalPayers' },
					{ value: PAID_BY_EACH, label: m.payers_each() }
				]}
			/>
		{/if}
		{#if payer === SEVERAL_PAYERS}
			<div transition:calmSlide>
				<PayerAmounts {members} {currency} amount={converted} initial={values.payers ?? {}} />
			</div>
		{/if}
		<ChoiceChips
			name="splitMode"
			legend={m.form_how_split()}
			bind:value={mode}
			tour="expense-split"
			options={[
				...SPLIT_MODES.map((option) => ({
					value: option,
					label: modeLabels[option](),
					icon: modeIcons[option]
				})),
				{ value: ITEMS_MODE, label: m.split_items(), icon: 'splitItems' as const }
			]}
		/>
		<section class="flex flex-col gap-4" data-tour="expense-for" aria-labelledby="who-for">
			<h3 id="who-for" class="field-label -mb-2">{m.form_who_for()}</h3>
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
				<ParticipantChips
					{members}
					selected={values.participants}
					amount={converted}
					{currency}
					centOrder={cents}
					legend={m.form_who_for()}
				/>
			{:else}
				<SplitInputs
					{mode}
					{members}
					{currency}
					amount={converted}
					centOrder={cents}
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
		</section>

		<CategoryPicker value={values.category} {title} learned={learnCategories(chosen)} {kind} />
		<DateChips bind:date />
		{#if offlineToken && !expenseId}<NewExpensePhotos
				onchange={(chosen) => (photos = chosen)}
			/>{/if}
		{#if canRepeat || repeats}
			<PlainField label={m.field_repeats()} icon="repeats" arrow>
				{#snippet children(id)}
					<select {id} name="repeats" value={repeats ?? ''}>
						{#if !repeats}<option value="">{m.repeats_never()}</option>{/if}
						{#each FREQUENCIES as frequency (frequency)}
							<option value={frequency}>{frequencyLabels[frequency]()}</option>
						{/each}
					</select>
				{/snippet}
			</PlainField>
		{/if}
	</div>
</GroupForm>
