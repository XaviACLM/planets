import { type FC, type ReactNode, useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

type InfoModalProps = {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
};

const InfoModal: FC<InfoModalProps> = ({ isOpen, onClose, title, children }) => {
	const scrollRef = useRef<HTMLDivElement>(null);
	const [canScrollDown, setCanScrollDown] = useState(false);

	const updateScrollState = useCallback(() => {
		const el = scrollRef.current;
		if (!el) return;
		setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
	}, []);

	// Close on Escape key
	useEffect(() => {
		if (!isOpen) return;

		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'Escape') {
				onClose();
			}
		};

		document.addEventListener('keydown', handleKeyDown);
		return () => document.removeEventListener('keydown', handleKeyDown);
	}, [isOpen, onClose]);

	// Check scroll state when modal opens
	useEffect(() => {
		if (isOpen) requestAnimationFrame(updateScrollState);
	}, [isOpen, updateScrollState]);

	if (!isOpen) return null;

	return createPortal(
		<div
			className="fixed inset-0 z-[2000] flex items-center justify-center"
			onClick={onClose}
		>
			{/* Backdrop with blur */}
			<div className="absolute inset-0 bg-theme-bg/10 backdrop-blur-xs" />

			{/* Modal content */}
			<div
				className="relative bg-theme-bg border border-theme-border max-w-[500px] max-h-[80vh] m-4 overflow-hidden"
				onClick={(e) => e.stopPropagation()}
			>
				<div
					ref={scrollRef}
					className="overflow-y-auto scrollbar-none max-h-[80vh]"
					onScroll={updateScrollState}
				>
					{/* Header */}
					<div className="sticky top-0 bg-theme-bg border-b border-theme-border px-4 py-2 flex justify-between items-center">
						<span className="text-theme-text text-sm small-caps font-bold tracking-wide">
							{title}
						</span>
						<button
							className="text-theme-text text-lg hover:text-gray-300 cursor-pointer leading-none"
							onClick={onClose}
						>
							✕
						</button>
					</div>

					{/* Body */}
					<div className="p-4 text-theme-text text-sm leading-relaxed">
						{children}
					</div>
				</div>

				{/* Bottom scroll fade */}
				<div
					className={`absolute bottom-0 left-0 right-0 h-8 bg-gradient-to-t from-theme-bg to-transparent pointer-events-none transition-opacity duration-200 ${canScrollDown ? 'opacity-100' : 'opacity-0'}`}
				/>
			</div>
		</div>,
		document.body
	);
};

export default InfoModal;
