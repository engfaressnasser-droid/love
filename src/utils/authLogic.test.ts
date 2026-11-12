import test from 'node:test';
import assert from 'node:assert/strict';
import { authenticateUser, canEditSite } from './authLogic';

test('authenticateUser logs in girlfriend with "14/2" (including Arabic numerals and whitespace)', () => {
  const resultStandard = authenticateUser('14/2');
  assert.equal(resultStandard.success, true);
  assert.equal(resultStandard.role, 'love');
  assert.equal(canEditSite(resultStandard.role), false);

  const resultArabicDigits = authenticateUser('  ١٤/٢  ');
  assert.equal(resultArabicDigits.success, true);
  assert.equal(resultArabicDigits.role, 'love');
});

test('authenticateUser logs in Ahmed with "احمد" or "أحمد" or "ahmed" with full admin permissions', () => {
  const resultPlain = authenticateUser('احمد');
  assert.equal(resultPlain.success, true);
  assert.equal(resultPlain.role, 'admin');
  assert.equal(canEditSite(resultPlain.role), true);

  const resultHamza = authenticateUser('أحمد');
  assert.equal(resultHamza.success, true);
  assert.equal(resultHamza.role, 'admin');
  assert.equal(canEditSite(resultHamza.role), true);
});

test('authenticateUser rejects incorrect passcodes secretly without leaking credentials', () => {
  const empty = authenticateUser('');
  assert.equal(empty.success, false);
  assert.equal(empty.role, 'guest');
  assert.ok(empty.errorMessage);
  assert.equal(empty.errorMessage?.includes('14/2'), false);
  assert.equal(empty.errorMessage?.includes('احمد'), false);

  const wrong = authenticateUser('love');
  assert.equal(wrong.success, false);
  assert.equal(wrong.role, 'guest');
  assert.equal(wrong.errorMessage?.includes('14/2'), false);
  assert.equal(wrong.errorMessage?.includes('احمد'), false);
});
