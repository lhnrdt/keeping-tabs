<script lang="ts">
	import { onMount } from 'svelte';
	import { version } from '$app/env';
	import { CHANGELOG } from '#lib/changelog/entries.ts';
	import { visibleEntries } from '#lib/changelog/visible.ts';
	import { getSeenChangelog } from '#lib/device.ts';
	// Settings save as soon as they change: the name when you leave the field, the theme
	// right away (and switches at once), the language by serving the page again in it.
	// Without JavaScript, each has its own Save button.
	import { enhance, type SubmitFunction } from '$app/forms';
	import { resolve } from '$app/paths';
	import { Block, BlockTitle, List, ListItem } from 'konsta/svelte';
	import AppPage from '#lib/components/AppPage.svelte';
	import DeleteIdentity from '#lib/components/device/DeleteIdentity.svelte';
	import PushToggle from '#lib/components/device/PushToggle.svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import Field from '#lib/components/Field.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import AccentPicker from '#lib/components/pickers/AccentPicker.svelte';
	import AvatarPicker from '#lib/components/pickers/AvatarPicker.svelte';
	import { parseAvatar } from '#lib/avatars.ts';
	import { tintFor } from '#lib/tints.ts';
	import SegmentedPicker from '#lib/components/pickers/SegmentedPicker.svelte';
	import SavedHint from '#lib/components/SavedHint.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { locales } from '#lib/paraglide/runtime.js';
	import { isAccent, isTheme, LOCALE_NAMES, THEMES, type Theme } from '#lib/settings.ts';
	import { useTheme } from '#lib/themes/current.svelte.ts';
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

	/** The color theme switches at once, like the light/dark one */
	const theme = useTheme();
	function accentChanged(event: Event & { currentTarget: HTMLFormElement }) {
		const accent = new FormData(event.currentTarget).get('accent');
		if (isAccent(accent)) {
			window.applyAccent?.(accent);
			theme.id = accent;
		}
		event.currentTarget.requestSubmit();
	}

	function themeChanged(event: Event & { currentTarget: HTMLFormElement }) {
		const theme = new FormData(event.currentTarget).get('theme');
		if (isTheme(theme)) window.applyTheme?.(theme);
		event.currentTarget.requestSubmit();
	}
	const errorFor = (setting: string) => (form?.setting === setting ? form.error : undefined);

	// A dot on What's new when there's a version this device hasn't read about (#212)
	let unread = $state(false);
	onMount(() => {
		const newest = visibleEntries(CHANGELOG, version)[0]?.version;
		unread = Boolean(newest) && getSeenChangelog() !== newest;
	});
</script>

<svelte:head>
	<title>{m.you_title()} – {m.app_name()}</title>
</svelte:head>

<AppPage title={m.you_title()} back={{ href: resolve('/'), label: m.app_name() }}>
	{#if data.name}
		<div class="flex items-center gap-3 px-4 pt-4 pb-2">
			<Avatar id={data.personId ?? ''} name={data.name} avatar={data.avatar} />
			<p class="font-display text-2xl font-semibold">{data.name}</p>
		</div>
	{/if}
	<!-- Your avatar, shown wherever you appear (#61) -->
	<form method="POST" action="?/avatar" use:enhance={saveQuietly} onchange={submitOnChange}>
		<h2 class="mx-4 mt-4 mb-2 text-sm font-medium text-muted">{m.avatar_title()}</h2>
		<AvatarPicker
			id={data.personId ?? ''}
			name={data.name}
			value={parseAvatar(data.avatar) ?? { icon: null, tint: tintFor(data.personId ?? '') }}
		/>
		<SavedHint shown={saved === 'avatar'} />
		<FormError error={errorFor('avatar')} />
		<noscript><Block><button type="submit">{m.save()}</button></Block></noscript>
	</form>

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

	<form method="POST" action="?/payment" use:enhance={saveQuietly} onchange={submitOnChange}>
		<List strong inset class="!mb-2">
			<Field
				label={m.field_payment_details()}
				name="paymentDetails"
				maxlength={LIMITS.paymentDetails}
				autocomplete="off"
				placeholder={m.payment_details_placeholder()}
				value={data.paymentDetails}
			/>
		</List>
		<Block class="!my-0"><p class="text-sm text-muted">{m.payment_details_hint()}</p></Block>
		<SavedHint shown={saved === 'payment'} />
		<FormError error={errorFor('payment')} />
		<noscript><Block><button type="submit">{m.save()}</button></Block></noscript>
	</form>

	<!-- A plain post: the page is served again, so the new language applies everywhere -->
	<form method="POST" action="?/language" onchange={submitOnChange}>
		<input type="hidden" name="next" value={resolve('/you')} />
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

	<form method="POST" action="?/accent" use:enhance={saveQuietly} onchange={accentChanged}>
		<h2 class="mx-4 mt-4 mb-2 text-sm font-medium text-muted">{m.settings_accent()}</h2>
		<AccentPicker value={data.accent} />
		<SavedHint shown={saved === 'accent'} />
		<FormError error={errorFor('accent')} />
		<noscript><Block><button type="submit">{m.save()}</button></Block></noscript>
	</form>

	{#if data.pushPublicKey}
		<BlockTitle class="!mb-2">{m.push_title()}</BlockTitle>
		<PushToggle publicKey={data.pushPublicKey} />
	{/if}

	<!-- Everything about you is reachable from here (#146) -->
	<List strong inset>
		<ListItem link title={m.home_other_device()} href={resolve('/you/devices')}>
			{#snippet media()}
				<Icon name="identity" />
			{/snippet}
		</ListItem>
		<ListItem link title={m.whats_new_title()} href={resolve('/you/whats-new')}>
			{#snippet media()}
				<Icon name="sparkles" />
			{/snippet}
			{#snippet after()}
				{#if unread}
					<!-- Something new since this device last looked (#212) -->
					<span class="h-2.5 w-2.5 rounded-full bg-accent dark:bg-accent-night"></span>
					<span class="sr-only">{m.whats_new_unread()}</span>
				{/if}
			{/snippet}
		</ListItem>
	</List>

	<!-- Removing you entirely, at the very end and in red (#151) -->
	<BlockTitle class="!mb-2">{m.delete_identity_title()}</BlockTitle>
	<Block class="!my-2"><p class="text-sm text-muted">{m.delete_identity_intro()}</p></Block>
	<DeleteIdentity />
</AppPage>
