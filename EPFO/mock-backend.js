/**
 * EPFO Edge Mock API & Synthetic Identity Ledger (mock-backend.js)
 * Implements fetch interception, state persistence (localStorage),
 * cryptographic Proof-of-Work generator, and statutory database simulation.
 */

(function (window) {
  'use strict';

  // Seed Demo Member Record if not present in localStorage
  const STORAGE_KEY_PROFILE = 'epfo_synthetic_profile_v2';
  const STORAGE_KEY_CLAIMS = 'epfo_synthetic_claims_v2';
  const STORAGE_KEY_SESSION = 'epfo_synthetic_session_v2';
  const STORAGE_KEY_TRANSFERS = 'epfo_synthetic_transfers_v2';

  const DEFAULT_PROFILE = {
    uan: '100928374651',
    memberId: 'DLCPM0019283000/0048291',
    name: 'Ramesh Kumar',
    nameOnAadhaar: 'RAMESH KUMAR',
    nameOnBank: 'RAMESH KUMAR',
    mobile: '9876543210',
    aadhaarStatus: 'VERIFIED', // VERIFIED, PENDING, REJECTED
    aadhaarLast4: '8942',
    panStatus: 'VERIFIED',
    panNumber: 'ABCDE1234F',
    bankStatus: 'MAPPED', // MAPPED, UNMAPPED, MISMATCH
    bankName: 'HDFC Bank',
    bankAccountLast4: '1023',
    bankIfsc: 'HDFC0001023',
    npciDirectMapping: true,
    establishmentName: 'Precision Engineering Works Pvt Ltd',
    establishmentCode: 'DLCPM0019283000',
    dateOfJoining: '2018-04-15',
    dateOfExit: null, // null for Active, or '2024-01-31'
    totalServiceMonths: 76, // 6.33 years
    balances: {
      employeeShare: 142500,
      employerShare: 43200,
      pensionShare: 38100,
      totalWithdrawable: 185700
    },
    previousAccounts: [
      {
        memberId: 'MHBAN0028190000/0018273',
        establishmentName: 'Apex Precision Tools Ltd',
        servicePeriod: '2015-08-01 to 2018-03-31',
        balance: 64200,
        status: 'UNMERGED'
      }
    ],
    nomineeRegistered: true,
    notifications: [
      { id: 'notif-1', title: 'Annual Interest Credited', text: 'Interest @ 8.25% credited to your EPF account for FY 2024–25.', date: '15 Aug 2026', unread: true },
      { id: 'notif-2', title: 'Monthly Contribution Acknowledged', text: 'July 2026 statutory contribution credited by Precision Engineering Works.', date: '10 Aug 2026', unread: false }
    ]
  };

  const DEFAULT_CLAIMS = [
    {
      claimId: 'CLM-2026-8942-1029',
      formType: 'Form 31 (Para 68J - Medical Emergency)',
      amountRequested: 50000,
      amountSanctioned: 50000,
      appliedDate: '2026-08-20',
      currentStep: 2, // 1: Ingested & Verified, 2: Field Office, 3: Bank Sanctioned, 4: Disbursed
      statusText: 'Under Field Office Processing',
      fieldOffice: 'Bengaluru Central Regional Office',
      estimatedResolution: '48 Hours (Fast-Track Eligible)',
      timeline: [
        { step: 1, title: 'Claim Ingested & Pre-Flight Verified', status: 'COMPLETED', date: '20 Aug 2026, 11:20 AM' },
        { step: 2, title: 'Field Office Processing', status: 'IN_PROGRESS', date: '21 Aug 2026 (Assigned to Section Officer)' },
        { step: 3, title: 'Bank Payment Sanctioned (NPCI NACH / NEFT)', status: 'PENDING', date: 'Expected 23 Aug 2026' },
        { step: 4, title: 'Funds Credited to Account ****1023', status: 'PENDING', date: 'Estimated 24 Aug 2026' }
      ]
    }
  ];

  // Initialize storage
  if (typeof localStorage !== 'undefined') {
    if (!localStorage.getItem(STORAGE_KEY_PROFILE)) {
      localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(DEFAULT_PROFILE));
    }
    if (!localStorage.getItem(STORAGE_KEY_CLAIMS)) {
      localStorage.setItem(STORAGE_KEY_CLAIMS, JSON.stringify(DEFAULT_CLAIMS));
    }
  }

  function getStoredProfile() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_PROFILE)) || DEFAULT_PROFILE;
    } catch (e) {
      return DEFAULT_PROFILE;
    }
  }

  function saveStoredProfile(p) {
    localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(p));
  }

  function getStoredClaims() {
    try {
      return JSON.parse(localStorage.getItem(STORAGE_KEY_CLAIMS)) || [];
    } catch (e) {
      return [];
    }
  }

  function saveStoredClaims(c) {
    localStorage.setItem(STORAGE_KEY_CLAIMS, JSON.stringify(c));
  }

  // =========================================================================
  // Cryptographic Proof-of-Work (PoW) Engine (Bot Defense)
  // =========================================================================
  async function sha256(str) {
    const buffer = new TextEncoder().encode(str);
    const hashBuffer = await crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  }

  async function solveProofOfWork(challenge, difficulty = 2) {
    let nonce = 0;
    const targetPrefix = '0'.repeat(difficulty);
    while (true) {
      const hash = await sha256(`${challenge}:${nonce}`);
      if (hash.startsWith(targetPrefix)) {
        return { nonce, hash };
      }
      nonce++;
      // Safety threshold
      if (nonce > 500000) break;
    }
    return { nonce, hash: '0000fallback' };
  }

  // =========================================================================
  // Intercept Native fetch Requests
  // =========================================================================
  const originalFetch = window.fetch;

  window.fetch = async function (url, options = {}) {
    const urlStr = typeof url === 'string' ? url : url.url || '';
    
    // Only intercept synthetic mock endpoints starting with /api/v1/
    if (urlStr.startsWith('/api/v1/')) {
      const method = (options.method || 'GET').toUpperCase();
      let body = {};
      try {
        if (options.body) body = JSON.parse(options.body);
      } catch (e) {
        body = {};
      }

      // Route Handlers
      if (urlStr === '/api/v1/auth/pow-challenge' && method === 'GET') {
        const challenge = `EPFO_POW_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
        return new Response(JSON.stringify({ challenge, difficulty: 2 }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (urlStr === '/api/v1/auth/login' && method === 'POST') {
        const { identifier, mode, otp, password, powProof } = body;
        
        // Validate clean 12 digit UAN / mobile
        const cleanId = (identifier || '').replace(/\D/g, '');
        if (cleanId.length !== 12 && cleanId.length !== 10) {
          return new Response(JSON.stringify({ success: false, error: 'Please enter a valid 12-digit UAN or 10-digit mobile number.' }), {
            status: 400,
            headers: { 'Content-Type': 'application/json' }
          });
        }

        const token = `EPFO_SESS_${Date.now()}_${Math.random().toString(36).substring(2, 10)}`;
        sessionStorage.setItem(STORAGE_KEY_SESSION, JSON.stringify({ token, uan: '100928374651', loggedInAt: Date.now() }));

        return new Response(JSON.stringify({
          success: true,
          token,
          user: { name: 'Ramesh Kumar', uan: '100928374651', memberId: 'DLCPM0019283000/0048291' }
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (urlStr === '/api/v1/member/profile' && method === 'GET') {
        const profile = getStoredProfile();
        return new Response(JSON.stringify({ success: true, profile }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (urlStr === '/api/v1/member/preflight-validate' && method === 'POST') {
        const profile = getStoredProfile();
        const { intent, claimType, bankLast4, customName } = body;

        const nameAadhaar = profile.nameOnAadhaar;
        const nameBank = customName || profile.nameOnBank;

        // Perform Jaro-Winkler Metric in Engine
        // Return profile statutory states
        const hasExitDate = profile.dateOfExit !== null;
        const serviceMonths = profile.totalServiceMonths;

        let rulePassed = true;
        let ruleViolation = null;

        if (intent === 'full_settlement' && !hasExitDate) {
          rulePassed = false;
          ruleViolation = 'NO_EXIT_DATE';
        } else if (intent === 'pension_withdrawal' && serviceMonths >= 120) {
          rulePassed = false;
          ruleViolation = 'PENSION_ELIGIBLE_FORM_10D';
        }

        return new Response(JSON.stringify({
          success: true,
          nameAadhaar,
          nameBank,
          bankMapped: profile.npciDirectMapping,
          bankLast4Matches: (bankLast4 === profile.bankAccountLast4),
          hasExitDate,
          serviceMonths,
          rulePassed,
          ruleViolation
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (urlStr === '/api/v1/member/submit-claim' && method === 'POST') {
        const profile = getStoredProfile();
        const claims = getStoredClaims();
        const { intent, formType, amountRequested, bankAccountConfirmed, jaroWinklerScore } = body;

        const claimAmount = Math.min(amountRequested || 50000, profile.balances.totalWithdrawable);
        const refId = `CLM-2026-${Math.floor(1000 + Math.random() * 9000)}-${profile.aadhaarLast4}`;

        const newClaim = {
          claimId: refId,
          formType: formType || 'Form 31 (Para 68J)',
          amountRequested: claimAmount,
          amountSanctioned: claimAmount,
          appliedDate: new Date().toISOString().split('T')[0],
          currentStep: 1,
          statusText: 'Claim Ingested & Pre-Flight Verified (Edge Engine)',
          fieldOffice: 'Bengaluru Central Regional Office',
          estimatedResolution: '48 Hours (Fast-Track Eligible)',
          timeline: [
            { step: 1, title: 'Claim Ingested & Pre-Flight Verified', status: 'COMPLETED', date: 'Just Now' },
            { step: 2, title: 'Field Office Processing', status: 'IN_PROGRESS', date: 'Allocated to System' },
            { step: 3, title: 'Bank Payment Sanctioned (NPCI NACH / NEFT)', status: 'PENDING', date: 'Pending Verification' },
            { step: 4, title: `Funds Credited to Account ****${profile.bankAccountLast4}`, status: 'PENDING', date: 'Scheduled' }
          ]
        };

        // Deduct from balance
        profile.balances.employeeShare = Math.max(0, profile.balances.employeeShare - claimAmount);
        profile.balances.totalWithdrawable = profile.balances.employeeShare + profile.balances.employerShare;
        saveStoredProfile(profile);

        // Add to active claims
        claims.unshift(newClaim);
        saveStoredClaims(claims);

        return new Response(JSON.stringify({
          success: true,
          claim: newClaim,
          updatedBalances: profile.balances
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (urlStr === '/api/v1/member/claims-status' && method === 'GET') {
        const claims = getStoredClaims();
        return new Response(JSON.stringify({ success: true, claims }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (urlStr === '/api/v1/member/transfer' && method === 'POST') {
        const profile = getStoredProfile();
        const { previousMemberId } = body;
        
        let mergedAmount = 0;
        profile.previousAccounts = profile.previousAccounts.map(acc => {
          if (acc.memberId === previousMemberId && acc.status === 'UNMERGED') {
            mergedAmount = acc.balance;
            return { ...acc, status: 'MERGED_CONSOLIDATED' };
          }
          return acc;
        });

        profile.balances.employeeShare += mergedAmount;
        profile.balances.totalWithdrawable += mergedAmount;
        saveStoredProfile(profile);

        return new Response(JSON.stringify({
          success: true,
          mergedAmount,
          updatedProfile: profile
        }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }

      if (urlStr === '/api/v1/member/mark-exit' && method === 'POST') {
        const profile = getStoredProfile();
        profile.dateOfExit = '2024-01-31';
        saveStoredProfile(profile);
        return new Response(JSON.stringify({ success: true, dateOfExit: '2024-01-31' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' }
        });
      }
    }

    // Default fetch for other URLs
    return originalFetch.apply(this, arguments);
  };

  // Expose helpers globally
  window.EpfoBackend = {
    solveProofOfWork,
    getStoredProfile,
    saveStoredProfile,
    getStoredClaims
  };

})(window);
