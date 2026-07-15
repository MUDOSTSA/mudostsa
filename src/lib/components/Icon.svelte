<script lang="ts">
	let { icon, size }: { icon: string; size: number; outlined?: boolean } = $props();
</script>

<span class="material-icons" style="font-size: {size}rem">{icon}</span>
