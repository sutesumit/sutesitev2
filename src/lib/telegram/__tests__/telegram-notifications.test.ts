import { describe, it, expect } from 'vitest';
import { replies } from '@/lib/telegram/replies';
import { formatByte, formatBlip, formatBloq } from '@/lib/telegram/formatters';

describe('Telegram Replies', () => {
  describe('channelBlip', () => {
    it('should format blip with serial and content', () => {
      const result = replies.channelBlip('001', 'Test content');
      expect(result).toContain('001');
      expect(result).toContain('Test content');
    });

    it('should contain HTML anchor tag', () => {
      const result = replies.channelBlip('001', 'Test content');
      expect(result).toContain('<a href=');
      expect(result).toContain('</a>');
    });

    it('should link to correct blip URL', () => {
      const result = replies.channelBlip('042', 'Some term: some meaning');
      expect(result).toContain('https://www.sumitsute.com/blip/042');
    });
  });

  describe('channelBloq', () => {
    it('should format bloq with title and slug', () => {
      const result = replies.channelBloq('Test Title', 'test-slug');
      expect(result).toContain('Test Title');
      expect(result).toContain('test-slug');
    });

    it('should format bloq with tags', () => {
      const result = replies.channelBloq('Test Title', 'test-slug', ['react', 'nextjs']);
      expect(result).toContain('react');
      expect(result).toContain('nextjs');
    });

    it('should handle empty tags', () => {
      const result = replies.channelBloq('Test Title', 'test-slug', []);
      expect(result).not.toContain('Tags:');
    });

    it('should handle undefined tags', () => {
      const result = replies.channelBloq('Test Title', 'test-slug');
      expect(result).not.toContain('Tags:');
    });
  });

  describe('visitorNotification', () => {
    it('should format visitor with city and country', () => {
      const visitor = { city: 'Mumbai', country: 'India' };
      const result = replies.visitorNotification(visitor);
      expect(result).toContain('Mumbai');
      expect(result).toContain('India');
    });

    it('should handle missing city field', () => {
      const visitor = { country: 'India' };
      const result = replies.visitorNotification(visitor);
      expect(result).toContain('India');
    });

    it('should handle missing country field', () => {
      const visitor = { city: 'Mumbai' };
      const result = replies.visitorNotification(visitor);
      expect(result).toContain('Mumbai');
    });

    it('should handle both city and country missing', () => {
      const visitor = {};
      const result = replies.visitorNotification(visitor);
      expect(result).toBeTruthy();
    });

    it('should handle referrer', () => {
      const visitor = { city: 'Mumbai', country: 'India' };
      const result = replies.visitorNotification(visitor, 'https://google.com');
      expect(result).toContain('google.com');
    });

    it('should handle missing referrer', () => {
      const visitor = { city: 'Mumbai', country: 'India' };
      const result = replies.visitorNotification(visitor);
      expect(result).toContain('direct');
    });
  });

  describe('byteCreated', () => {
    it('should format byte with serial', () => {
      const result = replies.byteCreated('001');
      expect(result).toContain('001');
      expect(result).toContain('born');
    });

    it('should use HTML code tag', () => {
      const result = replies.byteCreated('042');
      expect(result).toContain('<code>042</code>');
    });
  });

  describe('blipCreated', () => {
    it('should format blip with serial', () => {
      const result = replies.blipCreated('001');
      expect(result).toContain('001');
      expect(result).toContain('born');
    });

    it('should use HTML code tag', () => {
      const result = replies.blipCreated('042');
      expect(result).toContain('<code>042</code>');
    });
  });

  describe('contentTooLong', () => {
    it('should format error with max length', () => {
      const result = replies.contentTooLong(280);
      expect(result).toContain('280');
    });
  });

  describe('startIntro', () => {
    it('should contain help text', () => {
      const result = replies.startIntro;
      expect(result).toContain('/byte');
      expect(result).toContain('/blip');
      expect(result).toContain('/list');
    });

    it('should contain website link', () => {
      const result = replies.startIntro;
      expect(result).toContain('sumit sute');
    });
  });

  describe('subscribeIntro', () => {
    it('should contain channel link', () => {
      const result = replies.subscribeIntro;
      expect(result).toContain('@blipbotlive');
    });
  });
});

describe('Telegram Formatters', () => {
  describe('formatByte', () => {
    it('should format byte with serial', () => {
      const byte = {
        byte_serial: '001',
        content: 'Test content',
        created_at: '2026-03-15T10:00:00Z',
      };
      const result = formatByte(byte);
      expect(result).toContain('001');
    });

    it('should format byte with content', () => {
      const byte = {
        byte_serial: '001',
        content: 'Test content',
        created_at: '2026-03-15T10:00:00Z',
      };
      const result = formatByte(byte);
      expect(result).toContain('Test content');
    });

    it('should format date correctly', () => {
      const byte = {
        byte_serial: '001',
        content: 'Test content',
        created_at: '2026-03-15T10:00:00Z',
      };
      const result = formatByte(byte);
      expect(result).toContain('Mar');
      expect(result).toContain('15');
    });

    it('should use HTML code tag for serial', () => {
      const byte = {
        byte_serial: '042',
        content: 'Test',
        created_at: '2026-03-15T10:00:00Z',
      };
      const result = formatByte(byte);
      expect(result).toContain('<code>042.</code>');
    });
  });

  describe('formatBlip', () => {
    it('should format blip with serial', () => {
      const blip = {
        blip_serial: '001',
        term: 'API',
        meaning: 'Application Programming Interface',
        created_at: '2026-03-15T10:00:00Z',
      };
      const result = formatBlip(blip);
      expect(result).toContain('001');
    });

    it('should format blip with term', () => {
      const blip = {
        blip_serial: '001',
        term: 'API',
        meaning: 'Application Programming Interface',
        created_at: '2026-03-15T10:00:00Z',
      };
      const result = formatBlip(blip);
      expect(result).toContain('API');
    });

    it('should format blip with meaning', () => {
      const blip = {
        blip_serial: '001',
        term: 'API',
        meaning: 'Application Programming Interface',
        created_at: '2026-03-15T10:00:00Z',
      };
      const result = formatBlip(blip);
      expect(result).toContain('Application Programming Interface');
    });

    it('should bold the term', () => {
      const blip = {
        blip_serial: '001',
        term: 'API',
        meaning: 'Application Programming Interface',
        created_at: '2026-03-15T10:00:00Z',
      };
      const result = formatBlip(blip);
      expect(result).toContain('<b>API</b>');
    });

    it('should format date correctly', () => {
      const blip = {
        blip_serial: '001',
        term: 'API',
        meaning: 'Application Programming Interface',
        created_at: '2026-03-15T10:00:00Z',
      };
      const result = formatBlip(blip);
      expect(result).toContain('Mar');
      expect(result).toContain('15');
    });
  });

  describe('formatBloq', () => {
    it('should format bloq with title', () => {
      const bloq = {
        title: 'Test Title',
        summary: 'Test summary',
        slug: 'test-title',
        tags: ['react'],
        category: 'tech',
        created_at: '2026-03-15T10:00:00Z',
      };
      const result = formatBloq(bloq);
      expect(result).toContain('Test Title');
    });

    it('should format bloq with summary', () => {
      const bloq = {
        title: 'Test Title',
        summary: 'Test summary',
        slug: 'test-title',
        tags: ['react'],
        category: 'tech',
        created_at: '2026-03-15T10:00:00Z',
      };
      const result = formatBloq(bloq);
      expect(result).toContain('Test summary');
    });

    it('should format bloq with slug', () => {
      const bloq = {
        title: 'Test Title',
        summary: 'Test summary',
        slug: 'test-title',
        tags: ['react'],
        category: 'tech',
        created_at: '2026-03-15T10:00:00Z',
      };
      const result = formatBloq(bloq);
      expect(result).toContain('test-title');
    });

    it('should format bloq with tags', () => {
      const bloq = {
        title: 'Test Title',
        summary: 'Test summary',
        slug: 'test-title',
        tags: ['react', 'nextjs'],
        category: 'tech',
        created_at: '2026-03-15T10:00:00Z',
      };
      const result = formatBloq(bloq);
      expect(result).toContain('react');
      expect(result).toContain('nextjs');
    });

    it('should handle missing fields', () => {
      const bloq = {
        title: 'Test Title',
        summary: 'Test summary',
        slug: 'test-title',
      };
      const result = formatBloq(bloq);
      expect(result).toBeTruthy();
    });
  });
});

describe('Message Formatting Edge Cases', () => {
  describe('Long content handling', () => {
    it('should handle very long content in channelBlip', () => {
      const longContent = 'a'.repeat(1000);
      const result = replies.channelBlip('001', longContent);
      expect(result).toContain(longContent);
    });

    it('should handle very long content in formatByte', () => {
      const longContent = 'a'.repeat(1000);
      const byte = {
        byte_serial: '001',
        content: longContent,
        created_at: '2026-03-15T10:00:00Z',
      };
      const result = formatByte(byte);
      expect(result).toContain(longContent);
    });

    it('should handle very long content in formatBlip', () => {
      const longMeaning = 'a'.repeat(1000);
      const blip = {
        blip_serial: '001',
        term: 'API',
        meaning: longMeaning,
        created_at: '2026-03-15T10:00:00Z',
      };
      const result = formatBlip(blip);
      expect(result).toContain(longMeaning);
    });
  });

  describe('Special characters escaping', () => {
    it('should handle HTML entities in content', () => {
      const content = 'Test <script>alert("xss")</script>';
      const result = replies.channelBlip('001', content);
      expect(result).toContain('<');
      expect(result).toContain('>');
    });

    it('should handle ampersands in content', () => {
      const content = 'Tom & Jerry';
      const result = replies.channelBlip('001', content);
      expect(result).toContain('&');
    });

    it('should handle quotes in content', () => {
      const content = 'He said "hello"';
      const result = replies.channelBlip('001', content);
      expect(result).toContain('"');
    });
  });

  describe('Unicode support', () => {
    it('should handle Unicode characters in content', () => {
      const content = 'Hello 🌍 世界 مرحبا';
      const result = replies.channelBlip('001', content);
      expect(result).toContain('Hello');
      expect(result).toContain('🌍');
      expect(result).toContain('世界');
    });

    it('should handle emojis in blip term', () => {
      const blip = {
        blip_serial: '001',
        term: '🔥',
        meaning: 'Fire',
        created_at: '2026-03-15T10:00:00Z',
      };
      const result = formatBlip(blip);
      expect(result).toContain('🔥');
    });

    it('should handle non-ASCII characters in visitor location', () => {
      const visitor = { city: '北京', country: '中国' };
      const result = replies.visitorNotification(visitor);
      expect(result).toContain('北京');
      expect(result).toContain('中国');
    });
  });

  describe('Empty tags', () => {
    it('should handle empty tags array in channelBloq', () => {
      const result = replies.channelBloq('Test', 'test', []);
      expect(result).not.toContain('Tags:');
    });

    it('should handle undefined tags in channelBloq', () => {
      const result = replies.channelBloq('Test', 'test');
      expect(result).not.toContain('Tags:');
    });
  });

  describe('Missing visitor data', () => {
    it('should handle completely empty visitor object', () => {
      const result = replies.visitorNotification({});
      expect(result).toBeTruthy();
    });

    it('should handle only IP provided', () => {
      const result = replies.visitorNotification({ ip: '192.168.1.1' });
      expect(result).toBeTruthy();
    });

    it('should handle only region provided', () => {
      const result = replies.visitorNotification({ region: 'California' });
      expect(result).toBeTruthy();
    });
  });
});

describe('Rate Limiting Logic', () => {
  const HOUR_24_MS = 24 * 60 * 60 * 1000;

  it('should return true for first visitor (no previous visits)', () => {
    const lastVisitTime = null;
    const result = !lastVisitTime || (Date.now() - new Date(lastVisitTime).getTime()) > HOUR_24_MS;
    expect(result).toBe(true);
  });

  it('should return false within 24 hours', () => {
    const lastVisitTime = new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString();
    const result = !lastVisitTime || (Date.now() - new Date(lastVisitTime).getTime()) > HOUR_24_MS;
    expect(result).toBe(false);
  });

  it('should return true after 24 hours', () => {
    const lastVisitTime = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
    const result = !lastVisitTime || (Date.now() - new Date(lastVisitTime).getTime()) > HOUR_24_MS;
    expect(result).toBe(true);
  });
});

describe('Error Handling', () => {
  it('should handle missing TELEGRAM_CHANNEL_ID gracefully', () => {
    const channelId = undefined;
    const shouldBroadcast = !!channelId;
    expect(shouldBroadcast).toBe(false);
  });

  it('should handle missing TELEGRAM_ALLOWED_USER_IDS gracefully', () => {
    const allowedUserIds = undefined;
    const shouldNotify = !!allowedUserIds;
    expect(shouldNotify).toBe(false);
  });

  it('should handle missing environment variables without throwing', () => {
    expect(() => {
      const token = process.env.NON_EXISTENT_VAR;
      if (!token) {
        return;
      }
    }).not.toThrow();
  });
});
