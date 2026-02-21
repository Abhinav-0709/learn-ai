import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "AI Learning Assistant",
  description: "Generate flashcards, quizzes, and chat with your study materials.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} min-h-screen bg-[#09090b] text-white selection:bg-violet-500/30`}>
        {/* Animated background blob */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
          <div className="absolute -top-[25%] -left-[10%] w-[50%] h-[50%] rounded-full bg-violet-600/20 blur-[120px]" />
          <div className="absolute -bottom-[25%] -right-[10%] w-[50%] h-[50%] rounded-full bg-pink-600/20 blur-[120px]" />
        </div>
        
        <main className="relative z-0 flex flex-col min-h-screen">
          {children}
        </main>
      </body>
    </html>
  );
}
