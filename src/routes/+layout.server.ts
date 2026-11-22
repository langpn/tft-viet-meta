import type { LayoutServerLoad } from './$types';
import { CURRENT_SET } from '$server/site-meta';

export const load: LayoutServerLoad = () => ({ currentSet: CURRENT_SET });
