<script lang="ts">
	import getStroke from 'perfect-freehand';
	import { primaryButton, secondaryButton } from '$lib/app/lib/tailwindClasses';

	let {
		onSave,
		onCancel,
		onClearRequested = $bindable()
	}: {
		onSave?: (base64: string) => void;
		onCancel?: () => void;
		onClearRequested?: () => void;
	} = $props();

	type Point = [number, number, number];

	let canvas: HTMLCanvasElement;
	let ctx: CanvasRenderingContext2D;
	let svg: SVGSVGElement;

	let drawing = false;

	let currentPoints: Point[] = [];
	let strokes: string[] = $state([]);

	const strokeOptions = {
		size: 4,
		thinning: 0.6,
		smoothing: 1,
		streamline: 1,
		easing: (t: number) => t,
		start: { taper: 0, cap: true },
		end: { taper: 0, cap: true }
	};

	function getPoint(e: PointerEvent): Point {
		const rect = canvas.getBoundingClientRect();

		return [e.clientX - rect.left, e.clientY - rect.top, e.pressure || 0.5];
	}

	function drawPreview() {
		if (currentPoints.length < 2) return;

		const stroke = getStroke(currentPoints, strokeOptions);
		const path = getSvgPathFromStroke(stroke);

		const p = new Path2D(path);

		ctx.lineCap = 'round';
		ctx.lineJoin = 'round';

		ctx.fillStyle = 'white';

		ctx.fill(p);
	}

	function clearCanvas() {
		ctx.clearRect(0, 0, canvas.width, canvas.height);
	}

	function redrawAll() {
		clearCanvas();

		for (const d of strokes) {
			const p = new Path2D(d);
			ctx.fill(p);
		}
	}

	function pointerDown(e: PointerEvent) {
		drawing = true;

		canvas.setPointerCapture(e.pointerId);

		currentPoints = [getPoint(e)];
	}

	function pointerMove(e: PointerEvent) {
		if (!drawing) return;

		const events = e.getCoalescedEvents?.() ?? [e];

		for (const ev of events) {
			currentPoints.push(getPoint(ev));
		}

		clearCanvas();

		redrawAll();
		drawPreview();
	}

	function pointerUp(e: PointerEvent) {
		if (!drawing) return;

		drawing = false;

		canvas.releasePointerCapture(e.pointerId);

		if (currentPoints.length > 1) {
			const stroke = getStroke(currentPoints, strokeOptions);
			const path = getSvgPathFromStroke(stroke);

			strokes = [...strokes, path];
		}

		currentPoints = [];

		clearCanvas();
		redrawAll();
		exportImage();
	}

	function clear() {
		strokes = [];
		currentPoints = [];
		clearCanvas();
	}
	function exportImage() {
		const exportCanvas = document.createElement('canvas');
		const exportCtx = exportCanvas.getContext('2d')!;

		const ratio = window.devicePixelRatio || 1;

		exportCanvas.width = canvas.width;
		exportCanvas.height = canvas.height;

		exportCtx.scale(ratio, ratio);

		// render all strokes in BLACK
		exportCtx.fillStyle = 'black';

		for (const d of strokes) {
			const p = new Path2D(d);
			exportCtx.fill(p);
		}

		const dataUrl = exportCanvas.toDataURL('image/png');
		if (strokes.length === 0) {
			onSave?.('');
			return;
		}
		onSave?.(dataUrl);
	}

	function getSvgPathFromStroke(stroke: number[][]) {
		if (!stroke.length) return '';

		let d = `M ${stroke[0][0]} ${stroke[0][1]}`;

		for (let i = 1; i < stroke.length; i++) {
			const [x, y] = stroke[i];
			d += ` L ${x} ${y}`;
		}

		return d + ' Z';
	}

	import { onMount } from 'svelte';

	onMount(() => {
		const ratio = window.devicePixelRatio || 1;

		canvas.width = 600 * ratio;
		canvas.height = 300 * ratio;

		canvas.style.width = '600px';
		canvas.style.height = '300px';

		ctx = canvas.getContext('2d')!;
		ctx.scale(ratio, ratio);

		ctx.fillStyle = 'white';
		onClearRequested = clear;
	});
</script>

<div class="flex flex-col items-center justify-center gap-12">
	<div class="relative">
		<!-- Canvas = LIVE DRAWING -->
		<canvas
			bind:this={canvas}
			class="h-[300px] w-[600px] cursor-crosshair touch-none border-2 border-blue-400 bg-blue-950/50"
			onpointerdown={pointerDown}
			onpointermove={pointerMove}
			onpointerup={pointerUp}
			onpointerleave={pointerUp}
		></canvas>

		<!-- SVG = FINAL VECTOR STORAGE (hidden but exportable) -->
		<svg bind:this={svg} class="hidden">
			{#each strokes as d}
				<path {d} fill="white" />
			{/each}
		</svg>
	</div>
</div>
