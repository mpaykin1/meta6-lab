# PR #263 — consent withdrawal during in-flight advertising

Parent: f336598db88b68f7e7ad622f5ac68e6147b04649. Existing branch
ai/chatgpt/meta-games-private-ad-bridge-20261104; no duplicate PR.

Confirmed defects: withdrawal while awaiting SDK did not invalidate its result,
so late completed ads granted rewards and repopulated cleared session counters.
A rejected/unavailable result could invoke a backup SDK after withdrawal.
An SDK that never settled kept the bridge busy indefinitely after withdrawal.

Fix: consent-session version, per-attempt authorization checks, cancellation of
the bridge's wait on withdrawal, and ignoring results from older sessions even
after a later grant. Provider API and existing public response shapes preserved.
This cannot undo an already-started SDK/network operation; provider integration
must implement its own cancellation and consent policy. No commercial partner,
revenue, tracking identifiers, cookies, network calls or SDK installation added.

Verification: existing 5 tests PASS; three new tests FAIL on original code;
after fix 8/8 PASS on Node 24.15.0. Includes late reward, backup after rejection
or empty response, hung SDK withdrawal and immediate regrant isolation.

Next: existing CI on new exact HEAD, independent signed review, then safe merge
only if repository requirements pass. No game changes, publication or independent
review claimed by this OpenAI-authored fix. Netlify and schedules untouched.
