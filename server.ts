/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
function getGeminiClient(): GoogleGenAI {
  if (!ai) {
    const key = process.env.GEMINI_API_KEY;
    ai = new GoogleGenAI({
      apiKey: key || "MOCK_KEY",
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
  }
  return ai;
}

// API Routes FIRST
app.post("/api/tutor", async (req, res) => {
  const { message, subject, learningLevel, history, base64Image, imageMimeType } = req.body;
  const timestamp = new Date().toLocaleTimeString();

  // Create mock Spring Boot backend logs for pedagogical purposes
  const logs: { id: string; timestamp: string; level: "INFO" | "DEBUG" | "WARN" | "ERROR"; loggerName: string; message: string; }[] = [
    {
      id: "log-" + Math.random().toString(36).substring(2, 9),
      timestamp,
      level: "INFO",
      loggerName: "com.smartlearn.ar.controller.TutorController",
      message: `Received AI Tutor REST request. Subject="${subject}", LearningLevel="${learningLevel}"`
    },
    {
      id: "log-" + Math.random().toString(36).substring(2, 9),
      timestamp,
      level: "DEBUG",
      loggerName: "com.smartlearn.ar.controller.TutorController",
      message: `Binding incoming JSON request context to TutorRequest DTO. Payload: "${message ? message.substring(0, 45) : ""}"`
    }
  ];

  if (base64Image) {
    logs.push({
      id: "log-img-" + Math.random().toString(36).substring(2, 9),
      timestamp,
      level: "INFO",
      loggerName: "com.smartlearn.ar.controller.TutorController",
      message: `Parsed multimodal payload: multipart image attached (${imageMimeType}, ~${Math.round(base64Image.length / 1024)} KB)`
    });
  }

  logs.push({
    id: "log-" + Math.random().toString(36).substring(2, 9),
    timestamp,
    level: "DEBUG",
    loggerName: "com.smartlearn.ar.service.Llama3Client",
    message: `Invoking getTutorExplanation(). Establishing connection to Meta Llama 3 API Gateway...`
  });

  try {
    const key = process.env.GEMINI_API_KEY;
    const isKeyValid = !!(key && key !== "MOCK_KEY" && key !== "undefined" && key !== "null" && key.trim() !== "");
    let answer = "";
    let suggestedProblems: string[] = [];

    if (!isKeyValid) {
      // Offline mock response
      logs.push({
        id: "log-" + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        level: "WARN" as const,
        loggerName: "com.smartlearn.ar.service.Llama3Client",
        message: "GEMINI_API_KEY is not configured in secrets. Generating rich offline tutor fallback response using Meta Llama 3 emulator."
      });

      // Simple mock AI wait to feel realistic
      await new Promise((resolve) => setTimeout(resolve, 800));

      if (base64Image) {
        answer = `### Image Received! 📸 (Simulation Mode)

I have successfully received your attached image data via our Java Spring Boot REST DTO connection! Since I am operating in **offline simulation mode** (GEMINI_API_KEY is not configured in your settings), I cannot analyze the exact pixel content of your file. 

However, your request demonstrates how the **HTML + Tailwind + JavaScript client** encodes images into standard Base64 chunks and transmits them inside a Spring Boot \`TutorRequest\` payload to our controllers.

#### How this operates in a live production environment:
1. **Multipart Serialization**: Your browser converts the selected image file using standard \`FileReader.readAsDataURL()\`.
2. **REST Request Binding**: The frontend executes a \`POST /api/tutor\` request, carrying the text prompt \`"${message}"\` alongside the image's Base64 bytes.
3. **OpenAPI / Meta Llama 3 Gateway**: The backend server receives the payload, maps it to a \`TutorRequest\` instance, and invokes the modern Meta Llama 3 API using the WebClient or SDK, passing the Base64 bytes directly inside the multimodal request.

How can I help you understand this Java REST architecture further? Feel free to ask!`;
        suggestedProblems = [
          "Explain how MultipartFile is used in standard Spring Boot controller methods.",
          "Describe how Base64 image encoding works over standard HTTP POST requests.",
          "How can we configure maximum file upload limits inside application.properties?"
        ];
      } else {
        const normSubject = (subject || "").toLowerCase();
        if (normSubject === "mathematics") {
          answer = `### Understanding ${message} (Level: ${learningLevel})

Hello! As your Mathematics tutor, I would be delighted to help you master this concept step-by-step.

#### 1. Core Principle
In mathematics, everything is logical and structured. When analyzing **${message}**, we start by isolating the primary variables and understanding their relationship.

#### 2. Visual / Analogy Breakdown
Think of functions like a juice machine:
- **Input (x)**: The raw fruit you put inside.
- **Machine (f)**: The mathematical rules processing it.
- **Output (f(x))**: The juice produced.

#### 3. Step-by-Step Example
Let's solve a fundamental problem related to this topic:
- Let's say we have $f(x) = 2x + 4$
- If the student inputs $x = 3$:
  - $f(3) = 2(3) + 4$
  - $f(3) = 6 + 4 = 10$

Try solving the exercises below to practice this concept right now! Let me know if you get stuck on any steps.`;
          suggestedProblems = [
            "If f(x) = 3x - 5, what is the output when x = 4?",
            "Explain in your own words the difference between an input (domain) and output (range).",
            "Solve for x: 4x + 8 = 20"
          ];
        } else if (normSubject === "computer science") {
          answer = `### Mastering ${message} in Computer Science (Level: ${learningLevel})

Welcome! Let's examine this important Computer Science concept. In programming, writing clean, readable, and efficient algorithms is our primary goal.

#### 1. Architectural Concept
**${message}** is a building block of computational logic. In object-oriented programming (OOP), we focus on modeling software after real-world entities.

#### 2. Java Implementation Example
Here is how this logic is represented cleanly inside a Java Class:
\`\`\`java
public class StudentHelper {
    private String name;
    private String currentTopic;

    public StudentHelper(String name, String currentTopic) {
        this.name = name;
        this.currentTopic = currentTopic;
    }

    // Method illustrating the logic of ${message}
    public void study() {
        System.out.println(name + " is currently practicing: " + currentTopic);
    }
}
\`\`\`

#### 3. Complexity Analysis
- **Time Complexity**: $O(1)$ constant time for direct access or initialization.
- **Space Complexity**: $O(n)$ where $n$ is the dataset depth.

Analyze the exercises below to test your understanding! Let's debug together if needed.`;
          suggestedProblems = [
            "Explain the difference between class fields and methods in Java.",
            "Write a simple Java loop that prints prime numbers from 1 to 10.",
            "What is the difference between Time Complexity O(1) and O(N)?"
          ];
        } else {
          answer = `### Learning ${message} in ${subject} (${learningLevel})

That's a fantastic academic topic! Let me break it down clearly:

#### 1. Overview
Understanding **${message}** is extremely useful because it links together multiple foundational ideas in ${subject}.

#### 2. Elegant Analogy
Imagine we are building a brick house. Each new topic is like a brick that relies on the foundation. This concept represents the mortar holding the bricks together.

#### 3. Key Takeaway
Keep focused on the underlying patterns, rather than just memorizing definitions.

Check out the follow-up problems below to consolidate your learning!`;
          suggestedProblems = [
            "Summarize the main points of this topic in 2 sentences.",
            "Describe a real-world scenario where you observe this concept.",
            "How does this connect to previous topics you have learned?"
          ];
        }
      }
    } else {
      // Call Gemini API server-side
      const genAI = getGeminiClient();
      const systemInstruction = `You are "Meta Llama 3 AI Tutor" (powered by Llama 3 70B Instruct), an expert, highly encouraging, and clear academic tutor. Always speak in the persona of Meta Llama 3.
The student is studying "${subject}" at a "${learningLevel}" level.
Please explain the concept in detail, using appropriate markdown headers, bullet points, clean formatting, and step-by-step logic.
Include elegant code snippets if Computer Science, or math formulas if Mathematics.

CRITICAL: You must return your response in STRICT, valid JSON format matching exactly this structure:
{
  "response": "Your full Markdown-formatted explanation goes here. Support rich headers, bullet lists, bold text, etc.",
  "suggestedProblems": [
    "Suggested practice question 1 tailored to the topic",
    "Suggested practice question 2 tailored to the topic",
    "Suggested practice question 3 tailored to the topic"
  ]
}

Ensure the output is parsable as a valid JSON string. Do NOT enclose the JSON inside a markdown \`\`\`json code block. Return the raw JSON string directly.`;

      const promptParts: any[] = [];
      if (base64Image && imageMimeType) {
        promptParts.push({
          inlineData: {
            mimeType: imageMimeType,
            data: base64Image
          }
        });
      }
      promptParts.push({
        text: `Student Query: "${message || "Please analyze this image"}"\nDialogue History Context: ${JSON.stringify(history)}`
      });

      const apiResponse = await genAI.models.generateContent({
        model: "gemini-3.5-flash",
        contents: { parts: promptParts },
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.7,
        }
      });

      const textResult = apiResponse.text || "{}";
      logs.push({
        id: "log-" + Math.random().toString(36).substring(2, 9),
        timestamp: new Date().toLocaleTimeString(),
        level: "INFO" as const,
        loggerName: "com.smartlearn.ar.service.Llama3Client",
        message: "Meta Llama 3 API endpoint returned successfully. Processing token response stream."
      });

      try {
        const parsed = JSON.parse(textResult.trim());
        answer = parsed.response || "No response generated by tutor.";
        suggestedProblems = parsed.suggestedProblems || [];
      } catch (parseErr: any) {
        logs.push({
          id: "log-" + Math.random().toString(36).substring(2, 9),
          timestamp: new Date().toLocaleTimeString(),
          level: "ERROR" as const,
          loggerName: "com.smartlearn.ar.service.Llama3Client",
          message: `Failed to parse response JSON: ${parseErr.message}. Formatting as custom response.`
        });
        answer = textResult;
        suggestedProblems = [
          "Explain the primary concept discussed in your own words.",
          "Provide an example of this concept.",
          "What questions remain unanswered about this concept?"
        ];
      }
    }

    logs.push({
      id: "log-" + Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      level: "INFO" as const,
      loggerName: "com.smartlearn.ar.controller.TutorController",
      message: "REST API Request completed successfully. Returning 200 OK with TutorResponse DTO payload."
    });

    res.json({
      response: answer,
      suggestedProblems,
      logs
    });

  } catch (err: any) {
    const errTimestamp = new Date().toLocaleTimeString();
    logs.push({
      id: "log-" + Math.random().toString(36).substring(2, 9),
      timestamp: errTimestamp,
      level: "ERROR" as const,
      loggerName: "com.smartlearn.ar.controller.TutorController",
      message: `Exception caught in handleTutorRequest: ${err.message}`
    });

    res.status(500).json({
      response: "An error occurred while communicating with the AI Tutor on the server side: " + err.message,
      suggestedProblems: ["Retry request", "Reload browser", "Review application.properties configuration"],
      logs
    });
  }
});// Helper function to provide high-quality fallback questions
function getFallbackQuestions(subject: string, topic: string): any[] {
  const normTopic = (topic || subject || "").toLowerCase();

  if (normTopic.includes("finan") || normTopic.includes("money") || normTopic.includes("interest") || normTopic.includes("literacy")) {
    return [
      {
        id: "q-fin-1",
        question: "How does 'Compound Interest' differ from 'Simple Interest'?",
        options: [
          "Simple interest grows exponentially, while compound grows linearly",
          "Compound interest calculates gains on both the initial principal AND the accumulated interest",
          "Simple interest is only offered by credit card networks",
          "Compound interest is illegal in most countries"
        ],
        correctIndex: 1,
        explanation: "Compound interest calculates gains on top of previous gains. Over 20 or 30 years, this produces a hockey-stick growth curve that turns small monthly savings into massive fortunes!",
        realWorldUtility: "Understanding compounding is the single most powerful tool to retire wealthy. Starting to invest at age 20 instead of 30 can literally triple your final retirement portfolio."
      },
      {
        id: "q-fin-2",
        question: "What is 'Inflation' and how does it affect your cash savings?",
        options: [
          "It is a process where the central bank gives free cash to savers",
          "It increases the buying power of a single dollar over time",
          "It is the general rise in prices, which decreases the purchasing power of your stagnant money",
          "It is a computer science algorithm to compress database tables"
        ],
        correctIndex: 2,
        explanation: "Inflation averages 2-3% per year. If your money sits under a mattress or in a 0% bank account, you are effectively losing 3% of your wealth every single year to rising prices!",
        realWorldUtility: "This is why successful people never leave large cash sums idle. They invest in assets that outperform inflation (like low-cost stock index funds or real estate)."
      },
      {
        id: "q-fin-3",
        question: "What does a 'High-Yield Savings Account (HYSA)' offer compared to a traditional checking account?",
        options: [
          "Higher interest rates (often 10x to 20x higher) to protect your emergency cash from inflation",
          "An automatic connection to stock markets to invest in high-risk tech companies",
          "It doesn't let you withdraw money for at least 15 years",
          "It is only used by high-frequency institutional traders"
        ],
        correctIndex: 0,
        explanation: "HYSAs currently pay ~4% to 5% interest, whereas traditional big banks pay 0.01%. This makes HYSAs the perfect place to park your emergency fund safely.",
        realWorldUtility: "If you have $10,000 in emergency savings, a traditional account pays you $1 per year. An HYSA pays you $450 to $500 per year for zero extra effort!"
      }
    ];
  } else if (normTopic.includes("spanish") || normTopic.includes("french") || normTopic.includes("language")) {
    return [
      {
        id: "q-lang-1",
        question: "What is the correct Spanish translation for: 'Where is the library, please?'",
        options: [
          "¿Cómo estás, señor bibliotecario?",
          "¿Dónde está la biblioteca, por favor?",
          "Quiero comer una mansion grande",
          "La biblioteca es roja y vieja"
        ],
        correctIndex: 1,
        explanation: "'¿Dónde está la biblioteca, por favor?' literally translates to 'Where is the library, please?'. It is a key phrase to learn directional navigations.",
        realWorldUtility: "Mastering location query patterns (¿Dónde está...?) is highly useful when traveling in Spanish-speaking countries to quickly find hospitals, subways, or hotels without internet."
      },
      {
        id: "q-lang-2",
        question: "In French, what is the meaning of 'C'est la vie'?",
        options: [
          "That is delicious food",
          "Let's go to the party",
          "That's life (expressing philosophical acceptance of situations)",
          "Happy birthday to you"
        ],
        correctIndex: 2,
        explanation: "'C'est la vie' translates literally to 'That is life' and is a world-famous idiom representing peaceful acceptance of daily events or little setbacks.",
        realWorldUtility: "Using local idioms displays extreme respect and cultural maturity, allowing you to establish warm connections with overseas hosts, colleagues, and friends instantly."
      }
    ];
  } else if (normTopic.includes("math") || normTopic.includes("calculus") || normTopic.includes("algebra")) {
    return [
      {
        id: "q-math-1",
        question: "What is the primary conceptual definition of a 'Derivative' in calculus?",
        options: [
          "The total area enclosed underneath a curve",
          "The average value of a mathematical function",
          "The instantaneous rate of change (or the slope of the tangent line at a point)",
          "The point where a function crosses the x-axis"
        ],
        correctIndex: 2,
        explanation: "The derivative calculates how fast something is changing at a precise split second. For example, if you know the position formula of a rocket, its derivative gives you its instantaneous velocity!",
        realWorldUtility: "This is used in modern self-driving cars to calculate braking distance, in airplane autopilot software, and in financial models predicting stock market trends."
      },
      {
        id: "q-math-2",
        question: "What is the result of solving: 3x - 7 = 11?",
        options: [
          "x = 3",
          "x = 6",
          "x = 18",
          "x = 9"
        ],
        correctIndex: 1,
        explanation: "Add 7 to both sides: 3x = 18. Divide by 3: x = 6.",
        realWorldUtility: "This fundamental algebra represents the scaling calculations done in computer graphics to resize windows, adjust screen brightness ratios, and calculate discounts."
      }
    ];
  } else {
    return [
      {
        id: "q-cs-1",
        question: "In Object-Oriented Programming (OOP), what is the goal of 'Encapsulation'?",
        options: [
          "To make code compile as fast as possible",
          "To group variables and methods together into a class while hiding internal states from unauthorized access",
          "To run multiple loops in parallel on different CPU cores",
          "To translate high-level code directly into binary assembly instructions"
        ],
        correctIndex: 1,
        explanation: "Encapsulation keeps internal variables private and only exposes safe, validated public methods (like get/set). This prevents other parts of a large code base from accidentally corrupting your object's state!",
        realWorldUtility: "This is crucial in banking apps. Encapsulation prevents other parts of the app from setting 'balance = 999999999' directly, forcing transactions through secure deposit methods."
      },
      {
        id: "q-cs-2",
        question: "Which of the following describes the difference between a 'List' and a 'Set'?",
        options: [
          "Lists can hold duplicates and maintain order; Sets store unique items and usually do not guarantee order",
          "Sets are twice as slow as Lists in all circumstances",
          "Lists can only store strings, while Sets store integers",
          "Lists are stored in RAM, while Sets are written directly to the SSD"
        ],
        correctIndex: 0,
        explanation: "Lists are great for sequences (like a list of chat messages). Sets are optimized to instantly check if an item has already been encountered without scanning the whole collection.",
        realWorldUtility: "Sets are incredibly useful in search engines and high-volume websites (like Twitter) to track unique daily visitor IPs or ensure usernames remain unique."
      },
      {
        id: "q-cs-3",
        question: "What does 'Time Complexity O(1)' mean in algorithmic performance?",
        options: [
          "The function takes exactly 1 second to execute",
          "The execution time grows linearly with the size of the input data",
          "The execution time remains constant, regardless of whether the dataset contains 10 items or 10 billion items",
          "The algorithm must run exactly once before it is deleted"
        ],
        correctIndex: 2,
        explanation: "O(1) represents maximum performance. An example is looking up a value in a HashMap by its key. It takes the same time even if the map holds the global dictionary!",
        realWorldUtility: "In systems processing millions of queries per second (like credit card networks or GPS navigators), using O(1) algorithms is the difference between an instant response and a server crash."
      }
    ];
  }
}

// Dynamic AI Quizzer API endpoint
app.post("/api/quiz", async (req, res) => {
  const { subject, level, topic } = req.body;
  const timestamp = new Date().toLocaleTimeString();

  const suffix = Math.random().toString(36).substring(2, 9);
  const logs: { id: string; timestamp: string; level: "INFO" | "DEBUG" | "WARN" | "ERROR"; loggerName: string; message: string; }[] = [
    {
      id: `quiz-log-1-${suffix}`,
      timestamp,
      level: "INFO",
      loggerName: "com.smartlearn.ar.controller.QuizController",
      message: `Received request to generate adaptive Duolingo-style quiz on: "${topic || subject}" (${level})`
    }
  ];

  try {
    const key = process.env.GEMINI_API_KEY;
    const isKeyValid = !!(key && key !== "MOCK_KEY" && key !== "undefined" && key !== "null" && key.trim() !== "");
    let questions = [];

    if (!isKeyValid) {
      logs.push({
        id: `quiz-log-2-${suffix}`,
        timestamp,
        level: "WARN" as const,
        loggerName: "com.smartlearn.ar.service.Llama3Client",
        message: "No Meta Llama 3 API key detected. Compiling premium offline Llama 3 quiz preset."
      });

      // Simple mock wait
      await new Promise(r => setTimeout(r, 600));

      questions = getFallbackQuestions(subject, topic);
    } else {
      // Generate actual AI quiz questions
      const genAI = getGeminiClient();
      const systemInstruction = `You are "Meta Llama 3 AI Quiz Generator" (powered by Llama 3 70B Instruct). Always introduce yourself or generate questions matching the Meta Llama 3 persona.
Generate 3 highly educational, multiple-choice quiz questions tailored precisely to the subject "${subject}" (Level: "${level}", Topic: "${topic || "General"}").
Ensure the questions test conceptual understanding and real-world application.

CRITICAL: You must return your response in STRICT, valid JSON format matching exactly this structure:
{
  "questions": [
    {
      "id": "q-1",
      "question": "Clear, concise multiple choice question?",
      "options": ["Option A", "Option B", "Option C", "Option D"],
      "correctIndex": 0,
      "explanation": "Clear explanation of why the correct option is right and others are wrong. Make it conversational, engaging, and clear.",
      "realWorldUtility": "A highly tangible, exciting example of how this concept is directly useful in real-world commercial software, finance, language conversation, or science. This helps the student immediately realize its ultimate utility."
    }
  ]
}

Ensure the output is parsable as a valid JSON string. Do NOT enclose the JSON inside a markdown code block. Return the raw JSON string directly.`;

      const prompt = `Generate 3 interactive questions on: Subject="${subject}", Level="${level}", Topic="${topic || "All"}".`;

      const apiResponse = await genAI.models.generateContent({
        model: "gemini-3.5-flash",
        contents: prompt,
        config: {
          systemInstruction,
          responseMimeType: "application/json",
          temperature: 0.8,
        }
      });

      const textResult = apiResponse.text || "{}";
      logs.push({
        id: `quiz-log-3-${suffix}`,
        timestamp: new Date().toLocaleTimeString(),
        level: "INFO" as const,
        loggerName: "com.smartlearn.ar.service.Llama3Client",
        message: "Meta Llama 3 Quiz API completed successfully. Parsing structured question list."
      });

      try {
        let cleanText = textResult.trim();
        if (cleanText.startsWith("```")) {
          cleanText = cleanText.replace(/^```(?:json)?\n?/i, "").replace(/\n?```$/, "");
        }
        const parsed = JSON.parse(cleanText.trim());
        questions = parsed.questions || [];
      } catch (parseErr: any) {
        logs.push({
          id: `quiz-log-4-${suffix}`,
          timestamp: new Date().toLocaleTimeString(),
          level: "ERROR" as const,
          loggerName: "com.smartlearn.ar.service.Llama3Client",
          message: `Failed to parse structured Llama 3 JSON questions: ${parseErr.message}. Falling back to default questions.`
        });
        questions = getFallbackQuestions(subject, topic);
      }
    }

    logs.push({
      id: `quiz-log-completed-${suffix}`,
      timestamp: new Date().toLocaleTimeString(),
      level: "INFO" as const,
      loggerName: "com.smartlearn.ar.controller.QuizController",
      message: `REST API call finished. Successfully fetched ${questions.length} adaptive questions. Status=200 OK`
    });

    res.json({
      questions,
      logs
    });

  } catch (err: any) {
    const errTimestamp = new Date().toLocaleTimeString();
    logs.push({
      id: `quiz-log-error-${suffix}`,
      timestamp: errTimestamp,
      level: "ERROR" as const,
      loggerName: "com.smartlearn.ar.controller.QuizController",
      message: `Failed to synthesize quiz: ${err.message}. Falling back to default questions.`
    });

    res.json({
      questions: getFallbackQuestions(subject, topic),
      logs
    });
  }
});

// Serve static assets in production, otherwise run Vite server

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
