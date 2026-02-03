import { useEffect, useRef, useState } from "react";
import type { ChatMessage } from "../types";
import { Message } from "./Message";

interface MessageListProps {
  messages: ChatMessage[];
  isLoading?: boolean;
  onStreamComplete?: () => void;
}

export function MessageList({
  messages,
  isLoading,
  onStreamComplete,
}: MessageListProps) {
  // Track which message IDs have finished streaming
  const [streamedIds, setStreamedIds] = useState<Set<string>>(new Set());
  const onStreamCompleteRef = useRef(onStreamComplete);
  onStreamCompleteRef.current = onStreamComplete;

  // Find the first bot message that hasn't been streamed yet
  const firstUnstreamedBotIndex = messages.findIndex(
    (msg) => msg.direction === "incoming" && !streamedIds.has(msg.id)
  );

  // Check if all messages have been streamed
  const allStreamed = messages.every(
    (msg) => msg.direction === "outgoing" || streamedIds.has(msg.id)
  );

  // Call onStreamComplete when all messages are done
  useEffect(() => {
    if (allStreamed && messages.length > 0) {
      onStreamCompleteRef.current?.();
    }
  }, [allStreamed, messages.length]);

  const handleMessageStreamComplete = (msgId: string) => {
    setStreamedIds((prev) => new Set([...prev, msgId]));
  };

  if (messages.length === 0 && !isLoading) {
    return (
      <div className="h-full flex items-center justify-center text-gray-400">
        <p>Start a conversation...</p>
      </div>
    );
  }

  // Only show messages that should be visible:
  // - User messages (outgoing) - always visible
  // - Bot messages that have streamed
  // - The ONE bot message currently streaming
  const visibleMessages = messages.filter((msg, index) => {
    if (msg.direction === "outgoing") return true;
    if (streamedIds.has(msg.id)) return true;
    if (index === firstUnstreamedBotIndex) return true;
    return false;
  });

  // Group consecutive messages together for display
  const groupedMessages: { messages: ChatMessage[]; direction: string }[] = [];

  for (const msg of visibleMessages) {
    const lastGroup = groupedMessages[groupedMessages.length - 1];
    if (lastGroup && lastGroup.direction === msg.direction) {
      lastGroup.messages.push(msg);
    } else {
      groupedMessages.push({ messages: [msg], direction: msg.direction });
    }
  }

  return (
    <div className="flex flex-col gap-4">
      {groupedMessages.map((group, groupIndex) => (
        <div
          key={groupIndex}
          className={`flex flex-col gap-2 ${
            group.direction === "outgoing" ? "items-end" : "items-start"
          }`}
        >
          {group.messages.map((msg) => {
            const isStreaming = !streamedIds.has(msg.id) && msg.direction === "incoming";
            const isFirstStreaming =
              isStreaming &&
              messages.findIndex((m) => m.id === msg.id) === firstUnstreamedBotIndex;

            return (
              <Message
                key={msg.id}
                message={msg}
                isNew={isStreaming}
                isFirstStreaming={isFirstStreaming}
                onStreamComplete={() => handleMessageStreamComplete(msg.id)}
              />
            );
          })}
        </div>
      ))}

      {isLoading && (
        <div className="flex items-start">
          <span className="animate-shimmer">Thinking...</span>
        </div>
      )}

      {/* Spacer to allow scrolling user messages to top */}
      <div className="min-h-[60vh]" />
    </div>
  );
}
