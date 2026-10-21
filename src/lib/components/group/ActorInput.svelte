<script lang="ts">
	// Tells the server which member made the change (activity log, L-1).
	import { useIdentity } from '#lib/group/identity.svelte.ts';

	const identity = useIdentity();
</script>

<input type="hidden" name="actor" value={identity.memberId ?? ''} />
