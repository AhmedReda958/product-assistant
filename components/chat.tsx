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
import { useState } from "react";

export function Chat({ ...props }: ComponentPropsWithoutRef<"div">) {
  const [input, setInput] = useState("");

  const { messages, sendMessage, status, stop } = useChat({
    transport: new DefaultChatTransport({
      api: "/api/ai/chat",
    }),
    messages: [
      {
        id: "1",
        role: "user",
        parts: [
          {
            type: "text",
            text: "Hi! I need help organizing my project management workflow. Can you guide me through some best practices?",
          },
        ],
      },
      {
        id: "2",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "I'd be happy to help you with project management best practices! Here's a structured approach:\n\n#### 1. Project Initiation\n- Define clear project objectives\n- Identify key stakeholders\n- Set measurable goals\n- Create project charter\n\n#### 2. Planning Phase\n- Break down work into tasks\n- Set priorities\n- Create timeline\n- Assign responsibilities\n\nWould you like me to elaborate on any of these points?",
          },
        ],
      },
      {
        id: "3",
        role: "user",
        parts: [
          {
            type: "text",
            text: "Yes, please tell me more about breaking down work into tasks. How should I approach this?",
          },
        ],
      },
      {
        id: "4",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "Breaking down work into tasks is crucial for project success. Here's a detailed approach:\n\n##### Work Breakdown Structure (WBS)\n1. **Start with major deliverables**\n   - Identify end goals\n   - List main project phases\n\n2. **Break into smaller components**\n   - Tasks should be:\n     - Specific\n     - Measurable\n     - Achievable\n     - Time-bound\n\n3. **Task Estimation**\n   ```\n   Task Example:\n   - Name: User Authentication Feature\n   - Duration: 3 days\n   - Dependencies: Database setup\n   - Priority: High\n   ```\n\n4. **Use the 8/80 Rule**\n   - Tasks shouldn't take less than 8 hours\n   - Or more than 80 hours\n   - If they do, break them down further",
          },
        ],
      },
      {
        id: "5",
        role: "user",
        parts: [
          {
            type: "text",
            text: "That's really helpful! What tools would you recommend for tracking all these tasks?",
          },
        ],
      },
      {
        id: "6",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "Here are some popular project management tools:\n\n##### Tips for Tool Selection\n- ✅ Consider team size\n- ✅ Integration needs\n- ✅ Learning curve\n- ✅ Budget constraints\n\nWould you like specific recommendations based on your team's needs?",
          },
        ],
      },
      {
        id: "7",
        role: "user",
        parts: [
          {
            type: "text",
            text: "Yes, we're a small team of 5 developers. What would work best for us?",
          },
        ],
      },
      {
        id: "8",
        role: "assistant",
        parts: [
          {
            type: "text",
            text: "For a team of 5 developers, I'd recommend:\n\n##### Primary Choice: Jira Software\n\n**Advantages:**\n- 🔧 Built for development teams\n- 📊 Great for agile workflows\n- 🔄 Git integration\n- 📱 Mobile apps\n\n##### Alternative: ClickUp\n\n**Benefits:**\n- 💰 Cost-effective\n- 🎨 More flexible\n- 🚀 Faster setup\n\n```\nRecommended Setup:\n- Sprint Length: 2 weeks\n- Board Structure:\n  - Backlog\n  - To Do\n  - In Progress\n  - Code Review\n  - Testing\n  - Done\n- Key Features:\n  - Story Points\n  - Time Tracking\n  - Sprint Reports\n```\n\nWould you like me to explain how to set up the recommended workflow in either of these tools?",
          },
        ],
      },
    ],
    onFinish: () => {
      //console.log("onFinish");
    },
  });

  const handleSubmitMessage = () => {
    if (status === "streaming" || !input.trim()) {
      return;
    }
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
        </div>
      </ChatMessageArea>
      <div className="px-2 py-4 max-w-2xl mx-auto w-full">
        <ChatInput
          value={input}
          onChange={handleInputChange}
          onSubmit={handleSubmitMessage}
          loading={status === "streaming"}
          onStop={stop}
        >
          <ChatInputTextArea placeholder="Type a message..." />
          <ChatInputSubmit />
        </ChatInput>
      </div>
    </div>
  );
}
