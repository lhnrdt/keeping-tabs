// One line per change in a group's activity (#43): "Anna added “Pizza”".
import { m } from '#lib/paraglide/messages.js';
import type { ActivityItem } from '#lib/server/activity.ts';

type Item = Pick<ActivityItem, 'action' | 'who' | 'entry' | 'name' | 'previousName'>;

export function activityText({ action, who: by, entry, name, previousName }: Item): string {
	const who = by ?? m.activity_someone();
	const title = entry?.title ?? '…';
	switch (action) {
		case 'expense.create':
			return m.activity_expense_create({ who, title });
		case 'expense.update':
			return m.activity_expense_update({ who, title });
		case 'expense.delete':
			return m.activity_expense_delete({ who, title });
		case 'expense.restore':
			return m.activity_expense_restore({ who, title });
		case 'payment.create':
			return m.activity_payment_create({ who });
		case 'payment.update':
			return m.activity_payment_update({ who });
		case 'payment.delete':
			return m.activity_payment_delete({ who });
		case 'payment.restore':
			return m.activity_payment_restore({ who });
		case 'member.add':
			return m.activity_member_add({ who, name: name ?? '?' });
		case 'member.rename':
			return m.activity_member_rename({ who, from: previousName ?? '?', to: name ?? '?' });
		case 'member.join':
			return m.activity_member_join({ name: name ?? who });
		case 'member.release':
			return m.activity_member_release({ who });
		case 'member.remove':
			return m.activity_member_remove({ who, name: name ?? '?' });
		case 'group.create':
			return m.activity_group_create({ who });
		case 'group.update':
			return m.activity_group_update({ who });
		case 'group.regenerate_link':
			return m.activity_group_link({ who });
		case 'group.import':
			return m.activity_group_import({ who });
		case 'group.delete':
			return m.activity_group_delete({ who });
		case 'group.restore':
			return m.activity_group_restore({ who });
	}
}
