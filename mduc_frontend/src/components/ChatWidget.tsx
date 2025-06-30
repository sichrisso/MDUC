import React, { useState } from "react";

const INTRO_MESSAGE = {
  role: "ai",
  text: "Hi there! 👋 Ask me anything about your data or the chart below. I'm here to help.",
} as const;

type Message = { role: "user" | "ai"; text: string };

const ChatWidget: React.FC = () => {
  const [visible, setVisible] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  // Show intro message only when chat is opened for the first time
  const handleToggle = () => {
    setVisible((v) => {
      if (!v && messages.length === 0) {
        setMessages([INTRO_MESSAGE]);
      }
      return !v;
    });
  };

  const sendMessage = async () => {
    if (!input.trim()) return;

    // Add user message
    const userMsg: Message = { role: "user", text: input.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("https://sichrisso-agent-mduc.hf.space/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: input }),
      });

      const data = await res.json();
      const aiText =
        typeof data.answer === "string"
          ? data.answer
          : data.answer.output || JSON.stringify(data.answer);

      // Add AI message
      const aiMsg: Message = { role: "ai", text: aiText };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error("LLM API error:", err);
      setMessages((prev) => [
        ...prev,
        { role: "ai", text: "Failed to get a response." } as const,
      ]);
    }

    setLoading(false);
  };

  return (
    <div className={`chat-widget ${visible ? "open" : ""}`}>
      <div className="chat-toggle" onClick={handleToggle}>
        💬
      </div>
      {visible && (
        <div className="chat-box">
          <div className="chat-header">Ask about the data</div>
          <div className="chat-body">
            {messages.map((m, i) => (
              <div key={i} className={`chat-msg ${m.role}`}>
                {m.text}
              </div>
            ))}
            {loading && <div className="chat-msg ai">Thinking...</div>}
          </div>
          <div className="chat-input">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && sendMessage()}
              placeholder="Ask a question about the chart or data..."
              name="chat-question"
              id="chat-question"
            />
            <button onClick={sendMessage} disabled={loading}>
              Send
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ChatWidget;
