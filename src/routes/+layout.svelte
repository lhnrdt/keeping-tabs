<script lang="ts">
	import type { Path } from '$app/types';
	import { onNavigate } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { App } from 'konsta/svelte';
	import { prefersReducedMotion } from 'svelte/motion';
	import { locales, localizeHref } from '#lib/paraglide/runtime.js';
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const depth = (url: URL | undefined) => url?.pathname.split('/').filter(Boolean).length ?? 0;

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
</App>

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Path)}>{locale}</a>
	{/each}
</div>
