<script lang="ts">
	// Choose the app's colours (#60, #332, #330). Two choices of their own come first: the
	// scenery's colours, and a theme made from any colour you pick on the device's colour picker.
	// Then the themes' colours, each a small preview (background, a card, the accent), light or
	// dark like the app.
	import Icon from '#lib/components/Icon.svelte';
	import { m } from '#lib/paraglide/messages.js';
	import { COLORS, isOwnColor, LIKE_SCENERY, type Colors } from '#lib/settings.ts';
	import { ownThemeProperties, styleOf } from '#lib/themes/own-theme.ts';
	import { PALETTES, type ThemeId } from '#lib/themes/palettes.ts';
	import { themeLabels } from './theme-labels';

	type Props = {
		value: Colors;
		/** The scenery shown today, whose colours "like the scenery" are */
		scenery: ThemeId;
	};
	let { value, scenery }: Props = $props();

	const mine = $derived(isOwnColor(value));
	/** Your colour, or the scenery's to start from */
	let own = $derived(isOwnColor(value) ? value : PALETTES[scenery].light.accent);
	let ownChoice: HTMLInputElement;
	const pickerId = $props.id();

	/** Picked: chosen, and the form saves it like any other choice */
	function picked(event: Event & { currentTarget: HTMLInputElement }) {
		own = event.currentTarget.value;
		// Set here, not left to the next render: the form reads it right away
		ownChoice.value = own;
		ownChoice.checked = true;
		ownChoice.dispatchEvent(new Event('change', { bubbles: true }));
	}

	/** The two choices of their own: a card with a round preview, dashed until chosen */
	const card = (chosen: boolean) =>
		`flex h-full items-center gap-3 rounded-2xl border-2 p-3 ${
			chosen
				? 'border-solid border-accent dark:border-accent-night'
				: 'border-dashed border-current/25'
		}`;
	const preview =
		'grid size-10 flex-none place-items-center rounded-full bg-(--hero-bg) text-(--accent) dark:bg-(--hero-bg-night) dark:text-(--accent-night)';
	const themes = COLORS.filter((colors): colors is ThemeId => colors !== LIKE_SCENERY);
</script>

<fieldset class="flex flex-col gap-3 px-4">
	<legend class="sr-only">{m.settings_colors()}</legend>
	<div class="grid grid-cols-2 gap-3">
		<label class="cursor-pointer">
			<input
				class="peer sr-only"
				type="radio"
				name="colors"
				value={LIKE_SCENERY}
				checked={value === LIKE_SCENERY}
			/>
			<span class="{card(value === LIKE_SCENERY)} peer-focus-visible:ring-2">
				<span class={preview} data-accent={scenery}><Icon name="scenery" size={20} /></span>
				<span class="flex min-w-0 flex-col">
					<span class="text-sm font-medium">{m.colors_like_scenery()}</span>
					<span class="text-xs text-muted"
						>{m.colors_like_scenery_hint({ theme: themeLabels[scenery]() })}</span
					>
				</span>
			</span>
		</label>
		<div>
			<input
				bind:this={ownChoice}
				class="sr-only"
				type="radio"
				name="colors"
				value={own}
				checked={mine}
				tabindex="-1"
				aria-hidden="true"
			/>
			<label for={pickerId} class="block h-full cursor-pointer">
				<input
					id={pickerId}
					class="peer sr-only"
					type="color"
					value={own}
					onchange={picked}
					aria-label={m.colors_own()}
				/>
				<span class="{card(mine)} peer-focus-visible:ring-2">
					<!-- Filled with your colour, as the app's buttons will be -->
					<span
						class="grid size-10 flex-none place-items-center rounded-full bg-(--accent) text-(--surface) dark:bg-(--accent-night) dark:text-(--canvas-night)"
						style={styleOf(ownThemeProperties(own))}
					>
						<Icon name="pickColor" size={20} />
					</span>
					<span class="flex min-w-0 flex-col">
						<span class="text-sm font-medium">{m.colors_own()}</span>
						<span class="text-xs text-muted">{m.colors_own_hint()}</span>
					</span>
				</span>
			</label>
		</div>
	</div>
	<p class="text-xs text-muted">{m.colors_themes()}</p>
	<div class="grid grid-cols-3 gap-3">
		{#each themes as colors (colors)}
			<label class="cursor-pointer" data-accent={colors}>
				<input
					class="peer sr-only"
					type="radio"
					name="colors"
					value={colors}
					checked={colors === value}
				/>
				<span
					class="flex h-full flex-col gap-1.5 rounded-2xl border-2 border-transparent bg-(--canvas) p-2 peer-checked:border-(--accent) peer-focus-visible:ring-2 dark:bg-(--canvas-night) dark:peer-checked:border-(--accent-night)"
				>
					<span class="h-6 rounded-lg bg-(--hero-bg) dark:bg-(--hero-bg-night)"></span>
					<span class="flex items-center gap-1.5">
						<span class="h-4 flex-1 rounded-md bg-(--surface) dark:bg-(--surface-night)"></span>
						<span class="h-4 w-4 rounded-full bg-(--accent) dark:bg-(--accent-night)"></span>
					</span>
					<span class="text-center text-xs text-(--ink) dark:text-(--ink-night)">
						{themeLabels[colors]()}
					</span>
				</span>
			</label>
		{/each}
	</div>
</fieldset>
