<script lang="ts">
	// Installing it from Settings, any time (#352): the browser's install dialog, or on an iPhone the
	// way there, unfolded. Not there once it's installed.
	import { onMount } from 'svelte';
	import { slide } from 'svelte/transition';
	import Icon from '#lib/components/Icon.svelte';
	import { calmMs } from '#lib/motion/calm.ts';
	import { install } from '#lib/install/install.svelte.ts';
	import { m } from '#lib/paraglide/messages.js';
	import InstallSteps from './InstallSteps.svelte';

	let open = $state(false);
	onMount(() => install.start());
</script>

{#if install.available}
	<button
		type="button"
		class="field-well min-h-14 w-full gap-3 px-3.5 text-start active:opacity-70"
		aria-expanded={install.canPrompt ? undefined : open}
		onclick={() => (install.canPrompt ? install.prompt() : (open = !open))}
	>
		<span class="flex-none opacity-65"><Icon name="phone" size={20} /></span>
		<span class="min-w-0 flex-1 font-medium">{m.install_settings()}</span>
	</button>
	{#if open && !install.canPrompt}
		<div class="px-1 pt-1" transition:slide={{ duration: calmMs(200) }}>
			<InstallSteps />
		</div>
	{/if}
{/if}
