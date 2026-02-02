import { type FC, type ReactNode, useEffect } from 'react';
import { createPortal } from 'react-dom';

type InfoModalProps = {
	isOpen: boolean;
	onClose: () => void;
	title: string;
	children: ReactNode;
};

const InfoModal: FC<InfoModalProps> = ({ isOpen, onClose, title, children }) => {
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
				className="relative bg-theme-bg border border-theme-border max-w-[500px] max-h-[80vh] overflow-y-auto m-4"
				onClick={(e) => e.stopPropagation()}
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
		</div>,
		document.body
	);
};

export default InfoModal;
