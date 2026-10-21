<script lang="ts">
	import { Block } from 'konsta/svelte';
	import { slide } from 'svelte/transition';
	import { errorMessage, type ErrorCode } from '#lib/errors.ts';

	let { error }: { error: ErrorCode | undefined } = $props();
</script>

{#if error}
	<div transition:slide={{ duration: 150 }}>
		<Block class="!my-2 text-red-600 dark:text-red-400" role="alert">{errorMessage(error)}</Block>
	</div>
{/if}
