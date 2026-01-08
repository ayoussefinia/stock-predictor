"use client";

import { useMemo, useState } from "react";

type Prediction = {
  nextClose: number;
  direction: "UP" | "DOWN" | "FLAT" | "UNKNOWN";
  model: string;
};

export default function Home() {
  const [ticker, setTicker] = useState("NVDA");
  const [status, setStatus] = useState<string>("");
  const [pred, setPred] = useState<Prediction | null>(null);

  const apiBase = useMemo(() => {
    return process.env.NEXT_PUBLIC_API_BASE || "http://localhost:8080";
  }, []);

  async function refresh() {
    setStatus("Refreshing...");
    setPred(null);
    const res = await fetch(`${apiBase}/api/refresh/${encodeURIComponent(ticker)}`, {
      method: "POST"
    });
    const json = await res.json();
    setStatus(`Inserted ${json.inserted} rows for ${json.ticker}`);
  }

  async function predict() {
    setStatus("Predicting...");
    const res = await fetch(`${apiBase}/api/predict/${encodeURIComponent(ticker)}`);
    const json = (await res.json()) as Prediction;
    setPred(json);
    setStatus("Done.");
  }

  return (
    <main style={{ padding: 24, fontFamily: "system-ui" }}>
      <h1>Stock Predictor (Demo)</h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: 12 }}>
        <label>
          Ticker:&nbsp;
          <input
            value={ticker}
            onChange={(e) => setTicker(e.target.value.toUpperCase())}
            style={{ padding: 8 }}
          />
        </label>

        <button onClick={refresh} style={{ padding: "8px 12px" }}>
          Refresh Data
        </button>
        <button onClick={predict} style={{ padding: "8px 12px" }}>
          Predict
        </button>
      </div>

      <p style={{ marginTop: 12 }}>{status}</p>

      {pred && (
        <div style={{ marginTop: 16, padding: 12, border: "1px solid #ddd", borderRadius: 8 }}>
          <div><b>Direction:</b> {pred.direction}</div>
          <div><b>Predicted next close:</b> {Number.isFinite(pred.nextClose) ? pred.nextClose : "N/A"}</div>
          <div><b>Model:</b> {pred.model}</div>
        </div>
      )}

      <p style={{ marginTop: 24, opacity: 0.7 }}>
        Tip: set <code>ALPHAVANTAGE_API_KEY</code> to fetch real data; otherwise it uses a fake series so the demo still works.
      </p>
    </main>
  );
}
