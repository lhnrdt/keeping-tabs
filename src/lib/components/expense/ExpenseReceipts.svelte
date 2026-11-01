<script lang="ts">
	// Photos of an expense's receipt (#52): shrunk in the browser, then sent. Tap one to see it
	// large. Everyone in the group can add and remove them.
	import { invalidateAll } from '$app/navigation';
	import { resolve } from '$app/paths';
	import { Preloader } from 'konsta/svelte';
	import FormError from '#lib/components/FormError.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { MAX_RECEIPTS_PER_EXPENSE } from '#lib/expense/receipt-image.ts';
	import { sendReceipt } from '#lib/expense/send-receipt.ts';
	import { calmMove, calmPop } from '#lib/motion/calm.ts';
	import { m } from '#lib/paraglide/messages.js';
	import PhotoPicker from './PhotoPicker.svelte';
	import ReceiptPhoto from './ReceiptPhoto.svelte';

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

	async function add(photo: Blob | null) {
		sending = true;
		error = photo ? undefined : 'receipt_invalid';
		try {
			if (photo) error = (await sendReceipt(photo)) ?? undefined;
			await invalidateAll();
		} catch {
			error = 'receipt_invalid';
		} finally {
			sending = false;
		}
	}

	async function remove(receiptId: string) {
		const body = new FormData();
		body.set('receiptId', receiptId);
		await fetch('?/removeReceipt', {
			method: 'POST',
			headers: { 'x-sveltekit-action': 'true' },
			body
		});
		await invalidateAll();
	}
</script>

<section class="flex flex-col gap-3 px-4 pt-4" aria-label={m.receipts_title()}>
	<h2 class="field-label">{m.receipts_title()}</h2>
	{#if receipts.length}
		<ul class="grid grid-cols-3 gap-2">
			{#each receipts as receipt, i (receipt.id)}
				<li class="flex flex-col gap-1" transition:calmPop animate:calmMove>
					<ReceiptPhoto url={url(receipt.id)} alt={m.receipt_alt({ number: i + 1 })} />
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
		<div class="flex items-center gap-2">
			<PhotoPicker disabled={sending} onpick={add} />
			{#if sending}<Preloader class="size-4" />{/if}
		</div>
	{/if}
	<FormError {error} />
</section>
