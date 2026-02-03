import { useState, useEffect, useCallback, useRef } from "react";
import { Client, type Signals } from "@botpress/chat";
import type { ChatMessage, ChatState } from "../types";

const WEBHOOK_ID = "681ee284-38b5-4913-8593-20681bea6e81";

type AuthenticatedClient = Awaited<ReturnType<typeof Client.connect>>;

export function useChat() {
  const [state, setState] = useState<ChatState>({
    messages: [],
    isConnected: false,
    isLoading: true,
    error: null,
  });

  const clientRef = useRef<AuthenticatedClient | null>(null);
  const conversationIdRef = useRef<string | null>(null);

  useEffect(() => {
    const init = async () => {
      try {
        // 1. Connect (handles user creation automatically)
        const client = await Client.connect({ webhookId: WEBHOOK_ID });
        clientRef.current = client;

        // 2. Create conversation
        const { conversation } = await client.createConversation({});
        conversationIdRef.current = conversation.id;

        // 3. Listen for messages via SSE
        const listener = await client.listenConversation({ id: conversation.id });

        listener.on("message_created", (event: Signals["message_created"]) => {
          if (event.isBot) {
            const newMessage: ChatMessage = {
              id: event.id,
              conversationId: event.conversationId,
              userId: event.userId,
              payload: event.payload as ChatMessage["payload"],
              createdAt: event.createdAt,
              direction: "incoming",
            };

            setState((prev) => ({
              ...prev,
              messages: [...prev.messages, newMessage],
              isLoading: false,
            }));
          }
        });

        setState((prev) => ({
          ...prev,
          isConnected: true,
          isLoading: false,
        }));
      } catch (error) {
        console.error("Failed to initialize chat:", error);
        setState((prev) => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "Failed to connect",
        }));
      }
    };

    init();
  }, []);

  const sendMessage = useCallback(async (text: string) => {
    if (!clientRef.current || !conversationIdRef.current) return;

    try {
      setState((prev) => ({ ...prev, isLoading: true }));

      const { message } = await clientRef.current.createMessage({
        conversationId: conversationIdRef.current,
        payload: { type: "text", text },
      });

      const outgoingMessage: ChatMessage = {
        id: message.id,
        conversationId: message.conversationId,
        userId: message.userId,
        payload: message.payload as ChatMessage["payload"],
        createdAt: message.createdAt,
        direction: "outgoing",
      };

      setState((prev) => ({
        ...prev,
        messages: [...prev.messages, outgoingMessage],
      }));
    } catch (error) {
      console.error("Failed to send message:", error);
      setState((prev) => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : "Failed to send",
      }));
    }
  }, []);

  return {
    ...state,
    sendMessage,
  };
}
