*Planets* is an astrology website. Its main selling points are that it looks neat and has more configuration options than anyone could possibly need.

![Screengrab image](https://i.imgur.com/qRixdfN.png "This is my birth chart - feel free to interpret it for me :)")

**Features.** Standard zodiac wheel for any date/time/location. Customizable nodes - all planets, all relevant minor objects, all lunar nodes (true or mean, incl. Lilith and Selene), primary angles, and Fortuna. Tropical/sidereal toggle with all in-use ayanamsa. All major house systems excl. Placidus and derivates. Automatic aspect detection, incl. parallels/contraparallels in their own diagram. All behenian and persian royal stars. 

**Conspicuously absent features.** There are two todos in the way of this being feature-complete - namely time-based house systems (placidus particularly) and a rework of aspects system. Neither of these are all that relevant to the end user (placidus is hardly distinguishable from porphyrius, and the current aspects system works *fine*), but I don't intend to call this project complete before these features are added.

**Notes about implementation.** All the logic is written in typescript, and no external API calls are made. Most of the calculations that need to be done take place specifically in the repository's code, with the exception of the major celestial bodies that `astronomy-engine` gives you for free. There's no real reason to do this - typescript bindings of swissephemeris exist - but I figured it was more fun to do it this way.

**About this project.** This started largely because I wanted to get more comfortable with React/ts. I chose to make an astrology website for no other reason than because I thought it would be funny to do so in the style I call [CIA dashboards.](https://i.imgur.com/nEAw7nd.png) In the process of doing this I had to learn about astrology (go figure), which led me to realize that there's loads of competing standards for almost everything and no website that accomodates all of them - so I set off in that direction and gradually grew to like the idea of doing this as a gift for a group of people who have absolutely nothing in common with me (namely, astrologers invested enough to care about the difference between Selene and Artha). The math is pretty neat, too.

**About astrology.** No, I don't believe in it. I think it gets a bad rap - it's very interesting as a subject, and it's very easy to imagine how - before light pollution - you could've come up with something like this yourself, ascribing meaning to the few stars that wander across the celestial background. It's very natural - and interesting to observe in retrospect - how all major ancient civilizations with surviving records have their own interpretation re: the ecliptic, precession, retrograde, the constellations, etc, and how all these combine into modern astrological practice.

**About the name.** Planets is just the name of the project folder. I'll give this a proper name if I ever put it on a standalone website.

### TODOs

#### Minor, corrections, double-checking

- Lunar apogee/perigee calculations - the difference from mean to true mode is larger than one would expect, at times. The Meeus polynomial or the calculations might have some typo.
- Space-based house systems. Need to find a primary source for them.
- Switch ASC/DSC and other calculations to R3. No reason to believe they're wrong, I just don't like inscrutable trigonometric formulas.

#### Major, required

- Explainers - **?** icons next to anything nonobvious, with a toggle to hide them.
- Time-based house systems (Placidus, Koch, Topocentric, etc)
    - Just requires figuring out RA interpolation-by-time
- Aspects rework
    - Standard format: All angles 0-2pi, all angles in order
    - Display errors (orbs) in degrees instead of radians
    - All aspects:
        - Minor binary: quincunx (150º), semi-sextile (30º), quintile (72º), semi-square (45º), sesquiquadrate (135º), biquintile (144º), septile (2rad/7)
        - Others: T-Square, kite, yod, mystic rectangle
        - Will have to think about the symbols for these - [wikipedia](https://en.wikipedia.org/wiki/Astrological_symbols) has them, but without grands.
    - Search takes max-non-physical params
    - Menu to customize physical node requirements (w shortcuts)
    - Subaspects
    - Lightweight node subset identifiers (for subaspect exclusion)
    - Subaspect menu
    - Customizable diagram colorcoding
    - Rethink the quantiles
    - Decide on how to re/compute these

#### Later

- Hamburg school objects ("trans-neptunian/hypothetical"). Would be easy if we go off some secondary source but it's very unclear how Witte originally defined these. No intent to make a fully customizable menu for harmonics, just Cupido, Hades, Admetos, etc.
- Really, no reason not to include every single small object [with an astrological symbol](https://en.wikipedia.org/wiki/Astrological_symbols) as long as we can find their orbital parameters in the jpl api (`scripts/small body parameter fetcher.py`).
- Other arabic parts. See [source](https://horoscopes.astro-seek.com/astrology-arabic-lots-list). As explained in `src/astro.ts`, we need to make some decisions about how/if to integrate other arabic parts.
- Better fixed stars, conjunction indicator - integrate with the parallel diagram or put it in another.
- ISS node (with the toilet api)
- Mouseover on a node shows only aspects incident on that node
- Toggle for nodes with multiple icons (e.g. Uranus) or names (e.g. all lunar nodes)
- Better shadow: Fadein, and extend to no-icon-required nodes.
- Draw some actual constellations (but where?)
- Astrology for martians
- Obliquity toggle (for pluto particularly - also ISS)
    - This requires a lot of thinking. Will need to change the data model and how most of the graphs work.
- More tiny graph widgets. This is the key part of the CIA aesthetic. Some ideas:
    - Bar chart for amt of physical/nodes in each sign/house.
    - Bar chart - aspects per node. Or dot matrix plot for aspects x nodes.
    - Some graph to indicate what is/isn't in retrograde.
    - Really, what we should be doing is thinking about what information is missing. We'll work out how to put it in graph form later. So:
    - Rulership cycles (own sign, mutual reception, possibly higher order cycles?) (there's competing standards for rulership assignment)
    - Which planets are asc/dsc. Possibly just a panel for specific information on a planet (node): sign, house, aspects, asc/dsc, retrograde, hemisphere & quadrant, sign of exaltation/detriment/fall.
    - Elements/modes in dominance among the inner/outer planets.
