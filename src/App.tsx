import { FC, useEffect } from "react";
import { useParse } from "./hooks/useParse";
import { useCollapse } from "./hooks/useCollapse";
import { Canvas } from "./Canvas";
import { map } from "lodash";

const patterns = [
	{ src: "/sets/pattern1.png", size: 14 },
	{ src: "/sets/pattern2.png", size: 48 },
];

export const App: FC = () => {
	const parse = useParse({
		...patterns[1],
		rotate: false,
		reflect: false,
	});

	const { frameDatas } = parse;

	const collapse = useCollapse({
		// rows: 30,
		// columns: 60,
		rows: 20,
		columns: 20,
		frameDatas,
		withFrequency: false,
		skip: !Object.keys(frameDatas).length,
	});

	const { collapse: step } = collapse;

	useEffect(() => {
		step();
	}, [step]);

	useEffect(() => {
		document.querySelector("#sample")?.remove();
		const div = document.createElement("div");
		div.id = "sample";
		document.body.append(div);
		div.append(...map(Object.values(frameDatas), "canvas"));
	}, [frameDatas]);

	if (parse.isLoading) {
		return <div>loading . . .</div>;
	}

	if (parse.isParsing) {
		return <div>parsing . . .</div>;
	}

	return (
		<div>
			<button onClick={collapse.collapse}>Collapse</button>
			<br />
			<Canvas size={30} aria={collapse.aria} />
		</div>
	);
};
