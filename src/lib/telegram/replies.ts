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
  subscribeIntro:
    "Want to catch every blip as it drops?\n\n" +
    "Join the channel: @blipbotlive\n\n" +
    "All new blips get broadcast there instantly.",
  channelBlip: (serial: string, content: string) =>
    `🤖: <a href="https://www.sumitsute.com/blip/${serial}">${content}</a>`,
} as const;
