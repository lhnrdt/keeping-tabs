// The app's icons by meaning: one family (Tabler, outline), one place to swap them.
import IconCopy from '@tabler/icons-svelte-runes/icons/copy';
import IconCash from '@tabler/icons-svelte-runes/icons/cash';
import IconPencil from '@tabler/icons-svelte-runes/icons/pencil';
import IconPlus from '@tabler/icons-svelte-runes/icons/plus';
import IconReceipt from '@tabler/icons-svelte-runes/icons/receipt';
import IconRefresh from '@tabler/icons-svelte-runes/icons/refresh';
import IconScale from '@tabler/icons-svelte-runes/icons/scale';
import IconShare from '@tabler/icons-svelte-runes/icons/share';
import IconTrash from '@tabler/icons-svelte-runes/icons/trash';
import IconUser from '@tabler/icons-svelte-runes/icons/user';
import IconUserCircle from '@tabler/icons-svelte-runes/icons/user-circle';
import IconUserPlus from '@tabler/icons-svelte-runes/icons/user-plus';
import IconUsersGroup from '@tabler/icons-svelte-runes/icons/users-group';
import IconX from '@tabler/icons-svelte-runes/icons/x';

export const icons = {
	add: IconPlus,
	addMember: IconUserPlus,
	copy: IconCopy,
	balances: IconScale,
	delete: IconTrash,
	edit: IconPencil,
	expense: IconReceipt,
	group: IconUsersGroup,
	identity: IconUserCircle,
	member: IconUser,
	payment: IconCash,
	newLink: IconRefresh,
	remove: IconX,
	share: IconShare
};

export type IconName = keyof typeof icons;
