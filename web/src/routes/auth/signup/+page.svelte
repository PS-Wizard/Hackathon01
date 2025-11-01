<script lang="ts">
    import { enhance } from "$app/forms";
    import { BadgeCheck, CircleAlert, Loader } from "@lucide/svelte";

    let { form } = $props();
    let step = $state<"register" | "verify" | "totp">("register");
    let isRegistering = $state(false); 

    $effect(() => {
        if (form?.success) step = "verify";
        if (form?.verified) step = "totp";
    });

    function downloadVoterCard() {
        if (!form?.identityExport || !form?.commitment) return;
        const content = `${form.identityExport};${form.commitment}`;
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "voter_card.key";
        a.click();
        URL.revokeObjectURL(url);
    }
</script>

<div class="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-base-100">
    <div class="hidden lg:block relative">
        <img
            src="https://blobcdn.same.energy/a/f6/fa/f6faf0e23cb409a85fe6f986bc298bab27531486"
            alt="Voting illustration"
            class="absolute inset-0 w-full h-full object-cover"
        />
        <div
            class="absolute inset-0 bg-gradient-to-t from-base-100/40 to-transparent"
        ></div>
    </div>
    <div class="flex flex-col items-center justify-center p-8">
        <div class="w-full max-w-md space-y-8">
            {#if step === "register"}
                <section class="space-y-6">
                    <h1 class="text-5xl uppercase">Register to Vote</h1>
                    <form
                        method="POST"
                        action="?/register"
                        use:enhance={() => {
                            isRegistering = true; 
                            return async ({ update }) => {
                                await update();
                                isRegistering = false; 
                            };
                        }}
                        class="space-y-4"
                    >
                        <input
                            type="text"
                            name="citizenshipId"
                            placeholder="Citizenship ID"
                            class="input input-bordered w-full"
                            required
                            disabled={isRegistering}
                        />
                        <input
                            type="text"
                            name="voterCardId"
                            placeholder="Voter Card ID"
                            class="input input-bordered w-full"
                            required
                            disabled={isRegistering}
                        />
                        <input
                            type="email"
                            name="email"
                            placeholder="youremail@provider.com"
                            class="input input-bordered w-full"
                            required
                            disabled={isRegistering}
                        />

                        {#if form?.error}
                            <div class="alert alert-error text-sm">
                                <CircleAlert class="w-5 h-5" />
                                <span>{form.error}</span>
                            </div>
                        {/if}
                        <button
                            type="submit"
                            class="btn btn-primary w-full"
                            disabled={isRegistering}
                        >
                            {#if isRegistering}
                                <Loader class="w-5 h-5 animate-spin" />
                                Sending...
                            {:else}
                                Send Verification Code
                            {/if}
                        </button>
                    </form>
                </section>
            {/if}

            {#if step === "verify"}
                <section class="space-y-6">
                    <h1 class="text-3xl text-primary">Enter Code</h1>
                    <p class="text-sm opacity-70">
                        Check your email for the 6-digit code
                    </p>
                    <form
                        method="POST"
                        action="?/verify"
                        use:enhance
                        class="space-y-4"
                    >
                        <input
                            type="text"
                            name="code"
                            placeholder="000000"
                            maxlength="6"
                            class="input input-bordered input-lg w-full text-center text-2xl tracking-widest font-mono"
                            required
                        />

                        {#if form?.verifyError}
                            <div class="alert alert-error text-sm">
                                <CircleAlert class="w-5 h-5" />
                                <span>{form.verifyError}</span>
                            </div>
                        {/if}
                        <button type="submit" class="btn btn-primary w-full"
                            >Verify Code</button
                        >
                    </form>
                </section>
            {/if}

            {#if step === "totp"}
                <section class="space-y-8">
                    <div class="flex items-center gap-2">
                        <BadgeCheck class="w-6 h-6 text-success" />
                        <h2 class="text-2xl font-semibold">
                            Registration Complete
                        </h2>
                    </div>
                    <div class="space-y-4">
                        <div>
                            <p class="text my-4">
                                Use Google Authenticator, Authy, or any TOTP app
                            </p>

                            {#if form?.qrCodeUri}
                                <div class="flex justify-center items-center">
                                    <img
                                        src="https://api.qrserver.com/v1/create-qr-code/?size=240x240&data={encodeURIComponent(
                                            form.qrCodeUri,
                                        )}"
                                        alt="TOTP QR"
                                        class="w-62 h-62"
                                    />
                                </div>
                            {/if}
                        </div>
                        <div>
                            <div class="alert alert-warning text-sm mb-4">
                                <CircleAlert class="w-5 h-5" />
                                <div>
                                    <strong
                                        >Without this file, you cannot vote.</strong
                                    ><br />
                                    <span>Keep it safe. Never share it.</span>
                                </div>
                            </div>
                            <button
                                onclick={downloadVoterCard}
                                class="btn btn-primary w-full gap-2"
                            >
                                Download voter_card.key
                            </button>
                        </div>
                        <div
                            class="bg-success/10 border border-success rounded-box"
                        ></div>
                    </div>
                </section>
            {/if}
        </div>
    </div>
</div>
