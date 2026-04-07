import { useState, useEffect } from "react";
import { ConceptualLabel } from "../../../imports/ConceptualLabel-1";

interface TerminalScreenProps {
  onComplete: () => void;
}

export function TerminalScreen({
  onComplete,
}: TerminalScreenProps) {
  const [lines, setLines] = useState<string[]>(["$ "]);
  const [currentCommand, setCurrentCommand] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [showCursor, setShowCursor] = useState(true);

  const command = "podman run quay.io/openshift/manager";

  useEffect(() => {
    // Blinking cursor
    const cursorInterval = setInterval(() => {
      setShowCursor((prev) => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  useEffect(() => {
    // Auto-type the command after a short delay
    const startDelay = setTimeout(() => {
      setIsTyping(true);
      let index = 0;

      const typeInterval = setInterval(() => {
        if (index < command.length) {
          setCurrentCommand(command.substring(0, index + 1));
          index++;
        } else {
          clearInterval(typeInterval);
          setIsTyping(false);

          // After typing is complete, simulate running the command
          setTimeout(() => {
            setLines((prev) => [
              ...prev.slice(0, -1),
              `$ ${command}`,
              "Initializing OpenShift Management Engine...",
              "Starting configuration server on http://localhost:3000",
              "Opening browser...",
              "",
            ]);

            // Transition to configuration page
            setTimeout(() => {
              onComplete();
            }, 1500);
          }, 500);
        }
      }, 80);

      return () => clearInterval(typeInterval);
    }, 1000);

    return () => clearTimeout(startDelay);
  }, []);

  return (
    <div
      className="min-h-screen p-8 flex items-center justify-center"
      style={{ backgroundColor: "#1a1a1a" }}
    >
      <div
        className="w-full max-w-4xl p-6 border"
        style={{
          backgroundColor: "#0d0d0d",
          borderColor: "#333",
          borderRadius: "var(--radius)",
          boxShadow: "0 4px 6px rgba(0, 0, 0, 0.3)",
        }}
      >
        {/* Terminal Header */}
        <div
          className="flex items-center gap-2 pb-3 mb-4 border-b"
          style={{ borderColor: "#333" }}
        >
          <div className="flex gap-2">
            <div className="w-3 h-3 rounded-full bg-[#ff5f56]"></div>
            <div className="w-3 h-3 rounded-full bg-[#ffbd2e]"></div>
            <div className="w-3 h-3 rounded-full bg-[#27c93f]"></div>
          </div>
          <span
            className="ml-3"
            style={{
              fontFamily: "monospace",
              fontSize: "12px",
              color: "#666",
            }}
          >
            terminal
          </span>
        </div>

        {/* Terminal Content */}
        <div className="space-y-1">
          {lines.slice(0, -1).map((line, index) => (
            <div
              key={index}
              style={{
                fontFamily: "monospace",
                fontSize: "14px",
                color: line.startsWith("$")
                  ? "#4af626"
                  : "#c7c7c7",
                lineHeight: "1.6",
              }}
            >
              {line}
            </div>
          ))}

          {/* Current line with typing effect */}
          <div
            style={{
              fontFamily: "monospace",
              fontSize: "14px",
              color: "#4af626",
              lineHeight: "1.6",
            }}
          >
            $ {currentCommand}
            {isTyping && showCursor && (
              <span
                className="inline-block w-2 h-4 ml-0.5"
                style={{ backgroundColor: "#4af626" }}
              />
            )}
            {!isTyping && lines.length === 1 && showCursor && (
              <span
                className="inline-block w-2 h-4 ml-0.5"
                style={{ backgroundColor: "#4af626" }}
              />
            )}
          </div>
        </div>
      </div>

      <ConceptualLabel />
    </div>
  );
}