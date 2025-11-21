import { Node, Zodiac } from './astroDefs.ts'
import { AspectKind } from './aspects.ts'

import ariesSymbol from "./assets/zodiac-symbols/Aries.png"
import taurusSymbol from "./assets/zodiac-symbols/Taurus.png"
import geminiSymbol from "./assets/zodiac-symbols/Gemini.png"
import cancerSymbol from "./assets/zodiac-symbols/Cancer.png"
import leoSymbol from "./assets/zodiac-symbols/Leo.png"
import virgoSymbol from "./assets/zodiac-symbols/Virgo.png"
import libraSymbol from "./assets/zodiac-symbols/Libra.png"
import scorpioSymbol from "./assets/zodiac-symbols/Scorpio.png"
import sagittariusSymbol from "./assets/zodiac-symbols/Sagittarius.png"
import capricornSymbol from "./assets/zodiac-symbols/Capricorn.png"
import aquariusSymbol from "./assets/zodiac-symbols/Aquarius.png"
import piscesSymbol from "./assets/zodiac-symbols/Pisces.png"

import earthSymbol from "./assets/body-symbols/Earth.png"
import jupiterSymbol from "./assets/body-symbols/Jupiter.png"
import marsSymbol from "./assets/body-symbols/Mars.png"
import mercurySymbol from "./assets/body-symbols/Mercury.png"
import moonSymbol from "./assets/body-symbols/Moon.png"
import neptuneSymbol from "./assets/body-symbols/Neptune.png"
import plutoSymbol from "./assets/body-symbols/Pluto.png"
import saturnSymbol from "./assets/body-symbols/Saturn.png"
import sunSymbol from "./assets/body-symbols/Sun.png"
import uranusSymbol from "./assets/body-symbols/Uranus.png"
import venusSymbol from "./assets/body-symbols/Venus.png"
import ascendantSymbol from "./assets/body-symbols/Ascendant.png"
import descendantSymbol from "./assets/body-symbols/Descendant.png"
import midheavenSymbol from "./assets/body-symbols/Midheaven.png"
import imumCoeliSymbol from "./assets/body-symbols/Imum Coeli.png"
import lunarAscendingSymbol from "./assets/body-symbols/Lunar Ascending.png"
import lunarDescendingSymbol from "./assets/body-symbols/Lunar Descending.png"
import partOfFortuneSymbol from "./assets/body-symbols/Part of Fortune.png"
import lunarApogeeSymbol from "./assets/body-symbols/Lilith.png"
import lunarPerigeeSymbol from "./assets/body-symbols/Selene.png"
import ceresSymbol from "./assets/body-symbols/Ceres.png"
import chironSymbol from "./assets/body-symbols/Chiron.png"
import erisSymbol from "./assets/body-symbols/Eris.png"
import haumeaSymbol from "./assets/body-symbols/Haumea.png"
import junoSymbol from "./assets/body-symbols/Juno.png"
import makemakeSymbol from "./assets/body-symbols/Makemake.png"
import pallasSymbol from "./assets/body-symbols/Pallas.png"
import sednaSymbol from "./assets/body-symbols/Sedna.png"
import vestaSymbol from "./assets/body-symbols/Vesta.png"

import grandSextileSymbol from "./assets/aspect-symbols/Grand Sextile.png"
import grandSquareSymbol from "./assets/aspect-symbols/Grand Square.png"
import grandTrineSymbol from "./assets/aspect-symbols/Grand Trine.png"
import conjunctionSymbol from "./assets/aspect-symbols/Conjunction.png"
import oppositionSymbol from "./assets/aspect-symbols/Opposition.png"
import sextileSymbol from "./assets/aspect-symbols/Sextile.png"
import squareSymbol from "./assets/aspect-symbols/Square.png"
import trineSymbol from "./assets/aspect-symbols/Trine.png"
import parallelSymbol from "./assets/aspect-symbols/Parallel.png"
import contraparallelSymbol from "./assets/aspect-symbols/Contraparallel.png"

import dotSymbol from "./assets/general-symbols/Dot.png"

export { earthSymbol, dotSymbol };

export const nodeShortName: Partial<Record<Node, String>> = {
	[Node.LUNAR_ASCENDING] : "Lunar ▲",
	[Node.LUNAR_DESCENDING] : "Lunar ▼",
	[Node.LUNAR_APOGEE] : "Lilith",
	[Node.LUNAR_PERIGEE] : "Selene",
	[Node.PART_OF_FORTUNE] : "Fortuna",
	[Node.MAKEMAKE] : "M-Make",
}

export const nodeSymbolHideable: Record<Node, boolean> = {
	[Node.SUN] : false,
	[Node.MOON] : false,
	[Node.MERCURY] : false,
	[Node.VENUS] : false,
	[Node.MARS] : false,
	[Node.JUPITER] : false,
	[Node.SATURN] : false,
	[Node.URANUS] : false,
	[Node.NEPTUNE] : false,
	[Node.PLUTO] : false,
	
	[Node.ASCENDANT] : true,
	[Node.DESCENDANT] : true,
	[Node.MIDHEAVEN] : true,
	[Node.IMUM_COELI] : true,
	[Node.PART_OF_FORTUNE] : false,
	
	[Node.LUNAR_ASCENDING] : false,
	[Node.LUNAR_DESCENDING] : false,
	[Node.LUNAR_APOGEE] : false,
	[Node.LUNAR_PERIGEE] : false,
	
	[Node.CERES] : false,
	[Node.CHIRON] : false,
	[Node.ERIS] : false,
	[Node.HAUMEA] : false,
	[Node.JUNO] : false,
	[Node.MAKEMAKE] : false,
	[Node.PALLAS] : false,
	[Node.SEDNA] : false,
	[Node.VESTA] : false,
}
	
export const zodiacSymbols = new Map<Zodiac, string>([
	[Zodiac.Aries, ariesSymbol],
	[Zodiac.Taurus, taurusSymbol],
	[Zodiac.Gemini, geminiSymbol],
	[Zodiac.Cancer, cancerSymbol],
	[Zodiac.Leo, leoSymbol],
	[Zodiac.Virgo, virgoSymbol],
	[Zodiac.Libra, libraSymbol],
	[Zodiac.Scorpio, scorpioSymbol],
	[Zodiac.Sagittarius, sagittariusSymbol],
	[Zodiac.Capricorn, capricornSymbol],
	[Zodiac.Aquarius, aquariusSymbol],
	[Zodiac.Pisces, piscesSymbol]
]);

export const nodeSymbols = new Map<Node, string>([
	[Node.SUN, sunSymbol],
	[Node.MOON, moonSymbol],
	[Node.MERCURY, mercurySymbol],
	[Node.VENUS, venusSymbol],
	[Node.MARS, marsSymbol],
	[Node.JUPITER, jupiterSymbol],
	[Node.SATURN, saturnSymbol],
	[Node.URANUS, uranusSymbol],
	[Node.NEPTUNE, neptuneSymbol],
	[Node.PLUTO, plutoSymbol],
	[Node.ASCENDANT, ascendantSymbol],
	[Node.DESCENDANT, descendantSymbol],
	[Node.MIDHEAVEN, midheavenSymbol],
	[Node.IMUM_COELI, imumCoeliSymbol],
	[Node.LUNAR_ASCENDING, lunarAscendingSymbol],
	[Node.LUNAR_DESCENDING, lunarDescendingSymbol],
	[Node.LUNAR_APOGEE, lunarApogeeSymbol],
	[Node.LUNAR_PERIGEE, lunarPerigeeSymbol],
	[Node.PART_OF_FORTUNE, partOfFortuneSymbol],
	[Node.CERES, ceresSymbol],
	[Node.CHIRON, chironSymbol],
	[Node.ERIS, erisSymbol],
	[Node.HAUMEA, haumeaSymbol],
	[Node.JUNO, junoSymbol],
	[Node.MAKEMAKE, makemakeSymbol],
	[Node.PALLAS, pallasSymbol],
	[Node.SEDNA, sednaSymbol],
	[Node.VESTA, vestaSymbol],
]);

export const aspectSymbols = new Map<AspectKind, string>([
	[AspectKind.GRAND_SEXTILE, grandSextileSymbol],
	[AspectKind.GRAND_SQUARE, grandSquareSymbol],
	[AspectKind.GRAND_TRINE, grandTrineSymbol],
	[AspectKind.CONJUNCTION, conjunctionSymbol],
	[AspectKind.OPPOSITION, oppositionSymbol],
	[AspectKind.SEXTILE, sextileSymbol],
	[AspectKind.SQUARE, squareSymbol],
	[AspectKind.TRINE, trineSymbol],
	[AspectKind.PARALLEL, parallelSymbol],
	[AspectKind.CONTRAPARALLEL, contraparallelSymbol],
]);