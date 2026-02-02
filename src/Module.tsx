import { type FC, type ReactNode, Children, useState } from 'react';
import { useUIStore } from './uiStore';

type ModuleProps = {
	title: string;
	initialDisplayIndex?: number;
	settingsMenu?: FC;
	helpKey?: string;
	children: ReactNode;
};

const Module: FC<ModuleProps> = ({
	title,
	initialDisplayIndex,
	settingsMenu: SettingsMenu,
	helpKey,
	children,
}) => {
	const childArray = Children.toArray(children);
	const maxIndex = childArray.length;

	// Default initial index is maxIndex (fully expanded, showing last child)
	const defaultIndex = initialDisplayIndex ?? maxIndex;

	// Read display index from store, falling back to default if not set
	const displayIndex = useUIStore(s => s.moduleDisplayStates[title]) ?? defaultIndex;
	const setDisplayState = useUIStore(s => s.setModuleDisplayState);

	// Local state for settings panel (transient, doesn't need persistence)
	const [settingsOpen, setSettingsOpen] = useState(false);

	const isCollapsed = displayIndex === 0;

	const handleExpand = () => {
		if (displayIndex < maxIndex) {
			setDisplayState(title, displayIndex + 1);
		}
	};

	const handleCollapse = () => {
		if (displayIndex > 0) {
			setDisplayState(title, displayIndex - 1);
		}
	};

	const toggleSettings = () => {
		setSettingsOpen(!settingsOpen);
	};

	const buttonClass = "bg-black text-white text-xs px-1 cursor-pointer hover:text-gray-300";

	// Determine which buttons to show
	const showExpandButton = displayIndex < maxIndex;
	const showCollapseButton = displayIndex > 0;

	return (
		<div className={`relative w-full border border-gray-500 bg-black my-1 ${isCollapsed ? 'first:mt-2 last:mb-2' : ''}`}>
			{/* Title: centered when collapsed, sideways on left when expanded */}
			{isCollapsed ? (
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

			{/* Left button group: help and settings (only when not collapsed) */}
			{!isCollapsed && (helpKey || SettingsMenu) && (
				<div
					className="absolute bg-black px-1 flex gap-1 top-0 left-3"
					style={{ transform: 'translateY(-51%)' }}
				>
					{helpKey && (
						<button className={buttonClass} onClick={() => { /* TODO: open help modal */ }}>
							?
						</button>
					)}
					{SettingsMenu && (
						<button
							className={`${buttonClass} ${settingsOpen ? 'text-gray-400' : ''}`}
							onClick={toggleSettings}
						>
							☰
						</button>
					)}
				</div>
			)}

			{/* Right button group: collapse/expand arrows */}
			<div
				className="absolute bg-black px-1 flex gap-1 top-0 right-3"
				style={{ transform: 'translateY(-51%)' }}
			>
				{showCollapseButton && (
					<button className={buttonClass} onClick={handleCollapse}>
						▲
					</button>
				)}
				{showExpandButton && (
					<button className={buttonClass} onClick={handleExpand}>
						▼
					</button>
				)}
			</div>

			{/* Content */}
			<div className={`grid transition-[grid-template-rows] duration-300 ${
				isCollapsed ? 'grid-rows-collapsed' : 'grid-rows-expanded'
			}`}>
				<div className="min-h-0 overflow-hidden">
					{/* Always put the near-collapsed state in the DOM - for the closing animation to work well */}
					{childArray[Math.max(displayIndex - 1, 0)]}
				</div>
			</div>

			{/* Settings panel */}
			{!isCollapsed && settingsOpen && SettingsMenu && (
				<div className="border-t border-gray-500">
					<div className="relative">
						<button
							className="absolute top-2 right-2 text-white text-xs hover:text-gray-300 cursor-pointer"
							onClick={() => setSettingsOpen(false)}
						>
							✕
						</button>
						<SettingsMenu />
					</div>
				</div>
			)}
		</div>
	);
};

export default Module;
