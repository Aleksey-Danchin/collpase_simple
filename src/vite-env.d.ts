/// <reference types="vite/client" />

type AriaItem = null | FrameData | FrameData[];

interface FrameData {
	id: string | number;
	canvas: HTMLCanvasElement;
	frequency: number;
	leftNeighbors: Array<string | number>;
	rightNeighbors: Array<string | number>;
	upNeighbors: Array<string | number>;
	downNeighbors: Array<string | number>;
}
