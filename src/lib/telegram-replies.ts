export const replies = {
  unauthorized: "Nice try, but nope. This bot is not for you.",
  noBlips: "Crickets... nothing here yet.",
  blipNotFound: "That blip doesn't exist (yet?)",
  blipCreated: (serial: string) => `Blip <code>${serial}</code> is born!`,
  blipUpdated: (serial: string) => `Blip <code>${serial}</code> got a makeover.`,
  blipDeleted: (serial: string) => `Blip <code>${serial}</code> has left the chat.`,
  contentTooLong: (max: number) => `Keep it under ${max} chars, poet.`,
  fetchFailed: "Oops, couldn't grab those.",
  createFailed: "Something broke. Try again?",
  updateFailed: "Couldn't update that. Does it exist?",
  deleteFailed: "Couldn't delete. Maybe it's already gone?",
  usageGet: "Usage: /get <serial>",
  usageEdit: "Usage: /edit <serial> <new content>",
  usageDel: "Usage: /del <serial>",
  startIntro: 
    "Blip Bot for [sumit sute](https://www.sutesite.com/blip)\n\n" +
    "Just send a message to create a blip.\n\n" +
    "/list – See what you've blipped lately\n" +
    "/get <serial> – Pull up a specific blip\n" +
    "/edit <serial> <text> – Rewrite history\n" +
    "/del <serial> – Erase the evidence",
  subscribeIntro:
    "Want to catch every blip as it drops?\n\n" +
    "Join the channel: @blipbotlive\n\n" +
    "All new blips get broadcast there instantly.",
  channelBlip: (serial: string, content: string) =>
    `🤖: <a href="https://www.sumitsute.com/blip/${serial}"><code>${content}</code></a>`,
} as const;
