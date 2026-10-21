<script lang="ts">
	// Shell for a full-screen group form: acting member, error, pending submit button.
	import { enhance } from '$app/forms';
	import { Block } from 'konsta/svelte';
	import type { Snippet } from 'svelte';
	import FormError from '#lib/components/FormError.svelte';
	import SubmitButton from '#lib/components/SubmitButton.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import ActorInput from './ActorInput.svelte';

	type Props = { error?: ErrorCode; submitLabel: string; children: Snippet };

	let { error, submitLabel, children }: Props = $props();

	const submission = new Submission();
</script>

<form method="POST" action="?/save" use:enhance={submission.enhance}>
	<ActorInput />
	{@render children()}
	<FormError {error} />
	<Block>
		<SubmitButton pending={submission.pending}>{submitLabel}</SubmitButton>
	</Block>
</form>
