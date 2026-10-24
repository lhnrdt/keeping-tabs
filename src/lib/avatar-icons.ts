// The drawings for the avatar icons (#61), from the app's icon family (Tabler).
import IconBike from '@tabler/icons-svelte-runes/icons/bike';
import IconButterfly from '@tabler/icons-svelte-runes/icons/butterfly';
import IconCactus from '@tabler/icons-svelte-runes/icons/cactus';
import IconCampfire from '@tabler/icons-svelte-runes/icons/campfire';
import IconCat from '@tabler/icons-svelte-runes/icons/cat';
import IconCloud from '@tabler/icons-svelte-runes/icons/cloud';
import IconCoffee from '@tabler/icons-svelte-runes/icons/coffee';
import IconDeer from '@tabler/icons-svelte-runes/icons/deer';
import IconDog from '@tabler/icons-svelte-runes/icons/dog';
import IconFeather from '@tabler/icons-svelte-runes/icons/feather';
import IconFish from '@tabler/icons-svelte-runes/icons/fish';
import IconFlower from '@tabler/icons-svelte-runes/icons/flower';
import IconLeaf from '@tabler/icons-svelte-runes/icons/leaf';
import IconMoon from '@tabler/icons-svelte-runes/icons/moon';
import IconMountain from '@tabler/icons-svelte-runes/icons/mountain';
import IconMushroom from '@tabler/icons-svelte-runes/icons/mushroom';
import IconPaw from '@tabler/icons-svelte-runes/icons/paw';
import IconPlant from '@tabler/icons-svelte-runes/icons/plant';
import IconSailboat from '@tabler/icons-svelte-runes/icons/sailboat';
import IconSnowflake from '@tabler/icons-svelte-runes/icons/snowflake';
import IconSun from '@tabler/icons-svelte-runes/icons/sun';
import IconTent from '@tabler/icons-svelte-runes/icons/tent';
import IconTree from '@tabler/icons-svelte-runes/icons/tree';
import IconTrees from '@tabler/icons-svelte-runes/icons/trees';
import type { AvatarIcon } from './avatars';

export const avatarIcons: Record<AvatarIcon, typeof IconTree> = {
	trees: IconTrees,
	tree: IconTree,
	plant: IconPlant,
	leaf: IconLeaf,
	mushroom: IconMushroom,
	mountain: IconMountain,
	feather: IconFeather,
	fish: IconFish,
	butterfly: IconButterfly,
	flower: IconFlower,
	cactus: IconCactus,
	snowflake: IconSnowflake,
	sun: IconSun,
	moon: IconMoon,
	cloud: IconCloud,
	coffee: IconCoffee,
	campfire: IconCampfire,
	tent: IconTent,
	sailboat: IconSailboat,
	bike: IconBike,
	paw: IconPaw,
	cat: IconCat,
	dog: IconDog,
	deer: IconDeer
};
