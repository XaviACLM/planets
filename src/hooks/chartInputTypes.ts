import type { FC, ReactNode } from 'react';
import type { CityData } from '../ui/CitySearchEngine';

export interface ChartInputs {
	selectedDate: Date;
	selectedCity: CityData | null;
	timezone: string;
	PickerBar: FC;
	WelcomeContent: FC;
}
