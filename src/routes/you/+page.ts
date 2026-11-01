import { openedLoad } from '#lib/crypto/open-data.ts';
import type { PageLoad } from './$types';

export const load: PageLoad = ({ data }) => openedLoad(data);
