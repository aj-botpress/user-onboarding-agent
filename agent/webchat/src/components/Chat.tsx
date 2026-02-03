import { useState, useRef, useEffect } from "react";
import { useChat } from "../hooks/useChat";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import type { ChoiceMessage } from "../types";

export function Chat() {
  const { messages, isConnected, isLoading, error, sendMessage } = useChat();
  const [inputValue, setInputValue] = useState("");
  const [showChoices, setShowChoices] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Scroll user's message to top when they send one
  useEffect(() => {
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.direction !== "outgoing") return;

    // Find the last user message element and scroll it to top
    requestAnimationFrame(() => {
      const container = scrollContainerRef.current;
      if (!container) return;

      const userMessages = container.querySelectorAll("[data-user-message]");
      const lastUserMessage = userMessages[userMessages.length - 1] as HTMLElement;

      if (lastUserMessage) {
        const containerRect = container.getBoundingClientRect();
        const elementRect = lastUserMessage.getBoundingClientRect();
        const scrollPosition = container.scrollTop + (elementRect.top - containerRect.top) - 16;

        container.scrollTo({
          top: scrollPosition,
          behavior: "smooth",
        });
      }
    });
  }, [messages]);

  // Reset showChoices when messages change (new message arrived)
  useEffect(() => {
    setShowChoices(false);
  }, [messages.length]);

  // Focus input when bot finishes responding
  useEffect(() => {
    if (!isLoading && messages.length > 0) {
      inputRef.current?.focus();
    }
  }, [isLoading, messages.length]);

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
    // Small delay before showing choices for better UX
    setTimeout(() => setShowChoices(true), 100);
  };

  // Get choices from the last bot message if it's a choice type
  const lastMessage = messages[messages.length - 1];
  const choices =
    lastMessage?.direction === "incoming" && lastMessage?.payload?.type === "choice"
      ? (lastMessage.payload as ChoiceMessage).options
      : null;

  const header = (
    <div className="flex items-center gap-3 px-4 py-3 border-b border-gray-100">
      <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
      <span className="font-semibold text-gray-900">Botpress Scout</span>
    </div>
  );

  if (error) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
        <h2 className="text-lg font-semibold text-gray-900 mb-2">Connection Error</h2>
        <p className="text-gray-600">{error}</p>
      </div>
    );
  }

  const handleStartChat = () => {
    sendMessage("Hello!");
  };

  // Welcome screen when no messages yet (button disabled until connected)
  if (messages.length === 0) {
    return (
      <div className="flex flex-col h-full">
        {header}

        {/* Welcome content */}
        <div className="flex-1 flex flex-col items-center justify-center p-8">
          <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-amber-200 via-orange-300 to-pink-400 mb-6" />
          <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
            Welcome to Botpress, Let's have a chat!
          </h2>
          <button
            onClick={handleStartChat}
            disabled={!isConnected}
            className="bg-black text-white px-6 py-3 rounded-full text-sm font-medium hover:bg-gray-800 transition-colors cursor-pointer disabled:bg-gray-300 disabled:cursor-not-allowed"
          >
            Start chatting
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {header}

      {/* Messages */}
      <div ref={scrollContainerRef} className="flex-1 overflow-y-auto p-4">
        <MessageList
          messages={messages}
          isLoading={isLoading}
          onStreamComplete={handleStreamComplete}
        />
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
        ref={inputRef}
        value={inputValue}
        onChange={setInputValue}
        onSend={handleSend}
        disabled={!isConnected || isLoading}
        placeholder="Send your message..."
      />
    </div>
  );
}
