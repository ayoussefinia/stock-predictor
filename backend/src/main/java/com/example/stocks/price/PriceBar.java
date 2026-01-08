package com.example.stocks.price;

import jakarta.persistence.*;
import java.time.LocalDate;

@Entity
@Table(name = "price_bars", uniqueConstraints = {
    @UniqueConstraint(columnNames = {"ticker", "date"})
})
public class PriceBar {

  @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
  private Long id;

  @Column(nullable = false)
  private String ticker;

  @Column(nullable = false)
  private LocalDate date;

  @Column(nullable = false)
  private double close;

  protected PriceBar() {}

  public PriceBar(String ticker, LocalDate date, double close) {
    this.ticker = ticker.toUpperCase();
    this.date = date;
    this.close = close;
  }

  public Long getId() { return id; }
  public String getTicker() { return ticker; }
  public LocalDate getDate() { return date; }
  public double getClose() { return close; }
}
