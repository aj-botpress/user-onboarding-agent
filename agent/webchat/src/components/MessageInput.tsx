import { forwardRef } from "react";

interface MessageInputProps {
  value: string;
  onChange: (value: string) => void;
  onSend: () => void;
  disabled?: boolean;
  placeholder?: string;
}

export const MessageInput = forwardRef<HTMLInputElement, MessageInputProps>(
  function MessageInput(
    { value, onChange, onSend, disabled, placeholder = "Type a message..." },
    ref
  ) {
    const handleKeyDown = (e: React.KeyboardEvent) => {
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault();
        onSend();
      }
    };

    return (
      <div className="p-4">
        <div className="flex items-center gap-3 bg-gray-100 rounded-xl pl-5 pr-2 py-2">
          <input
            ref={ref}
            type="text"
            className="flex-1 bg-transparent py-1 text-sm outline-none placeholder:text-gray-400 disabled:cursor-not-allowed"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            disabled={disabled}
          />
          <button
            className="w-9 h-9 flex items-center justify-center rounded-full bg-black text-white disabled:bg-gray-300 disabled:cursor-not-allowed hover:bg-gray-800 transition-colors shrink-0"
            onClick={onSend}
            disabled={disabled || !value.trim()}
            aria-label="Send message"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 19V5M5 12l7-7 7 7" />
            </svg>
          </button>
        </div>
      </div>
  );
});
