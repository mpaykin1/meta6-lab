// Shared acceptance predicate for the real native Island floating-stick input.
// Used unchanged in both the positive owner browser gate and the live mutation test.
import assert from 'node:assert/strict';

export function assertNativeMobileMovement(sample) {
  assert(sample?.input?.vx > .15, 'actual touch joystick did not feed player controls');
  assert(sample.input.stickId !== null && sample.input.stickId !== undefined,
    'native floating touch pointer not captured on canvas');
}
