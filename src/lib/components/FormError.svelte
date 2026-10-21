<script lang="ts">
	import { Block } from 'konsta/svelte';
	import { slide } from 'svelte/transition';
	import { errorMessage, type ErrorCode } from '#lib/errors.ts';

	let { error }: { error: ErrorCode | undefined } = $props();
</script>

{#if error}
	<div transition:slide={{ duration: 150 }}>
		<Block class="!my-2 tone-destructive" role="alert">{errorMessage(error)}</Block>
	</div>
{/if}
