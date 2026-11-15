<script lang="ts" module>
	import type { IconName } from '#lib/icons.ts';

	export type Choice = {
		value: string;
		label: string;
		/** A person's avatar in front of their name */
		person?: { avatarId: string; avatar: string | null; name: string };
		/** ...or an icon */
		icon?: IconName;
	};
</script>

<script lang="ts">
	// One question of the expense form answered with a tap (who paid, how it's split): its options
	// as a row of chips, radio buttons underneath, so it's sent like any choice and works without
	// JavaScript. All of them in sight, onto a second line if need be; a dropdown when there are
	// too many for that (a big group's people).
	import Avatar from '#lib/components/Avatar.svelte';
	import Icon from '#lib/components/Icon.svelte';

	type Props = {
		name: string;
		legend: string;
		options: Choice[];
		value: string;
		/** What the onboarding points at (#331) */
		tour?: string;
		/** Past this many options, a dropdown instead: a long row of chips is no quicker */
		chipsUpTo?: number;
	};
	let { name, legend, options, value = $bindable(), tour, chipsUpTo = Infinity }: Props = $props();
	const id = $props.id();
</script>

{#if options.length > chipsUpTo}
	<div class="flex min-w-0 flex-col gap-1.5" data-tour={tour}>
		<label for={id} class="field-label">{legend}</label>
		<div class="field-well">
			<select {id} {name} bind:value>
				{#each options as option (option.value)}
					<option value={option.value}>{option.label}</option>
				{/each}
			</select>
			<span class="field-arrow"><Icon name="expand" size={16} /></span>
		</div>
	</div>
{:else}
	<fieldset class="flex min-w-0 flex-col gap-2" data-tour={tour}>
		<legend class="field-label mb-2">{legend}</legend>
		<div class="flex flex-wrap gap-2">
			{#each options as option (option.value)}
				<label
					class="flex h-10 flex-none cursor-pointer items-center gap-2 rounded-full border border-transparent bg-surface-muted text-sm whitespace-nowrap transition-colors has-checked:border-accent has-checked:bg-accent-soft/50 has-checked:font-medium has-focus-visible:ring-2 dark:bg-surface-muted-night dark:has-checked:border-accent-night dark:has-checked:bg-accent-soft-night/50 {option.person
						? 'ps-1 pe-3.5'
						: option.icon
							? 'ps-3 pe-3.5'
							: 'px-3.5'}"
				>
					<input class="sr-only" type="radio" {name} value={option.value} bind:group={value} />
					{#if option.person}
						<Avatar
							id={option.person.avatarId}
							name={option.person.name}
							avatar={option.person.avatar}
							size="sm"
						/>
					{:else if option.icon}
						<Icon name={option.icon} size={16} class="opacity-70" />
					{/if}
					{option.label}
				</label>
			{/each}
		</div>
	</fieldset>
{/if}
