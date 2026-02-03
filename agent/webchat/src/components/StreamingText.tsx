import { useState, useEffect, useRef } from "react";

interface StreamingTextProps {
  text: string;
  speed?: number; // ms per character
  onComplete?: () => void;
  showThinking?: boolean; // Show "Thinking..." before streaming
}

export function StreamingText({
  text,
  speed = 20,
  onComplete,
  showThinking = false,
}: StreamingTextProps) {
  const [phase, setPhase] = useState<"thinking" | "streaming">(
    showThinking ? "thinking" : "streaming"
  );
  const [displayedText, setDisplayedText] = useState("");
  const onCompleteRef = useRef(onComplete);
  const hasCompletedRef = useRef(false);

  onCompleteRef.current = onComplete;

  // Thinking phase: show "Thinking..." briefly, then transition to streaming
  useEffect(() => {
    if (!showThinking) return;

    const timer = setTimeout(() => {
      setPhase("streaming");
    }, 100); // Brief pause for smooth transition from loading indicator

    return () => clearTimeout(timer);
  }, [showThinking]);

  // Streaming phase: character-by-character reveal
  useEffect(() => {
    if (phase !== "streaming") return;

    setDisplayedText("");
    hasCompletedRef.current = false;

    let index = 0;
    const interval = setInterval(() => {
      if (index < text.length) {
        index++;
        setDisplayedText(text.slice(0, index));
      } else {
        clearInterval(interval);
        if (!hasCompletedRef.current) {
          hasCompletedRef.current = true;
          onCompleteRef.current?.();
        }
      }
    }, speed);

    return () => clearInterval(interval);
  }, [phase, text, speed]);

  if (phase === "thinking") {
    return <span className="animate-shimmer">Thinking...</span>;
  }

  return <span>{displayedText}</span>;
}
