// A read-only PR check may report only on the exact commit whose guard was checked out.
export function verifyReferenceHead(pr, checkoutHead) {
  const snapshotHead = pr?.head?.sha;
  const valid = value => typeof value === 'string' && /^[a-f0-9]{40}$/.test(value);
  if (!valid(snapshotHead) || !valid(checkoutHead)) throw Error('Reference HEAD is missing or invalid');
  if (snapshotHead !== checkoutHead) {
    throw Error('PR HEAD differs from the checked-out guard; rerun for the current SHA');
  }
}
