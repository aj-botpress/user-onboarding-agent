import { useState, useEffect, useRef } from "react";

interface StreamingTextProps {
  text: string;
  speed?: number; // ms per character
  onComplete?: () => void;
}

export function StreamingText({ text, speed = 20, onComplete }: StreamingTextProps) {
  const [displayedText, setDisplayedText] = useState("");
  const onCompleteRef = useRef(onComplete);
  const hasCompletedRef = useRef(false);

  // Keep the ref updated
  onCompleteRef.current = onComplete;

  useEffect(() => {
    // Reset for new text
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
  }, [text, speed]);

  return <span>{displayedText}</span>;
}
