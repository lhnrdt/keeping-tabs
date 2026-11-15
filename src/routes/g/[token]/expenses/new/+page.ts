import { expenseFormLoad } from '#lib/group/expense-form-load.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ data, parent, fetch }) => expenseFormLoad(data, parent, fetch);
