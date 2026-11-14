<script lang="ts">
	// The period the insights cover (#184): what kind (all, year, month, day), then which one,
	// stepping back and forth. Links, so the server sums up the period and it stays in the
	// address; they replace the history entry and keep the scroll position.
	import { goto } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { onMount } from 'svelte';
	import { fly } from 'svelte/transition';
	import { calmMs } from '#lib/motion/calm.ts';
	import Icon from '#lib/components/Icon.svelte';
	import { groupTabUrl } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import {
		canStep,
		PERIOD_KINDS,
		periodParams,
		periodRange,
		periodsWithin,
		stepPeriod,
		switchKind,
		type DateRange,
		type Period,
		type PeriodKind
	} from '#lib/insights/period.ts';

	type Props = {
		period: Period;
		/** The group's first and last expense */
		span: DateRange | null;
		today: string;
		token: string;
	};

	let { period, span, today, token }: Props = $props();

	// The marker slides to the kind tapped right away, not once the new period has loaded
	let tapped = $state<PeriodKind | null>(null);
	$effect(() => {
		void period.kind;
		tapped = null;
	});
	const marked = $derived(Math.max(0, PERIOD_KINDS.indexOf(tapped ?? period.kind)));
	// Stepping back or forth: the new period comes in from that side
	let direction = $state(0);

	// Invisible over the label, so a tap lands on the native control
	const native = 'absolute inset-0 h-full w-full cursor-pointer opacity-0';

	// Browsers without a month picker get a list of months instead
	let monthInput = $state(false);
	onMount(() => {
		const input = document.createElement('input');
		input.type = 'month';
		monthInput = input.type === 'month';
	});

	/** The years or months the group has expenses in, for the lists */
	const choices = $derived.by(() => {
		if (!span || period.kind === 'all' || period.kind === 'day') return [];
		const format = new Intl.DateTimeFormat(getLocale(), {
			...formats[period.kind],
			timeZone: 'UTC'
		});
		return periodsWithin(period.kind, span).map((at) => ({
			at,
			label: format.format(new Date(`${periodRange({ kind: period.kind, at })!.from}T00:00:00Z`))
		}));
	});

	function choose(at: string) {
		if (!at || period.kind === 'all') return;
		// eslint-disable-next-line svelte/no-navigation-without-resolve -- resolve() plus ?tab= and the period
		goto(href({ kind: period.kind, at }), { replace: true, reset: false });
	}

	const href = (to: Period) =>
		`${groupTabUrl(resolve('/g/[token]', { token }), 'insights')}&${periodParams(to)}`;

	const kinds: Record<PeriodKind, () => string> = {
		all: m.period_all,
		year: m.period_year,
		month: m.period_month,
		day: m.period_day
	};

	const formats: Record<Exclude<PeriodKind, 'all'>, Intl.DateTimeFormatOptions> = {
		year: { year: 'numeric' },
		month: { month: 'long', year: 'numeric' },
		day: { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' }
	};
	const label = $derived(
		period.kind === 'all'
			? ''
			: new Intl.DateTimeFormat(getLocale(), { ...formats[period.kind], timeZone: 'UTC' }).format(
					new Date(`${periodRange(period)!.from}T00:00:00Z`)
				)
	);
</script>

<!-- eslint-disable svelte/no-navigation-without-resolve -- resolve() plus ?tab= and the period -->
<nav class="mx-4 pt-4" aria-label={m.period_label()}>
	<div
		class="relative grid grid-cols-4 rounded-full bg-surface-muted p-1 dark:bg-surface-muted-night"
	>
		<!-- The marker slides to what's chosen -->
		<span
			class="absolute inset-y-1 start-1 w-[calc((100%-0.5rem)/4)] rounded-full bg-surface shadow-sm transition-transform duration-300 ease-[var(--ease-calm)] motion-reduce:transition-none dark:bg-surface-night"
			style:transform={`translateX(${marked * 100}%)`}
			aria-hidden="true"
		></span>
		{#each PERIOD_KINDS as kind, i (kind)}
			<a
				href={href(switchKind(period, kind, today, span?.to ?? null))}
				data-sveltekit-noscroll
				data-sveltekit-replacestate
				aria-current={period.kind === kind ? 'true' : undefined}
				onclick={() => (tapped = kind)}
				class="relative rounded-full py-1.5 text-center text-sm font-medium transition-colors duration-300 {marked ===
				i
					? ''
					: 'text-muted'}">{kinds[kind]()}</a
			>
		{/each}
	</div>

	{#if period.kind !== 'all'}
		<div class="mt-2 flex items-center justify-between gap-2">
			{#each [-1, 1] as const as by (by)}
				{@const enabled = canStep(period, span, by)}
				<a
					href={enabled ? href(stepPeriod(period, by)) : undefined}
					data-sveltekit-noscroll
					data-sveltekit-replacestate
					role={enabled ? undefined : 'link'}
					aria-disabled={!enabled}
					aria-label={by < 0 ? m.period_previous() : m.period_next()}
					onclick={() => (direction = by)}
					class="grid h-10 w-10 place-items-center rounded-full bg-surface dark:bg-surface-night {by >
					0
						? 'order-last'
						: ''} {enabled ? '' : 'opacity-40'}"
				>
					<Icon name={by < 0 ? 'previous' : 'next'} size={20} />
				</a>
			{/each}
			<!-- Tapping the label opens the system's own picker for a day, month or year -->
			<label class="relative min-w-0 flex-1 text-center font-medium">
				<span class="grid overflow-hidden" aria-live="polite">
					{#key label}
						<span
							class="col-start-1 row-start-1"
							in:fly={{ x: direction * 24, duration: calmMs(250), opacity: 0 }}
							out:fly={{ x: direction * -24, duration: calmMs(200), opacity: 0 }}>{label}</span
						>
					{/key}
				</span>
				<span class="sr-only">{m.period_choose()}</span>
				{#if period.kind === 'day'}
					<input
						type="date"
						class={native}
						value={period.at}
						min={span?.from}
						max={span?.to}
						onchange={(event) => {
							direction = 0;
							choose(event.currentTarget.value);
						}}
					/>
				{:else if period.kind === 'month' && monthInput}
					<input
						type="month"
						class={native}
						value={period.at}
						min={span?.from.slice(0, 7)}
						max={span?.to.slice(0, 7)}
						onchange={(event) => choose(event.currentTarget.value)}
					/>
				{:else}
					<select
						class={native}
						value={period.at}
						onchange={(event) => choose(event.currentTarget.value)}
					>
						{#each choices as choice (choice.at)}
							<option value={choice.at}>{choice.label}</option>
						{/each}
					</select>
				{/if}
			</label>
		</div>
	{/if}
</nav>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
