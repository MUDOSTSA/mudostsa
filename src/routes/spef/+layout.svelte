<script>
	import TabNavigation from '$lib/app/components/TabNavigation.svelte';

	let { children } = $props();
	const spefLinks = [
		{
			name: 'New',
			href: '/spef/new'
		},
		{
			name: 'Submit Initial SPEF',
			href: '/spef/submit'
		},
		{
			name: 'Submit Final SPEF',
			href: '/spef/submitFinal'
		}
	];
</script>

<TabNavigation links={spefLinks}>{@render children()}</TabNavigation>
