<script lang="ts">
	// English · Deutsch: the language follows the browser until you pick one here. A plain form
	// post (works without JavaScript, and the page is served again in the new language); with
	// an identity the choice is saved with it, so it follows you to your other devices.
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, locales } from '#lib/paraglide/runtime.js';
	import { LOCALE_NAMES } from '#lib/settings.ts';

	const current = getLocale();
</script>

<form
	method="POST"
	action={`${resolve('/settings')}?/language`}
	class="flex justify-center gap-1"
	aria-label={m.language()}
>
	<input type="hidden" name="next" value={`${page.url.pathname}${page.url.search}`} />
	{#each locales as locale (locale)}
		<button
			type="submit"
			name="locale"
			value={locale}
			lang={locale}
			aria-pressed={locale === current}
			class="rounded-full px-3 py-1 aria-pressed:bg-surface-muted aria-pressed:font-medium dark:aria-pressed:bg-surface-muted-night"
		>
			{LOCALE_NAMES[locale]}
		</button>
	{/each}
</form>
