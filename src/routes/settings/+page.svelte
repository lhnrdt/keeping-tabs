<script lang="ts">
	// Settings save as soon as they change: the name when you leave the field, the theme
	// right away (and switches at once), the language by serving the page again in it.
	// Without JavaScript, each has its own Save button.
	import { enhance, type SubmitFunction } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Block, List } from 'konsta/svelte';
	import AppPage from '#lib/components/AppPage.svelte';
	import Field from '#lib/components/Field.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import SegmentedPicker from '#lib/components/pickers/SegmentedPicker.svelte';
	import SavedHint from '#lib/components/SavedHint.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { locales } from '#lib/paraglide/runtime.js';
	import { isTheme, LOCALE_NAMES, THEMES, type Theme } from '#lib/settings.ts';
	import { LIMITS } from '#lib/validation.ts';
	import type { PageProps } from './$types';

	let { data, form }: PageProps = $props();

	const themeLabels: Record<Theme, () => string> = {
		system: m.theme_system,
		light: m.theme_light,
		dark: m.theme_dark
	};
	const localeOptions = locales.map((locale) => ({ value: locale, label: LOCALE_NAMES[locale] }));
	const themeOptions = THEMES.map((theme) => ({ value: theme, label: themeLabels[theme]() }));

	let saved = $state<string>();
	let savedTimer: ReturnType<typeof setTimeout>;
	/** Saves in the background and briefly says so, without reloading the page */
	const saveQuietly: SubmitFunction = () => {
		return async ({ result, update }) => {
			if (result.type === 'success') {
				saved = String(result.data?.setting);
				clearTimeout(savedTimer);
				savedTimer = setTimeout(() => (saved = undefined), 2000);
			}
			await update({ reset: false, invalidateAll: false });
		};
	};
	const submitOnChange = (event: Event & { currentTarget: HTMLFormElement }) =>
		event.currentTarget.requestSubmit();

	function themeChanged(event: Event & { currentTarget: HTMLFormElement }) {
		const theme = new FormData(event.currentTarget).get('theme');
		if (isTheme(theme)) window.applyTheme?.(theme);
		event.currentTarget.requestSubmit();
	}
	const errorFor = (setting: string) => (form?.setting === setting ? form.error : undefined);
</script>

<svelte:head>
	<title>{m.settings_title()} – {m.app_name()}</title>
</svelte:head>

<AppPage title={m.settings_title()} back={{ href: resolve('/'), label: m.app_name() }}>
	<form method="POST" action="?/name" use:enhance={saveQuietly} onchange={submitOnChange}>
		<List strong inset class="!mb-2">
			<Field
				label={m.field_your_name()}
				name="name"
				maxlength={LIMITS.memberName}
				autocomplete="given-name"
				value={data.name}
			/>
		</List>
		<Block class="!my-0"><p class="text-sm text-muted">{m.settings_name_hint()}</p></Block>
		<SavedHint shown={saved === 'name'} />
		<FormError error={errorFor('name')} />
		<noscript><Block><button type="submit">{m.save()}</button></Block></noscript>
	</form>

	<!-- A plain post: the page is served again, so the new language applies everywhere -->
	<form method="POST" action="?/language" onchange={submitOnChange}>
		<input type="hidden" name="next" value={resolve('/settings')} />
		<h2 class="mx-4 mt-4 mb-1 text-sm font-medium text-muted">{m.settings_language()}</h2>
		<SegmentedPicker
			name="locale"
			legend={m.settings_language()}
			options={localeOptions}
			value={data.locale}
		/>
		<noscript><Block><button type="submit">{m.save()}</button></Block></noscript>
	</form>

	<form method="POST" action="?/theme" use:enhance={saveQuietly} onchange={themeChanged}>
		<h2 class="mx-4 mt-4 mb-1 text-sm font-medium text-muted">{m.settings_theme()}</h2>
		<SegmentedPicker
			name="theme"
			legend={m.settings_theme()}
			options={themeOptions}
			value={data.theme}
		/>
		<SavedHint shown={saved === 'theme'} />
		<FormError error={errorFor('theme')} />
		<noscript><Block><button type="submit">{m.save()}</button></Block></noscript>
	</form>
</AppPage>
