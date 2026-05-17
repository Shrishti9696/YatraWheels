import { useState, useEffect, useCallback, useRef } from "react";
import { io, Socket } from "socket.io-client";

interface Message {
  _id?: string;
  sender: string;
  receiver: string;
  bookingId: string;
  text: string;
  delivered: boolean;
  read: boolean;
  createdAt: string;
}

export function useChat(bookingId: string, currentUserId: string, receiverId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [isReconnecting, setIsReconnecting] = useState(false);
  const socketRef = useRef<Socket | null>(null);
  const pollingIntervalRef = useRef<NodeJS.Timeout | null>(null);

  const BACKEND_URL = window.location.origin;

  // REST Fallback: Fetch messages
  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/messages/${bookingId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Failed to fetch messages via REST:", err);
    }
  }, [bookingId]);

  // REST Fallback: Send message
  const sendMessageREST = async (text: string) => {
    try {
      const res = await fetch("/api/messages", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ receiverId, bookingId, text }),
      });
      if (res.ok) {
        const newMessage = await res.json();
        setMessages((prev) => [...prev, newMessage]);
      }
    } catch (err) {
      console.error("Failed to send message via REST:", err);
    }
  };

  // Replit Keepalive Ping
  useEffect(() => {
    const ping = setInterval(() => {
      fetch("/api/health").catch(() => {});
    }, 25000);
    return () => clearInterval(ping);
  }, []);

  // Initialize Socket
  useEffect(() => {
    if (!currentUserId) return;

    const socket = io(BACKEND_URL, {
      query: { userId: currentUserId },
      reconnection: true,
      reconnectionAttempts: Infinity,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
      transports: ["websocket", "polling"],
    });

    socketRef.current = socket;

    socket.on("connect", () => {
      setIsConnected(true);
      setIsReconnecting(false);
      if (pollingIntervalRef.current) {
        clearInterval(pollingIntervalRef.current);
        pollingIntervalRef.current = null;
      }
      // Fetch fresh messages on reconnect to ensure consistency
      fetchMessages();
    });

    socket.on("disconnect", () => {
      setIsConnected(false);
      setIsReconnecting(true);
      // Start polling as fallback
      if (!pollingIntervalRef.current) {
        pollingIntervalRef.current = setInterval(fetchMessages, 5000);
      }
    });

    socket.on("reconnect_attempt", () => {
      setIsReconnecting(true);
    });

    socket.on("new_message", (message: Message) => {
      if (message.bookingId === bookingId) {
        setMessages((prev) => {
          // Avoid duplicates
          if (prev.some((m) => m._id === message._id)) return prev;
          return [...prev, message];
        });
      }
    });

    return () => {
      socket.disconnect();
      if (pollingIntervalRef.current) clearInterval(pollingIntervalRef.current);
    };
  }, [currentUserId, bookingId, BACKEND_URL, fetchMessages]);

  const sendMessage = (text: string) => {
    if (isConnected && socketRef.current) {
      socketRef.current.emit("send_message", {
        receiverId,
        bookingId,
        text,
      });
      // We also optimisticly add to local state or wait for "new_message" from self
      // Usually socket.io pattern is: client emits -> server saves & emits to both
    } else {
      sendMessageREST(text);
    }
  };

  return {
    messages,
    sendMessage,
    isConnected,
    isReconnecting,
  };
}
