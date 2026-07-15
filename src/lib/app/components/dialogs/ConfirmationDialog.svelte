<script lang="ts">
	import Dialog from './Dialog.svelte';
	import MaterialIcon from '../MaterialIcon.svelte';
	import { dangerButton, primaryButton, secondaryButton } from '$lib/app/lib/tailwindClasses';

	let {
		shown = $bindable(false),
		title = 'Confirm Action',
		warningTitle = 'Caution',
		warningMessage = 'This action requires your confirmation.',
		warningType = 'yellow', // 'yellow' or 'red'
		confirmLabel = 'Confirm',
		confirmIcon = 'check',
		confirmColor = 'blue', // 'blue' or 'red'
		items = [],
		additionalInfo = [],
		summaryText = '',
		onConfirm,
		isProcessing = false,
		error = ''
	}: {
		shown: boolean;
		title?: string;
		warningTitle?: string;
		warningMessage?: string;
		warningType?: 'yellow' | 'red';
		confirmLabel?: string;
		confirmIcon?: string;
		confirmColor?: 'blue' | 'red';
		items?: Array<{
			primary: string;
			secondary?: string;
			tertiary?: string;
			badge?: { text: string; color: string };
		}>;
		additionalInfo?: {
			label: string;
			value: string;
			icon?: string;
			color?: string;
		}[];
		summaryText?: string;
		onConfirm: () => void;
		isProcessing?: boolean;
		error?: string;
	} = $props();

	function handleClose() {
		if (!isProcessing) {
			error = '';
			shown = false;
		}
	}

	// Reset error when dialog opens
	$effect(() => {
		if (shown) {
			error = '';
		}
	});

	let warningClasses = $derived(
		warningType === 'red' ? 'bg-red-600   text-white' : 'bg-yellow-600  text-white'
	);

	let confirmButtonClasses = $derived(confirmColor === 'red' ? dangerButton : primaryButton);
</script>

<Dialog bind:shown {title} onClose={handleClose}>
	<div class="min-w-96 space-y-4 px-4 py-4">
		<!-- Warning Message -->
		<div class={`${warningClasses} px-4 py-3`}>
			<div class="mb-2 flex items-center gap-2">
				<MaterialIcon icon="warning" size={1.2} />
				<span class="font-medium">{warningTitle}</span>
			</div>
			<p class="text-sm">
				{warningMessage}
			</p>
		</div>

		<!-- Additional Info (like operation type, timestamp, etc.) -->
		{#if additionalInfo && additionalInfo.length > 0}
			<div class="space-y-3 border border-slate-700 bg-slate-800/50 p-4">
				{#each additionalInfo as info}
					<div class="flex {info.label === 'Changes' ? 'flex-col' : 'items-center'} gap-2">
						<span
							class="text-sm font-medium text-white/60 {info.label === 'Changes' ? '' : 'min-w-24'}"
							>{info.label}:</span
						>
						<div class="flex items-center gap-2 {info.label === 'Changes' ? 'w-full' : ''}">
							{#if info.icon}
								<span class={info.color || 'text-white'}>
									<MaterialIcon icon={info.icon} size={1.1} />
								</span>
							{/if}
							<span
								class={`${info.color || 'text-white'} text-sm ${info.label === 'Changes' ? 'w-full rounded border border-slate-600 bg-slate-900/50 p-3' : ''}`}
							>
								{info.value}
							</span>
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Items List -->
		{#if items.length > 0}
			<div class=" flex max-h-64 flex-col gap-2 overflow-y-auto">
				{#each items as item}
					<div
						class="flex items-center justify-between border-b-2 border-slate-600 border-b-blue-300 bg-gradient-to-t from-blue-900/5 to-blue-900/20 px-4 py-2 pt-4 pb-5"
					>
						<div class="flex-1">
							<div class="font-medium text-white">{item.primary}</div>
							{#if item.secondary}
								<div class="text-sm text-white/60">{item.secondary}</div>
							{/if}
							{#if item.tertiary}
								<div class="mt-1 text-xs text-white/50">{item.tertiary}</div>
							{/if}
							{#if item.badge}
								<div class="text-xs {item.badge.color} mt-1 font-medium">
									{item.badge.text}
								</div>
							{/if}
						</div>
					</div>
				{/each}
			</div>
		{/if}

		<!-- Error Message -->
		{#if error}
			<div
				class="flex items-center gap-2 rounded-lg border border-red-500/50 bg-red-900/20 px-3 py-2 text-sm text-red-400"
			>
				<MaterialIcon icon="error" size={1.1} />
				<span>{error}</span>
			</div>
		{/if}

		<!-- Summary Text -->
		{#if summaryText}
			<div class="text-center font-medium text-white/90">
				{summaryText}
			</div>
		{/if}

		<!-- Action Buttons -->
		<div class="flex items-center justify-center gap-3 pt-2">
			<button
				type="button"
				onclick={onConfirm}
				class={`${confirmButtonClasses}`}
				disabled={isProcessing}
			>
				{#if isProcessing}
					Processing
				{:else}
					<MaterialIcon icon={confirmIcon} size={1.1} />
					{confirmLabel}
				{/if}
			</button>
			<button type="button" onclick={handleClose} class={secondaryButton} disabled={isProcessing}>
				Cancel
			</button>
		</div>
	</div>
</Dialog>

<style>
	@keyframes spin {
		from {
			transform: rotate(0deg);
		}
		to {
			transform: rotate(360deg);
		}
	}

	:global(.animate-spin) {
		animation: spin 1s linear infinite;
	}
</style>
