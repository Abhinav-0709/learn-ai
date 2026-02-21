"use client";

import { useState } from "react";
import { Youtube, FileText, Upload, Link as LinkIcon, ArrowRight, Loader2, X, AlertTriangle } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { cn } from "@/lib/utils";

interface UploadSectionProps {
  onProcessComplete: (documentId: string, type: 'youtube' | 'pdf') => void;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function UploadSection({ onProcessComplete }: UploadSectionProps) {
  const [activeTab, setActiveTab] = useState<'youtube' | 'pdf'>('youtube');
  const [url, setUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleYoutubeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!url) return;
    
    setIsLoading(true);
    setError("");
    
    try {
      const res = await fetch(`${API_URL}/process-video`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ youtube_url: url }),
      });
      
      if (!res.ok) throw new Error("Failed to process video");
      
      const data = await res.json();
      onProcessComplete(data.document_id, 'youtube');
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  const handlePdfSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;
    
    setIsLoading(true);
    setError("");
    
    const formData = new FormData();
    formData.append("file", file);
    
    try {
      const res = await fetch(`${API_URL}/process-pdf`, {
        method: "POST",
        body: formData,
      });
      
      if (!res.ok) throw new Error("Failed to process PDF");
      
      const data = await res.json();
      onProcessComplete(data.document_id, 'pdf');
    } catch (err: any) {
      setError(err.message || "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto mt-12">
      <div className="glass-panel p-6 sm:p-10 relative overflow-hidden">
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-violet-500/10 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none" />
        
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold tracking-tight mb-3">What are we studying today?</h2>
          <p className="text-zinc-400">Provide a YouTube lecture or upload a PDF document format to get started.</p>
        </div>

        {/* Tabs */}
        <div className="flex p-1 bg-zinc-900/50 rounded-xl mb-8 border border-white/5">
          <button
            onClick={() => setActiveTab('youtube')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200",
              activeTab === 'youtube' 
                ? "bg-violet-600 text-white shadow-lg shadow-violet-900/20" 
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
            )}
          >
            <Youtube className="w-5 h-5" />
            YouTube Video
          </button>
          <button
            onClick={() => setActiveTab('pdf')}
            className={cn(
              "flex-1 flex items-center justify-center gap-2 py-3 px-4 rounded-lg font-medium transition-all duration-200",
              activeTab === 'pdf' 
                ? "bg-pink-600 text-white shadow-lg shadow-pink-900/20" 
                : "text-zinc-400 hover:text-zinc-200 hover:bg-white/5"
            )}
          >
            <FileText className="w-5 h-5" />
            PDF Document
          </button>
        </div>

        {/* Floating Error Toast */}
        <AnimatePresence>
          {error && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="fixed bottom-6 right-6 md:bottom-10 md:right-10 z-50 max-w-sm p-5 rounded-2xl bg-zinc-900/95 backdrop-blur-md border border-red-500/30 shadow-2xl shadow-red-900/20 flex flex-col gap-3"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-2 text-red-400 font-semibold">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  Processing Blocked
                </div>
                <button onClick={() => setError("")} className="text-zinc-500 hover:text-white transition-colors p-1 bg-zinc-800 rounded-md">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <p className="text-sm text-zinc-300 leading-relaxed">
                {error}
              </p>
              {error.includes("YouTube is blocking") && (
                <div className="mt-1 p-3 rounded-xl bg-red-500/10 text-xs text-red-200 border border-red-500/20">
                  <span className="font-semibold text-red-400 block mb-1">Hardware Limitation</span>
                  There is absolutely nothing wrong with my code! YouTube bans datacenter IPs (like Render) from scraping transcripts. Please test with the PDF upload instead.
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence mode="wait">
          {activeTab === 'youtube' ? (
            <motion.form 
              key="youtube-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handleYoutubeSubmit}
              className="space-y-4"
            >
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <LinkIcon className="h-5 w-5 text-zinc-500" />
                </div>
                <input
                  type="url"
                  placeholder="https://www.youtube.com/watch?v=..."
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full pl-12 pr-4 py-4 bg-zinc-900/50 border border-zinc-800 rounded-xl text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-violet-500/50 focus:border-violet-500 transition-all"
                  required
                />
              </div>
              <button 
                type="submit"
                disabled={isLoading || !url}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Process Video
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.form>
          ) : (
            <motion.form 
              key="pdf-form"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              onSubmit={handlePdfSubmit}
              className="space-y-4"
            >
              <div 
                className="border-2 border-dashed border-zinc-700 rounded-2xl p-10 text-center hover:bg-zinc-800/50 hover:border-pink-500/50 transition-all cursor-pointer group relative"
              >
                <input 
                  type="file" 
                  accept=".pdf" 
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" 
                  required
                />
                <div className="flex flex-col items-center gap-3">
                  <div className="w-16 h-16 rounded-full bg-pink-500/10 flex items-center justify-center group-hover:scale-110 transition-transform">
                    <Upload className="w-8 h-8 text-pink-500" />
                  </div>
                  <div>
                    <p className="text-zinc-300 font-medium text-lg">
                      {file ? file.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-zinc-500 mt-1">PDF max 10MB</p>
                  </div>
                </div>
              </div>
              <button 
                type="submit"
                disabled={isLoading || !file}
                className="w-full flex items-center justify-center gap-2 py-4 px-6 rounded-xl bg-gradient-to-r from-pink-600 to-rose-600 hover:from-pink-500 hover:to-rose-500 text-white font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isLoading ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  <>
                    Process PDF
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>
            </motion.form>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
