import { useState, useEffect, useCallback, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, Plus, Radio, History, Bell, BarChart3,
  Play, Square, Globe, Clock, ArrowUpDown, AlertTriangle,
  Volume2, VolumeX, ChevronRight, X, Eye
} from "lucide-react";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Area, AreaChart
} from "recharts";
import { toast } from "sonner";

// ─── Types ───────────────────────────────────────────────────────
interface Website {
  id: string;
  url: string;
  frequency: string;
  active: boolean;
  lastCheckedTime: string;
  lastCheckedDate: string;
  responseTime: number;
  statusCode: number;
  versions: Version[];
  changes: Change[];
}

interface Version {
  id: string;
  timestamp: string;
  content: string;
}

interface Change {
  id: string;
  timestamp: string;
  type: "minor" | "major";
  additions: string[];
  removals: string[];
  modifications: string[];
}

type View = "dashboard" | "add" | "monitoring" | "history" | "alerts" | "analytics" | "diff" | "compare";

// ─── Mock Data ───────────────────────────────────────────────────
const MOCK_CONTENT_SNIPPETS = [
  `<h1>Welcome to Our Platform</h1>\n<p>The best solution for your needs.</p>\n<div class="pricing">$29/mo</div>`,
  `<h1>Welcome to Our Platform</h1>\n<p>The #1 solution for your needs.</p>\n<div class="pricing">$39/mo</div>\n<div class="new-banner">Summer Sale!</div>`,
  `<h1>Welcome to Our New Platform</h1>\n<p>The #1 solution for teams.</p>\n<div class="pricing">$39/mo</div>`,
  `<h1>Welcome to Our New Platform</h1>\n<p>Enterprise-grade solution.</p>\n<div class="pricing">$49/mo</div>\n<footer>Contact us</footer>`,
];

const initialWebsites: Website[] = [
  {
    id: "1",
    url: "https://example.com",
    frequency: "5 min",
    active: true,
    lastCheckedTime: new Date().toLocaleTimeString(),
    lastCheckedDate: new Date().toLocaleDateString(),
    responseTime: 245,
    statusCode: 200,
    versions: [
      { id: "v1", timestamp: new Date(Date.now() - 3600000).toLocaleString(), content: MOCK_CONTENT_SNIPPETS[0] },
      { id: "v2", timestamp: new Date(Date.now() - 1800000).toLocaleString(), content: MOCK_CONTENT_SNIPPETS[1] },
    ],
    changes: [],
  },
  {
    id: "2",
    url: "https://news.ycombinator.com",
    frequency: "1 min",
    active: true,
    lastCheckedTime: new Date().toLocaleTimeString(),
    lastCheckedDate: new Date().toLocaleDateString(),
    responseTime: 189,
    statusCode: 200,
    versions: [
      { id: "v1", timestamp: new Date(Date.now() - 7200000).toLocaleString(), content: MOCK_CONTENT_SNIPPETS[2] },
    ],
    changes: [],
  },
  {
    id: "3",
    url: "https://github.com",
    frequency: "1 hour",
    active: false,
    lastCheckedTime: new Date().toLocaleTimeString(),
    lastCheckedDate: new Date().toLocaleDateString(),
    responseTime: 320,
    statusCode: 200,
    versions: [],
    changes: [],
  },
];

// ─── Helpers ─────────────────────────────────────────────────────
const generateId = () => Math.random().toString(36).substr(2, 9);

const generateResponseTime = () => Math.floor(Math.random() * 400) + 80;

const generateStatusCode = () => {
  const r = Math.random();
  if (r > 0.95) return 503;
  if (r > 0.9) return 404;
  if (r > 0.85) return 301;
  return 200;
};

// ─── Component ───────────────────────────────────────────────────
const Dashboard = () => {
  const [view, setView] = useState<View>("dashboard");
  const [websites, setWebsites] = useState<Website[]>(initialWebsites);
  const [soundEnabled, setSoundEnabled] = useState(false);
  const [notifications, setNotifications] = useState<Change[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [bellShake, setBellShake] = useState(false);
  const [selectedSite, setSelectedSite] = useState<Website | null>(null);
  const [compareVersions, setCompareVersions] = useState<[string, string]>(["", ""]);
  const [newUrl, setNewUrl] = useState("");
  const [newFreq, setNewFreq] = useState("5 min");
  const lastAlertRef = useRef(0);
  const userInteracted = useRef(false);

  // Track user interaction for audio
  useEffect(() => {
    const handler = () => { userInteracted.current = true; };
    window.addEventListener("click", handler, { once: true });
    return () => window.removeEventListener("click", handler);
  }, []);

  // Live simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setWebsites(prev => prev.map(site => {
        if (!site.active) return site;

        const newResponseTime = generateResponseTime();
        const newStatusCode = generateStatusCode();
        const now = new Date();
        const shouldChange = Math.random() > 0.6;

        let updatedVersions = [...site.versions];
        let updatedChanges = [...site.changes];

        if (shouldChange) {
          const contentIdx = Math.floor(Math.random() * MOCK_CONTENT_SNIPPETS.length);
          const newVersion: Version = {
            id: `v${updatedVersions.length + 1}`,
            timestamp: now.toLocaleString(),
            content: MOCK_CONTENT_SNIPPETS[contentIdx],
          };
          updatedVersions.push(newVersion);

          const isMajor = Math.random() > 0.6;
          const change: Change = {
            id: generateId(),
            timestamp: now.toLocaleString(),
            type: isMajor ? "major" : "minor",
            additions: isMajor ? ["New banner section added", "Footer updated"] : ["Text modified"],
            removals: isMajor ? ["Old pricing removed"] : [],
            modifications: ["Content text updated"],
          };
          updatedChanges.push(change);

          if (isMajor) {
            const nowMs = Date.now();
            if (nowMs - lastAlertRef.current > 7000) {
              lastAlertRef.current = nowMs;
              setNotifications(n => [change, ...n]);
              setBellShake(true);
              setTimeout(() => setBellShake(false), 600);

              toast.error(`Major change detected on ${site.url}`, {
                description: change.additions.join(", "),
              });

              if (soundEnabled && userInteracted.current) {
                try {
                  const ctx = new AudioContext();
                  const osc = ctx.createOscillator();
                  const gain = ctx.createGain();
                  osc.connect(gain);
                  gain.connect(ctx.destination);
                  osc.frequency.value = 880;
                  osc.type = "sine";
                  gain.gain.setValueAtTime(0.3, ctx.currentTime);
                  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
                  osc.start(ctx.currentTime);
                  osc.stop(ctx.currentTime + 0.5);
                } catch {}
              }
            }
          }
        }

        return {
          ...site,
          lastCheckedTime: now.toLocaleTimeString(),
          lastCheckedDate: now.toLocaleDateString(),
          responseTime: newResponseTime,
          statusCode: newStatusCode,
          versions: updatedVersions,
          changes: updatedChanges,
        };
      }));
    }, 4000);

    return () => clearInterval(interval);
  }, [soundEnabled]);

  const addWebsite = useCallback(() => {
    if (!newUrl.trim()) return;
    const site: Website = {
      id: generateId(),
      url: newUrl.startsWith("http") ? newUrl : `https://${newUrl}`,
      frequency: newFreq,
      active: true,
      lastCheckedTime: new Date().toLocaleTimeString(),
      lastCheckedDate: new Date().toLocaleDateString(),
      responseTime: generateResponseTime(),
      statusCode: 200,
      versions: [{ id: "v1", timestamp: new Date().toLocaleString(), content: MOCK_CONTENT_SNIPPETS[0] }],
      changes: [],
    };
    setWebsites(prev => [...prev, site]);
    setNewUrl("");
    toast.success("Website added to monitoring!");
    setView("monitoring");
  }, [newUrl, newFreq]);

  const toggleSite = (id: string) => {
    setWebsites(prev => prev.map(s => s.id === id ? { ...s, active: !s.active } : s));
  };

  // Analytics data
  const responseTimeData = websites.filter(s => s.active).map(s => ({
    name: new URL(s.url).hostname.replace("www.", ""),
    responseTime: s.responseTime,
  }));

  const changesData = websites.map(s => ({
    name: new URL(s.url).hostname.replace("www.", ""),
    minor: s.changes.filter(c => c.type === "minor").length,
    major: s.changes.filter(c => c.type === "major").length,
  }));

  const totalChanges = websites.reduce((sum, s) => sum + s.changes.length, 0);
  const activeCount = websites.filter(s => s.active).length;
  const majorCount = notifications.length;

  // Sidebar items
  const sidebarItems: { icon: typeof LayoutDashboard; label: string; view: View }[] = [
    { icon: LayoutDashboard, label: "Dashboard", view: "dashboard" },
    { icon: Plus, label: "Add Website", view: "add" },
    { icon: Radio, label: "Monitoring", view: "monitoring" },
    { icon: History, label: "History", view: "history" },
    { icon: Bell, label: "Alerts", view: "alerts" },
    { icon: BarChart3, label: "Analytics", view: "analytics" },
  ];

  return (
    <div className="flex h-screen bg-background overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 bg-secondary/50 border-r border-border flex flex-col shrink-0">
        <div className="p-6 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ background: "linear-gradient(135deg, hsl(187 92% 41%), hsl(217 91% 60%))" }}>
              <Globe className="w-5 h-5 text-primary-foreground" />
            </div>
            <span className="font-bold text-foreground text-lg">WebDetect</span>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {sidebarItems.map(item => {
            const active = view === item.view;
            return (
              <button
                key={item.view}
                onClick={() => setView(item.view)}
                className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent"
                }`}
              >
                <item.icon className="w-5 h-5" />
                {item.label}
                {item.view === "alerts" && notifications.length > 0 && (
                  <span className="ml-auto w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-xs flex items-center justify-center">
                    {notifications.length}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {/* Top bar */}
        <header className="h-16 border-b border-border flex items-center justify-between px-6 shrink-0 bg-secondary/30">
          <h2 className="text-lg font-semibold text-foreground capitalize">
            {view === "diff" ? "Change Detection" : view === "compare" ? "Version Compare" : view}
          </h2>
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
              title={soundEnabled ? "Mute alerts" : "Enable alert sounds"}
            >
              {soundEnabled ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
            </button>
            <div className="relative">
              <button
                onClick={() => setShowNotifs(!showNotifs)}
                className={`p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors relative ${bellShake ? "animate-bell-shake" : ""}`}
              >
                <Bell className="w-5 h-5" />
                {notifications.length > 0 && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] flex items-center justify-center font-bold">
                    {notifications.length}
                  </span>
                )}
              </button>
              <AnimatePresence>
                {showNotifs && (
                  <motion.div
                    initial={{ opacity: 0, y: -10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: -10, scale: 0.95 }}
                    className="absolute right-0 top-12 w-80 glass-card p-4 z-50 max-h-80 overflow-y-auto"
                  >
                    <div className="flex items-center justify-between mb-3">
                      <span className="font-semibold text-foreground text-sm">Notifications</span>
                      <button onClick={() => setShowNotifs(false)} className="text-muted-foreground hover:text-foreground">
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    {notifications.length === 0 ? (
                      <p className="text-muted-foreground text-sm">No notifications yet</p>
                    ) : (
                      notifications.slice(0, 10).map(n => (
                        <div key={n.id} className="py-2 border-b border-border last:border-0">
                          <div className="flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
                            <span className="text-sm text-foreground font-medium">Major Change</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{n.timestamp}</p>
                        </div>
                      ))
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 overflow-y-auto p-6">
          <AnimatePresence mode="wait">
            <motion.div
              key={view}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {/* Dashboard Overview */}
              {view === "dashboard" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    {[
                      { label: "Monitored Sites", value: websites.length, icon: Globe, color: "text-primary" },
                      { label: "Active", value: activeCount, icon: Radio, color: "text-success" },
                      { label: "Total Changes", value: totalChanges, icon: ArrowUpDown, color: "text-info" },
                      { label: "Major Alerts", value: majorCount, icon: AlertTriangle, color: "text-destructive" },
                    ].map(stat => (
                      <div key={stat.label} className="glass-card p-5">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-muted-foreground text-sm">{stat.label}</span>
                          <stat.icon className={`w-5 h-5 ${stat.color}`} />
                        </div>
                        <span className="text-3xl font-bold text-foreground">{stat.value}</span>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-card p-5">
                      <h3 className="text-foreground font-semibold mb-4">Response Time Trends</h3>
                      <ResponsiveContainer width="100%" height={250}>
                        <AreaChart data={responseTimeData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
                          <XAxis dataKey="name" stroke="hsl(215 20% 55%)" fontSize={12} />
                          <YAxis stroke="hsl(215 20% 55%)" fontSize={12} />
                          <Tooltip contentStyle={{ background: "hsl(222 44% 9%)", border: "1px solid hsl(222 30% 18%)", borderRadius: "8px", color: "hsl(210 40% 96%)" }} />
                          <Area type="monotone" dataKey="responseTime" stroke="hsl(187 92% 41%)" fill="hsl(187 92% 41% / 0.1)" strokeWidth={2} />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="glass-card p-5">
                      <h3 className="text-foreground font-semibold mb-4">Recent Activity</h3>
                      <div className="space-y-3 max-h-[250px] overflow-y-auto">
                        {websites.flatMap(s => s.changes.map(c => ({ ...c, url: s.url })))
                          .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
                          .slice(0, 8)
                          .map(c => (
                            <div key={c.id} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                              <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                                c.type === "major" ? "bg-destructive/20 text-destructive" : "bg-info/20 text-info"
                              }`}>
                                {c.type}
                              </span>
                              <span className="text-sm text-foreground truncate">{new URL(c.url).hostname}</span>
                              <span className="text-xs text-muted-foreground ml-auto">{c.timestamp}</span>
                            </div>
                          ))}
                        {totalChanges === 0 && <p className="text-muted-foreground text-sm">No changes detected yet. Monitoring is running...</p>}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Add Website */}
              {view === "add" && (
                <div className="max-w-lg mx-auto">
                  <div className="glass-card p-8">
                    <h3 className="text-xl font-bold text-foreground mb-6">Add Website to Monitor</h3>
                    <div className="space-y-4">
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Website URL</label>
                        <input
                          type="text"
                          value={newUrl}
                          onChange={e => setNewUrl(e.target.value)}
                          placeholder="https://example.com"
                          className="w-full px-4 py-3 rounded-lg bg-accent border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                          onKeyDown={e => e.key === "Enter" && addWebsite()}
                        />
                      </div>
                      <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Check Frequency</label>
                        <select
                          value={newFreq}
                          onChange={e => setNewFreq(e.target.value)}
                          className="w-full px-4 py-3 rounded-lg bg-accent border border-border text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50"
                        >
                          <option value="1 min">Every 1 minute</option>
                          <option value="5 min">Every 5 minutes</option>
                          <option value="1 hour">Every 1 hour</option>
                        </select>
                      </div>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={addWebsite}
                        className="w-full py-3 rounded-lg font-semibold text-primary-foreground transition-all"
                        style={{ background: "linear-gradient(135deg, hsl(187 92% 41%), hsl(217 91% 60%))" }}
                      >
                        Start Monitoring
                      </motion.button>
                    </div>
                  </div>
                </div>
              )}

              {/* Monitoring Table */}
              {view === "monitoring" && (
                <div className="glass-card overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b border-border">
                          {["URL", "Status", "Last Checked", "Response Time", "Status Code", "Actions"].map(h => (
                            <th key={h} className="text-left px-5 py-4 text-xs font-semibold text-muted-foreground uppercase tracking-wider">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {websites.map(site => (
                          <tr key={site.id} className="border-b border-border/50 hover:bg-accent/30 transition-colors">
                            <td className="px-5 py-4">
                              <span className="text-sm text-foreground font-medium">{site.url}</span>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${
                                site.active ? "bg-success/20 text-success" : "bg-muted text-muted-foreground"
                              }`}>
                                <span className={`w-1.5 h-1.5 rounded-full ${site.active ? "bg-success" : "bg-muted-foreground"}`} />
                                {site.active ? "Active" : "Inactive"}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="text-sm text-foreground">{site.lastCheckedTime}</div>
                              <div className="text-xs text-muted-foreground">{site.lastCheckedDate}</div>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`text-sm font-mono ${site.responseTime > 300 ? "text-warning" : "text-success"}`}>
                                {site.responseTime}ms
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <span className={`text-sm font-mono font-medium ${
                                site.statusCode === 200 ? "text-success" : site.statusCode === 301 ? "text-warning" : "text-destructive"
                              }`}>
                                {site.statusCode}
                              </span>
                            </td>
                            <td className="px-5 py-4">
                              <div className="flex items-center gap-2">
                                <button
                                  onClick={() => toggleSite(site.id)}
                                  className={`p-2 rounded-lg transition-colors ${
                                    site.active ? "hover:bg-destructive/20 text-destructive" : "hover:bg-success/20 text-success"
                                  }`}
                                  title={site.active ? "Stop" : "Start"}
                                >
                                  {site.active ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                                </button>
                                {site.versions.length >= 2 && (
                                  <button
                                    onClick={() => { setSelectedSite(site); setView("diff"); }}
                                    className="p-2 rounded-lg hover:bg-primary/20 text-primary transition-colors"
                                    title="View Changes"
                                  >
                                    <Eye className="w-4 h-4" />
                                  </button>
                                )}
                                <button
                                  onClick={() => { setSelectedSite(site); setView("history"); }}
                                  className="p-2 rounded-lg hover:bg-accent text-muted-foreground hover:text-foreground transition-colors"
                                  title="History"
                                >
                                  <History className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* Change Detection Diff */}
              {view === "diff" && selectedSite && selectedSite.versions.length >= 2 && (
                <div className="space-y-4">
                  <button onClick={() => setView("monitoring")} className="text-sm text-primary hover:underline flex items-center gap-1">
                    ← Back to Monitoring
                  </button>
                  <h3 className="text-xl font-bold text-foreground">Change Detection — {selectedSite.url}</h3>
                  {(() => {
                    const oldV = selectedSite.versions[selectedSite.versions.length - 2];
                    const newV = selectedSite.versions[selectedSite.versions.length - 1];
                    const oldLines = oldV.content.split("\n");
                    const newLines = newV.content.split("\n");
                    const maxLen = Math.max(oldLines.length, newLines.length);
                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        <div className="glass-card p-4">
                          <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                            <Clock className="w-3 h-3" /> Old Version — {oldV.timestamp}
                          </div>
                          <pre className="text-sm font-mono space-y-1">
                            {Array.from({ length: maxLen }).map((_, i) => {
                              const line = oldLines[i] || "";
                              const isRemoved = !newLines.includes(line) && line;
                              return (
                                <div key={i} className={`px-2 py-0.5 rounded ${isRemoved ? "bg-destructive/20 text-destructive" : "text-muted-foreground"}`}>
                                  {line || "\u00A0"}
                                </div>
                              );
                            })}
                          </pre>
                        </div>
                        <div className="glass-card p-4">
                          <div className="text-xs text-muted-foreground mb-3 flex items-center gap-2">
                            <Clock className="w-3 h-3" /> New Version — {newV.timestamp}
                          </div>
                          <pre className="text-sm font-mono space-y-1">
                            {Array.from({ length: maxLen }).map((_, i) => {
                              const line = newLines[i] || "";
                              const isAdded = !oldLines.includes(line) && line;
                              const isModified = oldLines[i] && oldLines[i] !== line && !isAdded;
                              return (
                                <div key={i} className={`px-2 py-0.5 rounded ${
                                  isAdded ? "bg-success/20 text-success" : isModified ? "bg-warning/20 text-warning" : "text-muted-foreground"
                                }`}>
                                  {line || "\u00A0"}
                                </div>
                              );
                            })}
                          </pre>
                        </div>
                      </div>
                    );
                  })()}
                  {/* Change Classification */}
                  {selectedSite.changes.length > 0 && (
                    <div className="glass-card p-5">
                      <h4 className="text-foreground font-semibold mb-3">Change Classification</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedSite.changes.slice(-5).map(c => (
                          <span key={c.id} className={`px-3 py-1.5 rounded-full text-xs font-semibold ${
                            c.type === "major" ? "bg-destructive/20 text-destructive" : "bg-info/20 text-info"
                          }`}>
                            {c.type === "major" ? "🔴 Major Change" : "🔵 Minor Change"} — {c.timestamp}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* Version History */}
              {view === "history" && (
                <div className="space-y-4">
                  {!selectedSite && (
                    <div className="space-y-4">
                      <h3 className="text-xl font-bold text-foreground">Version History</h3>
                      {websites.filter(s => s.versions.length > 0).map(site => (
                        <div key={site.id} className="glass-card p-5">
                          <div className="flex items-center justify-between mb-3">
                            <span className="text-foreground font-medium">{site.url}</span>
                            <span className="text-xs text-muted-foreground">{site.versions.length} versions</span>
                          </div>
                          <div className="space-y-2">
                            {site.versions.slice(-5).reverse().map(v => (
                              <div key={v.id} className="flex items-center gap-3 text-sm py-1.5 border-b border-border/50 last:border-0">
                                <span className="text-primary font-mono text-xs">{v.id}</span>
                                <span className="text-muted-foreground">{v.timestamp}</span>
                              </div>
                            ))}
                          </div>
                          {site.versions.length >= 2 && (
                            <button
                              onClick={() => {
                                setSelectedSite(site);
                                setCompareVersions([
                                  site.versions[site.versions.length - 2].id,
                                  site.versions[site.versions.length - 1].id,
                                ]);
                                setView("compare");
                              }}
                              className="mt-3 text-sm text-primary hover:underline flex items-center gap-1"
                            >
                              Compare Versions <ChevronRight className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                      ))}
                      {websites.every(s => s.versions.length === 0) && (
                        <div className="glass-card p-10 text-center text-muted-foreground">No version history yet. Start monitoring to collect versions.</div>
                      )}
                    </div>
                  )}
                  {selectedSite && view === "history" && (
                    <div className="space-y-4">
                      <button onClick={() => { setSelectedSite(null); }} className="text-sm text-primary hover:underline flex items-center gap-1">
                        ← Back
                      </button>
                      <h3 className="text-xl font-bold text-foreground">History — {selectedSite.url}</h3>
                      {selectedSite.versions.slice().reverse().map(v => (
                        <div key={v.id} className="glass-card p-4">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="text-primary font-mono text-sm font-bold">{v.id}</span>
                            <span className="text-muted-foreground text-sm">{v.timestamp}</span>
                          </div>
                          <pre className="text-xs font-mono text-muted-foreground bg-accent/50 p-3 rounded-lg overflow-x-auto">{v.content}</pre>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Compare Versions */}
              {view === "compare" && selectedSite && (
                <div className="space-y-4">
                  <button onClick={() => { setView("history"); setSelectedSite(null); }} className="text-sm text-primary hover:underline flex items-center gap-1">
                    ← Back to History
                  </button>
                  <h3 className="text-xl font-bold text-foreground">Compare Versions — {selectedSite.url}</h3>
                  <div className="flex gap-4 mb-4">
                    {[0, 1].map(idx => (
                      <select
                        key={idx}
                        value={compareVersions[idx]}
                        onChange={e => {
                          const next = [...compareVersions] as [string, string];
                          next[idx] = e.target.value;
                          setCompareVersions(next);
                        }}
                        className="px-3 py-2 rounded-lg bg-accent border border-border text-foreground text-sm"
                      >
                        {selectedSite.versions.map(v => (
                          <option key={v.id} value={v.id}>{v.id} — {v.timestamp}</option>
                        ))}
                      </select>
                    ))}
                  </div>
                  {(() => {
                    const v1 = selectedSite.versions.find(v => v.id === compareVersions[0]);
                    const v2 = selectedSite.versions.find(v => v.id === compareVersions[1]);
                    if (!v1 || !v2) return <p className="text-muted-foreground">Select two versions to compare</p>;
                    const l1 = v1.content.split("\n");
                    const l2 = v2.content.split("\n");
                    const maxLen = Math.max(l1.length, l2.length);
                    return (
                      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {[{ label: v1.id, lines: l1, other: l2 }, { label: v2.id, lines: l2, other: l1 }].map((side, si) => (
                          <div key={si} className="glass-card p-4">
                            <div className="text-xs text-muted-foreground mb-3 font-mono">{side.label}</div>
                            <pre className="text-sm font-mono space-y-1">
                              {Array.from({ length: maxLen }).map((_, i) => {
                                const line = side.lines[i] || "";
                                const otherLine = side.other[i] || "";
                                const isDiff = line !== otherLine;
                                const isNew = i >= side.other.length && line;
                                return (
                                  <div key={i} className={`px-2 py-0.5 rounded ${
                                    isNew ? "bg-success/20 text-success" : isDiff ? "bg-warning/20 text-warning" : "text-muted-foreground"
                                  }`}>
                                    {line || "\u00A0"}
                                  </div>
                                );
                              })}
                            </pre>
                          </div>
                        ))}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* Alerts */}
              {view === "alerts" && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xl font-bold text-foreground">Alert Log</h3>
                    <button
                      onClick={() => setSoundEnabled(!soundEnabled)}
                      className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                        soundEnabled ? "bg-primary/20 text-primary" : "bg-accent text-muted-foreground"
                      }`}
                    >
                      {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                      Sound {soundEnabled ? "ON" : "OFF"}
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <div className="glass-card p-10 text-center text-muted-foreground">
                      <Bell className="w-10 h-10 mx-auto mb-3 opacity-30" />
                      No alerts yet. Major changes will appear here.
                    </div>
                  ) : (
                    notifications.map(n => (
                      <motion.div
                        key={n.id}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="glass-card p-5 border-l-4 border-l-destructive"
                      >
                        <div className="flex items-center gap-3 mb-2">
                          <AlertTriangle className="w-5 h-5 text-destructive" />
                          <span className="font-semibold text-foreground">Major Change Detected</span>
                          <span className="px-2 py-0.5 rounded bg-destructive/20 text-destructive text-xs font-medium ml-auto">MAJOR</span>
                        </div>
                        <p className="text-sm text-muted-foreground">{n.timestamp}</p>
                        <div className="mt-2 flex flex-wrap gap-2">
                          {n.additions.map((a, i) => (
                            <span key={i} className="text-xs px-2 py-1 rounded bg-success/10 text-success">+ {a}</span>
                          ))}
                          {n.removals.map((r, i) => (
                            <span key={i} className="text-xs px-2 py-1 rounded bg-destructive/10 text-destructive">- {r}</span>
                          ))}
                        </div>
                      </motion.div>
                    ))
                  )}
                </div>
              )}

              {/* Analytics */}
              {view === "analytics" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="glass-card p-5">
                      <h3 className="text-foreground font-semibold mb-4">Response Time (ms)</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={responseTimeData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
                          <XAxis dataKey="name" stroke="hsl(215 20% 55%)" fontSize={12} />
                          <YAxis stroke="hsl(215 20% 55%)" fontSize={12} />
                          <Tooltip contentStyle={{ background: "hsl(222 44% 9%)", border: "1px solid hsl(222 30% 18%)", borderRadius: "8px", color: "hsl(210 40% 96%)" }} />
                          <Line type="monotone" dataKey="responseTime" stroke="hsl(187 92% 41%)" strokeWidth={2} dot={{ fill: "hsl(187 92% 41%)", r: 5 }} />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>
                    <div className="glass-card p-5">
                      <h3 className="text-foreground font-semibold mb-4">Detected Changes</h3>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={changesData}>
                          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 30% 18%)" />
                          <XAxis dataKey="name" stroke="hsl(215 20% 55%)" fontSize={12} />
                          <YAxis stroke="hsl(215 20% 55%)" fontSize={12} />
                          <Tooltip contentStyle={{ background: "hsl(222 44% 9%)", border: "1px solid hsl(222 30% 18%)", borderRadius: "8px", color: "hsl(210 40% 96%)" }} />
                          <Bar dataKey="minor" stackId="a" fill="hsl(217 91% 60%)" radius={[0, 0, 0, 0]} />
                          <Bar dataKey="major" stackId="a" fill="hsl(0 72% 51%)" radius={[4, 4, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>
                </div>
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
};

export default Dashboard;
