package com.example.stocks.provider;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;
import org.springframework.web.reactive.function.client.WebClient;

import java.time.LocalDate;
import java.util.*;

@Component
public class AlphaVantageProvider implements PriceProvider {

  private final WebClient webClient;
  private final String apiKey;
  private final FakeProvider fakeProvider;

  public AlphaVantageProvider(
      @Value("${ALPHAVANTAGE_API_KEY:}") String apiKey
  ) {
    this.webClient = WebClient.builder().baseUrl("https://www.alphavantage.co").build();
    this.apiKey = apiKey == null ? "" : apiKey.trim();
    this.fakeProvider = new FakeProvider();
  }

  @Override
  public List<DailyClose> fetchDailyCloses(String ticker) {
    if (apiKey.isEmpty()) {
      return fakeProvider.fetchDailyCloses(ticker);
    }

    // Alpha Vantage: TIME_SERIES_DAILY_ADJUSTED
    Map<?, ?> json = webClient.get()
        .uri(uriBuilder -> uriBuilder
            .path("/query")
            .queryParam("function", "TIME_SERIES_DAILY")
            .queryParam("symbol", ticker.toUpperCase())
            .queryParam("outputsize", "compact")
            .queryParam("apikey", apiKey)
            .build())
        .retrieve()
        .bodyToMono(Map.class)
        .block();

    if (json == null) return List.of();

    // Alpha Vantage sometimes returns non-data payloads with HTTP 200
    if (json.containsKey("Information") || json.containsKey("Note") || json.containsKey("Error Message")) {
      System.out.println("AlphaVantage non-data payload for " + ticker + ": " + json);
      return List.of();
    }


    Object seriesObj = json.get("Time Series (Daily)");
    if (!(seriesObj instanceof Map<?, ?> series)) return List.of();

    // series: date -> { "4. close": "...", ... }
    List<DailyClose> closes = new ArrayList<>();
    for (Map.Entry<?, ?> e : series.entrySet()) {
      String dateStr = String.valueOf(e.getKey());
      Object dayObj = e.getValue();
      if (!(dayObj instanceof Map<?, ?> dayMap)) continue;

      // Use "4. close"
      Object closeStr = dayMap.get("4. close");
      if (closeStr == null) continue;

      try {
        LocalDate date = LocalDate.parse(dateStr);
        double close = Double.parseDouble(String.valueOf(closeStr));
        closes.add(new DailyClose(date, close));
      } catch (Exception ignored) {}
    }

    // Oldest -> newest
    closes.sort(Comparator.comparing(DailyClose::date));
    return closes;
  }
}
