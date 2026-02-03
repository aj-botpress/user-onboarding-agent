# Webchat UI

Custom webchat interface for the user onboarding bot using the Botpress Chat API.

## Quick Start

```bash
bun install
bun dev
```

Open http://localhost:5173

## Architecture

```
src/
├── hooks/
│   └── useChat.ts        # Chat API connection and state
├── components/
│   ├── Chat.tsx          # Main container, choice buttons
│   ├── MessageList.tsx   # Sequential streaming orchestration
│   ├── Message.tsx       # Single message rendering
│   ├── MessageInput.tsx  # Text input and send button
│   └── StreamingText.tsx # Typewriter animation
└── types.ts              # Message type definitions
```

## How It Works

### Chat API Flow

`useChat.ts` follows the Botpress Chat API pattern:

1. `Client.connect()` - Creates anonymous user, returns authenticated client
2. `createConversation()` - Starts a new conversation
3. `listenConversation()` - SSE listener for incoming bot messages
4. `createMessage()` - Sends user messages

### Sequential Message Streaming

Bot messages stream one at a time with a typewriter effect. The flow:

```
Bot sends multiple messages
        ↓
MessageList tracks streamedIds (Set of completed message IDs)
        ↓
Only shows: user messages + streamed messages + ONE currently streaming
        ↓
StreamingText animates character by character
        ↓
On complete → adds to streamedIds → next message starts
        ↓
All done → shows choice buttons with staggered animation
```

Key files:
- `MessageList.tsx:22-24` - Finds first unstreamed bot message
- `MessageList.tsx:54-59` - Filters visible messages
- `Message.tsx:16` - Captures `shouldStream` on mount (prevents re-render issues)
- `StreamingText.tsx:23-34` - Interval-based typewriter effect

### Message Types

```typescript
// Text message
{ type: "text", text: "Hello!" }

// Choice message (shows buttons after streaming)
{ type: "choice", text: "Pick one:", options: [{ label: "A", value: "a" }] }
```

## Configuration

The webhook ID is hardcoded in `useChat.ts:5`. For production, move to environment variable:

```typescript
const WEBHOOK_ID = import.meta.env.VITE_CHAT_WEBHOOK_ID;
```

## Styling

Uses Tailwind CSS v4. Key design decisions:
- Bot messages: no background (plain text)
- User messages: light gray bubble (`bg-gray-100`)
- Choice buttons: black, staggered fade-in animation
- Container: gray padding creates border effect with rounded inner corners
