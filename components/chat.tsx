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
import { ChatProductCard } from "@/components/chat-product-card";
import { useChat } from "@ai-sdk/react";
import { DefaultChatTransport } from "ai";
import type { ComponentPropsWithoutRef } from "react";
import { useState, useEffect } from "react";

interface ChatProps extends ComponentPropsWithoutRef<"div"> {
  initialMessage?: string | null;
}

export function Chat({ initialMessage, ...props }: ChatProps) {
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

  // Handle initial message from URL parameter
  useEffect(() => {
    if (
      initialMessage &&
      messages.length === 0 &&
      status !== "streaming" &&
      !isSending
    ) {
      // Set the input to the initial message and send it
      setInput(initialMessage);
      setIsSending(true);
      sendMessage({
        parts: [
          {
            type: "text",
            text: initialMessage,
          },
        ],
      });
      setInput("");
    }
  }, [initialMessage, messages.length, status, isSending, sendMessage]);

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

  // Function to extract product information from message content
  const extractProductsFromMessage = (content: string) => {
    const products = [];
    const productRegex = /## \[([^\]]+)\]\(\/products\/(\d+)\)/g;
    let match;

    while ((match = productRegex.exec(content)) !== null) {
      const [, title, id] = match;
      // Extract additional product info from the content
      const priceMatch = content.match(
        new RegExp(`\\*\\*Price:\\*\\* \\$?(\\d+)`, "g")
      );
      const categoryMatch = content.match(
        new RegExp(`\\*\\*Category:\\*\\* ([^\\n]+)`, "g")
      );
      const imageMatch = content.match(
        new RegExp(
          `!\\[${title.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\]\\(([^)]+)\\)`
        )
      );

      if (priceMatch && categoryMatch) {
        const price = parseInt(priceMatch[0].match(/\$?(\d+)/)?.[1] || "0");
        const category = categoryMatch[0].replace("**Category:** ", "");
        const image = imageMatch?.[1] || "/placeholder-product.jpg";

        products.push({
          id: parseInt(id),
          title,
          price,
          description: "", // We'll need to get this from the API
          category: {
            id: 0, // We'll need to get this from the API
            name: category,
            image: "",
          },
          images: [image],
        });
      }
    }

    return products;
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
                  const products = extractProductsFromMessage(textContent);

                  return (
                    <ChatMessage key={message.id} id={message.id}>
                      <ChatMessageAvatar />
                      <div className="space-y-4">
                        <ChatMessageContent content={textContent} />
                        {products.length > 0 && (
                          <div className="flex flex-wrap gap-4 justify-center">
                            {products.map((product) => (
                              <ChatProductCard
                                key={product.id}
                                product={product}
                              />
                            ))}
                          </div>
                        )}
                      </div>
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
