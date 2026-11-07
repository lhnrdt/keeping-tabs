<script lang="ts">
	// Choose your avatar (#61): your initials or a nature icon, on one of the palette's tints.
	// The preview follows the choice at once; the form saves it.
	import { avatarIcons } from '#lib/avatar-icons.ts';
	import {
		AVATAR_ICONS,
		DRAWN,
		formatAvatar,
		type AvatarChoice,
		type AvatarIcon,
		type Drawing
	} from '#lib/avatars.ts';
	import Icon from '#lib/components/Icon.svelte';
	import AvatarDrawing from './AvatarDrawing.svelte';
	import Avatar from '#lib/components/Avatar.svelte';
	import { tintLabels } from '#lib/group/kind-style.ts';
	import { initials } from '#lib/group/members.ts';
	import { m } from '#lib/paraglide/messages.js';
	import { tintClass, TINTS } from '#lib/tints.ts';

	let { id, name, value }: { id: string; name: string; value: AvatarChoice } = $props();

	// Follows the saved value, and the choice right away
	let icon = $derived<AvatarIcon | null | typeof DRAWN>(value.drawing ? DRAWN : value.icon);
	let tint = $derived(value.tint);
	let drawing = $state<Drawing | undefined>(undefined);
	const preview = $derived(
		formatAvatar(
			icon === DRAWN
				? {
						icon: null,
						tint,
						drawing: (drawing ?? value.drawing)?.d ? (drawing ?? value.drawing) : undefined
					}
				: { icon, tint }
		)
	);

	const option =
		'grid h-11 w-11 place-items-center rounded-full bg-(--tint-bg) text-(--tint-fg) ring-offset-2 ring-offset-canvas peer-checked:ring-2 peer-checked:ring-accent peer-focus-visible:outline-2 dark:ring-offset-canvas-night dark:peer-checked:ring-accent-night';
</script>

<div class="flex items-center gap-3 px-4 pb-3">
	<Avatar {id} {name} avatar={preview} size="lg" />
	<p class="text-sm text-muted">{m.avatar_hint()}</p>
</div>

<fieldset class="px-4 pb-3">
	<legend class="mb-2 text-sm text-muted">{m.avatar_color()}</legend>
	<div class="flex flex-wrap gap-3">
		{#each TINTS as option_ (option_)}
			<label class="cursor-pointer">
				<input class="peer sr-only" type="radio" name="tint" value={option_} bind:group={tint} />
				<span class="{tintClass(id, option_)} {option}" title={tintLabels[option_]()}>
					<span class="sr-only">{tintLabels[option_]()}</span>
				</span>
			</label>
		{/each}
	</div>
</fieldset>

<fieldset class="px-4">
	<legend class="mb-2 text-sm text-muted">{m.avatar_icon()}</legend>
	<div class="grid grid-cols-6 gap-2">
		<label class="cursor-pointer">
			<input
				class="peer sr-only"
				type="radio"
				name="icon"
				value="initials"
				checked={icon === null}
				onchange={() => (icon = null)}
			/>
			<span
				class="{tintClass(id, tint)} {option} text-sm font-semibold"
				title={m.avatar_initials()}
			>
				{initials(name) || '?'}<span class="sr-only">{m.avatar_initials()}</span>
			</span>
		</label>
		{#each AVATAR_ICONS as choice (choice)}
			{@const Glyph = avatarIcons[choice]}
			<label class="cursor-pointer">
				<input
					class="peer sr-only"
					type="radio"
					name="icon"
					value={choice}
					checked={icon === choice}
					onchange={() => (icon = choice)}
				/>
				<span class="{tintClass(id, tint)} {option}" title={m[`avatar_${choice}`]()}>
					<Glyph size={22} stroke={1.75} aria-hidden="true" />
					<span class="sr-only">{m[`avatar_${choice}`]()}</span>
				</span>
			</label>
		{/each}
		<label class="cursor-pointer">
			<input
				class="peer sr-only"
				type="radio"
				name="icon"
				value={DRAWN}
				checked={icon === DRAWN}
				onchange={(event) => {
					icon = DRAWN;
					// Nothing drawn yet: nothing to save until there is
					if (!value.drawing) event.stopPropagation();
				}}
			/>
			<span class="{tintClass(id, tint)} {option}" title={m.avatar_draw()}>
				<Icon name="edit" size={20} />
				<span class="sr-only">{m.avatar_draw()}</span>
			</span>
		</label>
	</div>
</fieldset>

{#if icon === DRAWN}
	<div class="pt-4">
		<AvatarDrawing
			tint={tintClass(id, tint)}
			initial={value.drawing}
			onDraw={(drawn) => (drawing = drawn)}
		/>
	</div>
{/if}
