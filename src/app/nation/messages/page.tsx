"use client";

import { useState, useEffect } from "react";
import { Send, User, Search } from "lucide-react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { useToast } from "@/components/ui/Toast";
import { nation, type Message } from "@/lib/api";
import { SkeletonGroup } from "@/components/ui/Skeleton";

interface Conversation {
  id: string;
  name: string;
  lastMessage: string;
  time: string;
  unread: boolean;
}

export default function MessagesPage() {
  const { error, success } = useToast();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<(Message & { sender: "me" | "them" })[]>([]);
  const [activeConvo, setActiveConvo] = useState<string | null>(null);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [sending, setSending] = useState(false);

  useEffect(() => {
    loadConversations();
    const interval = setInterval(loadConversations, 5000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (activeConvo) {
      loadMessages(activeConvo);
      const interval = setInterval(() => loadMessages(activeConvo), 3000);
      return () => clearInterval(interval);
    }
  }, [activeConvo]);

  async function loadConversations() {
    try {
      setLoading(true);
      const convos = await nation.getConversations();
      setConversations(convos.map((c: any) => ({
        id: c.id,
        name: c.participantName || c.name,
        lastMessage: c.lastMessage || "",
        time: c.time || "now",
        unread: c.unread || false,
      })));
    } catch (err) {
      error("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  }

  async function loadMessages(conversationId: string) {
    try {
      const msgs = await nation.getMessages(conversationId);
      setMessages(msgs.map(m => ({ ...m, sender: "them" as const })));
    } catch (err) {
      error("Failed to load messages");
    }
  }

  async function handleSendMessage(e: React.FormEvent) {
    e.preventDefault();
    if (!newMessage.trim() || !activeConvo) return;

    try {
      setSending(true);
      await nation.sendMessage(activeConvo, newMessage);
      setNewMessage("");
      success("Message sent!");
      loadMessages(activeConvo);
    } catch (err) {
      error("Failed to send message");
    } finally {
      setSending(false);
    }
  }

  return (
    <ProtectedRoute>
      <div className="bg-off-white min-h-screen">
        <div className="mx-auto max-w-[1200px] px-4 py-6 sm:px-6 md:px-8">
          <h1 className="font-heading text-2xl font-bold text-slate mb-4">
            Messages
          </h1>

          <div className="grid grid-cols-1 gap-0 overflow-hidden rounded-[8px] border border-gray-border bg-white shadow-sm md:grid-cols-3 min-h-[600px]">
            {/* Conversation list */}
            <div className="border-r border-gray-border md:col-span-1">
              <div className="p-3 border-b border-gray-border">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search conversations..."
                    className="w-full rounded-full bg-off-white px-4 py-2 pr-8 text-sm font-body text-slate placeholder:text-gray-text focus:outline-none"
                  />
                  <Search size={14} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-text" />
                </div>
              </div>
              <div className="divide-y divide-gray-border">
                {loading ? (
                  <div className="p-4">
                    <SkeletonGroup count={2} />
                  </div>
                ) : conversations.length > 0 ? (
                  conversations.map((c) => (
                    <button
                      key={c.id}
                      onClick={() => setActiveConvo(c.id)}
                      className={`flex w-full items-center gap-3 px-4 py-3 text-left transition-colors ${
                        activeConvo === c.id ? "bg-lavender" : "hover:bg-off-white"
                      }`}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-purple-light">
                        <User className="h-5 w-5 text-purple/50" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="flex justify-between">
                          <p className="font-heading text-sm font-semibold text-slate truncate">
                            {c.name}
                          </p>
                          <span className="text-[10px] text-gray-text shrink-0">{c.time}</span>
                        </div>
                        <p className={`text-xs truncate ${c.unread ? "font-semibold text-slate" : "text-gray-text"}`}>
                          {c.lastMessage}
                        </p>
                      </div>
                      {c.unread && (
                        <div className="h-2 w-2 rounded-full bg-purple-vivid shrink-0" />
                      )}
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-gray-text text-sm">No conversations yet</div>
                )}
              </div>
            </div>

            {/* Chat area */}
            <div className="flex flex-col md:col-span-2">
              {activeConvo ? (
                <>
                  {/* Chat header */}
                  <div className="flex items-center gap-3 border-b border-gray-border px-4 py-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-full bg-purple-light">
                      <User className="h-4 w-4 text-purple/50" />
                    </div>
                    <p className="font-heading text-sm font-bold text-slate">
                      {conversations.find((c) => c.id === activeConvo)?.name}
                    </p>
                  </div>

                  {/* Messages */}
                  <div className="flex-1 overflow-y-auto p-4 space-y-3">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.sender === "me" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[70%] rounded-[12px] px-4 py-2 ${
                            msg.sender === "me"
                              ? "bg-purple text-white"
                              : "bg-off-white text-slate"
                          }`}
                        >
                          <p className="font-body text-sm">{msg.content}</p>
                          <p className={`text-[10px] mt-1 ${msg.sender === "me" ? "text-white/50" : "text-gray-text"}`}>
                            {new Date(msg.createdAt).toLocaleTimeString()}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Input */}
                  <div className="border-t border-gray-border p-3">
                    <form
                      onSubmit={handleSendMessage}
                      className="flex gap-2"
                    >
                      <input
                        type="text"
                        value={newMessage}
                        onChange={(e) => setNewMessage(e.target.value)}
                        placeholder="Type a message..."
                        className="flex-1 rounded-full border border-gray-border bg-off-white px-4 py-2 text-sm font-body text-slate placeholder:text-gray-text focus:border-purple-vivid focus:outline-none"
                      />
                      <button
                        type="submit"
                        disabled={sending || !newMessage.trim()}
                        className="flex h-9 w-9 items-center justify-center rounded-full bg-purple text-white hover:bg-purple-hover transition-colors disabled:opacity-50"
                      >
                        <Send size={16} />
                      </button>
                    </form>
                  </div>
                </>
              ) : (
                <div className="flex flex-1 items-center justify-center text-gray-text font-body text-sm">
                  Select a conversation to start messaging
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}
