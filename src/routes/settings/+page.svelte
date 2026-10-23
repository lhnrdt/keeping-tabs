<script lang="ts">
	import { resolve } from '$app/paths';
	import { Block, List } from 'konsta/svelte';
	import AppPage from '#lib/components/AppPage.svelte';
	import Field from '#lib/components/Field.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import SegmentedPicker from '#lib/components/pickers/SegmentedPicker.svelte';
	import SubmitButton from '#lib/components/SubmitButton.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { locales } from '#lib/paraglide/runtime.js';
	import { LOCALE_NAMES, THEMES, type Theme } from '#lib/settings.ts';
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
</script>

<svelte:head>
	<title>{m.settings_title()} – {m.app_name()}</title>
</svelte:head>

<AppPage title={m.settings_title()} back={{ href: resolve('/'), label: m.app_name() }}>
	<!-- A plain form post: the page is served again, so a new language applies at once -->
	<form method="POST" action="?/save">
		<List strong inset>
			<Field
				label={m.field_your_name()}
				name="name"
				maxlength={LIMITS.memberName}
				autocomplete="given-name"
				value={data.name}
			/>
		</List>
		<Block class="!mb-1"><p class="text-sm opacity-70">{m.settings_name_hint()}</p></Block>

		<h2 class="mx-4 mt-6 mb-1 text-sm font-medium opacity-60">{m.settings_language()}</h2>
		<SegmentedPicker
			name="locale"
			legend={m.settings_language()}
			options={localeOptions}
			value={data.locale}
		/>

		<h2 class="mx-4 mt-6 mb-1 text-sm font-medium opacity-60">{m.settings_theme()}</h2>
		<SegmentedPicker
			name="theme"
			legend={m.settings_theme()}
			options={themeOptions}
			value={data.theme}
		/>

		<FormError error={form?.error} />
		<Block>
			<SubmitButton>{m.save()}</SubmitButton>
			<p class="mt-3 text-center text-sm opacity-60">{m.settings_follow_you()}</p>
		</Block>
	</form>
</AppPage>
