import { useEffect, useRef, useState } from "react";
import type { ChatMessage, ChoiceMessage } from "../types";
import { StreamingText } from "./StreamingText";

interface MessageProps {
  message: ChatMessage;
  isNew?: boolean;
  onStreamComplete?: () => void;
}

export function Message({ message, isNew = false, onStreamComplete }: MessageProps) {
  const { payload, direction } = message;
  const isBot = direction === "incoming";

  // Capture isNew on first render so it doesn't change
  const [shouldStream] = useState(() => isNew && isBot);
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
        return (
          <p className="leading-relaxed">
            {shouldStream ? (
              <StreamingText text={payload.text} speed={15} onComplete={handleStreamComplete} />
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
              <StreamingText text={choicePayload.text} speed={15} onComplete={handleStreamComplete} />
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
    return (
      <div className="text-gray-900">
        {renderContent()}
      </div>
    );
  }

  return (
    <div className="bg-gray-100 text-gray-900 px-4 py-3 rounded-2xl max-w-[80%] ml-auto">
      {renderContent()}
    </div>
  );
}
