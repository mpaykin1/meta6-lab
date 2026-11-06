# CHAIN REACTION — OBSERVER WORLD

Status: canonical game-design direction for Meta6
Date: 2026-09-30

## 1. Core fantasy

Chain Reaction becomes a medieval historical-observation simulation.

The player is not a king, wizard, god, or city-builder. The player is an embedded Observer from a far more advanced civilization, assigned by an Institute of Historical Observation to study a human civilization at the threshold between late feudalism and an early renaissance.

The player can intervene, but every intervention changes the causal graph of history.

Central question:

> You can save people. You can accelerate history. But can you know what your intervention will create ten causal steps later?

The world must never treat the player as omnipotent. The Observer can be exposed, wounded, arrested, or killed.

## 2. Visual world rule: medieval first

All ordinary visible objects must belong to the world's technological level.

Replace generic/modern city visuals with:
- stone city walls, gates, towers and wooden palisades;
- crooked timber-and-stone houses;
- market square, workshops, inns and warehouses;
- castle/citadel and noble estates;
- monastery/temple complex;
- muddy roads, bridges, wells and carts;
- farms, mills, granaries, orchards and pasture;
- docks and river trade where geography allows;
- smithies, tanneries, pottery kilns and bakeries;
- gallows, prison, guard barracks and watch posts;
- plague/fire/riot visual states.

No modern infrastructure may appear unless it is explicitly hidden Observer technology.

## 3. Player role

The player is an Observer working for the fictional Institute of Historical Observation.

The UI should feel like a field observation instrument laid over a living medieval world, not like a spreadsheet.

Player actions:
1. Observe.
2. Record.
3. Place or encourage a macro-object.
4. Protect or evacuate a person.
5. Secretly introduce knowledge.
6. Influence a local actor.
7. Refuse to intervene.
8. Break protocol.
9. Attempt to conceal evidence of intervention.

Every action produces both immediate and delayed consequences.

## 4. Red Observers

Add small RED HUMAN FIGURES as a special semantic layer.

They represent embedded Observers. Red is player-readable metadata; ordinary inhabitants do not literally perceive them as red.

Observer properties:
- identity / cover;
- location;
- health;
- suspicion;
- exposure;
- local relationships;
- knowledge collected;
- protocol violations;
- alive / wounded / captured / dead.

Observers are not immortal. Local guards, assassins, mobs, disease, accidents, war and political purges can kill them.

Death is persistent history, not a simple animation reset.

When an Observer dies, the simulation should retain:
- place and cause of death;
- witnesses;
- evidence left behind;
- impact on local factions;
- lost intelligence;
- whether the Institute can recover the body/equipment;
- resulting changes in future Observer behaviour.

## 5. Narrative event renderer

Do not present consequences primarily as dry numbers.

### Mandatory event-text standard

Every meaningful event must be rendered as ONE short paragraph of roughly 35–55 words.

The paragraph must contain only three things, in this order:

1. WHAT HAPPENED — the concrete event.
2. WORLD REACTION — who reacted and how.
3. POSSIBLE CONSEQUENCE — one or two plausible next effects or risks.

No decorative exposition before the event. No long atmosphere passages. No repeated explanation of motives. No omniscient summary of the whole world.

The prose should still feel like intelligent speculative fiction:
- restrained irony;
- concrete physical or human detail;
- moral ambiguity;
- visible causality;
- tension between local interpretation and Observer knowledge;
- no imitation or reuse of distinctive wording from any named author.

BAD:
"Food -12. Satisfaction -8. Riots +15%."

TOO LONG:
A long literary scene that spends most of its space on weather, scenery, biography, dialogue, or mood before reaching the causal consequence.

TARGET:
"The healer saved a dying boy with two tablets from our container. By evening the city was already calling it a miracle, and the guard captain sent men for him. If they arrest the healer, the source of help is lost. If we intervene, the guard may begin looking for whoever supplied the impossible medicine."

Numbers remain available in diagnostics, but prose is the default player-facing consequence.

This 35–55 word WHAT HAPPENED → WORLD REACTION → POSSIBLE CONSEQUENCE structure is the default for all ordinary Chain Reaction event cards. Longer prose is reserved only for rare major historical turning points.

## 6. Hieroglyph / macro-object vocabulary

### Settlement and infrastructure
- CITY — medieval town
- VILLAGE
- CASTLE / CITADEL
- WALL
- GATE
- BRIDGE
- ROAD
- PORT
- MARKET
- INN
- WELL
- MILL
- GRANARY
- FARM
- MINE
- SMITHY

### Knowledge and culture
- SCHOOL
- LIBRARY / SCRIPTORIUM
- PRINTING WORKSHOP
- HEALER
- SCHOLAR
- INVENTOR
- POET
- MAPMAKER
- ASTRONOMER
- BOOK / IDEA

### Power and coercion
- KING / RULER
- NOBLE
- GUARD
- ARMY
- PRISON
- GALLOWS
- SECRET POLICE
- RELIGIOUS ORDER
- COURT
- TAX COLLECTOR

### Society
- PEASANTS
- ARTISANS
- MERCHANTS
- REFUGEES
- BEGGARS
- BANDITS
- REBELS
- INFORMER
- CROWD

### Crises
- FIRE
- PLAGUE
- FAMINE
- FLOOD
- DROUGHT
- WAR
- SIEGE
- RIOT
- PURGE
- ASSASSINATION
- HERESY / FORBIDDEN IDEA
- RUMOUR

### Observer layer
- OBSERVER (red human)
- SAFE HOUSE
- CONTACT
- HIDDEN CACHE
- EXTRACTION POINT
- BEACON
- SECRET MEDICINE
- FORBIDDEN KNOWLEDGE
- INSTITUTE MESSAGE

## 7. Plot-generating causal chains

Objects must create stories through simulation, not scripted scenes.

Examples:

PRINTING WORKSHOP
→ cheap texts
→ literacy rises
→ forbidden pamphlets
→ authorities become afraid
→ searches
→ arrests
→ underground presses
→ possible revolt OR intellectual flight.

HEALER + PLAGUE
→ mortality falls locally
→ healer gains impossible reputation
→ church/court suspicion
→ investigation
→ Observer must choose concealment, evacuation, or abandonment.

GRANARY + FAMINE
→ food reserve
→ migration toward city
→ rents rise
→ theft
→ guards
→ resentment
→ riot OR political reform.

SCHOLAR + PURGE
→ scholar hides
→ Observer learns location
→ rescue can expose network
→ non-intervention may preserve cover but kill scholar.

CASTLE + TAX COLLECTOR + WAR
→ taxation
→ peasant flight
→ abandoned farms
→ lower harvest
→ food shortage
→ army requisitions
→ rebellion.

There must be no universally "good" glyph. Context determines consequences.

## 8. Factions

Minimum faction simulation:
- Crown;
- nobles;
- city guard;
- religious institution;
- merchants;
- artisans;
- peasants;
- scholars/healers;
- criminal network;
- rebels;
- Observers.

Each faction tracks:
power, fear, wealth, cohesion, knowledge, attitude to other factions, and suspicion of anomalous/Observer activity.

## 9. History engine

Each action enters the existing Chain Reaction causal system.

Required event fields:
- id;
- tick;
- location;
- actors;
- direct cause;
- immediate consequence;
- delayed consequences;
- witnesses;
- rumours generated;
- faction effects;
- casualties;
- Observer exposure effect;
- confidence/uncertainty;
- narrative report.

History must remember causes. A revolt twenty turns later should be traceable to earlier taxes, famine, rumours, killings, rescues and interventions.

## 10. Intervention doctrine

The game needs an explicit protocol meter, but not a simplistic morality score.

Track:
- intervention_depth;
- observer_exposure;
- historical_divergence;
- lives_saved;
- lives_lost;
- knowledge_preserved;
- institutional_stability;
- unintended_consequences.

The Institute may issue recommendations, warnings and orders. It does not tell the player what is morally correct.

## 11. Observer death

An Observer can die.

Possible causes:
- duel;
- arrest/execution;
- assassination;
- mob violence;
- battle;
- plague;
- fire;
- accident;
- failed extraction.

If the player's current Observer dies, the world DOES NOT RESET.

The Institute assigns another Observer after time has passed. The new Observer enters the same history and must deal with the predecessor's consequences.

This is a core feature.

## 12. Narrative arcs the simulation should support

Without copying names, locations, dialogue or protected plot expression, the systems should be able to generate situations such as:
- persecution of educated people by an authoritarian faction;
- an Observer secretly rescuing intellectuals;
- a ruler manipulated by a security chief;
- street militias becoming a political force;
- a religious order exploiting political collapse;
- a beloved local person becoming collateral damage;
- an Observer losing emotional distance;
- a rescue producing a worse political consequence;
- advanced medicine creating rumours of sorcery;
- a hidden Observer network being exposed;
- revolution that destroys the people it meant to liberate;
- a seemingly insignificant rumour changing a dynasty.

## 13. Presentation

Primary screen:
- maximum visible medieval world;
- minimal HUD;
- glyph/action tray;
- red Observer figures visible as semantic overlay;
- short narrative event card only when something meaningful happens.

Optional Institute view:
- causal graph;
- event archive;
- Observer dossiers;
- historical divergence;
- faction graph;
- raw resources/statistics.

The player should first EXPERIENCE history and only then inspect its data.

## 14. MVP implementation order

MVP-1:
- replace CITY with unmistakably medieval town;
- add red Observer;
- Observer can walk/be positioned and can die;
- narrative renderer replaces dry primary event output;
- add CASTLE, GUARD, SCHOLAR, PRISON, MARKET, MONASTERY, GRANARY, FIRE, PLAGUE;
- one complete causal scenario:
  SCHOLAR → persecution → Observer decision → rescue/non-intervention → delayed political consequence.

MVP-2:
- factions + suspicion;
- rumours;
- Observer exposure;
- persistent death and replacement Observer.

MVP-3:
- dynamic political transformations;
- multiple Observers;
- Institute orders;
- generated long causal arcs.

## 15. Acceptance criteria for MVP-1

A player opening Meta6 must immediately understand visually that the world is medieval.

A red Observer is visible.

A scholar can become endangered because of simulated political conditions.

The player receives a meaningful intervention choice.

Either choice changes later events.

The event is described first as an original literary mini-scene, not a stat dump.

The Observer can be killed and the world state continues.

No modern city asset leaks into the medieval world.

## 16. Design principle

Chain Reaction is not a game about finding the correct button.

It is a game about causal responsibility under uncertainty.

The most important unit is not the building, resource, or score.

It is the consequence.
