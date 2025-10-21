interface City {
  id: string;
  name: string;
  country: string;
  admin1: string;
  lat: string;
  lon: string;
  pop: string;
}

interface CityData {
  countryName: string;
  stateName: string;
  cityName: string;
  latitude: number;
  longitude: number;
  population: number;
}

import citiesData from './assets/city-data/cities.json';

export const barcelonaCityData: CityData = {
	countryName: "Spain",
	stateName: "Catalunya",
	cityName: "Barcelona",
	latitude: 41.38879,
	longitude: 2.15899,
	population: 1621537
};

export class CitySearchEngine {
  private citiesData: City[];
  private countryCodeMap: Map<string, string>;

  constructor() {
	this.sortedCities = citiesData.sort((a, b) => 
      parseInt(b.pop) - parseInt(a.pop)
    );
    
	this.countryCodeMap = new Map([
      ['ES', 'Spain'],
      ['FR', 'France'],
      ['US', 'United States'],
      ['BR', 'Brazil'],
      ['PH', 'Philippines'],
      ['AD', 'Andorra'],
      ['AE', 'United Arab Emirates'],
      // ... add the rest as needed
    ]);
  }

  searchCities(
    cityPattern: RegExp, 
    maxMatches: number = 10
  ): CityData[] {
    const matches: CityData[] = [];

    for (const city of this.sortedCities) {
      if (cityPattern.test(city.name)) {
        matches.push({
          countryName: this.countryCodeMap.get(city.country) || city.country,
          stateName: city.admin1,
          cityName: city.name,
          latitude: parseFloat(city.lat),
          longitude: parseFloat(city.lon),
          population: parseInt(city.pop)
        });
		if (matches.length >= maxMatches) break;
      }
    }
	
	return matches;
  }

  searchCity(cityPattern: RegExp): CityData | null {
    const results = this.searchCities(cityPattern, 1);
    return results.length > 0 ? results[0] : null;
  }
}