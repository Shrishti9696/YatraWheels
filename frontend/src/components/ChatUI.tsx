import React, { useState } from "react";
import { useChat } from "../hooks/useChat";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ScrollArea } from "./ui/scroll-area";
import { Send, Wifi, WifiOff, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface ChatUIProps {
  bookingId: string;
  currentUserId: string;
  receiverId: string;
  receiverName: string;
}

export const ChatUI: React.FC<ChatUIProps> = ({
  bookingId,
  currentUserId,
  receiverId,
  receiverName,
}) => {
  const { messages, sendMessage, isConnected, isReconnecting } = useChat(
    bookingId,
    currentUserId,
    receiverId
  );
  const [inputText, setInputText] = useState("");

  const handleSend = () => {
    if (inputText.trim()) {
      sendMessage(inputText);
      setInputText("");
    }
  };

  return (
    <div className="flex flex-col h-[500px] w-full max-w-md bg-card border border-card-border rounded-2xl overflow-hidden shadow-xl">
      {/* Header */}
      <div className="p-4 border-b border-card-border bg-muted/30 flex items-center justify-between">
        <div>
          <h3 className="font-semibold text-sm">{receiverName}</h3>
          <div className="flex items-center gap-1.5 mt-0.5">
            <div
              className={cn(
                "w-2 h-2 rounded-full",
                isConnected ? "bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.6)]" : "bg-amber-500"
              )}
            />
            <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wider">
              {isConnected ? "Connected" : isReconnecting ? "Reconnecting..." : "Offline"}
            </span>
          </div>
        </div>
      </div>

      {/* Messages */}
      <ScrollArea className="flex-1 p-4">
        <div className="space-y-3">
          {messages.map((msg, i) => {
            const isMe = msg.sender === currentUserId;
            return (
              <div
                key={msg._id || i}
                className={cn(
                  "flex flex-col max-w-[80%]",
                  isMe ? "ml-auto items-end" : "mr-auto items-start"
                )}
              >
                <div
                  className={cn(
                    "px-4 py-2 rounded-2xl text-sm",
                    isMe
                      ? "bg-primary text-white rounded-tr-none"
                      : "bg-muted text-foreground rounded-tl-none"
                  )}
                >
                  {msg.text}
                </div>
                <span className="text-[10px] text-muted-foreground mt-1 px-1">
                  {new Date(msg.createdAt).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Reconnecting Banner */}
      {isReconnecting && !isConnected && (
        <div className="bg-amber-500/10 border-y border-amber-500/20 px-4 py-1.5 flex items-center justify-center gap-2">
          <Loader2 className="w-3 h-3 text-amber-500 animate-spin" />
          <span className="text-[10px] text-amber-600 font-medium">
            Connection lost. Polling for updates...
          </span>
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-card-border flex gap-2">
        <Input
          placeholder="Type a message..."
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSend()}
          className="rounded-xl bg-muted/50 border-0 focus-visible:ring-1 focus-visible:ring-primary/50"
        />
        <Button
          onClick={handleSend}
          disabled={!inputText.trim()}
          size="icon"
          className="rounded-xl gradient-blue-purple shadow-lg shadow-primary/25"
        >
          <Send className="w-4 h-4" />
        </Button>
      </div>
    </div>
  );
};
