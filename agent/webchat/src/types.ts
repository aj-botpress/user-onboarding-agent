// Message types for the chat
export interface TextMessage {
  type: "text";
  text: string;
}

export interface ChoiceOption {
  label: string;
  value: string;
}

export interface ChoiceMessage {
  type: "choice";
  text: string;
  options: ChoiceOption[];
}

export type MessagePayload = TextMessage | ChoiceMessage;

export interface ChatMessage {
  id: string;
  conversationId: string;
  userId: string;
  payload: MessagePayload;
  createdAt: string;
  direction: "incoming" | "outgoing";
}

export interface ChatState {
  messages: ChatMessage[];
  isConnected: boolean;
  isLoading: boolean;
  error: string | null;
}
