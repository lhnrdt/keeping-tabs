<script lang="ts">
	// "+ Add" as the last pill; opens into an inline name field. Enter adds the person and
	// keeps the field open for the next one.
	import { enhance } from '$app/forms';
	import { tick } from 'svelte';
	import Icon from '#lib/components/Icon.svelte';
	import { Submission } from '#lib/forms/submission.svelte.ts';
	import { tabAction } from '#lib/group/tabs.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { LIMITS } from '#lib/validation.ts';

	let open = $state(false);
	let input = $state<HTMLInputElement>();
	const submission = new Submission(async (result) => {
		if (result.type !== 'success') return;
		await tick();
		input?.focus();
	});

	async function start() {
		open = true;
		await tick();
		input?.focus();
	}
</script>

{#if open}
	<form
		method="POST"
		action={tabAction('addMember', 'group')}
		use:enhance={submission.enhance}
		class="inline-flex min-h-11 items-center gap-1 rounded-full bg-surface ps-4 pe-1 shadow-[0_0_0_2px_var(--color-forest)] dark:bg-surface-night"
	>
		<input
			bind:this={input}
			name="name"
			required
			maxlength={LIMITS.memberName}
			autocomplete="off"
			placeholder={m.add_person_placeholder()}
			aria-label={m.new_person_name()}
			class="w-36 bg-transparent text-sm outline-none"
			onkeydown={(event) => event.key === 'Escape' && (open = false)}
		/>
		<button
			type="submit"
			class="grid h-9 w-9 place-items-center rounded-full bg-forest text-white dark:bg-forest-night dark:text-canvas-night"
			aria-label={m.add_person_button()}
			aria-busy={submission.pending}
		>
			<Icon name="add" size={18} />
		</button>
		<button
			type="button"
			class="grid h-9 w-9 place-items-center rounded-full opacity-60 hover:opacity-100"
			aria-label={m.cancel()}
			onclick={() => (open = false)}
		>
			<Icon name="remove" size={18} />
		</button>
	</form>
{:else}
	<button
		type="button"
		class="inline-flex min-h-11 items-center gap-1.5 rounded-full border border-dashed border-forest/60 px-4 text-sm font-medium text-forest focus-visible:ring-2 dark:border-forest-night/60 dark:text-forest-night"
		onclick={start}
	>
		<Icon name="addMember" size={18} />
		{m.add_person_button()}
	</button>
{/if}
