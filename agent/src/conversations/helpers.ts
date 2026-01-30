import { PhoneCollectedExit } from "../tools/exits";

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

export async function collectPhoneNumber(execute: any, conversation: any) {
  const result = await execute({
    instructions: `Ask the user for their phone number so our team can call them.

Be friendly and reassure them about privacy. Validate it looks like a real phone number.
Once you have a valid number, use the exit.`,
    exits: [PhoneCollectedExit],
  });

  if (result.is(PhoneCollectedExit)) {
    await conversation.send({
      type: "text",
      payload: {
        text: `Perfect! Our team will call you at ${result.output.phone} shortly.

Talk soon!`,
      },
    });
  }
}

export async function sendSalesBooking(conversation: any) {
  await conversation.send({
    type: "text",
    payload: {
      text: `Excellent! Here's the link to book a time with our team:

https://calendly.com/botpress-sales/demo

We'll dive into your use case and show you how we can help build it.

Looking forward to it!`,
    },
  });
}

export async function sendPartnerInfo(conversation: any) {
  await conversation.send({
    type: "text",
    payload: {
      text: `Our **Partner Program** connects you with certified Botpress experts who can help build your solution.

**Benefits:**
- Expert implementation at various price points
- Flexible engagement models
- Ongoing support options

Learn more and find a partner: https://botpress.com/partners

Feel free to reach out if you have questions!`,
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
