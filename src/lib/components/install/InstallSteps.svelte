<script lang="ts">
	// The way to install it on an iPhone or iPad (#352), where no browser offers it, drawn as Safari
	// shows it, a little screen per step with what to tap ringed: the ••• next to the address,
	// Share, Add to Home Screen, then Add. Swiped through side by side.
	import Icon from '#lib/components/Icon.svelte';
	import { m } from '#lib/paraglide/messages.js';

	const steps = [
		m.install_apple_step_more,
		m.install_apple_step_share,
		m.install_apple_step_home,
		m.install_apple_step_add
	];
	/** What to tap */
	const ring = 'ring-2 ring-accent ring-offset-1 dark:ring-accent-night';
</script>

<ol
	class="safari-steps -mx-3.5 flex snap-x snap-mandatory scroll-px-3.5 gap-3 overflow-x-auto px-3.5 pb-1"
	aria-label={m.install_apple_steps()}
>
	{#each steps as caption, i (i)}
		<li class="flex w-36 flex-none snap-start flex-col gap-1.5">
			<!-- Safari's own greys, light and dark, whatever the app's colours -->
			<div
				class="relative flex h-40 flex-col overflow-hidden rounded-2xl bg-[#f2f2f7] p-2 text-[10px] text-black ring-1 ring-black/10 dark:bg-[#1c1c1e] dark:text-white dark:ring-white/10"
				aria-hidden="true"
			>
				{#if i === 0}
					<!-- The page, and the bar at the bottom with the address -->
					<div class="flex flex-1 flex-col gap-1.5 p-1 opacity-40">
						<span class="h-2 w-3/4 rounded bg-current/30"></span>
						<span class="h-2 w-1/2 rounded bg-current/30"></span>
						<span class="mt-1 h-10 rounded-lg bg-current/15"></span>
					</div>
					<div class="flex items-center gap-1.5">
						<span
							class="grid size-7 place-items-center rounded-full bg-white shadow-sm dark:bg-[#2c2c2e]"
							>‹</span
						>
						<span
							class="flex h-7 min-w-0 flex-1 items-center truncate rounded-full bg-white px-2 whitespace-nowrap shadow-sm dark:bg-[#2c2c2e]"
							>keeping-tabs</span
						>
						<span
							class="grid size-7 place-items-center rounded-full bg-white shadow-sm dark:bg-[#2c2c2e] {ring}"
							><Icon name="safariMore" size={14} /></span
						>
					</div>
				{:else if i === 1}
					<!-- The menu that opens above it -->
					<div class="mt-auto flex flex-col rounded-xl bg-white/95 p-1 shadow-md dark:bg-[#2c2c2e]">
						<span class="flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 {ring}"
							><Icon name="shareApple" size={13} />{m.safari_share()}</span
						>
						<span class="flex items-center gap-1.5 px-1.5 py-1.5 opacity-50"
							><Icon name="safariFavourite" size={13} />{m.safari_favourites()}</span
						>
						<span class="flex items-center gap-1.5 px-1.5 py-1.5 opacity-50"
							><Icon name="add" size={13} />{m.safari_new_tab()}</span
						>
					</div>
				{:else if i === 2}
					<!-- The share sheet's list -->
					<div class="mt-auto flex flex-col gap-1 rounded-xl bg-white p-1 dark:bg-[#2c2c2e]">
						<span class="flex items-center gap-1.5 px-1.5 py-1.5 opacity-50"
							><Icon name="safariFavourite" size={13} />{m.safari_favourites()}</span
						>
						<span class="flex items-center gap-1.5 rounded-lg px-1.5 py-1.5 {ring}"
							><Icon name="safariHomeScreen" size={13} />{m.safari_home_screen()}</span
						>
						<span class="flex items-center gap-1.5 px-1.5 py-1.5 opacity-50"
							><Icon name="search" size={13} />{m.safari_find()}</span
						>
					</div>
				{:else}
					<!-- The last screen: its title, and Add at the top -->
					<div class="flex items-center justify-between gap-1">
						<span class="grid size-6 place-items-center rounded-full bg-black/5 dark:bg-white/10"
							>×</span
						>
						<span class="truncate text-[9px] font-semibold">{m.safari_home_screen()}</span>
						<span class="rounded-full bg-[#0a84ff] px-2 py-1 font-semibold text-white {ring}"
							>{m.safari_add()}</span
						>
					</div>
					<div class="mt-2 flex items-center gap-1.5 rounded-lg bg-white p-1.5 dark:bg-[#2c2c2e]">
						<img src="/icons/apple-touch-icon.png" alt="" class="size-6 rounded-md" />
						<span class="font-medium">Keeping Tabs</span>
					</div>
				{/if}
			</div>
			<span class="flex gap-1.5 text-xs"
				><span class="font-semibold text-accent dark:text-accent-night">{i + 1}</span
				>{caption()}</span
			>
		</li>
	{/each}
</ol>

<style>
	.safari-steps {
		scrollbar-width: none;
	}
	.safari-steps::-webkit-scrollbar {
		display: none;
	}
</style>
