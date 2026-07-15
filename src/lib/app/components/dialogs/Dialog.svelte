<script lang="ts">
  import Title from "../Title.svelte";

  let { title, shown = $bindable(false), onClose = null, children } = $props();

  let mouseDownOnBackdrop = $state(false);

  function portal(node: HTMLElement) {
    if (typeof document === "undefined") return;

    document.body.appendChild(node);

    return {
      destroy() {
        node.remove();
      },
    };
  }

  function handleClose() {
    if (onClose) {
      onClose();
    } else {
      shown = false;
    }
  }

  function handleBackdropMouseDown(e: MouseEvent) {
    // Only set to true if the mousedown is on the backdrop itself
    if (e.target === e.currentTarget) {
      mouseDownOnBackdrop = true;
    }
  }

  function handleBackdropClick(e: MouseEvent) {
    // Only close if both mousedown and mouseup happened on the backdrop
    if (e.target === e.currentTarget && mouseDownOnBackdrop) {
      handleClose();
    }
    mouseDownOnBackdrop = false;
  }
</script>

{#if shown}
  <div
    use:portal
    role="dialog"
    tabindex="-1"
    onkeydown={(e) => {
      if (e.key === "Escape") {
        handleClose();
      }
    }}
    onmousedown={handleBackdropMouseDown}
    onclick={handleBackdropClick}
    class="fixed top-0 left-0 bg-black/50 w-screen h-screen flex items-center justify-center z-20"
  >
    <div
      onkeydown={(e) => {
        if (e.key === "Escape") {
          handleClose();
        }
      }}
      role="dialog"
      tabindex="-1"
      onclick={(e) => {
        e.stopPropagation();
      }}
      class="border-x border-y-3 min-w-[650px] lg:w-1/2 w-5/6 flex-col flex items-center justify-center bg-blue-900/20 backdrop-blur-xl border-x-white/10 border-y-blue-400 px-4 py-2"
    >
      <div class="w-full"><Title className="text-lg">{title}</Title></div>
      {@render children()}
    </div>
  </div>
{/if}
