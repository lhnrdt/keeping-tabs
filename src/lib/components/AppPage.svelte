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

<Page>
	<Navbar {right}>
		{#snippet title()}
			<h1>{heading}</h1>
		{/snippet}
		{#snippet left()}
			{#if back}
				<NavbarBackLink
					href={back.href}
					text={back.label}
					showText={false}
					aria-label={m.back_to_group({ name: back.label })}
				/>
			{/if}
		{/snippet}
	</Navbar>

	<div class="mx-auto w-full max-w-2xl pb-24">
		{@render children()}
	</div>

	<VersionFooter />
</Page>
