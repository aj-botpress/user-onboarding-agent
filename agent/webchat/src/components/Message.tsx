import { useEffect, useRef, useState } from "react";
import type { ChatMessage, ChoiceMessage } from "../types";
import { StreamingText } from "./StreamingText";
import { isCustomComponent, getCustomComponent } from "./custom-components";

interface MessageProps {
  message: ChatMessage;
  isNew?: boolean;
  isFirstStreaming?: boolean; // First message to stream after user input
  onStreamComplete?: () => void;
}

export function Message({
  message,
  isNew = false,
  isFirstStreaming = false,
  onStreamComplete,
}: MessageProps) {
  const { payload, direction } = message;
  const isBot = direction === "incoming";

  // Capture on first render so they don't change
  const [shouldStream] = useState(() => isNew && isBot);
  const [showThinking] = useState(() => isFirstStreaming && isBot);
  const hasCalledComplete = useRef(false);

  // If not streaming, call onStreamComplete immediately (once)
  useEffect(() => {
    if (!shouldStream && !hasCalledComplete.current) {
      hasCalledComplete.current = true;
      onStreamComplete?.();
    }
  }, [shouldStream, onStreamComplete]);

  const handleStreamComplete = () => {
    if (!hasCalledComplete.current) {
      hasCalledComplete.current = true;
      onStreamComplete?.();
    }
  };

  const renderContent = () => {
    switch (payload.type) {
      case "text":
        // Check for custom component markers
        if (isCustomComponent(payload.text)) {
          // Call complete immediately since no streaming needed
          if (!hasCalledComplete.current) {
            hasCalledComplete.current = true;
            setTimeout(() => onStreamComplete?.(), 0);
          }
          const CustomComponent = getCustomComponent(payload.text);
          return CustomComponent ? <CustomComponent /> : null;
        }

        return (
          <p className="leading-relaxed">
            {shouldStream ? (
              <StreamingText
                text={payload.text}
                speed={15}
                showThinking={showThinking}
                onComplete={handleStreamComplete}
              />
            ) : (
              payload.text
            )}
          </p>
        );

      case "choice":
        const choicePayload = payload as ChoiceMessage;
        return choicePayload.text ? (
          <p className="leading-relaxed">
            {shouldStream ? (
              <StreamingText
                text={choicePayload.text}
                speed={15}
                showThinking={showThinking}
                onComplete={handleStreamComplete}
              />
            ) : (
              choicePayload.text
            )}
          </p>
        ) : null;

      default:
        return (
          <p className="leading-relaxed">
            {JSON.stringify(payload)}
          </p>
        );
    }
  };

  if (isBot) {
    // Check if this is a custom component (full width)
    const isCustom = payload.type === "text" && isCustomComponent(payload.text);

    return (
      <div className={`text-gray-900 ${isCustom ? "w-full" : ""}`}>
        {renderContent()}
      </div>
    );
  }

  return (
    <div
      data-user-message
      className="bg-gray-100 text-gray-900 px-4 py-3 rounded-2xl max-w-[80%] ml-auto"
    >
      {renderContent()}
    </div>
  );
}
