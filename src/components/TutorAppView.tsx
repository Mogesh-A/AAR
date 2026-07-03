/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ChatMessage, StudentProfile, JavaLogLine, QuizQuestion, CourseMilestone } from "../types";
import { 
  GraduationCap, MessageSquare, User, Send, AlertTriangle, 
  HelpCircle, RefreshCw, Trophy, Flame, Target, BookOpen, ChevronRight, CheckCircle, 
  Sparkles, Map, Award, Play, Check, X, ArrowRight, Star, Heart, Lock, BookMarked,
  Image, Upload, Search
} from "lucide-react";

interface TutorAppViewProps {
  onApiCall: (logs: JavaLogLine[]) => void;
}

interface Course {
  id: string;
  name: string;
  category: string;
  icon: string;
  description: string;
  whyItsUseful: string;
  milestones: CourseMilestone[];
}

export default function TutorAppView({ onApiCall }: TutorAppViewProps) {
  const [activeTab, setActiveTab] = useState<"path" | "chat" | "quiz" | "profile">("path");
  const [selectedCourseId, setSelectedCourseId] = useState<string>("cs");
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");

  // Student Profile state
  const [profile, setProfile] = useState<StudentProfile>({
    name: "Alex Johnson",
    gradeLevel: "11th Grade",
    targetExam: "Self-Improvement",
    preferredSubject: "Computer Science",
    preferredLevel: "Beginner",
    streakCount: 6,
    solvedProblemsCount: 24,
    xpPoints: 320,
    currentLevel: 3,
    unlockedAchievements: ["First Success", "3-Day Streak"]
  });

  // Premium Custom Courses
  const [courses, setCourses] = useState<Course[]>([
    {
      id: "cs",
      name: "Computer Science & OOP",
      category: "Software Engineering",
      icon: "💻",
      description: "Master objects, arrays, and algorithms used to build commercial apps like Netflix & Spotify.",
      whyItsUseful: "Every tech company in the world pays upwards of $120k/yr for engineers who understand modular, scalable object structures. Learning this opens the door to building your own SaaS or mobile games!",
      milestones: [
        { id: "cs-1", title: "Encapsulation & Banking Apps", description: "How secure objects prevent currency fraud.", unlocked: true, completed: true, xpValue: 100, topics: ["Encapsulation", "Getters and Setters", "Access Modifiers"] },
        { id: "cs-2", title: "Time Complexity & Big O", description: "Scale search engines to handle billions of operations.", unlocked: true, completed: false, xpValue: 120, topics: ["Time Complexity O(1)", "Lists vs Sets", "HashMap Lookup"] },
        { id: "cs-3", title: "API Integrations & REST", description: "Connect frontends with cloud-hosted backend systems.", unlocked: false, completed: false, xpValue: 150, topics: ["HTTP Methods", "REST Endpoints", "JSON Response DTOs"] },
        { id: "cs-4", title: "Relational DBs & Persistence", description: "Store secure customer credentials reliably.", unlocked: false, completed: false, xpValue: 200, topics: ["SQL Queries", "Foreign Keys", "Transaction Isolation"] }
      ]
    },
    {
      id: "finance",
      name: "Real-World Financial Literacy",
      category: "Adulting & Money",
      icon: "💵",
      description: "Harness compound interest, HYSAs, and stock indices to make your cash savings grow exponentially.",
      whyItsUseful: "Stagnant cash loses 3% of its value every year to inflation. Learning to invest early is the difference between working until you are 75 and retiring wealthy at age 45!",
      milestones: [
        { id: "fin-1", title: "Compound Interest Magic", description: "Turn $100/month into massive retirement portfolios.", unlocked: true, completed: false, xpValue: 100, topics: ["Compound Interest", "Exponential Growth", "Time-Value of Money"] },
        { id: "fin-2", title: "Inflation & HYSAs", description: "Protect your emergency cash from price devaluation.", unlocked: false, completed: false, xpValue: 120, topics: ["Inflation", "High-Yield Savings Accounts", "Purchasing Power"] },
        { id: "fin-3", title: "Stock Index Funds", description: "Own pieces of the top 500 global commercial giants.", unlocked: false, completed: false, xpValue: 150, topics: ["S&P 500 Index", "Diversification", "Dollar-Cost Averaging"] }
      ]
    },
    {
      id: "math",
      name: "Applied Calculus & Physics",
      category: "Engineering Principles",
      icon: "📐",
      description: "Learn slopes, derivatives, and rates of change that govern self-driving autopilot rockets.",
      whyItsUseful: "Calculus is not just abstract equations. It is the core physics calculations inside drone controllers, rocket trajectory software, and machine learning models predicting climate patterns!",
      milestones: [
        { id: "math-1", title: "The Tangent Slope & Speed", description: "Calculate instantaneous speeds of accelerating cars.", unlocked: true, completed: false, xpValue: 100, topics: ["Derivatives", "Instantaneous Rate of Change", "Slope of Tangent"] },
        { id: "math-2", title: "Area Under Curves", description: "Measure total engine thrust or energy consumption.", unlocked: false, completed: false, xpValue: 120, topics: ["Integrals", "Area Approximations", "Accumulation Functions"] }
      ]
    },
    {
      id: "languages",
      name: "Travel Spanish & French",
      category: "Conversational Skills",
      icon: "🌍",
      description: "Acquire vital high-frequency phrases to navigate hotels, ask directions, and order foods.",
      whyItsUseful: "Locals treat travelers with immense warmth when you put effort into speaking their language. It can save you from getting lost, find local spots, and make friends abroad!",
      milestones: [
        { id: "lang-1", title: "Asking for Coordinates", description: "Polite Spanish queries to locate hospitals and subways.", unlocked: true, completed: false, xpValue: 100, topics: ["Spanish Greetings", "Location Queries", "Politeness Phrases"] },
        { id: "lang-2", title: "Culinary & Dining", description: "Order local French delicacies like a seasoned native.", unlocked: false, completed: false, xpValue: 120, topics: ["French Ordering", "Culinary Adjectives", "Bill Requesting"] }
      ]
    }
  ]);

  // Selected Milestone for Lesson Card
  const [selectedMilestone, setSelectedMilestone] = useState<CourseMilestone | null>(
    courses[0].milestones[1] // Default to CS Unit 2
  );

  // Quiz Mode state
  const [quizQuestions, setQuizQuestions] = useState<QuizQuestion[]>([]);
  const [currentQuizIndex, setCurrentQuizIndex] = useState<number>(0);
  const [selectedOptionIndex, setSelectedOptionIndex] = useState<number | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState<boolean>(false);
  const [quizCorrectAnswersCount, setQuizCorrectAnswersCount] = useState<number>(0);
  const [quizLogsAccumulated, setQuizLogsAccumulated] = useState<JavaLogLine[]>([]);
  const [quizFinished, setQuizFinished] = useState<boolean>(false);

  // Chat conversation state
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "m-1",
      sender: "tutor",
      content: `### Welcome to Smartesion AI! 🎓⚡
      
I am your **ChatGPT-style Conversational Tutor**. I can teach you *anything new on the internet* with a critical twist: **I will always explain how this concept makes you money, saves you time, or builds actual products in the real world!**

Select a course in the **Learning Path** tab, or ask me any question here right now. Try typing something like: *"How does Netflix use database caching?"* or *"What is index fund investing?"*`,
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  
  // Image Uploading States
  const [selectedImageBase64, setSelectedImageBase64] = useState<string | null>(null);
  const [selectedImageMimeType, setSelectedImageMimeType] = useState<string | null>(null);

  const [inputMessage, setInputMessage] = useState<string>("");
  const chatEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  // Active Course Helper
  const currentCourse = courses.find(c => c.id === selectedCourseId) || courses[0];

  // Search Filtered Courses
  const filteredCourses = courses.filter(c => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase().trim();
    return (
      c.name.toLowerCase().includes(q) ||
      c.category.toLowerCase().includes(q) ||
      c.description.toLowerCase().includes(q) ||
      c.milestones.some(m => 
        m.title.toLowerCase().includes(q) || 
        m.description.toLowerCase().includes(q) ||
        m.topics.some(t => t.toLowerCase().includes(q))
      )
    );
  });

  // Fetch / Generate Adaptive AI Quiz from backend
  const handleLaunchQuiz = async (milestone: CourseMilestone) => {
    setActiveTab("quiz");
    setLoading(true);
    setError(null);
    setQuizFinished(false);
    setCurrentQuizIndex(0);
    setSelectedOptionIndex(null);
    setQuizSubmitted(false);
    setQuizCorrectAnswersCount(0);

    // Default mock subject category mapping for log aesthetics
    const subjectLabel = currentCourse.name;
    const topicLabel = milestone.topics[0] || milestone.title;

    try {
      const response = await fetch("/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          subject: subjectLabel,
          level: profile.preferredLevel,
          topic: topicLabel
        })
      });

      if (!response.ok) {
        throw new Error(`Quiz engine failed with status ${response.status}`);
      }

      const data = await response.json();
      
      if (data.logs) {
        onApiCall(data.logs);
      }

      setQuizQuestions(data.questions || []);
    } catch (err: any) {
      console.error(err);
      setError("Unable to launch the AI Quizzer. Running offline recovery quiz.");
    } finally {
      setLoading(false);
    }
  };

  // Submit Answer to current question
  const handleSubmitQuizAnswer = () => {
    if (selectedOptionIndex === null || quizSubmitted) return;
    
    setQuizSubmitted(true);
    const activeQuestion = quizQuestions[currentQuizIndex];
    const isCorrect = selectedOptionIndex === activeQuestion.correctIndex;

    if (isCorrect) {
      setQuizCorrectAnswersCount(prev => prev + 1);
    }

    // Custom logs inside Spring Boot console indicating REST validation
    const valLog: JavaLogLine = {
      id: "val-log-" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level: isCorrect ? "INFO" : "WARN",
      loggerName: "com.smartlearn.ar.service.QuizValidationService",
      message: `Student selected option index ${selectedOptionIndex}. Validation: [${isCorrect ? "CORRECT" : "INCORRECT"}]. Correct is ${activeQuestion.correctIndex}. XP award candidate.`
    };
    onApiCall([valLog]);
  };

  // Next Question or Finish Quiz
  const handleNextQuizQuestion = () => {
    setSelectedOptionIndex(null);
    setQuizSubmitted(false);

    if (currentQuizIndex + 1 < quizQuestions.length) {
      setCurrentQuizIndex(prev => prev + 1);
    } else {
      // Quiz Finished! Reward student
      setQuizFinished(true);
      const earnedXP = selectedMilestone ? selectedMilestone.xpValue : 50;

      // Update student profile with XP, level-ups, streaks
      setProfile(prev => {
        const totalXP = prev.xpPoints + earnedXP;
        const targetLevel = Math.floor(totalXP / 150) + 1;
        const leveledUp = targetLevel > prev.currentLevel;
        
        let newAchievements = [...prev.unlockedAchievements];
        if (leveledUp && !newAchievements.includes("Level Explorer")) {
          newAchievements.push("Level Explorer");
        }
        if (quizCorrectAnswersCount === quizQuestions.length && !newAchievements.includes("Perfect Score")) {
          newAchievements.push("Perfect Score");
        }

        return {
          ...prev,
          xpPoints: totalXP,
          currentLevel: targetLevel,
          streakCount: prev.streakCount + 1,
          solvedProblemsCount: prev.solvedProblemsCount + quizQuestions.length,
          unlockedAchievements: newAchievements
        };
      });

      // Mark milestone completed, unlock next milestone in state
      if (selectedMilestone) {
        setCourses(prevCourses => {
          return prevCourses.map(c => {
            if (c.id === selectedCourseId) {
              const updatedMilestones = c.milestones.map((m, idx) => {
                if (m.id === selectedMilestone.id) {
                  return { ...m, completed: true };
                }
                // Unlock next milestone sequentially
                const prevIndex = c.milestones.findIndex(prevM => prevM.id === selectedMilestone.id);
                if (idx === prevIndex + 1) {
                  return { ...m, unlocked: true };
                }
                return m;
              });
              return { ...c, milestones: updatedMilestones };
            }
            return c;
          });
        });
      }

      onApiCall([
        {
          id: "complete-log-1-" + Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString(),
          level: "INFO",
          loggerName: "com.smartlearn.ar.controller.QuizController",
          message: `Transactional commit: Saved StudentProgress. SolvedCount+=${quizQuestions.length}, StreakCount+=1, XPPoints+=${earnedXP}`
        }
      ]);
    }
  };

  // Send message to chatbot tutor (ChatGPT style)
  const handleSendChat = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if ((!textToSend.trim() && !selectedImageBase64) || loading) return;

    setError(null);
    if (!customText) setInputMessage("");

    const currentBase64 = selectedImageBase64;
    const currentMime = selectedImageMimeType;

    const studentMsg: ChatMessage = {
      id: "student-" + Math.random().toString(36).substring(2, 9),
      sender: "student",
      content: textToSend || "Analyze this attached resource image",
      timestamp: new Date().toLocaleTimeString(),
      image: currentBase64 || undefined
    };

    // Reset image preview states
    setSelectedImageBase64(null);
    setSelectedImageMimeType(null);

    setMessages(prev => [...prev, studentMsg]);
    setLoading(true);

    try {
      const historyContext = messages
        .slice(-4)
        .map(m => ({
          sender: m.sender === "student" ? "student" : "tutor",
          content: m.content
        }));

      const response = await fetch("/api/tutor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: textToSend || "Analyze this attached resource image",
          subject: currentCourse.name,
          learningLevel: profile.preferredLevel,
          history: historyContext,
          base64Image: currentBase64,
          imageMimeType: currentMime
        })
      });

      if (!response.ok) {
        throw new Error(`Chat Tutor returned error ${response.status}`);
      }

      const data = await response.json();
      
      if (data.logs) {
        onApiCall(data.logs);
      }

      // Add "Real-World Application Proof" visual flag to AI answers to make it extra obvious
      let finalAIResponse = data.response;
      if (!finalAIResponse.includes("### Real-World Application") && !finalAIResponse.includes("Utility")) {
        finalAIResponse += `\n\n### 💡 Real-World Leverage Point
This concept is directly useful because it allows engineers and analysts to minimize execution redundancy. For example, implementing this decreases cloud database transaction costs by up to 40%, directly translating to higher corporate profit margins!`;
      }

      setMessages(prev => [
        ...prev,
        {
          id: "tutor-" + Math.random().toString(36).substring(2, 9),
          sender: "tutor",
          content: finalAIResponse,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);

      // Simple positive progression feedback
      setProfile(prev => ({
        ...prev,
        xpPoints: prev.xpPoints + 15
      }));

    } catch (err: any) {
      console.error(err);
      setError("AI Chat Tutor is experiencing connectivity lag. Loaded mock response.");
      setMessages(prev => [
        ...prev,
        {
          id: "tutor-mock",
          sender: "tutor",
          content: `### Understanding "${textToSend}" in ${currentCourse.name} 🎯
          
I understand you want to learn more about this! Here is the immediate, direct real-world breakdown of this topic:

1. **How it builds products**: It is a core building block inside modern server clusters and client-side caching states.
2. **Why it saves you time/money**: By isolating logical states, software teams can build, test, and release features 3x faster without breaking pre-existing features.
3. **Interactive Practice**: Switch to the **Quiz Arena** or tap any milestone node in the **Learning Path** to earn dynamic XP, test your brain, and see this in action!`,
          timestamp: new Date().toLocaleTimeString()
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div id="smart-learn-hub" className="flex flex-col h-full bg-[#0a0c14] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl relative">
      
      {/* Top Header Panel: Gamified Stats Header */}
      <div className="bg-[#0f1222] border-b border-gray-800/80 px-4 py-3 flex flex-wrap items-center justify-between gap-3">
        {/* Logo & Category badge */}
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
            <GraduationCap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-sans font-black text-slate-100 text-sm leading-none flex items-center gap-1.5">
              Smartesion App Hub
            </h3>
          </div>
        </div>

        {/* Gamified counters: Level, XP Progress, Streak */}
        <div className="flex items-center gap-2 font-sans select-none">
          {/* Level Badge */}
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 text-xs font-bold">
            <Star className="w-3.5 h-3.5 text-indigo-400 fill-indigo-400" />
            <span>LVL {profile.currentLevel}</span>
          </div>

          {/* XP Progress Bar */}
          <div className="hidden sm:flex flex-col items-end gap-1 px-1 text-[10px] text-gray-400 font-bold min-w-[80px]">
            <span>{profile.xpPoints} XP Earned</span>
            <div className="w-20 h-1.5 bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="bg-indigo-500 h-full transition-all duration-500"
                style={{ width: `${Math.min(100, (profile.xpPoints % 150) * 0.67)}%` }}
              ></div>
            </div>
          </div>

          {/* Duolingo Streak */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-black animate-pulse">
            <Flame className="w-4 h-4 text-amber-500 fill-amber-500" />
            <span>{profile.streakCount} Day Streak</span>
          </div>
        </div>
      </div>

      {/* Tabs Row (Duolingo Path vs ChatGPT Chat vs Quizzer vs Stats) */}
      <div className="flex border-b border-gray-800/60 bg-[#0c0e1a]/80 font-semibold text-xs text-slate-400">
        <button
          onClick={() => setActiveTab("path")}
          className={`flex-1 py-3 px-2 text-center border-b-2 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "path"
              ? "border-indigo-500 text-indigo-400 bg-indigo-950/15"
              : "border-transparent hover:text-slate-200 hover:bg-[#12152a]/40"
          }`}
        >
          <Map className="w-4 h-4 text-indigo-400" />
          <span>Learning Path</span>
        </button>

        <button
          onClick={() => setActiveTab("chat")}
          className={`flex-1 py-3 px-2 text-center border-b-2 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "chat"
              ? "border-indigo-500 text-indigo-400 bg-indigo-950/15"
              : "border-transparent hover:text-slate-200 hover:bg-[#12152a]/40"
          }`}
        >
          <MessageSquare className="w-4 h-4 text-sky-400" />
          <span>ChatGPT Tutor</span>
        </button>

        <button
          onClick={() => {
            if (quizQuestions.length === 0 && selectedMilestone) {
              handleLaunchQuiz(selectedMilestone);
            } else {
              setActiveTab("quiz");
            }
          }}
          className={`flex-1 py-3 px-2 text-center border-b-2 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "quiz"
              ? "border-indigo-500 text-indigo-400 bg-indigo-950/15"
              : "border-transparent hover:text-slate-200 hover:bg-[#12152a]/40"
          }`}
        >
          <Trophy className="w-4 h-4 text-amber-400 animate-bounce" />
          <span>Quiz Arena</span>
        </button>

        <button
          onClick={() => setActiveTab("profile")}
          className={`flex-1 py-3 px-2 text-center border-b-2 flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            activeTab === "profile"
              ? "border-indigo-500 text-indigo-400 bg-indigo-950/15"
              : "border-transparent hover:text-slate-200 hover:bg-[#12152a]/40"
          }`}
        >
          <User className="w-4 h-4 text-emerald-400" />
          <span>My Stats</span>
        </button>
      </div>

      {/* Main Tab Rendering Canvas */}
      <div className="flex-1 overflow-hidden flex flex-col min-h-[400px]">

        {/* ========================================================
            TAB 1: DUOLINGO LEARNING PATH MAP
            ======================================================== */}
        {activeTab === "path" && (
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden bg-[#07080e]/60">
            {/* Left Column: Subject Select & Real-World Utility overview */}
            <div className="w-full md:w-5/12 border-b md:border-b-0 md:border-r border-gray-800 p-4 overflow-y-auto space-y-4 flex flex-col">
              
              {/* Dynamic Interactive Search Bar */}
              <div className="bg-[#0f1222]/80 p-3.5 border border-indigo-950/40 rounded-xl space-y-2">
                <label className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 block">
                  Search subjects, units, or topics:
                </label>
                <div className="relative">
                  <input
                    id="learning-path-search"
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search e.g. SQL, Big O, slope, compound..."
                    className="w-full px-3 py-2 pl-9 pr-14 rounded-xl bg-slate-950 border border-slate-800 text-xs text-gray-200 focus:outline-none focus:border-indigo-500 transition-all placeholder-gray-500 font-semibold shadow-inner"
                  />
                  <Search className="w-3.5 h-3.5 text-gray-500 absolute left-3 top-3.5" />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery("")}
                      className="absolute right-2 top-2 text-[10px] font-black text-indigo-400 hover:text-indigo-300 bg-indigo-500/10 border border-indigo-500/20 px-2 py-1 rounded-lg cursor-pointer transition-all"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              <div>
                <label className="text-[10px] uppercase font-bold tracking-wider text-gray-500 block mb-1.5">
                  Select What You Want To Learn:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {filteredCourses.map(c => (
                    <button
                      key={c.id}
                      onClick={() => {
                        setSelectedCourseId(c.id);
                        setSelectedMilestone(c.milestones[0]);
                        // Log event in simulated Spring Boot
                        onApiCall([
                          {
                            id: "switch-log-" + Math.random().toString(36).substring(2, 9),
                            timestamp: new Date().toLocaleTimeString(),
                            level: "INFO",
                            loggerName: "com.smartlearn.ar.controller.CourseController",
                            message: `User pivoted learning track. Set activeSubject = "${c.name}". Loaded ${c.milestones.length} curriculum stages.`
                          }
                        ]);
                      }}
                      className={`p-2.5 rounded-xl border text-left transition-all text-xs flex flex-col justify-between gap-1 cursor-pointer ${
                        selectedCourseId === c.id
                          ? "bg-indigo-600/10 border-indigo-500 text-indigo-300 shadow"
                          : "bg-gray-900/50 border-gray-800 text-gray-400 hover:border-gray-700 hover:text-gray-200"
                      }`}
                    >
                      <span className="text-xl">{c.icon}</span>
                      <span className="font-extrabold tracking-tight block truncate mt-1">{c.name}</span>
                    </button>
                  ))}
                </div>
                {filteredCourses.length === 0 && (
                  <div className="text-center py-6 bg-slate-950/40 border border-slate-900 rounded-xl p-3 text-gray-500 text-[11px] font-medium leading-relaxed">
                    No learning tracks found matching <span className="text-indigo-400 font-bold">"{searchQuery}"</span>.<br/>Try searching for <span className="text-slate-300">"SQL"</span>, <span className="text-slate-300">"Big O"</span>, or <span className="text-slate-300">"caching"</span>.
                  </div>
                )}
              </div>

              {/* Real World Impact Focus - Makes them realize the app's ultimate value */}
              <div className="bg-[#0e111d] border border-indigo-900/40 rounded-xl p-4 space-y-2 flex-1 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 text-indigo-400 font-extrabold text-xs">
                    <Sparkles className="w-4 h-4 text-yellow-400" />
                    <span>Real-World Cash & Career Leverage</span>
                  </div>
                  <h4 className="text-slate-100 font-extrabold text-sm tracking-tight mt-1.5">
                    How is "{currentCourse.name}" Useful Online?
                  </h4>
                  <p className="text-[11px] text-gray-300 leading-relaxed mt-2 italic">
                    "{currentCourse.whyItsUseful}"
                  </p>
                </div>

                <div className="bg-indigo-950/20 border border-indigo-900/20 rounded-lg p-2.5 mt-3 text-[10px] text-gray-400">
                  <span className="font-bold text-indigo-300 block mb-0.5">💡 Instant Practical Proof:</span>
                  Tackle the gamified quizzer lessons to earn XP and understand the exact mathematical or technical processes behind actual products.
                </div>
              </div>
            </div>

            {/* Right Column: Step-by-Step Interactive Map Nodes (Duolingo visual track) */}
            <div className="flex-1 p-4 overflow-y-auto space-y-6 flex flex-col items-center justify-start relative">
              <div className="text-center max-w-xs">
                <span className="text-[10px] uppercase font-bold tracking-wider text-indigo-400 bg-indigo-500/10 px-2.5 py-1 rounded-full border border-indigo-500/20">
                  {currentCourse.category}
                </span>
                <h4 className="text-slate-200 font-black text-sm tracking-tight mt-2">{currentCourse.name} Path</h4>
                <p className="text-[11px] text-gray-400 mt-1 leading-normal">
                  Do some innovative Quiz challenge to know your knowledge
                </p>
              </div>

              {/* Duolingo Visual Zig-Zag Path */}
              <div className="relative w-full max-w-xs flex flex-col items-center gap-8 py-4">
                {/* Visual Line connector */}
                <div className="absolute top-8 bottom-8 w-1 bg-gradient-to-b from-indigo-500 via-sky-500 to-indigo-950 rounded-full z-0"></div>

                {currentCourse.milestones.map((milestone, idx) => {
                  const isUnlocked = milestone.unlocked;
                  const isCompleted = milestone.completed;
                  const isSelected = selectedMilestone?.id === milestone.id;

                  // Check if milestone matches search query
                  const isMatchingSearch = searchQuery.trim() && (
                    milestone.title.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
                    milestone.description.toLowerCase().includes(searchQuery.toLowerCase().trim()) ||
                    milestone.topics.some(t => t.toLowerCase().includes(searchQuery.toLowerCase().trim()))
                  );

                  // Alternating margins to create zig-zag Duolingo vibe
                  const alignStyle = idx % 3 === 0 
                    ? "translate-x-0" 
                    : idx % 3 === 1 
                      ? "translate-x-10" 
                      : "-translate-x-10";

                  return (
                    <div 
                      key={milestone.id}
                      className={`relative z-10 flex flex-col items-center transition-all ${alignStyle}`}
                    >
                      {/* Interactive circular path button */}
                      <button
                        onClick={() => {
                          if (isUnlocked) {
                            setSelectedMilestone(milestone);
                          } else {
                            // Shake node visually
                            onApiCall([
                              {
                                id: "err-locked-" + Math.random().toString(36).substring(2, 9),
                                timestamp: new Date().toLocaleTimeString(),
                                level: "WARN",
                                loggerName: "com.smartlearn.ar.service.CourseController",
                                message: `Cannot select locked stage: "${milestone.title}". Complete preceding stage first.`
                              }
                            ]);
                          }
                        }}
                        className={`w-14 h-14 rounded-full flex items-center justify-center transition-all duration-300 relative ${
                          isCompleted
                            ? isMatchingSearch
                              ? "bg-emerald-600 text-white shadow-lg shadow-emerald-500/50 scale-110 border-4 border-emerald-400 animate-pulse"
                              : "bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-100 hover:scale-105 border-4 border-[#07080e]"
                            : isUnlocked
                              ? isSelected
                                ? "bg-amber-500 text-white shadow-lg shadow-amber-500/40 scale-110 border-4 border-indigo-500 animate-pulse"
                                : isMatchingSearch
                                  ? "bg-emerald-600/30 text-emerald-300 border-2 border-emerald-400 scale-110 shadow-lg shadow-emerald-500/20 cursor-pointer"
                                  : "bg-[#181d35] text-indigo-400 hover:text-white border-2 border-indigo-500/60 scale-100 hover:scale-105 cursor-pointer"
                              : isMatchingSearch
                                ? "bg-emerald-950/40 text-emerald-600 border-2 border-emerald-900/60 scale-100 cursor-not-allowed"
                                : "bg-gray-950 text-gray-600 border-2 border-gray-800 scale-95 cursor-not-allowed"
                        }`}
                      >
                        {isMatchingSearch && (
                          <span className="absolute -top-3.5 bg-emerald-500 text-slate-950 font-black text-[8px] px-1.5 py-0.5 rounded-full uppercase tracking-wider animate-bounce shadow">
                            Match
                          </span>
                        )}

                        {isCompleted ? (
                          <CheckCircle className="w-7 h-7" />
                        ) : !isUnlocked ? (
                          <Lock className="w-5 h-5 text-gray-700" />
                        ) : (
                          <span className="font-extrabold text-sm">{idx + 1}</span>
                        )}

                        {/* Floating milestone number label */}
                        <div className="absolute -bottom-5 bg-gray-900 border border-gray-800 px-2 py-0.5 rounded text-[9px] font-bold text-gray-300 tracking-tight whitespace-nowrap">
                          Unit {idx + 1}
                        </div>
                      </button>
                    </div>
                  );
                })}
              </div>

              {/* Floating lesson node card if selected */}
              {selectedMilestone && (
                <motion.div 
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="w-full max-w-sm bg-[#0e111d] border border-gray-800 rounded-xl p-4 mt-4 space-y-3 shadow-xl"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] font-mono font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded">
                      Selected Stage
                    </span>
                    <span className="text-[10px] font-bold text-indigo-400 flex items-center gap-1">
                      <Award className="w-3.5 h-3.5" />
                      +{selectedMilestone.xpValue} XP Award
                    </span>
                  </div>

                  <div>
                    <h5 className="font-extrabold text-xs text-slate-100 tracking-tight">{selectedMilestone.title}</h5>
                    <p className="text-[11px] text-gray-400 leading-normal mt-1">{selectedMilestone.description}</p>
                  </div>

                  {/* Core curriculum syllabus */}
                  <div className="bg-gray-900/70 rounded-lg p-2 border border-gray-800/80">
                    <span className="text-[9px] uppercase font-bold text-gray-500 tracking-wider block mb-1">Topics covered:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {selectedMilestone.topics.map((t, index) => {
                        const isMatched = searchQuery.trim() && t.toLowerCase().includes(searchQuery.toLowerCase().trim());
                        return (
                          <span 
                            key={index} 
                            className={`text-[10px] px-2 py-0.5 rounded border transition-all ${
                              isMatched
                                ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/50 shadow shadow-emerald-500/10 font-bold scale-105"
                                : "bg-slate-950 text-slate-300 border-slate-800"
                            }`}
                          >
                            {t}
                          </span>
                        );
                      })}
                    </div>
                  </div>

                  <button
                    onClick={() => handleLaunchQuiz(selectedMilestone)}
                    className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-black transition-all flex items-center justify-center gap-1.5 shadow-md shadow-indigo-500/10 cursor-pointer"
                  >
                    <Play className="w-3.5 h-3.5 fill-white text-white" />
                    <span>Launch AI Lesson Quiz</span>
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        )}


        {/* ========================================================
            TAB 2: LLAMA 3 TUTOR BOX
            ======================================================== */}
        {activeTab === "chat" && (
          <div className="flex-1 flex flex-col overflow-hidden bg-[#07080e]/60">
            {/* Conversation Log scroll area */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 bg-slate-950/20">
              {messages.map((m) => {
                const isTutor = m.sender === "tutor";
                return (
                  <div
                    key={m.id}
                    className={`flex flex-col max-w-[90%] ${isTutor ? "mr-auto items-start" : "ml-auto items-end"}`}
                  >
                    {/* Timestamp header */}
                    <span className="text-[9px] text-gray-500 font-mono mb-1 px-1">
                      {isTutor ? "🎓 META LLAMA 3 TUTOR" : "👤 STUDENT (YOU)"} • {m.timestamp}
                    </span>

                    {/* Speech bubble */}
                    <div
                      className={`p-3.5 rounded-2xl text-xs leading-relaxed font-sans shadow border ${
                        isTutor
                          ? "bg-gray-900/90 border-gray-800 text-slate-200"
                          : "bg-indigo-600 border-indigo-500 text-white"
                      }`}
                    >
                      {m.image && (
                        <div className="mb-2.5 max-w-[280px] rounded-lg overflow-hidden border border-indigo-500/20 shadow-md">
                          <img
                            src={m.image}
                            alt="Student attached visual"
                            className="w-full object-cover max-h-[180px]"
                            referrerPolicy="no-referrer"
                          />
                        </div>
                      )}
                      <div className="whitespace-pre-wrap break-words space-y-2">
                        {m.content.split("\n\n").map((chunk, cIdx) => {
                          return (
                            <p key={cIdx}>
                              {chunk.startsWith("###") ? (
                                <span className="font-bold text-xs block text-indigo-400 border-b border-gray-800 pb-1 mb-1 mt-2">
                                  {chunk.replace("###", "").trim()}
                                </span>
                              ) : chunk.startsWith("####") ? (
                                <span className="font-bold text-[11px] block text-sky-400 mt-2 mb-1">
                                  {chunk.replace("####", "").trim()}
                                </span>
                              ) : (
                                chunk
                              )}
                            </p>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })}

              {loading && (
                <div className="flex flex-col max-w-[85%] mr-auto items-start">
                  <span className="text-[9px] text-slate-500 font-mono mb-1 px-1">
                    🎓 AI TUTOR SERVICE • Synthesizing response...
                  </span>
                  <div className="bg-gray-900 border border-gray-800 p-3 rounded-2xl flex items-center gap-3">
                    <RefreshCw className="w-4 h-4 text-indigo-400 animate-spin" />
                    <span className="text-[11px] text-gray-400 font-mono">
                      [TutorController] Fetching AI feedback stream...
                    </span>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            {/* Suggestions Quick Buttons */}
            <div className="px-4 py-2 bg-gray-900/30 border-t border-gray-800/80">
              <span className="text-[9px] uppercase font-bold tracking-wider text-gray-500 block mb-1.5">
                Quick Learn Starters:
              </span>
              <div className="flex flex-wrap gap-1.5">
                {[
                  `How is Encapsulation used in bank accounts?`,
                  `Show me the S&P 500 money utility math`,
                  `Explain rate of change derivatives`
                ].map((prob, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSendChat(prob)}
                    className="text-[10px] text-gray-300 hover:text-white bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 rounded-lg px-2.5 py-1 text-left transition-colors cursor-pointer block truncate"
                  >
                    {prob}
                  </button>
                ))}
              </div>
            </div>

            {/* Image Upload Thumbnail Preview above Input bar */}
            {selectedImageBase64 && (
              <div className="px-4 py-2 bg-slate-900 border-t border-gray-800 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-700 bg-slate-950 flex-shrink-0">
                    <img src={selectedImageBase64} alt="Upload preview" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span className="text-[11px] font-mono text-emerald-400 block font-semibold">Image Ready to Process 📸</span>
                    <span className="text-[9px] text-slate-500 font-mono block">MimeType: {selectedImageMimeType}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedImageBase64(null);
                    setSelectedImageMimeType(null);
                  }}
                  className="p-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Input keyboard bar with File Attachment trigger */}
            <div className="p-3 bg-gray-900/60 border-t border-gray-800 flex items-center gap-2">
              <label className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl transition-colors cursor-pointer flex-shrink-0 relative flex items-center justify-center" title="Attach an Image Homework/Diagram">
                <Image className="w-4 h-4" />
                <input
                  type="file"
                  accept="image/png, image/jpeg, image/jpg, image/webp"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const reader = new FileReader();
                    reader.onload = (event) => {
                      setSelectedImageBase64(event.target?.result as string);
                      setSelectedImageMimeType(file.type);
                    };
                    reader.readAsDataURL(file);
                  }}
                  className="hidden"
                />
              </label>

              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSendChat()}
                placeholder={selectedImageBase64 ? "Describe what you want me to analyze in this image..." : "Ask any topic or upload an image! E.g. 'What is Big O?'"}
                disabled={loading}
                className="flex-1 px-3 py-2 bg-[#06070d] border border-gray-800 rounded-xl text-xs text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
              />
              <button
                onClick={() => handleSendChat()}
                disabled={loading || (!inputMessage.trim() && !selectedImageBase64)}
                className="p-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all disabled:opacity-40 cursor-pointer flex-shrink-0"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}


        {/* ========================================================
            TAB 3: DUOLINGO QUIZZER (Interactive Challenge Arena)
            ======================================================== */}
        {activeTab === "quiz" && (
          <div className="flex-1 p-4 overflow-y-auto bg-[#07080e]/60 flex flex-col items-center justify-center">
            
            {loading ? (
              <div className="text-center space-y-3 py-12">
                <RefreshCw className="w-8 h-8 text-amber-400 animate-spin mx-auto" />
                <h4 className="text-sm font-bold text-slate-200">Generating Custom AI Lesson Quiz...</h4>
                <p className="text-xs text-gray-500 max-w-xs leading-relaxed">
                  Our simulated Java backend endpoint <code className="text-indigo-400 font-mono">/api/quiz</code> is triggering Gemini LLM to construct adaptive multiple-choice questions with customized real-world proofs!
                </p>
              </div>
            ) : error && quizQuestions.length === 0 ? (
              <div className="text-center py-10 space-y-3 max-w-xs">
                <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto" />
                <h4 className="text-sm font-bold text-slate-300">Quiz Compilation Error</h4>
                <p className="text-[11px] text-gray-500">{error}</p>
                <button
                  onClick={() => selectedMilestone && handleLaunchQuiz(selectedMilestone)}
                  className="px-4 py-2 bg-indigo-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                >
                  Retry Loading Quiz
                </button>
              </div>
            ) : quizFinished ? (
              /* Success Reward Card */
              <motion.div 
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                className="w-full max-w-sm bg-[#0e111d] border-2 border-indigo-500/30 rounded-2xl p-6 text-center space-y-4 shadow-2xl relative overflow-hidden"
              >
                {/* Background lighting effects */}
                <div className="absolute -top-12 -left-12 w-24 h-24 rounded-full bg-indigo-500/10 blur-xl"></div>
                <div className="absolute -bottom-12 -right-12 w-24 h-24 rounded-full bg-amber-500/10 blur-xl"></div>

                <div className="w-16 h-16 rounded-full bg-amber-500/15 border-2 border-amber-500/30 flex items-center justify-center text-amber-400 mx-auto animate-bounce">
                  <Trophy className="w-8 h-8 text-amber-400 fill-amber-500" />
                </div>

                <div className="space-y-1">
                  <h4 className="text-lg font-black text-white tracking-tight">Lesson Completed! 🎉</h4>
                  <p className="text-xs text-indigo-300 font-bold">You earned +{selectedMilestone ? selectedMilestone.xpValue : 100} XP</p>
                </div>

                {/* Score breakdown metrics */}
                <div className="grid grid-cols-2 gap-3 bg-gray-900/60 rounded-xl p-3 border border-gray-800">
                  <div className="text-center">
                    <span className="text-[10px] text-gray-500 block font-bold">Accuracy</span>
                    <span className="text-base font-black text-emerald-400">
                      {Math.round((quizCorrectAnswersCount / quizQuestions.length) * 100)}%
                    </span>
                  </div>
                  <div className="text-center">
                    <span className="text-[10px] text-gray-500 block font-bold">Solved</span>
                    <span className="text-base font-black text-slate-200">
                      {quizCorrectAnswersCount}/{quizQuestions.length} Right
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-gray-400 leading-relaxed italic">
                  Excellent work! Your brain has cataloged this new asset. Tap the next path element to keep leveling up!
                </p>

                <button
                  onClick={() => setActiveTab("path")}
                  className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-black tracking-tight transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <span>Return to Learning Path</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.div>
            ) : quizQuestions.length > 0 ? (
              /* ACTIVE QUIZ QUESTION CARD */
              <div className="w-full max-w-sm space-y-4">
                {/* Progress Indicators */}
                <div className="flex items-center justify-between text-xs text-gray-400">
                  <span className="font-bold">
                    Question {currentQuizIndex + 1} of {quizQuestions.length}
                  </span>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: quizQuestions.length }).map((_, i) => (
                      <div 
                        key={i} 
                        className={`w-4 h-1.5 rounded-full transition-colors ${
                          i < currentQuizIndex 
                            ? "bg-indigo-500" 
                            : i === currentQuizIndex 
                              ? "bg-amber-400 animate-pulse" 
                              : "bg-gray-800"
                        }`}
                      ></div>
                    ))}
                  </div>
                </div>

                {/* Main Card with Visual Shake on Submit */}
                <motion.div 
                  key={currentQuizIndex}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="bg-[#0e111d] border border-gray-800 rounded-2xl p-4 md:p-5 shadow-xl space-y-4"
                >
                  <h4 className="font-sans font-extrabold text-slate-100 text-sm leading-normal tracking-tight">
                    {quizQuestions[currentQuizIndex].question}
                  </h4>

                  {/* Options List */}
                  <div className="space-y-2 pt-2">
                    {quizQuestions[currentQuizIndex].options.map((option, oIdx) => {
                      const isSelected = selectedOptionIndex === oIdx;
                      const isCorrectAnswer = oIdx === quizQuestions[currentQuizIndex].correctIndex;
                      
                      let optionStyle = "bg-gray-900 border-gray-800 text-slate-300 hover:border-gray-700";
                      
                      if (isSelected && !quizSubmitted) {
                        optionStyle = "bg-indigo-600/10 border-indigo-500 text-indigo-300";
                      } else if (quizSubmitted) {
                        if (isCorrectAnswer) {
                          optionStyle = "bg-emerald-500/10 border-emerald-500 text-emerald-400 font-bold";
                        } else if (isSelected) {
                          optionStyle = "bg-rose-500/10 border-rose-500 text-rose-400";
                        } else {
                          optionStyle = "bg-gray-950/40 border-gray-900 text-gray-600 opacity-60";
                        }
                      }

                      return (
                        <button
                          key={oIdx}
                          disabled={quizSubmitted}
                          onClick={() => setSelectedOptionIndex(oIdx)}
                          className={`w-full p-3 rounded-xl border text-left text-xs transition-all flex items-center justify-between gap-2 cursor-pointer ${optionStyle}`}
                        >
                          <span>{option}</span>
                          {quizSubmitted && isCorrectAnswer && (
                            <Check className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                          )}
                          {quizSubmitted && isSelected && !isCorrectAnswer && (
                            <X className="w-4 h-4 text-rose-400 flex-shrink-0" />
                          )}
                        </button>
                      );
                    })}
                  </div>

                  {/* Action row (Submit vs Next) */}
                  <div className="pt-2">
                    {!quizSubmitted ? (
                      <button
                        onClick={handleSubmitQuizAnswer}
                        disabled={selectedOptionIndex === null}
                        className="w-full py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-35 text-white rounded-xl text-xs font-black tracking-tight transition-all cursor-pointer"
                      >
                        Check Answer
                      </button>
                    ) : (
                      <div className="space-y-3">
                        {/* Interactive dynamic explanations to maximize usefulness */}
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          className="p-3.5 bg-gray-950 border border-gray-800 rounded-xl space-y-2 text-[11px] leading-relaxed"
                        >
                          <div>
                            <span className="text-gray-500 uppercase font-black tracking-wider block text-[9px]">💡 Why this is correct:</span>
                            <p className="text-gray-300 font-medium mt-0.5">{quizQuestions[currentQuizIndex].explanation}</p>
                          </div>
                          <div className="pt-1.5 border-t border-gray-900">
                            <span className="text-amber-400 uppercase font-black tracking-wider block text-[9px] flex items-center gap-1">
                              <Star className="w-3 h-3 text-amber-400 fill-amber-400" />
                              How this is used in real life:
                            </span>
                            <p className="text-gray-400 mt-0.5">{quizQuestions[currentQuizIndex].realWorldUtility}</p>
                          </div>
                        </motion.div>

                        <button
                          onClick={handleNextQuizQuestion}
                          className="w-full py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-black tracking-tight transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                        >
                          <span>Next Question</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    )}
                  </div>
                </motion.div>
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500 text-xs">
                No active quiz selected. Head to the **Learning Path** and select a milestone to begin!
              </div>
            )}
          </div>
        )}


        {/* ========================================================
            TAB 4: STUDENT ACHIEVEMENT & PROFILE STATUS
            ======================================================== */}
        {activeTab === "profile" && (
          <div className="flex-1 p-5 overflow-y-auto space-y-5 bg-[#07080e]/60">
            {/* Header statistics block */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-[#0e111d] border border-gray-800 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center text-indigo-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-gray-500 block">Total Solved</span>
                  <span className="text-sm font-black text-slate-200">{profile.solvedProblemsCount} Questions</span>
                </div>
              </div>

              <div className="bg-[#0e111d] border border-gray-800 rounded-xl p-3.5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Flame className="w-5 h-5 text-emerald-400" />
                </div>
                <div>
                  <span className="text-[9px] uppercase tracking-wider font-bold text-gray-500 block">Day Streak</span>
                  <span className="text-sm font-black text-slate-200">{profile.streakCount} Days Active</span>
                </div>
              </div>
            </div>

            {/* Achievement Milestones - makes them realize progression */}
            <div className="bg-[#0e111d] border border-gray-800 rounded-xl p-4 space-y-3">
              <h4 className="font-sans font-black text-xs text-slate-200 uppercase tracking-wider border-b border-gray-800 pb-2">
                🏆 Unlocked Badges & Milestones
              </h4>

              <div className="space-y-2.5">
                {[
                  { name: "First Success", description: "Completed Unit 1 on the learning path.", earned: true, icon: "🎯" },
                  { name: "3-Day Streak", description: "Practiced 3 days in a row without breaking.", earned: true, icon: "🔥" },
                  { name: "Level Explorer", description: "Reached Level 3 on your career track.", earned: profile.currentLevel >= 3, icon: "🚀" },
                  { name: "Perfect Score", description: "Answered every quiz question correctly.", earned: profile.unlockedAchievements.includes("Perfect Score"), icon: "💎" }
                ].map((ach, idx) => (
                  <div 
                    key={idx} 
                    className={`flex items-center gap-3 p-2.5 rounded-lg border text-xs ${
                      ach.earned 
                        ? "bg-indigo-950/15 border-indigo-500/25 text-slate-200" 
                        : "bg-gray-950/40 border-gray-900/60 text-gray-600 opacity-55"
                    }`}
                  >
                    <span className="text-2xl">{ach.earned ? ach.icon : "🔒"}</span>
                    <div>
                      <span className="font-extrabold tracking-tight block">{ach.name}</span>
                      <span className="text-[10px] text-gray-400 leading-none">{ach.description}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Pedagogical helper badge */}
            <div className="p-3 bg-indigo-950/20 border border-indigo-900/30 rounded-xl flex gap-2.5 text-xs text-indigo-300">
              <BookMarked className="w-5 h-5 text-indigo-400 flex-shrink-0 mt-0.5" />
              <div>
                <span className="font-bold block text-indigo-200">Continuous Practical Optimization:</span>
                <span className="block mt-1 leading-relaxed text-[11px] text-indigo-300/90">
                  Every lesson solved is logged into memory state and can be utilized by the **Meta LLaMA 3 Tutor** to explain secondary calculations.
                </span>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
