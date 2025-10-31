<script lang="ts">
    import { afterNavigate, beforeNavigate, onNavigate } from "$app/navigation";
    import favicon from "$lib/assets/favicon.svg";
    import Navbar from "$lib/components/Navbar.svelte";
    import "../css/output.css";

    // Grid overlay toggle
    let showGrid = $state(false);

    beforeNavigate(() => {
        document.documentElement.style.cursor = "progress";
        document.body.style.cursor = "progress";
    });

    onNavigate((navigation) => {
        if (!document.startViewTransition) return;
        return new Promise((resolve) => {
            document.startViewTransition(async () => {
                resolve();
                await navigation.complete;
            });
        });
    });

    afterNavigate(() => {
        document.documentElement.style.cursor = "";
        document.body.style.cursor = "";
    });

    // Toggle grid with keyboard shortcut (Ctrl+G or Cmd+G)
    $effect(() => {
        const handleKeyPress = (e: KeyboardEvent) => {
            if (e.key === " ") {
                e.preventDefault();
                showGrid = !showGrid;
            }
        };
        window.addEventListener("keydown", handleKeyPress);
        return () => window.removeEventListener("keydown", handleKeyPress);
    });

    let { children, data } = $props();
</script>

<svelte:head>
    <link rel="icon" href={favicon} />
</svelte:head>

<!-- Grid overlay -->
{#if showGrid}
    <div class="fixed inset-0 pointer-events-none z-[9999] flex justify-center">
        <div class="w-full max-w-screen-2xl">
            <div
                class="grid grid-cols-4 sm:grid-cols-8 lg:grid-cols-12 gap-2 h-screen"
            >
                {#each Array(12) as _, i}
                    <div class="relative hidden lg:block">
                        <div
                            class="absolute inset-0 bg-accent/10 border-x border-accent/30"
                        ></div>
                        <div
                            class="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-mono text-accent bg-base-100/80 px-1 rounded"
                        >
                            {i + 1}
                        </div>
                    </div>
                {/each}
                {#each Array(8) as _, i}
                    <div class="relative hidden sm:block lg:hidden">
                        <div
                            class="absolute inset-0 bg-accent/10 border-x border-accent/30"
                        ></div>
                        <div
                            class="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-mono text-accent bg-base-100/80 px-1 rounded"
                        >
                            {i + 1}
                        </div>
                    </div>
                {/each}
                {#each Array(4) as _, i}
                    <div class="relative block sm:hidden">
                        <div
                            class="absolute inset-0 bg-accent/10 border-x border-accent/30"
                        ></div>
                        <div
                            class="absolute top-2 left-1/2 -translate-x-1/2 text-xs font-mono text-accent bg-base-100/80 px-1 rounded"
                        >
                            {i + 1}
                        </div>
                    </div>
                {/each}
            </div>
        </div>
    </div>
{/if}

<Navbar />
<main class="w-full min-h-screen">
    {@render children?.()}
</main>

<style>
    @view-transition {
        navigation: auto;
    }
    ::view-transition-old(root) {
        animation: 0.6s cubic-bezier(0.4, 0, 0.2, 1) both blur-out;
    }
    ::view-transition-new(root) {
        animation: 0.6s cubic-bezier(0.4, 0, 0.2, 1) both blur-in;
    }
    @keyframes blur-out {
        to {
            filter: blur(20px);
            opacity: 0;
        }
    }
    @keyframes blur-in {
        from {
            filter: blur(20px);
            opacity: 0;
        }
    }

    ::view-transition-group(hero-img) {
        animation-duration: 1s;
        animation-timing-function: ease-in-out();
    }
</style>
