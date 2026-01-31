/**
 * =============================================================================
 * ONBOARDING CONVERSATION - STATE MACHINE
 * =============================================================================
 *
 * This conversation uses a state machine with 6 states + 1 terminal state.
 * Each state runs an execute() loop that uses Autonomous.Exit to determine
 * the next transition.
 *
 * STATE MACHINE DIAGRAM:
 * ----------------------
 *
 *                        ┌──────────────────────┐
 *                        │ intent_classification │
 *                        └───────────┬──────────┘
 *                                    │
 *                   ┌────────────────┴────────────────┐
 *                   │                                 │
 *                   ▼                                 ▼
 *          ┌────────────────┐                ┌────────────────┐
 *          │   exploring    │                │    use_case    │
 *          └───────┬────────┘                └───────┬────────┘
 *                  │                                 │
 *         ┌────────┴────────┐               ┌───────┴───────┐
 *         │                 │               │               │
 *         ▼                 ▼               ▼               ▼
 *  ┌─────────────┐  ┌─────────────────┐  ┌─────────────┐  ┌─────────────┐
 *  │how_to_build │  │ consultation_   │  │build_for_me │  │how_to_build │
 *  │(self-serve) │  │ qualification   │  └──────┬──────┘  └──────┬──────┘
 *  └──────┬──────┘  └────────┬────────┘         │                │
 *         │                  │           ┌──────┼──────┐         │
 *         │                  │           │      │      └─────────┤
 *         │                  │           │      │                │
 *         ▼                  ▼           ▼      ▼                ▼
 *  ┌─────────────────────────────────────────────────────────────────┐
 *  │                          completed                              │
 *  │  (booked, soft_landing, call, booking, adk, studio)             │
 *  └─────────────────────────────────────────────────────────────────┘
 *
 */

import { Conversation, z } from "@botpress/runtime";
import {
  // Intent classification exits
  ExploringExit,
  HasUseCaseExit,
  // Exploring path exits
  WantsConsultationExit,
  SelfServeExit,
  // Consultation qualification exits
  ConsultationQualifiedExit,
  ConsultationNotQualifiedExit,
  // Use case path exits
  UseCaseCollectedExit,
  UseCaseSelfBuildExit,
  // Build for me exits
  BuildForMeQualifiedExit,
  BuildForMeNotQualifiedExit,
  // How to build exits
  BuildWithCodeExit,
  BuildWithStudioExit,
} from "../tools/exits";

export default new Conversation({
  channel: ["webchat.channel", "chat.channel"],

  state: z.object({
    phase: z
      .enum([
        "intent_classification",
        "exploring",
        "consultation_qualification",
        "use_case",
        "build_for_me",
        "how_to_build",
        "completed",
      ])
      .default("intent_classification"),
  }),

  handler: async ({ execute, conversation, state, message }) => {
    // Loop until we hit a terminal state or need to wait for user input
    while (true) {
      const phase = state.phase || "intent_classification";

      switch (phase) {
        // ============================================
        // STATE: intent_classification (entry point)
        // TRANSITIONS:
        //   → exploring     (if user is exploring)
        //   → use_case      (if user has a use case)
        // ============================================
        case "intent_classification": {
          const result = await execute({
            model: "openai:gpt-4o",
            instructions: `You are a friendly onboarding assistant for Botpress.

FIRST: Send a text message: "Hi! Welcome to Botpress. Let's get you started."

THEN: Send a choice message with:
- text: "What describes you best?"
- options: "I have a specific use case in mind" and "I'm exploring what's possible"

IMPORTANT: The choice text should ONLY be "What describes you best?" - do not add any extra text like "Please choose" or "Select one".

WHEN USER RESPONDS:
- If they choose exploring or indicate curiosity → use exploring exit IMMEDIATELY
- If they choose use case or mention a project → use has_use_case exit IMMEDIATELY

DO NOT send any messages after the user responds. Just exit silently.
The next phase will handle the conversation from there.

If their response is unclear, ask them to pick one of the two options.`,
            exits: [ExploringExit, HasUseCaseExit],
          });

          if (result.is(ExploringExit)) {
            state.phase = "exploring";
            continue; // → immediately run exploring phase
          } else if (result.is(HasUseCaseExit)) {
            state.phase = "use_case";
            continue; // → immediately run use_case phase
          }
          return;
        }

        // ============================================
        // STATE: exploring
        // TRANSITIONS:
        //   → consultation_qualification (if wants consultation)
        //   → how_to_build               (if self-serve)
        // ============================================
        case "exploring": {
          const result = await execute({
            instructions: `The user is exploring what Botpress can do.

Your goals:
1. Share exciting possibilities - customer support bots, sales assistants, internal tools, product integrations
2. Mention they can check out DemoWorks for live examples: https://demoworks.botpress.com
3. Ask if they'd like to see if they qualify for a free consultation, OR if they'd prefer to start building on their own

Be enthusiastic but not pushy.

If they want the consultation:
- Do NOT promise or confirm the consultation yet
- Just say something like "Great, let me ask a few quick questions to see if you qualify"
- Then use the wants_consultation exit

If they prefer to explore/build on their own, use the self_serve exit (we'll help them get started).`,
            exits: [WantsConsultationExit, SelfServeExit],
          });

          if (result.is(WantsConsultationExit)) {
            state.phase = "consultation_qualification";
            continue; // → immediately run consultation_qualification phase
          } else if (result.is(SelfServeExit)) {
            state.phase = "how_to_build";
            continue; // → immediately run how_to_build phase
          }
          return;
        }

        // ============================================
        // STATE: consultation_qualification
        // TRANSITIONS:
        //   → completed (qualified → booked)
        //   → completed (not qualified → soft landing)
        // ============================================
        case "consultation_qualification": {
          const result = await execute({
            instructions: `You're qualifying the user for a free consultation.

Ask about:
1. Company size (startup, SMB, or enterprise)
2. Do they have a use case in mind, even if vague?
3. Are they ready to start building in the next few weeks?

Qualification criteria:
- QUALIFIED: SMB or Enterprise with a use case and ready to start
- QUALIFIED: Startup with clear use case and ready to start immediately
- NOT QUALIFIED: Just browsing with no timeline

Be friendly and conversational. Don't make it feel like a form.
Once you have the info, use the appropriate exit.`,
            exits: [ConsultationQualifiedExit, ConsultationNotQualifiedExit],
          });

          if (result.is(ConsultationQualifiedExit)) {
            state.phase = "completed";
            await conversation.send({
              type: "text",
              payload: {
                text: `Great news - you qualify for a free consultation!

Here's the link to book a time with our team:
https://calendly.com/botpress-team/consultation

We're excited to help you build something amazing!`,
              },
            });
            return; // → done, wait for next message
          } else if (result.is(ConsultationNotQualifiedExit)) {
            state.phase = "completed";
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
            return; // → done, wait for next message
          }
          return;
        }

        // ============================================
        // STATE: use_case
        // TRANSITIONS:
        //   → build_for_me  (if wants help building)
        //   → how_to_build  (if wants to self-build)
        // ============================================
        case "use_case": {
          const result = await execute({
            instructions: `The user has a specific use case in mind. Have a natural conversation to understand it.

You want to learn:
- What they want to build
- Where it will live (website, WhatsApp, Slack, etc.)
- What it needs to connect to (CRM, helpdesk, etc.)
- Expected volume - ask "Do you have a rough idea of how many conversations per month?" (NOT "small/medium/large")
- What type (support, sales, internal, etc.)

START with this question (or very similar):
"I'd love to hear more about your use case. What kind of bot are you thinking about building, and where do you imagine it will be used?"

This gets them talking about description + channel naturally in one response.

CONVERSATION STYLE:
- Be curious and conversational, NOT like a form or Q&A
- Ask ONE question at a time, not multiple questions in one message
- INFER as much as possible from what they say - don't ask if you can guess
- NEVER summarize or repeat back what they told you - no "So you want to build X that does Y"
- Keep responses short and natural

WHEN TO STOP GATHERING INFO:
- If the user says "I don't know", "not sure", or "no" to something, don't keep pressing
- 2 follow-up questions max about their use case
- You don't need all the info - use "unknown" for missing fields

AFTER GATHERING (or if user isn't giving details), send a CHOICE message:
- text: "Would you like help from our team, or prefer to build it yourself?"
- options: "Help from your team" and "I'll build it myself"

WHEN THEY CHOOSE:
- "Help from your team" → use use_case_collected exit
- "I'll build it myself" → use use_case_self_build exit

IMPORTANT: Do NOT send any acknowledgment message like "Great!" - just exit silently. The next phase will handle the response.`,
            exits: [UseCaseCollectedExit, UseCaseSelfBuildExit],
          });

          if (result.is(UseCaseCollectedExit)) {
            state.phase = "build_for_me";
            continue; // → immediately run build_for_me phase
          } else if (result.is(UseCaseSelfBuildExit)) {
            state.phase = "how_to_build";
            continue; // → immediately run how_to_build phase
          }
          return;
        }

        // ============================================
        // STATE: build_for_me
        // TRANSITIONS:
        //   → completed     (qualified → call or booking)
        //   → completed     (not qualified + partner interest)
        //   → how_to_build  (not qualified + wants to self-build)
        // ============================================
        case "build_for_me": {
          const result = await execute({
            instructions: `The user wants help building their chatbot. Qualify them for sales assistance.

IMPORTANT: Do NOT summarize or repeat what they told you about their use case. Just move forward with qualification questions.

STEP 1 - Gather:
1. **Timeline**: When do they need this?
   - ASAP (within 2 weeks)
   - Within a month
   - Within a few months
   - Just exploring for now

2. **Budget**: Expected monthly investment?
   - Under $500/month
   - $500-2000/month
   - Over $2000/month
   - Not sure yet

Qualification criteria:
- QUALIFIED: Timeline is ASAP or month AND budget is $500+ or "not sure"
- QUALIFIED: Budget is over $2000 regardless of timeline
- NOT QUALIFIED: Budget under $500 OR timeline is "exploring" with low budget

STEP 2 - Based on qualification:

If QUALIFIED:
- Ask how they'd like to connect: "Call me ASAP" or "Let me book a time"
- If they want a call → collect their phone number, then exit with the phone number
- If they want to book → exit with booking preference (no phone needed)

If NOT QUALIFIED:
- Ask if they're interested in building it themselves OR learning about our partner program
- Exit based on their choice

IMPORTANT: When exiting, do NOT send any acknowledgment message like "Great!" or "Thanks!" - just exit silently. The next phase will handle the response.

Be respectful regardless of qualification. Everyone deserves good service.`,
            exits: [BuildForMeQualifiedExit, BuildForMeNotQualifiedExit],
          });

          if (result.is(BuildForMeQualifiedExit)) {
            state.phase = "completed";
            if (result.output.contactPreference === "call") {
              await conversation.send({
                type: "text",
                payload: {
                  text: `Perfect! Our team will call you at ${result.output.phone} shortly. Talk soon!`,
                },
              });
            } else {
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
            return; // → done, wait for next message
          } else if (result.is(BuildForMeNotQualifiedExit)) {
            if (result.output.interestedInPartner) {
              state.phase = "completed";
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
              return; // → done, wait for next message
            } else {
              state.phase = "how_to_build";
              continue; // → immediately run how_to_build phase
            }
          }
          return;
        }

        // ============================================
        // STATE: how_to_build
        // TRANSITIONS:
        //   → completed (ADK resources)
        //   → completed (Studio resources)
        // ============================================
        case "how_to_build": {
          const result = await execute({
            instructions: `The user wants to build their chatbot themselves. Help them choose the right approach.

Ask how they prefer to build:

1. **With Code (ADK)** - TypeScript-first, full control, great for developers
   - Best for: developers, complex integrations, custom logic, CI/CD workflows

2. **Visual Editor (Studio)** - No-code, drag-and-drop, quick to prototype
   - Best for: non-developers, rapid prototyping, simple flows

WHEN THEY CHOOSE:
- If they choose code/ADK → use build_with_code exit IMMEDIATELY
- If they choose studio/visual → use build_with_studio exit IMMEDIATELY

IMPORTANT: Do NOT send any acknowledgment message like "Great choice!" - just exit silently. The next phase will handle the response.`,
            exits: [BuildWithCodeExit, BuildWithStudioExit],
          });

          if (result.is(BuildWithCodeExit)) {
            state.phase = "completed";
            await conversation.send({
              type: "text",
              payload: {
                text: `Awesome choice! The **Botpress ADK** gives you full control with TypeScript.

Let's get you started: >>>>`,
              },
            });
            return; // → done, wait for next message
          } else if (result.is(BuildWithStudioExit)) {
            state.phase = "completed";
            await conversation.send({
              type: "text",
              payload: {
                text: `Great choice! **Botpress Studio** lets you build visually - no coding required.

Let's get you started: >>>>`,
              },
            });
            return; // → done, wait for next message
          }
          return;
        }

        // ============================================
        // STATE: completed (terminal state)
        // TRANSITIONS: none (handles follow-up questions)
        // ============================================
        case "completed": {
          await conversation.send({
            type: "text",
            payload: {
              text: `Conversation has concluded.`,
            },
          });
          return;
        }

        default:
          return;
      }
    }
  },
});
