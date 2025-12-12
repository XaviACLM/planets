import { type FC } from 'react';
import { Node, AspectKind, nodeCategories, aspectKindCategories } from './astroDefs';
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

import "./CategorySelector.css";

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
	<div className="node-selector">
		{categories.map(category => (
			<div key={category.name} className="node-category">
				<label className="category-title">{category.name}</label>
				<div className="node-list">
					{category.items.map(item => {
						const isSelected = selectedItems.has(item);
						const symbol = symbols[item];
						return (
						<button
							key={item}
							className={`node-item ${isSelected ? 'selected' : ''}`}
							onClick={() => handleToggle(item)}
							title={String(item)}
						>
							{showLabels ? (
								<span className="node-label">{labels[item] || String(item)}</span>
							) : (
								symbol && <img src={symbol} alt={String(item)} className="node-symbol" />
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
