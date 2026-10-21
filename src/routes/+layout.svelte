<script lang="ts">
	import type { Path } from '$app/types';
	import { version } from '$app/env';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { App } from 'konsta/svelte';
	import { locales, localizeHref } from '#lib/paraglide/runtime.js';
	import './layout.css';
	import favicon from '#lib/assets/favicon.svg';
	import type { LayoutProps } from './$types';

	let { data, children }: LayoutProps = $props();
</script>

<svelte:head>
	<link rel="icon" href={favicon} />
</svelte:head>

<App theme={data.theme} dark safeAreas>
	{@render children()}

	<footer class="mx-auto max-w-md p-4 text-center text-xs text-gray-400">
		<span data-testid="app-version">v{version}</span>
	</footer>
</App>

<div style="display:none">
	{#each locales as locale (locale)}
		<a href={resolve(localizeHref(page.url.pathname, { locale }) as Path)}>{locale}</a>
	{/each}
</div>
