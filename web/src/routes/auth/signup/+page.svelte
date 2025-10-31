<script lang="ts">
    import { enhance } from "$app/forms";

    let { form }: { form: Record<string, any> | null } = $props();

    let step = $state<"register" | "verify">("register");

    $effect(() => {
        if (form?.success) {
            step = "verify";
        }
    });
</script>

{#if step === "register"}
    <h1>Register</h1>
    <form method="POST" action="?/register" use:enhance>
        <input
            type="text"
            name="citizenshipId"
            placeholder="Citizenship ID"
            required
        />
        <input
            type="text"
            name="voterCardId"
            placeholder="Voter Card ID"
            required
        />
        <input
            type="email"
            name="email"
            placeholder="youremail@provider.com"
            required
        />

        {#if form?.error}
            <p>{form.error}</p>
        {/if}

        <button type="submit">Send Code</button>
    </form>
{:else}
    <h1>Verify OTP</h1>
    <form method="POST" action="?/verify" use:enhance>
        <input
            type="text"
            name="code"
            placeholder="6-digit code"
            maxlength="6"
            required
        />

        {#if form?.verifyError}
            <p>{form.verifyError}</p>
        {/if}

        {#if form?.verified}
            <p>Verified!</p>
        {/if}

        <button type="submit">Verify</button>
    </form>
{/if}
