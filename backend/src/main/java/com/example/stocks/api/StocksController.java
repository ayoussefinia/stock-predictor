package com.example.stocks.api;

import com.example.stocks.price.PriceBar;
import com.example.stocks.service.PredictService;
import com.example.stocks.service.StockService;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = {"http://localhost:3000", "https://stock-predictor-1-rrvs.onrender.com"})
public class StocksController {

  private final StockService stockService;
  private final PredictService predictService;

  public StocksController(StockService stockService, PredictService predictService) {
    this.stockService = stockService;
    this.predictService = predictService;
  }

  @PostMapping("/refresh/{ticker}")
  public Map<String, Object> refresh(@PathVariable("ticker") String ticker) {
    int inserted = stockService.refresh(ticker);
    return Map.of("ticker", ticker.toUpperCase(), "inserted", inserted);
  }

  @GetMapping("/prices/{ticker}")
  public List<PriceBar> prices(@PathVariable("ticker") String ticker) {
    return stockService.getLatest(ticker);
  }

  @GetMapping("/predict/{ticker}")
  public PredictService.Prediction predict(@PathVariable("ticker") String ticker) {
    List<PriceBar> bars = stockService.getLatest(ticker);
    return predictService.predictNext(bars);
  }
}
