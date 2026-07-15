<script lang="ts">
	import { primaryButton, secondaryButton, formError } from '$lib/app/lib/tailwindClasses';
	import { onMount } from 'svelte';
	import MaterialIcon from './MaterialIcon.svelte';

	import { fileTypeToMime, getFileType } from '$lib/app/lib/helper_functions';
	import { fly } from 'svelte/transition';

	const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
	const DEFAULT_ALLOWED_TYPES = [
		'application/pdf',
		'image/png',
		'image/jpeg',
		'application/msword',
		'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
	];
	interface UploadedFile {
		file: File;
		path: string;
	}

	let {
		message = 'Drag files here or click to browse',
		allowedTypes = DEFAULT_ALLOWED_TYPES,
		files = $bindable<File[]>([]),
		maxNumberOfFiles = 99,
		onFilesChange
	}: {
		message?: string;
		allowedTypes?: string[];
		files?: File[];
		maxNumberOfFiles?: number;
		onFilesChange?: (files: File[]) => void;
	} = $props();

	let uploadError = $state('');
	let isDragging = $state(false);

	function validateFile(file: File): string | null {
		if (files.length >= maxNumberOfFiles) {
			return `You can only upload up to ${maxNumberOfFiles} file(s)`;
		}
		if (file.size > MAX_FILE_SIZE) {
			return `File "${file.name}" exceeds maximum size of 10MB`;
		}

		if (!allowedTypes.includes(file.type)) {
			return `File type "${file.type}" is not allowed. Allowed types: ${allowedTypes.join(', ')}`;
		}

		return null;
	}

	let fileInput: HTMLInputElement;

	function handleFileSelect(selectedFiles: FileList | null) {
		if (!selectedFiles) return;

		uploadError = '';

		const newFiles: File[] = [];

		if (selectedFiles.length + files.length > maxNumberOfFiles) {
			uploadError = `You can only upload up to ${maxNumberOfFiles} file(s)`;
			return;
		}

		for (const file of Array.from(selectedFiles)) {
			const error = validateFile(file);

			if (error) {
				uploadError = error;
				return;
			}

			newFiles.push(file);
		}

		files = [...files, ...newFiles];
		onFilesChange?.(files);

		fileInput.value = '';
	}
	async function handleDrop(event: DragEvent) {
		event.preventDefault();
		isDragging = false;
		uploadError = '';

		const droppedFiles = Array.from(event.dataTransfer?.files ?? []);

		if (files.length + droppedFiles.length > maxNumberOfFiles) {
			uploadError = `You can only upload up to ${maxNumberOfFiles} file(s)`;
			return;
		}

		const newFiles: File[] = [];

		for (const file of droppedFiles) {
			const error = validateFile(file);

			if (error) {
				uploadError = error;
				return;
			}

			newFiles.push(file);
		}

		files = [...files, ...newFiles];
		onFilesChange?.(files);
	}

	function removeFile(index: number) {
		files = files.filter((_, i) => i !== index);
		onFilesChange?.(files);
	}

	function handleDragOver(e: DragEvent) {
		e.preventDefault();
		isDragging = true;
	}

	function handleDragLeave(e: DragEvent) {
		if (e.target === document) {
			isDragging = false;
		}
	}

	function formatFileSize(bytes: number): string {
		if (bytes === 0) return '0 Bytes';
		const k = 1024;
		const sizes = ['Bytes', 'KB', 'MB', 'GB'];
		const i = Math.floor(Math.log(bytes) / Math.log(k));
		return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i];
	}
</script>

<div class="space-y-4">
	<!-- Upload Area -->
	<div
		class={`cursor-pointer border-2 border-dashed p-8 text-center transition-colors ${
			isDragging
				? 'border-blue-300 bg-blue-500/10'
				: 'border-blue-400/50 bg-blue-800/5 hover:border-blue-400'
		}`}
		role="button"
		tabindex="0"
		ondragover={handleDragOver}
		ondragleave={handleDragLeave}
		ondrop={handleDrop}
		onkeydown={(e) => {
			if (e.key === 'Enter' || e.key === ' ') {
				fileInput.click();
			}
		}}
		onclick={() => fileInput.click()}
	>
		<input
			bind:this={fileInput}
			type="file"
			class="hidden"
			multiple
			accept={allowedTypes.join(',')}
			onchange={(e) => handleFileSelect(e.currentTarget.files)}
		/>

		<span class="text-sm text-white/70">
			<MaterialIcon icon="cloud_upload" size={3} />
		</span>

		<p class="text-sm text-white/70">{message}</p>

		<p class="mt-2 text-xs text-white/50">
			{allowedTypes.map((type) => type.split('/')[1].toUpperCase()).join(', ')}
			({formatFileSize(MAX_FILE_SIZE)} max)
		</p>
	</div>

	<!-- Error Message -->
	{#if uploadError}
		<div class={formError}>
			<div class="flex items-center gap-2">
				<span>{uploadError}</span>
			</div>
		</div>
	{/if}

	<!-- File List -->
	<div class="space-y-2">
		<p class="text-sm font-medium text-white/70">
			{files.length} file(s) selected
		</p>

		<div class="space-y-2">
			{#each files as file, index (index)}
				<div
					in:fly={{ x: -10, duration: 200 }}
					out:fly={{ x: -10, duration: 200 }}
					class="flex items-center justify-between border-l-2 border-blue-500 bg-blue-800/20 p-3"
				>
					<div class="flex min-w-0 flex-1 items-center gap-3">
						<div class="min-w-0 flex-1">
							<p class="truncate text-sm text-white/90">
								{file.name}
							</p>

							<p class="text-xs text-white/50">
								{formatFileSize(file.size)}
							</p>
						</div>
					</div>

					<button
						class={secondaryButton}
						type="button"
						onclick={() => removeFile(index)}
						title="Remove file"
					>
						Remove
					</button>
				</div>
			{/each}
		</div>
	</div>
</div>
