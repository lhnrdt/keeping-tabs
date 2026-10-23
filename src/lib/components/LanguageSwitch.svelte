<script lang="ts">
	// English · Deutsch: the language follows the browser until you pick one here.
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale, locales, setLocale } from '#lib/paraglide/runtime.js';

	/** Each language in its own name */
	const names: Record<(typeof locales)[number], string> = { en: 'English', de: 'Deutsch' };
	const current = getLocale();
</script>

<div class="flex justify-center gap-1" role="group" aria-label={m.language()}>
	{#each locales as locale (locale)}
		<button
			type="button"
			lang={locale}
			aria-pressed={locale === current}
			class="rounded-full px-3 py-1 aria-pressed:bg-surface-muted aria-pressed:font-medium dark:aria-pressed:bg-surface-muted-night"
			onclick={() => setLocale(locale)}
		>
			{names[locale]}
		</button>
	{/each}
</div>
