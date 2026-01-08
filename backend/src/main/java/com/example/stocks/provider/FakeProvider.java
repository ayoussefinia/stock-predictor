package com.example.stocks.provider;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;
import java.util.Random;

public class FakeProvider implements PriceProvider {

  @Override
  public List<DailyClose> fetchDailyCloses(String ticker) {
    Random r = new Random(ticker.toUpperCase().hashCode());
    List<DailyClose> out = new ArrayList<>();
    double price = 100 + r.nextDouble() * 50;

    LocalDate start = LocalDate.now().minusDays(160);
    for (int i = 0; i < 150; i++) {
      // random walk
      price = Math.max(1.0, price + (r.nextGaussian() * 1.5));
      out.add(new DailyClose(start.plusDays(i), round2(price)));
    }
    return out;
  }

  private static double round2(double x) {
    return Math.round(x * 100.0) / 100.0;
  }
}
