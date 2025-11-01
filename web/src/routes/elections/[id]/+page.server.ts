import type { PageServerLoad, Actions } from "./$types";
import { fail } from "@sveltejs/kit";
import { Identity } from '@semaphore-protocol/identity';
import { Group } from '@semaphore-protocol/group';
import { generateProof, verifyProof } from '@semaphore-protocol/proof';
import * as OTPAuth from 'otpauth';
import crypto from 'crypto';

export const load: PageServerLoad = async ({ params, locals }) => {
    const electionId = params.id;

    const election = await locals.pb
        .collection("elections")
        .getOne(electionId)
        .catch(() => null);

    if (!election) {
        return {
            status: 404,
            error: new Error("Election not found")
        };
    }

    const candidates = await locals.pb
        .collection("candidates")
        .getFullList({
            filter: `election_id = "${electionId}"`
        });

    return {
        election,
        candidates
    };
};

export const actions: Actions = {
    vote: async ({ request, locals, params }) => {
        const electionId = params.id;
        const data = await request.formData();

        const candidateId = data.get('candidateId')?.toString();
        const voterCardFile = data.get('voterCard') as File;
        const totpCode = data.get('totpCode')?.toString();

        if (!candidateId || !voterCardFile || !totpCode) {
            return fail(400, { error: 'All fields required' });
        }

        try {
            const voterCardText = await voterCardFile.text();
            const [identityExport, commitment] = voterCardText.split(";");

            if (!identityExport || !commitment) {
                return fail(400, { error: 'Invalid voter card format' });
            }

            const verificationResult = await verifyVoter(
                identityExport,
                commitment.trim(),
                totpCode,
                locals.pb
            );

            if (!verificationResult.valid) {
                return fail(401, { error: verificationResult.error });
            }

            const { identity } = verificationResult;


            
            const allUsers = await locals.pb
                .collection('registered_users')
                .getFullList();

            const group = new Group();
            allUsers.forEach((u: any) => {
                group.addMember(BigInt(u.commitment));
            });

            const election = await locals.pb.collection('elections').getOne(electionId);


            const proof = await generateProof(
                identity!,
                group,
                candidateId,
                electionId
            );

            const isValidProof = await verifyProof(proof);

            if (!isValidProof) {
                return fail(500, { error: 'Generated proof is invalid' });
            }


            const nullifierHash = proof.nullifier.toString();

            const duplicateVote = await locals.pb
                .collection('votes')
                .getFirstListItem(
                    `nullifier="${nullifierHash}" && election_id="${electionId}"`
                )
                .catch(() => null);

            if (duplicateVote) {
                return fail(400, { error: 'You have already voted in this election' });
            }

            const lastVote = await locals.pb
                .collection('votes')
                .getList(1, 1, {
                    sort: '-created',
                    filter: `election_id="${electionId}"`
                })
                .catch(() => ({ items: [] }));

            const previousHash = lastVote.items[0]?.current_hash || '0'.repeat(64);

            const voteData = JSON.stringify({
                nullifier: nullifierHash,
                candidate: candidateId,
                timestamp: new Date().toISOString()
            });

            const currentHash = crypto
                .createHash('sha256')
                .update(voteData + previousHash)
                .digest('hex');

            await locals.pb.collection('votes').create({
                nullifier: nullifierHash,
                candidate_id: candidateId,
                election_id: electionId,
                merkle_root: election.merkle_root,
                proof: JSON.stringify({
                    merkleTreeDepth: proof.merkleTreeDepth,
                    merkleTreeRoot: proof.merkleTreeRoot.toString(),
                    nullifier: nullifierHash,
                    message: proof.message.toString(),
                    scope: proof.scope.toString()
                }),
                previous_hash: previousHash,
                current_hash: currentHash
            });


            return {
                success: true,
                nullifier: nullifierHash
            };

        } catch (err: any) {
            console.error('Vote error:', err);
            return fail(500, {
                error: err.message || 'Failed to process vote'
            });
        }
    }
};

async function verifyVoter(
    identityExport: string,
    commitment: string,
    totpCode: string,
    pb: any
) {
    let identity: Identity;
    try {
        identity = Identity.import(identityExport);
        if (identity.commitment.toString() !== commitment) {
            return { valid: false, error: 'Commitment mismatch — key tampered' };
        }
    } catch (e) {
        return { valid: false, error: 'Invalid identity export' };
    }

    let user;
    try {
        user = await pb.collection('registered_users').getFirstListItem(
            `commitment="${commitment}"`
        );
    } catch (e) {
        return { valid: false, error: 'User not found - you may not be registered' };
    }

    const totp = new OTPAuth.TOTP({
        secret: OTPAuth.Secret.fromBase32(user.totp_secret),
        algorithm: 'SHA1',
        digits: 6,
        period: 30
    });

    const delta = totp.validate({ token: totpCode, window: 1 });

    if (delta === null) {
        return { valid: false, error: 'Invalid or expired TOTP code' };
    }

    return { valid: true, identity, user };
}
