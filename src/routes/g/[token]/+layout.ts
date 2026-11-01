import { openedLoad } from '#lib/crypto/open-data.ts';
import type { LayoutLoad } from './$types';

export const load: LayoutLoad = ({ data }) => openedLoad(data);
