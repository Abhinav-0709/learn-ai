import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loader2, CheckCircle, XCircle, Trophy } from "lucide-react";
import { cn } from "@/lib/utils";

interface QuizQuestion {
    question: string;
    options: string[];
    correct_answer: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

export default function Quiz({ documentId }: { documentId: string }) {
    const [questions, setQuestions] = useState<QuizQuestion[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
    const [isEvaluated, setIsEvaluated] = useState(false);
    const [score, setScore] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [isFinished, setIsFinished] = useState(false);

    useEffect(() => {
        const fetchQuiz = async () => {
            try {
                const res = await fetch(`${API_URL}/generate-quiz`, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ document_id: documentId }),
                });
                if (!res.ok) throw new Error("Failed");
                const data = await res.json();
                setQuestions(data.quizzes || []);
            } catch (err) {
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        if (documentId) fetchQuiz();
    }, [documentId]);

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center h-64 gap-4">
                <Loader2 className="w-8 h-8 text-pink-500 animate-spin" />
                <p className="text-zinc-400 animate-pulse">Crafting your custom quiz...</p>
            </div>
        );
    }

    if (questions.length === 0) return <p className="text-center text-zinc-500">No questions available.</p>;

    if (isFinished) {
        const percentage = Math.round((score / questions.length) * 100);
        return (
            <div className="flex flex-col items-center justify-center p-10 bg-gradient-to-b from-pink-500/10 to-transparent border border-pink-500/20 rounded-2xl text-center">
                <Trophy className={cn("w-16 h-16 mb-4", percentage > 70 ? "text-yellow-500" : "text-zinc-400")} />
                <h3 className="text-3xl font-bold mb-2">Quiz Completed!</h3>
                <p className="text-xl text-zinc-300 mb-6">You scored <span className="text-pink-400 font-bold">{score}</span> out of {questions.length}</p>

                <div className="w-full bg-zinc-800 rounded-full h-4 mb-8 overflow-hidden">
                    <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${percentage}%` }}
                        transition={{ duration: 1, ease: "easeOut" }}
                        className={cn("h-full", percentage > 70 ? "bg-green-500" : percentage > 40 ? "bg-yellow-500" : "bg-red-500")}
                    />
                </div>

                <button
                    onClick={() => {
                        setCurrentIndex(0);
                        setScore(0);
                        setIsFinished(false);
                        setSelectedAnswer(null);
                        setIsEvaluated(false);
                    }}
                    className="px-6 py-3 bg-pink-600 hover:bg-pink-500 text-white rounded-xl font-medium transition-colors"
                >
                    Retake Quiz
                </button>
            </div>
        );
    }

    const currentQ = questions[currentIndex];

    const handleSelect = (option: string) => {
        if (isEvaluated) return;
        setSelectedAnswer(option);
    };

    const handleEvaluate = () => {
        if (!selectedAnswer) return;
        setIsEvaluated(true);
        if (selectedAnswer === currentQ.correct_answer) {
            setScore(s => s + 1);
        }
    };

    const handleNext = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(c => c + 1);
            setSelectedAnswer(null);
            setIsEvaluated(false);
        } else {
            setIsFinished(true);
        }
    };

    return (
        <div className="max-w-2xl mx-auto w-full">
            <div className="flex justify-between items-center mb-6">
                <span className="text-sm font-medium text-pink-400">Question {currentIndex + 1} of {questions.length}</span>
                <span className="text-sm font-medium text-zinc-400">Score: {score}</span>
            </div>

            <div className="bg-zinc-900/50 border border-white/10 p-6 rounded-2xl mb-6">
                <h3 className="text-xl font-medium mb-6 leading-relaxed">{currentQ.question}</h3>

                <div className="space-y-3">
                    {currentQ.options.map((option, i) => {
                        const isSelected = selectedAnswer === option;
                        const isCorrect = option === currentQ.correct_answer;

                        let statusClass = "border-zinc-700 bg-zinc-800/50 hover:border-zinc-500 hover:bg-zinc-800";

                        if (isEvaluated) {
                            if (isCorrect) statusClass = "border-green-500 bg-green-500/20 text-green-100";
                            else if (isSelected) statusClass = "border-red-500 bg-red-500/20 text-red-100";
                            else statusClass = "border-zinc-800 bg-zinc-900/50 opacity-50";
                        } else if (isSelected) {
                            statusClass = "border-pink-500 bg-pink-500/20 text-white";
                        }

                        return (
                            <button
                                key={i}
                                onClick={() => handleSelect(option)}
                                disabled={isEvaluated}
                                className={cn(
                                    "w-full text-left p-4 rounded-xl border transition-all duration-200 flex items-center justify-between",
                                    statusClass
                                )}
                            >
                                <span>{option}</span>
                                {isEvaluated && isCorrect && <CheckCircle className="w-5 h-5 text-green-400" />}
                                {isEvaluated && !isCorrect && isSelected && <XCircle className="w-5 h-5 text-red-400" />}
                            </button>
                        )
                    })}
                </div>
            </div>

            <div className="flex justify-end">
                {!isEvaluated ? (
                    <button
                        onClick={handleEvaluate}
                        disabled={!selectedAnswer}
                        className="px-8 py-3 bg-gradient-to-r from-pink-600 to-rose-600 text-white rounded-xl font-medium disabled:opacity-50 transition-all hover:opacity-90"
                    >
                        Check Answer
                    </button>
                ) : (
                    <button
                        onClick={handleNext}
                        className="px-8 py-3 bg-white text-black hover:bg-zinc-200 rounded-xl font-medium transition-all"
                    >
                        {currentIndex === questions.length - 1 ? "View Results" : "Next Question"}
                    </button>
                )}
            </div>
        </div>
    );
}
