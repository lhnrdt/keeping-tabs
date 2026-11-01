<script lang="ts">
	// A calm placeholder for text that's on its way.
	let { class: className = '' }: { class?: string } = $props();
</script>

<span class="skeleton block rounded-md {className}" aria-hidden="true"></span>
