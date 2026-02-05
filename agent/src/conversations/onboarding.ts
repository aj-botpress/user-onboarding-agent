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
  ExploringExit,
  HasUseCaseExit,
  WantsConsultationExit,
  SelfServeExit,
  ConsultationQualifiedExit,
  ConsultationNotQualifiedExit,
  UseCaseCollectedExit,
  UseCaseSelfBuildExit,
  BuildForMeQualifiedExit,
  BuildForMeNotQualifiedExit,
  BuildWithCodeExit,
  BuildWithStudioExit,
} from "../tools/exits";

// Shared instruction snippet for all execute() calls
const CHOICE_RULE = `⚠️ CHOICE RULE: Do NOT yield <Text> before <Choice>. The Choice component displays its own text.
WRONG: yield <Text>Would you like...</Text>; yield <Choice text="Would you like..." .../>
CORRECT: yield <Choice text="Would you like help from our team?" options={[...]} />`;

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

  handler: async ({ execute, conversation, state }) => {
    while (true) {
      const phase = state.phase || "intent_classification";

      switch (phase) {
        case "intent_classification": {
          const result = await execute({
            instructions: `You are a friendly onboarding assistant for Botpress.

${CHOICE_RULE}

1. Send text: "Hi! Welcome to Botpress. Let's get you started."
2. Send Choice with text "What describes you best?" and options: "I have a specific use case in mind", "I'm exploring what's possible"

When user responds:
- Exploring/curious → use exploring exit
- Use case/project → use has_use_case exit

Exit silently after user responds.`,
            exits: [ExploringExit, HasUseCaseExit],
          });

          if (result.is(ExploringExit)) {
            await conversation.send({
              type: "text",
              payload: {
                text: "With Botpress, you can build support bots, sales assistants, internal tools, and seamlessly integrate them with your products. Explore live examples here:",
              },
            });
            await conversation.send({
              type: "text",
              payload: { text: "{{DEMOS_CAROUSEL}}" },
            });
            await conversation.send({
              type: "text",
              payload: { text: "{{DISMISSABLE}}" },
            });
            await conversation.send({
              type: "choice",
              payload: {
                text: "Would you like to see if you qualify for a free consultation, or prefer to start building on your own?",
                options: [
                  { label: "I'm interested in a consultation", value: "consultation" },
                  { label: "I'll start building", value: "self_build" },
                ],
              },
            });
            state.phase = "exploring";
            return;
          } else if (result.is(HasUseCaseExit)) {
            state.phase = "use_case";
            continue;
          }
          return;
        }

        case "exploring": {
          const result = await execute({
            instructions: `User saw demos and a choice about consultation vs self-build.

Wait for response. Do NOT send any messages.
- Consultation interest → wants_consultation exit
- Self-build interest → self_serve exit

Exit silently.`,
            exits: [WantsConsultationExit, SelfServeExit],
          });

          if (result.is(WantsConsultationExit)) {
            state.phase = "consultation_qualification";
            continue;
          } else if (result.is(SelfServeExit)) {
            state.phase = "how_to_build";
            continue;
          }
          return;
        }

        case "consultation_qualification": {
          const result = await execute({
            instructions: `Qualify user for free consultation.

Ask: "Quick question - what's the meaning of life?"

- Answer is "42" (any variation) → consultation_qualified exit
- Any other answer → consultation_not_qualified exit

Be playful. Congratulate if correct. Exit silently after.`,
            exits: [ConsultationQualifiedExit, ConsultationNotQualifiedExit],
          });

          if (result.is(ConsultationQualifiedExit)) {
            state.phase = "completed";
            await conversation.send({
              type: "text",
              payload: { text: "Great news - you qualify for a free consultation! Book a time with our team here-" },
            });
            await conversation.send({
              type: "text",
              payload: { text: "{{BOOKING_CARD}}" },
            });
            await conversation.send({
              type: "text",
              payload: { text: "We're excited to help you build something amazing!" },
            });
            await conversation.send({
              type: "text",
              payload: { text: "{{EXPLORE_CTA}}" },
            });
            return;
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
            await conversation.send({
              type: "text",
              payload: { text: "{{EXPLORE_CTA}}" },
            });
            return;
          }
          return;
        }

        case "use_case": {
          const result = await execute({
            instructions: `User has a use case. Gather info conversationally.

${CHOICE_RULE}

Learn (don't ask all - infer when possible):
- What they want to build
- Channel (website, WhatsApp, Slack, etc.)
- Integrations (CRM, helpdesk, etc.)
- Volume (under 1k, 1k-10k, or 10k+/month)
- Type (support, sales, internal) - INFER, don't ask

Start with: "I'd love to hear more about your use case. What kind of bot are you thinking about building, where would it live, and would it need to connect to any tools your team already uses?"

Style: Curious, conversational. One question at a time. Never summarize back.
Stop after: 2 follow-ups max, or if user says "I don't know".

Then send Choice (NO text before it):
- text: "Would you like help from our team, or prefer to build it yourself?"
- options: "I'll need Botpress's expertise", "I'll build it myself"

When they choose → exit silently.`,
            exits: [UseCaseCollectedExit, UseCaseSelfBuildExit],
          });

          if (result.is(UseCaseCollectedExit)) {
            state.phase = "build_for_me";
          } else if (result.is(UseCaseSelfBuildExit)) {
            state.phase = "how_to_build";
          } else {
            return;
          }

          await conversation.send({
            type: "text",
            payload: { text: "{{DISMISSABLE}}" },
          });
          continue;
        }

        case "build_for_me": {
          const result = await execute({
            instructions: `Qualify user for sales assistance. Don't summarize their use case.

${CHOICE_RULE}

Q1 - Send Choice:
- text: "Awesome! We'd love to help you. When are you looking to have this up and running?"
- options: "ASAP (within 2 weeks)", "Within a month", "Within a few months", "Just exploring for now"

Q2 - Send Choice:
- text: "And what kind of monthly budget are you working with?"
- options: "Under $500/month", "$500-2000/month", "Over $2000/month", "Not sure yet"

Qualified if: (ASAP or month) AND ($500+ or not sure), OR budget over $2000.
Not qualified if: under $500, OR "exploring" with low budget.

If QUALIFIED - Send Choice:
- text: "Great! How would you like to connect with our team?"
- options: "Call me ASAP", "Let me book a time"
- Call → collect phone, then exit
- Book → exit with booking preference

If NOT QUALIFIED:
Send text: "Thanks for sharing! While our team focuses on larger projects, we have amazing certified partners who'd love to help you out. Check them out at botpress.com/partners - good luck with your project!"
Exit with interestedInPartner: true`,
            exits: [BuildForMeQualifiedExit, BuildForMeNotQualifiedExit],
          });

          if (result.is(BuildForMeQualifiedExit)) {
            state.phase = "completed";
            if (result.output.contactPreference === "call") {
              await conversation.send({
                type: "text",
                payload: { text: `Perfect! Our team will call you at ${result.output.phone} shortly. Talk soon!` },
              });
              await conversation.send({
                type: "text",
                payload: { text: "{{EXPLORE_CTA}}" },
              });
            } else {
              await conversation.send({
                type: "text",
                payload: { text: "Excellent! You can book a time with our team here-" },
              });
              await conversation.send({
                type: "text",
                payload: { text: "{{BOOKING_CARD}}" },
              });
              await conversation.send({
                type: "text",
                payload: {
                  text: "We'll dive into your use case and show you how we can help build it. Looking forward to it!",
                },
              });
              await conversation.send({
                type: "text",
                payload: { text: "{{EXPLORE_CTA}}" },
              });
            }
            return;
          } else if (result.is(BuildForMeNotQualifiedExit)) {
            state.phase = "completed";
            return;
          }
          return;
        }

        case "how_to_build": {
          const result = await execute({
            instructions: `User wants to self-build. Help them choose.

${CHOICE_RULE}

Send Choice (NO text before it):
- text: "There are two ways to build - with code for full control, or visually for speed. Which sounds more like you?"
- options: "With Code (ADK)", "Visual Builder (Studio)"

When they choose → exit silently.`,
            exits: [BuildWithCodeExit, BuildWithStudioExit],
          });

          if (result.is(BuildWithCodeExit)) {
            state.phase = "completed";
            await conversation.send({
              type: "text",
              payload: {
                text: "Awesome choice! The **Botpress ADK** gives you full control with TypeScript.\n\nLet's get you started!",
              },
            });
            await conversation.send({
              type: "text",
              payload: { text: "{{ADK_CTA}}" },
            });
            return;
          } else if (result.is(BuildWithStudioExit)) {
            state.phase = "completed";
            await conversation.send({
              type: "text",
              payload: {
                text: "Great choice! **Botpress Studio** lets you build visually - no coding required.\n\nLet's get you started!",
              },
            });
            await conversation.send({
              type: "text",
              payload: { text: "{{STUDIO_CTA}}" },
            });
            return;
          }
          return;
        }

        case "completed": {
          await conversation.send({
            type: "text",
            payload: { text: "Conversation has concluded." },
          });
          return;
        }

        default:
          return;
      }
    }
  },
});
