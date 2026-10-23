<script lang="ts">
	// The other people when creating a group, as pills: type a name, press Enter or +. Each
	// name submits a hidden "member" value; the field itself is also named "member", so a
	// typed name that wasn't added yet still counts (and the form works without JavaScript).
	import { scale } from 'svelte/transition';
	import Icon from '#lib/components/Icon.svelte';
	import PersonPill from '#lib/components/people/PersonPill.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { LIMITS, normalizeText } from '#lib/validation.ts';

	/** Names to pre-fill after a failed submit */
	let { names = [] }: { names?: string[] } = $props();

	let added = $derived(names.filter((name) => normalizeText(name)));
	let draft = $state('');

	const isNew = (name: string) =>
		!added.some((other) => other.toLocaleLowerCase() === name.toLocaleLowerCase());

	function add() {
		const name = normalizeText(draft);
		if (name && isNew(name)) added = [...added, name];
		draft = '';
	}

	function addOnEnter(event: KeyboardEvent) {
		if (event.key !== 'Enter' || !normalizeText(draft)) return;
		event.preventDefault();
		add();
	}

	const remove = (name: string) => (added = added.filter((other) => other !== name));
</script>

<!-- Not inside the pills: a pill fading out must not be submitted anymore -->
{#each added as name (name)}
	<input type="hidden" name="member" value={name} />
{/each}

<div class="mx-4 mt-3 mb-6">
	<ul class="flex flex-wrap gap-2" aria-label={m.field_other_members()}>
		{#each added as name (name)}
			<li transition:scale={{ duration: 150, start: 0.8 }}>
				<PersonPill {name} avatarId={name}>
					{#snippet trailing()}
						<button
							type="button"
							class="-me-1 grid h-7 w-7 place-items-center rounded-full opacity-60 hover:opacity-100 focus-visible:ring-2"
							aria-label={m.remove_person({ name })}
							onclick={() => remove(name)}
						>
							<Icon name="remove" size={16} />
						</button>
					{/snippet}
				</PersonPill>
			</li>
		{/each}
		<li
			class="inline-flex min-h-11 items-center gap-1 rounded-full border border-dashed border-forest/60 ps-4 pe-1 focus-within:border-solid focus-within:border-forest dark:border-forest-night/60"
		>
			<input
				name="member"
				maxlength={LIMITS.memberName}
				autocomplete="off"
				placeholder={m.add_person()}
				aria-label={m.add_person()}
				class="w-36 bg-transparent text-sm outline-none"
				bind:value={draft}
				onkeydown={addOnEnter}
			/>
			<button
				type="button"
				class="grid h-9 w-9 place-items-center rounded-full text-forest focus-visible:ring-2 dark:text-forest-night"
				aria-label={m.add_person_button()}
				onclick={add}
			>
				<Icon name="add" size={18} />
			</button>
		</li>
	</ul>
</div>
