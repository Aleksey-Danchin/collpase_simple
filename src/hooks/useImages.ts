import { useEffect, useState } from "react";
import { map, isEqual, uniq } from "lodash";
import { loadImage } from "../utils";

const initState = (): {
	isLoading: boolean;
	isLoaded: boolean;
	isError: boolean;
	error: unknown;
	presets: Record<string, HTMLImageElement>;
} => ({
	isLoading: false,
	isLoaded: false,
	isError: false,
	error: undefined,
	presets: {},
});

export const useImages = (frameDatas: FrameData[]) => {
	const [state, setState] = useState(initState);
	const [srcs, setSrcs] = useState<string[]>([]);

	useEffect(() => {
		const fdSrcs = uniq(map(frameDatas, "src"));

		if (!isEqual(srcs, fdSrcs)) {
			setSrcs(fdSrcs);
		}
	}, [frameDatas, srcs]);

	useEffect(() => {
		(async () => {
			setState((state) => ({
				...state,
				isLoading: true,
				isLoaded: false,
			}));

			try {
				const images = await Promise.all(map(srcs, loadImage));
				const presets: Record<string, HTMLImageElement> = {};

				for (let i = 0; i < images.length; i++) {
					presets[srcs[i]] = images[i];
				}

				setState((state) => ({
					...state,
					isLoading: false,
					isLoaded: true,
					presets,
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
	}, [srcs]);

	return {
		...state,
	};
};
