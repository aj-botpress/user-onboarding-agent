import { Autonomous, z } from "@botpress/runtime";

// ============================================
// INTENT CLASSIFICATION EXITS
// ============================================

export const ExploringExit = new Autonomous.Exit({
  name: "exploring",
  description: "User is exploring what Botpress can do, no specific use case yet",
});

export const HasUseCaseExit = new Autonomous.Exit({
  name: "has_use_case",
  description: "User has a specific use case or project in mind",
});

// ============================================
// EXPLORING PATH EXITS
// ============================================

export const WantsConsultationExit = new Autonomous.Exit({
  name: "wants_consultation",
  description: "User wants to see if they qualify for a free consultation",
});

export const SelfServeExit = new Autonomous.Exit({
  name: "self_serve",
  description: "User wants to explore on their own without consultation",
});

// ============================================
// CONSULTATION QUALIFICATION EXITS
// ============================================

export const ConsultationQualifiedExit = new Autonomous.Exit({
  name: "consultation_qualified",
  description: "User qualifies for a free consultation",
  schema: z.object({
    companySize: z.enum(["startup", "smb", "enterprise"]),
    hasUseCase: z.boolean(),
    readyToStart: z.boolean(),
  }),
});

export const ConsultationNotQualifiedExit = new Autonomous.Exit({
  name: "consultation_not_qualified",
  description: "User does not qualify for consultation, provide soft landing",
});

// ============================================
// USE CASE PATH EXITS
// ============================================

export const UseCaseCollectedExit = new Autonomous.Exit({
  name: "use_case_collected",
  description: "Use case details have been gathered, user wants help building",
  schema: z.object({
    description: z.string().describe("Summary of what the user wants to build"),
    channel: z
      .enum(["website", "whatsapp", "slack", "other", "unknown"])
      .optional()
      .describe("Primary channel where the bot will live"),
    integrations: z
      .array(z.string())
      .optional()
      .describe("Systems to integrate with (CRM, helpdesk, etc.) - empty if none/unknown"),
    size: z
      .enum(["small", "medium", "large", "unknown"])
      .optional()
      .describe("Expected monthly conversations: small (<1k), medium (1k-10k), large (10k+)"),
    type: z
      .enum(["cx", "lead_gen", "internal", "other", "unknown"])
      .optional()
      .describe("Primary use case type"),
  }),
});

export const UseCaseSelfBuildExit = new Autonomous.Exit({
  name: "use_case_self_build",
  description: "Use case details gathered, user wants to build it themselves",
  schema: z.object({
    description: z.string().describe("Summary of what the user wants to build"),
    channel: z.enum(["website", "whatsapp", "slack", "other"]).optional(),
    integrations: z.array(z.string()).optional(),
    size: z.enum(["small", "medium", "large", "unknown"]).optional().describe("Expected monthly conversations: small (<1k), medium (1k-10k), large (10k+)"),
    type: z.enum(["cx", "lead_gen", "internal", "other"]).optional(),
  }),
});

// ============================================
// BUILD FOR ME QUALIFICATION EXITS
// ============================================

export const BuildForMeQualifiedExit = new Autonomous.Exit({
  name: "build_for_me_qualified",
  description: "User qualifies for sales assistance and contact method has been determined",
  schema: z.object({
    timeline: z.enum(["asap", "month", "few_months", "exploring"]),
    budget: z.enum(["under_500", "500_to_2000", "over_2000", "not_sure"]),
    contactPreference: z.enum(["call", "booking"]).describe("How they want to be contacted"),
    phone: z.string().optional().describe("Phone number if they chose call - must be collected before exiting"),
  }),
});

export const BuildForMeNotQualifiedExit = new Autonomous.Exit({
  name: "build_for_me_not_qualified",
  description: "User does not qualify for sales, offer alternatives",
  schema: z.object({
    timeline: z.enum(["asap", "month", "few_months", "exploring"]),
    budget: z.enum(["under_500", "500_to_2000", "over_2000", "not_sure"]),
    interestedInPartner: z.boolean().describe("Whether they want partner program info"),
  }),
});

// ============================================
// HOW TO BUILD EXITS
// ============================================

export const BuildWithCodeExit = new Autonomous.Exit({
  name: "build_with_code",
  description: "User wants to build with code using the ADK",
});

export const BuildWithStudioExit = new Autonomous.Exit({
  name: "build_with_studio",
  description: "User wants to build visually using Botpress Studio",
});

