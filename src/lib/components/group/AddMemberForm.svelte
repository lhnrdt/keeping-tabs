<script lang="ts">
	import { enhance } from '$app/forms';
	import { List, ListButton } from 'konsta/svelte';
	import Field from '#lib/components/Field.svelte';
	import FormError from '#lib/components/FormError.svelte';
	import ActorInput from './ActorInput.svelte';
	import type { ErrorCode } from '#lib/errors.ts';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import { tabAction } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { LIMITS } from '#lib/validation.ts';

	let { error }: { error?: ErrorCode } = $props();

	const submission = new Submission();
</script>

<form method="POST" action={tabAction('addMember', 'group')} use:enhance={submission.enhance}>
	<ActorInput />
	<List strong inset>
		<Field
			label={m.new_member()}
			name="name"
			required
			maxlength={LIMITS.memberName}
			autocomplete="off"
		/>
		<ListButton type="submit" aria-busy={submission.pending}>{m.add_member()}</ListButton>
	</List>
	<FormError {error} />
</form>
