/**
 * EPFO GIGW 3.0 / S3WaaS Modern Portal Client Architecture (app.js)
 * High-performance, dependency-free vanilla JavaScript
 * Handles accessibility toggles, universal status checker, search autocomplete,
 * interactive statutory calculators, and pillar filtering.
 */

document.addEventListener('DOMContentLoaded', () => {
  'use strict';

  // =========================================================================
  // 1. ACCESSIBILITY CONTROLS (Font Scaling, High Contrast, Language)
  // =========================================================================
  
  const root = document.documentElement;
  
  // --- Font Scaling (A-, A, A+) ---
  const fontDecBtn = document.getElementById('font-dec');
  const fontNormBtn = document.getElementById('font-norm');
  const fontIncBtn = document.getElementById('font-inc');
  const fontBtns = [fontDecBtn, fontNormBtn, fontIncBtn];

  const FONT_SCALES = {
    dec: '0.875',
    norm: '1',
    inc: '1.15'
  };

  function setFontScale(scaleKey) {
    const scaleVal = FONT_SCALES[scaleKey] || '1';
    root.style.setProperty('--font-scale', scaleVal);
    localStorage.setItem('epfo_font_scale', scaleKey);

    fontBtns.forEach(btn => {
      if (!btn) return;
      const isActive = (btn.id === `font-${scaleKey}`);
      btn.classList.toggle('is-active', isActive);
      btn.setAttribute('aria-pressed', isActive ? 'true' : 'false');
    });
  }

  if (fontDecBtn) fontDecBtn.addEventListener('click', () => setFontScale('dec'));
  if (fontNormBtn) fontNormBtn.addEventListener('click', () => setFontScale('norm'));
  if (fontIncBtn) fontIncBtn.addEventListener('click', () => setFontScale('inc'));

  // Load stored font scale
  const savedFontScale = localStorage.getItem('epfo_font_scale') || 'norm';
  setFontScale(savedFontScale);


  // --- High Contrast Mode Toggle (◐) ---
  const contrastToggle = document.getElementById('contrast-toggle');

  function setContrastTheme(isHighContrast) {
    if (isHighContrast) {
      root.setAttribute('data-theme', 'high-contrast');
      if (contrastToggle) {
        contrastToggle.setAttribute('aria-pressed', 'true');
        contrastToggle.querySelector('.contrast-label').textContent = 'Normal Contrast';
      }
      localStorage.setItem('epfo_theme', 'high-contrast');
    } else {
      root.setAttribute('data-theme', 'default');
      if (contrastToggle) {
        contrastToggle.setAttribute('aria-pressed', 'false');
        contrastToggle.querySelector('.contrast-label').textContent = 'High Contrast';
      }
      localStorage.setItem('epfo_theme', 'default');
    }
  }

  if (contrastToggle) {
    contrastToggle.addEventListener('click', () => {
      const currentTheme = root.getAttribute('data-theme');
      setContrastTheme(currentTheme !== 'high-contrast');
    });
  }

  // Load stored theme
  const savedTheme = localStorage.getItem('epfo_theme');
  if (savedTheme === 'high-contrast') {
    setContrastTheme(true);
  }


  // --- Indic Language Selector Simulation ---
  const langSelector = document.getElementById('lang-selector');
  const languageSalutations = {
    en: 'Your Gateway to Social Security — Provident Fund, Pension & Insurance',
    hi: 'सामाजिक सुरक्षा का आपका प्रवेश द्वार — भविष्य निधि, पेंशन एवं बीमा सेवाएं',
    bn: 'সামাজিক সুরক্ষার জন্য আপনার প্রবেশদ্বার — ভবিষ্য তহবিল, পেনশন এবং বীমা',
    te: 'సామాజిక భద్రతకు మీ ప్రవేశ ద్వారం — ప్రావిడెంట్ ఫండ్, పెన్షన్ & బీమా',
    mr: 'सामाजिक सुरक्षेचे तुमचे प्रवेशद्वार — भविष्य निर्वाह निधी, पेन्शन आणि विमा',
    ta: 'சமூக பாதுகாப்புக்கான உங்கள் நுழைவாயில் — வருங்கால வைப்பு நிதி, ஓய்வூதியம் மற்றும் காப்பீடு',
    gu: 'સામાજિક સુરક્ષા માટેનું આપનું પ્રવેશદ્વાર — ભવિષ્ય નિધિ, પેન્શન અને વીમો',
    kn: 'ಸಾಮಾಜಿಕ ಭದ್ರತೆಯ ನಿಮ್ಮ ಪ್ರವೇಶ ದ್ವಾರ — ಭವಿಷ್ಯ ನಿಧಿ, ಪಿಂಚಣಿ ಮತ್ತು ವಿಮೆ',
    ml: 'സാമൂഹിക സുരക്ഷയിലേക്കുള്ള നിങ്ങളുടെ കവാടം — പ്രൊവിഡന്റ് ഫണ്ട്, പെൻഷൻ & ഇൻഷുറൻസ്',
    pa: 'ਸਮਾਜਿਕ ਸੁਰੱਖਿਆ ਲਈ ਤੁਹਾਡਾ ਗੇਟਵੇਅ — ਭਵਿੱਖ ਨਿਧੀ, ਪੈਨਸ਼ਨ ਅਤੇ ਬੀਮਾ',
    or: 'ସାମାଜିକ ସୁରକ୍ଷା ପାଇଁ ଆପଣଙ୍କ ପ୍ରବେଶ ଦ୍ୱାର — ଭବିଷ୍ୟ ନିଧି, ପେନସନ ଓ ବୀମା',
    as: 'সামাজিক সুৰক্ষাৰ আপোনাৰ প্ৰৱেশদ্বাৰ — ভৱিষ্য নিধি, পেঞ্চন আৰু বীমা'
  };

  if (langSelector) {
    langSelector.addEventListener('change', (e) => {
      const selectedLang = e.target.value;
      const heroHeading = document.getElementById('hero-title');
      if (heroHeading && languageSalutations[selectedLang]) {
        heroHeading.textContent = languageSalutations[selectedLang];
      }
      localStorage.setItem('epfo_lang', selectedLang);
    });

    const savedLang = localStorage.getItem('epfo_lang');
    if (savedLang && languageSalutations[savedLang]) {
      langSelector.value = savedLang;
      const heroHeading = document.getElementById('hero-title');
      if (heroHeading) heroHeading.textContent = languageSalutations[savedLang];
    }
  }


  // --- Screen Reader Info Dialog ---
  const btnScreenReader = document.getElementById('btn-screen-reader');
  const srDialog = document.getElementById('screen-reader-dialog');
  const closeSrDialogBtn = document.getElementById('close-sr-dialog');
  const confirmSrDialogBtn = document.getElementById('confirm-sr-dialog');

  if (btnScreenReader && srDialog) {
    btnScreenReader.addEventListener('click', () => {
      srDialog.showModal();
    });

    if (closeSrDialogBtn) {
      closeSrDialogBtn.addEventListener('click', () => srDialog.close());
    }
    if (confirmSrDialogBtn) {
      confirmSrDialogBtn.addEventListener('click', () => srDialog.close());
    }
  }


  // --- Static Dismissible Alert Banner ---
  const dismissAlertBtn = document.getElementById('dismiss-alert-btn');
  const statutoryAlert = document.getElementById('statutory-alert');

  if (dismissAlertBtn && statutoryAlert) {
    dismissAlertBtn.addEventListener('click', () => {
      statutoryAlert.style.display = 'none';
      sessionStorage.setItem('epfo_alert_dismissed', 'true');
    });

    if (sessionStorage.getItem('epfo_alert_dismissed') === 'true') {
      statutoryAlert.style.display = 'none';
    }
  }


  // --- Mobile Navigation Drawer Toggle ---
  const mobileNavToggle = document.getElementById('mobile-nav-toggle');
  const primaryNavMenu = document.getElementById('primary-nav-menu');

  if (mobileNavToggle && primaryNavMenu) {
    mobileNavToggle.addEventListener('click', () => {
      const isOpen = primaryNavMenu.classList.toggle('is-open');
      mobileNavToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  }


  // --- Direct Portals Dropdown Toggle ---
  const portalMenuTrigger = document.getElementById('portal-menu-trigger');
  const portalDropdown = document.getElementById('portal-dropdown');

  if (portalMenuTrigger && portalDropdown) {
    portalMenuTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isHidden = portalDropdown.hidden;
      portalDropdown.hidden = !isHidden;
      portalMenuTrigger.setAttribute('aria-expanded', isHidden ? 'true' : 'false');
    });

    document.addEventListener('click', (e) => {
      if (!portalMenuTrigger.contains(e.target) && !portalDropdown.contains(e.target)) {
        portalDropdown.hidden = true;
        portalMenuTrigger.setAttribute('aria-expanded', 'false');
      }
    });
  }


  // =========================================================================
  // 2. UNIVERSAL STATUS CHECKER (Single-Field Tabbed Tracker)
  // =========================================================================

  const trackerTabs = document.querySelectorAll('.tracker-tab');
  const trackerInput = document.getElementById('tracker-input');
  const trackerInputLabel = document.getElementById('tracker-input-label');
  const trackerHelper = document.getElementById('tracker-helper');
  const trackerError = document.getElementById('tracker-error');
  const trackerClearBtn = document.getElementById('tracker-clear-btn');
  const trackerForm = document.getElementById('universal-tracker-form');
  const trackerSubmitBtn = document.getElementById('tracker-submit-btn');
  const trackerResultCard = document.getElementById('tracker-result-card');

  let currentTrackerMode = 'claim';

  const TRACKER_CONFIGS = {
    claim: {
      label: 'Enter 12-Digit Universal Account Number (UAN) or Claim ID:',
      placeholder: 'e.g. 101234567890',
      helper: 'Enter 12 continuous digits without spaces or special characters.',
      errorMsg: 'Please enter a valid 12-digit numeric UAN or Claim Reference ID.',
      regex: /^\d{12}$/,
      mockResult: (val) => ({
        type: 'Claim Status',
        id: `CLM-${val.slice(0, 4)}-${val.slice(4, 8)}`,
        name: 'Rajesh Kumar Verma',
        uan: val,
        status: 'Settled via NEFT',
        stage: 4,
        details: [
          { label: 'Claim Form Type', value: 'Form 19 (Final PF Settlement) & 10C' },
          { label: 'Filing Date', value: '12 August 2026' },
          { label: 'Field Office', value: 'Regional Office, Delhi (Central)' },
          { label: 'Settlement Amount', value: '₹ 2,48,650.00' },
          { label: 'Payment Mode', value: 'Direct Bank NEFT (SBI A/C ending **4821)' },
          { label: 'Disbursal Date', value: '21 August 2026 (Settled in 9 Days)' }
        ],
        actionLink: 'https://passbook.epfindia.gov.in/MemberPassBook/login',
        actionText: 'View in Member Passbook Portal ↗'
      })
    },
    passbook: {
      label: 'Enter 12-Digit Universal Account Number (UAN) to Verify Passbook:',
      placeholder: 'e.g. 100987654321',
      helper: 'Ensure your UAN is activated and seeded with Aadhaar.',
      errorMsg: 'Please enter a valid 12-digit numeric UAN.',
      regex: /^\d{12}$/,
      mockResult: (val) => ({
        type: 'Passbook Summary',
        id: `UAN-${val}`,
        name: 'Anita Sharma',
        uan: val,
        status: 'Passbook Active & Updated',
        stage: 4,
        details: [
          { label: 'Establishment Name', value: 'TATA CONSULTANCY SERVICES LTD' },
          { label: 'Member ID', value: 'DLCPM0019283000/0048291' },
          { label: 'Employee Share Balance', value: '₹ 3,84,120.00' },
          { label: 'Employer Share Balance', value: '₹ 1,18,450.00' },
          { label: 'Pension Share (EPS)', value: '₹ 84,200.00' },
          { label: 'Total EPF Balance', value: '₹ 5,02,570.00 (Interest 8.25% Credited)' }
        ],
        actionLink: 'https://passbook.epfindia.gov.in/MemberPassBook/login',
        actionText: 'Download Complete Passbook PDF ↗'
      })
    },
    ppo: {
      label: 'Enter 12-Digit Pension Payment Order (PPO) Number or UAN:',
      placeholder: 'e.g. 219876543210',
      helper: 'PPO number is issued upon superannuation or scheme certificate grant.',
      errorMsg: 'Please enter a valid 12-digit numeric PPO number.',
      regex: /^\d{12}$/,
      mockResult: (val) => ({
        type: 'Pension Payment Status',
        id: `PPO-${val}`,
        name: 'Surendra Nath Das',
        uan: val,
        status: 'Pension Active (DLC Verified)',
        stage: 4,
        details: [
          { label: 'Disbursing Bank', value: 'Punjab National Bank (PNB)' },
          { label: 'Monthly Pension Entitlement', value: '₹ 4,780.00 / month' },
          { label: 'Last Life Certificate (DLC)', value: 'Submitted on 14 Nov 2025 (Valid till Nov 2026)' },
          { label: 'Mode of DLC Submission', value: 'Android Face Authentication App' },
          { label: 'Last Credit Month', value: 'July 2026 (Credited on 31-Jul-2026)' }
        ],
        actionLink: 'https://mis.epfindia.gov.in/PensionPaymentEnquiry/paymentEnquiry.jsp',
        actionText: 'Open Pension Payment Enquiry MIS ↗'
      })
    },
    est: {
      label: 'Enter 12-Digit Establishment Code or LIN / Shram Suvidha Code:',
      placeholder: 'e.g. 100012345678',
      helper: 'Enter establishment identification digits.',
      errorMsg: 'Please enter a valid 12-digit numeric establishment / LIN code.',
      regex: /^\d{12}$/,
      mockResult: (val) => ({
        type: 'Establishment Status',
        id: `EST-${val}`,
        name: 'INFOSYS LIMITED (UNIT 4)',
        uan: val,
        status: 'ECR Compliant for July 2026',
        stage: 4,
        details: [
          { label: 'Establishment Code', value: `KNBLR00${val.slice(0, 5)}` },
          { label: 'Last ECR TRRN', value: `TRRN-${val.slice(0, 8)}-2026` },
          { label: 'Challan Payment Status', value: 'Reconciled & Acknowledged' },
          { label: 'Active Contributing Members', value: '4,892 Employees' },
          { label: 'Exemption Category', value: 'Unexempted Mainstream' }
        ],
        actionLink: 'https://unifiedportal-emp.epfindia.gov.in/epfo/',
        actionText: 'Open Unified Employer Portal ↗'
      })
    }
  };

  // Tab switching
  trackerTabs.forEach(tab => {
    tab.addEventListener('click', () => {
      trackerTabs.forEach(t => {
        t.classList.remove('is-active');
        t.setAttribute('aria-selected', 'false');
      });
      tab.classList.add('is-active');
      tab.setAttribute('aria-selected', 'true');

      currentTrackerMode = tab.dataset.mode || 'claim';
      const config = TRACKER_CONFIGS[currentTrackerMode];

      if (trackerInputLabel) trackerInputLabel.textContent = config.label;
      if (trackerInput) {
        trackerInput.placeholder = config.placeholder;
        trackerInput.value = '';
        trackerInput.removeAttribute('aria-invalid');
      }
      if (trackerHelper) trackerHelper.textContent = config.helper;
      if (trackerError) {
        trackerError.hidden = true;
        trackerError.textContent = '';
      }
      if (trackerClearBtn) trackerClearBtn.hidden = true;
      if (trackerResultCard) trackerResultCard.hidden = true;
    });
  });

  // Input sanitization & clear button
  if (trackerInput) {
    trackerInput.addEventListener('input', (e) => {
      // Keep only numeric characters
      const cleanVal = e.target.value.replace(/\D/g, '').slice(0, 12);
      e.target.value = cleanVal;
      
      if (trackerClearBtn) {
        trackerClearBtn.hidden = (cleanVal.length === 0);
      }

      if (trackerError && !trackerError.hidden) {
        trackerError.hidden = true;
        trackerInput.removeAttribute('aria-invalid');
      }
    });
  }

  if (trackerClearBtn && trackerInput) {
    trackerClearBtn.addEventListener('click', () => {
      trackerInput.value = '';
      trackerClearBtn.hidden = true;
      if (trackerError) trackerError.hidden = true;
      if (trackerResultCard) trackerResultCard.hidden = true;
      trackerInput.focus();
    });
  }

  // Form submission handler
  if (trackerForm) {
    trackerForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const val = trackerInput ? trackerInput.value.trim() : '';
      const config = TRACKER_CONFIGS[currentTrackerMode];

      if (!config.regex.test(val)) {
        if (trackerError && trackerInput) {
          trackerError.textContent = config.errorMsg;
          trackerError.hidden = false;
          trackerInput.setAttribute('aria-invalid', 'true');
          trackerInput.focus();
        }
        if (trackerResultCard) trackerResultCard.hidden = true;
        return;
      }

      // Valid: Render Result Card
      if (trackerSubmitBtn) {
        trackerSubmitBtn.disabled = true;
        trackerSubmitBtn.querySelector('span:last-child').textContent = 'Verifying with EPFO Central Gateway...';
      }

      setTimeout(() => {
        if (trackerSubmitBtn) {
          trackerSubmitBtn.disabled = false;
          trackerSubmitBtn.querySelector('span:last-child').textContent = 'Check Status Instantly';
        }

        const data = config.mockResult(val);
        renderTrackerResult(data);
      }, 400);
    });
  }

  function renderTrackerResult(data) {
    if (!trackerResultCard) return;

    let detailsHtml = data.details.map(d => `
      <div class="result-detail-row">
        <span class="result-detail-label">${d.label}:</span>
        <span class="result-detail-value">${d.value}</span>
      </div>
    `).join('');

    trackerResultCard.innerHTML = `
      <div class="result-card-header">
        <div>
          <strong style="font-size: 1rem; color: var(--color-primary);">${data.type}</strong>
          <div style="font-size: 0.75rem; color: var(--color-text-muted);">Ref: ${data.id} | Beneficiary: <strong>${data.name}</strong></div>
        </div>
        <span class="result-status-badge">● ${data.status}</span>
      </div>

      <div class="lifecycle-tracker" aria-label="Settlement Lifecycle Progress">
        <div class="lifecycle-step is-done" title="Step 1: Application Received">1</div>
        <div class="lifecycle-step is-done" title="Step 2: Field Verification">2</div>
        <div class="lifecycle-step is-done" title="Step 3: Sanctioned">3</div>
        <div class="lifecycle-step is-done" title="Step 4: NEFT Disbursed">4</div>
      </div>

      <div class="result-details-box" style="margin-block: 0.75rem;">
        ${detailsHtml}
      </div>

      <div style="margin-top: 0.85rem; text-align: right;">
        <a href="${data.actionLink}" target="_blank" rel="noopener noreferrer" class="btn btn-outline btn-sm">
          ${data.actionText}
        </a>
      </div>
    `;

    trackerResultCard.hidden = false;
    trackerResultCard.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }


  // =========================================================================
  // 3. GLOBAL SEARCH & AUTOCOMPLETE INDEX
  // =========================================================================

  const searchIndex = [
    { title: 'Member Passbook & Balance Portal', category: 'Member Service', url: 'https://passbook.epfindia.gov.in/MemberPassBook/login', keywords: 'passbook balance statement contribution pass book' },
    { title: 'Member Portal (UAN Login)', category: 'Member Service', url: 'https://unifiedportal-mem.epfindia.gov.in/memberinterface/', keywords: 'uan login member unified interface password forgot' },
    { title: 'Activate Universal Account Number (UAN)', category: 'Member Service', url: 'https://unifiedportal-mem.epfindia.gov.in/memberinterface/', keywords: 'activate uan new registration first time' },
    { title: 'Form 19: Online PF Final Settlement Claim', category: 'Claims', url: 'https://unifiedportal-mem.epfindia.gov.in/memberinterface/', keywords: 'form 19 full pf settlement withdraw claim withdrawal' },
    { title: 'Form 10C: EPS Pension Withdrawal Benefit', category: 'Claims', url: 'https://unifiedportal-mem.epfindia.gov.in/memberinterface/', keywords: 'form 10c pension withdrawal certificate scheme' },
    { title: 'Form 31: Advance PF Withdrawal (Illness / House / Marriage)', category: 'Claims', url: 'https://unifiedportal-mem.epfindia.gov.in/memberinterface/', keywords: 'form 31 advance loan medical housing covid wedding' },
    { title: 'Form 10D: Monthly Pension Application', category: 'Pension', url: 'https://unifiedportal-mem.epfindia.gov.in/memberinterface/', keywords: 'form 10d superannuation monthly pension eps 1995' },
    { title: 'Transfer Request (OICP - One Member One EPF)', category: 'Member Service', url: 'https://unifiedportal-mem.epfindia.gov.in/memberinterface/', keywords: 'transfer pf merge oicp previous employer account' },
    { title: 'KYC Update & Aadhaar/PAN Seeding', category: 'Member Service', url: 'https://unifiedportal-mem.epfindia.gov.in/memberinterface/', keywords: 'kyc bank account ifsc pan aadhaar link seed' },
    { title: 'Submit e-Nomination Digitally', category: 'Member Service', url: 'https://unifiedportal-mem.epfindia.gov.in/memberinterface/', keywords: 'nomination nominee family declaration edli form' },
    { title: 'File Death Claim (Form 20 / 5IF / 10D)', category: 'Claims', url: 'https://unifiedportal-mem.epfindia.gov.in/memberinterface/', keywords: 'death claim form 20 form 5if nominee insurance demise' },
    { title: 'Jeevan Pramaan (Digital Life Certificate)', category: 'Pension', url: 'https://jeevanpramaan.gov.in/v1.0/', keywords: 'jeevan pramaan dlc life certificate biometric face auth pension' },
    { title: 'Pension Payment Order (PPO) Details & MIS', category: 'Pension', url: 'https://mis.epfindia.gov.in/PensionPaymentEnquiry/paymentEnquiry.jsp', keywords: 'ppo status pension enquiry payment ledger bank' },
    { title: 'Unified Employer Portal (ECR Challan Submission)', category: 'Employer', url: 'https://unifiedportal-emp.epfindia.gov.in/epfo/', keywords: 'employer ecr challan return unified establishment trrn' },
    { title: 'Shram Suvidha Portal (LIN Registration)', category: 'Employer', url: 'https://shramsuvidha.gov.in/home', keywords: 'shram suvidha lin new registration labour ministry' },
    { title: 'EPFiGMS 2.0 Grievance Redressal Portal', category: 'Grievance', url: 'https://epfigms.gov.in/', keywords: 'epfigms complaint grievance status reminder delay issue' },
    { title: 'Nidhi Aapke Nikat 2.0 (NAN Outreach Camps)', category: 'Citizen Assistance', url: 'https://www.epfo.gov.in/notices/venue-details-of-camps-under-nidhi-aapke-nikat-2-0-august-2026/', keywords: 'nidhi aapke nikat camp 27th venue district outreach' },
    { title: 'Locate Nearest EPFO Regional Office Directory', category: 'Directory', url: 'https://www.epfo.gov.in/locate-epfo-office/', keywords: 'locate office address email pro phone phonebook' },
    { title: 'The EPF & MP Act, 1952 Legal Text', category: 'Statutory', url: 'https://www.epfo.gov.in/epf-mp-act-1952', keywords: 'act law statutory section 1952 rules' },
    { title: 'The Employees Pension Scheme 1995 (EPS)', category: 'Statutory', url: 'https://www.epfo.gov.in/pension-scheme-eps/', keywords: 'eps 1995 rules calculation pension scheme' },
    { title: 'The Employees Deposit Linked Insurance (EDLI 1976)', category: 'Statutory', url: 'https://www.epfo.gov.in/insurance-scheme-edli/', keywords: 'edli insurance cover 7 lakhs calculation 1976' },
    { title: 'International Workers (Social Security Agreements)', category: 'International', url: 'https://www.epfo.gov.in/international-workers/', keywords: 'international workers ssa coc certificate of coverage' },
    { title: 'Right to Information (RTI Act 2005)', category: 'Compliance', url: 'https://www.epfo.gov.in/rti-epfo/', keywords: 'rti right to information cpio disclosure' },
    { title: 'UMANG Mobile Application for EPFO', category: 'm-Gov', url: 'https://web.umang.gov.in/landing/department/epfo.html', keywords: 'umang app android ios download mobile' }
  ];

  const searchInput = document.getElementById('global-search-input');
  const searchCombobox = document.getElementById('search-combobox');
  const suggestionsList = document.getElementById('search-suggestions');

  let selectedSuggestionIndex = -1;

  if (searchInput && suggestionsList) {
    searchInput.addEventListener('input', (e) => {
      const q = e.target.value.trim().toLowerCase();
      selectedSuggestionIndex = -1;

      if (q.length < 2) {
        suggestionsList.hidden = true;
        if (searchCombobox) searchCombobox.setAttribute('aria-expanded', 'false');
        return;
      }

      const matches = searchIndex.filter(item => 
        item.title.toLowerCase().includes(q) || 
        item.category.toLowerCase().includes(q) || 
        item.keywords.toLowerCase().includes(q)
      ).slice(0, 6);

      if (matches.length === 0) {
        suggestionsList.innerHTML = `
          <li class="suggestion-item" style="color: var(--color-text-muted); cursor: default;">
            No direct matching EPFO services found. Press Enter or check all 4 pillars below.
          </li>
        `;
      } else {
        suggestionsList.innerHTML = matches.map((m, idx) => `
          <li class="suggestion-item" role="option" id="sugg-opt-${idx}" data-url="${m.url}">
            <span class="suggestion-title">${highlightMatch(m.title, q)}</span>
            <span class="suggestion-badge">${m.category}</span>
          </li>
        `).join('');
      }

      suggestionsList.hidden = false;
      if (searchCombobox) searchCombobox.setAttribute('aria-expanded', 'true');
    });

    // Keyboard navigation in suggestions listbox
    searchInput.addEventListener('keydown', (e) => {
      const items = suggestionsList.querySelectorAll('.suggestion-item[role="option"]');
      if (items.length === 0 || suggestionsList.hidden) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        selectedSuggestionIndex = (selectedSuggestionIndex + 1) % items.length;
        updateSuggestionFocus(items);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        selectedSuggestionIndex = (selectedSuggestionIndex - 1 + items.length) % items.length;
        updateSuggestionFocus(items);
      } else if (e.key === 'Enter') {
        if (selectedSuggestionIndex >= 0 && items[selectedSuggestionIndex]) {
          e.preventDefault();
          const targetUrl = items[selectedSuggestionIndex].dataset.url;
          if (targetUrl) window.open(targetUrl, '_blank', 'noopener,noreferrer');
          suggestionsList.hidden = true;
          if (searchCombobox) searchCombobox.setAttribute('aria-expanded', 'false');
        }
      } else if (e.key === 'Escape') {
        suggestionsList.hidden = true;
        if (searchCombobox) searchCombobox.setAttribute('aria-expanded', 'false');
      }
    });

    // Click handler on suggestions
    suggestionsList.addEventListener('click', (e) => {
      const item = e.target.closest('.suggestion-item[role="option"]');
      if (item && item.dataset.url) {
        window.open(item.dataset.url, '_blank', 'noopener,noreferrer');
        suggestionsList.hidden = true;
        if (searchCombobox) searchCombobox.setAttribute('aria-expanded', 'false');
      }
    });

    // Close on click outside
    document.addEventListener('click', (e) => {
      if (!searchCombobox.contains(e.target)) {
        suggestionsList.hidden = true;
        if (searchCombobox) searchCombobox.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function updateSuggestionFocus(items) {
    items.forEach((item, idx) => {
      const isSel = (idx === selectedSuggestionIndex);
      item.classList.toggle('is-selected', isSel);
      item.setAttribute('aria-selected', isSel ? 'true' : 'false');
    });
    if (selectedSuggestionIndex >= 0) {
      searchInput.setAttribute('aria-activedescendant', `sugg-opt-${selectedSuggestionIndex}`);
    }
  }

  function highlightMatch(text, query) {
    const regex = new RegExp(`(${query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
    return text.replace(regex, '<mark style="background-color: #FEF08A; color: #0F172A; padding: 0 2px;">$1</mark>');
  }


  // =========================================================================
  // 4. 4-PILLAR INTENT MODEL FILTER PILLS
  // =========================================================================

  const filterPills = document.querySelectorAll('.filter-pill');
  const pillarCards = document.querySelectorAll('.pillar-card');

  filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
      filterPills.forEach(p => {
        p.classList.remove('is-active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('is-active');
      pill.setAttribute('aria-selected', 'true');

      const filterVal = pill.dataset.filter || 'all';

      pillarCards.forEach(card => {
        if (filterVal === 'all' || card.dataset.category === filterVal) {
          card.style.display = 'flex';
        } else {
          card.style.display = 'none';
        }
      });
    });
  });


  // =========================================================================
  // 5. INTERACTIVE STATUTORY BENEFIT CALCULATORS
  // =========================================================================

  // --- Calculator 1: EPF Retirement Corpus ---
  const btnCalcEpf = document.getElementById('btn-calc-epf');
  if (btnCalcEpf) {
    btnCalcEpf.addEventListener('click', () => {
      const basicWage = parseFloat(document.getElementById('epf-monthly-wage').value) || 25000;
      const currentAge = parseInt(document.getElementById('epf-current-age').value, 10) || 28;
      const retireAge = parseInt(document.getElementById('epf-retirement-age').value, 10) || 58;
      
      const years = Math.max(1, retireAge - currentAge);
      const months = years * 12;
      const interestRate = 0.0825; // 8.25% p.a.
      const monthlyRate = interestRate / 12;

      // Employee share (12%) + Employer EPF share (3.67%) = 15.67%
      const monthlyContribution = basicWage * 0.1567;

      // Future Value of Monthly SIP formula: P * [((1 + r)^n - 1) / r] * (1 + r)
      const futureValue = monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * (1 + monthlyRate);

      const formattedVal = Math.round(futureValue).toLocaleString('en-IN');
      const outputEl = document.getElementById('epf-result-val');
      if (outputEl) outputEl.textContent = `₹ ${formattedVal}`;
    });
  }

  // --- Calculator 2: EPS Monthly Pension ---
  const btnCalcEps = document.getElementById('btn-calc-eps');
  if (btnCalcEps) {
    btnCalcEps.addEventListener('click', () => {
      const pensionSalary = Math.min(15000, parseFloat(document.getElementById('eps-pension-salary').value) || 15000);
      let serviceYears = parseInt(document.getElementById('eps-service-years').value, 10) || 30;

      // Rule: Bonus of 2 years if service >= 20 years
      if (serviceYears >= 20) {
        serviceYears += 2;
      }

      // Formula: (Pensionable Salary * Service) / 70
      const monthlyPension = Math.round((pensionSalary * serviceYears) / 70);
      const outputEl = document.getElementById('eps-result-val');
      if (outputEl) outputEl.textContent = `₹ ${monthlyPension.toLocaleString('en-IN')} / Month`;
    });
  }

  // --- Calculator 3: EDLI Insurance Cover ---
  const btnCalcEdli = document.getElementById('btn-calc-edli');
  if (btnCalcEdli) {
    btnCalcEdli.addEventListener('click', () => {
      const avgSalary = Math.min(15000, parseFloat(document.getElementById('edli-avg-salary').value) || 15000);
      const avgBalance = parseFloat(document.getElementById('edli-avg-balance').value) || 350000;

      // Formula: 35 * Average Wage + 50% of Average Balance (subject to max 7,00,000, min 2,50,000)
      const wagePortion = 35 * avgSalary;
      const balancePortion = Math.min(175000, 0.5 * avgBalance);
      let totalCover = wagePortion + balancePortion;

      totalCover = Math.max(250000, Math.min(700000, totalCover));

      const outputEl = document.getElementById('edli-result-val');
      if (outputEl) outputEl.textContent = `₹ ${totalCover.toLocaleString('en-IN')} (Maximum Cover)`;
    });
  }


  // =========================================================================
  // 6. CONTENT FRESHNESS & DYNAMIC DATE (IST)
  // =========================================================================
  const dynamicDateEl = document.getElementById('dynamic-date');
  if (dynamicDateEl) {
    const now = new Date();
    const options = { day: 'numeric', month: 'long', year: 'numeric' };
    const istDate = now.toLocaleDateString('en-IN', options);
    dynamicDateEl.textContent = `${istDate}`;
    dynamicDateEl.setAttribute('datetime', now.toISOString().split('T')[0]);
  }

});

