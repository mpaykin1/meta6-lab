# Observer World MVP — success + mandatory unfinished work

Date: 2026-09-30
Status: SUCCESSFUL FOUNDATION, NOT FEATURE-COMPLETE
Target: `/observer-world/`

## What is confirmed successful

This MVP is a successful foundation for the new medieval Observer version of Chain Reaction.

Confirmed successful ideas:
- the old Meta6 version remains isolated and untouched;
- the new game exists as a separate published version;
- the world direction is visibly medieval rather than modern;
- the player role is an Observer from the Institute of Historical Observation;
- RED OBSERVERS exist as a distinct semantic/gameplay entity;
- Observers can die and the world continues instead of resetting;
- new medieval/story glyphs exist: well, market, school, castle, monastery, guard, prison, granary, healer, fire, plague, Observer;
- placing objects creates causal narrative consequences;
- event text follows the compact standard: WHAT HAPPENED → WORLD REACTION → POSSIBLE CONSEQUENCE;
- the game already supports the core design direction: actions are causes, not decorative placement.

These parts should be preserved in future iterations unless a regression is explicitly discovered.

## What is NOT finished and must not be reported as complete

The current build is visually too static.

This is a mandatory blocker for the next iteration.

### 1. Every construction must trigger a matching visible animation

When an object is placed, the player must see a process, not an instant static replacement.

Required examples:
- WELL: digging → stone ring rises → water appears;
- MARKET: stalls unfold → awnings appear → people arrive;
- SCHOOL: foundation → walls → roof → first people enter;
- CASTLE: wall segments rise → towers complete → banner appears;
- MONASTERY: structure grows → bell/cross detail → people gather;
- GUARD: guards walk into position / patrol starts;
- PRISON: structure closes / bars or gate animate;
- GRANARY: building rises → sacks/carts arrive;
- HEALER: house appears → people move toward it;
- FIRE: flames and smoke continuously animate;
- PLAGUE: affected zone visibly pulses/spreads;
- OBSERVER: arrival/spawn/movement animation.

Acceptance rule:
A player must be able to understand that the world changed even with all text hidden.

### 2. A used construction button must transform into a new glyph/action

The action dock must evolve.

After an object has been built, its button must not remain a dead repetition of the same action.

Instead:
OLD GLYPH / ACTION
→ build/use
→ NEW GLYPH / NEXT HISTORICAL ACTION.

Examples:
WELL → WATER RIGHTS / SETTLEMENT;
MARKET → GUILD / TAX;
SCHOOL → SCHOLAR / PRINTING;
CASTLE → GUARD / COURT;
MONASTERY → RELIEF / DOCTRINE;
GRANARY → RATIONING / TRADE;
HEALER → MEDICINE / QUARANTINE.

The action interface itself must show the historical chain reaction.

### 3. Every built object must display its glyph above it

A persistent readable glyph must float above each major placed object.

Requirements:
- glyph stays visually attached to the object while camera moves;
- glyph scales/readjusts with zoom;
- glyph does not obscure the object excessively;
- object and glyph are one interactive target;
- Observer glyphs remain clearly distinguishable from normal inhabitants.

This is not decoration. The glyph is the semantic control surface of the world.

### 4. Clicking the glyph above an object must open a short narrative status report

Every placed object's floating glyph must be clickable/tappable.

On tap:
- identify the object;
- inspect its current local state;
- inspect nearby relevant objects/people/events;
- generate/show one short narrative paragraph;
- describe what is happening NOW and what may happen next.

Narrative length standard:
approximately 35–55 words.

Narrative structure:
WHAT IS HAPPENING
→ HOW THE WORLD IS REACTING
→ POSSIBLE CONSEQUENCE.

Do not show a dry stat dump as the primary response.

The prose should feel like original intelligent speculative fiction with:
- restrained irony;
- concrete human detail;
- causal tension;
- moral ambiguity;
- no copying of distinctive wording from any named author.

Example behaviour:
tap SCHOOL glyph
→ report current scholar/student/guard pressure
→ hint at possible persecution, influence, migration or intellectual growth.

tap GRANARY glyph
→ report current food pressure / crowd / guards
→ hint at rationing, theft, riot, relief or political leverage.

tap OBSERVER glyph
→ report cover, suspicion, nearby witnesses and current danger
→ hint at exposure, escape, arrest or death.

## Mandatory next-MVP acceptance gate

The next Observer World build is NOT successful until all four conditions below are visible in the live version:

1. BUILD ANIMATION:
   every placed object visibly animates into existence or immediately enters a characteristic loop.

2. EVOLVING GLYPH DOCK:
   after use, at least the key action buttons change into new glyphs/actions.

3. FLOATING OBJECT GLYPHS:
   every major built object has a visible glyph above it.

4. GLYPH INSPECTION:
   tapping a floating glyph opens a 35–55 word narrative status/consequence report for that specific object.

## Preservation rule

Do not regress the already successful Observer World foundation while implementing these changes.

Specifically preserve:
- separate `/observer-world/` route;
- medieval visual language;
- red Observers;
- persistent Observer death;
- causal event narration;
- existing old Meta6 page unchanged.

## Learning note

The main lesson from this MVP:

The semantic/gameplay concept works, but static rendering is not enough.

For Chain Reaction, every successful player action must produce three visible layers at once:

ACTION
→ ANIMATED WORLD CHANGE
→ NEW AVAILABLE ACTION
→ INSPECTABLE CONSEQUENCE.

If any one of those layers is missing, the chain reaction feels like a static editor instead of a living historical simulation.
