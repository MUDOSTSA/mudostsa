<script lang="ts">
  import { page } from "$app/state";
  import MaterialIcon from "./MaterialIcon.svelte";

  let {
    links,
    children,
  }: {
    links: {
      name: string;
      href: string;
    }[];
    children: () => any;
  } = $props();
  let currentPath = $derived(page.url.pathname);
</script>

<div class="flex-col h-full">
  <nav class="items-end w-min-42 px-2 pt-2 flex">
    <div
      class="w-42 lg:w-64 gap-2 flex flex-1 border-b border-b-slate-700 pb-2"
    >
      {#each links as link}
        <a
          href={link.href}
          class="flex items-center gap-3 px-4 py-3 border-b-2 transition-colors duration-200 {currentPath ===
          link.href
            ? 'text-white bg-blue-700/20 backdrop-blur-xl border-blue-400 '
            : 'text-white/60 hover:text-white hover:bg-blue-700/20 border-transparent'}"
        >
          <span class="text-sm">{link.name}</span>
        </a>
      {/each}
    </div>
  </nav>

  <!-- Content Area -->
  <div class="flex-1 overflow-auto">
    {@render children()}
  </div>
</div>

<style>
  div {
    box-sizing: border-box;
  }
</style>
