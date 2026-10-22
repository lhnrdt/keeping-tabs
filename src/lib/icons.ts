// The app's icons by meaning: one family (Tabler, outline), one place to swap them.
import IconBed from '@tabler/icons-svelte-runes/icons/bed';
import IconBeer from '@tabler/icons-svelte-runes/icons/beer';
import IconBus from '@tabler/icons-svelte-runes/icons/bus';
import IconFirstAidKit from '@tabler/icons-svelte-runes/icons/first-aid-kit';
import IconGift from '@tabler/icons-svelte-runes/icons/gift';
import IconShoppingBag from '@tabler/icons-svelte-runes/icons/shopping-bag';
import IconShoppingCart from '@tabler/icons-svelte-runes/icons/shopping-cart';
import IconTicket from '@tabler/icons-svelte-runes/icons/ticket';
import IconCar from '@tabler/icons-svelte-runes/icons/car';
import IconConfetti from '@tabler/icons-svelte-runes/icons/confetti';
import IconGlassFull from '@tabler/icons-svelte-runes/icons/glass-full';
import IconHeart from '@tabler/icons-svelte-runes/icons/heart';
import IconHome from '@tabler/icons-svelte-runes/icons/home';
import IconPlane from '@tabler/icons-svelte-runes/icons/plane';
import IconToolsKitchen2 from '@tabler/icons-svelte-runes/icons/tools-kitchen-2';
import IconCopy from '@tabler/icons-svelte-runes/icons/copy';
import IconCash from '@tabler/icons-svelte-runes/icons/cash';
import IconFingerprint from '@tabler/icons-svelte-runes/icons/fingerprint';
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
	passkey: IconFingerprint,
	remove: IconX,
	share: IconShare,
	// Group types (src/lib/group/kinds.ts)
	kindTrip: IconPlane,
	kindHome: IconHome,
	kindPartner: IconHeart,
	kindFriends: IconGlassFull,
	kindFood: IconToolsKitchen2,
	kindEvent: IconConfetti,
	kindCar: IconCar,
	// Expense categories (src/lib/expense/categories.ts)
	categoryGroceries: IconShoppingCart,
	categoryDining: IconToolsKitchen2,
	categoryDrinks: IconBeer,
	categoryTransport: IconBus,
	categoryLodging: IconBed,
	categoryHome: IconHome,
	categoryFun: IconTicket,
	categoryShopping: IconShoppingBag,
	categoryGifts: IconGift,
	categoryHealth: IconFirstAidKit
};

export type IconName = keyof typeof icons;
