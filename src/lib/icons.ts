// The app's icons by meaning: one family (Tabler, outline), one place to swap them.
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

export const icons = {
	add: IconPlus,
	addMember: IconUserPlus,
	balances: IconScale,
	delete: IconTrash,
	edit: IconPencil,
	expense: IconReceipt,
	group: IconUsersGroup,
	identity: IconUserCircle,
	member: IconUser,
	newLink: IconRefresh,
	share: IconShare
};

export type IconName = keyof typeof icons;
