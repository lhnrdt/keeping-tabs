<script lang="ts">
	// Other members as removable chips: type a name, press Add or Enter. Each name submits a
	// hidden "member" value; the field itself is also named "member", so a typed name that
	// wasn't added yet still counts (and the form works without JavaScript).
	import { Block, Chip, ListButton } from 'konsta/svelte';
	import { scale } from 'svelte/transition';
	import Field from '#lib/components/Field.svelte';
	import Icon from '#lib/components/Icon.svelte';
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

<!-- Not inside the chips: a chip fading out must not be submitted anymore -->
{#each added as name (name)}
	<input type="hidden" name="member" value={name} />
{/each}

{#if added.length}
	<Block class="!my-3 flex flex-wrap gap-2" role="list" aria-label={m.field_other_members()}>
		{#each added as name (name)}
			<div role="listitem" transition:scale={{ duration: 150, start: 0.8 }}>
				<Chip class="gap-1">
					{name}
					<button
						type="button"
						class="-me-1 grid h-6 w-6 place-items-center rounded-full opacity-60 hover:opacity-100"
						aria-label={m.remove_person({ name })}
						onclick={() => remove(name)}
					>
						<Icon name="remove" size={16} />
					</button>
				</Chip>
			</div>
		{/each}
	</Block>
{/if}

<!-- svelte-ignore a11y_no_static_element_interactions -->
<div onkeydown={addOnEnter}>
	<Field
		label={m.add_person()}
		name="member"
		maxlength={LIMITS.memberName}
		autocomplete="off"
		bind:value={draft}
	/>
</div>
<ListButton type="button" onclick={add}>
	<Icon name="addMember" />
	{m.add_person_button()}
</ListButton>
