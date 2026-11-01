<script lang="ts">
	// Keys live in this browser, which might forget them: a quiet word to have a way back (#110).
	import { resolve } from '$app/paths';
	import { m } from '#lib/paraglide/messages.js';
</script>

<a
	href={resolve('/you/backup')}
	class="mx-4 my-2 flex flex-col gap-0.5 rounded-xl bg-current/[0.07] p-3.5 text-sm"
>
	<span class="font-medium">{m.backup_nudge_title()}</span>
	<span class="text-muted">{m.backup_nudge_text()}</span>
</a>
