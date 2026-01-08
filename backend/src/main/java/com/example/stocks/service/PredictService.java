package com.example.stocks.service;

import com.example.stocks.price.PriceBar;
import org.springframework.stereotype.Service;
import smile.timeseries.AR;

import java.util.List;

@Service
public class PredictService {

  public Prediction predictNext(List<PriceBar> bars) {
    if (bars == null || bars.size() < 30) {
      return new Prediction(Double.NaN, "UNKNOWN", "Need >= 30 data points");
    }

    double[] y = bars.stream().mapToDouble(PriceBar::getClose).toArray();
    double last = y[y.length - 1];

    // Simple AR(5). You can tune p later.
    AR model = AR.fit(y, 5);
    double next = model.forecast();

    String direction = (next > last) ? "UP" : (next < last ? "DOWN" : "FLAT");

    return new Prediction(round2(next), direction, "AR(5) on closes");
  }

  private static double round2(double x) {
    return Math.round(x * 100.0) / 100.0;
  }

  public record Prediction(double nextClose, String direction, String model) {}
}
