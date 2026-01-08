package com.example.stocks.provider;

import java.util.List;

public interface PriceProvider {
  /**
   * Returns last ~100-200 daily closes, oldest -> newest.
   * Keep it simple: close-only.
   */
  List<DailyClose> fetchDailyCloses(String ticker);
}
