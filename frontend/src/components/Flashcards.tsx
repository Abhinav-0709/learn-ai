import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, ChevronLeft, ChevronRight, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";

interface Flashcard {
  front: string;
  back: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Flashcards({ documentId }: { documentId: string }) {
  const [cards, setCards] = useState<Flashcard[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isFlipped, setIsFlipped] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchCards = async () => {
    setIsLoading(true);
    setError("");
    try {
      const res = await fetch(`${API_URL}/generate-flashcards`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_id: documentId }),
      });
      if (!res.ok) throw new Error("Failed to generate flashcards");
      const data = await res.json();
      setCards(data.flashcards || []);
      setCurrentIndex(0);
      setIsFlipped(false);
    } catch (err: any) {
      setError(err.message || "Failed to load flashcards.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (documentId) {
      fetchCards();
    }
  }, [documentId]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center h-64 gap-4">
        <Loader2 className="w-8 h-8 text-violet-500 animate-spin" />
        <p className="text-zinc-400 animate-pulse">Generating your flashcards with AI...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-6 text-center">
        <p className="text-red-400 mb-4">{error}</p>
        <button onClick={fetchCards} className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 rounded-lg text-red-300 transition-colors flex items-center gap-2 mx-auto">
          <RefreshCw className="w-4 h-4" /> Try Again
        </button>
      </div>
    );
  }

  if (cards.length === 0) return <p className="text-center text-zinc-500 py-10">No flashcards generated.</p>;

  const handleNext = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev < cards.length - 1 ? prev + 1 : prev));
    }, 150);
  };

  const handlePrev = () => {
    setIsFlipped(false);
    setTimeout(() => {
      setCurrentIndex((prev) => (prev > 0 ? prev - 1 : prev));
    }, 150);
  };

  return (
    <div className="flex flex-col items-center max-w-2xl mx-auto w-full">
      <div className="mb-6 flex items-center justify-between w-full px-4">
        <span className="text-sm font-medium text-zinc-400">
          Card {currentIndex + 1} of {cards.length}
        </span>
        <div className="flex gap-2">
           <button onClick={handlePrev} disabled={currentIndex === 0} className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 transition-colors">
              <ChevronLeft className="w-5 h-5" />
           </button>
           <button onClick={handleNext} disabled={currentIndex === cards.length - 1} className="p-2 rounded-full hover:bg-white/10 disabled:opacity-30 transition-colors">
              <ChevronRight className="w-5 h-5" />
           </button>
        </div>
      </div>

      <div className="relative w-full h-80 perspective-1000 mb-6 group cursor-pointer" onClick={() => setIsFlipped(!isFlipped)}>
        <motion.div
          className="w-full h-full relative preserve-3d transition-all duration-500"
          animate={{ rotateY: isFlipped ? 180 : 0 }}
          style={{ transformStyle: "preserve-3d" }}
        >
          {/* Front */}
          <div className="absolute inset-0 backface-hidden bg-gradient-to-br from-violet-600/20 to-indigo-600/20 border border-violet-500/30 rounded-2xl p-8 flex flex-col justify-center items-center text-center shadow-lg shadow-violet-900/10 group-hover:border-violet-500/50 transition-colors">
            <span className="absolute top-4 left-4 text-xs font-bold text-violet-400 uppercase tracking-wider">Question</span>
            <h3 className="text-2xl font-serif text-white">{cards[currentIndex]?.front}</h3>
            <p className="absolute bottom-4 text-xs text-zinc-500 font-medium tracking-wide">Click to flip</p>
          </div>

          {/* Back */}
          <div 
            className="absolute inset-0 backface-hidden bg-gradient-to-br from-pink-600/20 to-rose-600/20 border border-pink-500/30 rounded-2xl p-8 flex flex-col justify-center items-center text-center shadow-lg shadow-pink-900/10"
            style={{ transform: "rotateY(180deg)" }}
          >
            <span className="absolute top-4 left-4 text-xs font-bold text-pink-400 uppercase tracking-wider">Answer</span>
            <p className="text-xl text-white leading-relaxed">{cards[currentIndex]?.back}</p>
          </div>
        </motion.div>
      </div>
      
      {/* Progress par */}
      <div className="w-full h-1.5 bg-zinc-800 rounded-full overflow-hidden">
        <motion.div 
          className="h-full bg-gradient-to-r from-violet-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${((currentIndex + 1) / cards.length) * 100}%` }}
          transition={{ duration: 0.3 }}
        />
      </div>
    </div>
  );
}
