<script lang="ts">
	import type { Path } from '$app/types';
	import { beforeNavigate, onNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page, updated } from '$app/state';
	import { App } from 'konsta/svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import FriendlyNote from '#lib/components/FriendlyNote.svelte';
	import OfflineBanner from '#lib/components/OfflineBanner.svelte';
	import { locales, localizeHref } from '#lib/paraglide/runtime.js';
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();

	const depth = (url: URL | undefined) => url?.pathname.split('/').filter(Boolean).length ?? 0;

	// After a deploy, the next navigation loads the new version instead of the old app
	beforeNavigate(({ willUnload, to }) => {
		if (updated.current && !willUnload && to?.url) location.href = to.url.href;
	});

	// Page transitions (N-12)
	onNavigate((navigation) => {
		if (!document.startViewTransition || prefersReducedMotion.current) return;
		// 1 = deeper (slide forward), -1 = back up, 0 = same level such as tabs (fade)
		const direction = Math.sign(depth(navigation.to?.url) - depth(navigation.from?.url));
		document.documentElement.style.setProperty('--vt-direction', String(direction));
		return new Promise((resolve) => {
			document.startViewTransition(async () => {
				resolve();
				await navigation.complete;
			});
		});
	});
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<App theme="ios" dark safeAreas>
	{@render children()}
	<OfflineBanner />
	{#if data.showNote}
		<FriendlyNote />
	{/if}
</App>

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Path)}>{locale}</a>
	{/each}
</div>
