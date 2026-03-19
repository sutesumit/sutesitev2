export const replies = {
  unauthorized: "Nice try, but nope. This bot is not for you.",
  noBytes: "Crickets... no bytes yet.",
  noBlips: "Crickets... nothing here yet.",
  blipNotFound: "That blip doesn't exist (yet?)",
  byteCreated: (serial: string) => `Byte <code>${serial}</code> is born!`,
  blipCreated: (serial: string) => `Blip <code>${serial}</code> is born!`,
  blipUpdated: (serial: string) => `Blip <code>${serial}</code> got a makeover.`,
  blipDeleted: (serial: string) => `Blip <code>${serial}</code> has left the chat.`,
  contentTooLong: (max: number) => `Keep it under ${max} chars, poet.`,
  fetchFailed: "Oops, couldn't grab those.",
  createFailed: "Something broke. Try again?",
  updateFailed: "Couldn't update that. Does it exist?",
  deleteFailed: "Couldn't delete. Maybe it's already gone?",
  usageByte: "Usage: /byte <content>",
  usageBlip: "Usage: /blip <term>:<meaning>",
  usageList: "Usage: /list <byte|blip>",
  usageGet: "Usage: /get <byte|blip> <serial>",
  usageEdit: "Usage: /edit <byte|blip> <serial> <new content>",
  usageDel: "Usage: /del <byte|blip> <serial>",
  startIntro: 
    "Blip Bot for [sumit sute](https://www.sutesite.com/blip)\n\n" +
    "Just send a message to create a byte.\n\n" +
    "/byte <content> – Create a short thought\n" +
    "/blip <term>:<meaning> – Create a term:meaning pair\n" +
    "/list <byte|blip> – See what you've blipped\n" +
    "/get <byte|blip> <serial> – Pull up a specific item\n" +
    "/edit <byte|blip> <serial> <text> – Rewrite history\n" +
    "/del <byte|blip> <serial> – Erase the evidence",
  channelBlip: (serial: string, content: string) =>
    `🤖: <a href="https://www.sumitsute.com/blip/${serial}">${content}</a>`,
  channelBloq: (title: string, slug: string, tags?: string[]) => {
    const tagsStr = tags && tags.length > 0 ? `\nTags: ${tags.join(', ')}` : '';
    return `📝 ${title}\n<a href="https://www.sumitsute.com/bloq/${slug}">Read more</a>${tagsStr}`;
  },
  visitorNotification: (visitor: { 
    city?: string; 
    country?: string; 
    region?: string; 
    ip?: string;
    deviceType?: string;
    isReturning?: boolean;
    visitCount?: number;
  }, referrer?: string) => {
    const locationParts = [visitor.city, visitor.region, visitor.country].filter(Boolean);
    const location = locationParts.length > 0 ? locationParts.join(', ') : 'Unknown location';
    const source = referrer || 'direct';
    const returning = visitor.isReturning ? '👋 returning' : '✨ new';
    const countStr = visitor.visitCount && visitor.visitCount > 1 ? ` (${visitor.visitCount}x)` : '';
    const device = visitor.deviceType || 'Unknown';
    const ip = visitor.ip || 'Unknown IP';
    
    return `👤 <b>${returning}${countStr}</b>
📍 ${location}
💻 ${device}
🌐 <code>${ip}</code>
🔗 ${source}`;
  },
} as const;
