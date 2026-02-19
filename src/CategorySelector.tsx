import { type FC, type ComponentType } from 'react';
import { Node, nodeCategories } from './astroDefs';
import { AspectKind, aspectKindCategories } from './aspectDefs';
import { NodeSelectorButton, AspectKindSelectorButton, renderTitle } from './renderPrimitives';
import { useSettingsStore } from './settingsStore.ts'

interface SelectorProps<T extends string | number> {
	selectedItems: Set<T>;
	setSelectedItems: (items: Set<T>) => void;
	categories: Array<{ name: string; items: T[] }>;
	ButtonComponent: ComponentType<{ item: T; selected: boolean; onClick: () => void }>;
}

const Selector = <T extends string | number>({
	selectedItems,
	setSelectedItems,
	categories,
	ButtonComponent,
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
		<div className="p-4 text-theme-text">
			{categories.map(category => (
				<div key={category.name} className="mb-2.5">
					{renderTitle(category.name)}
					<div className="flex flex-wrap gap-1.5">
						{category.items.map(item => (
							<ButtonComponent
								key={item}
								selected={selectedItems.has(item)}
								onClick={() => handleToggle(item)}
								options={{shortenArabics: true}}
								item={item}
							/>
						))}
					</div>
				</div>
			))}
		</div>
	);
};



export const NodeSelector: FC<Omit<SelectorProps<Node>, 'categories' | 'ButtonComponent'>> = (props) => {
	useSettingsStore(s => s.showNodeLabels);
	return (<Selector
		{...props}
		categories={nodeCategories}
		ButtonComponent={NodeSelectorButton}
	/>);
};

export const AspectKindSelector: FC<Omit<SelectorProps<AspectKind>, 'categories' | 'ButtonComponent'>> = (props) => {
	useSettingsStore(s => s.showAspectLabels);
	useSettingsStore(s => s.aspectsColorcoded);
	return (<Selector
		{...props}
		categories={aspectKindCategories}
		ButtonComponent={AspectKindSelectorButton}
	/>);
};
