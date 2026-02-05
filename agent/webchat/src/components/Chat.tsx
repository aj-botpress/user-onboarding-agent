import { useState, useRef, useEffect, useMemo } from "react";
import { useChat } from "../hooks/useChat";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { GetStartedCTA } from "./custom-components/GetStartedCTA";
import { getCTAVariant, isDismissableMarker } from "./custom-components";
import type { ChoiceMessage } from "../types";

export function Chat() {
  const { messages, isConnected, isLoading, error, sendMessage } = useChat();
  const [inputValue, setInputValue] = useState("");
  const [showChoices, setShowChoices] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Filter out control markers from display and detect UI states
  const { displayMessages, ctaVariant, isDismissable } = useMemo(() => {
    let variant: "adk" | "studio" | "explore" | null = null;
    let dismissable = false;

    const filtered = messages.filter((msg) => {
      if (msg.direction === "incoming" && msg.payload.type === "text") {
        const text = (msg.payload as { text: string }).text;

        // Check for CTA markers
        const ctaType = getCTAVariant(text);
        if (ctaType) {
          variant = ctaType;
          return false; // Don't display CTA markers
        }

        // Check for dismissable marker
        if (isDismissableMarker(text)) {
          dismissable = true;
          return false; // Don't display control markers
        }
      }
      return true;
    });

    return { displayMessages: filtered, ctaVariant: variant, isDismissable: dismissable };
  }, [messages]);

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

  const handleChoiceSelect = (label: string) => {
    setShowChoices(false);
    sendMessage(label);
  };

  const handleStreamComplete = () => {
    // Small delay before showing choices for better UX
    setTimeout(() => setShowChoices(true), 100);
  };

  // Get choices from the last bot message if it's a choice type
  const lastDisplayMessage = displayMessages[displayMessages.length - 1];
  const choices =
    lastDisplayMessage?.direction === "incoming" && lastDisplayMessage?.payload?.type === "choice"
      ? (lastDisplayMessage.payload as ChoiceMessage).options
      : null;

  const handleClose = () => {
    alert("Close button clicked");
  };

  const header = (
    <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-blue-400 to-purple-500" />
        <span className="font-semibold text-gray-900">Botpress Scout</span>
      </div>
      {isDismissable && (
        <button
          onClick={handleClose}
          className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-400 hover:text-gray-600"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      )}
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
          messages={displayMessages}
          isLoading={isLoading}
          onStreamComplete={handleStreamComplete}
        />
      </div>

      {/* CTA card OR input section */}
      {ctaVariant ? (
        <div className="px-4 pb-4">
          <GetStartedCTA variant={ctaVariant} />
        </div>
      ) : (
        <>
          {/* Choice buttons - above input, right-aligned, staggered animation */}
          {choices && showChoices && (
            <div className="flex flex-col gap-2 items-end px-4 pb-2">
              {choices.map((option, index) => (
                <button
                  key={option.value}
                  className="bg-black text-white px-5 py-3 rounded-full text-sm hover:bg-gray-800 transition-all cursor-pointer animate-fade-in-up"
                  style={{ animationDelay: `${index * 100}ms` }}
                  onClick={() => handleChoiceSelect(option.label)}
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
        </>
      )}

      {/* Footer */}
      <div className="text-center text-xs text-gray-400 pb-3">
        Built with the Botpress ADK
      </div>
    </div>
  );
}
