/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import TypeSript from "type.ts";
import CSS from "index.css";
import React from "react";
import TutorAppView from "./components/TutorAppView";
import { 
  Cpu, Sparkles, Coffee 
} from "lucide-react";

export default function App() {
  return (
   
    <div id="root-layout" className="min-h-screen bg-[#07080b] text-slate-100 flex flex-col font-sans select-none antialiased">
      {/* Top Universal Navbar */}
      <header className="bg-[#0b0d13] border-b border-indigo-950/60 px-6 py-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl sticky top-0 z-50">
        <div className="flex items-center gap-3.5">
          <div>
            <h1 className="font-sans font-extrabold text-base text-gray-100 leading-none tracking-tight flex items-center gap-2">
              Smartesion AI Tutor
            </h1>
          </div>
        </div>
      </header>

      {/* Main Centered Layout */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 md:p-6 flex flex-col justify-center items-stretch">
        
        {/* Interactive Live Client Sandbox */}
        <div id="left-pane-sandbox" className="flex flex-col h-full min-h-[550px]">
          <div className="flex-1 flex flex-col animate-fade-in">
            <TutorAppView onApiCall={() => {}} />
          </div>
        </div>

      </main>

      {/* Footer bar */}
      <footer className="bg-[#050609] border-t border-slate-950 px-6 py-4 mt-auto text-center text-xs text-slate-500 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>Smartesion AI Tutor</span>
          <span className="flex items-center gap-1.5">
            Powered by 
            <span className="text-slate-400 font-bold flex items-center gap-1">
              Google Gemini API
            </span>
          </span>
        </div>
      </footer>
    </div>
  );
}
