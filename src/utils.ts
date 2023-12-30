export const loadImage = (src: string): Promise<HTMLImageElement> =>
	new Promise((resolve, reject) => {
		try {
			const image = new Image();
			image.onload = () => resolve(image);
			image.src = src;
		} catch (error) {
			reject(error);
		}
	});

export const delay = (n: number = 0) =>
	new Promise((resolve) => setTimeout(resolve, n));

export const choice = <T>(items: Array<T>) =>
	items[Math.floor(Math.random() * items.length)];

export const frequencyChoice = <T extends { frequency: number }>(
	items: Array<T>
) => {
	let number =
		Math.random() *
		items.reduce((acc, { frequency }) => acc + frequency, 0);

	for (const item of items) {
		number -= item.frequency;

		if (number <= 0) {
			return item;
		}
	}

	return items[items.length - 1];
};
