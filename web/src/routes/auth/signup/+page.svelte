<script lang="ts">
    import { enhance } from "$app/forms";
    let { form }: { form: Record<string, any> | null } = $props();
    let step = $state<"register" | "verify" | "totp">("register");

    $effect(() => {
        if (form?.success) {
            step = "verify";
        }
        if (form?.verified && form?.qrCodeUri) {
            step = "totp";
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
            <p style="color: red;">{form.error}</p>
        {/if}
        <button type="submit">Send Code</button>
    </form>
{:else if step === "verify"}
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
            <p style="color: red;">{form.verifyError}</p>
        {/if}
        <button type="submit">Verify</button>
    </form>
{:else if step === "totp"}
    <h1>Scan TOTP QR Code</h1>
    <p>Scan this with Google Authenticator or any TOTP app:</p>
    {#if form?.qrCodeUri}
        <img
            src="https://api.qrserver.com/v1/create-qr-code/?size=300x300&data={encodeURIComponent(
                form.qrCodeUri,
            )}"
            alt="TOTP QR Code"
            style="border: 2px solid black;"
        />
        <p style="margin-top: 20px;">Registration complete!</p>
    {/if}
{/if}
