# CANONICAL STANDARD — Infinite Image-Symbolic Interactive Novel

Status: canonical target architecture and product standard
Project: Meta6 / Chain Reaction / Observer World
Date: 2026-09-30

## 1. Canonical definition

The target form of Chain Reaction is an **infinite image-symbolic interactive novel**.

The core loop is:

SYMBOL
→ WORLD OBJECT / ACTION
→ VISIBLE ANIMATION
→ WORLD REACTION
→ NEW AVAILABLE SYMBOL / ACTION
→ INSPECTABLE NARRATIVE CONSEQUENCE
→ NEW CAUSES
→ NEXT HISTORICAL STATE

The player does not merely read a story and does not merely place buildings.

The player places causes into a living historical system.

The world responds through:
- images;
- animation;
- symbols;
- autonomous reactions;
- human consequences;
- institutions;
- narrative prose;
- persistent historical memory.

Every consequence should be able to become a new cause.

That is the canonical meaning of "infinite".

---

## 2. Status legend

### ✅ 100% IMPLEMENTED IN CURRENT OBSERVER WORLD MVP
The feature exists in the current live implementation and is accepted as a successful reference.

### 🟡 PARTIALLY IMPLEMENTED
The basic mechanism exists, but the deeper systemic version described by the canonical concept is not complete.

### ❌ TO BUILD
The feature is part of the canonical target but is not implemented in the current Observer World code.

---

## 3. Current canonical implementation status

| Idea | Status | Current reality / target |
|---|---|---|
| Separate medieval Observer World version | ✅ 100% | Exists at /observer-world/ without replacing old Meta6 |
| Medieval world language | ✅ 100% | Well, market, school, castle, monastery, guard, prison, granary, healer, fire, plague |
| Red Observers | ✅ 100% | Distinct red humans exist |
| Observer can be killed | ✅ 100% | killObserver exists |
| World continues after Observer death | ✅ 100% | Death does not reset the simulation |
| Meaningful object animations | ✅ 100% | drawActivity provides characteristic living animation |
| Construction / appearance effect | ✅ 100% | drawBuildEffect gives visible creation feedback |
| Floating glyph above major object | ✅ 100% | drawGlyph exists and tracks objects in screen space |
| Floating glyph is interactive | ✅ 100% | Glyph hit targets open inspection |
| Closable narrative inspection window | ✅ 100% | inspectModal + openInspect + close action |
| Narrative instead of dry primary stat dump | ✅ 100% | Player-facing descriptions explain current event and possible consequence |
| Compact event prose standard | ✅ 100% | WHAT HAPPENED → WORLD REACTION → POSSIBLE CONSEQUENCE |
| Evolving action dock | ✅ 100% | NEXT_ACTION transforms used actions |
| WELL → SETTLEMENT → COUNCIL | ✅ 100% | Implemented |
| MARKET → GUILD → TAX | ✅ 100% | Implemented |
| SCHOOL → SCHOLAR → PRINTING | ✅ 100% | Implemented |
| CASTLE → COURT → DECREE | ✅ 100% | Implemented |
| MONASTERY → RELIEF → DOCTRINE | ✅ 100% | Implemented |
| GUARD → PATROL → MILITIA | ✅ 100% | Implemented |
| PRISON → INQUIRY → PARDON | ✅ 100% | Implemented |
| GRANARY → RATION → CARAVAN | ✅ 100% | Implemented |
| HEALER → QUARANTINE → HOSPITAL | ✅ 100% | Implemented |
| FIRE → BRIGADE → WATCH | ✅ 100% | Implemented |
| PLAGUE → CORDON → BURIAL | ✅ 100% | Implemented |
| OBSERVER → CONTACT → EXTRACTION | ✅ 100% | Implemented |
| Actions produce visible causal consequences | ✅ 100% | Placement changes state and produces narrative consequences |
| In-memory event history | 🟡 PARTIAL | history[] exists, but it is not yet a full causal history engine |
| Object meaning changes through context | 🟡 PARTIAL | Some inspection texts inspect nearby guards/plague/healers; systemic contextual reasoning is still shallow |
| Multiple causal branches | 🟡 PARTIAL | Action-successor chains exist, but branch topology is still mostly authored |
| Emergent settlement growth | 🟡 PARTIAL | Well/market can create inhabitants/huts, but full autonomous urban growth is not yet present |
| Observer suspicion/exposure | 🟡 PARTIAL | suspicion exists; full evidence/witness/exposure network is not yet built |
| Knowledge vs authority conflict | 🟡 PARTIAL | School/scholar/prison/guard logic exists, but not yet a full institutional simulation |
| Disease + healer interactions | 🟡 PARTIAL | Context interaction exists, but epidemic simulation is not yet systemic |
| Generated narrative from live world state | 🟡 PARTIAL | Text varies by object/context, but is primarily authored templates rather than generative narrative |
| Fully emergent plot | ❌ TO BUILD | Current plot space is still largely authored |
| Long causal graph | ❌ TO BUILD | Need explicit parent/child cause graph spanning many events |
| Causal trace over tens/hundreds of turns | ❌ TO BUILD | Need historical ancestry of events |
| Persistent history after reload | ❌ TO BUILD | No localStorage / IndexedDB / backend persistence in Observer World current code |
| Character biographies | ❌ TO BUILD | Need named persistent people with life history |
| Character aging | ❌ TO BUILD | Need time/age lifecycle |
| Genealogy / descendants | ❌ TO BUILD | Need parent-child relationships and generational continuity |
| Child → officer → political actor → dynasty chain | ❌ TO BUILD | Canonical example, not implemented |
| Persistent institutions | ❌ TO BUILD | Institutions need identity, history, leadership and memory |
| Faction system | ❌ TO BUILD | Need Crown, nobles, guard, religious order, merchants, artisans, peasants, scholars, criminals, rebels, Observers |
| Faction power / fear / wealth / cohesion | ❌ TO BUILD | Defined in design, absent from current code |
| Faction-to-faction attitudes | ❌ TO BUILD | Not yet present |
| Autonomous political struggle | ❌ TO BUILD | Not yet present |
| Regime formation | ❌ TO BUILD | Merchant republic, military rule, theocracy etc. should emerge from state |
| Regime transitions | ❌ TO BUILD | Republic → dictatorship → restoration etc. should arise causally |
| Revolution simulation | ❌ TO BUILD | Need systemic unrest → organization → uprising → aftermath |
| Rumour propagation | ❌ TO BUILD | Need source, witnesses, mutation, spread, belief |
| Witness/evidence system | ❌ TO BUILD | Needed for Observer exposure and political events |
| Persistent Observer evidence | ❌ TO BUILD | Bodies, equipment, witnesses and discoveries must persist |
| Replacement Observer entering same history | 🟡 PARTIAL | Concept exists and Observer can be added, but no full succession workflow |
| Institute orders / protocol | ❌ TO BUILD | Need explicit directives, violations and consequences |
| Historical divergence metric | ❌ TO BUILD | Not yet present |
| Lives saved/lost lineage | ❌ TO BUILD | Not yet traceable through causal graph |
| Knowledge preservation/loss | ❌ TO BUILD | Not yet systemic |
| Unintended consequence metric | ❌ TO BUILD | Not yet systemic |
| AI-generated literary reports | ❌ TO BUILD | Current Observer World has no AI provider call |
| AI interpreting full world snapshot | ❌ TO BUILD | Need world state → AI narrative / forecast |
| Unique prose for unique situations | ❌ TO BUILD | Current prose is mostly predefined |
| Autonomous NPC goals | ❌ TO BUILD | Need people acting without player placement |
| Autonomous migration | ❌ TO BUILD | Need population movement driven by world conditions |
| Autonomous economy | ❌ TO BUILD | Need production, scarcity, prices, ownership, trade |
| Autonomous crime | ❌ TO BUILD | Need theft/banditry/corruption from conditions |
| Autonomous religion / ideology | ❌ TO BUILD | Need beliefs and institutions to react dynamically |
| Knowledge diffusion | ❌ TO BUILD | Need ideas to spread between people/groups |
| Printing accelerates idea propagation | ❌ TO BUILD | Canonical mechanic, not yet systemic |
| City visibly changes by social state | ❌ TO BUILD | Need districts, poverty, wealth, damage, crowd states etc. |
| World can continue indefinitely | ❌ TO BUILD | Current MVP can continue placing actions, but lacks generational systemic infinity |
| Every consequence becomes a potential cause | 🟡 PARTIAL | Achieved in authored action evolution; needs generalized causal engine |
| Player decisions reveal player tendencies | ❌ TO BUILD | Need decision history analysis |
| Game can act as causal-thinking trainer | 🟡 PARTIAL | Core interaction supports it; deeper simulation required |
| Historical learning through causes instead of dates | 🟡 PARTIAL | Concept already visible, but needs richer systems |
| Same engine usable outside medieval setting | ❌ TO BUILD | Architecture target only |
| Symbols as reusable semantic primitives | 🟡 PARTIAL | Current glyph system proves the idea; generalized symbolic grammar still needed |
| Symbol itself has a biography | 🟡 PARTIAL | NEXT_ACTION demonstrates this; needs arbitrary branching and memory |
| Image + symbol + animation + prose are one state | ✅ 100% | Current Observer World already demonstrates this interaction pattern |
| UI is part of the narrative system | ✅ 100% | Action evolution and floating glyphs prove this |
| Death is history, not GAME OVER | ✅ 100% for Observer MVP | Observer death persists within current running world |
| "First in the world" claim | ❌ NOT VERIFIED | Treat as a working creative/product claim until comparative research establishes historical priority |

---

## 4. Canonical product principles

These are not optional polish. They are the target identity of the product.

### Principle A — The symbol is a seed, not a button

A glyph must not merely mean "build object X".

It should represent a semantic cause that can evolve.

Example:

WELL
→ SETTLEMENT
→ COUNCIL
→ LAW
→ PROPERTY
→ CONFLICT.

The current evolving action dock is the first reference implementation of this idea.

### Principle B — Every object must be readable in four simultaneous languages

Every important object should communicate through:

1. IMAGE — what it physically is.
2. ANIMATION — what it is currently doing.
3. SYMBOL — what semantic role it represents.
4. PROSE — what it means in the current history.

These four layers must describe the same world state.

### Principle C — The player places causes, not outcomes

The player should not select:
"Create revolution."

The player creates conditions:
- hunger;
- printing;
- repression;
- inequality;
- armed citizens;
- rumours.

The revolution, if it happens, should be an emergent consequence.

### Principle D — No universally good action

A useful intervention must be able to create later harm.

A harmful-looking event may later create useful change.

The game must resist simple moral optimization.

### Principle E — History must remember

The system should eventually be able to answer:

"Why does this event exist?"

and trace it backward through:

current event
→ prior institution
→ prior conflict
→ prior person
→ prior intervention
→ original glyph/action.

### Principle F — Characters must outlive their immediate event

A child saved early in the simulation may later become:
- soldier;
- scholar;
- ruler;
- rebel;
- parent of another key actor.

This is mandatory for the full "infinite novel" vision.

### Principle G — Death must generate history

Death should create:
- witnesses;
- rumours;
- inheritance;
- fear;
- revenge;
- evidence;
- succession;
- institutional change.

Death is a causal event, not a reset.

### Principle H — The world should eventually write scenes that were not authored in advance

The canonical target is not a giant library of prepared branches.

The target is:

WORLD STATE
+ ACTORS
+ MEMORY
+ INSTITUTIONS
+ CAUSAL GRAPH
→ NEW EVENT
→ NEW NARRATIVE.

---

## 5. Canonical architecture still required

To move from the current successful MVP to the full invention, build these systems.

### A. Causal Graph Engine

Every event needs:
- event_id;
- parent_event_ids;
- direct cause;
- enabling conditions;
- actor ids;
- location;
- immediate effects;
- delayed effects;
- confidence;
- Observer involvement.

### B. Persistent Historical Memory

Persist:
- people;
- objects;
- institutions;
- events;
- relationships;
- rumours;
- deaths;
- evidence;
- lineages;
- unresolved causes.

Reloading the page must not erase history.

### C. Character Lifecycle Engine

Each important person needs:
- identity;
- age;
- family;
- profession;
- beliefs;
- relationships;
- injuries;
- reputation;
- faction;
- memories;
- goals;
- alive/dead state.

### D. Genealogy and Succession

Required:
- parent-child relations;
- inheritance;
- dynastic succession;
- institutional succession;
- legacy of dead actors.

### E. Faction Simulation

Minimum factions:
- Crown;
- nobles;
- guard;
- religious institution;
- merchants;
- artisans;
- peasants;
- scholars/healers;
- criminal networks;
- rebels;
- Observers.

Track:
- power;
- fear;
- wealth;
- cohesion;
- knowledge;
- legitimacy;
- attitudes;
- suspicion.

### F. Rumour and Evidence Engine

Rumours need:
- source;
- witnesses;
- confidence;
- mutation;
- spread;
- faction uptake.

Evidence needs:
- owner;
- location;
- discovery;
- interpretation;
- political effect.

### G. Autonomous Economy and Population

Need:
- food;
- water;
- housing;
- production;
- trade;
- scarcity;
- prices;
- wages;
- migration;
- class formation.

### H. Autonomous Politics

Need causal emergence of:
- councils;
- oligarchies;
- monarchies;
- military regimes;
- theocracies;
- republics;
- revolutionary governments.

No direct "choose regime" button.

### I. Knowledge / Idea Diffusion

Ideas must:
- originate;
- spread;
- mutate;
- be taught;
- printed;
- censored;
- forgotten;
- rediscovered.

### J. Generative Narrative Engine

Input:
- local world snapshot;
- causal parents;
- involved actors;
- current institutional tensions;
- uncertainty.

Output:
35–55 words by default:

WHAT HAPPENED
→ WORLD REACTION
→ POSSIBLE CONSEQUENCE.

Rare historical turning points may use longer text.

### K. Observer / Institute System

Need:
- cover identity;
- orders;
- protocol;
- violations;
- evidence;
- suspicion;
- extraction;
- death;
- replacement Observer;
- historical divergence.

---

## 6. Priority order from current MVP

### PRIORITY 1 — Persistent causal history

The next major technical step should make current events survive reload and explicitly reference their causes.

Without this, the novel cannot become truly historical.

### PRIORITY 2 — Persistent named characters

Replace anonymous event-only people with persistent actors.

This enables biography, memory, death and generational history.

### PRIORITY 3 — Factions and institutions

Give social forces persistent state independent of player actions.

### PRIORITY 4 — Autonomous event generation

Let the world create new events without requiring a player to place every cause manually.

### PRIORITY 5 — AI narrative generation

Generate short original reports from real world state rather than only selecting authored prose.

### PRIORITY 6 — Genealogy and multi-generation consequence chains

This is the step that converts a causal simulation into a genuinely long-form historical novel.

---

## 7. Definition of full success

The invention reaches its full intended form when this can happen without a prewritten script:

1. Player places a WELL.
2. Families settle nearby.
3. One child is born.
4. A market emerges.
5. The child becomes literate because a SCHOOL exists.
6. The child becomes an officer because war later occurs.
7. The officer suppresses a revolt caused by grain rationing.
8. A relative of someone killed in the revolt joins an underground movement.
9. Printing spreads that movement's ideas.
10. The regime changes.
11. The officer's descendant becomes a ruler or revolutionary.
12. The system can trace the chain back to the original WELL.
13. The player can click any major glyph and receive a current literary account generated from the actual state.
14. None of this exact chain was authored in advance.

At that point the system is no longer merely a branching narrative.

It is a generative historical novel.

---

## 8. Canonical product statement

The project should preserve this formulation as the design target:

> An infinite image-symbolic interactive novel is a system in which the reader places symbolic causes into a visible world, watches them become animated social reality, and then reads the consequences generated by the history that emerges.

This is the canonical target.

The current Observer World is the successful first working reference for:
- animated symbolic objects;
- evolving actions;
- floating interactive glyphs;
- narrative inspection;
- persistent-in-session Observer death;
- causal presentation.

Everything marked PARTIAL or TO BUILD remains mandatory work toward the full invention.
