<script lang="ts">
    import { onMount, tick } from "svelte";
    import { annotate } from "rough-notation";
    import type { RoughAnnotationType } from "rough-notation/lib/model";
    import { fly } from "svelte/transition";

    let headingRef: HTMLHeadingElement | undefined = $state(undefined);
    let paragraphRef: HTMLParagraphElement | undefined = $state(undefined);
    let show = $state(false);

    onMount(async () => {
        show = true;
        await tick();

        if (!headingRef || !paragraphRef) return;

        const circle = annotate(headingRef, {
            type: "underline" as RoughAnnotationType,
            color: "#00ff9d",
            strokeWidth: 3,
            padding: 12,
            animationDuration: 800,
        });

        const mark1 = paragraphRef.querySelector("mark:nth-of-type(1)");
        const mark2 = paragraphRef.querySelector("mark:nth-of-type(2)");

        if (mark1 && mark2) {
            const highlight1 = annotate(mark1 as HTMLElement, {
                type: "highlight" as RoughAnnotationType,
                color: "cyan",
                multiline: true,
                animationDuration: 600,
            });

            const highlight2 = annotate(mark2 as HTMLElement, {
                type: "highlight" as RoughAnnotationType,
                color: "#00ff9d",
                multiline: true,
                animationDuration: 600,
            });

            setTimeout(() => circle.show(), 800);
            setTimeout(() => highlight1.show(), 1200);
            setTimeout(() => highlight2.show(), 1500);
        } else {
            console.error(
                "Could not find required <mark> elements for annotation.",
            );
        }
    });
</script>

{#if show}
    <main class="relative z-10 flex flex-col items-center">
        <section
            class="flex flex-col items-center justify-center h-[80vh] gap-6 px-4 w-full"
        >
            <p class="text border px-4 py-2 rounded-xl">
                Mathematically Backed Votes
            </p>

            <div class="overflow-hidden">
                <h1
                    bind:this={headingRef}
                    class="heading text-[5rem~12rem] uppercase text-center font-semibold"
                    transition:fly={{ y: -300, duration: 500, delay: 500 }}
                >
                    100x Vote
                </h1>
            </div>

            <p
                bind:this={paragraphRef}
                class="text mx-auto max-w-3xl text-center text-lg leading-relaxed"
            >
                Cast your vote without anyone knowing your choice. <mark
                    >Every vote is encrypted,</mark
                >
                verified on a public ledger, and provably counted using
                <mark>zero-knowledge proofs.</mark> Total transparency, zero trust
                required.
            </p>
        </section>
    </main>
{/if}

<style>
    mark {
        background: transparent;
        font-weight: 600;
    }
</style>
