"use client";

import { useMemo, useState } from "react";
import PriceChart from "../components/PriceChart";

type PriceRow = {
  id: number;
  ticker: string;
  date: string; // YYYY-MM-DD
  close: number;
};

type RefreshResult = {
  ticker: string;
  inserted: number;
};

type PredictionResult = {
  ticker: string;
  nextClose: number;
};

export default function HomePage() {
  const [ticker, setTicker] = useState("NVDA");

  const [prices, setPrices] = useState<PriceRow[]>([]);
  const [refresh, setRefresh] = useState<RefreshResult | null>(null);

  const [prediction, setPrediction] = useState<PredictionResult | null>(null);

  const [loadingFetch, setLoadingFetch] = useState(false);
  const [loadingPredict, setLoadingPredict] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lastClose = useMemo(() => {
    if (!prices.length) return null;
    return prices[prices.length - 1].close;
  }, [prices]);

  const direction = useMemo(() => {
    if (lastClose == null || prediction?.nextClose == null) return null;
    return prediction.nextClose >= lastClose ? "Up" : "Down";
  }, [lastClose, prediction]);

  async function handleFetch() {
    const t = ticker.trim().toUpperCase();
    if (!t) return;

    setError(null);
    setLoadingFetch(true);
    setPrediction(null); // reset prediction so dot/table disappears on new fetch
    setRefresh(null);

    try {
      // Optional: refresh pulls from AlphaVantage and inserts into DB
      const refreshRes = await fetch(`http://localhost:8080/api/refresh/${t}`, {
        method: "POST",
      });
      const refreshJson = (await refreshRes.json()) as RefreshResult;
      setRefresh(refreshJson);

      // Then load prices from DB
      const pricesRes = await fetch(`http://localhost:8080/api/prices/${t}`);
      const pricesJson = (await pricesRes.json()) as PriceRow[];
      setPrices(pricesJson);
    } catch (e: any) {
      console.error(e);
      setError("Failed to fetch data. Check backend logs.");
    } finally {
      setLoadingFetch(false);
    }
  }

  async function handlePredict() {
    const t = ticker.trim().toUpperCase();
    if (!t || !prices.length) return;

    setError(null);
    setLoadingPredict(true);

    try {
      const predRes = await fetch(`http://localhost:8080/api/predict/${t}`);
      const predJson = (await predRes.json()) as PredictionResult;
      setPrediction(predJson);
    } catch (e: any) {
      console.error(e);
      setError("Failed to predict. Check backend logs.");
    } finally {
      setLoadingPredict(false);
    }
  }

  return (
    <main style={{ padding: 24, maxWidth: 1100, margin: "0 auto" }}>
      <h1 style={{ fontSize: 28, fontWeight: 650, marginBottom: 12 }}>
        Stock Predictor
      </h1>

      <div style={{ display: "flex", gap: 12, alignItems: "center", marginBottom: 16 }}>
        <label style={{ fontWeight: 600 }}>Ticker</label>
        <input
          value={ticker}
          onChange={(e) => setTicker(e.target.value.toUpperCase())}
          style={{ padding: 8, fontSize: 16, width: 140 }}
          placeholder="NVDA"
        />

        <button
          onClick={handleFetch}
          disabled={loadingFetch}
          style={{ padding: "8px 14px", fontSize: 16, cursor: "pointer" }}
        >
          {loadingFetch ? "Fetching…" : "Fetch data"}
        </button>

        {refresh && (
          <div style={{ fontSize: 14, opacity: 0.8 }}>
            Inserted: <b>{refresh.inserted}</b>
          </div>
        )}
      </div>

      {error && (
        <div style={{ padding: 10, border: "1px solid #ccc", marginBottom: 12 }}>
          {error}
        </div>
      )}

      {/* Chart */}
      {prices.length > 0 && (
        <>
          <PriceChart
            prices={prices}
            predictedClose={prediction?.nextClose ?? null}
            predictedDateLabel="Next"
          />

          <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center" }}>
            <button
              onClick={handlePredict}
              disabled={loadingPredict || prices.length === 0}
              style={{ padding: "8px 14px", fontSize: 16, cursor: "pointer" }}
            >
              {loadingPredict ? "Predicting…" : "Predict"}
            </button>

            {lastClose != null && (
              <div style={{ fontSize: 14, opacity: 0.8 }}>
                Last close: <b>{lastClose.toFixed(2)}</b>
              </div>
            )}
          </div>
        </>
      )}

      {/* Table appears only after Predict */}
      {prediction && (
        <div style={{ marginTop: 18 }}>
          <h2 style={{ fontSize: 18, marginBottom: 8 }}>Prediction</h2>

          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={th}>Ticker</th>
                <th style={th}>Next close prediction</th>
                <th style={th}>Direction</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={td}>{ticker.trim().toUpperCase()}</td>
                <td style={td}>{prediction.nextClose.toFixed(2)}</td>
                <td style={td}>
                  {direction ?? "—"}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </main>
  );
}

const th: React.CSSProperties = {
  textAlign: "left",
  borderBottom: "1px solid #ddd",
  padding: "10px 8px",
  fontWeight: 650,
};

const td: React.CSSProperties = {
  borderBottom: "1px solid #eee",
  padding: "10px 8px",
};
