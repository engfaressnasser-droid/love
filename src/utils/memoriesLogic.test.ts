import test from 'node:test';
import assert from 'node:assert/strict';
import {
  calculateNextAnniversaryCountdown,
  calculateRelationshipLiveDuration,
  filterAndSortMemories,
  validateMemoryInput,
  validateLetterInput,
  formatArabicDate,
  INITIAL_MEMORIES,
  DAILY_ROMANTIC_MESSAGES,
  pickRandomDailyMessage,
} from './memoriesLogic';

test('calculateNextAnniversaryCountdown computes years completed and days remaining', () => {
  // Met 2024-05-21, current date 2026-11-02
  const now = new Date('2026-11-02T12:00:00');
  const countdown = calculateNextAnniversaryCountdown('2024-05-21', now);
  // Next anniversary is 2027-05-21 -> 3 years completed!
  assert.equal(countdown.yearsCompleted, 3);
  assert.ok(countdown.totalDays > 190 && countdown.totalDays < 210);
});

test('calculateRelationshipLiveDuration calculates elapsed days correctly', () => {
  const now = new Date('2026-11-02T12:00:00');
  const duration = calculateRelationshipLiveDuration('2024-05-21', now);
  assert.ok(duration.totalDays > 890); // ~895 days between May 21 2024 and Nov 2 2026
});

test('filterAndSortMemories filters by category, favorites, and search query', () => {
  const all = filterAndSortMemories(INITIAL_MEMORIES, 'all', '', 'newest');
  assert.equal(all.length, 4);
  assert.equal(all[0].id, 'mem-4');

  const favorites = filterAndSortMemories(INITIAL_MEMORIES, 'favorites');
  assert.equal(favorites.length, 3);
  assert.equal(favorites.every((m) => m.isFavorite), true);
});

test('validateMemoryInput rejects empty fields and accepts valid input', () => {
  const invalid = validateMemoryInput({
    title: '',
    date: '',
    location: '',
    story: 'قصير',
  });
  assert.equal(invalid.valid, false);
  assert.ok(invalid.errors.title);

  const valid = validateMemoryInput({
    title: 'عيد حبنا الأول معاً',
    date: '2026-05-14',
    location: 'الإسكندرية',
    story: 'يوم رائع قضيناه على شاطئ البحر معاً.',
  });
  assert.equal(valid.valid, true);
});

test('validateLetterInput validates title and content properly', () => {
  const invalid = validateLetterInput({ title: 'أ', content: '' });
  assert.equal(invalid.valid, false);

  const valid = validateLetterInput({
    title: 'إلى حبيبتي الغالية',
    content: 'كل عام وأنتِ أجمل ما في حياتي.',
  });
  assert.equal(valid.valid, true);
});

test('formatArabicDate formats YYYY-MM-DD into Arabic month names', () => {
  assert.equal(formatArabicDate('2024-05-21'), '21 مايو 2024');
  assert.equal(formatArabicDate('2025-10-05'), '5 أكتوبر 2025');
});

test('pickRandomDailyMessage picks a valid romantic sentence from DAILY_ROMANTIC_MESSAGES', () => {
  assert.ok(DAILY_ROMANTIC_MESSAGES.length >= 10);
  const msg = pickRandomDailyMessage(DAILY_ROMANTIC_MESSAGES);
  assert.equal(DAILY_ROMANTIC_MESSAGES.includes(msg), true);

  const nextMsg = pickRandomDailyMessage(DAILY_ROMANTIC_MESSAGES, msg);
  assert.equal(DAILY_ROMANTIC_MESSAGES.includes(nextMsg), true);
  assert.notEqual(nextMsg, msg);
});

