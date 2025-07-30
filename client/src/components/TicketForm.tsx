import React, { useState, useEffect, useRef } from "react";
import type { TicketResultType } from "../App";
import ReactMarkdown from "react-markdown";

import remarkGfm from "remark-gfm";

interface TicketFormProps {
  onSubmit: (ticketText: string) => void;
  loading: boolean;
  result: TicketResultType | null;
}

const TicketForm: React.FC<TicketFormProps> = ({
  onSubmit,
  loading,
  result,
}) => {
  console.log("🚀 ~ result:", result);
  const [ticketText, setTicketText] = useState<string>("");
  // Store chat history: user and bot messages
  const [messages, setMessages] = useState<
    { sender: "user" | "bot"; text: string }[]
  >([]);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  // When result changes, add bot message
  useEffect(() => {
    if (result && result.response) {
      setMessages((prev) => [
        ...prev,
        { sender: "bot", text: result.response },
      ]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [result]);

  // Auto-scroll to bottom on new message
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const text = ticketText.trim();
    if (text) {
      setMessages((prev) => [...prev, { sender: "user", text }]);
      onSubmit(text);
      setTicketText("");
    }
  };

  return (
    <>
      <div className="chatbot-container">
        <div className="chatbot-messages">
          {messages.length === 0 && (
            <div className="chatbot-empty">
              Start the conversation by describing your issue.
            </div>
          )}
          {messages.map((msg, idx) => (
            <div key={idx} className={`chatbot-row ${msg.sender}`}>
              <div className={`chatbot-bubble ${msg.sender}`}>
                {/* Conditionally render based on sender */}
                {msg.sender === "bot" ? (
                  <ReactMarkdown remarkPlugins={[remarkGfm]}>
                    {msg.text}
                  </ReactMarkdown>
                ) : (
                  msg.text
                )}
              </div>
            </div>
          ))}
          <div ref={chatEndRef} />
        </div>
        <form className="chatbot-form" onSubmit={handleSend}>
          <input
            className="chatbot-input"
            type="text"
            value={ticketText}
            onChange={(e) => setTicketText(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
          />
          <button
            className="chatbot-send-btn"
            type="submit"
            disabled={loading || !ticketText.trim()}
          >
            {loading ? (
              <div className="loading-dots">
                <span></span>
                <span></span>
                <span></span>
              </div>
            ) : (
              "➤"
            )}
          </button>
        </form>
      </div>
    </>
  );
};

export default TicketForm;
