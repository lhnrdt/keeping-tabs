<script lang="ts">
	// Shell for every screen: Konsta page, navbar with optional back link, version footer.
	import { Navbar, NavbarBackLink, Page } from 'konsta/svelte';
	import type { Snippet } from 'svelte';
	import { m } from '#lib/paraglide/messages.js';
	import VersionFooter from './VersionFooter.svelte';

	type Props = {
		title: string;
		back?: { href: string; label: string };
		right?: Snippet;
		children: Snippet;
	};

	let { title: heading, back, right, children }: Props = $props();
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
	<Navbar {right} left={back ? backLink : undefined}>
		{#snippet title()}
			<h1>{heading}</h1>
		{/snippet}
	</Navbar>

	<div class="mx-auto w-full max-w-2xl">
		{@render children()}
	</div>

	<!-- Bottom space keeps the footer clear of a fixed tab bar -->
	<div class="pb-24">
		<VersionFooter />
	</div>
</Page>
