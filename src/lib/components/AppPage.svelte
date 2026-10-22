<script lang="ts">
	// Shell for every screen: Konsta page, navbar with optional back link, optional hero
	// (which then carries the page's h1 instead of the navbar), version footer.
	import { Navbar, NavbarBackLink, Page } from 'konsta/svelte';
	import type { Snippet } from 'svelte';
	import { m } from '#lib/paraglide/messages.js';
	import VersionFooter from './VersionFooter.svelte';

	type Props = {
		title: string;
		back?: { href: string; label: string };
		right?: Snippet;
		hero?: Snippet;
		children: Snippet;
	};

	let { title: heading, back, right, hero, children }: Props = $props();
</script>

{#snippet backLink()}
	{#if back}
		<NavbarBackLink
			href={back.href}
			text={back.label}
			showText={false}
			aria-label={m.back_to_group({ name: back.label })}
		/>
	{/if}
{/snippet}

<Page>
	<!-- No left slot without a back link, or the navbar draws an empty button -->
	<Navbar {right} left={back ? backLink : undefined} innerClass="mx-auto max-w-app">
		{#snippet title()}
			{#if !hero}
				<h1 class="font-display text-[1.35rem] font-semibold">{heading}</h1>
			{/if}
		{/snippet}
	</Navbar>

	<div class="mx-auto w-full max-w-app">
		{@render hero?.()}
	</div>

	<div class="mx-auto w-full max-w-app">
		{@render children()}
	</div>

	<!-- Bottom space keeps the footer clear of a fixed tab bar -->
	<div class="pb-24">
		<VersionFooter />
	</div>
</Page>
