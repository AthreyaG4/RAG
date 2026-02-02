import { useState, useRef, useEffect, use } from "react";
import { Send, Bot, User, Loader2, Settings2 } from "lucide-react";
import { Button } from "./ui/button";
import { cn } from "../lib/utils";
import { useMessages } from "../hooks/useMessages";
import { CitationViewer } from "../components/CitationViewer";
import { CitationBadge } from "../components/CitationBadge";
import { useUI } from "../hooks/useUI";
import { useProjects } from "../hooks/useProjects";
import { Popover, PopoverTrigger, PopoverContent } from "./ui/popover";
import { Switch } from "./ui/switch";

export function ChatInterface() {
  const {
    messages,
    isWaitingForStream,
    isStreaming,
    createMessage,
    viewCitation,
  } = useMessages();
  const [input, setInput] = useState("");

  const [activeCitation, setActiveCitation] = useState(null);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);

  const [hybridSearch, setHybridSearch] = useState(false);
  const [graphSearch, setGraphSearch] = useState(false);
  const [reranking, setReranking] = useState(false);

  const { selectedProject } = useProjects();
  const { isSidebarOpen } = useUI();

  const [tempUrl, setTempUrl] = useState("");
  const [isLoadingCitation, setIsLoadingCitation] = useState(false);

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
    await createMessage(input.trim(), hybridSearch, graphSearch, reranking);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSubmit(e);
    }
  };

  const handleCitationClick = async (citation) => {
    setActiveCitation(citation);
    setIsLoadingCitation(true);
    try {
      const response = await viewCitation(citation.message_id, citation.id);
      setTempUrl(response.url);
    } catch (err) {
      console.error("Failed to load citation:", err);
      setActiveCitation(null);
    } finally {
      setIsLoadingCitation(false);
    }
  };

  return (
    <div className="animate-fade-in flex h-screen flex-1 flex-col">
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

                  {message.citations && message.citations.length > 0 && (
                    <div className="flex flex-wrap gap-2 pl-1">
                      {message.citations.map((citation, citIndex) => (
                        <CitationBadge
                          key={citation.id}
                          citation={citation}
                          index={citIndex}
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
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-12 w-12 shrink-0 rounded-xl"
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </PopoverTrigger>
              <PopoverContent align="start" side="top" className="mb-2 w-72">
                <div className="space-y-4">
                  <div className="border-border border-b pb-2">
                    <p className="text-foreground text-sm font-medium">
                      Search Options
                    </p>
                  </div>

                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground text-sm font-medium">
                        Hybrid Search
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Semantic + keyword
                      </p>
                    </div>
                    <Switch
                      checked={hybridSearch}
                      onCheckedChange={setHybridSearch}
                    />
                  </div>

                  {/* <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground text-sm font-medium">
                        Graph Search
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Knowledge graph traversal
                      </p>
                    </div>
                    <Switch
                      checked={graphSearch}
                      onCheckedChange={setGraphSearch}
                    />
                  </div> */}

                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <p className="text-foreground text-sm font-medium">
                        Reranking
                      </p>
                      <p className="text-muted-foreground text-xs">
                        Cross-encoder reranking
                      </p>
                    </div>
                    <Switch
                      checked={reranking}
                      onCheckedChange={setReranking}
                    />
                  </div>
                </div>
              </PopoverContent>
            </Popover>
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

      {activeCitation && (
        <CitationViewer
          citation={activeCitation}
          onClose={() => {
            setActiveCitation(null);
            setTempUrl("");
          }}
          url={tempUrl}
        />
      )}
    </div>
  );
}
