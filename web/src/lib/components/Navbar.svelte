<script lang="ts">
</script>

<nav class="bg-base-100 py-8" style="view-transition-name: navbar-transition;">
    <div class="container-grid">
        <div class="grid-12">
            <!-- Logo -->
            <div class="col-span-2 items-center sm:col-span-4 lg:col-span-3">
                <a class="geist uppercase text-xl font-semibold" href="/">
                    TODO
                </a>
            </div>
            <!-- Nav links -->
            <div class="hidden lg:col-span-6 lg:flex justify-center">
                <ul class="flex gap-6">
                    <li><a href="/">Link 1</a></li>
                    <li><a href="/">Link 2</a></li>
                </ul>
            </div>
            <!-- Auth -->
            <div
                class="col-span-2 sm:col-span-4 lg:col-span-3 flex gap-2 justify-end"
            >
                <a
                    class="btn btn-sm btn-ghost invisible md:visible"
                    href="/auth/signup">Sign Up</a
                >
                <a class="btn btn-primary btn-sm" href="/auth/login"
                    >Login &nearr;</a
                >
            </div>
        </div>
    </div>
</nav>
