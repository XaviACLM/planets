import { type ReactNode } from 'react';
import { renderDotPattern } from './renderPrimitives';

const SIDEBAR_DEFAULT_WIDTH = 360;

interface SidebarProps {
	side: 'left' | 'right';
	children: ReactNode;
	animationKey?: string;
	zoom?: number;
}

export function Sidebar({ side, children, animationKey, zoom = 1 }: SidebarProps) {
	const animation = side === 'left' ? 'animate-slide-in-left' : 'animate-slide-in-right';

	return (
		<aside
			className="shrink-0 flex flex-col gap-2 p-2 bg-theme-bg overflow-y-auto overflow-x-hidden scrollbar-none relative"
			style={{ width: SIDEBAR_DEFAULT_WIDTH, zoom }}
		>
			{/* Dot lattice background — inset 5% on each side */}
			<div className="absolute inset-y-0 pointer-events-none" style={{ left: '5%', width: '90%' }}>
				{renderDotPattern()}
			</div>

			{/* Content */}
			<div
				className={`flex flex-col gap-2 relative z-10 ${animation}`}
				key={animationKey}
			>
				{children}
			</div>
		</aside>
	);
}
