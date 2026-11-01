<script lang="ts">
	// Photos of an expense's receipt (#52): shrunk in the browser, then sent. Tap one to see it
	// large. Everyone in the group can add and remove them.
	import { deserialize } from '$app/forms';
	import { invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Preloader } from 'konsta/svelte';
	import FormError from '#lib/components/FormError.svelte';
	import Icon from '#lib/components/Icon.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { MAX_RECEIPTS_PER_EXPENSE } from '#lib/expense/receipt-image.ts';
	import { shrinkPhoto } from '#lib/expense/shrink-photo.ts';
	import { m } from '#lib/paraglide/messages.js';

	type Props = {
		receipts: { id: string }[];
		token: string;
		expenseId: string;
		/** Only members can add or remove */
		canChange: boolean;
	};

	let { receipts, token, expenseId, canChange }: Props = $props();

	let sending = $state(false);
	let error = $state<ErrorCode>();

	const url = (receiptId: string) =>
		resolve('/g/[token]/expenses/[id]/receipts/[receiptId]', { token, id: expenseId, receiptId });

	async function send(action: string, body: FormData) {
		const response = await fetch(`?/${action}`, {
			method: 'POST',
			headers: { 'x-sveltekit-action': 'true' },
			body
		});
		const result = deserialize(await response.text());
		if (result.type === 'failure') error = result.data?.receiptError as ErrorCode;
		else await invalidateAll();
	}

	async function add(event: Event & { currentTarget: HTMLInputElement }) {
		const input = event.currentTarget;
		const file = input.files?.[0];
		if (!file) return;
		sending = true;
		error = undefined;
		try {
			const photo = await shrinkPhoto(file);
			if (!photo) {
				error = 'receipt_invalid';
				return;
			}
			const body = new FormData();
			body.set('photo', photo, 'receipt.jpg');
			await send('addReceipt', body);
		} catch {
			error = 'receipt_invalid';
		} finally {
			sending = false;
			input.value = '';
		}
	}

	async function remove(receiptId: string) {
		const body = new FormData();
		body.set('receiptId', receiptId);
		await send('removeReceipt', body);
	}
</script>

<section class="flex flex-col gap-3 px-4 pt-4" aria-label={m.receipts_title()}>
	<h2 class="field-label">{m.receipts_title()}</h2>
	{#if receipts.length}
		<ul class="grid grid-cols-3 gap-2">
			{#each receipts as receipt, i (receipt.id)}
				<li class="flex flex-col gap-1">
					<a
						href={url(receipt.id)}
						target="_blank"
						rel="noopener"
						data-sveltekit-reload
						class="block aspect-square overflow-hidden rounded-xl"
					>
						<img
							src={url(receipt.id)}
							alt={m.receipt_alt({ number: i + 1 })}
							loading="lazy"
							class="size-full object-cover"
						/>
					</a>
					{#if canChange}
						<button
							type="button"
							class="min-h-8 text-sm font-medium tone-destructive"
							aria-label={m.receipt_remove_label({ number: i + 1 })}
							onclick={() => remove(receipt.id)}>{m.comment_remove()}</button
						>
					{/if}
				</li>
			{/each}
		</ul>
	{/if}
	{#if canChange && receipts.length < MAX_RECEIPTS_PER_EXPENSE}
		<label
			class="flex min-h-11 cursor-pointer items-center gap-2 self-start text-sm font-medium text-accent has-focus-visible:ring-2 dark:text-accent-night"
		>
			{#if sending}<Preloader class="size-4" />{:else}<Icon name="photo" size={18} />{/if}
			{m.receipt_add()}
			<input class="sr-only" type="file" accept="image/*" disabled={sending} onchange={add} />
		</label>
	{/if}
	<FormError {error} />
</section>
