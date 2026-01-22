import { useState, FC, ReactNode } from 'react';

export const CollapseState = {
	COLLAPSED: 'collapsed',
	HALF: 'half',
	EXPANDED: 'expanded',
} as const;
export type CollapseState = typeof CollapseState[keyof typeof CollapseState];

type ModuleProps = {
	title: string,
	startingState: CollapseState,
	supportsHalfCollapse?: boolean,
	children: (collapseState: CollapseState) => ReactNode,
}

const Module: FC<ModuleProps> = ({
	title,
	startingState,
	supportsHalfCollapse = false,
	children,
}) => {
	const [collapseState, setCollapseState] = useState<CollapseState>(startingState);

	const handleExpand = () => {
		if (collapseState === CollapseState.COLLAPSED) {
			setCollapseState(supportsHalfCollapse ? CollapseState.HALF : CollapseState.EXPANDED);
		} else if (collapseState === CollapseState.HALF) {
			setCollapseState(CollapseState.EXPANDED);
		}
	};

	const handleCollapse = () => {
		if (collapseState === CollapseState.EXPANDED) {
			setCollapseState(supportsHalfCollapse ? CollapseState.HALF : CollapseState.COLLAPSED);
		} else if (collapseState === CollapseState.HALF) {
			setCollapseState(CollapseState.COLLAPSED);
		}
	};

	const buttonClass = "bg-black text-white text-xs px-1 cursor-pointer hover:text-gray-300";

	return (
		<div className={`relative w-full border border-gray-500 bg-black ${collapseState === CollapseState.COLLAPSED ? 'my-1 first:mt-2' : ''}`}>
			{/* title (sideways on the right unless collapsed) */}
			{collapseState === CollapseState.COLLAPSED ? (
				<span
					className="absolute bg-black px-2 text-white text-xs small-caps font-bold tracking-wide top-1/2 left-3 -translate-y-1/2"
				>
					{title}
				</span>
			) : (
				<span
					className="absolute -translate-x-0.5 bg-black px-1 text-white text-xs small-caps font-bold tracking-wide left-0 top-1 whitespace-nowrap"
					style={{
						transform: 'translateX(-50%) rotate(-90deg) translateX(-50%)',
						transformOrigin: 'center center',
						willChange: 'transform',
					}}
				>
					{title}
				</span>
			)}
			
			{/* buttons (top border on the right) */}
			<div
				className="absolute bg-black px-1 flex gap-1 top-0 right-3"
				style={{
					transform: 'translateY(-51%)'
				}}
			>
				{collapseState === CollapseState.COLLAPSED ? (
					<button className={buttonClass} onClick={handleExpand}>
						▼
					</button>
				) : collapseState === CollapseState.HALF ? (
					<>
						<button className={buttonClass} onClick={handleCollapse}>
							▲
						</button>
						<button className={buttonClass} onClick={handleExpand}>
							▼
						</button>
					</>
				) : (
					<button className={buttonClass} onClick={handleCollapse}>
						▲
					</button>
				)}
			</div>
			
			{/* content */}
			<div className={`grid transition-[grid-template-rows] duration-300 ${
				collapseState === CollapseState.COLLAPSED ? 'grid-rows-collapsed' : 'grid-rows-expanded'
			}`}>
				<div className="min-h-0 overflow-hidden">
					{supportsHalfCollapse ? (
						children(collapseState !== CollapseState.EXPANDED)
					) : (
						children
					)}
				</div>
			</div>
		</div>
	);
};

export default Module;
