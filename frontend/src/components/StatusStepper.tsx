import { Check, Circle } from "lucide-react";

interface Step {
  label: string;
  status: string;
  time?: string;
}

interface Props {
  currentStatus: string;
  steps: Step[];
}

export function StatusStepper({ currentStatus, steps }: Props) {
  const statusOrder = ["pending", "confirmed", "driver_assigned", "en_route", "active", "completed"];
  const currentIndex = statusOrder.indexOf(currentStatus);

  return (
    <div className="relative">
      {/* Connector Line */}
      <div className="absolute left-[15px] top-0 bottom-0 w-0.5 bg-white/5" />
      
      <div className="space-y-8 relative">
        {steps.map((step, index) => {
          const isCompleted = statusOrder.indexOf(step.status) < currentIndex;
          const isActive = step.status === currentStatus;
          const isPending = statusOrder.indexOf(step.status) > currentIndex;

          return (
            <div key={step.status} className="flex gap-6 items-start">
              <div className={`relative z-10 w-8 h-8 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500 ${
                isCompleted ? "bg-emerald-500 border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]" :
                isActive ? "bg-primary border-primary shadow-[0_0_15px_rgba(13,115,119,0.3)]" :
                "bg-card border-white/10"
              }`}>
                {isCompleted ? <Check className="w-4 h-4 text-white" /> : 
                 isActive ? <div className="w-2 h-2 rounded-full bg-white animate-pulse" /> : 
                 <Circle className="w-4 h-4 text-muted-foreground/30" />}
              </div>
              
              <div>
                <div className={`text-sm font-bold uppercase tracking-wider ${isActive ? "text-primary" : isCompleted ? "text-emerald-400" : "text-muted-foreground"}`}>
                  {step.label}
                </div>
                {step.time && (
                  <div className="text-[10px] text-muted-foreground mt-0.5 font-mono">
                    {new Date(step.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                )}
                {isActive && (
                  <div className="mt-2 py-1 px-3 rounded-lg bg-primary/10 border border-primary/20 text-[10px] text-primary font-bold animate-fade-in inline-block">
                    Current Status
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
