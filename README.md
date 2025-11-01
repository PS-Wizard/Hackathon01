# 🗳️ Zero-Knowledge Voting System

A privacy-preserving, anonymous voting platform built with **Semaphore Protocol** that enables verifiable elections without compromising voter anonymity.

## 🎯 Overview

This system allows eligible voters to cast votes anonymously while maintaining complete auditability and preventing double-voting. It uses zero-knowledge proofs to prove eligibility without revealing identity.

### Key Features

- ✅ **Complete Anonymity** - Votes cannot be linked to voters, even by administrators
- ✅ **Verifiable Integrity** - Every vote is cryptographically provable
- ✅ **Double-Vote Prevention** - Cryptographic nullifiers prevent voting twice
- ✅ **Tamper-Evident** - Hash-chain structure makes vote manipulation detectable
- ✅ **2FA Security** - TOTP authentication for voter verification

## 🏗️ Architecture

### Core Technologies

- **[Semaphore Protocol](https://semaphore.appliedzkp.org/)** - Zero-knowledge proof framework
- **SvelteKit** - Full-stack web framework
- **PocketBase** - Backend database
- **Node.js** - Server runtime
- **Nodemailer** - Email verification system

### Cryptographic Components

1. **Identity Commitment** - Public hash representing voter eligibility
2. **Merkle Tree** - Efficient group membership verification structure
3. **Zero-Knowledge Proofs** - Prove eligibility without revealing identity
4. **Nullifier Hash** - Unique anonymous receipt preventing double-voting
5. **Hash Chain** - Blockchain-inspired tamper detection

## 🔐 How It Works

### Registration Flow

```
User Input → Email Verification → TOTP Setup → Identity Generation → Voter Card Download
```

1. **User Registration**
   - User provides Citizenship ID, Voter Card ID, and Email
   - System validates against `mock_already_registered` database
   - 6-digit OTP sent via email

2. **Email Verification**
   - User enters OTP code
   - System validates and proceeds to TOTP setup

3. **Identity Generation**
   ```javascript
   const identity = new Identity();
   const commitment = identity.commitment.toString();
   ```
   - Creates cryptographic identity (secret)
   - Generates commitment (public hash)
   - Creates TOTP secret for 2FA

4. **Voter Card Download**
   - User downloads `voter_card.key` containing:
     ```
     <identity_export>;<commitment>
     ```
   - **CRITICAL**: Without this file, voting is impossible
   - Commitment stored in `registered_users` database

### Voting Flow

```
Candidate Selection → Upload Voter Card → TOTP Verification → ZK Proof Generation → Vote Cast
```

1. **Candidate Selection**
   - User browses active elections
   - Selects a candidate

2. **Identity Verification**
   - User uploads `voter_card.key`
   - System parses: `identityExport` and `commitment`
   - Validates commitment exists in database
   - Verifies TOTP code from authenticator app

3. **Merkle Tree Construction**
   ```javascript
   const group = new Group();
   allUsers.forEach((u) => {
       group.addMember(BigInt(u.commitment));
   });
   ```
   - System builds Merkle tree of all registered voters
   - Tree root represents the entire voter registry

4. **Zero-Knowledge Proof Generation**
   ```javascript
   const proof = await generateProof(
       identity,      // Secret voter identity
       group,         // Merkle tree of all voters
       candidateId,   // Vote choice (message)
       electionId     // Election scope
   );
   ```
   
   **The proof proves:**
   - ✅ "I'm in the registered voters Merkle tree"
   - ✅ "I haven't voted in this election before"
   - ✅ "This is my vote for candidate X"
   
   **Without revealing:**
   - ❌ Which voter you are
   - ❌ Your identity or commitment
   - ❌ Any link between you and your vote

5. **Double-Vote Prevention**
   ```javascript
   const nullifierHash = proof.nullifier.toString();
   ```
   - Nullifier is deterministic: `hash(identity + election_scope)`
   - System checks if nullifier exists in `votes` table
   - If exists → **Vote rejected** (already voted)
   - If new → Vote proceeds

6. **Hash Chain Recording**
   ```javascript
   const previousHash = lastVote.current_hash || '0'.repeat(64);
   const currentHash = sha256(voteData + previousHash);
   ```
   - Each vote links to previous vote's hash
   - Creates tamper-evident chain
   - Any modification breaks all subsequent hashes

## 📊 Database Schema

### `registered_users`
- `commitment` (string) - Public identity hash
- `totp_secret` (string) - 2FA secret

### `elections`
- `title` (string)
- `start` (datetime)
- `end` (datetime)
- `status` (string) - "pending" | "active" | "closed"
- `merkle_root` (string)

### `candidates`
- `name` (string)
- `party` (string)
- `bio` (text)
- `profile` (file)
- `election_id` (relation)

### `votes`
- `nullifier` (string) - Anonymous vote receipt
- `candidate_id` (relation)
- `election_id` (relation)
- `merkle_root` (string) - Snapshot of voter registry
- `proof` (json) - ZK proof data
- `previous_hash` (string) - Link to previous vote
- `current_hash` (string) - Current vote hash

### `mock_already_registered`
- `citizen_id` (string)
- `voter_card_id` (string)
- `full_name` (string)
- `mail` (string)
- `otp` (number) - Temporary verification code

## 🚀 Setup & Installation

### Prerequisites

```bash
node >= 18.x
npm or pnpm
```

### Environment Variables

Create `.env` file:

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
SMTP_FROM=noreply@yourdomain.com

# PocketBase
PUBLIC_POCKETBASE_URL=http://127.0.0.1:8090
```

### Installation

```bash
# Install dependencies
npm install

# Start PocketBase (in separate terminal)
./pocketbase serve

# Run development server
npm run dev
```

### Setting Up PocketBase

1. Navigate to `http://127.0.0.1:8090/_/`
2. Create admin account
3. Import collections schema (provided in `/pocketbase-schema`)
4. Populate `mock_already_registered` with test data

## 🔒 Security Considerations

### What's Protected

✅ **Voter Anonymity** - Zero-knowledge proofs ensure votes cannot be traced
✅ **Double-Voting** - Nullifiers cryptographically prevent voting twice
✅ **Vote Integrity** - Hash chain detects any tampering
✅ **Eligibility** - Only registered commitments can generate valid proofs

### What's NOT Protected (Current Limitations)

⚠️ **Coercion Resistance** - System cannot prevent forced voting under duress
⚠️ **Receipt-Freeness** - Voter can prove how they voted (nullifier serves as receipt)
⚠️ **Network Privacy** - IP addresses could theoretically be logged
⚠️ **Voter Card Security** - If `voter_card.key` is stolen, attacker can vote

### Best Practices

1. **Never share your `voter_card.key`** - Treat it like a password
2. **Secure your TOTP device** - Two-factor authentication is critical
3. **Use HTTPS in production** - Encrypt all communications
4. **Regularly audit votes** - Verify hash chain integrity
5. **Implement rate limiting** - Prevent brute-force attacks

## 🧪 Testing the System

### Test Registration

```javascript
// Test voter credentials
Citizenship ID: TEST123456
Voter Card ID: VC789012
Email: test@example.com
```

### Test Voting Flow

1. Complete registration process
2. Download and save `voter_card.key`
3. Set up TOTP in authenticator app
4. Navigate to active election
5. Select candidate
6. Upload voter card + enter TOTP
7. Verify vote recorded with nullifier hash

## 📈 Scaling Considerations

### Merkle Tree Performance

- Current implementation rebuilds tree on every vote
- **Optimization**: Cache tree structure, only update on new registrations
- Merkle proofs are O(log n), scales well to millions of voters

### Vote Storage

- Hash chain requires sequential writes
- **Optimization**: Batch votes, periodic chain checkpoints
- Consider sharding by election for parallel processing

### Zero-Knowledge Proof Generation

- Proof generation is computationally intensive (~2-5 seconds)
- Happens client-side in production implementations
- **Optimization**: Use WASM for faster browser-based proving

## 🛠️ Tech Stack Details

```javascript
// Core Dependencies
"@semaphore-protocol/identity"  // Identity generation
"@semaphore-protocol/group"     // Merkle tree management
"@semaphore-protocol/proof"     // ZK proof generation/verification
"otpauth"                        // TOTP 2FA
"nodemailer"                     // Email delivery
"pocketbase"                     // Backend database
```

## 📚 Additional Resources

- [Semaphore Documentation](https://semaphore.appliedzkp.org/)
- [Zero-Knowledge Proofs Explained](https://z.cash/technology/zksnarks/)
- [Merkle Trees Overview](https://en.wikipedia.org/wiki/Merkle_tree)
- [TOTP RFC 6238](https://datatracker.ietf.org/doc/html/rfc6238)

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

## 📄 License

This project is licensed under the MIT License.

## ⚠️ Disclaimer

This is a proof-of-concept voting system. Before deploying in production for real elections:

- Conduct thorough security audits
- Implement additional coercion resistance measures
- Add network-level anonymity (Tor, mixnets)
- Ensure compliance with election regulations
- Test extensively with adversarial scenarios

---

**Built with privacy in mind. Vote freely, vote anonymously.** 🗳️🔒
