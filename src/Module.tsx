import { useState, FC, ReactNode } from 'react';

export const CollapseState = {
	COLLAPSED: 'collapsed',
	HALF: 'half',
	EXPANDED: 'expanded',
} as const;
export type CollapseState = typeof CollapseState[keyof typeof CollapseState];

type ModuleProps = {
	title: string,
	supportsHalfCollapse?: boolean,
	children: (collapseState: CollapseState) => ReactNode,
}

const Module: FC<ModuleProps> = ({
	title,
	supportsHalfCollapse = false,
	children,
}) => {
	const [collapseState, setCollapseState] = useState<CollapseState>(CollapseState.EXPANDED);

	// ▼ clicked: expand (show more)
	const handleExpand = () => {
		if (collapseState === CollapseState.COLLAPSED) {
			setCollapseState(supportsHalfCollapse ? CollapseState.HALF : CollapseState.EXPANDED);
		} else if (collapseState === CollapseState.HALF) {
			setCollapseState(CollapseState.EXPANDED);
		}
	};

	// ▲ clicked: collapse (show less)
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
					className="absolute bg-black px-2 text-white text-xs small-caps font-bold tracking-wide"
					style={{
						top: '50%',
						left: 12,
						transform: 'translateY(-50%)',
					}}
				>
					{title}
				</span>
			) : (
				<span
					className="absolute bg-black px-1 text-white text-xs small-caps font-bold tracking-wide"
					style={{
						left: 0,
						top: "0.4rem",
						transform: 'translateX(-51%) rotate(-90deg) translateX(-50%)',
						transformOrigin: 'center center',
						whiteSpace: 'nowrap',
					}}
				>
					{title}
				</span>
			)}
			
			{/* buttons (top border on the right) */}
			<div
				className="absolute bg-black px-1 flex gap-1"
				style={{
					top: 0,
					right: 12,
					transform: 'translateY(-50%)'
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
					{children(collapseState)}
				</div>
			</div>
		</div>
	);

	if (collapseState === CollapseState.COLLAPSED) {
		return (
			<div className="relative w-full h-4">
				{/* The line - centered vertically */}
				<div className="absolute top-1/2 left-0 right-0 border-t border-gray-500" />

				{/* Title on the line, towards the left */}
				<span
					className="absolute bg-black px-2 text-white text-xs small-caps font-bold tracking-wide"
					style={{
						top: '50%',
						left: 12,
						transform: 'translateY(-50%)',
					}}
				>
					{title}
				</span>

				{/* Down button (expand) on the line, towards the right */}
				<button
					className={buttonClass}
					style={{
						position: 'absolute',
						top: '50%',
						right: 12,
						transform: 'translateY(-50%)',
					}}
					onClick={handleExpand}
				>
					▼
				</button>
			</div>
		);
	}

	// HALF or EXPANDED state
	const isHalf = collapseState === CollapseState.HALF;

	return (
		<div className="relative w-full border border-gray-500 bg-black">
			{/* Title on left border, sideways */}
			<span
				className="absolute bg-black px-1 text-white text-xs small-caps font-bold tracking-wide"
				style={{
					left: 0,
					top: "0.4rem",
					transform: 'translateX(-51%) rotate(-90deg) translateX(-50%)',
					transformOrigin: 'center center',
					whiteSpace: 'nowrap',
				}}
			>
				{title}
			</span>

			{/* Buttons on top border, towards the right */}
			<div
				className="absolute bg-black px-1 flex gap-1"
				style={{
					top: 0,
					right: 12,
					transform: 'translateY(-50%)',
				}}
			>
				{isHalf ? (
					<>
						<button className={buttonClass} onClick={handleCollapse}>
							▲
						</button>
						<button className={buttonClass} onClick={handleExpand}>
							▼
						</button>
					</>
				) : (
					// EXPANDED: only show collapse button
					<button className={buttonClass} onClick={handleCollapse}>
						▲
					</button>
				)}
			</div>

			{/* Content */}
			<div>
				{children(collapseState)}
			</div>
		</div>
	);
};

export default Module;
