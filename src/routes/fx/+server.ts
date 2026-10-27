// The rate for the expense form (#54): GET /fx?from=JPY&to=EUR&date=2026-10-27
import { json } from '@sveltejs/kit';
import { formatRate } from '#lib/expense/exchange.ts';
import { rateFor } from '#lib/server/rates.ts';
import type { RequestHandler } from './$types';

const CODE = /^[A-Z]{3}$/;

export const GET: RequestHandler = async ({ url }) => {
	const from = url.searchParams.get('from') ?? '';
	const to = url.searchParams.get('to') ?? '';
	if (!CODE.test(from) || !CODE.test(to)) return json({ rate: null }, { status: 400 });
	const rate = await rateFor(from, to, url.searchParams.get('date') ?? '');
	return json({ rate: rate === null ? null : formatRate(rate) });
};
