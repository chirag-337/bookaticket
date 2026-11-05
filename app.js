/**
 * BMTC Namma Ride (ನಮ್ಮ ಬಸ್) - Web Application Client Engine
 * Features: Client-Side Router (History API), Reactive Booking Store,
 * Interactive Steppers, Dynamic Forms, QR Generator, and GPS Radar Tracking.
 */

// 1. DATA MODELS & INITIAL STATE
const BMTC_DATA = {
  stops: [
    'Shivajinagar Bus Station',
    'Whitefield TTMC',
    'Majestic Kempegowda BS',
    'Electronic City Wipro Gate',
    'Silk Board Junction',
    'Banashankari TTMC',
    'Hebbal Flyover',
    'K.R. Puram Railway Station'
  ],
  routes: [
    {
      id: '335e',
      routeNumber: '335E',
      serviceType: 'Non-AC',
      source: 'Shivajinagar',
      destination: 'Whitefield TTMC',
      viaRoute: 'via HAL Old Airport Rd',
      departureTime: '08:45 AM',
      availableSeats: 30,
      baseFare: 35,
      platform: 'Platform 3',
      bay: 'Bay 2'
    },
    {
      id: '500c',
      routeNumber: '500C',
      serviceType: 'AC',
      source: 'Shivajinagar',
      destination: 'Whitefield',
      viaRoute: 'via Marathahalli Bridge',
      departureTime: '08:30 AM',
      availableSeats: 22,
      baseFare: 55,
      platform: 'Platform 1',
      bay: 'Bay 4'
    },
    {
      id: 'v600',
      routeNumber: 'V600',
      serviceType: 'Volvo',
      source: 'Banashankari',
      destination: 'Whitefield Express',
      viaRoute: '(via Shivajinagar)',
      departureTime: '10:00 AM',
      availableSeats: 10,
      baseFare: 90,
      platform: 'Platform 4',
      bay: 'Bay 1'
    },
    {
      id: '401k',
      routeNumber: '401K',
      serviceType: 'AC',
      source: 'Shivajinagar',
      destination: 'Whitefield Metro Concourse',
      viaRoute: 'Direct Concourse Link',
      departureTime: '09:15 AM',
      availableSeats: 18,
      baseFare: 60,
      platform: 'Platform 2',
      bay: 'Bay 3'
    }
  ]
};

// 2. CENTRAL STATE STORE
const Store = {
  boardingStop: 'Shivajinagar Bus Station',
  alightingStop: 'Whitefield TTMC',
  primaryName: 'Arjun Rao',
  primaryPhone: '98765 43210',
  travelDate: 'Today, 05 Nov 2026',
  activeFilter: 'all', // 'all', 'non-ac', 'ac', 'volvo'
  selectedRoute: BMTC_DATA.routes[0],

  // Passenger ticket counters
  adultCount: 2,
  childCount: 0,
  seniorCount: 0,

  // Passenger details
  passengers: [
    { name: 'Rohan Sharma', age: 28, gender: 'Male', mobile: '+91 98450 12345', type: 'adult' },
    { name: 'Priya Sharma', age: 26, gender: 'Female', mobile: '', type: 'adult' },
    { name: 'Aarav Sharma', age: 8, gender: 'Male', mobile: '', type: 'child' }
  ],

  // Payment
  selectedPayment: 'upi', // 'upi', 'smartCard', 'cards'

  // Confirmed Booking
  activeBooking: null,

  // Getters
  get totalTickets() {
    return this.adultCount + this.childCount + this.seniorCount;
  },

  get adultFare() {
    return this.selectedRoute.baseFare;
  },

  get childFare() {
    return Math.round(this.selectedRoute.baseFare * 0.55);
  },

  get seniorFare() {
    return Math.round(this.selectedRoute.baseFare * 0.50);
  },

  get adultSubtotal() {
    return this.adultCount * this.adultFare;
  },

  get childSubtotal() {
    return this.childCount * this.childFare;
  },

  get seniorSubtotal() {
    return this.seniorCount * this.seniorFare;
  },

  get totalFare() {
    return this.adultSubtotal + this.childSubtotal + this.seniorSubtotal;
  },

  // Actions
  swapStops() {
    const temp = this.boardingStop;
    this.boardingStop = this.alightingStop;
    this.alightingStop = temp;
    this.renderScreen1();
    showToast(`Swapped: ${this.boardingStop} ⇄ ${this.alightingStop}`);
  },

  setRoute(routeId) {
    const r = BMTC_DATA.routes.find(x => x.id === routeId);
    if (r) {
      this.selectedRoute = r;
      this.renderScreen1();
      this.renderScreen2();
    }
  },

  setFilter(filter) {
    this.activeFilter = filter;
    this.renderScreen1();
  },

  updateQuickTickets(delta) {
    if (this.adultCount + delta >= 1) {
      this.adultCount += delta;
      this.syncPassengers();
      this.renderScreen1();
    }
  },

  updateAdults(delta) {
    if (this.adultCount + delta >= 0 && (this.adultCount + delta + this.childCount + this.seniorCount >= 1)) {
      this.adultCount += delta;
      this.syncPassengers();
      this.renderScreen2();
    }
  },

  updateChildren(delta) {
    if (this.childCount + delta >= 0 && (this.adultCount + this.childCount + delta + this.seniorCount >= 1)) {
      this.childCount += delta;
      this.syncPassengers();
      this.renderScreen2();
    }
  },

  updateSeniors(delta) {
    if (this.seniorCount + delta >= 0 && (this.adultCount + this.childCount + this.seniorCount + delta >= 1)) {
      this.seniorCount += delta;
      this.syncPassengers();
      this.renderScreen2();
    }
  },

  syncPassengers() {
    const targetCount = this.totalTickets;
    const defaultMock = [
      { name: 'Rohan Sharma', age: 28, gender: 'Male', mobile: '+91 98450 12345', type: 'adult' },
      { name: 'Priya Sharma', age: 26, gender: 'Female', mobile: '', type: 'adult' },
      { name: 'Aarav Sharma', age: 8, gender: 'Male', mobile: '', type: 'child' },
      { name: 'Suresh Rao', age: 62, gender: 'Male', mobile: '', type: 'senior' },
      { name: 'Sunita Rao', age: 58, gender: 'Female', mobile: '', type: 'senior' }
    ];

    while (this.passengers.length < targetCount) {
      const idx = this.passengers.length;
      const isChild = idx >= this.adultCount && idx < this.adultCount + this.childCount;
      const isSenior = idx >= this.adultCount + this.childCount;
      const type = isChild ? 'child' : (isSenior ? 'senior' : 'adult');

      const template = idx < defaultMock.length ? defaultMock[idx] : {
        name: `Passenger ${idx + 1}`,
        age: isChild ? 9 : (isSenior ? 65 : 28),
        gender: 'Male',
        mobile: '',
        type: type
      };

      this.passengers.push({ ...template, type });
    }

    while (this.passengers.length > targetCount) {
      this.passengers.pop();
    }
  },

  renderScreen1() {
    // Stops
    document.getElementById('boardStopLabel').innerText = this.boardingStop;
    document.getElementById('alightStopLabel').innerText = this.alightingStop;
    document.getElementById('summaryStops').innerText = `${this.boardingStop.split(' ')[0]} → ${this.alightingStop.split(' ')[0]}`;

    // Steppers
    document.getElementById('quickCountVal').innerText = this.adultCount;
    document.getElementById('quickAdultsPill').innerText = `Adults: ${this.adultCount}`;
    document.getElementById('quickChildPill').innerText = `Child (Under 12): ${this.childCount}`;

    // Filter Chips
    document.querySelectorAll('.filter-pill').forEach(btn => {
      const f = btn.getAttribute('data-filter');
      btn.classList.toggle('active', f === this.activeFilter);
    });

    // Route Cards
    const container = document.getElementById('busesListContainer');
    container.innerHTML = '';

    const filtered = BMTC_DATA.routes.filter(r => {
      if (this.activeFilter === 'non-ac') return r.serviceType === 'Non-AC';
      if (this.activeFilter === 'ac') return r.serviceType === 'AC';
      if (this.activeFilter === 'volvo') return r.serviceType === 'Volvo';
      return true;
    });

    filtered.forEach(route => {
      const isSelected = this.selectedRoute.id === route.id;
      const card = document.createElement('div');
      card.className = `bus-item-card ${isSelected ? 'selected' : ''}`;
      card.onclick = () => this.setRoute(route.id);

      let badgeClass = 'badge-nonac';
      if (route.serviceType === 'AC') badgeClass = 'badge-ac';
      if (route.serviceType === 'Volvo') badgeClass = 'badge-volvo';

      card.innerHTML = `
        <div class="bus-top-row">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span class="bus-code">${route.routeNumber}</span>
            <span class="badge-service ${badgeClass}">${route.serviceType}</span>
          </div>
          ${isSelected ? `
            <div style="display: flex; align-items: center; gap: 4px; color: var(--emerald); font-weight: 700; font-size: 13px;">
              <span>Selected</span> <i class="fa-solid fa-circle-check"></i>
            </div>
          ` : `
            <div style="width: 18px; height: 18px; border-radius: 50%; border: 2px solid #CBD5E1;"></div>
          `}
        </div>
        <div class="bus-via-route">${route.source} → ${route.destination} ${route.viaRoute}</div>
        <div class="bus-bottom-row">
          <span><i class="fa-regular fa-clock"></i> ${route.departureTime} &nbsp; <i class="fa-solid fa-chair" style="color: ${route.availableSeats <= 12 ? 'var(--orange-badge)' : 'var(--emerald)'};"></i> ${route.availableSeats} seats</span>
          <span class="fare-text">₹${route.baseFare}<span style="font-size: 11px; font-weight: normal; color: var(--text-muted);">/ticket</span></span>
        </div>
      `;
      container.appendChild(card);
    });

    // Sticky Bottom Bar
    const totalQuick = this.selectedRoute.baseFare * this.adultCount;
    document.getElementById('screen1TotalFare').innerText = `₹${totalQuick}`;
    document.getElementById('screen1Subtext').innerText = `${this.selectedRoute.routeNumber} ${this.selectedRoute.serviceType} · ${this.adultCount} Passengers`;
  },

  renderScreen2() {
    const route = this.selectedRoute;

    // Route Summary Card
    document.getElementById('cRouteNumber').innerText = route.routeNumber;
    document.getElementById('cRouteService').innerText = route.serviceType;
    document.getElementById('cDepartureTime').innerText = route.departureTime;
    document.getElementById('cBoardingStop').innerText = this.boardingStop;
    document.getElementById('cAlightingStop').innerText = this.alightingStop;
    document.getElementById('cPlatformBay').innerText = `${route.platform} · ${route.bay}`;
    document.getElementById('cSeatsLeft').innerText = `${route.availableSeats} Seats Left`;

    // Steppers Display
    document.getElementById('cTotalTicketsBadge').innerText = `${this.totalTickets} Tickets`;
    document.getElementById('cAdultCount').innerText = this.adultCount;
    document.getElementById('cChildCount').innerText = this.childCount;
    document.getElementById('cSeniorCount').innerText = this.seniorCount;

    document.getElementById('cAdultSub').innerText = `₹${this.adultSubtotal}`;
    document.getElementById('cChildSub').innerText = `₹${this.childSubtotal}`;
    document.getElementById('cSeniorSub').innerText = `₹${this.seniorSubtotal}`;

    // Dynamic Passenger Forms
    const formContainer = document.getElementById('dynamicPassengerContainer');
    formContainer.innerHTML = '';

    this.passengers.forEach((p, idx) => {
      const isPrimary = idx === 0;
      const isChild = p.type === 'child';
      const isSenior = p.type === 'senior';
      const title = isPrimary ? 'Primary Passenger' : (isChild ? 'Child Passenger' : 'Co-Passenger');
      const badgeText = isChild ? 'Child' : (isSenior ? 'Senior' : 'Adult');
      const badgeClass = isChild ? 'badge-volvo' : (isSenior ? 'badge-nonac' : 'badge-ac');

      const card = document.createElement('div');
      card.className = 'passenger-entry-card';
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <div style="display: flex; align-items: center; gap: 8px;">
            <span style="width: 22px; height: 22px; background: var(--primary-red-light); color: var(--primary-red); border-radius: 50%; font-size: 11px; font-weight: bold; display: flex; align-items: center; justify-content: center;">${idx + 1}</span>
            <span style="font-size: 14px; font-weight: 700;">${title}</span>
          </div>
          <span class="badge-service ${badgeClass}">${badgeText}</span>
        </div>
        <div class="form-grid-2">
          <div>
            <div class="input-label">Full Name</div>
            <input type="text" class="text-field" value="${p.name}" onchange="Store.passengers[${idx}].name = this.value">
          </div>
          <div>
            <div class="input-label">Age</div>
            <input type="number" class="text-field" value="${p.age}" onchange="Store.passengers[${idx}].age = parseInt(this.value) || 25">
          </div>
        </div>
        <div class="form-grid-2">
          <div>
            <div class="input-label">Gender</div>
            <select class="text-field" onchange="Store.passengers[${idx}].gender = this.value">
              <option ${p.gender === 'Male' ? 'selected' : ''}>Male</option>
              <option ${p.gender === 'Female' ? 'selected' : ''}>Female</option>
              <option ${p.gender === 'Other' ? 'selected' : ''}>Other</option>
            </select>
          </div>
          ${isPrimary ? `
          <div>
            <div class="input-label">Mobile</div>
            <input type="text" class="text-field" value="${p.mobile || '+91 98450 12345'}" onchange="Store.passengers[0].mobile = this.value">
          </div>` : `
          <div>
            <div class="input-label">Seat Assigned</div>
            <input type="text" class="text-field" value="Seat #${14 + idx}" readonly style="background: #EEF2F6; color: var(--emerald-dark); font-weight: bold;">
          </div>`}
        </div>
      `;
      formContainer.appendChild(card);
    });

    // Fare Breakdown
    document.getElementById('fbAdultsRow').innerHTML = `<span class="info-label">${this.adultCount}× Adult Base Fare</span><span class="info-value">₹${this.adultSubtotal}</span>`;
    document.getElementById('fbChildRow').innerHTML = `<span class="info-label">${this.childCount}× Child Fare (50% Off)</span><span class="info-value">₹${this.childSubtotal}</span>`;
    document.getElementById('fbSeniorRow').innerHTML = `<span class="info-label">${this.seniorCount}× Senior Concession</span><span class="info-value">₹${this.seniorSubtotal}</span>`;
    document.getElementById('fbTotalPayable').innerText = `₹${this.totalFare}`;

    // Sticky Bottom Bar
    document.getElementById('screen2TotalFare').innerText = `₹${this.totalFare}`;
    document.getElementById('screen2Subtext').innerText = `${this.totalTickets} Passengers · Route ${route.routeNumber}`;
  },

  renderScreen3(ticketId) {
    const route = this.selectedRoute;
    const finalTicketId = ticketId || (this.activeBooking ? this.activeBooking.ticketId : 'NR-MW3W0FRR');

    document.getElementById('ticketIdDisplay').innerText = `Ticket ID: ${finalTicketId}`;

    // Seats Chips
    const seatsContainer = document.getElementById('ticketSeatsContainer');
    seatsContainer.innerHTML = '';
    this.passengers.forEach((p, idx) => {
      const chip = document.createElement('div');
      chip.style = 'background: #F1F5F9; border: 1px solid #E2E8F0; padding: 6px 14px; border-radius: 8px; text-align: center; font-size: 11px; white-space: nowrap;';
      chip.innerHTML = `
        <div style="font-weight: 600; color: var(--text-primary);">${p.name.split(' ')[0]} (${p.type === 'child' ? 'C' : 'A'})</div>
        <div style="font-weight: 800; color: var(--emerald); margin-top: 2px;">Seat #${14 + idx}</div>
      `;
      seatsContainer.appendChild(chip);
    });

    const primary = this.passengers[0] || { name: 'Rohan Sharma', mobile: '+91 98445 32431' };
    document.getElementById('tPassengerName').innerText = primary.name;
    document.getElementById('tPassengerPhone').innerText = primary.mobile || '+91 98445 32431';
    document.getElementById('tRouteDisplay').innerHTML = `${route.routeNumber} <span class="badge-service badge-nonac" style="font-size: 10px;">${route.serviceType}</span>`;
    document.getElementById('tBoarding').innerText = this.boardingStop;
    document.getElementById('tAlighting').innerText = this.alightingStop;
    document.getElementById('tDeparture').innerText = route.departureTime;
    document.getElementById('tTotalPaid').innerText = `₹${this.totalFare > 0 ? this.totalFare : 90}`;

    // Bus Tracker Card
    document.getElementById('trackRouteTitle').innerText = `Bus ${route.routeNumber} Tracking`;
  }
};

// 3. HTML5 HISTORY CLIENT-SIDE ROUTER
const Router = {
  currentPath: '/',

  init() {
    window.addEventListener('popstate', (e) => {
      this.handleRoute(window.location.pathname);
    });

    // Handle initial URL
    this.handleRoute(window.location.pathname);
  },

  push(path) {
    if (this.currentPath !== path) {
      window.history.pushState({}, '', path);
      this.handleRoute(path);
    }
  },

  replace(path) {
    window.history.replaceState({}, '', path);
    this.handleRoute(path);
  },

  handleRoute(pathname) {
    this.currentPath = pathname;

    // Hide all screens
    document.querySelectorAll('.screen-view').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-route-btn').forEach(b => b.classList.remove('active'));

    const backBtn = document.getElementById('topAppBarBack');
    const barTitle = document.getElementById('topAppBarTitle');
    const barSubtitle = document.getElementById('topAppBarSubtitle');
    const bottomNav = document.getElementById('globalBottomNav');

    if (pathname === '/checkout') {
      document.getElementById('screenCheckout').classList.add('active');
      document.getElementById('btnNavCheckout').classList.add('active');
      backBtn.style.display = 'flex';
      barTitle.innerText = 'Ticket Checkout';
      barSubtitle.innerText = 'ನಮ್ಮ ಬಸ್';
      bottomNav.style.display = 'none';

      // Pre-seed matching screenshot 2 if default
      if (Store.adultCount === 2 && Store.childCount === 0 && Store.seniorCount === 0) {
        Store.childCount = 1;
        Store.syncPassengers();
      }
      Store.renderScreen2();

    } else if (pathname.startsWith('/confirmation')) {
      const parts = pathname.split('/');
      const ticketId = parts[2] || 'NR-MW3W0FRR';

      document.getElementById('screenConfirmation').classList.add('active');
      document.getElementById('btnNavConfirm').classList.add('active');
      backBtn.style.display = 'flex';
      barTitle.innerText = 'Active Ticket';
      barSubtitle.innerText = 'ನಮ್ಮ ಬಸ್';
      bottomNav.style.display = 'none';
      Store.renderScreen3(ticketId);

    } else {
      // Default to Screen 1: '/'
      document.getElementById('screenSearch').classList.add('active');
      document.getElementById('btnNavSearch').classList.add('active');
      backBtn.style.display = 'none';
      barTitle.innerText = 'BMTC Namma Ride';
      barSubtitle.innerText = 'Book Ticket';
      bottomNav.style.display = 'flex';
      Store.renderScreen1();
    }
  }
};

// 4. ACTION CONTROLLERS
function navigateTo(path) {
  Router.push(path);
}

function handleAppBarBack() {
  if (Router.currentPath.startsWith('/confirmation') || Router.currentPath === '/checkout') {
    Router.push('/');
  } else {
    window.history.back();
  }
}

function processPayment() {
  const modal = document.getElementById('paymentProcessingModal');
  modal.style.display = 'flex';

  setTimeout(() => {
    modal.style.display = 'none';

    // Generate random Ticket ID
    const randomChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += randomChars.charAt(Math.floor(Math.random() * randomChars.length));
    const ticketId = `NR-${code}`;

    Store.activeBooking = {
      ticketId,
      time: new Date()
    };

    Router.push(`/confirmation/${ticketId}`);
  }, 1300);
}

function bookAnotherTicket() {
  Store.adultCount = 2;
  Store.childCount = 0;
  Store.seniorCount = 0;
  Store.syncPassengers();
  Router.push('/');
  showToast('Booking session reset. Ready for your next journey!');
}

function showToast(message) {
  const toast = document.getElementById('globalToast');
  toast.innerHTML = `<i class="fa-solid fa-circle-check" style="color: var(--emerald);"></i> ${message}`;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}

function toggleResponsiveView() {
  document.body.classList.toggle('full-width-mode');
  const isFull = document.body.classList.contains('full-width-mode');
  document.getElementById('viewToggleText').innerText = isFull ? 'Mobile Frame View' : 'Expanded Responsive View';
  showToast(isFull ? 'Switched to Expanded Responsive Mode' : 'Switched to Mobile Simulation Mode');
}

function showConductorQrModal() {
  document.getElementById('qrModalOverlay').style.display = 'flex';
}

function hideConductorQrModal() {
  document.getElementById('qrModalOverlay').style.display = 'none';
}

function showLiveTrackingSheet() {
  document.getElementById('trackingModalOverlay').style.display = 'flex';
}

function hideLiveTrackingSheet() {
  document.getElementById('trackingModalOverlay').style.display = 'none';
}

function selectPaymentMethod(elem, type) {
  document.querySelectorAll('.payment-method-row').forEach(r => r.classList.remove('selected'));
  elem.classList.add('selected');
  Store.selectedPayment = type;
  showToast(`Payment Method: ${type.toUpperCase()} selected`);
}

function showStopSelector(isBoarding) {
  const title = isBoarding ? 'Select Boarding Point' : 'Select Alighting Point';
  const stopList = BMTC_DATA.stops.map(s => `
    <div style="padding: 12px 14px; border-bottom: 1px solid #F1F5F9; cursor: pointer; display: flex; align-items: center; justify-content: space-between;" onclick="chooseStop('${s}', ${isBoarding})">
      <span><i class="fa-solid fa-location-dot" style="color: var(--primary-red); margin-right: 8px;"></i> ${s}</span>
      ${(isBoarding ? Store.boardingStop : Store.alightingStop) === s ? '<i class="fa-solid fa-check" style="color: var(--primary-red);"></i>' : ''}
    </div>
  `).join('');

  const modal = document.getElementById('genericSheetModal');
  document.getElementById('sheetModalTitle').innerText = title;
  document.getElementById('sheetModalBody').innerHTML = stopList;
  modal.style.display = 'flex';
}

function chooseStop(stop, isBoarding) {
  if (isBoarding) Store.boardingStop = stop;
  else Store.alightingStop = stop;
  document.getElementById('genericSheetModal').style.display = 'none';
  Store.renderScreen1();
  showToast(`Updated: ${stop}`);
}

function hideGenericSheet() {
  document.getElementById('genericSheetModal').style.display = 'none';
}

function downloadReceipt() {
  showToast('Generating BMTC Digital Pass Receipt (PDF)...');
  setTimeout(() => {
    window.print();
  }, 400);
}

// 5. INITIALIZE ON DOM READY
document.addEventListener('DOMContentLoaded', () => {
  Router.init();
});

