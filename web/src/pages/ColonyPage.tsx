import { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";
import { PluginSlot } from "@/plugins";
import { Users, Zap, GitBranch, Activity, Settings, RotateCw, Download, Eye, Edit, Network, Terminal, Layers, Globe, BookOpen, Shield, Plus, FileText, Package, X, TrendingUp, History, Code, Waves, Cpu, HardDrive, BarChart3 } from "lucide-react";

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
  const [activeTab, setActiveTab] = useState<"overview" | "kanban" | "slots" | "replays" | "skills" | "settings" | "planning" | "agent-web" | "resources">("overview");
  const [colonyStatus, setColonyStatus] = useState<"running" | "stopped" | "starting" | "error">("stopped");
  const [agentMetrics, setAgentMetrics] = useState<Record<string, any>>({});
  const [systemMetrics, setSystemMetrics] = useState({ memory: 0, cpu: 0 });
  const [kanbanColumns, setKanbanColumns] = useState<Record<string, any[]>>({});
  const [governanceEvents, setGovernanceEvents] = useState<any[]>([]);
  const [toolStream, setToolStream] = useState<any[]>([]);
  const [metrics] = useState({
    totalAgents: 0,
    activeTasks: 0,
    tokensBurned: 0,
    costUsd: 0,
    uptime: 0,
  });
  const [selectedSlot, setSelectedSlot] = useState<any | null>(null);

  // WebSocket connection effect
  useEffect(() => {
    let ws: WebSocket | null = null;
    let reconnectTimer: NodeJS.Timeout;

    const connect = () => {
      try {
        ws = new WebSocket("ws://127.0.0.1:8765");
        ws.onopen = () => {
          console.log("Colony WebSocket connected");
        };
        ws.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            if (data.type === "snapshot") {
              setAgentMetrics(data.agents || {});
              setSystemMetrics(data.system || { memory_usage: 0, cpu_usage: 0 });
              if (data.colony_status) {
                setColonyStatus(data.colony_status);
              }
              if (data.kanban) {
                setKanbanColumns(data.kanban);
              }
              if (data.governance) {
                setGovernanceEvents(data.governance);
              }
              if (data.tool_stream) {
                setToolStream(data.tool_stream);
              }
            }
          } catch (e) {
            console.error("WS message parse error:", e);
          }
        };
        ws.onclose = () => {
          console.log("Colony WebSocket disconnected, reconnecting...");
          reconnectTimer = setTimeout(connect, 3000);
        };
        ws.onerror = (err) => {
          console.error("Colony WebSocket error:", err);
        };
      } catch (e) {
        console.error("WebSocket connection failed:", e);
      }
    };

    connect();

    return () => {
      if (ws) ws.close();
      if (reconnectTimer) clearTimeout(reconnectTimer);
    };
  }, []);

  const tabs = [
    { id: "overview", label: "Mission Control", icon: Activity },
    { id: "kanban", label: "Kanban", icon: GitBranch },
    { id: "slots", label: "Slots", icon: Users },
    { id: "replays", label: "Replays", icon: RotateCw },
    { id: "skills", label: "Skills", icon: Package },
    { id: "planning", label: "Planning", icon: BookOpen },
    { id: "agent-web", label: "Agent Web", icon: Globe },
    { id: "resources", label: "Resources", icon: Waves },
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
        {activeTab === "overview" && <OverviewTab agentMetrics={agentMetrics} toolStream={toolStream} />}
        {activeTab === "kanban" && <KanbanTab kanbanColumns={kanbanColumns} />}
        {activeTab === "slots" && <SlotsTab setSelectedSlot={setSelectedSlot} />}
        {activeTab === "replays" && <ReplaysTab />}
        {activeTab === "skills" && <SkillsTab />}
        {activeTab === "planning" && <PlanningTab />}
        {activeTab === "agent-web" && <AgentWebTab />}
        {activeTab === "resources" && <ResourcesTab systemMetrics={systemMetrics} agentMetrics={agentMetrics} />}
        {activeTab === "settings" && <ColonySettingsTab />}
      </div>

      <PluginSlot name="colony:bottom" />
      <SlotDrawer slot={selectedSlot} isOpen={!!selectedSlot} onClose={() => setSelectedSlot(null)} />
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

// Overview Tab - Mission Control Canvas (WebSocket-driven)
function OverviewTab({ agentMetrics, toolStream }: { agentMetrics: Record<string, any>; toolStream: any[] }) {
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

    // Agent nodes from WebSocket, fallback to defaults
    const defaultPositions: Record<string, { x: number; y: number }> = {
      orchestrator: { x: rect.width / 2, y: rect.height / 2 },
      builder: { x: rect.width / 2 - 180, y: rect.height / 2 - 120 },
      researcher: { x: rect.width / 2 + 180, y: rect.height / 2 - 120 },
      devops: { x: rect.width / 2 - 180, y: rect.height / 2 + 120 },
      designer: { x: rect.width / 2 + 180, y: rect.height / 2 + 120 },
      "data-ml": { x: rect.width / 2 - 300, y: rect.height / 2 },
      "code-reviewer": { x: rect.width / 2 + 300, y: rect.height / 2 },
      "it-sysadmin": { x: rect.width / 2, y: rect.height / 2 - 240 },
    };

    const agentNames = [
      "orchestrator",
      "builder",
      "researcher",
      "devops",
      "designer",
      "data-ml",
      "code-reviewer",
      "it-sysadmin",
    ];

    const agents = agentNames.map((name) => {
      const wsMetrics = agentMetrics[name];
      const pos = defaultPositions[name] || { x: rect.width / 2, y: rect.height / 2 };
      const status = wsMetrics?.status || "idle";
      const label = name.replace(/-/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());

      return {
        id: name,
        x: pos.x,
        y: pos.y,
        r: name === "orchestrator" ? 35 : 25,
        type: name === "orchestrator" ? "orchestrator" : "agent",
        label,
        status: status === "active" ? "active" : "idle",
        tokensPerSec: wsMetrics?.tokens_per_sec || 0,
        memoryMb: wsMetrics?.memory_mb || 0,
        cpuPercent: wsMetrics?.cpu_percent || 0,
      };
    });

    // Task nodes (from kanban data if available, else defaults)
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
        // Membrane (breathing) — pulse rate driven by token velocity
        const pulsePeriod = agent.tokensPerSec > 0 ? Math.max(200, 3000 - agent.tokensPerSec * 10) : 1000;
        const breath = Math.sin(time * (1000 / pulsePeriod) * 0.001) * 3;
        ctx.beginPath();
        ctx.arc(agent.x, agent.y, agent.r + 12 + breath, 0, Math.PI * 2);
        ctx.fillStyle = agent.status === "active" ? "rgba(0, 180, 216, 0.08)" : "rgba(113, 113, 138, 0.08)";
        ctx.fill();
        ctx.strokeStyle = agent.status === "active" ? "rgba(0, 180, 216, 0.3)" : "rgba(113, 113, 138, 0.3)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Core — color intensity from CPU usage
        ctx.beginPath();
        ctx.arc(agent.x, agent.y, agent.r, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(agent.x - 5, agent.y - 5, 0, agent.x, agent.y, agent.r);
        if (agent.type === "orchestrator") {
          gradient.addColorStop(0, "#00b4d8");
          gradient.addColorStop(1, "#0096c7");
        } else {
          const intensity = Math.min(1, (agent.cpuPercent / 100) + 0.5);
          const r = agent.status === "active" ? Math.floor(intensity * 255) : 113;
          const g = agent.status === "active" ? Math.floor(intensity * 216) : 113;
          const b = agent.status === "active" ? Math.floor(intensity * 255) : 138;
          gradient.addColorStop(0, `rgb(${r}, ${g}, ${b})`);
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

        // Token velocity indicator (for active agents)
        if (agent.tokensPerSec > 0) {
          ctx.font = "9px Inter, sans-serif";
          ctx.fillStyle = "#00b4d8";
          ctx.fillText(`${agent.tokensPerSec.toFixed(1)} t/s`, agent.x, agent.y + agent.r + 32);
        }
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
  }, [animationId, agentMetrics]);

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

      // Live tool stream panel
            <div className="mt-4 h-48 rounded-xl bg-base bg-elevated/50 border border-current/10 overflow-hidden">
              <div className="p-3 border-b border-current/10 flex items-center justify-between">
                <h3 className="font-medium text-midground flex items-center gap-2">
                  <Terminal className="size-4" />
                  Live Tool Stream
                </h3>
                <span className="text-xs text-text-secondary">Last 50 calls</span>
              </div>
              <div className="p-3 h-[calc(100%-44px)] overflow-y-auto font-mono text-xs text-text-secondary space-y-1">
                {toolStream.length > 0 ? toolStream.slice(-50).map((call, i) => (
                  <ToolStreamItem
                    key={i}
                    agent={call.agent}
                    tool={call.tool}
                    args={JSON.stringify(call.args || {})}
                    duration={call.duration || "?"}
                    cost={call.cost ? `$${call.cost}` : "$?"}
                  />
                )) : (
                  <>
                    <ToolStreamItem agent="orchestrator" tool="delegate_task" args="{goal: 'Build auth', slot: 'builder'}" duration="245ms" cost="$0.002" />
                    <ToolStreamItem agent="builder" tool="write_file" args="{path: 'auth.tsx'}" duration="12ms" cost="$0.0001" />
                    <ToolStreamItem agent="researcher" tool="web_search" args="{query: 'Supabase auth patterns'}" duration="890ms" cost="$0.001" />
                    <ToolStreamItem agent="builder" tool="terminal" args="{cmd: 'npm test'}" duration="3.2s" cost="$0.005" />
                    <ToolStreamItem agent="devops" tool="cloudflare_deploy" args="{project: 'auth-dashboard'}" duration="45s" cost="$0.02" />
                  </>
                )}
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

// Kanban Tab - WebSocket-driven
function KanbanTab({ kanbanColumns }: { kanbanColumns: Record<string, any[]> }) {
  const columns = [
    { id: "backlog", label: "Backlog", color: "#71717a" },
    { id: "ready", label: "Ready", color: "#3b82f6" },
    { id: "in_progress", label: "In Progress", color: "#f59e0b" },
    { id: "review", label: "Review", color: "#8b5cf6" },
    { id: "done", label: "Done", color: "#00b4d8" },
  ];

  // Use live kanban data from WebSocket, fallback to mock if empty
  const hasLiveData = Object.keys(kanbanColumns).length > 0 && Object.values(kanbanColumns).some(v => v.length > 0);
  
  return (
    <div className="h-full flex gap-4 overflow-x-auto pb-4 px-2">
      {columns.map((col) => (
        <div key={col.id} className="min-w-[280px] max-w-[320px] flex-1 flex-col">
          <div className="flex items-center justify-between p-3 rounded-t-xl" style={{ background: `${col.color}20` }}>
            <h3 className="font-semibold text-sm" style={{ color: col.color }}>{col.label}</h3>
            <span className="text-xs px-2 py-0.5 rounded-full bg-current/10 text-text-secondary">
              {hasLiveData 
                ? kanbanColumns[col.id]?.length || 0 
                : tasks.filter((t) => t.column === col.id).length}
            </span>
          </div>
          <div className="flex-1 flex flex-col gap-2 p-3 overflow-y-auto" style={{ background: `linear-gradient(180deg, ${col.color}08 0%, transparent 100%)` }}>
            {hasLiveData 
              ? (kanbanColumns[col.id] || []).map((task) => (
                  <KanbanCard key={task.id} task={task} />
                ))
              : tasks.filter((t) => t.column === col.id).map((task) => (
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

const tasks = [
  { id: "1", title: "Research Supabase auth", column: "ready", assignee: "researcher", priority: "high" },
  { id: "2", title: "Implement login form", column: "in_progress", assignee: "builder", priority: "high" },
  { id: "3", title: "Configure Cloudflare deploy", column: "in_progress", assignee: "devops", priority: "medium" },
  { id: "4", title: "Write integration tests", column: "backlog", assignee: "builder", priority: "medium" },
  { id: "5", title: "Code review auth flow", column: "review", assignee: "code-reviewer", priority: "high" },
  { id: "6", title: "Deploy to staging", column: "done", assignee: "devops", priority: "low" },
];

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
function SlotsTab({ setSelectedSlot }: { setSelectedSlot: (slot: any) => void }) {
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
        <SlotCard key={slot.name} slot={slot} onClick={() => setSelectedSlot(slot)} />
      ))}
    </div>
  );
}

function SlotCard({ slot, onClick }: { slot: any; onClick: () => void }) {
  const budgetParts = slot.budget.split(" / ");
  const spent = parseFloat(budgetParts[0].replace("$", ""));
  const limit = budgetParts[1] === "∞" ? 100 : parseFloat(budgetParts[1].replace("$", ""));
  const pct = limit === 100 ? 0 : Math.min(100, (spent / limit) * 100);

  return (
    <div
      className="p-4 rounded-xl bg-base bg-elevated/50 border border-current/10 hover:border-current/20 transition-colors flex flex-col cursor-pointer"
      onClick={onClick}
    >
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

// Resources Tab
function ResourcesTab({ systemMetrics, agentMetrics }: { systemMetrics: { memory: number; cpu: number }; agentMetrics: Record<string, any> }) {
  return (
    <div className="h-full overflow-y-auto space-y-6 p-2">
      {/* System Overview */}
      <section className="rounded-xl bg-base bg-elevated/50 border border-current/10 p-6">
        <h3 className="font-medium text-midground mb-4 flex items-center gap-2">
          <Waves className="size-5" />
          System Resources
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <ResourceCard
            label="Memory Usage"
            value={`${(systemMetrics.memory * 100).toFixed(1)}%`}
            icon={HardDrive}
            color="#00b4d8"
            trend={systemMetrics.memory > 0.8 ? "warning" : "normal"}
          />
          <ResourceCard
            label="CPU Usage"
            value={`${(systemMetrics.cpu * 100).toFixed(1)}%`}
            icon={Cpu}
            color="#f59e0b"
            trend={systemMetrics.cpu > 0.9 ? "warning" : "normal"}
          />
        </div>
      </section>

      {/* Per-Agent Resources */}
      <section className="rounded-xl bg-base bg-elevated/50 border border-current/10 p-6">
        <h3 className="font-medium text-midground mb-4 flex items-center gap-2">
          <Activity className="size-5" />
          Per-Agent Resources
        </h3>
        <div className="space-y-3">
          {Object.entries(agentMetrics).length === 0 ? (
            <div className="text-center p-8 text-text-secondary">
              <Cpu className="size-12 mx-auto mb-4 opacity-50" />
              <p>No agent metrics available. Start the colony daemon and connect WebSocket.</p>
              <p className="text-xs mt-2">WebSocket: ws://127.0.0.1:8765</p>
            </div>
          ) : (
            Object.entries(agentMetrics).map(([name, metrics]) => (
              <AgentResourceCard key={name} name={name} metrics={metrics} />
            ))
          )}
        </div>
      </section>

      {/* Resource History (placeholder) */}
      <section className="rounded-xl bg-base bg-elevated/50 border border-current/10 p-6">
        <h3 className="font-medium text-midground mb-4 flex items-center gap-2">
          <BarChart3 className="size-5" />
          Resource History (24h)
        </h3>
        <div className="h-64 rounded-lg bg-current/5 border border-current/10 flex items-center justify-center">
          <p className="text-text-secondary">Time-series charts coming in Phase 9.2.3</p>
        </div>
      </section>
    </div>
  );
}

function ResourceCard({ label, value, icon: Icon, color, trend }: { label: string; value: string; icon: React.ComponentType<any>; color: string; trend: "normal" | "warning" }) {
  return (
    <div className="p-4 rounded-lg bg-current/5 border border-current/10">
      <div className="flex items-center justify-between mb-2">
        <div className="p-2 rounded-lg" style={{ background: `${color}20` }}>
          <Icon className="size-5" style={{ color }} />
        </div>
        <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${trend === "warning" ? "bg-destructive/20 text-destructive" : "bg-success/20 text-success"}`}>
          {trend}
        </span>
      </div>
      <p className="text-2xl font-bold font-mono text-text-primary">{value}</p>
      <p className="text-xs text-text-secondary mt-1">{label}</p>
    </div>
  );
}

function AgentResourceCard({ name, metrics }: { name: string; metrics: any }) {
  const statusColors = {
    active: "#00b4d8",
    idle: "#71717a",
    error: "#ef4444",
  };

  return (
    <div className="p-4 rounded-lg border border-current/10 bg-base hover:border-current/20 transition-colors">
      <div className="flex items-center justify-between mb-3">
        <h4 className="font-medium text-text-primary capitalize">{name}</h4>
        <div
          className="w-2.5 h-2.5 rounded-full"
          style={{ background: statusColors[metrics.status as keyof typeof statusColors] || "#71717a" }}
        />
      </div>
      <div className="grid grid-cols-3 gap-3 mb-3">
        <div className="text-center p-2 rounded bg-current/5">
          <p className="text-2xl font-bold font-mono text-text-primary">{metrics.memory_mb.toFixed(1)}</p>
          <p className="text-xs text-text-secondary">MB RAM</p>
        </div>
        <div className="text-center p-2 rounded bg-current/5">
          <p className="text-2xl font-bold font-mono text-text-primary">{metrics.cpu_percent.toFixed(1)}</p>
          <p className="text-xs text-text-secondary">% CPU</p>
        </div>
        <div className="text-center p-2 rounded bg-current/5">
          <p className="text-xl font-bold font-mono text-text-primary">
            {(metrics.net_rx_bytes / 1024).toFixed(0)}↓ / {(metrics.net_tx_bytes / 1024).toFixed(0)}↑
          </p>
          <p className="text-xs text-text-secondary">KB Net</p>
        </div>
      </div>
      <div className="flex items-center justify-between text-xs">
        <span className="text-text-secondary">Tokens/sec</span>
        <span className="font-mono text-text-primary">{metrics.tokens_per_sec.toFixed(1)}</span>
      </div>
      {metrics.current_task && (
        <div className="mt-2 p-2 rounded bg-current/5 text-xs text-text-secondary">
          Current: {metrics.current_task}
        </div>
      )}
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

// Agent Web Tab - Living Memory Graph (force-directed, WebSocket-coupled)
function AgentWebTab() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [selectedNode, setSelectedNode] = useState<any | null>(null);

  interface GraphNode {
    id: string;
    label: string;
    type: 'concept' | 'finding' | 'decision' | 'artifact';
    value: number; // activity/weight 0-1
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;
    color: string;
    description: string;
    connections: string[]; // node ids
    createdAt: number;
  }

  const typeColors = {
    concept: '#00b4d8',
    finding: '#f59e0b',
    decision: '#8b5cf6',
    artifact: '#10a37f',
  };

  const typeLabels = {
    concept: 'Concept',
    finding: 'Finding',
    decision: 'Decision',
    artifact: 'Artifact',
  };

  const [nodes, setNodes] = useState<GraphNode[]>([]);

  // Initialize or update graph from WebSocket events
  useEffect(() => {
    // Sample seed data — in production, WebSocket broadcasts new nodes/updates
    const seedNodes: GraphNode[] = [
      { id: 'supabase', label: 'Supabase Auth', type: 'concept', value: 0.8, x: 0, y: 0, vx: 0, vy: 0, radius: 20, color: typeColors.concept, description: 'Authentication provider with email/social', connections: ['auth-flow', 'jwt', 'middleware'], createdAt: Date.now() - 3600000 },
      { id: 'auth-flow', label: 'Auth Flow', type: 'concept', value: 0.9, x: 0, y: 0, vx: 0, vy: 0, radius: 24, color: typeColors.concept, description: 'Login/signup/password reset flows', connections: ['supabase', 'middleware', 'login-form'], createdAt: Date.now() - 7200000 },
      { id: 'jwt', label: 'JWT Sessions', type: 'finding', value: 0.6, x: 0, y: 0, vx: 0, vy: 0, radius: 14, color: typeColors.finding, description: 'Supabase uses HS256 by default; configure RS256 for production', connections: ['supabase'], createdAt: Date.now() - 1800000 },
      { id: 'middleware', label: 'Auth Middleware', type: 'artifact', value: 0.7, x: 0, y: 0, vx: 0, vy: 0, radius: 16, color: typeColors.artifact, description: 'Express middleware validating JWT + role checks', connections: ['auth-flow', 'supabase', 'api-routes'], createdAt: Date.now() - 5400000 },
      { id: 'login-form', label: 'Login Form', type: 'artifact', value: 0.85, x: 0, y: 0, vx: 0, vy: 0, radius: 18, color: typeColors.artifact, description: 'React component with email/password and social buttons', connections: ['auth-flow'], createdAt: Date.now() - 2700000 },
      { id: 'api-routes', label: 'API Routes', type: 'concept', value: 0.75, x: 0, y: 0, vx: 0, vy: 0, radius: 22, color: typeColors.concept, description: 'Protected REST endpoints requiring auth', connections: ['middleware'], createdAt: Date.now() - 4500000 },
      { id: 'deploy-decision', label: 'Deploy Strategy', type: 'decision', value: 0.9, x: 0, y: 0, vx: 0, vy: 0, radius: 26, color: typeColors.decision, description: 'Cloudflare Pages + Workers over VPS (cost, speed)', connections: ['middleware'], createdAt: Date.now() - 86400000 },
      { id: 'cf-workers', label: 'Cloudflare Workers', type: 'concept', value: 0.65, x: 0, y: 0, vx: 0, vy: 0, radius: 19, color: typeColors.concept, description: 'Edge compute for auth callbacks, webhooks', connections: ['deploy-decision'], createdAt: Date.now() - 79200000 },
      { id: 'supabase-alpha', label: 'Alpha Schema', type: 'artifact', value: 0.5, x: 0, y: 0, vx: 0, vy: 0, radius: 12, color: typeColors.artifact, description: 'users/profile/tables RLS policies', connections: ['supabase'], createdAt: Date.now() - 172800000 },
      { id: 'test-coverage', label: 'Test Coverage 85%', type: 'finding', value: 0.4, x: 0, y: 0, vx: 0, vy: 0, radius: 10, color: typeColors.finding, description: 'Unit + integration tests passing (47/47)', connections: ['login-form'], createdAt: Date.now() - 259200000 },
    ];

    // Initialize positions randomly in canvas space
    const canvas = canvasRef.current;
    if (canvas) {
      const rect = canvas.getBoundingClientRect();
      seedNodes.forEach(n => {
        n.x = rect.width / 2 + (Math.random() - 0.5) * rect.width * 0.8;
        n.y = rect.height / 2 + (Math.random() - 0.5) * rect.height * 0.8;
        n.vx = (Math.random() - 0.5) * 0.5;
        n.vy = (Math.random() - 0.5) * 0.5;
      });
    }
    setNodes(seedNodes);
  }, []);

  // Force-directed simulation ref
  const simulationRef = useRef<any>(null);

  // Canvas colors from design tokens
  const bgPanel = '#1a1c24';
  const fg = '#e4e4e7';
  const textSecondary = '#71717a';
  const connectionColor = 'rgba(0, 180, 216, 0.3)';

  // Animation loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const dpr = window.devicePixelRatio || 1;

    const resizeCanvas = () => {
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Simple force-directed layout
    const alpha = 0.02; // attraction strength
    const beta = 0.001; // repulsion strength
    const friction = 0.85;
    const centerX = canvas.width / (2 * dpr);
    const centerY = canvas.height / (2 * dpr);

    const simulate = () => {
      if (!nodes.length) return;

      // Center gravity
      nodes.forEach(n => {
        n.vx += (centerX - n.x) * 0.0005;
        n.vy += (centerY - n.y) * 0.0005;
      });

      // Node-node repulsion
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[j].x - nodes[i].x;
          const dy = nodes[j].y - nodes[i].y;
          const dist = Math.sqrt(dx * dx + dy * dy) || 1;
          const force = beta * nodes[i].radius * nodes[j].radius / (dist * dist);
          const fx = (dx / dist) * force;
          const fy = (dy / dist) * force;
          nodes[i].vx -= fx;
          nodes[i].vy -= fy;
          nodes[j].vx += fx;
          nodes[j].vy += fy;
        }
      }

      // Edge attraction
      const edges: [GraphNode, GraphNode][] = [];
      nodes.forEach(n => {
        n.connections.forEach(connId => {
          const target = nodes.find(x => x.id === connId);
          if (target) edges.push([n, target]);
        });
      });
      edges.forEach(([a, b]) => {
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const dist = Math.sqrt(dx * dx + dy * dy) || 1;
        const force = alpha;
        const fx = (dx / dist) * force * dist * 0.3;
        const fy = (dy / dist) * force * dist * 0.3;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      });

      // Apply velocity, friction, bounds
      nodes.forEach(n => {
        n.vx *= friction;
        n.vy *= friction;
        n.x += n.vx;
        n.y += n.vy;

        // Boundary
        const rect = canvas.getBoundingClientRect();
        n.x = Math.max(n.radius, Math.min(rect.width - n.radius, n.x));
        n.y = Math.max(n.radius, Math.min(rect.height - n.radius, n.y));
      });
    };

    const render = () => {
      // Clear
      ctx.fillStyle = bgPanel;
      ctx.fillRect(0, 0, canvas.width / dpr, canvas.height / dpr);

      if (nodes.length === 0) return;

      // Draw edges
      nodes.forEach(n => {
        n.connections.forEach(connId => {
          const target = nodes.find(x => x.id === connId);
          if (target) {
            ctx.beginPath();
            ctx.moveTo(n.x, n.y);
            ctx.lineTo(target.x, target.y);
            ctx.strokeStyle = connectionColor;
            ctx.lineWidth = 1.5;
            ctx.stroke();
          }
        });
      });

      // Draw nodes
      nodes.sort((a, b) => a.value - b.value);
      nodes.forEach(n => {
        const isSelected = selectedNode?.id === n.id;
        // Glow behind
        if (isSelected) {
          ctx.beginPath();
          ctx.arc(n.x, n.y, n.radius + 8, 0, Math.PI * 2);
          ctx.fillStyle = `${n.color}30`;
          ctx.fill();
        }

        // Node core
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.radius, 0, Math.PI * 2);
        const gradient = ctx.createRadialGradient(n.x - 4, n.y - 4, 0, n.x, n.y, n.radius);
        gradient.addColorStop(0, isSelected ? '#ffffff' : n.color);
        gradient.addColorStop(1, n.color);
        ctx.fillStyle = gradient;
        ctx.fill();
        ctx.strokeStyle = isSelected ? '#ffffff' : `${n.color}80`;
        ctx.lineWidth = isSelected ? 3 : 1.5;
        ctx.stroke();

        // Label
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = isSelected ? '#00d4aa' : fg;
        ctx.fillText(n.label, n.x, n.y + n.radius + 16);

        // Type badge
        ctx.font = '9px Inter, sans-serif';
        ctx.fillStyle = textSecondary;
        ctx.fillText(typeLabels[n.type], n.x, n.y + n.radius + 28);
      });
    };

    simulationRef.current = setInterval(() => {
      simulate();
      render();
    }, 33); // ~30fps

    return () => {
      if (simulationRef.current) clearInterval(simulationRef.current);
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [nodes, selectedNode]);

  // Handle canvas click
  const handleCanvasClick = (e: React.MouseEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const clicked = nodes.find(n => Math.hypot(n.x - x, n.y - y) < n.radius + 5);
    setSelectedNode(clicked || null);
  };

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 relative rounded-xl bg-base bg-elevated/50 border border-current/10 overflow-hidden">
        <canvas
          ref={canvasRef}
          className="w-full h-full cursor-pointer"
          onClick={handleCanvasClick}
        />

        {selectedNode && (
          <div className="absolute bottom-4 left-4 right-4 p-4 rounded-xl bg-base/90 backdrop-blur border border-current/20 shadow-xl max-h-48 overflow-y-auto">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold text-midground capitalize" style={{ color: selectedNode.color }}>
                  {selectedNode.label}
                </h3>
                <p className="text-xs text-text-secondary mt-1">{selectedNode.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: `${selectedNode.color}20`, color: selectedNode.color }}>
                    {typeLabels[selectedNode.type as keyof typeof typeLabels]}
                  </span>
                  <span className="text-xs text-text-secondary">
                    {selectedNode.connections.length} connections
                  </span>
                </div>
              </div>
              <button
                onClick={() => setSelectedNode(null)}
                className="p-1 rounded text-text-secondary hover:text-midground"
              >
                <X className="size-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
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

// Slot Detail Drawer Component
interface SlotDrawerProps {
  slot: any;
  isOpen: boolean;
  onClose: () => void;
}

function SlotDrawer({ slot, isOpen, onClose }: SlotDrawerProps) {
  if (!isOpen || !slot) return null;

  const budgetParts = slot.budget.split(" / ");
  const spent = parseFloat(budgetParts[0].replace("$", ""));
  const limit = budgetParts[1] === "∞" ? null : parseFloat(budgetParts[1].replace("$", ""));
  const pct = limit ? Math.min(100, (spent / limit) * 100) : 0;

  // Mock data for the drawer
  const tokenHistory = Array.from({ length: 60 }, (_, i) => ({
    time: i,
    tokens: Math.floor(Math.random() * 500) + (slot.name === "builder" ? 800 : 100),
  }));

  const governanceEvents = [
    { time: "2m ago", action: "write_file", path: "src/auth.tsx", decision: "allow", rule: "file_write:workspace" },
    { time: "5m ago", action: "terminal", cmd: "npm test", decision: "allow", rule: "shell_exec:project" },
    { time: "12m ago", action: "deploy", target: "cloudflare:staging", decision: "approval_required", rule: "deploy:*" },
    { time: "1h ago", action: "git_push", remote: "origin", branch: "main", decision: "deny", rule: "git:push:production" },
    { time: "3h ago", action: "web_search", query: "Supabase auth", decision: "allow", rule: "network:http" },
  ];

  const logs = [
    { time: "10:42:15", level: "info", msg: "Task assigned: Implement login form" },
    { time: "10:42:18", level: "info", msg: "Spawning subagent via delegate_task" },
    { time: "10:42:22", level: "debug", msg: "SecurityBus evaluation: allow (file_write:workspace)" },
    { time: "10:42:25", level: "info", msg: "Writing auth.tsx (2.3 KB)" },
    { time: "10:42:27", level: "info", msg: "Running tests... (npm test)" },
    { time: "10:42:45", level: "warn", msg: "Test suite slow: 3.2s > 2s threshold" },
    { time: "10:42:48", level: "info", msg: "All 47 tests passed" },
    { time: "10:42:50", level: "info", msg: "Token burn: 1,247 (session: 45.2k)" },
  ];

  const skills = [
    { name: "terminal", category: "core", enabled: true },
    { name: "write_file", category: "core", enabled: true },
    { name: "patch", category: "core", enabled: true },
    { name: "github", category: "development", enabled: true },
    { name: "test-driven-development", category: "development", enabled: true },
    { name: "requesting-code-review", category: "development", enabled: true },
    { name: "cloudflare-temporary-deploy", category: "devops", enabled: true },
    { name: "docker-management", category: "devops", enabled: slot.name === "devops" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center sm:justify-end">
      <div
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden="true"
      />
      <div
        className="relative w-full sm:w-[480px] lg:w-[520px] max-h-[90vh] bg-base border-l border-current/10 shadow-2xl flex flex-col animate-slide-in"
        role="dialog"
        aria-modal="true"
        aria-labelledby="slot-drawer-title"
      >
        {/* Header */}
        <div className="flex items-start justify-between p-4 border-b border-current/10">
          <div>
            <h2 id="slot-drawer-title" className="font-semibold text-midground capitalize">{slot.name}</h2>
            <p className="text-xs text-text-secondary mt-0.5">{slot.role}</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-text-secondary hover:text-midground hover:bg-current/10 transition-colors"
            aria-label="Close slot details"
          >
            <X className="size-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Status & Budget */}
          <section className="space-y-4">
            <div className="flex items-center gap-3">
              <div
                className={cn(
                  "w-3 h-3 rounded-full",
                  slot.status === "active" && "bg-success animate-pulse",
                  slot.status === "idle" && "bg-muted"
                )}
              />
              <span className="text-sm font-medium capitalize">{slot.status}</span>
              <span className="ml-auto px-2 py-0.5 text-xs font-medium rounded-full bg-current/10 text-text-secondary">
                {slot.governance ? "Governance: ON" : "Governance: OFF"}
              </span>
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-text-secondary">Budget</span>
                <span className="font-medium text-text-primary">{slot.budget}</span>
              </div>
              <div className="h-2 rounded-full bg-current/10 overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${pct}%`,
                    background: pct > 80 ? "#ef4444" : pct > 50 ? "#f59e0b" : "#00b4d8",
                  }}
                />
              </div>
              {limit && (
                <p className="text-xs text-text-secondary mt-1">
                  {pct.toFixed(1)}% used • ${(limit - spent).toFixed(2)} remaining
                </p>
              )}
            </div>

            <div className="grid grid-cols-3 gap-3">
              <MetricMini label="Tokens" value={slot.tokens} icon={Zap} color="#00b4d8" />
              <MetricMini label="Skills" value={slot.skills} icon={Package} color="#8b5cf6" />
              <MetricMini label="Uptime" value="2h 34m" icon={History} color="#10a37f" />
            </div>
          </section>

          {/* Token Velocity Sparkline */}
          <section>
            <h3 className="font-medium text-text-primary mb-3 flex items-center gap-2">
              <TrendingUp className="size-4 text-midground" />
              Token Velocity (last 60s)
            </h3>
            <div className="h-32 bg-current/5 rounded-lg relative">
              <svg className="w-full h-full" viewBox="0 0 600 120" preserveAspectRatio="none">
                <defs>
                  <linearGradient id="velocityGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00b4d8" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="#00b4d8" stopOpacity="0" />
                  </linearGradient>
                </defs>
                <path
                  d={tokenHistory.map((p, i) => `${i === 0 ? "M" : "L"}${i * 10} ${120 - (p.tokens / 1500) * 100}`).join(" ")}
                  stroke="#00b4d8"
                  strokeWidth="2"
                  fill="none"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d={tokenHistory.map((p, i) => `${i === 0 ? "M" : "L"}${i * 10} ${120 - (p.tokens / 1500) * 100}`).join(" ") + " L600 120 L0 120 Z"}
                  fill="url(#velocityGradient)"
                />
              </svg>
              <div className="absolute bottom-2 right-2 text-xs text-text-secondary">
                Peak: {Math.max(...tokenHistory.map((p) => p.tokens))} tok/s
              </div>
            </div>
          </section>

          {/* Governance History */}
          <section>
            <h3 className="font-medium text-text-primary mb-3 flex items-center gap-2">
              <Shield className="size-4 text-midground" />
              Governance Decisions (last 20)
            </h3>
            <div className="space-y-2 max-h-64 overflow-y-auto">
              {governanceEvents.map((event, i) => (
                <GovernanceEventRow key={i} event={event} />
              ))}
            </div>
          </section>

          {/* Live Logs */}
          <section>
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-medium text-text-primary flex items-center gap-2">
                <Terminal className="size-4 text-midground" />
                Live Logs
              </h3>
              <span className="text-xs text-text-secondary">Auto-scroll</span>
            </div>
            <div className="h-48 bg-[#0D0F14] rounded-lg font-mono text-xs overflow-y-auto p-3 space-y-1">
              {logs.map((log, i) => (
                <LogEntry key={i} log={log} />
              ))}
            </div>
          </section>

          {/* Skills */}
          <section>
            <h3 className="font-medium text-text-primary mb-3 flex items-center gap-2">
              <Code className="size-4 text-midground" />
              Skills ({skills.filter((s) => s.enabled).length}/{skills.length})
            </h3>
            <div className="space-y-2 max-h-48 overflow-y-auto">
              {skills.map((skill) => (
                <SkillToggleRow key={skill.name} skill={skill} />
              ))}
            </div>
          </section>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-current/10 flex gap-2">
          <button className="flex-1 py-2 text-sm font-medium rounded-lg bg-midground/10 text-midground hover:bg-midground/20 transition-colors">
            Configure
          </button>
          <button className="flex-1 py-2 text-sm font-medium rounded-lg bg-current/10 text-text-secondary hover:bg-current/20 transition-colors">
            Run Task
          </button>
          <button className="flex-1 py-2 text-sm font-medium rounded-lg bg-destructive/10 text-destructive hover:bg-destructive/20 transition-colors">
            Pause
          </button>
        </div>
      </div>
    </div>
  );
}

function MetricMini({ label, value, icon: Icon, color }: { label: string; value: string; icon: React.ComponentType<any>; color: string }) {
  return (
    <div className="p-3 rounded-lg bg-current/5 text-center">
      <div className="p-2 rounded-lg bg-current/10 mx-auto mb-2" style={{ width: 32, height: 32 }}>
        <Icon className="size-5" style={{ color }} />
      </div>
      <p className="font-mono text-sm text-text-primary">{value}</p>
      <p className="text-xs text-text-secondary">{label}</p>
    </div>
  );
}

function GovernanceEventRow({ event }: { event: any }) {
  const decisionColors = {
    allow: "#00b4d8",
    deny: "#ef4444",
    approval_required: "#f59e0b",
    conditional: "#8b5cf6",
  };

  const decisionLabels = {
    allow: "Allowed",
    deny: "Denied",
    approval_required: "Approval Required",
    conditional: "Conditional",
  };

  return (
    <div className="p-3 rounded-lg bg-current/5 border border-current/10">
      <div className="flex items-center justify-between gap-2 mb-1">
        <span className="font-mono text-xs text-text-primary">{event.action}</span>
        <span className="text-xs text-text-secondary">{event.time}</span>
      </div>
      <div className="flex items-center gap-2 text-xs">
        <span className="text-text-secondary/60">{event.path || event.cmd || event.target || event.query || event.remote}</span>
        <span className="ml-auto px-2 py-0.5 rounded" style={{ background: `${decisionColors[event.decision as keyof typeof decisionColors]}20`, color: decisionColors[event.decision as keyof typeof decisionColors] }}>
          {decisionLabels[event.decision as keyof typeof decisionLabels]}
        </span>
      </div>
      <p className="text-[10px] text-text-secondary/60 mt-1">Rule: {event.rule}</p>
    </div>
  );
}

function LogEntry({ log }: { log: any }) {
  const levelColors = {
    info: "#00b4d8",
    warn: "#f59e0b",
    error: "#ef4444",
    debug: "#71717a",
  };

  return (
    <div className="flex items-start gap-2 text-text-secondary" style={{ color: levelColors[log.level as keyof typeof levelColors] || "#71717a" }}>
      <span className="font-mono text-[10px] w-20 shrink-0">{log.time}</span>
      <span className="text-[10px] w-12 shrink-0 uppercase">{log.level}</span>
      <span className="text-[11px] flex-1 truncate">{log.msg}</span>
    </div>
  );
}

function SkillToggleRow({ skill }: { skill: any }) {
  return (
    <div className="flex items-center justify-between p-2 rounded-lg bg-current/5 hover:bg-current/10 transition-colors">
      <div className="flex items-center gap-2">
        <span className="text-xs font-medium text-text-primary capitalize">{skill.name.replace(/-/g, " ")}</span>
        <span className="text-[10px] px-1.5 py-0.5 rounded bg-current/10 text-text-secondary">{skill.category}</span>
      </div>
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" defaultChecked={skill.enabled} className="sr-only peer" />
        <div className="w-10 h-5 bg-current/20 peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-midground rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-color-white peer-checked:bg-midground after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all" />
      </label>
    </div>
  );
}