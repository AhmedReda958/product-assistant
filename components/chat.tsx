"use client";
import {
  ChatInput,
  ChatInputSubmit,
  ChatInputTextArea,
} from "@/components/ui/chat-input";
import {
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageContent,
} from "@/components/ui/chat-message";
import { ChatMessageArea } from "@/components/ui/chat-message-area";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { ComponentPropsWithoutRef } from "react";
import { useState, useEffect } from "react";

export function Chat({ ...props }: ComponentPropsWithoutRef<"div">) {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/chat",
    }),
    messages: [],
    onFinish: () => {
      //console.log("onFinish");
    },
  });

  // Track if we're in the initial sending state (before streaming starts)
  const [isSending, setIsSending] = useState(false);

  // Reset sending state when streaming starts or status changes
  useEffect(() => {
    if (status === "streaming") {
      setIsSending(false);
    }
  }, [status]);

  // No automatic message sending - just show welcome message when no messages exist

  const handleSubmitMessage = () => {
    if (status === "streaming" || !input.trim() || isSending) {
      return;
    }

    setIsSending(true);
    sendMessage({
      parts: [
        {
          type: "text",
          text: input,
        },
      ],
    });
    setInput("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
  };

  return (
    <div className="flex-1 flex flex-col h-full overflow-y-auto" {...props}>
      <ChatMessageArea scrollButtonAlignment="center">
        <div className="max-w-2xl mx-auto w-full px-4 py-8 space-y-4">
          {messages.length === 0 ? (
            // Welcome message when no messages exist
            <ChatMessage id="welcome-message">
              <ChatMessageAvatar />
              <ChatMessageContent content="Hello! I'm your AI shopping assistant. How can I assist you today?" />
            </ChatMessage>
          ) : (
            <>
              {messages.map((message) => {
                // Extract text content from parts
                const textContent = message.parts
                  .filter((part) => part.type === "text")
                  .map((part) => part.text)
                  .join("");

                if (message.role !== "user") {
                  return (
                    <ChatMessage key={message.id} id={message.id}>
                      <ChatMessageAvatar />
                      <ChatMessageContent content={textContent} />
                    </ChatMessage>
                  );
                }
                return (
                  <ChatMessage
                    key={message.id}
                    id={message.id}
                    variant="bubble"
                    type="outgoing"
                  >
                    <ChatMessageContent content={textContent} />
                  </ChatMessage>
                );
              })}
              {/* Show loading indicator when sending or streaming */}
              {(isSending || status === "streaming") && (
                <ChatMessage id="loading-message">
                  <ChatMessageAvatar />
                  <div className="flex flex-col gap-2">
                    <div className="flex items-center gap-3 text-muted-foreground">
                      <div className="flex space-x-1 mt-2">
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                        <div className="w-2 h-2 bg-current rounded-full animate-bounce"></div>
                      </div>
                    </div>
                  </div>
                </ChatMessage>
              )}
            </>
          )}
        </div>
      </ChatMessageArea>
      <div className="px-2 py-4 max-w-2xl mx-auto w-full">
        <ChatInput
          value={input}
          onChange={handleInputChange}
          onSubmit={handleSubmitMessage}
          loading={status === "streaming" || isSending}
          onStop={stop}
        >
          <ChatInputTextArea placeholder="Type a message..." />
          <ChatInputSubmit />
        </ChatInput>
      </div>
    </div>
  );
}
