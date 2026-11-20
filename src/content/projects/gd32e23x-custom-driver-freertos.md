---
title: gd32e23x-custom-driver-freertos
summary: GD32E23x peripheral and device drivers for FreeRTOS firmware.
area: personal
repos:
  - { name: gd32e23x-custom-driver-freertos, url: "https://github.com/AhmedKishki/gd32e23x-custom-driver-freertos", note: "MIT" }
languages: [C]
started: "2026-08"
updated: "2026-11"
status: Version 1.0.0
order: 5
draft: false
---

A driver library for the GD32E23x (Cortex-M23) under FreeRTOS. Each driver is a folder with its source, header and README. The firmware lists the drivers it links in a manifest and supplies their settings in `product.h`, as it supplies `FreeRTOSConfig.h`.

- **Peripherals:** ADC, clock, flash, GPIO, I2C, LIN, UART.
- **Devices:** TI BQ4050 battery gauge, onsemi FXL6408 I/O expander, Lumissil IS31FL3237 LED driver, TI LP5817 RGB LED driver, Microchip PAC1711 and PAC1921 power monitors, TI TPS25751D USB-C PD controller.
