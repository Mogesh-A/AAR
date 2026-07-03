/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface JavaFile {
  name: string;
  path: string;
  language: string;
  description: string;
  content: string;
}

export const JAVA_PROJECT_FILES: JavaFile[] = [
  {
    name: "pom.xml",
    path: "smartlearn-backend-java/pom.xml",
    language: "xml",
    description: "Maven project definition and Spring Boot dependencies",
    content: `<?xml version="1.0" encoding="UTF-8"?>
<project xmlns="http://maven.apache.org/POM/4.0.0" 
         xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 https://maven.apache.org/xsd/maven-4.0.0.xsd">
    <modelVersion>4.0.0</modelVersion>
    
    <parent>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-parent</artifactId>
        <version>3.2.4</version>
        <relativePath/> <!-- lookup parent from repository -->
    </parent>
    
    <groupId>com.smartlearn</groupId>
    <artifactId>smartlearn-ar</artifactId>
    <version>0.0.1-SNAPSHOT</version>
    <name>smartlearn-ar</name>
    <description>AI Tutor Backend with REST API for SmartLearn</description>
    
    <properties>
        <java.version>17</java.version>
    </properties>
    
    <dependencies>
        <!-- Spring Boot Web Starter for REST endpoints -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-web</artifactId>
        </dependency>
        
        <!-- Lombok for boilerplates (Getters, Setters, Builders) -->
        <dependency>
            <groupId>org.projectlombok</groupId>
            <artifactId>lombok</artifactId>
            <optional>true</optional>
        </dependency>
        
        <!-- WebClient for making reactive HTTP calls to Gemini/Claude APIs -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-webflux</artifactId>
        </dependency>

        <!-- Spring Boot DevTools for hot reloading during development -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-devtools</artifactId>
            <scope>runtime</scope>
            <optional>true</optional>
        </dependency>
        
        <!-- Testing dependencies -->
        <dependency>
            <groupId>org.springframework.boot</groupId>
            <artifactId>spring-boot-starter-test</artifactId>
            <scope>test</scope>
        </dependency>
    </dependencies>
    
    <build>
        <plugins>
            <!-- Spring Boot Maven Plugin -->
            <plugin>
                <groupId>org.springframework.boot</groupId>
                <artifactId>spring-boot-maven-plugin</artifactId>
                <configuration>
                    <excludes>
                        <exclude>
                            <groupId>org.projectlombok</groupId>
                            <artifactId>lombok</artifactId>
                        </exclude>
                    </excludes>
                </configuration>
            </plugin>
        </plugins>
    </build>
</project>`
  },
  {
    name: "application.properties",
    path: "smartlearn-backend-java/src/main/resources/application.properties",
    language: "properties",
    description: "Port & Gemini/Claude API Key configuration",
    content: `# SmartLearn Java Server configuration
server.port=8080

# Logging Configurations
logging.level.com.smartlearn.ar=DEBUG
logging.level.org.springframework.web=INFO

# AI API Configurations
# Store your secret key here (In production, load via environment variable: GEMINI_API_KEY)
ai.api.key=\${GEMINI_API_KEY:your-gemini-api-key-here}
ai.api.url=https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent

# CORS Configuration (Optional, if frontend is hosted on another port)
cors.allowed-origins=http://localhost:3000`
  },
  {
    name: "SmartlearnArApplication.java",
    path: "smartlearn-backend-java/src/main/java/com/smartlearn/ar/SmartlearnArApplication.java",
    language: "java",
    description: "Main bootstrap class that starts the Spring Boot server",
    content: `package com.smartlearn.ar;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class SmartlearnArApplication {

    public static void main(String[] args) {
        // Boostraps Spring Boot Application on port 8888 or configured 8080
        SpringApplication.run(SmartlearnArApplication.class, args);
        System.out.println("================================================");
        System.out.println("  SmartLearn Java Spring Boot Server Running!  ");
        System.out.println("  Endpoint: POST http://localhost:8080/api/tutor ");
        System.out.println("================================================");
    }
}`
  },
  {
    name: "TutorController.java",
    path: "smartlearn-backend-java/src/main/java/com/smartlearn/ar/controller/TutorController.java",
    language: "java",
    description: "REST Controller handling tutor requests on POST /api/tutor",
    content: `package com.smartlearn.ar.controller;

import com.smartlearn.ar.dto.TutorRequest;
import com.smartlearn.ar.dto.TutorResponse;
import com.smartlearn.ar.service.AnthropicClient;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*") // Allows calls from React/HTML frontends
public class TutorController {

    private static final Logger logger = LoggerFactory.getLogger(TutorController.class);

    @Autowired
    private AnthropicClient aiClient;

    /**
     * Handles the tutor interactions.
     * Receives message context and calls the generative AI model.
     */
    @PostMapping("/tutor")
    public ResponseEntity<TutorResponse> handleTutorRequest(@RequestBody TutorRequest request) {
        logger.info("Received AI Tutor request for subject: {}", request.getSubject());
        logger.debug("Latest user message: {}", request.getMessage());
        
        if (request.getBase64Image() != null) {
            logger.info("Multimodal image attachment received. MimeType: {}, Base64 length: {}", 
                        request.getImageMimeType(), request.getBase64Image().length());
        }
        
        try {
            // Validate input
            if ((request.getMessage() == null || request.getMessage().trim().isEmpty()) && request.getBase64Image() == null) {
                logger.warn("Received empty prompt message and no image attachment!");
                return ResponseEntity.badRequest().build();
            }

            // Calls the AI Client service to fetch the explanation
            TutorResponse response = aiClient.getTutorExplanation(request);
            
            logger.info("Successfully generated AI response. Character count: {}", 
                        response.getResponse().length());
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            logger.error("Exception occurred while communicating with LLM Client", e);
            TutorResponse errorResponse = new TutorResponse(
                "I apologize, but I encountered an error while processing your tutoring request: " + e.getMessage(),
                null
            );
            return ResponseEntity.internalServerError().body(errorResponse);
        }
    }
}`
  },
  {
    name: "AnthropicClient.java",
    path: "smartlearn-backend-java/src/main/java/com/smartlearn/ar/service/AnthropicClient.java",
    language: "java",
    description: "Service class calling the LLM API via WebClient",
    content: `package com.smartlearn.ar.service;

import com.smartlearn.ar.dto.TutorRequest;
import com.smartlearn.ar.dto.TutorResponse;
import com.smartlearn.ar.dto.ChatMessage;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class AnthropicClient {

    private static final Logger logger = LoggerFactory.getLogger(AnthropicClient.class);
    
    private final WebClient webClient;

    @Value("\${ai.api.key}")
    private String apiKey;

    @Value("\${ai.api.url}")
    private String apiUrl;

    public AnthropicClient(WebClient.Builder webClientBuilder) {
        this.webClient = webClientBuilder.build();
    }

    /**
     * Sends the user's tutor request to the AI service (such as Gemini/Claude API)
     * and maps the response back into a TutorResponse DTO.
     */
    public TutorResponse getTutorExplanation(TutorRequest request) {
        logger.debug("Connecting to AI Model API endpoint: {}", apiUrl);
        
        // Build the prompt context using system instructions
        String systemInstruction = "You are an expert, encouraging, and clear AI tutor. "
            + "The user is studying " + request.getSubject() + " at a " + request.getLearningLevel() + " level. "
            + "Break down concepts step-by-step, explain with real-world analogies, and always append 3 follow-up 'suggestedProblems' "
            + "formatted as a separate list that the student can solve next to practice.";

        // Construct the Gemini API JSON structure supporting optional multimodal image input
        List<Map<String, Object>> parts = new ArrayList<>();
        
        if (request.getBase64Image() != null && !request.getBase64Image().isEmpty()) {
            logger.info("Including uploaded image attachment inside OpenAPI request payload. MimeType: {}", request.getImageMimeType());
            Map<String, Object> inlineData = new HashMap<>();
            inlineData.put("mimeType", request.getImageMimeType());
            inlineData.put("data", request.getBase64Image());
            
            Map<String, Object> imagePart = new HashMap<>();
            imagePart.put("inlineData", inlineData);
            parts.add(imagePart);
        }
        
        Map<String, Object> textPart = new HashMap<>();
        textPart.put("text", systemInstruction + "\n\nUser query: " + (request.getMessage() != null ? request.getMessage() : "Analyze this attached resource image"));
        parts.add(textPart);
        
        Map<String, Object> contentObj = new HashMap<>();
        contentObj.put("parts", parts);
        
        Map<String, Object> payload = new HashMap<>();
        payload.put("contents", List.of(contentObj));

        logger.debug("Sending POST request to LLM Gateway...");
        
        try {
            // Make the synchronous API request via WebClient blocking
            Map<String, Object> responseMap = webClient.post()
                .uri(apiUrl + "?key=" + apiKey)
                .header("Content-Type", "application/json")
                .bodyValue(payload)
                .retrieve()
                .bodyToMono(Map.class)
                .block();

            // Extract the text output from the response map
            String responseText = extractTextFromResponse(responseMap);
            
            // Build suggested exercise problems
            List<String> suggestedProblems = generateExercises(request.getSubject(), request.getLearningLevel());
            
            return new TutorResponse(responseText, suggestedProblems);
            
        } catch (Exception e) {
            logger.error("Failed to fetch response from AI endpoint", e);
            throw new RuntimeException("AI provider service unavailable: " + e.getMessage(), e);
        }
    }

    @SuppressWarnings("unchecked")
    private String extractTextFromResponse(Map<String, Object> responseMap) {
        try {
            if (responseMap == null) return "No response received.";
            
            List<Map<String, Object>> candidates = (List<Map<String, Object>>) responseMap.get("candidates");
            if (candidates == null || candidates.isEmpty()) return "No content candidates found.";
            
            Map<String, Object> firstCandidate = candidates.get(0);
            Map<String, Object> content = (Map<String, Object>) firstCandidate.get("content");
            List<Map<String, Object>> parts = (List<Map<String, Object>>) content.get("parts");
            
            if (parts == null || parts.isEmpty()) return "No text parts returned.";
            return (String) parts.get(0).get("text");
        } catch (Exception e) {
            logger.warn("Could not parse structured response, returning raw format: {}", responseMap);
            return "Unable to parse AI response. Raw payload: " + responseMap.toString();
        }
    }

    private List<String> generateExercises(String subject, String level) {
        List<String> list = new ArrayList<>();
        if ("Mathematics".equalsIgnoreCase(subject)) {
            list.add("Solve: Integrate x*ln(x) dx");
            list.add("Find the derivative of f(x) = sin^2(x) * cos(x)");
            list.add("Prove the Pythagoras theorem using coordinate geometry.");
        } else if ("Computer Science".equalsIgnoreCase(subject)) {
            list.add("Explain the difference between HashMap and TreeMap in Java.");
            list.add("Implement a recursive binary search algorithm.");
            list.add("Analyze the time and space complexity of QuickSort.");
        } else {
            list.add("Explain the core concept we just discussed in your own words.");
            list.add("Apply this concept to a real-world scenario of your choice.");
            list.add("What would happen if we changed the primary assumption of this model?");
        }
        return list;
    }
}`
  },
  {
    name: "TutorRequest.java",
    path: "smartlearn-backend-java/src/main/java/com/smartlearn/ar/dto/TutorRequest.java",
    language: "java",
    description: "Request DTO representing the incoming student message payload",
    content: `package com.smartlearn.ar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TutorRequest {
    private String message;
    private String subject;          // e.g., "Mathematics", "Physics", "Computer Science"
    private String learningLevel;    // e.g., "Beginner", "Intermediate", "Advanced"
    private List<ChatMessage> history; // Dialogue history for context-aware conversational replies
    private String base64Image;      // Base64-encoded image for multimodal questions
    private String imageMimeType;    // MIME type of the uploaded image (e.g., "image/jpeg", "image/png")
}`
  },
  {
    name: "TutorResponse.java",
    path: "smartlearn-backend-java/src/main/java/com/smartlearn/ar/dto/TutorResponse.java",
    language: "java",
    description: "Response DTO carrying the tutor's reply and practice questions",
    content: `package com.smartlearn.ar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class TutorResponse {
    private String response;                // Markdown text response of explanation
    private List<String> suggestedProblems; // Exercise exercises parsed by client
}`
  },
  {
    name: "ChatMessage.java",
    path: "smartlearn-backend-java/src/main/java/com/smartlearn/ar/dto/ChatMessage.java",
    language: "java",
    description: "DTO representation of individual dialogue turns",
    content: `package com.smartlearn.ar.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessage {
    private String sender;  // "student" or "tutor"
    private String content; // text content of the message
}`
  },
  {
    name: "README.md",
    path: "smartlearn-backend-java/README.md",
    language: "markdown",
    description: "Instructions for compilation, database setup, and running",
    content: `# SmartLearn Java Backend (Spring Boot AI Tutor REST API)

This project implements a high-performance Spring Boot REST microservice configured to act as an intelligent, responsive AI Tutor API.

## Requirements
- Java 17 or higher
- Maven 3.8+
- Active internet connection (to connect to Google Gemini API)

## Project Layout
- \`com.smartlearn.ar.SmartlearnArApplication\`: Bootstraps the application. Runs on Port 8080.
- \`TutorController\`: Maps \`POST /api/tutor\` handling user chat requests.
- \`AnthropicClient\`: Proxies requests to LLM APIs with pre-engineered educational context guidelines.
- \`dto/*\`: High fidelity Java POJOs (DTOs) utilizing Lombok for clean code representation.

## Setup and Run
1. Clone or copy the folder contents.
2. Build the project using Maven:
   \`\`\`bash
   mvn clean install
   \`\`\`
3. Run the Spring Boot Application, injecting your Gemini API key:
   \`\`\`bash
   export GEMINI_API_KEY="your-gemini-key-here"
   mvn spring-boot:run
   \`\`\`
   
The server will boot up at \`http://localhost:8080\`.

## API Signature
**Endpoint:** \`POST http://localhost:8080/api/tutor\`  
**Headers:** \`Content-Type: application/json\`  
**Request Payload:**
\`\`\`json
{
  "message": "Explain what a Prime Number is",
  "subject": "Mathematics",
  "learningLevel": "Beginner",
  "history": []
}
\`\`\`

**Response Payload:**
\`\`\`json
{
  "response": "A prime number is a natural number greater than 1 that has no positive divisors other than 1 and itself...",
  "suggestedProblems": [
    "Is 1 considered a prime number?",
    "Find the prime factorization of 36.",
    "Solve: find all prime numbers between 1 and 20."
  ]
}
\`\`\`
`
  }
];
