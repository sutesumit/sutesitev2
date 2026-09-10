export const BOT_COMMANDS = [
  { command: "start", description: "Show help" },
  { command: "byte", description: "Create a byte (short thought)" },
  { command: "blip", description: "Create a blip (term:meaning)" },
  { command: "list", description: "List bytes or blips" },
  { command: "get", description: "Get a byte or blip" },
  { command: "edit", description: "Edit a byte or blip" },
  { command: "del", description: "Delete a byte or blip" },
  { command: "livesession", description: "Manage live bloq sessions" },
] as const;
