import { useCallback, useEffect, useState } from "react";
import { choice, frequencyChoice } from "../utils";
import { intersection, isEqual, map, sortBy, uniq } from "lodash";

export const useCollapse = ({
	rows,
	columns,
	frameDatas,
	skip,
	withFrequency,
}: {
	rows: number;
	columns: number;
	frameDatas: Record<string | number, FrameData>;
	skip: boolean;
	withFrequency: boolean;
}) => {
	const [aria, setAria] = useState<AriaItem[][]>(() => {
		const aria: AriaItem[][] = [];

		for (let y = 0; y < rows; y++) {
			const row: AriaItem[] = [];

			for (let x = 0; x < columns; x++) {
				row.push(null);
			}

			aria.push(row);
		}

		return aria;
	});

	useEffect(() => {
		if (skip) {
			return;
		}

		const collection = Object.values(frameDatas);
		const aria: AriaItem[][] = [];

		for (let y = 0; y < rows; y++) {
			const row: AriaItem[] = [];

			for (let x = 0; x < columns; x++) {
				row.push(collection.slice());
			}

			aria.push(row);
		}

		setAria(aria);
	}, [columns, frameDatas, rows, skip]);

	const collapse = useCallback(() => {
		let min = Infinity;
		const coordinats: [number, number][] = [];

		for (let y = 0; y < aria.length; y++) {
			for (let x = 0; x < aria[y].length; x++) {
				const item = aria[y][x];

				if (Array.isArray(item)) {
					if (0 < item.length && item.length < min) {
						coordinats.splice(0);
						min = item.length;
					}

					if (item.length === min) {
						coordinats.push([x, y]);
					}
				}
			}
		}

		if (!coordinats.length) {
			return;
		}

		const [cx, cy] = choice(coordinats);
		const items = aria[cy][cx];

		if (!Array.isArray(items)) {
			return;
		}

		const variant = withFrequency ? frequencyChoice(items) : choice(items);
		const collection = Object.values(frameDatas);
		const nextAria: AriaItem[][] = [];

		for (let y = 0; y < aria.length; y++) {
			const row: AriaItem[] = [];

			for (let x = 0; x < aria[y].length; x++) {
				const oldItem = aria[y][x];

				if (cx === x && cy === y) {
					row.push(variant);
				} else if (Array.isArray(oldItem)) {
					row.push(collection.slice(0));
				} else {
					row.push(oldItem);
				}
			}

			nextAria.push(row);
		}

		let flag = true;
		while (flag) {
			flag = false;

			for (let y = 0; y < aria.length; y++) {
				for (let x = 0; x < aria[y].length; x++) {
					const item = nextAria[y][x];

					if (!Array.isArray(item)) {
						continue;
					}

					const variantsFromUp: Array<number | string> = [];
					const variantsFromRight: Array<number | string> = [];
					const variantsFromDown: Array<number | string> = [];
					const variantsFromLeft: Array<number | string> = [];

					if (y === 0) {
						variantsFromUp.push(...map(collection, "id"));
					} else {
						const upNeighbor = nextAria[y - 1][x];

						if (upNeighbor === null) {
							variantsFromUp.push(...map(collection, "id"));
						} else if (Array.isArray(upNeighbor)) {
							variantsFromUp.push(
								...uniq(
									map(
										upNeighbor.filter((x) => x),
										"downNeighbors"
									).flat()
								)
							);
						} else {
							variantsFromUp.push(...upNeighbor.downNeighbors);
						}
					}

					if (y + 1 === aria.length) {
						variantsFromDown.push(...map(collection, "id"));
					} else {
						const downNeighbor = nextAria[y + 1][x];

						if (downNeighbor === null) {
							variantsFromDown.push(...map(collection, "id"));
						} else if (Array.isArray(downNeighbor)) {
							variantsFromDown.push(
								...uniq(
									map(
										downNeighbor.filter((x) => x),
										"upNeighbors"
									).flat()
								)
							);
						} else {
							variantsFromDown.push(...downNeighbor.upNeighbors);
						}
					}

					if (x === 0) {
						variantsFromLeft.push(...map(collection, "id"));
					} else {
						const leftNeighbor = nextAria[y][x - 1];

						if (leftNeighbor === null) {
							variantsFromLeft.push(...map(collection, "id"));
						} else if (Array.isArray(leftNeighbor)) {
							variantsFromLeft.push(
								...uniq(
									map(
										leftNeighbor.filter((x) => x),
										"rightNeighbors"
									).flat()
								)
							);
						} else {
							variantsFromLeft.push(
								...leftNeighbor.rightNeighbors
							);
						}
					}

					if (x + 1 === aria[y].length) {
						variantsFromRight.push(...map(collection, "id"));
					} else {
						const rightNeighbor = nextAria[y][x + 1];

						if (rightNeighbor === null) {
							variantsFromRight.push(...map(collection, "id"));
						} else if (Array.isArray(rightNeighbor)) {
							variantsFromRight.push(
								...uniq(
									map(
										rightNeighbor.filter((x) => x),
										"leftNeighbors"
									).flat()
								)
							);
						} else {
							variantsFromRight.push(
								...rightNeighbor.leftNeighbors
							);
						}
					}

					const variants = sortBy(
						intersection(
							variantsFromUp,
							variantsFromRight,
							variantsFromDown,
							variantsFromLeft
						)
					);

					let nextItem: AriaItem = null;
					if (variants.length === 1) {
						nextItem = frameDatas[variants[0]];
					} else if (variants.length > 1) {
						nextItem = variants.map((id) => frameDatas[id]);
					}

					if (isEqual(nextItem, nextAria[y][x])) {
						continue;
					}

					flag = true;
					nextAria[y][x] = nextItem;
				}
			}
		}

		setAria(nextAria);
	}, [aria, frameDatas, withFrequency]);

	return { aria, rows, columns, collapse };
};
