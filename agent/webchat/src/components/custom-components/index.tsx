import { DemosCarousel } from "./DemosCarousel";

// Registry of custom components mapped by their marker
const customComponents: Record<string, React.ComponentType> = {
  "{{DEMOS_CAROUSEL}}": DemosCarousel,
  // Add more custom components here:
  // "{{ANOTHER_COMPONENT}}": AnotherComponent,
};

// Check if text is a custom component marker
export function isCustomComponent(text: string): boolean {
  return text in customComponents;
}

// Get the custom component for a marker
export function getCustomComponent(text: string): React.ComponentType | null {
  return customComponents[text] || null;
}
