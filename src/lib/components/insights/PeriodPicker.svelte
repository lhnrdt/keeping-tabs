<script lang="ts">
	// The period the insights cover (#184): what kind (all, year, month, day), then which one,
	// stepping back and forth. Links, so the server sums up the period and it stays in the
	// address; they replace the history entry and keep the scroll position.
	import { resolve } from '$app/paths';
	import Icon from '#lib/components/Icon.svelte';
	import { groupTabUrl } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import {
		canStep,
		PERIOD_KINDS,
		periodParams,
		periodRange,
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
	<div class="grid grid-cols-4 gap-1 rounded-full bg-surface-muted p-1 dark:bg-surface-muted-night">
		{#each PERIOD_KINDS as kind (kind)}
			<a
				href={href(switchKind(period, kind, today, span?.to ?? null))}
				data-sveltekit-noscroll
				data-sveltekit-replacestate
				aria-current={period.kind === kind ? 'true' : undefined}
				class="rounded-full py-1.5 text-center text-sm font-medium {period.kind === kind
					? 'bg-surface shadow-sm dark:bg-surface-night'
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
					class="grid h-10 w-10 place-items-center rounded-full bg-surface dark:bg-surface-night {by >
					0
						? 'order-last'
						: ''} {enabled ? '' : 'opacity-40'}"
				>
					<Icon name={by < 0 ? 'previous' : 'next'} size={20} />
				</a>
			{/each}
			<p class="text-center font-medium" aria-live="polite">{label}</p>
		</div>
	{/if}
</nav>
<!-- eslint-enable svelte/no-navigation-without-resolve -->
