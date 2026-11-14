<script lang="ts">
	import { morphFrom, morphTo } from '#lib/motion/morph.ts';
	import { applyLook } from '#lib/themes/apply-look.ts';
	import { beforeNavigate, onNavigate } from '$app/navigation';
	import { page, updated } from '$app/state';
	import { App } from 'konsta/svelte';
	import { onMount, untrack } from 'svelte';
	import { syncKeys } from '#lib/crypto/vault.ts';
	import { startSync } from '#lib/offline/sync.ts';
	import { prefersReducedMotion } from 'svelte/motion';
	import FriendlyNote from '#lib/components/FriendlyNote.svelte';
	import NavigationProgress from '#lib/components/NavigationProgress.svelte';
	import OfflineBanner from '#lib/components/OfflineBanner.svelte';
	import SlowNavigation from '#lib/components/skeleton/SlowNavigation.svelte';
	import { locales, localizeHref } from '#lib/paraglide/runtime.js';
	import { refreshOnReturn } from '#lib/refresh-on-return.ts';
	import { provideTheme, ThemeChoice } from '#lib/themes/current.svelte.ts';
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	// The theme's illustrations follow the picker at once (#60)
	const theme = new ThemeChoice(untrack(() => data.theme));
	provideTheme(theme);
	// e.g. brought from another device of yours, or a new day's scenery (#332)
	$effect(() => {
		theme.id = data.theme;
		applyLook({ colors: data.colors, own: data.own ?? undefined });
	});

	const depth = (url: URL | undefined) => url?.pathname.split('/').filter(Boolean).length ?? 0;

	// After a deploy, the next navigation loads the new version instead of the old app
	beforeNavigate(({ willUnload, to }) => {
		if (updated.current && !willUnload && to?.url) location.href = to.url.href;
	});

	onMount(refreshOnReturn);
	// No browser menu on a long press or right click, except where text can be typed or copied, and
	// no pinching to zoom
	onMount(() => {
		const menu = (event: Event) => {
			if (!(event.target as Element).closest('input, textarea, [contenteditable], .selectable')) {
				event.preventDefault();
			}
		};
		// Safari pinches to zoom whatever the page says, unless the gesture is stopped
		const pinch = (event: Event) => event.preventDefault();
		document.addEventListener('contextmenu', menu);
		document.addEventListener('gesturestart', pinch);
		return () => {
			document.removeEventListener('contextmenu', menu);
			document.removeEventListener('gesturestart', pinch);
		};
	});
	// Expenses kept while offline go out when the connection is back (#55)
	onMount(startSync);
	// Keys this device holds go to your others, whichever page it's opened on (#110)
	onMount(() => void syncKeys().catch(() => {}));

	// Page transitions (N-12)
	onNavigate((navigation) => {
		if (!document.startViewTransition || prefersReducedMotion.current) return;
		// 1 = deeper (slide forward), -1 = back up, 0 = same level such as tabs (fade)
		const direction = Math.sign(depth(navigation.to?.url) - depth(navigation.from?.url));
		document.documentElement.style.setProperty('--vt-direction', String(direction));
		// A new entry just saved: its screen shrinks into its row in the list (#291)
		const entry = morphFrom();
		return new Promise((resolve) => {
			const transition = document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
				if (entry) await morphTo(entry, transition.finished);
			});
			if (!entry) return;
			// Not landed anywhere (no row to turn into): nothing left named
			transition.finished.finally(() => delete document.documentElement.dataset.transition);
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<App theme="ios" dark safeAreas>
	<NavigationProgress />
	{@render children()}
	<SlowNavigation />
	<OfflineBanner />
	{#if data.showNote}
		<FriendlyNote />
	{/if}
</App>

<div style="display:none">
	{#each locales as locale (locale)}
		<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -- this page, in another language -->
		<a href={localizeHref(page.url.pathname, { locale })}>{locale}</a>
	{/each}
</div>
