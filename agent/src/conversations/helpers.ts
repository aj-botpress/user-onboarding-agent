export async function sendConsultationBooking(conversation: any) {
  await conversation.send({
    type: "text",
    payload: {
      text: `Great news - you qualify for a free consultation!

Here's the link to book a time with our team:
https://calendly.com/botpress-team/consultation

We're excited to help you build something amazing!`,
    },
  });
}

export async function sendSoftLanding(conversation: any) {
  await conversation.send({
    type: "text",
    payload: {
      text: `Thanks for your interest! While our consultation slots are currently reserved for teams ready to build, here are some great resources to get you started:

**Self-serve resources:**
- Documentation: https://botpress.com/docs
- Free templates: https://botpress.com/templates
- Community Discord: https://discord.gg/botpress
- YouTube tutorials: https://youtube.com/botpress

Feel free to come back when you're ready to dive deeper!`,
    },
  });
}

export async function sendADKResources(conversation: any) {
  await conversation.send({
    type: "text",
    payload: {
      text: `Awesome choice! The **Botpress ADK** gives you full control with TypeScript.

**Get started:**
\`\`\`bash
npm install -g @botpress/adk
adk init my-agent
cd my-agent
adk dev
\`\`\`

**Resources:**
- Documentation: https://botpress.com/docs/adk
- Examples: https://github.com/botpress/adk/tree/main/examples
- Community Discord: https://discord.gg/botpress

Happy building!`,
    },
  });
}

export async function sendStudioResources(conversation: any) {
  await conversation.send({
    type: "text",
    payload: {
      text: `Great choice! **Botpress Studio** lets you build visually - no coding required.

**Get started:**
1. Go to https://app.botpress.cloud
2. Create a free account
3. Start building with drag-and-drop!

**Resources:**
- Getting started: https://botpress.com/docs/studio
- Templates: https://botpress.com/templates
- Video tutorials: https://youtube.com/botpress

Have fun building!`,
    },
  });
}
