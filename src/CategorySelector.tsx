import { type FC } from 'react';
import { Node, nodeCategories } from './astroDefs';
import { AspectKind, aspectKindCategories } from './aspectDefs';
import { nodeSymbols, nodeShortName, aspectSymbols, aspectKindShortName } from './astroGraphics';

interface SelectorProps<T extends string | number> {
	selectedItems: Set<T>;
	setSelectedItems: (items: Set<T>) => void;
	showLabels: boolean;
	categories: Array<{
		name: string;
		items: T[];
	}>;
	symbols: Record<T, string>;  // For icons
	labels: Partial<Record<T, String>>;   // For text labels
}

const Selector = <T extends string | number>({
	selectedItems,
	setSelectedItems,
	showLabels,
	categories,
	symbols,
	labels
}: SelectorProps<T>) => {
	const handleToggle = (item: T) => {
		const newSelected = new Set(selectedItems);
		if (newSelected.has(item)) {
			newSelected.delete(item);
		} else {
			newSelected.add(item);
		}
		setSelectedItems(newSelected);
	};

	return (
		<div className="p-4 text-white">
			{categories.map(category => (
				<div key={category.name} className="mb-2.5">
					<label className="text-sm font-bold text-gray-400 tracking-wide small-caps">{category.name}</label>
					<div className="flex flex-wrap gap-1.5">
						{category.items.map(item => {
							const isSelected = selectedItems.has(item);
							const symbol = symbols[item];
							return (
								<button
									key={item}
									className={`bg-transparent border p-1.5 text-white cursor-pointer transition-all duration-200 flex items-center justify-center small-caps focus:outline-none hover:border-gray-500 hover:bg-white/10 ${
										isSelected ? 'border-white' : 'border-gray-800'
									}`}
									onClick={() => handleToggle(item)}
									title={String(item)}
								>
									{showLabels ? (
										<span className="text-xs font-medium whitespace-nowrap">{labels[item] || String(item)}</span>
									) : (
										symbol && <img src={symbol} alt={String(item)} className="w-5 h-5 object-contain invert" />
									)}
								</button>
							);
						})}
					</div>
				</div>
			))}
		</div>
	);
};



export const NodeSelector: FC<Omit<SelectorProps<Node>, 'categories' | 'symbols' | 'labels'>> = (props) => (
	<Selector
		{...props}
		categories={nodeCategories}
		symbols={nodeSymbols}
		labels={nodeShortName}
	/>
);

export const AspectKindSelector: FC<Omit<SelectorProps<AspectKind>, 'categories' | 'symbols' | 'labels'>> = (props) => (
	<Selector
		{...props}
		categories={aspectKindCategories}
		symbols={aspectSymbols}
		labels={aspectKindShortName}
	/>
);
