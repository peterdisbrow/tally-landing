/**
 * Tests for blog data and helper functions from lib/blog.js
 */

import { describe, it, expect } from 'vitest';
import {
  BLOG_POSTS,
  getPostBySlug,
  getAllSlugs,
  getAllTags,
  getRelatedPosts,
} from '../lib/blog.jsx';

// ── BLOG_POSTS data integrity ────────────────────────────────────────────────

describe('BLOG_POSTS data', () => {
  it('contains at least one post', () => {
    expect(BLOG_POSTS.length).toBeGreaterThan(0);
  });

  it('every post has required fields', () => {
    const required = [
      'slug', 'title', 'metaTitle', 'metaDescription',
      'excerpt', 'date', 'author', 'authorRole',
      'readTime', 'tags', 'keywords', 'content',
    ];
    for (const post of BLOG_POSTS) {
      for (const field of required) {
        expect(post, `Post "${post.slug}" missing field "${field}"`).toHaveProperty(field);
      }
    }
  });

  it('every slug is a non-empty string', () => {
    for (const post of BLOG_POSTS) {
      expect(typeof post.slug).toBe('string');
      expect(post.slug.length).toBeGreaterThan(0);
    }
  });

  it('every slug is URL-safe (lowercase, hyphens, no spaces)', () => {
    for (const post of BLOG_POSTS) {
      expect(post.slug).toMatch(/^[a-z0-9-]+$/);
    }
  });

  it('all slugs are unique', () => {
    const slugs = BLOG_POSTS.map(p => p.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('every post has at least one tag', () => {
    for (const post of BLOG_POSTS) {
      expect(Array.isArray(post.tags)).toBe(true);
      expect(post.tags.length).toBeGreaterThan(0);
    }
  });

  it('every post has at least one keyword', () => {
    for (const post of BLOG_POSTS) {
      expect(Array.isArray(post.keywords)).toBe(true);
      expect(post.keywords.length).toBeGreaterThan(0);
    }
  });

  it('every post date is valid ISO format (YYYY-MM-DD)', () => {
    for (const post of BLOG_POSTS) {
      expect(post.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(isNaN(new Date(post.date).getTime())).toBe(false);
    }
  });

  it('every post content is a function (React component)', () => {
    for (const post of BLOG_POSTS) {
      expect(typeof post.content).toBe('function');
    }
  });

  it('readTime follows "X min read" format', () => {
    for (const post of BLOG_POSTS) {
      expect(post.readTime).toMatch(/^\d+ min read$/);
    }
  });
});

// ── getPostBySlug ────────────────────────────────────────────────────────────

describe('getPostBySlug', () => {
  it('returns the correct post for a valid slug', () => {
    const first = BLOG_POSTS[0];
    const result = getPostBySlug(first.slug);
    expect(result).toBe(first);
    expect(result.title).toBe(first.title);
  });

  it('returns null for a non-existent slug', () => {
    const result = getPostBySlug('this-slug-does-not-exist');
    expect(result).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(getPostBySlug(undefined)).toBeNull();
  });

  it('returns null for empty string', () => {
    expect(getPostBySlug('')).toBeNull();
  });

  it('is case-sensitive', () => {
    const first = BLOG_POSTS[0];
    expect(getPostBySlug(first.slug.toUpperCase())).toBeNull();
  });
});

// ── getAllSlugs ───────────────────────────────────────────────────────────────

describe('getAllSlugs', () => {
  it('returns an array of objects with slug property', () => {
    const slugs = getAllSlugs();
    expect(Array.isArray(slugs)).toBe(true);
    expect(slugs.length).toBe(BLOG_POSTS.length);
    for (const s of slugs) {
      expect(s).toHaveProperty('slug');
      expect(typeof s.slug).toBe('string');
    }
  });

  it('contains all blog post slugs', () => {
    const slugStrings = getAllSlugs().map(s => s.slug);
    for (const post of BLOG_POSTS) {
      expect(slugStrings).toContain(post.slug);
    }
  });
});

// ── getAllTags ────────────────────────────────────────────────────────────────

describe('getAllTags', () => {
  it('returns an array of unique strings', () => {
    const tags = getAllTags();
    expect(Array.isArray(tags)).toBe(true);
    expect(tags.length).toBeGreaterThan(0);
    expect(new Set(tags).size).toBe(tags.length);
    for (const tag of tags) {
      expect(typeof tag).toBe('string');
    }
  });

  it('includes tags from all posts', () => {
    const tags = getAllTags();
    for (const post of BLOG_POSTS) {
      for (const tag of post.tags) {
        expect(tags).toContain(tag);
      }
    }
  });

  it('does not include duplicates even if posts share tags', () => {
    const tags = getAllTags();
    expect(new Set(tags).size).toBe(tags.length);
  });
});

// ── getRelatedPosts ──────────────────────────────────────────────────────────

describe('getRelatedPosts', () => {
  it('returns an array of posts', () => {
    const first = BLOG_POSTS[0];
    const related = getRelatedPosts(first.slug);
    expect(Array.isArray(related)).toBe(true);
    expect(related.length).toBeGreaterThan(0);
  });

  it('does not include the original post', () => {
    const first = BLOG_POSTS[0];
    const related = getRelatedPosts(first.slug);
    for (const post of related) {
      expect(post.slug).not.toBe(first.slug);
    }
  });

  it('respects the count parameter', () => {
    const first = BLOG_POSTS[0];
    const related1 = getRelatedPosts(first.slug, 1);
    expect(related1.length).toBe(1);

    const related3 = getRelatedPosts(first.slug, 3);
    expect(related3.length).toBeLessThanOrEqual(3);
  });

  it('defaults to 2 results', () => {
    const first = BLOG_POSTS[0];
    const related = getRelatedPosts(first.slug);
    expect(related.length).toBe(2);
  });

  it('returns first N posts for a non-existent slug', () => {
    const related = getRelatedPosts('nonexistent-slug', 2);
    expect(related.length).toBe(2);
    expect(related[0].slug).toBe(BLOG_POSTS[0].slug);
  });

  it('prefers posts with shared tags', () => {
    // Find a post with the "Setup Guide" tag
    const setupPost = BLOG_POSTS.find(p => p.tags.includes('Setup Guide'));
    if (!setupPost) return; // skip if no such post
    const related = getRelatedPosts(setupPost.slug, 1);
    // The top related post should share a tag
    const sharedTags = related[0].tags.filter(t => setupPost.tags.includes(t));
    expect(sharedTags.length).toBeGreaterThan(0);
  });
});
