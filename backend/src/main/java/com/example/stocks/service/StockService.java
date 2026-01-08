package com.example.stocks.service;

import com.example.stocks.price.PriceBar;
import com.example.stocks.price.PriceBarRepository;
import com.example.stocks.provider.DailyClose;
import com.example.stocks.provider.PriceProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class StockService {

  private final PriceProvider provider;
  private final PriceBarRepository repo;

  public StockService(PriceProvider provider, PriceBarRepository repo) {
    this.provider = provider;
    this.repo = repo;
  }

  @Transactional
  public int refresh(String ticker) {
    ticker = ticker.toUpperCase();
    List<DailyClose> closes = provider.fetchDailyCloses(ticker);

    int inserted = 0;
    for (DailyClose dc : closes) {
      if (!repo.existsByTickerAndDate(ticker, dc.date())) {
        repo.save(new PriceBar(ticker, dc.date(), dc.close()));
        inserted++;
      }
    }
    return inserted;
  }

  public List<PriceBar> getLatest(String ticker) {
    return repo.findTop200ByTickerOrderByDateAsc(ticker.toUpperCase());
  }
}
