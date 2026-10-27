<script lang="ts">
	// One input per member for the unequal split modes, with each member's resulting share
	// and what's left to assign (SP-22), computed by the same code as the server.
	import type { Member } from '#lib/group/members.ts';
	import { currencySymbol, formatAmount, parseAmount } from '#lib/money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import {
		computeShares,
		FULL_PERCENT,
		splitProgress,
		type SplitEntry
	} from '#lib/split/compute.ts';
	import { splitInputName } from '#lib/split/form.ts';
	import { formatSplitInput, parseSplitInput } from '#lib/split/inputs.ts';
	import { SPLIT_MODES, type SplitMode } from '#lib/split/modes.ts';
	import { errorMessage } from '#lib/errors.ts';

	type Props = {
		mode: Exclude<SplitMode, 'equal'>;
		members: Member[];
		currency: string;
		/** The expense amount as typed */
		amount: string;
		/** Inputs to start with (by member id) and the mode they belong to */
		initial: { mode: SplitMode; inputs: Record<string, string> };
	};

	let { mode, members, currency, amount, initial }: Props = $props();

	// Typed values per mode, so switching modes back and forth keeps them
	const startWith = () =>
		Object.fromEntries(
			SPLIT_MODES.map((each) => [each, each === initial.mode ? { ...initial.inputs } : {}])
		) as Record<SplitMode, Record<string, string>>;
	let typed = $state(startWith());
	const texts = $derived(typed[mode]);

	const money = (cents: number) => formatAmount(cents, currency, getLocale());
	const percent = (value: number) => `${formatSplitInput('percent', value, currency)} %`;

	const amountCents = $derived(parseAmount(amount.trim(), currency));
	const inputs = $derived(
		members.map((member) => ({
			memberId: member.id,
			input: parseSplitInput(mode, texts[member.id] ?? '', currency)
		}))
	);
	const valid = $derived(inputs.every((entry) => entry.input !== null));
	const result = $derived(
		valid && amountCents ? computeShares(mode, amountCents, inputs as SplitEntry[]) : undefined
	);
	/** The member's share; while amounts or percentages don't add up yet, their own part of it */
	function shareOf(memberId: string, input: number | null) {
		if (result?.ok)
			return result.value.find((share) => share.memberId === memberId)?.shareCents ?? 0;
		if (input === null || !amountCents) return null;
		if (mode === 'exact') return input;
		if (mode === 'percent') return Math.round((amountCents * input) / FULL_PERCENT);
		return null;
	}

	const progress = $derived(
		valid && amountCents ? splitProgress(mode, amountCents, inputs as SplitEntry[]) : undefined
	);
	const format = $derived(mode === 'percent' ? percent : money);
	const summary = $derived.by(() => {
		if (!progress) return result && !result.ok ? errorMessage(result.error) : undefined;
		const { assigned, target } = progress;
		const values = { assigned: format(assigned), total: format(target) };
		if (assigned === target) return m.split_all_assigned();
		return assigned < target
			? m.split_left({ ...values, left: format(target - assigned) })
			: m.split_over({ ...values, over: format(assigned - target) });
	});

	const labels: Record<Exclude<SplitMode, 'equal'>, (name: { name: string }) => string> = {
		exact: m.split_input_exact,
		percent: m.split_input_percent,
		shares: m.split_input_shares,
		adjust: m.split_input_adjust
	};
	const suffix = $derived(
		mode === 'percent'
			? '%'
			: mode === 'shares'
				? '×'
				: mode === 'adjust'
					? `± ${currencySymbol(currency, getLocale())}`
					: currencySymbol(currency, getLocale())
	);
</script>

<div class="-mt-1 flex flex-col">
	{#each members as member, i (member.id)}
		{@const share = shareOf(member.id, inputs[i].input)}
		<div class="flex min-h-12 items-center gap-3">
			<span class="flex flex-1 flex-col">
				<span>{member.name}</span>
				{#if share !== null}<span class="text-xs text-muted tabular-nums">{money(share)}</span>{/if}
			</span>
			<span class="field-well !min-h-10 w-32">
				<input
					class="text-end tabular-nums"
					name={splitInputName(member.id)}
					inputmode={mode === 'adjust' ? 'text' : 'decimal'}
					autocomplete="off"
					placeholder="0"
					aria-label={labels[mode]({ name: member.name })}
					bind:value={texts[member.id]}
				/>
				<span class="flex-none pe-3 text-xs text-muted">{suffix}</span>
			</span>
		</div>
	{/each}
	{#if summary}
		<p class="mt-1 text-sm text-muted" aria-live="polite" data-testid="split-summary">
			{summary}
		</p>
	{/if}
</div>
