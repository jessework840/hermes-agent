import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { usePageHeader } from "@/contexts/usePageHeader";
import { cn } from "@/lib/utils";
import { PluginSlot } from "@/plugins";
import { Users, Zap, GitBranch, Activity, Settings, Play, Pause, RotateCw, Download, Eye, Edit, Loader2, Network, Terminal, Layers, Globe, BookOpen, Shield, Plus, FileText, Package } from "lucide-react";

// DollarSign icon (not in lucide, create inline)
function DollarSign({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <line x1="12" y1="1" x2="12" y2="23" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
    </svg>
  );
}

export default function ColonyPage() {
  const { setEnd } = usePageHeader();
  const [activeTab, setActiveTab] = useState<"overview" | "kanban" | "slots" | "replays" | "skills" | "settings" | "planning" | "agent-web">("overview");
  const [colonyStatus, setColonyStatus] = useState<"running" | "stopped" | "starting" | "error">("stopped");
  const [metrics] = useState({
    totalAgents: 0,
    activeTasks: 0,
    tokensBurned: 0,
    costUsd: 0,
    uptime: 0,
  });

  useLayoutEffect(() => {
    setEnd(
      <div className="flex items-center gap-2">
        <button
          className={cn(
            "px-3 py-1.5 rounded text-sm font-medium transition-colors",
            colonyStatus === "running"
              ? "bg-destructive/20 text-destructive hover:bg-destructive/30"
              : "bg-success/20 text-success hover:bg-success/30"
          )}
          onClick={toggleColony}
          disabled={colonyStatus === "starting"}
        >
          {colonyStatus === "running" ? (
            <>
              <Pause className="size-3.5 mr-1" />
              Stop Colony
            </>
          ) : colonyStatus === "starting" ? (
            <>
              <Loader2 className="size-3.5 mr-1 animate-spin" />
              Starting...
            </>
          ) : (
            <>
              <Play className="size-3.5 mr-1" />
              Start Colony
            </>
          )}
        </button>
      </div>
    );
    return () => setEnd(null);
  }, [setEnd, colonyStatus]);

  const toggleColony = async () => {
    if (colonyStatus === "running") {
      setColonyStatus("stopped");
    } else {
      setColonyStatus("starting");
      setTimeout(() => setColonyStatus("running"), 1500);
    }
  };

  const tabs = [
    { id: "overview", label: "Mission Control", icon: Activity },
    { id: "kanban", label: "Kanban", icon: GitBranch },
    { id: "slots", label: "Slots", icon: Users },
    { id: "replays", label: "Replays", icon: RotateCw },
    { id: "skills", label: "Skills", icon: Package },
    { id: "planning", label: "Planning", icon: BookOpen },
    { id: "agent-web", label: "Agent Web", icon: Globe },
    { id: "settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className={cn("flex min-h-0 w-full min-w-0 flex-1 flex-col", "pt-1 sm:pt-2")}>
      <PluginSlot name="colony:top" />

      {/* Header with colony status */}
      <div className="flex flex-col gap-4 p-4 sm:p-6 border-b border-current/10">
        <div className="flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-midground">
              Corvus OS Colony
            </h1>
            <p className="text-text-secondary mt-1">
              Local-first multi-agent operating system — orchestrate, delegate, observe
            </p>
          </div>
          <div className="flex items-center gap-3">
            <div
              className={cn(
                "w-3 h-3 rounded-full",
                colonyStatus === "running" && "bg-success animate-pulse",
                colonyStatus === "stopped" && "bg-muted",
                colonyStatus === "starting" && "bg-warning animate-bounce",
                colonyStatus === "error" && "bg-destructive"
              )}
            />
            <span
              className={cn(
                "text-sm font-medium px-2 py-1 rounded-full",
                colonyStatus === "running" && "bg-success/20 text-success",
                colonyStatus === "stopped" && "bg-muted/20 text-text-secondary",
                colonyStatus === "starting" && "bg-warning/20 text-warning",
                colonyStatus === "error" && "bg-destructive/20 text-destructive"
              )}
            >
              {colonyStatus === "running" ? "Active" : colonyStatus === "stopped" ? "Idle" : colonyStatus === "starting" ? "Starting..." : "Error"}
            </span>
          </div>
        </div>

        {/* Quick metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <MetricCard label="Agents" value={metrics.totalAgents} icon={Users} trend="+2" />
          <MetricCard label="Active Tasks" value={metrics.activeTasks} icon={Activity} trend="+1" />
          <MetricCard label="Tokens" value={formatNumber(metrics.tokensBurned)} icon={Zap} trend="+1.2k" />
          <MetricCard label="Cost" value={`$${metrics.costUsd.toFixed(2)}`} icon={DollarSign} trend="+$0.04" />
        </div>
      </div>

      {/* Tab navigation */}
      <div className="flex flex-wrap gap-1 px-4 pb-2 border-b border-current/10">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={cn(
              "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all",
              "border border-transparent",
              activeTab === tab.id
                ? "bg-midground/20 text-midground border-midground/30 shadow-[0_0_0_1px_var(--midground)]"
                : "text-text-secondary hover:text-midground hover:bg-current/5"
            )}
          >
            <tab.icon className="size-4" />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div className="flex-1 min-h-0 overflow-hidden p-4">
        {activeTab === "overview" && <OverviewTab />}
        {activeTab === "kanban" && <KanbanTab />}
        {activeTab === "slots" && <SlotsTab />}
        {activeTab === "replays" && <ReplaysTab />}
        {activeTab === "skills" && <SkillsTab />}
        {activeTab === "planning" && <PlanningTab />}
        {activeTab === "agent-web" && <AgentWebTab />}
        {activeTab === "settings" && <ColonySettingsTab />}
      </div>

      <PluginSlot name="colony:bottom" />
    </div>
  );
}

// Metric Card Component
function MetricCard({ label, value, icon: Icon, trend }: { label: string; value: string | number; icon: React.ComponentType<any>; trend: string }) {
  return (
    <div className="p-4 rounded-xl bg-current/5 border border-current/10">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-text-secondary text-xs font-medium uppercase tracking-wide">{label}</p>
          <p className="text-2xl font-bold text-midground mt-1">{value}</p>
        </div>
        <div className="p-2 rounded-lg bg-midground/10">
          <Icon className="size-5 text-midground" />
        </div>
      </div>
      <p className="text-xs text-success mt-2 flex items-center gap-1">
        <RotateCw className="size-3" />
        {trend} (24h)
      </p>
    </div>
  );
}

// Overview Tab - Mission Control Canvas
function OverviewTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [animationId, setAnimationId] = useState<number | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;
    const rect = canvas.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    ctx.scale(dpr, dpr);

    // Particle system for background
    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
      alpha: number;
      life?: number;
      maxLife?: number;
    }

    const particles = Array.from({ length: 200 }, (): Particle => ({
      x: Math.random() * rect.width,
      y: Math.random() * rect.height,
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 2 + 0.5,
      alpha: Math.random() * 0.5 + 0.1,
    }));

    // Agent nodes (orchestrator + 8 slots)
    const agents = [
      { id: "orchestrator", x: rect.width / 2, y: rect.height / 2, r: 35, type: "orchestrator", label: "Orchestrator", status: "active" },
      { id: "builder", x: rect.width / 2 - 180, y: rect.height / 2 - 120, r: 25, type: "agent", label: "Builder", status: "active" },
      { id: "researcher", x: rect.width / 2 + 180, y: rect.height / 2 - 120, r: 25, type: "agent", label: "Researcher", status: "idle" },
      { id: "devops", x: rect.width / 2 - 180, y: rect.height / 2 + 120, r: 25, type: "agent", label: "DevOps", status: "active" },
      { id: "designer", x: rect.width / 2 + 180, y: rect.height / 2 + 120, r: 25, type: "agent", label: "Designer", status: "idle" },
      { id: "data-ml", x: rect.width / 2 - 300, y: rect.height / 2, r: 25, type: "agent", label: "Data/ML", status: "idle" },
      { id: "code-reviewer", x: rect.width / 2 + 300, y: rect.height / 2, r: 25, type: "agent", label: "Code Review", status: "idle" },
      { id: "it-sysadmin", x: rect.width / 2, y: rect.height / 2 - 240, r: 25, type: "agent", label: "IT/SysAdmin", status: "idle" },
    ];

    // Task nodes
    const tasks = [
      { x: rect.width / 2 - 300, y: rect.height / 2 - 200, r: 12, label: "Auth Research" },
      { x: rect.width / 2 + 300, y: rect.height / 2 - 200, r: 12, label: "Deploy Config" },
      { x: rect.width / 2 - 300, y: rect.height / 2 + 200, r: 12, label: "Test Suite" },
      { x: rect.width / 2 + 300, y: rect.height / 2 + 200, r: 12, label: "Code Review" },
    ];

    let time = 0;

    const animate = () => {
      ctx.clearRect(0, 0, rect.width, rect.height);

      // Draw quantum field particles
      particles.forEach((p) => {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < 0) p.x = rect.width;
        if (p.x > rect.width) p.x = 0;
        if (p.y < 0) p.y = rect.height;
        if (p.y > rect.height) p.y = 0;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 180, 216, ${p.alpha})`;
        ctx.fill();
      });

      // Draw delegation vines (connections)
      agents.forEach((agent) => {
        if (agent.id !== "orchestrator") {
          const orch = agents.find((a) => a.id === "orchestrator");
          if (orch) {
            // Bezier curve with pulse
            const pulseOffset = Math.sin(time * 0.003) * 3;
            ctx.beginPath();
            ctx.moveTo(orch.x, orch.y);
            ctx.bezierCurveTo(
              orch.x + (agent.x - orch.x) * 0.3 + pulseOffset,
              orch.y + (agent.y - orch.y) * 0.3,
              orch.x + (agent.x - orch.x) * 0.7 - pulseOffset,
              orch.y + (agent.y - orch.y) * 0.7,
              agent.x,
              agent.y
            );
            ctx.strokeStyle = `rgba(0, 180, 216, ${agent.status === "active" ? 0.6 : 0.2})`;
            ctx.lineWidth = agent.status === "active" ? 2 : 1;
            ctx.stroke();

            // Pulse particles along vine
            if (agent.status === "active" && Math.random() < 0.02) {
              const t = Math.random();
              const px = Math.pow(1 - t, 3) * orch.x + 3 * Math.pow(1 - t, 2) * t * (orch.x + (agent.x - orch.x) * 0.3) + 3 * (1 - t) * Math.pow(t, 2) * (orch.x + (agent.x - orch.x) * 0.7) + Math.pow(t, 3) * agent.x;
              const py = Math.pow(1 - t, 3) * orch.y + 3 * Math.pow(1 - t, 2) * t * (orch.y + (agent.y - orch.y) * 0.3) + 3 * (1 - t) * Math.pow(t, 2) * (orch.y + (agent.y - orch.y) * 0.7) + Math.pow(t, 3) * agent.y;
              particles.push({
                x: px,
                y: py,
                vx: (Math.random() - 0.5) * 1,
                vy: (Math.random() - 0.5) * 1,
                size: 3,
                alpha: 0.8,
                life: 30,
              });
            }
          }
        }
      });

      // Draw task nodes
      tasks.forEach((task) => {
        ctx.beginPath();
        ctx.arc(task.x, task.y, task.r, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(245, 158, 11, 0.3)";
        ctx.fill();
        ctx.strokeStyle = "#f59e0b";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Label
        ctx.font = "10px Inter, sans-serif";
        ctx.fillStyle = "#f59e0b";
        ctx.textAlign = "center";
        ctx.fillText(task.label, task.x, task.y - task.r - 8);
      });

      // Draw agent nodes
      agents.forEach((agent) => {
        // Membrane (breathing)
        const breath = Math.sin(time * 0.001) * 3;
        ctx.beginPath();
        ctx.arc(agent.x, agent.y, agent.r + 12 + breath, 0, Math.PI * 2);
        ctx.fillStyle = agent.status === "active" ? "rgba(0, 180, 216, 0.08)" : "rgba(113, 113, 138, 0.08)";
        ctx.fill();
        ctx.strokeStyle = agent.status === "active" ? "rgba(0, 180, 216, 0.3)" : "rgba(113, 113, 138, 0.3)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Core
        ctx.beginPath();
        ctx.arc(agent.x, agent.y, agent.r, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(agent.x - 5, agent.y - 5, 0, agent.x, agent.y, agent.r);
        if (agent.type === "orchestrator") {
          gradient.addColorStop(0, "#00b4d8");
          gradient.addColorStop(1, "#0096c7");
        } else {
          gradient.addColorStop(0, agent.status === "active" ? "#00b4d8" : "#71717a");
          gradient.addColorStop(1, agent.status === "active" ? "#0096c7" : "#52525b");
        }
        ctx.fillStyle = gradient;
        ctx.fill();

        // Status ring
        if (agent.status === "active") {
          ctx.beginPath();
          ctx.arc(agent.x, agent.y, agent.r + 4, 0, Math.PI * 2);
          ctx.strokeStyle = "#00b4d8";
          ctx.lineWidth = 2;
          ctx.setLineDash([8, 4]);
          ctx.lineDashOffset = -time * 0.05;
          ctx.stroke();
          ctx.setLineDash([]);
        }

        // Label
        ctx.font = "11px Inter, sans-serif";
        ctx.fillStyle = "#e4e4e7";
        ctx.textAlign = "center";
        ctx.fillText(agent.label, agent.x, agent.y + agent.r + 20);
      });

      // Clean up old particles
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        if (p.life !== undefined && p.life !== null) {
          p.life--;
          p.alpha = (p.life / (p.maxLife || 30)) * 0.8;
          if (p.life <= 0) {
            particles.splice(i, 1);
          }
        }
      }

      time += 16;
      setAnimationId(requestAnimationFrame(animate));
    };

    animate();

    return () => {
      if (animationId) cancelAnimationFrame(animationId);
    };
  }, [animationId]);

  return (
    <div className="h-full w-full flex flex-col">
      <div className="flex-1 relative rounded-xl bg-base bg-elevated/50 border border-current/10 overflow-hidden">
        <canvas ref={canvasRef} className="w-full h-full" />
        <div className="absolute bottom-4 right-4 flex gap-2">
          <button className="px-3 py-1.5 bg-base/80 backdrop-blur rounded-lg border border-current/10 text-sm text-text-secondary hover:text-midground flex items-center gap-1">
            <Zap className="size-3.5" />
            Physics: ON
          </button>
          <button className="px-3 py-1.5 bg-base/80 backdrop-blur rounded-lg border border-current/10 text-sm text-text-secondary hover:text-midground flex items-center gap-1">
            <Layers className="size-3.5" />
            Traces: ON
          </button>
        </div>
      </div>

      {/* Live tool stream panel */}
      <div className="mt-4 h-48 rounded-xl bg-base bg-elevated/50 border border-current/10 overflow-hidden">
        <div className="p-3 border-b border-current/10 flex items-center justify-between">
          <h3 className="font-medium text-midground flex items-center gap-2">
            <Terminal className="size-4" />
            Live Tool Stream
          </h3>
          <span className="text-xs text-text-secondary">Last 50 calls</span>
        </div>
        <div className="p-3 h-[calc(100%-44px)] overflow-y-auto font-mono text-xs text-text-secondary space-y-1">
          <ToolStreamItem agent="orchestrator" tool="delegate_task" args="{goal: 'Build auth', slot: 'builder'}" duration="245ms" cost="$0.002" />
          <ToolStreamItem agent="builder" tool="write_file" args="{path: 'auth.tsx'}" duration="12ms" cost="$0.0001" />
          <ToolStreamItem agent="researcher" tool="web_search" args="{query: 'Supabase auth patterns'}" duration="890ms" cost="$0.001" />
          <ToolStreamItem agent="builder" tool="terminal" args="{cmd: 'npm test'}" duration="3.2s" cost="$0.005" />
          <ToolStreamItem agent="devops" tool="cloudflare_deploy" args="{project: 'auth-dashboard'}" duration="45s" cost="$0.02" />
        </div>
      </div>
    </div>
  );
}

function ToolStreamItem({ agent, tool, args, duration, cost }: { agent: string; tool: string; args: string; duration: string; cost: string }) {
  const agentColors: Record<string, string> = {
    orchestrator: "#00b4d8",
    builder: "#10a37f",
    researcher: "#f59e0b",
    devops: "#d97757",
    designer: "#8b5cf6",
    "data-ml": "#6366f1",
    "code-reviewer": "#ef4444",
    "it-sysadmin": "#06b6d4",
  };

  return (
    <div className="flex items-start gap-2 text-text-secondary hover:text-text-primary transition-colors">
      <span className="w-24 text-xs font-medium" style={{ color: agentColors[agent] || "#71717a" }}>
        {agent}
      </span>
      <span className="text-text-secondary/60">→</span>
      <span className="font-medium text-text-primary">{tool}</span>
      <span className="text-text-secondary/50">{args}</span>
      <span className="ml-auto text-xs text-text-secondary/60 flex items-center gap-2">
        <span>{duration}</span>
        <span className="text-warning">{cost}</span>
      </span>
    </div>
  );
}

// Kanban Tab
function KanbanTab() {
  const columns = [
    { id: "backlog", label: "Backlog", color: "#71717a" },
    { id: "ready", label: "Ready", color: "#3b82f6" },
    { id: "in_progress", label: "In Progress", color: "#f59e0b" },
    { id: "review", label: "Review", color: "#8b5cf6" },
    { id: "done", label: "Done", color: "#00b4d8" },
  ];

  const tasks = [
    { id: "1", title: "Research Supabase auth", column: "ready", assignee: "researcher", priority: "high" },
    { id: "2", title: "Implement login form", column: "in_progress", assignee: "builder", priority: "high" },
    { id: "3", title: "Configure Cloudflare deploy", column: "in_progress", assignee: "devops", priority: "medium" },
    { id: "4", title: "Write integration tests", column: "backlog", assignee: "builder", priority: "medium" },
    { id: "5", title: "Code review auth flow", column: "review", assignee: "code-reviewer", priority: "high" },
    { id: "6", title: "Deploy to staging", column: "done", assignee: "devops", priority: "low" },
  ];

  return (
    <div className="h-full flex gap-4 overflow-x-auto pb-4 px-2">
      {columns.map((col) => (
        <div key={col.id} className="min-w-[280px] max-w-[320px] flex-1 flex-col">
          <div className="flex items-center justify-between p-3 rounded-t-xl" style={{ background: `${col.color}20` }}>
            <h3 className="font-semibold text-sm" style={{ color: col.color }}>{col.label}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-current/10 text-text-secondary">
              {tasks.filter((t) => t.column === col.id).length}
            </span>
          </div>
          <div className="flex-1 flex flex-col gap-2 p-3 overflow-y-auto" style={{ background: `linear-gradient(180deg, ${col.color}08 0%, transparent 100%)` }}>
            {tasks.filter((t) => t.column === col.id).map((task) => (
              <KanbanCard key={task.id} task={task} />
            ))}
            <div className="mt-auto pt-2 border-t border-current/10">
              <button className="w-full py-2 text-sm text-text-secondary hover:text-midground flex items-center justify-center gap-1">
                <Plus className="size-4" />
                Add task
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function KanbanCard({ task }: { task: any }) {
  const priorityColors = { low: "#71717a", medium: "#3b82f6", high: "#f59e0b", critical: "#ef4444" };
  return (
    <div className="p-3 rounded-lg border border-current/10 bg-base hover:border-current/20 transition-colors cursor-pointer">
      <div className="flex items-start justify-between gap-2">
        <h4 className="text-sm font-medium text-text-primary flex-1 pr-2">{task.title}</h4>
        <span className="text-xs px-1.5 py-0.5 rounded" style={{ background: `${priorityColors[task.priority as keyof typeof priorityColors]}20`, color: priorityColors[task.priority as keyof typeof priorityColors] }}>
          {task.priority}
        </span>
      </div>
      <div className="mt-2 flex items-center gap-2">
        <div className="w-5 h-5 rounded-full bg-midground/20 flex items-center justify-center text-xs font-medium text-midground">
          {task.assignee.charAt(0).toUpperCase()}
        </div>
        <span className="text-xs text-text-secondary">{task.assignee}</span>
      </div>
    </div>
  );
}

// Slots Tab
function SlotsTab() {
  const slotData = [
    { name: "orchestrator", role: "Plans, delegates, monitors", status: "active", budget: "$0.00 / ∞", tokens: "12.4k", skills: 4, governance: true },
    { name: "builder", role: "Writes, tests, deploys code", status: "active", budget: "$8.50 / $10.00", tokens: "45.2k", skills: 8, governance: true },
    { name: "researcher", role: "Deep research, cited findings", status: "idle", budget: "$0.00 / $5.00", tokens: "3.1k", skills: 6, governance: true },
    { name: "devops", role: "Infra, deploy, SSH mesh", status: "active", budget: "$12.30 / $15.00", tokens: "28.7k", skills: 5, governance: true },
    { name: "it-sysadmin", role: "Servers, networks, monitoring", status: "idle", budget: "$0.00 / ∞", tokens: "0", skills: 4, governance: false },
    { name: "designer", role: "UI, diagrams, visual assets", status: "idle", budget: "$0.00 / ∞", tokens: "0", skills: 5, governance: false },
    { name: "data-ml", role: "Notebooks, training, eval", status: "idle", budget: "$0.00 / ∞", tokens: "0", skills: 4, governance: false },
    { name: "code-reviewer", role: "Security audit, quality gates", status: "idle", budget: "$0.00 / ∞", tokens: "0", skills: 5, governance: true },
  ];

  return (
    <div className="h-full grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 p-2">
      {slotData.map((slot) => (
        <SlotCard key={slot.name} slot={slot} />
      ))}
    </div>
  );
}

function SlotCard({ slot }: { slot: any }) {
  const budgetParts = slot.budget.split(" / ");
  const spent = parseFloat(budgetParts[0].replace("$", ""));
  const limit = budgetParts[1] === "∞" ? 100 : parseFloat(budgetParts[1].replace("$", ""));
  const pct = limit === 100 ? 0 : Math.min(100, (spent / limit) * 100);

  return (
    <div className="p-4 rounded-xl bg-base bg-elevated/50 border border-current/10 hover:border-current/20 transition-colors flex flex-col">
      <div className="flex items-start justify-between mb-3">
        <div>
          <h3 className="font-semibold text-midground capitalize">{slot.name}</h3>
          <p className="text-xs text-text-secondary mt-0.5">{slot.role}</p>
        </div>
        <div
          className={cn(
            "w-2.5 h-2.5 rounded-full",
            slot.status === "active" && "bg-success animate-pulse",
            slot.status === "idle" && "bg-muted"
          )}
        />
      </div>

      <div className="space-y-3 flex-1">
        <div>
          <div className="flex justify-between text-xs mb-1">
            <span className="text-text-secondary">Budget</span>
            <span className="font-medium text-text-primary">{slot.budget}</span>
          </div>
          <div className="h-1.5 rounded-full bg-current/10 overflow-hidden">
            <div
              className="h-full rounded-full transition-all"
              style={{ width: `${pct}%`, background: pct > 80 ? "#ef4444" : pct > 50 ? "#f59e0b" : "#00b4d8" }}
            />
          </div>
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-text-secondary">Tokens</span>
          <span className="font-medium text-text-primary font-mono">{slot.tokens}</span>
        </div>

        <div className="flex justify-between text-xs">
          <span className="text-text-secondary">Skills</span>
          <span className="font-medium text-text-primary">{slot.skills}</span>
        </div>

        <div className="flex items-center justify-between">
          <span className="text-xs text-text-secondary">Governance</span>
          <span className={cn("text-xs font-medium px-2 py-0.5 rounded-full", slot.governance ? "bg-success/20 text-success" : "bg-muted/20 text-text-secondary")}>
            {slot.governance ? "ON" : "OFF"}
          </span>
        </div>
      </div>

      <div className="mt-4 pt-3 border-t border-current/10 flex gap-2">
        <button className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-midground/10 text-midground hover:bg-midground/20 transition-colors">
          Configure
        </button>
        <button className="flex-1 py-1.5 text-xs font-medium rounded-lg bg-current/10 text-text-secondary hover:bg-current/20 transition-colors">
          Run Task
        </button>
      </div>
    </div>
  );
}

// Replays Tab
function ReplaysTab() {
  const replayData = [
    { id: "run-001", goal: "Build auth dashboard", date: "2026-10-03", slots: ["builder", "researcher", "devops"], tokens: 89420, cost: 0.42, steps: 47, status: "completed" },
    { id: "run-002", goal: "Deploy to Cloudflare", date: "2026-10-03", slots: ["devops"], tokens: 12340, cost: 0.08, steps: 8, status: "completed" },
    { id: "run-003", goal: "Research auth patterns", date: "2026-10-02", slots: ["researcher"], tokens: 34560, cost: 0.15, steps: 12, status: "completed" },
    { id: "run-004", goal: "Fix failing tests", date: "2026-10-02", slots: ["builder", "code-reviewer"], tokens: 56780, cost: 0.28, steps: 23, status: "failed" },
  ];

  return (
    <div className="h-full overflow-y-auto">
      <div className="space-y-3">
        {replayData.map((replay) => (
          <ReplayCard key={replay.id} replay={replay} />
        ))}
      </div>
    </div>
  );
}

function ReplayCard({ replay }: { replay: any }) {
  return (
    <div className="p-4 rounded-xl bg-base bg-elevated/50 border border-current/10 hover:border-current/20 transition-colors">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-2">
            <h4 className="font-medium text-text-primary">{replay.goal}</h4>
            <span className={cn("text-xs px-2 py-0.5 rounded-full", replay.status === "completed" ? "bg-success/20 text-success" : "bg-destructive/20 text-destructive")}>
              {replay.status}
            </span>
            <span className="text-xs text-text-secondary">{replay.date}</span>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-text-secondary">
            <span className="flex items-center gap-1"><Users className="size-3.5" /> {replay.slots.length} slots</span>
            <span className="flex items-center gap-1"><Zap className="size-3.5" /> {formatNumber(replay.tokens)} tokens</span>
            <span className="flex items-center gap-1"><DollarSign className="size-3.5" /> ${replay.cost.toFixed(2)}</span>
            <span className="flex items-center gap-1"><FileText className="size-3.5" /> {replay.steps} steps</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg bg-current/10 text-text-secondary hover:bg-current/20 hover:text-midground transition-colors" title="View replay">
            <Eye className="size-4" />
          </button>
          <button className="p-2 rounded-lg bg-current/10 text-text-secondary hover:bg-current/20 hover:text-midground transition-colors" title="Fork from step">
            <GitBranch className="size-4" />
          </button>
          <button className="p-2 rounded-lg bg-current/10 text-text-secondary hover:bg-current/20 hover:text-midground transition-colors" title="Export">
            <Download className="size-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

// Skills Tab
function SkillsTab() {
  const [filter, setFilter] = useState("");
  const [category, setCategory] = useState("all");

  const skills = [
    { name: "github", category: "development", description: "GitHub via gh CLI: PRs, issues, reviews", installed: true },
    { name: "test-driven-development", category: "development", description: "TDD: enforce RED-GREEN-REFACTOR", installed: true },
    { name: "requesting-code-review", category: "development", description: "Pre-commit review: security scan, quality gates", installed: true },
    { name: "web-search", category: "research", description: "Search the web for information", installed: true },
    { name: "arxiv", category: "research", description: "Search arXiv papers", installed: true },
    { name: "competitor-news-monitor", category: "research", description: "Watch companies for material news", installed: false },
    { name: "architecture-diagram", category: "creative", description: "Dark-themed SVG architecture diagrams", installed: true },
    { name: "excalidraw", category: "creative", description: "Hand-drawn Excalidraw diagrams", installed: false },
    { name: "docker-management", category: "devops", description: "Docker containers, compose, swarm", installed: true },
    { name: "cloudflare-temporary-deploy", category: "devops", description: "Cloudflare Pages temporary deploys", installed: true },
    { name: "systematic-debugging", category: "development", description: "4-phase root cause debugging", installed: true },
    { name: "spec-driven-incremental-implementation", category: "development", description: "Build from spec one verified step", installed: true },
  ];

  const categories = ["all", "development", "research", "creative", "devops", "productivity", "mlops"];

  return (
    <div className="h-full flex flex-col">
      <div className="flex flex-wrap gap-2 mb-4">
        <input
          type="text"
          placeholder="Search skills..."
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="flex-1 min-w-[200px] px-3 py-2 rounded-lg bg-base border border-current/10 text-text-primary placeholder-text-secondary focus:border-midground focus:outline-none"
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          className="px-3 py-2 rounded-lg bg-base border border-current/10 text-text-primary focus:border-midground focus:outline-none"
        >
          {categories.map((c) => (
            <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
          ))}
        </select>
      </div>

      <div className="flex-1 overflow-y-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {skills
          .filter((s) => (category === "all" || s.category === category) && s.name.toLowerCase().includes(filter.toLowerCase()))
          .map((skill) => (
            <SkillCard key={skill.name} skill={skill} />
          ))}
      </div>
    </div>
  );
}

function SkillCard({ skill }: { skill: any }) {
  return (
    <div className="p-4 rounded-xl bg-base bg-elevated/50 border border-current/10 hover:border-current/20 transition-colors">
      <div className="flex items-start justify-between mb-2">
        <h4 className="font-medium text-text-primary capitalize">{skill.name.replace(/-/g, " ")}</h4>
        <span className={cn("text-xs px-2 py-0.5 rounded-full capitalize", skill.installed ? "bg-success/20 text-success" : "bg-muted/20 text-text-secondary")}>
          {skill.installed ? "installed" : "available"}
        </span>
      </div>
      <p className="text-sm text-text-secondary mb-3">{skill.description}</p>
      <div className="flex items-center justify-between">
        <span className="text-xs text-text-secondary uppercase tracking-wide">{skill.category}</span>
        <button
          className={cn("px-3 py-1 text-xs font-medium rounded-lg transition-colors", skill.installed ? "bg-current/10 text-text-secondary hover:bg-current/20" : "bg-midground/10 text-midground hover:bg-midground/20")}
        >
          {skill.installed ? "Remove" : "Add to Slot"}
        </button>
      </div>
    </div>
  );
}

// Planning Tab
function PlanningTab() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 rounded-xl bg-base bg-elevated/50 border border-current/10 flex items-center justify-center">
        <div className="text-center p-8">
          <BookOpen className="size-12 text-text-secondary/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">Planning Workspace</h3>
          <p className="text-text-secondary max-w-md mx-auto">
            Interactive whiteboard with mind-mapping, spec writing, and task decomposition. Coming in Phase 9.2.
          </p>
        </div>
      </div>
    </div>
  );
}

// Agent Web Tab
function AgentWebTab() {
  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 rounded-xl bg-base bg-elevated/50 border border-current/10 flex items-center justify-center">
        <div className="text-center p-8">
          <Globe className="size-12 text-text-secondary/50 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-text-primary mb-2">Agent Web — Living Memory Graph</h3>
          <p className="text-text-secondary max-w-md mx-auto">
            Force-directed graph of concepts, findings, decisions, and artifacts. Auto-updated by all agents. Coming in Phase 9.3.
          </p>
        </div>
      </div>
    </div>
  );
}

// Colony Settings Tab
function ColonySettingsTab() {
  return (
    <div className="h-full overflow-y-auto space-y-6 p-2">
      <section className="rounded-xl bg-base bg-elevated/50 border border-current/10 p-6">
        <h3 className="font-medium text-midground mb-4 flex items-center gap-2">
          <Settings className="size-5" />
          Colony Configuration
        </h3>
        <div className="space-y-4">
          <SettingRow label="Workspace Path" value="~/aos-workspace" description="Shared workspace for all agents" />
          <SettingRow label="Max Concurrent Agents" value="8" description="Global concurrency limit" />
          <SettingRow label="Queue Policy" value="wait" description="wait | reject | queue" />
          <SettingRow label="Health Check Interval" value="30s" description="Daemon health monitoring" />
          <SettingRow label="Event Retention" value="30 days" description="How long to keep event logs" />
        </div>
      </section>

      <section className="rounded-xl bg-base bg-elevated/50 border border-current/10 p-6">
        <h3 className="font-medium text-midground mb-4 flex items-center gap-2">
          <Shield className="size-5" />
          Governance
        </h3>
        <div className="space-y-4">
          <SettingRow label="Enabled" value="Yes" description="SecurityBus → PolicyEngine → CapabilityRegistry" />
          <SettingRow label="Policy Engine" value="Rule-based" description="rule-based | llm-based" />
          <SettingRow label="Default Deny" value="Yes" description="Fail-closed by default" />
          <SettingRow label="Approval Required For" value="shell_exec:sudo, deploy:*, git:push:production" description="High-risk operations" />
        </div>
      </section>

      <section className="rounded-xl bg-base bg-elevated/50 border border-current/10 p-6">
        <h3 className="font-medium text-midground mb-4 flex items-center gap-2">
          <Network className="size-5" />
          Model Routing
        </h3>
        <div className="space-y-4">
          <SettingRow label="Default Provider" value="NVIDIA NIM" description="Primary: nemotron-3-ultra-550b-a55b" />
          <SettingRow label="Fallback Chain" value="NIM → NIM Backup → OpenRouter → Groq → Gemini → Codex" description="Auto on 429/5xx" />
          <SettingRow label="Cost Aware" value="Yes" description="Track per-slot token costs" />
          <SettingRow label="Prefer Local" value="Yes" description="Ollama/llama.cpp when available" />
        </div>
      </section>
    </div>
  );
}

function SettingRow({ label, value, description }: { label: string; value: string; description: string }) {
  return (
    <div className="flex items-center justify-between gap-4 p-3 rounded-lg bg-current/5">
      <div>
        <p className="font-medium text-text-primary">{label}</p>
        <p className="text-xs text-text-secondary">{description}</p>
      </div>
      <div className="flex items-center gap-2">
        <span className="font-mono text-sm text-midground bg-base px-2 py-1 rounded border border-current/10">{value}</span>
        <button className="p-1.5 rounded text-text-secondary hover:text-midground hover:bg-current/10 transition-colors">
          <Edit className="size-4" />
        </button>
      </div>
    </div>
  );
}

function formatNumber(num: number): string {
  if (num >= 1000000) return (num / 1000000).toFixed(1) + "M";
  if (num >= 1000) return (num / 1000).toFixed(1) + "k";
  return num.toString();
}