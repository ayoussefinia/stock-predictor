package com.example.stocks.price;

import org.springframework.data.jpa.repository.JpaRepository;
import java.time.LocalDate;
import java.util.List;

public interface PriceBarRepository extends JpaRepository<PriceBar, Long> {
  List<PriceBar> findTop200ByTickerOrderByDateAsc(String ticker);
  List<PriceBar> findTop200ByTickerOrderByDateDesc(String ticker);
  boolean existsByTickerAndDate(String ticker, LocalDate date);
}
