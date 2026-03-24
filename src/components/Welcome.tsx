"use client";

import { useEffect, useState } from "react";
import { fetchHealth, fetchRoutes, executeApiCall } from "@/lib/api";
import { RouteItem } from "@/lib/routes";

export default function Welcome() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [routes, setRoutes] = useState<RouteItem[]>([]);
  const [activeRole, setActiveRole] = useState("user");
  const [selectedRoute, setSelectedRoute] = useState<any>(null);
  const [apiResponse, setApiResponse] = useState<any>(null);
  const [executing, setExecuting] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [copyMsg, setCopyMsg] = useState<string | null>(null);
  const [apiKey, setApiKey] = useState("");
  const [editableBody, setEditableBody] = useState("");

  useEffect(() => {
    async function getHealth() {
      const result = await fetchHealth();
      setData(result);
      setLoading(false);
    }
    async function getRoutes() {
      const allRoutes = await fetchRoutes();
      const roleRoutes = allRoutes.find((r: any) => r.role === activeRole);
      // Filter: Only show routes that require Authorization or x-api-key
      const filtered = (roleRoutes ? roleRoutes.routes : []).filter((r: RouteItem) => 
        r.headers && (r.headers.Authorization || r.headers['x-api-key'])
      );
      setRoutes(filtered);
    }
    getHealth();
    getRoutes();
    setSelectedRoute(null);
    setApiResponse(null);
  }, [activeRole]);

  useEffect(() => {
    if (selectedRoute) {
      setEditableBody(selectedRoute.body ? JSON.stringify(selectedRoute.body, null, 2) : "");
    } else {
      setEditableBody("");
    }
  }, [selectedRoute]);

  const handleRunApi = async () => {
    if (!selectedRoute) return;
    setExecuting(true);
    setApiResponse(null);
    
    const headers = { ...selectedRoute.headers };
    if (authToken && headers.Authorization) {
      headers.Authorization = `Bearer ${authToken}`;
    }

    let bodyToUse = selectedRoute.body;
    if (editableBody) {
      try {
        bodyToUse = JSON.parse(editableBody);
      } catch (e) {
        console.error("Invalid JSON in payload", e);
        // Fallback to original body if JSON is invalid, or show error
      }
    }

    const result = await executeApiCall(
      selectedRoute.method,
      selectedRoute.path,
      bodyToUse,
      headers
    );
    setApiResponse(result);
    setExecuting(false);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopyMsg(label);
    setTimeout(() => setCopyMsg(null), 2000);
  };

  return (
    <div className="flex flex-col items-center justify-center p-10 w-full max-w-7xl border rounded-3xl bg-white dark:bg-zinc-950 shadow-2xl transition-all hover:shadow-indigo-500/10">
      {/* Animated Welcome Screen */}
      <div className="flex flex-col items-center justify-center mb-10 relative">
        <div className="absolute inset-0 -z-10 bg-indigo-500/5 blur-[100px] rounded-full animate-pulse-slow"></div>
        
        <p className="text-[14px] font-black uppercase tracking-[0.8em] text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-purple-400 mb-6 opacity-0 animate-reveal-down drop-shadow-[0_0_15px_rgba(129,140,248,0.3)]">
          Welcome Musing App
        </p>
        
        <div className="relative group mb-4">
          <div className="absolute -inset-4 bg-gradient-to-r from-indigo-500 to-purple-600 rounded-full blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200"></div>
          <img 
            src="/Logo.png" 
            alt="Musing Logo" 
            className="h-24 w-24 object-contain animate-float drop-shadow-2xl relative"
          />
        </div>

        <div className="relative group">
          <h1 className="text-8xl font-black mb-4 text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 animate-shimmer select-none cursor-default">
            Musing
          </h1>
        </div>

        <p className="text-zinc-500 font-bold text-xl uppercase tracking-[0.4em] opacity-0 animate-reveal-up border-t border-zinc-100 dark:border-white/5 pt-4">
          Developer Console
        </p>
      </div>

      <div className="mb-10 px-5 py-2 rounded-full bg-zinc-100/50 dark:bg-zinc-900/50 backdrop-blur-md border border-zinc-200 dark:border-white/5 text-[11px] font-mono font-black text-zinc-400 shadow-sm animate-fade-in">
        CONNECTED TO: <span className="text-indigo-500 tracking-wider hover:text-indigo-400 transition-colors">{process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api-musing.nyusoft.in'}</span>
      </div>

      {copyMsg && (
        <div className="fixed top-10 right-10 bg-green-500 text-white px-6 py-3 rounded-2xl shadow-2xl z-50 animate-bounce font-black text-sm uppercase tracking-widest">
          {copyMsg} Copied!
        </div>
      )}

      <div className="w-full grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
        <div className="flex flex-col gap-4 p-6 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">System Status</p>
          <div className="flex items-center gap-3">
            {loading ? (
              <div className="animate-pulse bg-zinc-300 dark:bg-zinc-700 h-6 w-24 rounded-full"></div>
            ) : (
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                data?.status === 'success' 
                  ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' 
                  : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
              }`}>
                <span className={`h-2 w-2 rounded-full ${data?.status === 'success' ? 'bg-green-500 animate-ping' : 'bg-red-500'}`}></span>
                {data?.message || 'Offline'}
              </span>
            )}
          </div>
        </div>

        <div className="flex flex-col gap-4 p-6 rounded-xl bg-zinc-50 dark:bg-zinc-800/50">
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">Active Role (Demo)</p>
          <div className="flex gap-2">
            {["user", "admin", "organization"].map((role) => (
              <button
                key={role}
                onClick={() => setActiveRole(role)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${
                  activeRole === role 
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-black scale-105' 
                    : 'bg-zinc-200 text-zinc-600 dark:bg-zinc-700 dark:text-zinc-300 hover:bg-zinc-300'
                }`}
              >
                {role.charAt(0).toUpperCase() + role.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="w-full grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
        {/* Left Column: Routes List */}
        <div className={`flex flex-col gap-3 transition-all duration-500 ${selectedRoute ? 'lg:col-span-4' : 'lg:col-span-12'}`}>
          <p className="text-xs font-bold uppercase tracking-widest text-zinc-400 mb-1">Available Routes</p>
          <div className="grid grid-cols-1 gap-2">
            {routes.map((route, idx) => (
              <div
                key={route.path}
                onClick={() => setSelectedRoute(route)}
                style={{ animationDelay: `${route.animationDelay}s` }}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer group animate-fade-in-up ${
                  selectedRoute?.path === route.path 
                    ? 'border-purple-500 bg-purple-500/5 ring-2 ring-purple-500/20' 
                    : 'border-zinc-100 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-800/20 hover:border-purple-500/30'
                }`}
              >
                <div className="flex items-center gap-4">
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center transition-colors ${
                    selectedRoute?.path === route.path ? 'bg-purple-500 text-white' : 'bg-zinc-100 dark:bg-zinc-800 group-hover:bg-purple-500/10 group-hover:text-purple-500'
                  }`}>
                    <div className={`h-5 w-5 border-2 rounded-sm ${
                      selectedRoute?.path === route.path ? 'border-white' : 'border-zinc-300 dark:border-zinc-600 group-hover:border-purple-400'
                    }`}></div>
                  </div>
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className={`text-[8px] font-black px-1.5 py-0.5 rounded-md ${
                        route.method === 'POST' ? 'bg-amber-500/20 text-amber-500' : 
                        route.method === 'PUT' ? 'bg-blue-500/20 text-blue-500' : 
                        route.method === 'DELETE' ? 'bg-red-500/20 text-red-500' : 
                        'bg-green-500/20 text-green-500'
                      }`}>
                        {route.method}
                      </span>
                      <span className={`text-sm font-black ${selectedRoute?.path === route.path ? 'text-purple-600 dark:text-purple-400' : 'text-zinc-900 dark:text-zinc-100'}`}>{route.label}</span>
                    </div>
                    <span className="text-[10px] text-zinc-500 font-mono font-bold tracking-tight mt-0.5 truncate max-w-[150px]">{route.path}</span>
                  </div>
                </div>
                <div className={`${selectedRoute?.path === route.path ? 'opacity-100' : 'opacity-0'} group-hover:opacity-100 transition-opacity text-purple-500`}>
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="m9 18 6-6-6-6"/></svg>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Integration Details */}
        <div className={`lg:col-span-8 transition-all duration-500 ${selectedRoute ? 'opacity-100 scale-100' : 'opacity-0 scale-95 pointer-events-none hidden lg:block lg:invisible'}`}>
          {selectedRoute ? (
            <div className="w-full p-8 rounded-3xl bg-zinc-50 dark:bg-zinc-900/50 text-zinc-900 dark:text-zinc-100 shadow-2xl animate-fade-in-up border border-zinc-200 dark:border-white/5">
              <div className="flex items-center justify-between mb-8">
                <div className="flex flex-col">
                  <h3 className="text-sm font-black uppercase tracking-[0.3em] text-purple-600 dark:text-purple-400">Request Integration</h3>
                  <p className="text-xs text-zinc-500 font-black mt-1">{selectedRoute.label}</p>
                </div>
                <button onClick={() => setSelectedRoute(null)} className="h-10 w-10 rounded-full flex items-center justify-center bg-zinc-200 dark:bg-white/5 hover:bg-zinc-300 dark:hover:bg-white/10 transition-colors">
                  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              
              <div className="flex flex-col gap-8">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">Bearer Token</span>
                      <input 
                        type="text" 
                        placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6..."
                        value={authToken}
                        onChange={(e) => setAuthToken(e.target.value)}
                        className="w-full p-4 bg-white dark:bg-black/50 rounded-2xl border border-zinc-200 dark:border-white/10 text-xs font-mono text-purple-600 dark:text-purple-300 placeholder:text-zinc-300 dark:placeholder:text-zinc-800 focus:outline-none focus:border-purple-500 transition-all font-bold"
                      />
                    </div>
                    <div className="flex flex-col gap-2">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em] px-1">API Key (x-api-key)</span>
                      <input 
                        type="text" 
                        placeholder="your_api_key_here"
                        value={apiKey}
                        onChange={(e) => setApiKey(e.target.value)}
                        className="w-full p-4 bg-white dark:bg-black/50 rounded-2xl border border-zinc-200 dark:border-white/10 text-xs font-mono text-amber-600 dark:text-amber-300 placeholder:text-zinc-300 dark:placeholder:text-zinc-800 focus:outline-none focus:border-amber-500 transition-all font-bold"
                      />
                    </div>
                  </div>

                  <div className="flex flex-col gap-2">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Endpoint</span>
                      <button onClick={() => copyToClipboard(`http://localhost:5000${selectedRoute.path}`, 'URL')} className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-transform uppercase tracking-widest">Copy URL</button>
                    </div>
                    <div className="flex items-center gap-3 p-4 bg-white dark:bg-black/50 rounded-2xl border border-zinc-200 dark:border-white/10 h-full">
                      <span className={`text-[10px] font-black px-2 py-1 rounded-md ${
                        selectedRoute.method === 'POST' ? 'bg-amber-500 text-white' : 
                        selectedRoute.method === 'PUT' ? 'bg-blue-500 text-white' : 
                        selectedRoute.method === 'DELETE' ? 'bg-red-500 text-white' : 
                        'bg-green-500 text-white'
                      }`}>
                        {selectedRoute.method}
                      </span>
                      <code className="text-xs font-mono text-zinc-800 dark:text-zinc-300 truncate font-black">{selectedRoute.path}</code>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Payload Configuration</span>
                    <div className="flex items-center gap-4">
                      <button onClick={() => copyToClipboard(JSON.stringify(selectedRoute.body, null, 2), 'Body')} className="text-[10px] font-black text-indigo-600 dark:text-indigo-400 hover:scale-105 transition-transform uppercase tracking-widest">Copy Body</button>
                      <span className="text-[10px] font-black text-zinc-400 dark:text-zinc-600 uppercase tracking-widest bg-zinc-200 dark:bg-white/5 px-2 py-1 rounded-md">
                        {Array.isArray(selectedRoute.body) ? 'Multipart' : 'JSON'}
                      </span>
                    </div>
                  </div>
                  {selectedRoute.body ? (
                    <textarea
                      value={editableBody}
                      onChange={(e) => setEditableBody(e.target.value)}
                      className="w-full p-6 rounded-2xl bg-white dark:bg-black text-[13px] font-mono leading-relaxed text-zinc-700 dark:text-zinc-400 border border-zinc-200 dark:border-white/5 custom-scrollbar h-64 overflow-auto font-bold shadow-inner focus:outline-none focus:border-indigo-500/50 resize-none translate-all duration-300"
                      spellCheck={false}
                    />
                  ) : (
                    <div className="p-10 rounded-2xl bg-white dark:bg-black border border-zinc-200 dark:border-white/5 italic text-sm text-zinc-400 dark:text-zinc-700 font-black border-dashed text-center">
                      NO PAYLOAD REQUIRED
                    </div>
                  )}
                </div>

                <button 
                  onClick={handleRunApi}
                  disabled={executing}
                  className={`w-full py-5 rounded-2xl font-black uppercase tracking-[0.3em] text-md transition-all shadow-2xl active:scale-[0.98] ${
                    executing 
                      ? 'bg-zinc-200 dark:bg-zinc-800 text-zinc-400 dark:text-zinc-600 cursor-not-allowed' 
                      : 'bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white hover:shadow-indigo-500/30'
                  }`}
                >
                  {executing ? (
                    <span className="flex items-center justify-center gap-3">
                      <span className="h-5 w-5 border-3 border-white/20 border-t-white rounded-full animate-spin"></span>
                      TESTING ENDPOINT...
                    </span>
                  ) : 'EXECUTE API CALL'}
                </button>

                {apiResponse && (
                  <div className="flex flex-col gap-3 animate-fade-in-up">
                    <div className="flex items-center justify-between px-1">
                      <span className="text-[10px] font-black text-zinc-500 uppercase tracking-[0.2em]">Server Response</span>
                      <div className="flex items-center gap-4">
                        <button onClick={() => copyToClipboard(JSON.stringify(apiResponse.data, null, 2), 'Response')} className="text-[10px] font-black text-green-600 hover:scale-105 transition-transform uppercase tracking-widest">Copy Result</button>
                        <span className={`text-[10px] font-black px-2 py-1 rounded-md shadow-sm ${
                          apiResponse.status >= 200 && apiResponse.status < 300 ? 'bg-green-500 text-white' : 'bg-red-500 text-white'
                        }`}>
                          {apiResponse.status} {apiResponse.statusText}
                        </span>
                      </div>
                    </div>
                    <pre className="p-6 rounded-2xl bg-white dark:bg-black text-[13px] font-mono leading-relaxed text-zinc-800 dark:text-green-500 border border-zinc-200 dark:border-white/5 custom-scrollbar max-h-80 overflow-auto font-bold shadow-inner">
                      {typeof apiResponse.data === 'string' ? apiResponse.data : JSON.stringify(apiResponse.data, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[400px] flex flex-col items-center justify-center p-12 rounded-3xl border-2 border-dashed border-zinc-100 dark:border-white/5 opacity-50">
              <div className="h-16 w-16 rounded-2xl bg-zinc-100 dark:bg-white/5 flex items-center justify-center mb-4">
                <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-zinc-300"><path d="m9 18 6-6-6-6"/></svg>
              </div>
              <p className="text-sm font-black text-zinc-400 uppercase tracking-widest">Select a route to view integration</p>
            </div>
          )}
        </div>
      </div>

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar { width: 4px; height: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #333; border-radius: 10px; }
        
        @keyframes fade-in {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes reveal-down {
          from { opacity: 0; transform: translateY(-20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes reveal-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes shimmer {
          0% { background-position: -200% center; }
          100% { background-position: 200% center; }
        }

        @keyframes pulse-slow {
          0%, 100% { opacity: 0.3; transform: scale(1); }
          50% { opacity: 0.6; transform: scale(1.1); }
        }

        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(10px); }
          to { opacity: 1; transform: translateY(0); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0); }
          50% { transform: translateY(-10px); }
        }

        .animate-float { animation: float 6s ease-in-out infinite; }

        .animate-fade-in { animation: fade-in 1s ease-out forwards; }
        .animate-reveal-down { animation: reveal-down 1s cubic-bezier(0.16, 1, 0.3, 1) 0.2s forwards; }
        .animate-reveal-up { animation: reveal-up 1s cubic-bezier(0.16, 1, 0.3, 1) 0.5s forwards; }
        
        .animate-shimmer {
          background-size: 200% auto;
          animation: shimmer 5s linear infinite;
        }

        .animate-pulse-slow {
          animation: pulse-slow 8s ease-in-out infinite;
        }

        .animate-fade-in-up {
          animation: fade-in-up 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }
      `}</style>
    </div>
  );
}

