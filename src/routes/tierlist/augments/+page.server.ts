import type { PageServerLoad } from './$types';
import augmentsData from '$data/academy-augments.json';

export const load: PageServerLoad = async () => {
  return {
    augments: augmentsData || { silver: {}, gold: {}, prismatic: {} }
  };
};
