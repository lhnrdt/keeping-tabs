<script lang="ts">
	// A recap for a finished trip or event (#163): when it was, what it came to, and the
	// story in two lines, on a card with the theme's motif. Shareable as text.
	import { Button } from 'konsta/svelte';
	import Icon from '#lib/components/Icon.svelte';
	import ThemeMotif from '#lib/components/illustrations/ThemeMotif.svelte';
	import { categoryLabels } from '#lib/expense/category-style.ts';
	import { shownAmount } from '#lib/shown-money.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { shareFile, shareText } from '#lib/share.ts';
	import { page } from '$app/state';
	import type { GroupKind } from '#lib/group/kinds.ts';
	import { recapPoster } from '#lib/insights/recap-poster.ts';
	import { useTheme } from '#lib/themes/current.svelte.ts';
	import { LANDSCAPE_STRENGTH, subjectOf } from '#lib/themes/group-subjects.ts';
	import { SCENES } from '#lib/themes/scenes.ts';
	import { getLocale } from '#lib/paraglide/runtime.js';
	import type { Recap } from '#lib/insights/recap.ts';

	let { recap, name, currency }: { recap: Recap; name: string; currency: string } = $props();

	const money = (amount: number) => shownAmount(amount, currency);
	const percent = (share: number) =>
		new Intl.NumberFormat(getLocale(), { style: 'percent', maximumFractionDigits: 0 }).format(
			share
		);
	const utc = (iso: string) => new Date(`${iso}T00:00:00Z`);
	const dates = $derived(
		new Intl.DateTimeFormat(getLocale(), {
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			timeZone: 'UTC'
		}).formatRange(utc(recap.from), utc(recap.to))
	);
	const day = (iso: string) =>
		new Intl.DateTimeFormat(getLocale(), {
			weekday: 'short',
			day: 'numeric',
			month: 'short',
			year: 'numeric',
			timeZone: 'UTC'
		}).format(utc(iso));

	const numbers = $derived([
		{ label: m.insights_days(), value: String(recap.days) },
		{ label: m.insights_per_person(), value: money(recap.perPerson) },
		{ label: m.insights_per_day(), value: money(recap.perDay) },
		{ label: m.insights_expenses(), value: String(recap.count) }
	]);

	const theme = useTheme();
	const kind: GroupKind | undefined = $derived(page.data.group?.kind);

	/** As a picture (#291): the group's scene in its header's colors, with the numbers */
	let saved = $state(false);
	async function sharePicture() {
		const header = document.querySelector('header.tint-theme') ?? document.documentElement;
		const style = getComputedStyle(header);
		const root = getComputedStyle(document.documentElement);
		const read = (name: string, fallback: string) =>
			style.getPropertyValue(name).trim() || fallback;
		const blob = await recapPoster(
			kind
				? [
						{ scene: SCENES[theme.id], strength: LANDSCAPE_STRENGTH },
						{ scene: subjectOf(kind, theme.id), strength: 1 }
					]
				: [{ scene: SCENES[theme.id], strength: 1 }],
			{
				background: read('--tint-bg', '#e3eae5'),
				line: read('--tint-line', '#2b5a3f'),
				text: read('--tint-fg', '#1f3327')
			},
			{
				app: m.app_name(),
				name,
				dates,
				total: money(recap.total),
				lines: numbers.map((number) => `${number.label}: ${number.value}`)
			},
			{
				display: root.getPropertyValue('--font-display').trim() || 'serif',
				body: root.getPropertyValue('--font-ios').trim() || 'sans-serif'
			}
		);
		if ((await shareFile(blob, `${name}.png`)) !== 'saved') return;
		saved = true;
		setTimeout(() => (saved = false), 2000);
	}

	let copied = $state(false);
	async function share() {
		const text = m.recap_share_text({
			name,
			dates,
			total: money(recap.total),
			days: recap.days,
			perPerson: money(recap.perPerson)
		});
		const result = await shareText(text);
		if (result === 'failed') window.prompt(m.recap_share(), text);
		if (result !== 'copied') return;
		copied = true;
		setTimeout(() => (copied = false), 2000);
	}
</script>

<article
	class="relative mx-4 overflow-hidden rounded-2xl bg-accent/12 px-4 py-4 dark:bg-accent-night/15"
	aria-label={m.insights_recap()}
>
	<div class="pointer-events-none absolute -top-2 -right-2 opacity-60"><ThemeMotif /></div>
	<p class="text-sm text-muted">{dates}</p>
	<p class="mt-1 font-display text-3xl font-semibold">{money(recap.total)}</p>
	<dl class="mt-3 grid grid-cols-2 gap-x-4 gap-y-2">
		{#each numbers as number (number.label)}
			<div>
				<dt class="text-xs text-muted">{number.label}</dt>
				<dd class="font-semibold">{number.value}</dd>
			</div>
		{/each}
	</dl>
	{#if recap.topCategory || recap.busiestDay}
		<ul class="mt-3 space-y-0.5 text-sm">
			{#if recap.topCategory}
				<li>
					{m.recap_top_category({
						category: categoryLabels[recap.topCategory.category](),
						share: percent(recap.topCategory.share)
					})}
				</li>
			{/if}
			{#if recap.busiestDay}
				<li>
					{m.highlight_busiest_day({
						date: day(recap.busiestDay.date),
						amount: money(recap.busiestDay.amount)
					})}
				</li>
			{/if}
		</ul>
	{/if}
	<div class="mt-4 flex flex-wrap gap-2">
		<Button rounded tonal small inline type="button" class="gap-1.5" onclick={share}>
			<Icon name={copied ? 'check' : 'share'} size={16} />
			<span aria-live="polite">{copied ? m.copied() : m.recap_share()}</span>
		</Button>
		<Button rounded tonal small inline type="button" class="gap-1.5" onclick={sharePicture}>
			<Icon name={saved ? 'check' : 'photo'} size={16} />
			<span aria-live="polite">{saved ? m.recap_picture_saved() : m.recap_share_picture()}</span>
		</Button>
	</div>
</article>
