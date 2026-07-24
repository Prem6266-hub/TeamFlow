import { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useParams } from "react-router-dom";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { addUserMessage, clearChat, sendMessage } from "../features/ai/aiSlice";
import "../styles/AIAssistant.css";

const suggestedPrompts = [
  "Show overdue tasks",
  "Summarize today's work",
  "Who is overloaded?",
  "Generate sprint plan",
  "What should I work on next?",
  "Show project progress",
  "Create release checklist",
  "Find blockers",
  "Assign pending work",
];

const formatTime = (value) => {
  if (!value) return "";

  try {
    return new Date(value).toLocaleTimeString([], {
      hour: "numeric",
      minute: "2-digit",
    });
  } catch (error) {
    return "";
  }
};

function AIAssistant() {
  const params = useParams();
  const workSpaceId = params.workspaceId || params.workSpaceId;
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { messages, loading, error } = useSelector((state) => state.ai);
  const [draft, setDraft] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    return () => {
      dispatch(clearChat());
    };
  }, [dispatch, workSpaceId]);

  const handleSend = (promptText = "") => {
    const text = (promptText || draft).trim();

    if (!text || loading) return;

    dispatch(addUserMessage(text));
    dispatch(sendMessage({ workSpaceId, message: text }));
    setDraft("");
  };

  const handleKeyDown = (event) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault();
      handleSend();
    }
  };

  const handleBack = () => {
    if (workSpaceId) {
      navigate(`/workspace/${workSpaceId}`);
      return;
    }

    navigate(-1);
  };

  return (
    <div className="ai-assistant-page">
      <div className="ai-assistant-shell">
        <header className="ai-assistant-header">
          <div className="ai-assistant-header__top">
            <button type="button" className="btn btn-secondary ai-assistant-back" onClick={handleBack}>
              ← Back
            </button>
          </div>
          <div>
            <p className="ai-assistant-eyebrow">Workspace intelligence</p>
            <h1>
              <span className="ai-assistant-gemini-icon" aria-hidden="true">
                ✦
              </span>{" "}
              AI Workspace Assistant
            </h1>
            <p className="ai-assistant-subtitle">Ask anything about your workspace.</p>
          </div>
        </header>

        <div className="ai-assistant-chat">
          {messages.length ? (
            messages.map((message, index) => (
              <div
                key={`${message.role}-${index}`}
                className={`message-row ${message.role === "user" ? "message-row--user" : "message-row--assistant"}`}
              >
                <div className={`message-bubble ${message.role === "user" ? "message-bubble--user" : "message-bubble--assistant"}`}>
                  <div className="message-content">
                    {message.role === "user" ? (
                      message.content
                    ) : (
                      <ReactMarkdown remarkPlugins={[remarkGfm]}>{message.content}</ReactMarkdown>
                    )}
                  </div>
                  <div className="message-time">{formatTime(message.timestamp)}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-chat-state">
              <h2>How can I help today?</h2>
              <p>Ask for summaries, task insights, blockers, or next steps for this workspace.</p>
            </div>
          )}

          {loading ? (
            <div className="message-row message-row--assistant">
              <div className="message-bubble message-bubble--assistant typing-bubble">
                <span className="typing-dot" />
                <span className="typing-dot" />
                <span className="typing-dot" />
              </div>
            </div>
          ) : null}

          {error ? (
            <div className="message-row message-row--assistant">
              <div className="message-bubble message-bubble--assistant error-bubble">{error}</div>
            </div>
          ) : null}

          <div ref={chatEndRef} />
        </div>

        <div className="ai-assistant-prompts">
          {suggestedPrompts.map((prompt) => (
            <button key={prompt} type="button" className="prompt-chip" onClick={() => handleSend(prompt)}>
              {prompt}
            </button>
          ))}
        </div>

        <form
          className="ai-assistant-input"
          onSubmit={(event) => {
            event.preventDefault();
            handleSend();
          }}
        >
          <textarea
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask about tasks, progress, blockers, or planning..."
            rows={4}
          />
          <button className="send-button" type="submit" disabled={loading || !draft.trim()}>
            {loading ? "Thinking..." : "Send"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default AIAssistant;
