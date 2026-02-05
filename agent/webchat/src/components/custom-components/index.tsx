import { DemosCarousel } from "./DemosCarousel";
import { BookingCard } from "./BookingCard";

// Registry of custom components mapped by their marker
const customComponents: Record<string, React.ComponentType> = {
  "{{DEMOS_CAROUSEL}}": DemosCarousel,
  "{{BOOKING_CARD}}": BookingCard,
};

// CTA markers - these don't render as messages, but trigger input replacement
export const CTA_MARKERS = {
  ADK: "{{ADK_CTA}}",
  STUDIO: "{{STUDIO_CTA}}",
  EXPLORE: "{{EXPLORE_CTA}}",
} as const;

// Control markers - trigger UI state changes
export const CONTROL_MARKERS = {
  DISMISSABLE: "{{DISMISSABLE}}",
} as const;

// Check if text is a custom component marker
export function isCustomComponent(text: string): boolean {
  return text in customComponents;
}

// Get the custom component for a marker
export function getCustomComponent(text: string): React.ComponentType | null {
  return customComponents[text] || null;
}

// Check if text is a CTA marker (should not be rendered as message)
export function isCTAMarker(text: string): boolean {
  return Object.values(CTA_MARKERS).includes(text as typeof CTA_MARKERS[keyof typeof CTA_MARKERS]);
}

// Get CTA variant from marker
export function getCTAVariant(text: string): "adk" | "studio" | "explore" | null {
  if (text === CTA_MARKERS.ADK) return "adk";
  if (text === CTA_MARKERS.STUDIO) return "studio";
  if (text === CTA_MARKERS.EXPLORE) return "explore";
  return null;
}

// Check if text is a control marker
export function isControlMarker(text: string): boolean {
  return Object.values(CONTROL_MARKERS).includes(text as typeof CONTROL_MARKERS[keyof typeof CONTROL_MARKERS]);
}

// Check if text is the dismissable marker
export function isDismissableMarker(text: string): boolean {
  return text === CONTROL_MARKERS.DISMISSABLE;
}
