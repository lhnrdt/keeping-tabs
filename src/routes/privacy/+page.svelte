<script lang="ts">
	import { resolve } from '$app/paths';
	import AppPage from '#lib/components/AppPage.svelte';
	import PrivacyDe from '#lib/components/legal/PrivacyDe.svelte';
	import PrivacyEn from '#lib/components/legal/PrivacyEn.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { getLocale } from '#lib/paraglide/runtime.js';

	// Legal text per language, as whole pages rather than single strings
	const Privacy = getLocale() === 'de' ? PrivacyDe : PrivacyEn;
</script>

<svelte:head>
	<title>{m.privacy_title()} – {m.app_name()}</title>
</svelte:head>

<AppPage title={m.privacy_title()} back={{ href: resolve('/'), label: m.app_name() }}>
	<article
		class="mx-4 space-y-3 pb-6 leading-relaxed [&_code]:text-sm [&_h2]:mt-6 [&_h2]:font-display [&_h2]:text-xl [&_h2]:font-semibold [&_li]:mt-2 [&_ul]:list-disc [&_ul]:ps-5"
	>
		<Privacy />
	</article>
</AppPage>
