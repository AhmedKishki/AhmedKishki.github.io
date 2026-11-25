---
title: NRF54L15_FLPR_SYSBUILD
summary: Zephyr firmware for a five-button nRF54L15 remote control (ARM + RISC-V).
area: personal
repos:
  - { name: NRF54L15_FLPR_SYSBUILD, url: "https://github.com/AhmedKishki/NRF54L15_FLPR_SYSBUILD" }
languages: [C]
started: "2026-06"
updated: "2026-06"
order: 6
---

I built this as my first Zephyr project to learn how the main core starts the FLPR and how the two cores communicate.

- The **ARM Cortex-M33** reads the buttons, reports presses over LIN and provides a Bluetooth LE UART service.
- The **RISC-V FLPR** receives button events over Zephyr IPC and drives five WS2812 RGB LEDs for high-beam and turn-signal feedback.
