"use client";
import { useState } from "react";
import UploadSection from "@/components/UploadSection";
import Flashcards from "@/components/Flashcards";
import Quiz from "@/components/Quiz";
import Chat from "@/components/Chat";
import { Layers, HelpCircle, Bot } from "lucide-react";
import { cn } from "@/lib/utils";

export default function Home() {
  const [documentId, setDocumentId] = useState<string | null>(null);
  const [activeTool, setActiveTool] = useState<'flashcards' | 'quiz'>('flashcards');

  return (
    <div className="min-h-screen pt-20 pb-16 px-4">
      {/* Navbar mock */}
      <header className="fixed top-0 inset-x-0 h-16 border-b border-white/10 bg-background/80 backdrop-blur-md z-50 flex items-center px-6">
        <div className="font-bold text-xl flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white">
            AI
          </div>
          <span className="text-gradient hover:opacity-80 transition-opacity cursor-pointer">LearnAssist</span>
        </div>
      </header>

      <main className="max-w-7xl mx-auto flex flex-col items-center">
        {!documentId ? (
          <>
            <div className="text-center max-w-3xl mt-12 mb-8">
              <h1 className="text-5xl sm:text-7xl font-extrabold tracking-tight mb-6">
                Supercharge your <br />
                <span className="text-gradient">learning experience</span>
              </h1>
              <p className="text-lg text-zinc-400 sm:text-xl leading-relaxed">
                Transform any video or document into interactive flashcards, quizzes, and get instant answers with our AI-powered study companion.
              </p>
            </div>
            
            <UploadSection onProcessComplete={(id) => setDocumentId(id)} />
          </>
        ) : (
          <div className="w-full mt-4 animate-in fade-in zoom-in-95 duration-500">
            <div className="flex items-center justify-between mb-8 pb-4 border-b border-white/10">
              <h2 className="text-2xl font-bold flex items-center gap-3">
                <span className="text-gradient">Study Dashboard</span>
                <span className="text-xs px-2 py-1 bg-violet-500/20 text-violet-300 rounded-full border border-violet-500/30">Active Document</span>
              </h2>
              <button 
                onClick={() => setDocumentId(null)}
                className="text-sm px-4 py-2 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-zinc-300 hover:text-white transition-all"
              >
                Upload another file
              </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 h-[75vh]">
               {/* Left Column: Study Tools */}
               <div className="lg:col-span-3 flex flex-col h-full">
                 
                 {/* Tool Selector */}
                 <div className="flex gap-2 p-1 bg-zinc-900/50 rounded-xl mb-4 border border-white/5 w-fit">
                    <button
                      onClick={() => setActiveTool('flashcards')}
                      className={cn(
                        "flex items-center gap-2 py-2 px-6 rounded-lg font-medium transition-all duration-200 text-sm",
                        activeTool === 'flashcards' 
                          ? "bg-violet-600 text-white shadow-lg shadow-violet-900/20" 
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                      )}
                    >
                      <Layers className="w-4 h-4" /> Flashcards
                    </button>
                    <button
                      onClick={() => setActiveTool('quiz')}
                      className={cn(
                        "flex items-center gap-2 py-2 px-6 rounded-lg font-medium transition-all duration-200 text-sm",
                        activeTool === 'quiz' 
                          ? "bg-pink-600 text-white shadow-lg shadow-pink-900/20" 
                          : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
                      )}
                    >
                      <HelpCircle className="w-4 h-4" /> Quiz
                    </button>
                 </div>

                 {/* Tool Area */}
                 <div className="glass-panel p-8 flex-1 flex flex-col items-center justify-center overflow-auto relative">
                    <div className="absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-violet-500 to-pink-500"></div>
                    {activeTool === 'flashcards' && <Flashcards documentId={documentId} />}
                    {activeTool === 'quiz' && <Quiz documentId={documentId} />}
                 </div>
               </div>
               
               {/* Right Column: AI Chat */}
               <div className="lg:col-span-2 h-full flex flex-col glass-panel p-6 relative overflow-hidden">
                 <div className="absolute top-0 right-0 w-32 h-32 bg-pink-500/10 rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />
                 <h3 className="font-semibold text-lg mb-6 flex items-center gap-2 pb-4 border-b border-white/10 shrink-0">
                    <div className="w-8 h-8 rounded-lg bg-pink-500/20 flex items-center justify-center text-pink-400 border border-pink-500/30">
                      <Bot className="w-4 h-4" />
                    </div>
                    AI Tutor Chat
                 </h3>
                 <div className="flex-1 min-h-0">
                    <Chat documentId={documentId} />
                 </div>
               </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
