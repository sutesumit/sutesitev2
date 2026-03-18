import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { handleByte, handleBlip } from '../commands/handlers';
import * as repository from '../repository';

vi.mock('../middleware/auth', () => ({
  isAllowed: vi.fn(() => true),
}));

vi.mock('../repository', () => ({
  createByte: vi.fn(),
  createBlip: vi.fn(),
  getBytes: vi.fn(),
  getByteBySerial: vi.fn(),
  updateByte: vi.fn(),
  deleteByte: vi.fn(),
  getBlips: vi.fn(),
  getBlipBySerial: vi.fn(),
  updateBlip: vi.fn(),
  deleteBlip: vi.fn(),
}));

const createMockContext = (match: string | null, userId = 12345) => {
  return {
    from: { id: userId },
    match,
    reply: vi.fn().mockResolvedValue(undefined),
    message: { text: match },
  } as unknown as Parameters<typeof handleByte>[0];
};

const createMockBot = () => ({
  api: {
    sendMessage: vi.fn().mockResolvedValue(undefined),
  },
});

describe('handleByte', () => {
  let mockBot: ReturnType<typeof createMockBot>;

  beforeEach(() => {
    vi.stubEnv('TELEGRAM_CHANNEL_ID', '@testchannel');
    mockBot = createMockBot();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('broadcasts to channel on success', async () => {
    vi.mocked(repository.createByte).mockResolvedValueOnce({
      id: 1,
      byte_serial: '001',
      content: 'Test byte content',
      created_at: '2026-03-18T10:00:00Z',
    });

    const ctx = createMockContext('Test byte content');
    await handleByte(ctx, mockBot as unknown as Parameters<typeof handleByte>[1]);

    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining('001'),
      { parse_mode: 'HTML' }
    );
    expect(mockBot.api.sendMessage).toHaveBeenCalledWith(
      '@testchannel',
      expect.stringContaining('Test byte content'),
      { parse_mode: 'HTML' }
    );
  });

  it('skips broadcast if no TELEGRAM_CHANNEL_ID', async () => {
    vi.unstubAllEnvs();

    vi.mocked(repository.createByte).mockResolvedValueOnce({
      id: 2,
      byte_serial: '002',
      content: 'Another byte',
      created_at: '2026-03-18T10:00:00Z',
    });

    const ctx = createMockContext('Another byte');
    await handleByte(ctx, mockBot as unknown as Parameters<typeof handleByte>[1]);

    expect(ctx.reply).toHaveBeenCalled();
    expect(mockBot.api.sendMessage).not.toHaveBeenCalled();
  });

  it('handles broadcast errors gracefully', async () => {
    vi.mocked(repository.createByte).mockResolvedValueOnce({
      id: 3,
      byte_serial: '003',
      content: 'Byte with broadcast error',
      created_at: '2026-03-18T10:00:00Z',
    });
    mockBot.api.sendMessage.mockRejectedValueOnce(new Error('Channel not found'));

    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    const ctx = createMockContext('Byte with broadcast error');
    await handleByte(ctx, mockBot as unknown as Parameters<typeof handleByte>[1]);

    expect(ctx.reply).toHaveBeenCalled();
    expect(consoleSpy).toHaveBeenCalledWith(
      'Failed to broadcast to channel:',
      expect.any(Error)
    );

    consoleSpy.mockRestore();
  });
});

describe('handleBlip', () => {
  let mockBot: ReturnType<typeof createMockBot>;

  beforeEach(() => {
    vi.stubEnv('TELEGRAM_CHANNEL_ID', '@testchannel');
    mockBot = createMockBot();
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it('broadcasts to channel on success', async () => {
    vi.mocked(repository.createBlip).mockResolvedValueOnce({
      id: 1,
      blip_serial: '001',
      term: 'API',
      meaning: 'Application Programming Interface',
      tags: [],
      created_at: '2026-03-18T10:00:00Z',
      updated_at: '2026-03-18T10:00:00Z',
    });

    const ctx = createMockContext('API:Application Programming Interface');
    await handleBlip(ctx, mockBot as unknown as Parameters<typeof handleBlip>[1]);

    expect(ctx.reply).toHaveBeenCalledWith(
      expect.stringContaining('001'),
      { parse_mode: 'HTML' }
    );
    expect(mockBot.api.sendMessage).toHaveBeenCalledWith(
      '@testchannel',
      expect.stringContaining('API:Application Programming Interface'),
      { parse_mode: 'HTML' }
    );
  });

  it('includes term:meaning in message', async () => {
    vi.mocked(repository.createBlip).mockResolvedValueOnce({
      id: 2,
      blip_serial: '002',
      term: 'REST',
      meaning: 'Representational State Transfer',
      tags: [],
      created_at: '2026-03-18T10:00:00Z',
      updated_at: '2026-03-18T10:00:00Z',
    });

    const ctx = createMockContext('REST:Representational State Transfer');
    await handleBlip(ctx, mockBot as unknown as Parameters<typeof handleBlip>[1]);

    const sendMessageCall = mockBot.api.sendMessage.mock.calls[0];
    expect(sendMessageCall[1]).toContain('REST:Representational State Transfer');
  });

  it('skips broadcast if no TELEGRAM_CHANNEL_ID', async () => {
    vi.unstubAllEnvs();

    vi.mocked(repository.createBlip).mockResolvedValueOnce({
      id: 3,
      blip_serial: '003',
      term: 'Test',
      meaning: 'A test definition',
      tags: [],
      created_at: '2026-03-18T10:00:00Z',
      updated_at: '2026-03-18T10:00:00Z',
    });

    const ctx = createMockContext('Test:A test definition');
    await handleBlip(ctx, mockBot as unknown as Parameters<typeof handleBlip>[1]);

    expect(ctx.reply).toHaveBeenCalled();
    expect(mockBot.api.sendMessage).not.toHaveBeenCalled();
  });
});
