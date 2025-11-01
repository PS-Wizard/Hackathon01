import type { PageServerLoad } from "./$types";

export const load: PageServerLoad = async ({ locals }) => {
    const elections = await locals.pb.collection('elections').getFullList();
    return {
        elections
    }
}
