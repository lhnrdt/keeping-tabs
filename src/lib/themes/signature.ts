// The scene that says most about each scenery (#332), where one stands for it, e.g. its icon in
// the scenery picker: the forest's campfire, the fjord's waterfall, the aurora's glass igloos.
import type { GroupKind } from '#lib/group/kinds.ts';
import type { ThemeId } from './palettes';

export const SIGNATURE_SCENE: Record<ThemeId, GroupKind> = {
	forest: 'trip',
	fjord: 'trip',
	mountains: 'other',
	heather: 'other',
	birch: 'home',
	meadow: 'home',
	coast: 'trip',
	aurora: 'home',
	autumn: 'home'
};
