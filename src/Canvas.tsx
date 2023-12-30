import { FC, useEffect, useRef } from "react";

export type CanvasProps = {
	aria: AriaItem[][];
	size: number;
};

export const Canvas: FC<CanvasProps> = ({ aria, size }) => {
	const ref = useRef<HTMLCanvasElement>(null);

	useEffect(() => {
		const canvas = ref.current;
		const context = canvas?.getContext("2d");

		if (!canvas || !context) {
			return;
		}

		canvas.height = aria.length * size;
		canvas.width = aria[0].length * size;

		for (let y = 0; y < aria.length; y++) {
			for (let x = 0; x < aria[y].length; x++) {
				const item = aria[y][x];

				if (item === null) {
					context.beginPath();
					context.strokeStyle = "red";
					context.moveTo(x * size, y * size);
					context.lineTo(x * size + size, y * size + size);
					context.moveTo(x * size, y * size + size);
					context.lineTo(x * size + size, y * size);
				} else if (Array.isArray(item)) {
					context.font = `${size / 2}px mono`;
					context.textAlign = "center";
					context.textBaseline = "middle";
					context.fillText(
						item.length.toString(),
						(x + 0.5) * size,
						(y + 0.5) * size
					);
				} else {
					context.drawImage(
						item.canvas,
						0,
						0,
						item.canvas.width,
						item.canvas.height,
						x * size,
						y * size,
						size,
						size
					);
				}
			}
		}
	}, [aria, size]);

	return <canvas ref={ref} />;
};
