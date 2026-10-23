<script lang="ts">
	// A note from the app's creator to friends, shown once (#112): what they can technically
	// see. Warm and honest, not legal text. A plain form, so it works without JavaScript.
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { Sheet } from 'konsta/svelte';
	import { m } from '#lib/paraglide/messages.js';
</script>

<Sheet class="rounded-t-3xl" opened role="dialog" aria-modal="true" aria-labelledby="friendly-note">
	<form
		method="POST"
		action={resolve('/note')}
		class="mx-auto max-w-app space-y-3 px-6 pt-6 pb-[calc(var(--k-safe-area-bottom,0px)+1.5rem)]"
	>
		<input type="hidden" name="next" value={`${page.url.pathname}${page.url.search}`} />
		<h2 id="friendly-note" class="font-display text-2xl font-semibold">{m.note_title()}</h2>
		<p>{m.note_text()}</p>
		<button
			type="submit"
			class="mt-2 flex h-12 w-full items-center justify-center rounded-full bg-forest font-semibold text-white dark:bg-forest-night dark:text-canvas-night"
		>
			{m.note_ok()}
		</button>
	</form>
</Sheet>
