<script lang="ts">
	// Come back with a passkey: makes this device you, with all your groups (A-18).
	import { goto, invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Block, Button, Preloader } from 'konsta/svelte';
	import { onMount } from 'svelte';
	import FormError from '#lib/components/FormError.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { continueWithPasskey, passkeysSupported } from '#lib/passkeys.ts';

	let supported = $state(false);
	let pending = $state(false);
	let failed = $state(false);

	onMount(() => (supported = passkeysSupported()));

	async function restore() {
		pending = true;
		failed = false;
		try {
			await continueWithPasskey();
			await invalidateAll();
			await goto(resolve('/'));
		} catch {
			failed = true;
		} finally {
			pending = false;
		}
	}
</script>

{#if supported}
	<Block>
		<Button large rounded type="button" class="gap-2" disabled={pending} onclick={restore}>
			{#if pending}<Preloader class="h-5 w-5" />{:else}<Icon name="passkey" />{/if}
			{m.passkey_continue()}
		</Button>
	</Block>
	{#if failed}<FormError error="passkey_failed" />{/if}
{/if}
