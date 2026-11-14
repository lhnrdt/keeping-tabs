<script lang="ts">
	// On the start screen until it's installed or put off (#352): what installing it brings, and
	// the browser's install button, or on an iPhone the way there.
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import { calmMs } from '#lib/motion/calm.ts';
	import { install } from '#lib/install/install.svelte.ts';
	import { m } from '#lib/paraglide/messages.js';
	import InstallSteps from './InstallSteps.svelte';

	onMount(() => install.start());
</script>

{#if install.available && !install.dismissed}
	<section
		class="mx-4 my-2 flex flex-col gap-3 rounded-xl bg-current/[0.07] p-3.5"
		aria-labelledby="install-title"
		data-tour="install"
		out:slide={{ duration: calmMs(200) }}
	>
		<div class="flex flex-col gap-0.5 text-sm">
			<h2 id="install-title" class="font-medium">{m.install_title()}</h2>
			<p class="text-muted">{m.install_text()}</p>
		</div>
		{#if install.canPrompt}
			<div class="flex justify-end gap-2">
				<button
					type="button"
					class="min-h-10 px-3 text-sm font-medium"
					onclick={() => install.dismiss()}>{m.install_not_now()}</button
				>
				<button
					type="button"
					class="min-h-10 rounded-full bg-accent px-4 text-sm font-semibold text-white dark:bg-accent-night dark:text-canvas-night"
					onclick={() => install.prompt()}>{m.install_button()}</button
				>
			</div>
		{:else}
			<InstallSteps />
			<button
				type="button"
				class="min-h-10 self-end px-3 text-sm font-medium"
				onclick={() => install.dismiss()}>{m.install_not_now()}</button
			>
		{/if}
	</section>
{/if}
