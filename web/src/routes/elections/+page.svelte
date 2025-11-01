<script lang="ts">
    let { data } = $props();
    const elections = data?.elections ?? [];
</script>

<div class="h-[80vh] p-8 flex justify-center items-center">
    <div class="max-w-7xl mx-auto">
        <div class="mb-12">
            <h1 class="text-7xl font-semibold uppercase mb-4">Elections</h1>
            <p class="text-xl opacity-70">
                Select an election to cast your vote
            </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {#each elections as election}
                <a
                    href={`/elections/${election.id}`}
                    class="group border-2 border-base-content/10 rounded-2xl p-8 hover:border-base-content/30 transition-all duration-300 hover:shadow-lg bg-base-100"
                >
                    <div class="flex justify-between items-start mb-6">
                        <h2 class="text-5xl font-bold uppercase leading-tight">
                            {election.title}
                        </h2>
                        <span
                            class={`px-4 py-2 text-sm font-bold uppercase border-2 ${
                                election.status === "active"
                                    ? "border-green-500 text-green-500"
                                    : election.status === "pending"
                                      ? "border-yellow-500 text-yellow-500"
                                      : "border-base-content/30 text-base-content/50"
                            }`}
                        >
                            {election.status}
                        </span>
                    </div>

                    <div class="space-y-3 mb-6 text-base-content/70">
                        <div>
                            <p
                                class="text-sm font-semibold uppercase tracking-wide mb-1"
                            >
                                Starts
                            </p>
                            <p class="text-base">
                                {new Date(election.start).toLocaleString()}
                            </p>
                        </div>
                        <div>
                            <p
                                class="text-sm font-semibold uppercase tracking-wide mb-1"
                            >
                                Ends
                            </p>
                            <p class="text-base">
                                {new Date(election.end).toLocaleString()}
                            </p>
                        </div>
                    </div>

                    <div
                        class="flex items-center gap-3 text-xl font-bold uppercase group-hover:gap-4 transition-all"
                    >
                        <span>View Election</span>
                        <span class="text-2xl">↗</span>
                    </div>
                </a>
            {/each}
        </div>
    </div>
</div>
