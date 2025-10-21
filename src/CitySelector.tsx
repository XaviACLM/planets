import { useState, useEffect, useRef, FC } from "react";
import { type CityData, CitySearchEngine } from "./CitySearchEngine.ts"

import "./CitySelector.css";

interface CitySelectorProps {
	onSelect: (city: CityData) => void;
}

export function CitySelector({startingQueryText, onSelect}: [CityData | null, CitySelectorProps]) {
	const [ query, setQuery ] = useState<string>("");
	const [ results, setResults ] = useState<CityData[]>([]);
	const [ isLoading, setIsLoading ] = useState<boolean>(false);
	const [ selected, setSelected ] = useState<CityData | null>(null);
	const cseRef = useRef<CitySearchEngine|null>(null);
	
	useEffect(() => {
		cseRef.current = new CitySearchEngine();
	}, []);
	
	// 
	useEffect(() => {
		if (startingQueryText != null) {
			setQuery(startingQueryText.cityName+", "+startingQueryText.stateName+", "+startingQueryText.countryName);
		}
	}, []);
	
	useEffect(() => {
		if (!cseRef.current || query.length < 2) {
			setResults([]);
			return;
		}
		
		const timeout = setTimeout(async () => {
			setIsLoading(true);
			const regex = new RegExp(query + ".*", "i");
			const res = cseRef.current.searchCities(regex, 5);
			setResults(res);
			setIsLoading(false);
		}, 250);
		
		return () => clearTimeout(timeout);
	}, [query]);
	
	const handleSelect = (cityData: CityData) => {
		setSelected(cityData);
		setQuery(cityData.cityName+", "+cityData.stateName+", "+cityData.countryName);
		setResults([]);
		onSelect(cityData);
	};
	
	return (
		<div className="city-selector">
			<input className="city-input"
				type="text"
				placeholder="Type a city..."
				value={query}
				onChange={(e) => {
					setQuery(e.target.value);
					setSelected(null);
				}}
			/>
			
			{isLoading && <div className="dropdown-loading">Loading...</div>}
			
			{!isLoading && results.length>0 && (
				<ul className="dropdown">
					{results.map((r,i) => {
						return ( <li className="dropdown-item"
							key={i}
							onClick={() => handleSelect(r)}
						>
							{r.cityName}, {r.stateName}, {r.countryName}
						</li> );
					})}
				</ul>
			)}
		</div>
	)
}