/**
 * National Cyber Crime Reporting Portal — Synthetic Database & State Engine (ccp-db.js)
 * Manages citizen complaints ledger, suspect fraud intelligence, draft autosave,
 * and localStorage state synchronization.
 */

(function (window) {
  'use strict';

  const STORAGE_KEY_USER = 'ncrp_user_session_v1';
  const STORAGE_KEY_CASES = 'ncrp_cases_ledger_v1';
  const STORAGE_KEY_SUSPECTS = 'ncrp_suspect_repo_v1';
  const STORAGE_KEY_DRAFT = 'ncrp_filing_draft_v1';

  const DEFAULT_USER = {
    name: 'Ramesh Kumar',
    mobile: '9876543210',
    email: 'ramesh.kumar@example.gov.in',
    state: 'Karnataka',
    district: 'Bengaluru Urban',
    isReviewer: true
  };

  const DEFAULT_CASES = [
    {
      caseId: 'NCRP-2026-892103',
      category: 'FINANCIAL_UPI_FRAUD',
      categoryTitle: 'Financial Cyber Fraud (1930 CFCFRMS)',
      amountLost: 75000,
      incidentDate: '2026-08-27T10:45:00',
      status: 'LIEN_PLACED',
      statusTitle: 'Lien Placed',
      bankName: 'State Bank of India',
      suspectVpa: 'fastpay.mule99@okaxis',
      fieldStation: 'Cyber Crime Police Station (Bengaluru City)',
      estimatedRecovery: 'Fast-Track Recovery (48 Hours)',
      timeline: [
        { step: 1, title: '60-Second Express Report Ingested', status: 'COMPLETED', date: '27 Aug 2026, 10:52 AM' },
        { step: 2, title: 'CFCFRMS 1930 Bank Node Alert Triggered', status: 'COMPLETED', date: '27 Aug 2026, 10:54 AM' },
        { step: 3, title: 'Interim Lien Placed on Beneficiary Account (HDFC Bank)', status: 'COMPLETED', date: '27 Aug 2026, 11:15 AM' },
        { step: 4, title: 'Magistrate Refund Order Processing', status: 'IN_PROGRESS', date: 'Under Judicial Review' }
      ]
    },
    {
      caseId: 'NCRP-2026-774102',
      category: 'WOMEN_CHILD_SAFETY',
      categoryTitle: 'Cyber Harassment & Morphing',
      amountLost: 0,
      incidentDate: '2026-08-25T16:20:00',
      status: 'RFE_REQUESTED',
      statusTitle: 'Evidence Requested',
      suspectHandle: '@fake_profile_892',
      fieldStation: 'State Cyber Cell, CID Karnataka',
      rfeDetails: 'Please provide uncompressed chat export and URL of the cloned profile.',
      timeline: [
        { step: 1, title: 'Priority Anonymous Intake Registered', status: 'COMPLETED', date: '25 Aug 2026, 04:30 PM' },
        { step: 2, title: 'Evidence Examination by Cyber Investigator', status: 'COMPLETED', date: '26 Aug 2026, 09:15 AM' },
        { step: 3, title: 'RFE Notice Issued: Additional Profile URL Requested', status: 'IN_PROGRESS', date: 'Pending Citizen Response' },
        { step: 4, title: 'Intermediary Takedown Order (IT Act Sec 69A)', status: 'PENDING', date: 'Awaiting Evidence' }
      ]
    },
    {
      caseId: 'NCRP-2026-610294',
      category: 'GENERAL_CYBER_OFFENCES',
      categoryTitle: 'Identity Theft & Phishing Scam',
      amountLost: 12500,
      incidentDate: '2026-08-20T11:00:00',
      status: 'FIR_REGISTERED',
      statusTitle: 'FIR Registered',
      firNumber: 'FIR-0089/2026 (Sec 66C/66D IT Act)',
      fieldStation: 'Bengaluru Central Cyber Crime Station',
      timeline: [
        { step: 1, title: 'Complaint Ingested & Verified', status: 'COMPLETED', date: '20 Aug 2026, 11:15 AM' },
        { step: 2, title: 'IP Log & Telecom Subpoena Issued', status: 'COMPLETED', date: '21 Aug 2026, 02:00 PM' },
        { step: 3, title: 'Statutory FIR Generated (FIR-0089/2026)', status: 'COMPLETED', date: '22 Aug 2026, 05:30 PM' },
        { step: 4, title: 'Investigation & Charge-Sheet Filing', status: 'IN_PROGRESS', date: 'Assigned to Insp. S. Rao' }
      ]
    },
    {
      caseId: 'NCRP-2026-318945',
      category: 'FINANCIAL_UPI_FRAUD',
      categoryTitle: 'Part-Time Job Task & Telegram Scam',
      amountLost: 185000,
      incidentDate: '2026-02-14T14:30:00',
      status: 'FIR_REGISTERED',
      statusTitle: 'FIR Registered',
      firNumber: 'FIR-0034/2026 (Sec 318 BNS / Sec 66D IT Act)',
      fieldStation: 'Cyber Crime Police Station (Hyderabad Central)',
      timeline: [
        { step: 1, title: 'Complaint Registered via 1930 Helpline', status: 'COMPLETED', date: '14 Feb 2026, 02:45 PM' },
        { step: 2, title: 'Lien Dispatched to 3 Layer Mule Accounts', status: 'COMPLETED', date: '14 Feb 2026, 03:10 PM' },
        { step: 3, title: 'Police Subpoena to Telegram & Mule KYC Banks', status: 'COMPLETED', date: '16 Feb 2026, 10:00 AM' },
        { step: 4, title: 'Court Refund Notice Dispatched', status: 'IN_PROGRESS', date: 'In Court Proceedings' }
      ]
    },
    {
      caseId: 'NCRP-2025-992102',
      category: 'GENERAL_CYBER_OFFENCES',
      categoryTitle: 'Fake Electricity Disconnection APK Ransomware',
      amountLost: 48000,
      incidentDate: '2025-11-10T19:20:00',
      status: 'REFUND_COMPLETED',
      statusTitle: 'Refund Completed',
      fieldStation: 'Delhi Police Cyber Cell (IFSO Dwarka)',
      timeline: [
        { step: 1, title: 'Emergency Golden Hour Complaint Lodged', status: 'COMPLETED', date: '10 Nov 2025, 07:35 PM' },
        { step: 2, title: 'Lien Placed on PNB Beneficiary Account', status: 'COMPLETED', date: '10 Nov 2025, 07:50 PM' },
        { step: 3, title: 'Chief Metropolitan Magistrate Release Order', status: 'COMPLETED', date: '04 Dec 2025, 11:30 AM' },
        { step: 4, title: '₹48,000 Credited Back to Victim Account', status: 'COMPLETED', date: '08 Dec 2025, 04:00 PM' }
      ]
    },
    {
      caseId: 'NCRP-2025-441029',
      category: 'FINANCIAL_UPI_FRAUD',
      categoryTitle: 'OLX QR Code Scanner Phishing',
      amountLost: 25000,
      incidentDate: '2025-05-18T12:15:00',
      status: 'REFUND_COMPLETED',
      statusTitle: 'Refund Completed',
      fieldStation: 'Cyber Crime Police Station, Mumbai',
      timeline: [
        { step: 1, title: 'Express Report Lodged', status: 'COMPLETED', date: '18 May 2025, 12:25 PM' },
        { step: 2, title: 'Paytm Payment Gateway Freeze Executed', status: 'COMPLETED', date: '18 May 2025, 12:40 PM' },
        { step: 3, title: 'Full ₹25,000 Reversal Approved by Bank', status: 'COMPLETED', date: '26 May 2025, 03:00 PM' }
      ]
    }
  ];

  const DEFAULT_SUSPECTS = [
    {
      type: 'UPI_VPA',
      identifier: 'fraudster99@ybl',
      riskScore: 98,
      riskLevel: 'CRITICAL',
      reportsCount: 42,
      associatedCases: ['NCRP-2026-892103', 'NCRP-2026-441029'],
      remarks: 'Reported in multiple electricity bill phishing scams across Karnataka and Maharashtra.',
      history: [
        { date: '27 Aug 2026', modus: 'Electricity bill payment APK link demand' },
        { date: '14 Jul 2026', modus: 'Fake SBI KYC renewal SMS link' },
        { date: '02 Jun 2026', modus: 'WhatsApp job task deposit transfer' }
      ]
    },
    {
      type: 'UPI_VPA',
      identifier: 'fastpay.mule99@okaxis',
      riskScore: 95,
      riskLevel: 'CRITICAL',
      reportsCount: 28,
      associatedCases: ['NCRP-2026-892103'],
      remarks: 'Mule account actively flagged under 1930 CFCFRMS for instant lien placement.',
      history: [
        { date: '27 Aug 2026', modus: 'UPI QR scan unauthorized pull request' },
        { date: '19 Aug 2026', modus: 'OLX furniture sale payment phishing' }
      ]
    },
    {
      type: 'PHONE',
      identifier: '9845012345',
      riskScore: 89,
      riskLevel: 'HIGH',
      reportsCount: 19,
      associatedCases: ['NCRP-2026-610294'],
      remarks: 'Impersonating bank KYC verification desk requesting APK screen-sharing install.',
      history: [
        { date: '20 Aug 2026', modus: 'Called claiming Aadhaar SIM disconnect notice' },
        { date: '05 Aug 2026', modus: 'Posed as credit card reward point redeem executive' }
      ]
    },
    {
      type: 'PHONE',
      identifier: '8910293841',
      riskScore: 92,
      riskLevel: 'CRITICAL',
      reportsCount: 31,
      associatedCases: ['NCRP-2026-881920'],
      remarks: 'Fake courier parcel / customs narcotics intimidation scam calls ("Digital Arrest").',
      history: [
        { date: '26 Aug 2026', modus: 'Skype video call posing as Mumbai Cyber Cell DCP' },
        { date: '18 Aug 2026', modus: 'Threatened FedEx parcel seizure with contraband' }
      ]
    },
    {
      type: 'BANK_ACCOUNT',
      identifier: '501009823412',
      riskScore: 91,
      riskLevel: 'HIGH',
      reportsCount: 14,
      associatedCases: ['NCRP-2026-892103'],
      remarks: 'Mule bank account under surveillance at HDFC Bank (IFSC: HDFC0001092).',
      history: [
        { date: '27 Aug 2026', modus: 'Layer-2 fund routing destination for UPI fraud' }
      ]
    },
    {
      type: 'EMAIL',
      identifier: 'summons@cbi-investigation.online',
      riskScore: 96,
      riskLevel: 'CRITICAL',
      reportsCount: 37,
      associatedCases: ['NCRP-2026-774102'],
      remarks: 'Forged court summons alleging pornography implication and demanding crypto fines.',
      history: [
        { date: '24 Aug 2026', modus: 'Sent forged MHA / CBI court warrant PDF' }
      ]
    },
    {
      type: 'SOCIAL_MEDIA',
      identifier: '@crypto_profit_guru_tg',
      riskScore: 94,
      riskLevel: 'CRITICAL',
      reportsCount: 22,
      associatedCases: ['NCRP-2026-318945'],
      remarks: 'Telegram investment scam group promising 300% daily returns on crypto staking.',
      history: [
        { date: '14 Feb 2026', modus: 'Lured victims with fake trading dashboard screenshots' }
      ]
    },
    {
      type: 'URL',
      identifier: 'https://epfo-kyc-update-portal.xyz',
      riskScore: 99,
      riskLevel: 'CRITICAL',
      reportsCount: 64,
      associatedCases: ['NCRP-2026-992102'],
      remarks: 'Phishing domain cloning government portal. Blocked by I4C DNS firewall.',
      history: [
        { date: '10 Nov 2025', modus: 'Harvested UAN numbers and NetBanking passwords' }
      ]
    }
  ];

  // Storage Inits
  function initDB() {
    if (typeof localStorage === 'undefined') return;
    if (!localStorage.getItem(STORAGE_KEY_CASES)) {
      localStorage.setItem(STORAGE_KEY_CASES, JSON.stringify(DEFAULT_CASES));
    }
    if (!localStorage.getItem(STORAGE_KEY_SUSPECTS)) {
      localStorage.setItem(STORAGE_KEY_SUSPECTS, JSON.stringify(DEFAULT_SUSPECTS));
    }
  }

  initDB();

  // Public Interface
  window.CcpDB = {
    DEFAULT_USER,
    
    getUserSession() {
      if (typeof localStorage === 'undefined') return DEFAULT_USER;
      const raw = localStorage.getItem(STORAGE_KEY_USER);
      return raw ? JSON.parse(raw) : null;
    },

    setUserSession(userObj) {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(STORAGE_KEY_USER, JSON.stringify(userObj));
    },

    clearUserSession() {
      if (typeof localStorage === 'undefined') return;
      localStorage.removeItem(STORAGE_KEY_USER);
    },

    getCases() {
      if (typeof localStorage === 'undefined') return DEFAULT_CASES;
      const raw = localStorage.getItem(STORAGE_KEY_CASES);
      return raw ? JSON.parse(raw) : DEFAULT_CASES;
    },

    getCaseById(caseId) {
      const cases = this.getCases();
      return cases.find(c => c.caseId.toUpperCase() === caseId.toUpperCase()) || null;
    },

    addComplaint(complaintData) {
      const cases = this.getCases();
      const randomNum = Math.floor(100000 + Math.random() * 900000);
      const newCaseId = `NCRP-2026-${randomNum}`;

      const newCase = {
        caseId: newCaseId,
        category: complaintData.category || 'FINANCIAL_UPI_FRAUD',
        categoryTitle: complaintData.categoryTitle || 'Financial Cyber Fraud (1930 CFCFRMS)',
        amountLost: parseFloat(complaintData.amountLost) || 0,
        incidentDate: complaintData.incidentDate || new Date().toISOString(),
        status: 'LIEN_PLACED',
        statusTitle: 'Lien Placed',
        suspectVpa: complaintData.suspectVpa || 'Unknown',
        fieldStation: 'Designated State Cyber Police Station',
        estimatedRecovery: 'Lien Signal Active (Under Inter-Bank Verification)',
        timeline: [
          { step: 1, title: 'Emergency Express Report Ingested', status: 'COMPLETED', date: new Date().toLocaleString('en-IN') },
          { step: 2, title: 'CFCFRMS 1930 Inter-Bank Lien Dispatched', status: 'COMPLETED', date: 'Just now' },
          { step: 3, title: 'Beneficiary Account Hold Verification', status: 'IN_PROGRESS', date: 'In-Flight' },
          { step: 4, title: 'Magistrate Refund & Police FIR Notice', status: 'PENDING', date: 'Pending Bank Confirmation' }
        ]
      };

      cases.unshift(newCase);
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem(STORAGE_KEY_CASES, JSON.stringify(cases));
      }
      return newCase;
    },

    getSuspects() {
      if (typeof localStorage === 'undefined') return DEFAULT_SUSPECTS;
      const raw = localStorage.getItem(STORAGE_KEY_SUSPECTS);
      return raw ? JSON.parse(raw) : DEFAULT_SUSPECTS;
    },

    searchSuspects(query) {
      if (!query) return [];
      const q = query.trim().toLowerCase();
      const suspects = this.getSuspects();
      return suspects.filter(s => {
        return s.identifier.toLowerCase().includes(q) ||
               s.type.toLowerCase().includes(q) ||
               s.remarks.toLowerCase().includes(q);
      });
    },

    saveDraft(formData) {
      if (typeof localStorage === 'undefined') return;
      localStorage.setItem(STORAGE_KEY_DRAFT, JSON.stringify({
        data: formData,
        timestamp: new Date().toISOString()
      }));
    },

    getDraft() {
      if (typeof localStorage === 'undefined') return null;
      const raw = localStorage.getItem(STORAGE_KEY_DRAFT);
      return raw ? JSON.parse(raw) : null;
    },

    clearDraft() {
      if (typeof localStorage === 'undefined') return;
      localStorage.removeItem(STORAGE_KEY_DRAFT);
    }
  };

})(window);
