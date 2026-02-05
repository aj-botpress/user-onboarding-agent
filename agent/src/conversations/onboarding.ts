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
            // Send exploring intro messages before transitioning
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
            return; // Wait for user response
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
          // User already saw the intro messages, now handle their response
          const result = await execute({
            instructions: `The user just saw our demos and was asked if they want a consultation or to build on their own.

Wait for their response. Do NOT send any messages.

WHEN THEY RESPOND:
- If they chose consultation or express interest in talking to the team → use wants_consultation exit IMMEDIATELY
- If they chose to build or want to explore on their own → use self_serve exit IMMEDIATELY

Do NOT send any acknowledgment - just exit silently.`,
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

Ask them: "Quick question - what's the meaning of life?"

Qualification criteria:
- QUALIFIED: They answer "42" (or forty-two, or any variation of 42)
- NOT QUALIFIED: Any other answer

Be playful about it. If they get it right, congratulate them on knowing the answer.
Once you have their answer, use the appropriate exit immediately.`,
            exits: [ConsultationQualifiedExit, ConsultationNotQualifiedExit],
          });

          if (result.is(ConsultationQualifiedExit)) {
            state.phase = "completed";
            await conversation.send({
              type: "text",
              payload: {
                text: `Great news - you qualify for a free consultation! Book a time with our team here-`,
              },
            });
            await conversation.send({
              type: "text",
              payload: { text: "{{BOOKING_CARD}}" },
            });
            await conversation.send({
              type: "text",
              payload: {
                text: `We're excited to help you build something amazing!`,
              },
            });
            await conversation.send({
              type: "text",
              payload: { text: "{{EXPLORE_CTA}}" },
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
            await conversation.send({
              type: "text",
              payload: { text: "{{EXPLORE_CTA}}" },
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
- Expected volume - if you ask, use specific ranges: "under 1,000 conversations/month", "1,000-10,000/month", or "over 10,000/month"
- What type (support, sales, internal, etc.) - INFER this from their description, do NOT ask directly

START with this question (or very similar):
"I'd love to hear more about your use case. What kind of bot are you thinking about building, where would it live, and would it need to connect to any tools your team already uses?"

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

AFTER GATHERING (or if user isn't giving details), send ONLY a CHOICE component:
- question: "Would you like help from our team, or prefer to build it yourself?"
- options: "I'll need Botpress's expertise " and "I'll build it myself"

WRONG (causes duplicate):
1. Send text message "Would you like help..."
2. Send choice with text "Would you like help..."

CORRECT:
1. Send ONLY the choice component (it displays its text field as the question)

WHEN THEY CHOOSE:
- "I'll need Botpress's expertise " → use use_case_collected exit IMMEDIATELY
- "I'll build it myself" → use use_case_self_build exit IMMEDIATELY

Do NOT send any acknowledgment - just exit silently.`,
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

IMPORTANT: Do NOT summarize or repeat what they told you about their use case. Just move forward with qualification.

Use CHOICE components for questions. IMPORTANT: Do NOT send a separate text message before each choice - the choice component already displays the question text. Just send the choice directly.

QUESTION 1 - Timeline:
Send CHOICE with question: "Awesome! We'd love to help you. When are you looking to have this up and running?"
Options: "ASAP (within 2 weeks)", "Within a month", "Within a few months", "Just exploring for now"

QUESTION 2 - Budget:
Send CHOICE with question: "And what kind of monthly budget are you working with?"
Options: "Under $500/month", "$500-2000/month", "Over $2000/month", "Not sure yet"

Qualification criteria:
- QUALIFIED: Timeline is ASAP or month AND budget is $500+ or "not sure"
- QUALIFIED: Budget is over $2000 regardless of timeline
- NOT QUALIFIED: Budget under $500 OR timeline is "exploring" with low budget

AFTER QUALIFICATION:

If QUALIFIED:
Send CHOICE with question: "Great! How would you like to connect with our team?"
Options: "Call me ASAP", "Let me book a time"
- If call → collect their phone number, then exit
- If book → exit with booking preference

If NOT QUALIFIED:
Send a text message: "Thanks for sharing! While our team focuses on larger projects, we have amazing certified partners who'd love to help you out. Check them out at botpress.com/partners - good luck with your project!"
Then exit with interestedInPartner: true

When exiting, do NOT send any acknowledgment - just exit silently.`,
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
              await conversation.send({
                type: "text",
                payload: { text: "{{EXPLORE_CTA}}" },
              });
            } else {
              await conversation.send({
                type: "text",
                payload: {
                  text: `Excellent! You can book a time with our team here-`,
                },
              });
              await conversation.send({
                type: "text",
                payload: { text: "{{BOOKING_CARD}}" },
              });
              await conversation.send({
                type: "text",
                payload: {
                  text: `We'll dive into your use case and show you how we can help build it. Looking forward to it!`,
                },
              });
              await conversation.send({
                type: "text",
                payload: { text: "{{EXPLORE_CTA}}" },
              });
            }
            return; // → done, wait for next message
          } else if (result.is(BuildForMeNotQualifiedExit)) {
            // LLM already sent warm message with partners link
            state.phase = "completed";
            return; // → done, wait for next message
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

Send ONLY a CHOICE component:
- question: "There are two ways to build - with code for full control, or visually for speed. Which sounds more like you?"
- options: "With Code (ADK)", "Visual Builder (Studio)"

WRONG (causes duplicate):
1. Send text message "There are two ways to build..."
2. Send choice with text "There are two ways to build..."

CORRECT:
1. Send ONLY the choice component (it displays its text field as the question)

WHEN THEY CHOOSE:
- Code/ADK → use build_with_code exit IMMEDIATELY
- Studio/Visual → use build_with_studio exit IMMEDIATELY

Do NOT send any acknowledgment message - just exit silently.`,
            exits: [BuildWithCodeExit, BuildWithStudioExit],
          });

          if (result.is(BuildWithCodeExit)) {
            state.phase = "completed";
            await conversation.send({
              type: "text",
              payload: {
                text: `Awesome choice! The **Botpress ADK** gives you full control with TypeScript.

Let's get you started!`,
              },
            });
            await conversation.send({
              type: "text",
              payload: { text: "{{ADK_CTA}}" },
            });
            return; // → done, wait for next message
          } else if (result.is(BuildWithStudioExit)) {
            state.phase = "completed";
            await conversation.send({
              type: "text",
              payload: {
                text: `Great choice! **Botpress Studio** lets you build visually - no coding required.

Let's get you started!`,
              },
            });
            await conversation.send({
              type: "text",
              payload: { text: "{{STUDIO_CTA}}" },
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
