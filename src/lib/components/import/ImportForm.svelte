<script lang="ts">
	// Pick a Splitwise export, see what it contains and who is who, then import (I-1 – I-3).
	// The preview runs the same parser as the server; without JS the server's suggestions apply.
	import { enhance } from '$app/forms';
	import { Block, List } from 'konsta/svelte';
	import FormError from '#lib/components/FormError.svelte';
	import SubmitButton from '#lib/components/SubmitButton.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import type { Member } from '#lib/group/members.ts';
	import { parseSplitwise, type SplitwiseExport } from '#lib/import/splitwise.ts';
	import { m } from '#lib/paraglide/messages.js';
	import ImportPeople from './ImportPeople.svelte';
	import ImportSummary from './ImportSummary.svelte';

	type Props = { members: Member[]; currency: string; error?: ErrorCode };

	let { members, currency, error }: Props = $props();

	const submission = new Submission();
	let preview = $state<SplitwiseExport>();
	let previewError = $state<ErrorCode>();
	const inputId = $props.id();

	async function read(event: Event & { currentTarget: HTMLInputElement }) {
		const file = event.currentTarget.files?.[0];
		const result = file ? parseSplitwise(await file.text(), currency) : undefined;
		preview = result?.ok ? result.value : undefined;
		previewError = result && !result.ok ? result.error : undefined;
	}
</script>

<form method="POST" enctype="multipart/form-data" use:enhance={submission.enhance}>
	<Block>
		<p>{m.import_intro()}</p>
	</Block>
	<List strong inset>
		<li class="px-4 py-3">
			<label for={inputId} class="mb-2 block text-sm text-muted">{m.import_file()}</label>
			<input
				id={inputId}
				name="file"
				type="file"
				accept=".csv,text/csv"
				required
				onchange={read}
				class="block w-full text-sm file:mr-3 file:rounded-full file:border-0 file:bg-accent file:px-4 file:py-2 file:font-medium file:text-white dark:file:bg-accent-night dark:file:text-canvas-night"
			/>
		</li>
	</List>

	{#if preview}
		<ImportSummary export={preview} {currency} />
		<ImportPeople people={preview.people} {members} />
	{/if}

	<FormError error={error ?? previewError} />
	<Block>
		<SubmitButton pending={submission.pending}>{m.import_submit()}</SubmitButton>
		<p class="mt-3 text-center text-sm text-muted">{m.import_again_hint()}</p>
	</Block>
</form>
