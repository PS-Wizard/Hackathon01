<script lang="ts">
    import { onMount } from "svelte";
    let activeIndex = 0;
    let indicatorStyle = "";
    let navItems: HTMLElement[] = [];
    const items = [
        { label: "100xVoting", href: "/" },
        { label: "Register", href: "/auth/signup" },
        { label: "Vote", href: "/elections" },
    ];
    function updateIndicator(index: number) {
        if (navItems[index]) {
            const item = navItems[index];
            const left = item.offsetLeft;
            const width = item.offsetWidth;
            indicatorStyle = `left: ${left}px; width: ${width}px;`;
            activeIndex = index;
        }
    }
    onMount(() => {
        const currentPath = window.location.pathname;
        const currentIndex = items.findIndex(
            (item) => item.href === currentPath,
        );
        if (currentIndex !== -1) {
            setTimeout(() => updateIndicator(currentIndex), 0);
        }

        const handleResize = () => {
            updateIndicator(activeIndex);
        };
        window.addEventListener("resize", handleResize);
        return () => window.removeEventListener("resize", handleResize);
    });
</script>

<nav
    class="fixed bottom-4 left-1/2 -translate-x-1/2 rounded-2xl shadow-lg bg-black/90 z-[9999] px-6 py-3 flex justify-between items-center min-w-[360px] max-w-[480px]"
    style="view-transition-name: navbar;"
>
    <!-- Sliding indicator at the very bottom -->
    <div
        class="absolute bottom-0 left-0 h-1 bg-white rounded-full transition-all duration-300 ease-out"
        style={indicatorStyle}
    ></div>
    {#each items as item, i}
        <a
            bind:this={navItems[i]}
            href={item.href}
            class="uppercase font-bold relative z-10 transition-colors duration-200 hover:text-gray-300 text-xs sm:text-sm md:text-base"
            class:text-white={activeIndex === i}
            class:text-gray-400={activeIndex !== i}
            on:mouseenter={() => updateIndicator(i)}
            on:click={() => updateIndicator(i)}
        >
            <span>{item.label}</span>
        </a>
    {/each}
</nav>

<style>
    a {
        position: relative;
        padding: 0.5rem 0;
    }
</style>
