import { createRoot } from "react-dom/client";
import "./index.css";

console.log("🚀 Initializing Pawtectors App...");

async function mountApp() {
  const rootEl = document.getElementById("root");
  if (!rootEl) return;

  try {
    const { default: App } = await import("./App.tsx");
    createRoot(rootEl).render(<App />);
    console.log("✅ App mounted successfully");
  } catch (err: any) {
    console.error("❌ Fatal App Load Error:", err);
    rootEl.innerHTML = `
      <div style="padding: 2rem; color: #dc2626; background: #fef2f2; border: 2px solid #fca5a5; border-radius: 1rem; margin: 2rem; font-family: system-ui, sans-serif;">
        <h2 style="margin-top: 0; font-size: 1.5rem;">⚠️ Fatal Application Load Error</h2>
        <p style="color: #444;">The application failed during module initialization:</p>
        <pre style="white-space: pre-wrap; word-break: break-all; background: #1c1917; color: #f87171; padding: 1rem; border-radius: 0.5rem; font-size: 0.875rem;">${err?.stack || err}</pre>
        <button onclick="location.reload()" style="margin-top: 1rem; padding: 0.75rem 1.5rem; background: #007a65; color: white; border: none; border-radius: 0.5rem; cursor: pointer; font-weight: bold;">
          Reload Page
        </button>
      </div>
    `;
  }
}

mountApp();
