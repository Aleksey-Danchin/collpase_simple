import { useEffect, useState } from "react";
import { sortBy } from "lodash";
import { loadImage } from "../utils";

type parseState = {
	isLoading: boolean;
	isParsing: boolean;
	isParsed: boolean;
	isSuccess: boolean;
	isError: boolean;
	error: unknown;
	frameDatas: Record<string, FrameData>;
} & (
	| { isLoaded: false; image: undefined }
	| { isLoaded: true; image: HTMLImageElement }
);

const initState = (): parseState => ({
	isLoading: false,
	isLoaded: false,
	image: undefined,
	isParsing: false,
	isParsed: false,
	isSuccess: false,
	isError: false,
	error: undefined,
	frameDatas: {},
});

export const useParse = (data: {
	src: string;
	size: number;
	rotate: boolean;
	reflect: boolean;
}) => {
	const { src, size } = data;
	const [state, setState] = useState(initState);

	const { image } = state;

	useEffect(() => {
		(async () => {
			try {
				setState(() => ({ ...initState(), isLoading: true }));

				const image = await loadImage(src);

				setState(() => ({
					...initState(),
					isLoading: false,
					isLoaded: true,
					image,
				}));
			} catch (error) {
				setState((state) => ({
					...state,
					isLoading: false,
					isError: true,
					error,
				}));
			}
		})();
	}, [src]);

	useEffect(() => {
		if (!image) {
			return;
		}

		const frameDataBank = {} as Record<string, FrameData>;
		let idCounter = 0;
		const mosaic = [] as FrameData[][];

		for (let y = 0; y < image.height / size; y++) {
			const row = [] as FrameData[];

			for (let x = 0; x < image.width / size; x++) {
				const canvas = document.createElement("canvas");
				canvas.width = canvas.height = size;

				const context = canvas.getContext("2d");
				if (!context) {
					throw Error("Context not found.");
				}
				// prettier-ignore
				context.drawImage(image, x*size, y*size, size, size, 0, 0, size, size);
				const base64 = canvas.toDataURL();

				const frameData: FrameData = frameDataBank[base64] || {
					id: ++idCounter,
					frequency: 0,
					canvas,
					leftNeighbors: [],
					rightNeighbors: [],
					upNeighbors: [],
					downNeighbors: [],
				};

				frameData.frequency++;

				frameDataBank[base64] = frameData;

				row.push(frameData);
			}

			mosaic.push(row);
		}

		const leftNeighbors = new Map<FrameData, Set<number | string>>();
		const rightNeighbors = new Map<FrameData, Set<number | string>>();
		const upNeighbors = new Map<FrameData, Set<number | string>>();
		const downNeighbors = new Map<FrameData, Set<number | string>>();

		for (let y = 0; y < mosaic.length; y++) {
			for (let x = 0; x < mosaic[y].length; x++) {
				const frameData = mosaic[y][x];

				leftNeighbors.set(frameData, new Set());
				rightNeighbors.set(frameData, new Set());
				upNeighbors.set(frameData, new Set());
				downNeighbors.set(frameData, new Set());
			}
		}

		for (let y = 0; y < mosaic.length; y++) {
			for (let x = 0; x < mosaic[y].length; x++) {
				const frameData = mosaic[y][x];

				if (y > 0) {
					upNeighbors.get(frameData)?.add(mosaic[y - 1][x].id);
				}

				if (x > 0) {
					leftNeighbors.get(frameData)?.add(mosaic[y][x - 1].id);
				}

				if (y + 1 < mosaic.length) {
					downNeighbors.get(frameData)?.add(mosaic[y + 1][x].id);
				}

				if (x + 1 < mosaic[y].length) {
					rightNeighbors.get(frameData)?.add(mosaic[y][x + 1].id);
				}
			}
		}

		for (let y = 0; y < mosaic.length; y++) {
			for (let x = 0; x < mosaic[y].length; x++) {
				const frameData = mosaic[y][x];

				frameData.leftNeighbors = sortBy(
					Array.from(
						leftNeighbors.get(frameData) as Set<number | string>
					)
				);

				frameData.rightNeighbors = sortBy(
					Array.from(
						rightNeighbors.get(frameData) as Set<number | string>
					)
				);

				frameData.upNeighbors = sortBy(
					Array.from(
						upNeighbors.get(frameData) as Set<number | string>
					)
				);

				frameData.downNeighbors = sortBy(
					Array.from(
						downNeighbors.get(frameData) as Set<number | string>
					)
				);
			}
		}

		const frameDatas = {} as Record<string, FrameData>;
		for (const frameData of Object.values(frameDataBank)) {
			frameDatas[frameData.id] = frameData;
		}

		setState((state) => ({ ...state, frameDatas }));
	}, [size, image]);

	return { ...data, ...state };
};
