# BMTC Namma Ride (ನಮ್ಮ ಬಸ್) - Flutter Mobile Application

A complete, interconnected Flutter mobile application for the **BMTC Namma Ride** transit bus ticket booking system, built with **Flutter 3.x**, **Material 3**, **Provider state management**, and **GoRouter navigation**.

---

## 🎨 Design System & Visual Guidelines
- **Primary Color:** `#C8102E` (BMTC Transit Red)
- **Background / Surface:** `#F9F9FF`, `#FFFFFF` cards with subtle drop shadows (`0 2px 10px rgba(0,0,0,0.06)`), and `#F0F3FF` for secondary containers.
- **Accents & Badges:** Emerald green (`#10B981`) for confirmed statuses and AC tags, royal blue (`#2563EB`) for Volvo Vajra, orange (`#F97316`) for peak hours and seat warnings.
- **Typography:** Inter / Roboto with bilingual Kannada/English support (`ನಮ್ಮ ಬಸ್` / `BMTC Namma Ride`).
- **Corner Radius:** 12–16px rounded cards and standard 8–10px inputs.

---

## 🗺️ Screen Flow & Architecture

```
                 ┌────────────────────────────────┐
                 │  Screen 1: Booking & Search    │  Path: /
                 │  - Boarding / Alighting stops  │
                 │  - Passenger & date inputs     │
                 │  - Bus selection & filter chips│
                 └───────────────┬────────────────┘
                                 │
                                 │ Tapping "Book Now 🎫"
                                 ▼
                 ┌────────────────────────────────┐
                 │  Screen 2: Multi-Passenger     │  Path: /checkout
                 │            Checkout            │
                 │  - Route summary & GPS active  │
                 │  - Multi-ticket steppers       │
                 │  - Dynamic passenger forms     │
                 │  - Real-time fare breakdown    │
                 │  - Payment method selector     │
                 └───────────────┬────────────────┘
                                 │
                                 │ Mock UPI payment processing
                                 ▼
                 ┌────────────────────────────────┐
                 │  Screen 3: Confirmed Ticket &  │  Path: /confirmation/:ticketId
                 │            Active Pass         │
                 │  - Perforated ticket card      │
                 │  - Conductor digital QR code   │
                 │  - Seat numbers & travel specs │
                 │  - Live mini-map bus tracker   │
                 │  - PDF receipt / Share sheet   │
                 └────────────────────────────────┘
```

---

## 📦 Directory Structure

```
book a ticket/
├── analysis_options.yaml
├── pubspec.yaml
├── preview.html                     <-- Instant interactive web simulator
├── web/
│   ├── index.html
│   └── manifest.json
└── lib/
    ├── main.dart                    <-- App entry point with Provider & GoRouter
    ├── models/
    │   ├── bus_route.dart           <-- BusRoute model & mock routes (335E, 500C, V600, 401K)
    │   ├── passenger.dart           <-- Passenger entity, PassengerType enum & copyWith
    │   ├── payment_method.dart      <-- PaymentType enum & metadata
    │   └── ticket_booking.dart      <-- TicketBooking model with seat allocation & QR data
    ├── providers/
    │   └── booking_provider.dart    <-- Central state manager for routes, steppers, fares & tickets
    ├── router/
    │   └── app_router.dart          <-- GoRouter setup for /, /checkout, /confirmation/:ticketId
    ├── theme/
    │   └── app_theme.dart           <-- BMTC color palette, Material 3 ThemeData & shadows
    ├── widgets/
    │   ├── bmtc_app_bar.dart        <-- BMTC top app bar with Kannada badge & profile sheet
    │   ├── bus_card_tile.dart       <-- Interactive bus card tile with selected accent border
    │   ├── passenger_stepper.dart   <-- Stepper row with subtotal calculation
    │   ├── perforated_ticket_card.dart <-- Authentic perforated ticket with cutout notches
    │   ├── qr_code_widget.dart      <-- Custom-painted 2D QR matrix with conductor scan dialog
    │   ├── mini_route_map.dart      <-- Canvas map route graphic with live arrival countdown
    │   └── live_tracking_sheet.dart <-- Stop-by-stop GPS telemetry modal bottom sheet
    └── screens/
        ├── booking_search_screen.dart <-- Screen 1: Search & Route Selection (/)
        ├── checkout_screen.dart     <-- Screen 2: Multi-Passenger Checkout (/checkout)
        └── confirmation_screen.dart <-- Screen 3: Confirmed Ticket & Active Pass (/confirmation/:ticketId)
```

---

## 🚀 How to Run the App

### 1. Flutter Mobile / Web / Desktop
```bash
# 1. Fetch dependencies
flutter pub get

# 2. Run on connected Android / iOS device or Chrome
flutter run -d chrome
# or
flutter run -d android
```

### 2. Instant Browser Preview
Double-click or open `preview.html` in Chrome / Edge / Safari to immediately test the responsive mobile simulation with full tap flows, steppers, dynamic passenger cards, and live ticket validation!

