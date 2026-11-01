<script lang="ts">
	// Receipt photos while adding an expense: kept here until it's saved, then sent one by one
	// (`onchange` tells the form). They can't wait for a connection the way the expense can.
	import { onMount } from 'svelte';
	import FormError from '#lib/components/FormError.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { MAX_RECEIPTS_PER_EXPENSE } from '#lib/expense/receipt-image.ts';
	import { m } from '#lib/paraglide/messages.js';
	import PhotoPicker from './PhotoPicker.svelte';

	type Picked = { blob: Blob; preview: string };

	let { onchange }: { onchange: (photos: Blob[]) => void } = $props();

	let picked = $state<Picked[]>([]);
	let error = $state<ErrorCode>();
	let online = $state(true);
	onMount(() => {
		online = navigator.onLine;
		const follow = () => (online = navigator.onLine);
		addEventListener('online', follow);
		addEventListener('offline', follow);
		return () => {
			removeEventListener('online', follow);
			removeEventListener('offline', follow);
		};
	});

	const preview = (blob: Blob) =>
		new Promise<string>((done) => {
			const reader = new FileReader();
			reader.onload = () => done(String(reader.result));
			reader.readAsDataURL(blob);
		});

	async function add(photo: Blob | null) {
		error = photo ? undefined : 'receipt_invalid';
		if (!photo) return;
		picked.push({ blob: photo, preview: await preview(photo) });
		onchange(picked.map((each) => each.blob));
	}
	function remove(i: number) {
		picked.splice(i, 1);
		onchange(picked.map((each) => each.blob));
	}
</script>

<section class="flex flex-col gap-2" aria-label={m.receipts_title()}>
	<h2 class="field-label">{m.receipts_title()}</h2>
	{#if picked.length}
		<ul class="grid grid-cols-3 gap-2">
			{#each picked as photo, i (photo)}
				<li class="flex flex-col gap-1">
					<img
						src={photo.preview}
						alt={m.receipt_alt({ number: i + 1 })}
						class="aspect-square w-full rounded-xl object-cover"
					/>
					<button
						type="button"
						class="min-h-8 text-sm font-medium tone-destructive"
						aria-label={m.receipt_remove_label({ number: i + 1 })}
						onclick={() => remove(i)}>{m.comment_remove()}</button
					>
				</li>
			{/each}
		</ul>
	{/if}
	{#if picked.length < MAX_RECEIPTS_PER_EXPENSE}
		<PhotoPicker disabled={!online} onpick={add} />
	{/if}
	{#if !online}<p class="text-sm text-muted">{m.receipt_needs_connection()}</p>{/if}
	<FormError {error} />
</section>
