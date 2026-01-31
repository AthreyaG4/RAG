import { useState, useRef, useEffect, use } from "react";
import { Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { useMessages } from "../hooks/useMessages";
import { CitationViewer } from "../components/CitationViewer";
import { CitationBadge } from "../components/CitationBadge";
import { useUI } from "../hooks/useUI";
import { useProjects } from "../hooks/useProjects";

export function ChatInterface() {
  const { messages, isWaitingForStream, isStreaming, createMessage } =
    useMessages();
  const [input, setInput] = useState("");

  const [activeCitation, setActiveCitation] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const { selectedProject } = useProjects();
  const { isSidebarOpen } = useUI();

  const projectName = selectedProject ? selectedProject.name : "Loading...";

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!input.trim() || isStreaming || isWaitingForStream) return;

    setInput("");
    await createMessage(input.trim());
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCitationClick = (citation) => {
    setActiveCitation(citation);
  };

  return (
    <div className="animate-fade-in flex h-screen flex-1">
      {/* Main Chat Area */}
      <div
        className={cn(
          "transition-smooth flex flex-1 flex-col",
          activeCitation ? "w-[60%]" : "w-full",
        )}
      >
        <header
          className={`border-border bg-card/50 border-b px-6 py-4 backdrop-blur-sm ${!isSidebarOpen ? "pl-14" : ""}`}
        >
          <h1 className="text-foreground font-semibold">{projectName}</h1>
          <p className="text-muted-foreground text-sm">
            Knowledge base ready • Ask anything
          </p>
        </header>

        <div className="flex-1 overflow-y-auto px-4 py-6">
          {messages.length === 0 ? (
            <div className="flex h-full items-center justify-center">
              <div className="max-w-md space-y-4 text-center">
                <div className="bg-accent mx-auto flex h-16 w-16 items-center justify-center rounded-2xl">
                  <Bot className="text-accent-foreground h-8 w-8" />
                </div>
                <h3 className="text-foreground text-lg font-medium">
                  Ready to answer your questions
                </h3>
                <p className="text-muted-foreground text-sm">
                  Your knowledge base has been uploaded. Start asking questions
                  about your documents.
                </p>
              </div>
            </div>
          ) : (
            <div className="mx-auto max-w-3xl space-y-6">
              {messages.map((message, index) => (
                <div
                  key={message.id}
                  className={cn(
                    "animate-fade-in flex gap-4",
                    message.role === "user" ? "justify-end" : "justify-start",
                  )}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {message.role === "assistant" && (
                    <div className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                      <Bot className="text-primary-foreground h-4 w-4" />
                    </div>
                  )}
                  <div className="max-w-[80%] space-y-2">
                    <div
                      className={cn(
                        "rounded-2xl px-4 py-3",
                        message.role === "user"
                          ? "bg-primary text-primary-foreground"
                          : "bg-muted text-foreground",
                      )}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap">
                        {message.content}
                      </p>
                    </div>

                    {/* Citations */}
                    {message.citations && message.citations.length > 0 && (
                      <div className="flex flex-wrap gap-2 pl-1">
                        {message.citations.map((citation) => (
                          <CitationBadge
                            key={citation.id}
                            citation={citation}
                            onClick={() => handleCitationClick(citation)}
                            isActive={activeCitation?.id === citation.id}
                          />
                        ))}
                      </div>
                    )}
                  </div>
                  {message.role === "user" && (
                    <div className="bg-secondary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                      <User className="text-secondary-foreground h-4 w-4" />
                    </div>
                  )}
                </div>
              ))}
              {isWaitingForStream && (
                <div className="animate-fade-in flex gap-4">
                  <div className="bg-primary flex h-8 w-8 shrink-0 items-center justify-center rounded-lg">
                    <Bot className="text-primary-foreground h-4 w-4" />
                  </div>
                  <div className="bg-muted rounded-2xl px-4 py-3">
                    <Loader2 className="text-muted-foreground h-4 w-4 animate-spin" />
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        <div className="border-border bg-card/50 border-t p-4 backdrop-blur-sm">
          <form onSubmit={handleSubmit} className="mx-auto max-w-3xl">
            <div className="relative flex items-start gap-2">
              <div className="relative flex-1">
                <textarea
                  ref={inputRef}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask a question about your documents..."
                  rows={1}
                  className={cn(
                    "border-input bg-background w-full resize-none rounded-xl border px-4 py-3 pr-12",
                    "placeholder:text-muted-foreground text-sm",
                    "focus:ring-ring focus:border-transparent focus:ring-2 focus:outline-none",
                    "transition-smooth max-h-32",
                  )}
                  style={{
                    height: "auto",
                    minHeight: "48px",
                  }}
                />
              </div>
              <Button
                type="submit"
                size="icon"
                disabled={!input.trim() || isStreaming || isWaitingForStream}
                className={cn("h-12 w-12 shrink-0 rounded-xl")}
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>

      {/* Citation Viewer Panel */}
      {activeCitation && (
        <div className="border-border animate-fade-in w-[40%] max-w-125 min-w-[320px] border-l">
          <CitationViewer
            citation={activeCitation}
            onClose={() => setActiveCitation(null)}
          />
        </div>
      )}
    </div>
  );
}
