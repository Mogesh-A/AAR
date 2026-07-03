/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from "react";
import { JAVA_PROJECT_FILES, JavaFile } from "../javaSource";
import { Folder, FolderOpen, FileCode, Copy, Check, Search, Download, Code2, AlertCircle } from "lucide-react";

export default function CodeExplorerView() {
  const [selectedFile, setSelectedFile] = useState<JavaFile>(JAVA_PROJECT_FILES[0]);
  const [copied, setCopied] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    "src": true,
    "main": true,
    "java": true,
    "com": true,
    "smartlearn": true,
    "ar": true,
    "controller": true,
    "service": true,
    "dto": true,
    "resources": true
  });

  const handleCopy = () => {
    navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const toggleFolder = (key: string) => {
    setExpandedFolders(prev => ({
      ...prev,
      [key]: !prev[key]
    }));
  };

  // Simple syntax-like presentation logic or raw pre styled
  const getHighlighterColorClass = (line: string, lang: string) => {
    if (line.trim().startsWith("//") || line.trim().startsWith("/*") || line.trim().startsWith("*") || line.trim().startsWith("#")) {
      return "text-slate-500 italic"; // Comments
    }
    if (lang === "java") {
      if (line.includes("package ") || line.includes("import ")) {
        return "text-rose-400";
      }
      if (line.includes("@RestController") || line.includes("@PostMapping") || line.includes("@Autowired") || line.includes("@Service") || line.includes("@Value") || line.includes("@Data") || line.includes("@NoArgsConstructor") || line.includes("@AllArgsConstructor") || line.includes("@SpringBootApplication")) {
        return "text-indigo-400 font-semibold";
      }
      if (line.includes("public class ") || line.includes("public interface ") || line.includes("public enum ")) {
        return "text-amber-300 font-semibold";
      }
    }
    if (lang === "xml") {
      if (line.includes("<?xml") || line.includes("<project") || line.includes("</project>")) {
        return "text-indigo-400";
      }
      if (line.includes("<dependency>") || line.includes("</dependency>") || line.includes("<plugin>") || line.includes("</plugin>")) {
        return "text-amber-200 font-medium";
      }
    }
    return "text-slate-100";
  };

  // Filtering files based on query
  const filteredFiles = JAVA_PROJECT_FILES.filter(file =>
    file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    file.content.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div id="code-explorer-container" className="flex flex-col lg:flex-row h-full bg-[#13151a] border border-gray-800 rounded-2xl overflow-hidden shadow-2xl">
      {/* File Tree Left Sidebar */}
      <div className="w-full lg:w-80 border-b lg:border-b-0 lg:border-r border-gray-800 flex flex-col bg-[#101115]">
        <div className="p-4 border-b border-gray-800 space-y-3">
          <div className="flex items-center gap-2">
            <Code2 className="w-5 h-5 text-amber-500" />
            <h4 className="font-sans font-bold text-sm text-gray-200 uppercase tracking-wide">
              Java Backend Files
            </h4>
          </div>
          <div className="relative">
            <input
              id="code-search-input"
              type="text"
              placeholder="Search code files..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-gray-900 border border-gray-800 text-xs text-gray-300 focus:outline-none focus:border-amber-500 placeholder-gray-600 transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-gray-600 absolute left-2.5 top-2.5" />
          </div>
        </div>

        {/* Directory Structure */}
        <div className="flex-1 p-3 overflow-y-auto space-y-1 font-mono text-xs text-gray-400 select-none">
          <div className="flex items-center gap-1 text-amber-500 font-semibold px-2 py-1">
            <FolderOpen className="w-4 h-4" />
            <span className="truncate">smartlearn-backend-java</span>
          </div>

          <div className="pl-3 space-y-0.5">
            {/* Top level Files */}
            {filteredFiles.some(f => f.name === "pom.xml") && (
              <button
                id="file-btn-pom"
                onClick={() => setSelectedFile(JAVA_PROJECT_FILES.find(f => f.name === "pom.xml")!)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-left ${
                  selectedFile.name === "pom.xml" ? "bg-amber-950/40 text-amber-400 border border-amber-900/50" : "hover:bg-gray-900 text-gray-300"
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-indigo-400 flex-shrink-0" />
                <span className="truncate">pom.xml</span>
              </button>
            )}

            {filteredFiles.some(f => f.name === "README.md") && (
              <button
                id="file-btn-readme"
                onClick={() => setSelectedFile(JAVA_PROJECT_FILES.find(f => f.name === "README.md")!)}
                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-left ${
                  selectedFile.name === "README.md" ? "bg-amber-950/40 text-amber-400 border border-amber-900/50" : "hover:bg-gray-900 text-gray-300"
                }`}
              >
                <FileCode className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                <span className="truncate">README.md</span>
              </button>
            )}

            {/* src Folder */}
            <div className="space-y-0.5">
              <button
                id="folder-btn-src"
                onClick={() => toggleFolder("src")}
                className="w-full flex items-center gap-1.5 px-2 py-1 hover:bg-gray-900 rounded cursor-pointer text-left text-gray-300"
              >
                {expandedFolders["src"] ? <FolderOpen className="w-3.5 h-3.5 text-amber-600" /> : <Folder className="w-3.5 h-3.5 text-amber-600" />}
                <span>src/main</span>
              </button>

              {expandedFolders["src"] && (
                <div className="pl-3 border-l border-gray-800/80 ml-2.5 space-y-0.5">
                  {/* java Folder */}
                  <button
                    id="folder-btn-java"
                    onClick={() => toggleFolder("java")}
                    className="w-full flex items-center gap-1.5 px-2 py-1 hover:bg-gray-900 rounded cursor-pointer text-left text-gray-300"
                  >
                    {expandedFolders["java"] ? <FolderOpen className="w-3.5 h-3.5 text-amber-600" /> : <Folder className="w-3.5 h-3.5 text-amber-600" />}
                    <span>java/com/smartlearn/ar/</span>
                  </button>

                  {expandedFolders["java"] && (
                    <div className="pl-3 border-l border-gray-800/80 ml-2.5 space-y-0.5">
                      {/* main application code */}
                      {filteredFiles.some(f => f.name === "SmartlearnArApplication.java") && (
                        <button
                          id="file-btn-app"
                          onClick={() => setSelectedFile(JAVA_PROJECT_FILES.find(f => f.name === "SmartlearnArApplication.java")!)}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-left ${
                            selectedFile.name === "SmartlearnArApplication.java" ? "bg-amber-950/40 text-amber-400 border border-amber-900/50" : "hover:bg-gray-900 text-gray-300"
                          }`}
                        >
                          <FileCode className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                          <span className="truncate">SmartlearnArApplication.java</span>
                        </button>
                      )}

                      {/* controller folder */}
                      <button
                        id="folder-btn-controller"
                        onClick={() => toggleFolder("controller")}
                        className="w-full flex items-center gap-1.5 px-2 py-1 hover:bg-gray-900 rounded cursor-pointer text-left text-gray-400"
                      >
                        {expandedFolders["controller"] ? <FolderOpen className="w-3.5 h-3.5 text-amber-700" /> : <Folder className="w-3.5 h-3.5 text-amber-700" />}
                        <span>controller/</span>
                      </button>

                      {expandedFolders["controller"] && (
                        <div className="pl-3 border-l border-gray-800/60 ml-2.5 space-y-0.5">
                          {filteredFiles.some(f => f.name === "TutorController.java") && (
                            <button
                              id="file-btn-controller"
                              onClick={() => setSelectedFile(JAVA_PROJECT_FILES.find(f => f.name === "TutorController.java")!)}
                              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-left ${
                                selectedFile.name === "TutorController.java" ? "bg-amber-950/40 text-amber-400 border border-amber-900/50" : "hover:bg-gray-900 text-gray-300"
                              }`}
                            >
                              <FileCode className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                              <span className="truncate">TutorController.java</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* service folder */}
                      <button
                        id="folder-btn-service"
                        onClick={() => toggleFolder("service")}
                        className="w-full flex items-center gap-1.5 px-2 py-1 hover:bg-gray-900 rounded cursor-pointer text-left text-gray-400"
                      >
                        {expandedFolders["service"] ? <FolderOpen className="w-3.5 h-3.5 text-amber-700" /> : <Folder className="w-3.5 h-3.5 text-amber-700" />}
                        <span>service/</span>
                      </button>

                      {expandedFolders["service"] && (
                        <div className="pl-3 border-l border-gray-800/60 ml-2.5 space-y-0.5">
                          {filteredFiles.some(f => f.name === "AnthropicClient.java") && (
                            <button
                              id="file-btn-service"
                              onClick={() => setSelectedFile(JAVA_PROJECT_FILES.find(f => f.name === "AnthropicClient.java")!)}
                              className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-left ${
                                selectedFile.name === "AnthropicClient.java" ? "bg-amber-950/40 text-amber-400 border border-amber-900/50" : "hover:bg-gray-900 text-gray-300"
                              }`}
                            >
                              <FileCode className="w-3.5 h-3.5 text-yellow-500 flex-shrink-0" />
                              <span className="truncate">AnthropicClient.java</span>
                            </button>
                          )}
                        </div>
                      )}

                      {/* dto folder */}
                      <button
                        id="folder-btn-dto"
                        onClick={() => toggleFolder("dto")}
                        className="w-full flex items-center gap-1.5 px-2 py-1 hover:bg-gray-900 rounded cursor-pointer text-left text-gray-400"
                      >
                        {expandedFolders["dto"] ? <FolderOpen className="w-3.5 h-3.5 text-amber-700" /> : <Folder className="w-3.5 h-3.5 text-amber-700" />}
                        <span>dto/</span>
                      </button>

                      {expandedFolders["dto"] && (
                        <div className="pl-3 border-l border-gray-800/60 ml-2.5 space-y-0.5">
                          {["TutorRequest.java", "TutorResponse.java", "ChatMessage.java"].map(dtoName => {
                            if (!filteredFiles.some(f => f.name === dtoName)) return null;
                            const fObject = JAVA_PROJECT_FILES.find(f => f.name === dtoName)!;
                            return (
                              <button
                                id={`file-btn-dto-${dtoName}`}
                                key={dtoName}
                                onClick={() => setSelectedFile(fObject)}
                                className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-left ${
                                  selectedFile.name === dtoName ? "bg-amber-950/40 text-amber-400 border border-amber-900/50" : "hover:bg-gray-900 text-gray-300"
                                }`}
                              >
                                <FileCode className="w-3.5 h-3.5 text-teal-400 flex-shrink-0" />
                                <span className="truncate">{dtoName}</span>
                              </button>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                  {/* resources folder */}
                  <button
                    id="folder-btn-resources"
                    onClick={() => toggleFolder("resources")}
                    className="w-full flex items-center gap-1.5 px-2 py-1 hover:bg-gray-900 rounded cursor-pointer text-left text-gray-300"
                  >
                    {expandedFolders["resources"] ? <FolderOpen className="w-3.5 h-3.5 text-amber-600" /> : <Folder className="w-3.5 h-3.5 text-amber-600" />}
                    <span>resources/</span>
                  </button>

                  {expandedFolders["resources"] && (
                    <div className="pl-3 border-l border-gray-800/80 ml-2.5 space-y-0.5">
                      {filteredFiles.some(f => f.name === "application.properties") && (
                        <button
                          id="file-btn-props"
                          onClick={() => setSelectedFile(JAVA_PROJECT_FILES.find(f => f.name === "application.properties")!)}
                          className={`w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg transition-colors cursor-pointer text-left ${
                            selectedFile.name === "application.properties" ? "bg-amber-950/40 text-amber-400 border border-amber-900/50" : "hover:bg-gray-900 text-gray-300"
                          }`}
                        >
                          <FileCode className="w-3.5 h-3.5 text-pink-400 flex-shrink-0" />
                          <span className="truncate">application.properties</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Tip Badge */}
        <div className="p-4 bg-[#0a0b0e] border-t border-gray-800/80 flex items-start gap-2">
          <AlertCircle className="w-4 h-4 text-amber-500/80 flex-shrink-0 mt-0.5" />
          <p className="text-[10px] text-gray-500 leading-normal">
            These authentic Spring Boot sources represent the actual production files running behind typical enterprise AI configurations.
          </p>
        </div>
      </div>

      {/* Editor Panel Right */}
      <div className="flex-1 flex flex-col bg-[#16181f] overflow-hidden min-w-0">
        {/* Editor Toolbar */}
        <div className="flex items-center justify-between px-4 py-3 bg-[#111318] border-b border-gray-800">
          <div className="flex flex-col">
            <span className="text-xs font-mono text-gray-200 font-bold flex items-center gap-1.5">
              {selectedFile.name}
            </span>
            <span className="text-[10px] text-gray-500 font-sans mt-0.5">
              Path: <code className="font-mono text-gray-400">{selectedFile.path}</code>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-gray-800 text-gray-400 border border-gray-700">
              {selectedFile.language}
            </span>

            <button
              id="copy-code-btn"
              onClick={handleCopy}
              className="p-1.5 px-3 bg-gray-900 hover:bg-gray-800 border border-gray-800 hover:border-gray-700 text-gray-300 hover:text-white rounded-lg text-xs font-medium flex items-center gap-1.5 transition-all active:scale-95 cursor-pointer"
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* File Description Header info */}
        <div className="px-4 py-2 bg-amber-500/5 border-b border-gray-800 flex items-center gap-2 text-xs text-amber-400/90 font-sans">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <span><strong>Component Purpose:</strong> {selectedFile.description}</span>
        </div>

        {/* Real Editor content area */}
        <div id="code-content-panel" className="flex-1 p-4 overflow-auto font-mono text-xs leading-relaxed text-gray-300 select-text">
          <pre className="p-2 overflow-x-auto">
            <code>
              {selectedFile.content.split("\n").map((line, idx) => (
                <div key={idx} className="table-row hover:bg-gray-900/30 w-full px-1 py-0.5 rounded transition-colors">
                  <span className="table-cell select-none text-right text-gray-600 w-8 pr-4 border-r border-gray-800 mr-4 text-[10px]">
                    {idx + 1}
                  </span>
                  <span className={`table-cell pl-4 whitespace-pre ${getHighlighterColorClass(line, selectedFile.language)}`}>
                    {line || " "}
                  </span>
                </div>
              ))}
            </code>
          </pre>
        </div>
      </div>
    </div>
  );
}
