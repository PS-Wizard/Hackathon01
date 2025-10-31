import { createPocketBase } from "$lib/utils/pocketbase";
import type { Handle } from "@sveltejs/kit";
import { env } from "$env/dynamic/private";

export const handle: Handle = async ({ event, resolve }) => {
    event.locals.pb = createPocketBase();

    // Authenticate as superuser
    await event.locals.pb.collection('_superusers').authWithPassword(
        env.PB_ADMIN_EMAIL,
        env.PB_ADMIN_PASSWORD
    );

    return resolve(event);
}
