"use client";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceDot,
} from "recharts";

type PriceRow = {
  id: number;
  ticker: string;
  date: string; // YYYY-MM-DD
  close: number;
};

type Props = {
  prices: PriceRow[];
  predictedClose?: number | null;   // e.g. 190.55
  predictedDateLabel?: string;      // e.g. "Next"
};

export default function PriceChart({
  prices,
  predictedClose,
  predictedDateLabel = "Predicted",
}: Props) {
  if (!prices?.length) return null;

  const data = prices.map((p) => ({
    date: p.date,
    close: p.close,
  }));

  const last = data[data.length - 1];

  // We add an extra x-axis label for the prediction, so it appears at the end.
  const dataWithPrediction =
    typeof predictedClose === "number"
      ? [...data, { date: predictedDateLabel, close: predictedClose }]
      : data;

  return (
    <div style={{ width: "100%", height: 360 }}>
      <ResponsiveContainer>
        <LineChart data={dataWithPrediction} margin={{ top: 16, right: 20, left: 0, bottom: 8 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" minTickGap={24} />
          <YAxis domain={["auto", "auto"]} />
          <Tooltip
            formatter={(value: any) => [Number(value).toFixed(2), "Close"]}
          />

          {/* Actual series */}
          <Line
            type="monotone"
            dataKey="close"
            dot={false}
            strokeWidth={2}
            isAnimationActive={false}
          />

          {/* Predicted point: visually distinct */}
          {typeof predictedClose === "number" && (
            <ReferenceDot
              x={predictedDateLabel}
              y={predictedClose}
              r={7}
              strokeWidth={3}
              label={{
                value: `Pred ${predictedClose.toFixed(2)}`,
                position: "top",
              }}
            />
          )}

          {/* Optional: show the last actual point too (helps visually) */}
          {last && (
            <ReferenceDot
              x={last.date}
              y={last.close}
              r={4}
              strokeWidth={2}
            />
          )}
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
