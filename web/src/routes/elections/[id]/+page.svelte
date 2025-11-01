<script lang="ts">
    import { PUBLIC_POCKETBASE_URL } from "$env/static/public";
    import { enhance } from "$app/forms";

    let { data, form } = $props();
    const { election, candidates } = data;

    let selectedCandidate = $state<string>("");
    let totpCode = $state<string>("");
    let step = $state<"select" | "verify" | "success">("select");

    $effect(() => {
        if (form?.success) {
            step = "success";
        }
    });

    function getImageUrl(record: any, filename: string) {
        return `${PUBLIC_POCKETBASE_URL}/api/files/${record.collectionId}/${record.id}/${filename}`;
    }

    function proceedToVerify() {
        if (!selectedCandidate) {
            alert("Please select a candidate");
            return;
        }
        step = "verify";
    }

    function backToSelect() {
        step = "select";
        totpCode = "";
    }
</script>

<div class="min-h-screen p-8">
    <div class="max-w-6xl mx-auto">
        <!-- Election Header -->
        <div class="mb-12">
            <h1 class="text-7xl font-semibold uppercase mb-4">
                {election?.title}
            </h1>
            <div class="flex gap-6 text-lg opacity-70 mb-4">
                <span>Starts: {new Date(election?.start).toLocaleString()}</span
                >
                <span>Ends: {new Date(election?.end).toLocaleString()}</span>
            </div>
            <span
                class="px-4 py-2 border-2 border-green-500 text-green-500 text-sm font-bold uppercase"
            >
                {election?.status}
            </span>
        </div>

        {#if step === "success"}
            <div class="border-2 border-green-500 rounded-2xl p-12 text-center">
                <h2 class="text-5xl font-bold uppercase mb-4">
                    Vote Recorded!
                </h2>
                <p class="text-xl mb-8 opacity-70">
                    Your vote has been submitted anonymously and securely.
                </p>
                {#if form?.nullifier}
                    <div class="my-8">
                        <p
                            class="text-sm font-bold uppercase tracking-wide mb-4"
                        >
                            Blockchain Receipt
                        </p>
                        <div
                            class="border-2 border-base-content/10 rounded-xl p-6 font-mono text-sm break-all bg-base-200"
                        >
                            <p class="font-bold mb-2">Nullifier Hash:</p>
                            <p>{form.nullifier}</p>
                        </div>
                    </div>
                {/if}
            </div>
        {:else if step === "select"}
            <!-- Step 1: Select Candidate -->
            <div class="mb-8">
                <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    {#each candidates as candidate}
                        <label class="cursor-pointer">
                            <input
                                type="radio"
                                name="candidate"
                                value={candidate.id}
                                bind:group={selectedCandidate}
                                class="hidden peer"
                            />
                            <div
                                class="border-2 border-base-content/10 rounded-2xl p-6 peer-checked:border-base-content peer-checked:bg-base-content/5 hover:border-base-content/30 transition-all"
                            >
                                <div class="flex items-center gap-6 mb-4">
                                    <img
                                        src={getImageUrl(
                                            candidate,
                                            candidate.profile,
                                        )}
                                        alt={candidate.name}
                                        class="w-24 h-24 rounded-full object-cover border-2 border-base-content/20"
                                    />
                                    <div>
                                        <h3
                                            class="font-bold text-2xl uppercase mb-1"
                                        >
                                            {candidate.name}
                                        </h3>
                                        <p class="text-base opacity-70">
                                            {candidate.party}
                                        </p>
                                    </div>
                                </div>
                                {#if candidate.bio}
                                    <p
                                        class="text-base opacity-70 leading-relaxed"
                                    >
                                        {candidate.bio}
                                    </p>
                                {/if}
                            </div>
                        </label>
                    {/each}
                </div>

                <button
                    onclick={proceedToVerify}
                    disabled={!selectedCandidate}
                    class="w-full border-2 border-base-content px-8 py-6 rounded-xl font-bold uppercase text-xl hover:bg-base-content hover:text-base-100 transition-all disabled:opacity-30 disabled:cursor-not-allowed disabled:hover:bg-transparent disabled:hover:text-base-content"
                >
                    Continue to Verification
                </button>
            </div>
        {:else if step === "verify"}
            <!-- Step 2: Verify Identity & Submit -->
            <form
                method="POST"
                action="?/vote"
                enctype="multipart/form-data"
                use:enhance
                class="space-y-8"
            >
                <input
                    type="hidden"
                    name="candidateId"
                    value={selectedCandidate}
                />

                <div class="border-2 border-base-content/10 rounded-2xl p-8">
                    <h2 class="text-4xl font-bold uppercase mb-4">
                        Verify Your Identity
                    </h2>
                    <p class="text-lg opacity-70 mb-8">
                        Upload your voter card and enter your authenticator code
                    </p>

                    <!-- Upload Voter Card -->
                    <div class="mb-6">
                        <label class="block mb-3">
                            <span
                                class="text-sm font-bold uppercase tracking-wide"
                                >1. Upload voter_card.key</span
                            >
                        </label>
                        <input
                            type="file"
                            name="voterCard"
                            accept=".key"
                            required
                            class="w-full border-2 border-base-content/10 rounded-xl px-4 py-4 hover:border-base-content/30 transition-all file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:font-bold file:bg-base-content file:text-base-100 file:cursor-pointer"
                        />
                    </div>

                    <!-- TOTP Code -->
                    <div class="mb-6">
                        <label class="block mb-3">
                            <span
                                class="text-sm font-bold uppercase tracking-wide"
                                >2. Enter Authenticator Code</span
                            >
                        </label>
                        <input
                            type="text"
                            name="totpCode"
                            bind:value={totpCode}
                            placeholder="000000"
                            maxlength="6"
                            required
                            class="w-full border-2 border-base-content/10 rounded-xl px-4 py-6 text-center tracking-widest font-mono text-3xl hover:border-base-content/30 focus:border-base-content focus:outline-none transition-all"
                        />
                        <p class="text-sm opacity-70 mt-2">
                            Open your authenticator app to get the code
                        </p>
                    </div>

                    {#if form?.error}
                        <div
                            class="border-2 border-red-500 rounded-xl p-4 mb-6 bg-red-500/10"
                        >
                            <span class="text-red-500 font-bold"
                                >{form.error}</span
                            >
                        </div>
                    {/if}

                    <div class="flex gap-4 justify-end">
                        <button
                            type="button"
                            onclick={backToSelect}
                            class="border-2 border-base-content/30 px-8 py-4 rounded-xl font-bold uppercase hover:border-base-content transition-all"
                        >
                            ← Back
                        </button>
                        <button
                            type="submit"
                            class="border-2 border-base-content px-8 py-4 rounded-xl font-bold uppercase hover:bg-base-content hover:text-base-100 transition-all"
                        >
                            Cast Vote
                        </button>
                    </div>
                </div>

                <div
                    class="border-2 border-blue-500/30 rounded-2xl p-6 bg-blue-500/5"
                >
                    <div class="flex gap-4">
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            fill="none"
                            viewBox="0 0 24 24"
                            class="stroke-current shrink-0 w-8 h-8"
                        >
                            <path
                                stroke-linecap="round"
                                stroke-linejoin="round"
                                stroke-width="2"
                                d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                            ></path>
                        </svg>
                        <div>
                            <p class="font-bold text-lg mb-2">
                                Your vote is completely anonymous
                            </p>
                            <p class="opacity-70">
                                Zero-knowledge proofs ensure your identity
                                remains private while proving you're eligible to
                                vote.
                            </p>
                        </div>
                    </div>
                </div>
            </form>
        {/if}
    </div>
</div>
