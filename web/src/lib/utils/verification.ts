import { Identity } from '@semaphore-protocol/identity';
import * as OTPAuth from 'otpauth';

async function verifyVoter(
    identityExport: string,
    commitment: string,
    totpCode: string,
    pb: any
) {
    let identity;
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
        return { valid: false, error: 'User not found' };
    }

    const totp = new OTPAuth.TOTP({
        secret: OTPAuth.Secret.fromBase32(user.totp_secret),
        algorithm: 'SHA1',
        digits: 6,
        period: 30
    });

    const delta = totp.validate({ token: totpCode });
    if (delta === null) {
        return { valid: false, error: 'Invalid or expired TOTP code' };
    }

    return { valid: true, identity, user };
}
