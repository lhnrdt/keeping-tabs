<script lang="ts">
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import { m } from '#lib/paraglide/messages.js';
</script>

<svelte:head>
	<title>{m.error_title()} – {m.app_name()}</title>
</svelte:head>

<main class="mx-auto max-w-md space-y-4 p-4">
	<h1 class="text-2xl font-bold">{m.error_title()}</h1>
	<p>{page.error?.message}</p>
	<a class="text-blue-700 underline" href={resolve('/')}>{m.back_home()}</a>
</main>
