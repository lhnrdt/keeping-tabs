<script lang="ts">
	// A quiet word that what's here is private (#110): nothing to set up, nothing to decide.
	import Icon from '#lib/components/Icon.svelte';
	import { m } from '#lib/paraglide/messages.js';
</script>

<p class="flex items-center justify-center gap-1.5 text-xs text-muted">
	<Icon name="locked" size={13} />
	{m.encrypted_note()}
</p>
