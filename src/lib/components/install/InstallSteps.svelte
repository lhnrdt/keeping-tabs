<script lang="ts">
	// The way to install it on an iPhone or iPad (#352), where no browser offers it: Share, then
	// Add to Home Screen.
	import Icon from '#lib/components/Icon.svelte';
	import { m } from '#lib/paraglide/messages.js';
</script>

<ol class="flex flex-col gap-2 text-sm">
	<li class="flex items-center gap-2.5">
		<span
			class="grid size-8 flex-none place-items-center rounded-full bg-surface dark:bg-surface-night"
		>
			<Icon name="shareApple" size={18} />
		</span>
		{m.install_apple_share()}
	</li>
	<li class="flex items-center gap-2.5">
		<span
			class="grid size-8 flex-none place-items-center rounded-full bg-surface dark:bg-surface-night"
		>
			<Icon name="add" size={18} />
		</span>
		{m.install_apple_add()}
	</li>
</ol>
