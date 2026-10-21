<script lang="ts">
	// Shell for every screen: Konsta page, navbar with optional back link, version footer.
	import { Navbar, NavbarBackLink, Page } from 'konsta/svelte';
	import type { Snippet } from 'svelte';
	import VersionFooter from './VersionFooter.svelte';

	type Props = {
		title: string;
		back?: { href: string; label: string };
		right?: Snippet;
		children: Snippet;
	};

	let { title, back, right, children }: Props = $props();
</script>

<Page>
	<Navbar {title} {right}>
		{#snippet left()}
			{#if back}
				<NavbarBackLink href={back.href} text={back.label} showText />
			{/if}
		{/snippet}
	</Navbar>

	<div class="mx-auto w-full max-w-2xl pb-24">
		{@render children()}
	</div>

	<VersionFooter />
</Page>
