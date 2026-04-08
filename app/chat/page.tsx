"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  Send,
  Bot,
  User,
  MapPin,
  Sparkles,
  Mic,
  Paperclip,
  ChevronLeft,
  Search,
} from "lucide-react";
import Link from "next/link";
import Navbar from "@/components/layout/NavBar";

interface Message {
  id: string;
  role: "assistant" | "user";
  content: string;
  timestamp: Date;
}

export default function AssistantPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hi there! 👋 I'm Kivo, your local guide in Port Harcourt. What are you looking to explore today? Dinner, a gig, or a quiet cafe?",
      timestamp: new Date(),
    },
  ]);
  const [input, setInput] = useState("");
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({
        top: scrollRef.current.scrollHeight,
        behavior: "smooth",
      });
    }
  }, [messages]);

  const handleSend = () => {
    if (!input.trim()) return;
    const userMsg: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");

    setTimeout(() => {
      const aiMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content:
          "Scanning GRA and Trans Amadi... Found Jazz night at The Vineyard at 8 PM. Add to map?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, aiMsg]);
    }, 1000);
  };

  return (
    // Fixed height using dvh (Dynamic Viewport Height) to prevent mobile browser bounce
    <div className="flex h-[100dvh] bg-gray-50 overflow-hidden flex-col">
      <Navbar />

      {/* Container for Sidebar + Main - Starts after Navbar (pt-20) */}
      <div className="flex flex-1 overflow-hidden pt-20">
        {/* --- SIDEBAR (Desktop Only) --- */}
        <aside className="hidden lg:flex w-80 bg-white border-r border-gray-200 flex-col">
          <div className="p-6 border-b border-gray-100">
            <div className="relative">
              <Search
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                size={18}
              />
              <input
                type="text"
                placeholder="Search chats..."
                className="w-full pl-10 pr-4 py-2 bg-gray-100 rounded-xl text-sm focus:outline-none"
              />
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-2">
            <p className="px-2 text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">
              Quick Actions
            </p>
            <button className="w-full flex items-center gap-3 p-3 bg-secondary-container rounded-xl text-left">
              <Sparkles size={18} className="text-primary" />
              <span className="font-bold text-sm">Smart Recommendations</span>
            </button>
            <button className="w-full flex items-center gap-3 p-3 hover:bg-gray-50 rounded-xl text-left">
              <MapPin size={18} className="text-gray-600" />
              <span className="font-bold text-sm">Nearby Events</span>
            </button>
          </div>
        </aside>

        {/* --- MAIN CHAT AREA --- */}
        <main className="flex-1 flex flex-col min-w-0 bg-white relative">
          {/* Header - Fixed at top of main area */}
          <header className="px-4 py-3 border-b border-gray-200 flex items-center gap-3 bg-white z-10">
            <Link href="/" className="lg:hidden text-gray-500">
              <ChevronLeft size={24} />
            </Link>
            <div className="relative">
              <div className="w-9 h-9 rounded-full bg-primary flex items-center justify-center text-white">
                <Bot size={20} />
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
            </div>
            <div>
              <h2 className="font-bold text-sm md:text-base leading-tight">
                Kivo AI Assistant
              </h2>
              <p className="text-[10px] text-green-600 font-medium uppercase tracking-wider">
                Online
              </p>
            </div>
          </header>

          {/* Messages Area - Scrollable */}
          <div
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 scroll-smooth"
          >
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[85%] flex gap-2 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
                >
                  <div
                    className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 ${
                      msg.role === "assistant"
                        ? "bg-primary text-white"
                        : "bg-gray-800 text-white"
                    }`}
                  >
                    {msg.role === "assistant" ? (
                      <Bot size={14} />
                    ) : (
                      <User size={14} />
                    )}
                  </div>
                  <div
                    className={`p-3 md:p-4 rounded-2xl text-sm shadow-sm ${
                      msg.role === "assistant"
                        ? "bg-secondary-container text-black rounded-tl-none"
                        : "bg-primary text-white rounded-tr-none"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Input Area - Fixed at bottom of main area */}
          <div className="p-4 bg-white border-t border-gray-100">
            <div className="max-w-4xl mx-auto space-y-3">
              {/* Quick Chips - Scrollable horizontally */}
              <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
                {[
                  "Nightlife Tonight",
                  "GRA Eateries",
                  "Live Music",
                  "Art Galleries",
                ].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => setInput(chip)}
                    className="px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-full text-[11px] font-bold whitespace-nowrap active:bg-primary active:text-white transition-colors"
                  >
                    {chip}
                  </button>
                ))}
              </div>

              {/* Input Field Container */}
              <div className="flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-2xl p-1.5 shadow-sm focus-within:border-primary/50 transition-colors">
                <button className="p-2 text-gray-400 hover:text-primary">
                  <Paperclip size={20} />
                </button>
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSend()}
                  placeholder="Message Kivo..."
                  className="flex-1 bg-transparent py-2 px-1 focus:outline-none text-sm"
                />
                <button className="p-2 text-gray-400 hidden sm:block">
                  <Mic size={20} />
                </button>
                <button
                  onClick={handleSend}
                  className="bg-primary text-white p-2.5 rounded-xl transition-transform active:scale-95"
                >
                  <Send size={18} />
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
