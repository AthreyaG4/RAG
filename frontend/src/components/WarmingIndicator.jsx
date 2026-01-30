import { useState, useEffect } from "react";
import { Cpu, Server, Loader2, CheckCircle2, Sparkles } from "lucide-react";
import { cn } from "../lib/utils";

export function WarmingIndicator({
  showModel = true,
  systemHealth,
  className,
}) {
  const isModelReady = systemHealth
    ? systemHealth.services.gpu_service == "healthy"
    : false;

  return (
    <div
      className={cn(
        "flex flex-col gap-3 rounded-2xl p-4",
        "from-accent/50 via-accent/30 bg-linear-to-br to-transparent",
        "border-accent/50 border backdrop-blur-sm",
        "animate-fade-in",
        className,
      )}
    >
      {/* Header */}
      <div className="flex items-center gap-2">
        <div
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-xl transition-all duration-500",
            isModelReady ? "bg-green-500/20" : "bg-primary/20 animate-pulse",
          )}
        >
          {isModelReady ? (
            <Sparkles className="h-4 w-4 text-green-500" />
          ) : (
            <Loader2 className="text-primary h-4 w-4 animate-spin" />
          )}
        </div>
        <span
          className={cn(
            "text-sm font-medium transition-colors duration-300",
            isModelReady
              ? "text-green-600 dark:text-green-400"
              : "text-foreground",
          )}
        >
          {isModelReady ? "System Ready" : "Initializing..."}
        </span>
      </div>

      {/* Status Items */}
      <div className="flex flex-col gap-2 pl-1">
        {/* Model Status */}
        {showModel && (
          <WarmingItem
            icon={Cpu}
            label="Model Warming Up"
            readyLabel="Model Ready"
            isReady={isModelReady}
          />
        )}
      </div>
    </div>
  );
}

function WarmingItem({ icon: Icon, label, readyLabel, isReady }) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 rounded-xl px-3 py-2 transition-all duration-500",
        isReady ? "bg-green-500/10" : "bg-card/50",
      )}
    >
      {/* Animated indicator */}
      <div className="relative">
        {isReady ? (
          <div className="animate-scale-in flex h-6 w-6 items-center justify-center rounded-lg bg-green-500/20">
            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
          </div>
        ) : (
          <div className="bg-primary/10 flex h-6 w-6 items-center justify-center rounded-lg">
            <Icon className="text-primary h-3.5 w-3.5 animate-pulse" />
            {/* Spinning ring */}
            <div className="border-primary/30 border-t-primary absolute inset-0 animate-spin rounded-lg border-2" />
          </div>
        )}
      </div>

      {/* Label */}
      <span
        className={cn(
          "text-sm transition-colors duration-300",
          isReady
            ? "font-medium text-green-600 dark:text-green-400"
            : "text-muted-foreground",
        )}
      >
        {isReady ? readyLabel : label}
      </span>

      {/* Progress dots when loading */}
      {!isReady && (
        <div className="ml-auto flex gap-1">
          <span
            className="bg-primary/60 h-1.5 w-1.5 animate-bounce rounded-full"
            style={{ animationDelay: "0ms" }}
          />
          <span
            className="bg-primary/60 h-1.5 w-1.5 animate-bounce rounded-full"
            style={{ animationDelay: "150ms" }}
          />
          <span
            className="bg-primary/60 h-1.5 w-1.5 animate-bounce rounded-full"
            style={{ animationDelay: "300ms" }}
          />
        </div>
      )}
    </div>
  );
}
