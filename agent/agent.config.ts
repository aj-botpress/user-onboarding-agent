import { z, defineConfig } from "@botpress/runtime";

export default defineConfig({
  name: "user-onboarding-agent",
  description: "User onboarding assistant for Botpress",

  bot: {
    state: z.object({}),
  },

  user: {
    state: z.object({}),
  },

  dependencies: {
    integrations: {
      chat: { version: "chat@0.7.4", enabled: true },
      webchat: { version: "webchat@0.3.0", enabled: true },
    },
  },
});
