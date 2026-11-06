# Ad SDK deadline

## Task / why
Confirmed release defect: provider.show returning a never-settling promise leaves show() and busy stuck while consent remains granted. Revocation previously released it, but game flow should not require revoking consent.

## Scope / plan
Only meta-games/ad-adapter.mjs and its existing test plus these notes. Add validated providerTimeoutMs 1..300000 (default60000), settle to existing unavailable result, clear timers in finally, reject late rewards/statistics, do not start backup on timeout because the original SDK might still be visible.

## Preserved
Explicit denial/grant/revocation, cooldown, existing fallback on known rejection, zero default SDK/network, all games, Netlify and five schedules unchanged. Does not cancel an already sent network request or synchronous blocking SDK; external adapter must provide its own cancellation and UI policy.

## Evidence
On unchanged main source 516a782bc115ec2f7b303e44938e4124ebf902c3: original8 PASS, two new tests FAIL (pending forever / invalid deadline accepted). With fix: 10/10 focused Node tests PASS in200ms. Late completion has zero impressions/rewards; subsequent request can complete. Review request is advisory, no approval fabricated.

## Risk / next action / completion
Timer expiry is not a proof that provider UI/network stopped; no overlapping fallback is attempted. Exact-head existing portal CI must run new10-test suite; merge only after technical SUCCESS and no conflicting edits. Real commercial provider integration and revenue remain unclaimed. Publish/deploy result recorded in PR.
