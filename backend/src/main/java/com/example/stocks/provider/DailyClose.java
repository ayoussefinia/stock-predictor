package com.example.stocks.provider;

import java.time.LocalDate;

public record DailyClose(LocalDate date, double close) {}
