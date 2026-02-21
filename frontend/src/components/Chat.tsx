import { useState, useRef, useEffect } from "react";
import { Send, User, Bot, Loader2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface Message {
  role: "user" | "assistant";
  parts: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Chat({ documentId }: { documentId: string }) {
  const [messages, setMessages] = useState<Message[]>([
    { role: "assistant", parts: "Hi! I'm your AI Tutor. Ask me anything about the document or video you just provided." }
  ]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMsg = input.trim();
    setInput("");
    
    // Add user message to history
    const newMessages: Message[] = [...messages, { role: "user", parts: userMsg }];
    setMessages(newMessages);
    setIsTyping(true);

    // Placeholder for assistant's response that will stream in
    setMessages((prev) => [...prev, { role: "assistant", parts: "" }]);

    try {
      // Create a fetch request to the streaming endpoint
      const res = await fetch(`${API_URL}/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_id: documentId,
          message: userMsg,
          history: messages.slice(1) // exclude initial greeting from strict history structure if needed, or map appropriately
        }),
      });

      if (!res.ok) throw new Error("Failed to send message");
      if (!res.body) throw new Error("No response body");

      const reader = res.body.getReader();
      const decoder = new TextDecoder("utf-8");
      let done = false;

      while (!done) {
        const { value, done: doneReading } = await reader.read();
        done = doneReading;
        const chunkValue = decoder.decode(value, { stream: true });
        
        if (chunkValue) {
          setMessages((prev) => {
            const lastMsg = prev[prev.length - 1];
            return [
              ...prev.slice(0, -1),
              { ...lastMsg, parts: lastMsg.parts + chunkValue }
            ];
          });
        }
      }
    } catch (err) {
      console.error(err);
      setMessages((prev) => {
        const lastMsg = prev[prev.length - 1];
        return [
          ...prev.slice(0, -1),
          { ...lastMsg, parts: "Sorry, I encountered an error while processing your request." }
        ];
      });
    } finally {
      setIsTyping(false);
    }
  };

  return (
    <div className="flex flex-col h-full pl-2">
      <div className="flex-1 overflow-y-auto pr-2 pb-4 space-y-6 scrollbar-thin scrollbar-thumb-zinc-700 scrollbar-track-transparent">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex gap-4 max-w-full", msg.role === "user" ? "flex-row-reverse" : "flex-row")}>
            <div className={cn(
              "w-8 h-8 rounded-full flex items-center justify-center shrink-0 mt-1",
              msg.role === "user" ? "bg-violet-600" : "bg-pink-600"
            )}>
              {msg.role === "user" ? <User className="w-5 h-5 text-white" /> : <Bot className="w-5 h-5 text-white" />}
            </div>
            <div className={cn(
              "px-5 py-3 rounded-2xl max-w-[85%] leading-relaxed",
              msg.role === "user" 
                ? "bg-violet-600/20 text-violet-100 border border-violet-500/20 rounded-tr-sm" 
                : "bg-zinc-800/50 text-zinc-300 border border-white/5 rounded-tl-sm"
            )}>
              {msg.parts}
            </div>
          </div>
        ))}
        {isTyping && messages[messages.length - 1].parts === "" && (
          <div className="flex gap-4">
             <div className="w-8 h-8 rounded-full bg-pink-600 flex items-center justify-center shrink-0 mt-1">
               <Bot className="w-5 h-5 text-white" />
             </div>
             <div className="px-5 py-4 rounded-2xl bg-zinc-800/50 border border-white/5 rounded-tl-sm flex items-center gap-2">
               <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-75" />
               <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-150" />
               <div className="w-2 h-2 bg-pink-500 rounded-full animate-bounce delay-300" />
             </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="pt-4 mt-auto border-t border-white/10">
        <form onSubmit={handleSubmit} className="relative">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={isTyping}
            placeholder="Ask a question..."
            className="w-full bg-zinc-900/50 border border-zinc-700 rounded-xl pl-4 pr-12 py-3 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all text-white placeholder:text-zinc-500 disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={!input.trim() || isTyping}
            className="absolute right-2 top-2 p-1.5 rounded-lg bg-pink-600 text-white hover:bg-pink-500 disabled:opacity-50 disabled:bg-zinc-700 transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
}
