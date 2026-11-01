<script lang="ts">
	// Where a receipt photo comes from: the camera right away, or the gallery. Hands over the
	// photo already shrunk; null when it can't be read or stays too large.
	import Icon from '#lib/components/Icon.svelte';
	import { shrinkPhoto } from '#lib/expense/shrink-photo.ts';
	import { m } from '#lib/paraglide/messages.js';

	type Props = {
		disabled?: boolean;
		/** Called with each photo, after shrinking */
		onpick: (photo: Blob | null) => void | Promise<void>;
	};

	let { disabled = false, onpick }: Props = $props();

	async function picked(event: Event & { currentTarget: HTMLInputElement }) {
		const input = event.currentTarget;
		const file = input.files?.[0];
		if (!file) return;
		try {
			await onpick(await shrinkPhoto(file));
		} finally {
			input.value = '';
		}
	}
</script>

{#snippet choice(label: string, icon: 'camera' | 'photo', capture: 'environment' | undefined)}
	<label
		class="choice-pill has-focus-visible:ring-2 {disabled ? 'pointer-events-none opacity-50' : ''}"
	>
		<Icon name={icon} size={18} />
		{label}
		<input class="sr-only" type="file" accept="image/*" {capture} {disabled} onchange={picked} />
	</label>
{/snippet}

<div class="flex flex-wrap gap-2">
	{@render choice(m.receipt_take(), 'camera', 'environment')}
	{@render choice(m.receipt_choose(), 'photo', undefined)}
</div>
