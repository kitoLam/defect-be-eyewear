import { test, expect } from '@playwright/test';
import {
  slugify,
  generateShortUuid,
  generateUniqueSlug,
  extractUuidFromSlug,
} from '../src/utils/slug.util';

test.describe('Slug Utility Tests', () => {
  test('slugify should convert text to lowercase slug format', () => {
    const result = slugify('Hello World');
    expect(result).toBe('hello-world');
  });

  test('slugify should remove Vietnamese diacritics', () => {
    const result = slugify('Xin chào Việt Nam');
    expect(result).toBe('xin-chao-viet-nam');
  });

  test('slugify should remove special characters', () => {
    const result = slugify('Hello @#$% World!!!');
    expect(result).toBe('hello-world');
  });

  test('slugify should replace multiple spaces with single dash', () => {
    const result = slugify('Hello    World   Test');
    expect(result).toBe('hello-world-test');
  });

  test('slugify should remove leading and trailing dashes', () => {
    const result = slugify('  Hello World  ');
    expect(result).toBe('hello-world');
  });

  test('generateShortUuid should return 8 character uppercase string', () => {
    const uuid = generateShortUuid();
    expect(uuid).toHaveLength(8);
    expect(uuid).toMatch(/^[A-Z0-9]{8}$/);
  });

  test('generateShortUuid should generate unique values', () => {
    const uuid1 = generateShortUuid();
    const uuid2 = generateShortUuid();
    expect(uuid1).not.toBe(uuid2);
  });

  test('generateUniqueSlug should combine base slug with UUID', () => {
    const baseSlug = 'test-product';
    const uniqueSlug = generateUniqueSlug(baseSlug);

    expect(uniqueSlug).toContain(baseSlug);
    expect(uniqueSlug).toMatch(/^test-product-[A-Z0-9]{8}$/);
  });

  test('extractUuidFromSlug should extract UUID from valid slug', () => {
    const slug = 'test-product-ABC12345';
    const uuid = extractUuidFromSlug(slug);
    expect(uuid).toBe('ABC12345');
  });

  test('extractUuidFromSlug should return empty string for invalid slug', () => {
    const slug = 'test-product';
    const uuid = extractUuidFromSlug(slug);
    expect(uuid).toBe('');
  });
});
