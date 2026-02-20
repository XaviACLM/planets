import { type FC, type ReactNode, Children, useState } from 'react';
import { useUIStore } from './uiStore';
import InfoModal from './InfoModal';

type ModuleProps = {
	title: string;
	initialDisplayIndex?: number;
	showArrows?: boolean;
	titlePosition?: 'top' | 'left' | 'right' | 'hidden';
	settingsMenu?: FC;
	helpContent?: ReactNode;
	children: ReactNode;
};

const Module: FC<ModuleProps> = ({
	title,
	initialDisplayIndex,
	showArrows=true,
	titlePosition='top',
	settingsMenu: SettingsMenu,
	helpContent,
	children,
}) => {
	const childArray = Children.toArray(children);
	const maxIndex = childArray.length;

	// Default initial index is maxIndex (fully expanded, showing last child)
	const defaultIndex = initialDisplayIndex ?? maxIndex;

	// Read display index from store, falling back to default if not set
	const displayIndex = useUIStore(s => s.moduleDisplayStates[title]) ?? defaultIndex;
	const setDisplayState = useUIStore(s => s.setModuleDisplayState);

	// Local state for settings and help panels (transient, doesn't need persistence)
	const [settingsOpen, setSettingsOpen] = useState(false);
	const [helpOpen, setHelpOpen] = useState(false);

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

	const buttonClass = "bg-theme-bg text-theme-text text-xs px-1 cursor-pointer hover:opacity-70";

	// Determine which buttons to show
	const showExpandButton = displayIndex < maxIndex;
	const showCollapseButton = displayIndex > 0;

	return (
		<div className={`relative w-full border border-theme-border bg-theme-bg my-1 ${isCollapsed ? 'first:mt-2 last:mb-2 border-b-0' : ''}`}>
			{/* Title: centered when collapsed, sideways on left when expanded */}
			{isCollapsed ? (
				<span
					className="absolute bg-theme-bg px-2 text-theme-text text-xs small-caps font-bold tracking-wide top-1/2 left-3 -translate-y-1/2"
				>
					{title}
				</span>
			) : titlePosition === 'right' ? (
				<span
					className="absolute translate-x-0.5 bg-theme-bg px-1 text-theme-text text-xs small-caps font-bold tracking-wide right-0 top-1 whitespace-nowrap"
					style={{
						transform: 'translateX(50%) rotate(90deg) translateX(50%)',
						transformOrigin: 'center center',
						willChange: 'transform',
					}}
				>
					{title}
				</span>
			) : titlePosition === 'left' ? (
				<span
					className="absolute -translate-x-0.5 bg-theme-bg px-1 text-theme-text text-xs small-caps font-bold tracking-wide left-0 top-1 whitespace-nowrap"
					style={{
						transform: 'translateX(-50%) rotate(-90deg) translateX(-50%)',
						transformOrigin: 'center center',
						willChange: 'transform',
					}}
				>
					{title}
				</span>
			) : titlePosition === 'top' ? ( //top
				<span
					className="absolute bg-theme-bg px-2 text-theme-text text-xs small-caps font-bold tracking-wide left-3 -translate-y-1/2"
				>
					{title}
				</span>
			) : ( //hidden
				null
			)}

			{/* Button groups */}
			<div
				className="absolute px-1 flex gap-1 -top-0.5 right-3"
				style={{ transform: 'translateY(-51%)' }}
			>
				{!isCollapsed && (helpContent || SettingsMenu) && (
					<div className="mr-3">
						{helpContent && (
							<button className={buttonClass} onClick={() => setHelpOpen(true)}>
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
			
				{showArrows && (<div>
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
				</div>)}
			</div>

			{/* Content */}
			<div className={`grid transition-[grid-template-rows] duration-300 ${
				isCollapsed ? 'grid-rows-collapsed' : 'grid-rows-expanded'
			}`}>
				<div className={`min-h-0 ${displayIndex === 0 ? "overflow-hidden" : ""}`}>
					{/* Always put the near-collapsed state in the DOM - for the closing animation to work well */}
					{childArray[Math.max(displayIndex - 1, 0)]}
				</div>
			</div>

			{/* Settings panel */}
			{!isCollapsed && settingsOpen && SettingsMenu && (
				<div className="border-t border border-theme-border m-1">
					<div className="relative">
						<button
							className="absolute top-2 right-2 text-theme-text text-xs hover:opacity-70 cursor-pointer"
							onClick={() => setSettingsOpen(false)}
						>
							✕
						</button>
						<SettingsMenu />
					</div>
				</div>
			)}

			{/* Help modal */}
			{helpContent && (
				<InfoModal
					isOpen={helpOpen}
					onClose={() => setHelpOpen(false)}
					title={title}
				>
					{helpContent}
				</InfoModal>
			)}
		</div>
	);
};

export default Module;
