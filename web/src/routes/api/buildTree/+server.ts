import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { Group } from '@semaphore-protocol/group';

export const POST: RequestHandler = async ({ request, locals }) => {
    try {
        const { electionId } = await request.json();

        if (!electionId) {
            return json({ error: 'Election ID required' }, { status: 400 });
        }

        const pb = locals.pb;

        const users = await pb.collection('registered_users').getFullList();

        if (users.length === 0) {
            return json({ error: 'No registered users found' }, { status: 400 });
        }

        const group = new Group();
        users.forEach(user => {
            try {
                group.addMember(BigInt(user.commitment));
            } catch (err) {
                console.error(`Failed to add commitment for user ${user.id}:`, err);
            }
        });

        const merkleRoot = group.root.toString();

        await pb.collection('elections').update(electionId, {
            merkle_root: merkleRoot
        });


        return json({
            success: true,
            root: merkleRoot,
            memberCount: group.size
        });

    } catch (err) {
        console.error('Build tree error:', err);
        return json({
            error: 'Failed to build Merkle tree',
            details: String(err)
        }, { status: 500 });
    }
};
