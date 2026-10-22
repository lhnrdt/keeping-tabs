<script lang="ts">
	// Welcome band on the home screen, in the same language as the group headers.
	import Topography from '#lib/components/illustrations/Topography.svelte';
	import { m } from '#lib/paraglide/messages.js';
</script>

<header
	class="relative mx-4 mt-2 overflow-hidden rounded-3xl bg-(--tint-bg) px-5 pt-6 pb-7 text-(--tint-fg) tint-sage"
>
	<Topography />
	<div class="relative">
		<h1 class="font-display text-4xl leading-tight font-semibold">{m.app_name()}</h1>
		<p class="mt-2 max-w-xs opacity-80">{m.home_tagline()}</p>
	</div>
</header>
