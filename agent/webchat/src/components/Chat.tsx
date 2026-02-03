import { useState, useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import type { ChoiceMessage } from "../types";

export function Chat() {
  const { messages, isConnected, isLoading, error, sendMessage } = useChat();
  const [inputValue, setInputValue] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [showChoices, setShowChoices] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Reset showChoices when messages change (new message arrived)
  useEffect(() => {
    setShowChoices(false);
    setIsStreaming(true);
  }, [messages.length]);

  const handleSend = () => {
    if (!inputValue.trim()) return;
    sendMessage(inputValue.trim());
    setInputValue("");
  };

  const handleChoiceSelect = (value: string) => {
    setShowChoices(false);
    sendMessage(value);
  };

  const handleStreamComplete = () => {
    setIsStreaming(false);
    // Small delay before showing choices for better UX
    setTimeout(() => setShowChoices(true), 100);
  };

  // Get choices from the last bot message if it's a choice type
  const lastMessage = messages[messages.length - 1];
  const choices =
    lastMessage?.direction === "incoming" && lastMessage?.payload?.type === "choice"
      ? (lastMessage.payload as ChoiceMessage).options
      : null;

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center gap-2 px-4 py-3 border-b border-gray-100">
        <span className="font-medium text-gray-900">Botpress Agent</span>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4">
        <MessageList
          messages={messages}
          isLoading={isLoading && messages.length > 0}
          onStreamComplete={handleStreamComplete}
        />
        <div ref={messagesEndRef} />
      </div>

      {/* Choice buttons - above input, right-aligned, staggered animation */}
      {choices && showChoices && (
        <div className="flex flex-col gap-2 items-end px-4 pb-2">
          {choices.map((option, index) => (
            <button
              key={option.value}
              className="bg-black text-white px-5 py-3 rounded-full text-sm hover:bg-gray-800 transition-all cursor-pointer animate-fade-in-up"
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => handleChoiceSelect(option.value)}
            >
              {option.label}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <MessageInput
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        disabled={!isConnected || isLoading}
        placeholder="Send your message..."
      />
    </div>
  );
}
