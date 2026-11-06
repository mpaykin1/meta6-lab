# FAILURE RECORD — Observer World: landscape browser chrome + runtime freezes

Date: 2026-09-30
Status: FAILED / MANDATORY REGRESSION BLOCKER
Affected route: `/observer-world/`
Observed on mobile, especially landscape.

This document is intentionally a FAILURE record.

Do not reinterpret these problems as polish.
Do not mark the Observer World mobile experience complete while either issue remains.

---

## Failure 1 — foreign UI / "folders" visible at the top in landscape

### User-visible failure

In horizontal orientation, extra top UI is visible above/over the game.

The required experience is:

GAME ONLY.

No browser tabs.
No bookmark/folder strip.
No browser toolbar.
No page chrome.
No accidental page scroll area.
No non-game overlay that steals visible game space.

### What the current code already does correctly

The current page already contains a strong document-level viewport lock:

- fixed full-screen `html, body`;
- `overflow: hidden`;
- `overscroll-behavior: none`;
- `touch-action: none`;
- `viewport-fit=cover`;
- fixed canvas covering the viewport.

This protects the game from normal page scrolling and gesture-driven layout movement.

### Root cause

The lock controls the DOCUMENT.

It does not control the browser application's own chrome.

Current Observer World code does NOT include:

- standalone/PWA metadata;
- a web app manifest;
- an installed-home-screen standalone launch path;
- a fullscreen API path;
- a landscape-specific runtime check that verifies the visible canvas actually occupies the usable screen.

Therefore the browser can still display its own top chrome in landscape.

On iOS, normal Safari/browser chrome cannot be reliably removed merely with CSS.

### Architectural lesson

`overflow:hidden` is not the same thing as FULLSCREEN.

A game can be perfectly locked inside the browser viewport while the browser still consumes part of the physical display.

### Mandatory prevention standard

Every future mobile game build must distinguish:

1. PAGE VIEWPORT LOCK
   - no scroll;
   - no stretch;
   - no browser pan/zoom gestures inside the canvas.

2. APP-SURFACE FULLSCREEN
   - standalone/PWA launch where supported;
   - manifest + mobile web app metadata;
   - fullscreen API where supported and user-initiated;
   - safe fallback for iOS;
   - explicit test on physical iPhone landscape.

### Required acceptance test

On physical iPhone 11:

PORTRAIT:
- game occupies the intended full game surface;
- no accidental vertical scroll/stretch.

LANDSCAPE:
- only game UI is visible;
- no browser/folder/tab strip occupies the top of the screen;
- canvas dimensions match the actual usable game surface after orientation change.

Synthetic desktop/mobile emulation is NOT sufficient proof.

---

## Failure 2 — game sometimes freezes and must be restarted

### User-visible failure

After some play, the game can stop reacting or stop visibly updating.

The player then has to restart.

Restart destroys the current history.

This is a severe failure for an "infinite historical novel".

A world with history must not disappear because a render/input loop stalls.

---

## Confirmed structural causes in the current code

### Cause A — unbounded world growth

Objects are appended to `S.objects`.

There is no:
- object budget;
- eviction policy;
- chunking;
- sleeping objects;
- world partition;
- maximum active animation count.

The user can continue placing actions indefinitely.

Some actions also create extra huts/actors.

Result:

the active scene grows without an upper bound.

### Cause B — every frame sorts the full object list

Current render logic creates a copy of all objects and sorts it by Y every animation frame.

Conceptually:

`[...S.objects].sort(...)`

This produces unnecessary repeated CPU work.

For N objects this is roughly O(N log N) every frame.

Most objects do not change depth order every frame.

### Cause C — no viewport culling

Objects outside the visible screen are still part of the render work.

The player can pan away, but off-screen objects remain animated and processed.

This directly contradicts the needs of an infinite world.

An infinite world must never mean an infinite active render list.

### Cause D — too many always-live animation loops

Every visible logical object can have characteristic animation.

That is good visually.

But there is currently no:
- distance-based animation LOD;
- off-screen sleep;
- low-frequency simulation tier;
- animation budget;
- frame-time governor.

On an iPhone, enough animated objects can turn the correct design into a performance failure.

### Cause E — fragile render loop

The render loop schedules the next `requestAnimationFrame` from inside the current render call.

There is no global render error recovery.

If an unexpected exception escapes the render function before the next frame is scheduled, animation can stop completely.

To the player this looks exactly like a frozen game.

Mandatory future pattern:

- render loop guarded by error handling;
- next-frame scheduling protected;
- visible diagnostic/recovery state;
- automatic safe restart of rendering without resetting world history.

### Cause F — no visibility/suspend recovery

There is no explicit handling for:

- `visibilitychange`;
- `document.hidden`;
- page resume;
- iOS suspend/resume;
- orientation-related interruption.

Mobile browsers can suspend animation and input while switching UI/orientation/background state.

The game needs explicit resume/revalidation logic.

### Cause G — missing pointer cancellation recovery

The code handles:
- pointerdown;
- pointermove;
- pointerup.

But not:
- pointercancel;
- lostpointercapture.

Mobile Safari can cancel pointer sequences during orientation changes, browser gestures or UI interruptions.

If internal input state remains stuck after cancellation, controls can appear dead or inconsistent.

Mandatory pattern:

`pointercancel → clear active gesture state`
`lostpointercapture → clear active gesture state`

### Cause H — no persistent save

Current Observer World has in-memory `history[]`, but no:

- localStorage;
- IndexedDB;
- server persistence;
- Supabase persistence.

Therefore a forced reload loses the player's world.

This transforms a recoverable runtime failure into catastrophic loss of history.

For this project, persistence is not optional polish.

It is part of the core fiction.

### Cause I — no watchdog / health monitoring

The game does not currently measure:

- frame time;
- last successful frame;
- active object count;
- active animation count;
- input heartbeat;
- long frames;
- repeated errors.

Without a watchdog, the engine cannot distinguish:
- slow frame;
- suspended frame;
- dead render loop;
- dead input state.

---

## Why these failures are connected

The landscape chrome bug and the freeze bug look unrelated, but they share one architectural mistake:

the game currently trusts the browser environment too much.

A robust mobile game shell must actively own:

- viewport;
- lifecycle;
- input;
- rendering;
- persistence;
- recovery.

The game cannot assume that CSS alone provides fullscreen.
The game cannot assume that requestAnimationFrame will always continue.
The game cannot assume pointerup will always arrive.
The game cannot assume reload is harmless.

---

## Mandatory World Server / Chain Reaction rule

All future games must implement a shared **Game Runtime Shell**.

Minimum responsibilities:

### Viewport
- fixed game surface;
- no page scroll;
- no overscroll;
- no browser gesture takeover on game canvas;
- orientation-safe resize;
- safe-area handling;
- standalone/PWA path;
- fullscreen path where available.

### Render resilience
- one supervised render scheduler;
- exception containment;
- frame watchdog;
- resume after visibility/orientation changes;
- adaptive animation quality.

### World scalability
- viewport culling;
- spatial chunks;
- sleeping off-screen entities;
- bounded active animations;
- no full-world sort every frame.

### Input resilience
- pointerdown/move/up;
- pointercancel;
- lostpointercapture;
- reset input state on visibility/orientation changes.

### Persistence
- autosave important world state;
- restore after reload/crash;
- preserve history;
- preserve Observer deaths;
- preserve causal events.

---

## Mandatory regression gates

A mobile build MUST FAIL release if any of these are true:

1. Landscape shows non-game top chrome in the intended fullscreen/standalone test path.
2. Canvas is smaller than the intended usable game surface.
3. Page scroll or bounce moves the game.
4. Pointer cancellation can leave controls stuck.
5. Render loop can die from one uncaught drawing exception.
6. Off-screen entities remain fully animated without a budget.
7. Object count can grow indefinitely with no active-world management.
8. Reload destroys the only copy of the player's historical state.
9. Physical iPhone test has not been performed for portrait AND landscape.

---

## Required technical remediation order

### P0 — Never lose history
Add persistent autosave + recovery.

### P0 — Runtime recovery
Add render watchdog, exception containment, visibility resume, pointer cancellation reset.

### P0 — Fullscreen game shell
Add manifest/standalone support and physical landscape validation.

### P1 — Performance
Add viewport culling and stop rendering/animating off-screen objects.

### P1 — Depth ordering
Stop sorting the entire world every frame.
Sort only when world order changes, or use chunk/layer ordering.

### P1 — Animation governor
Budget active animation work based on frame time/device capability.

### P2 — Long-world architecture
Move from one ever-growing active array to spatial chunks + sleeping simulation.

---

## Canonical failure lesson

A game is not successfully mobile merely because it fits inside a mobile viewport.

And an infinite world is not successfully infinite merely because the engine allows unlimited objects.

The correct target is:

FULL GAME SURFACE
+ BOUNDED ACTIVE WORK
+ RECOVERABLE RENDER LOOP
+ RECOVERABLE INPUT
+ PERSISTENT HISTORY.

Until all five are true, this version must remain marked as technically incomplete on mobile.
