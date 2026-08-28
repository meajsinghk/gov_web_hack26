/**
 * National Cyber Crime Reporting Portal — Main Application Engine (ccp-app.js)
 * Manages sovereign trust banner, accessibility controls, 12 Indic languages,
 * universal case status lookup, and suspect verification widgets.
 */

(function (window) {
  'use strict';

  const root = typeof document !== 'undefined' ? document.documentElement : null;

  function initApp() {
    if (!root) return;

    // =========================================================================
    // 1. SOVEREIGN TRUST ACCORDION BANNER (USWDS/S3WaaS)
    // =========================================================================
    const trustToggleBtn = document.getElementById('trust-banner-toggle');
    const trustDetailsPanel = document.getElementById('gov-trust-details');

    if (trustToggleBtn && trustDetailsPanel) {
      trustToggleBtn.addEventListener('click', () => {
        const isExpanded = trustToggleBtn.getAttribute('aria-expanded') === 'true';
        trustToggleBtn.setAttribute('aria-expanded', !isExpanded ? 'true' : 'false');
        trustDetailsPanel.hidden = isExpanded;
      });
    }

    // =========================================================================
    // 2. ACCESSIBILITY TOOLBAR (Font Resizing & High Contrast)
    // =========================================================================
    const fontDecBtn = document.getElementById('font-dec');
    const fontNormBtn = document.getElementById('font-norm');
    const fontIncBtn = document.getElementById('font-inc');
    const fontBtns = [fontDecBtn, fontNormBtn, fontIncBtn];

    const FONT_SCALES = { dec: '0.875', norm: '1', inc: '1.15' };

    function setFontScale(scaleKey) {
      const scaleVal = FONT_SCALES[scaleKey] || '1';
      root.style.setProperty('--font-scale', scaleVal);
      localStorage.setItem('ncrp_font_scale', scaleKey);

      fontBtns.forEach(btn => {
        if (!btn) return;
        btn.classList.toggle('is-active', btn.id === `font-${scaleKey}`);
      });
    }

    if (fontDecBtn) fontDecBtn.addEventListener('click', () => setFontScale('dec'));
    if (fontNormBtn) fontNormBtn.addEventListener('click', () => setFontScale('norm'));
    if (fontIncBtn) fontIncBtn.addEventListener('click', () => setFontScale('inc'));

    const savedFontScale = localStorage.getItem('ncrp_font_scale') || 'norm';
    setFontScale(savedFontScale);

    // High Contrast Toggle
    const contrastToggle = document.getElementById('contrast-toggle');
    function setContrastTheme(isHighContrast) {
      if (isHighContrast) {
        root.setAttribute('data-theme', 'high-contrast');
        if (contrastToggle) contrastToggle.setAttribute('aria-pressed', 'true');
        localStorage.setItem('ncrp_theme', 'high-contrast');
      } else {
        root.setAttribute('data-theme', 'default');
        if (contrastToggle) contrastToggle.setAttribute('aria-pressed', 'false');
        localStorage.setItem('ncrp_theme', 'default');
      }
    }

    if (contrastToggle) {
      contrastToggle.addEventListener('click', () => {
        const isCurrentHC = root.getAttribute('data-theme') === 'high-contrast';
        setContrastTheme(!isCurrentHC);
      });
    }

    if (localStorage.getItem('ncrp_theme') === 'high-contrast') {
      setContrastTheme(true);
    }

    // Indic Language Selector
    const langSelect = document.getElementById('global-lang-select');
    if (langSelect) {
      langSelect.addEventListener('change', (e) => {
        localStorage.setItem('ncrp_lang', e.target.value);
      });
      const savedLang = localStorage.getItem('ncrp_lang');
      if (savedLang) langSelect.value = savedLang;
    }

    // =========================================================================
    // 3. HOMEPAGE PUBLIC SUSPECT SEARCH WIDGET
    // =========================================================================
    const suspectForm = document.getElementById('home-suspect-search-form');
    const suspectInput = document.getElementById('home-suspect-input');
    const suspectResultBox = document.getElementById('home-suspect-result-box');

    if (suspectForm && suspectInput && suspectResultBox) {
      suspectForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const query = suspectInput.value.trim();
        if (!query) return;

        const results = window.CcpDB.searchSuspects(query);
        renderSuspectResults(results, query, suspectResultBox);
      });
    }

    // =========================================================================
    // 4. UNIVERSAL CASE STATUS CHECKER
    // =========================================================================
    const statusForm = document.getElementById('universal-status-form');
    const statusInput = document.getElementById('status-case-id-input');
    const statusResultBox = document.getElementById('status-result-display');

    if (statusForm && statusInput && statusResultBox) {
      statusForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const caseId = statusInput.value.trim();
        if (!caseId) return;

        const caseItem = window.CcpDB.getCaseById(caseId);
        if (caseItem) {
          statusResultBox.innerHTML = `
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.5rem; border-bottom:1px solid var(--border-color); padding-bottom:0.4rem;">
              <div>
                <strong style="font-size:0.9375rem; color:var(--gov-navy);">${caseItem.caseId}</strong>
                <div style="font-size:0.75rem; color:var(--text-secondary);">${caseItem.categoryTitle}</div>
              </div>
              <span class="status-badge status-badge--warning">● ${caseItem.statusTitle}</span>
            </div>
            <div style="font-size:0.8125rem; line-height:1.6;">
              <div><strong>Filing Date:</strong> ${new Date(caseItem.incidentDate).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</div>
              <div><strong>Designated Cell:</strong> ${caseItem.fieldStation}</div>
              <div><strong>Current Action:</strong> ${caseItem.timeline[caseItem.timeline.length - 1].title}</div>
            </div>
            <div style="margin-top:0.75rem; text-align:right;">
              <a href="dashboard.html" class="btn btn-primary" style="font-size:0.75rem; padding:0.35rem 0.75rem;">View Full Case Timeline ↗</a>
            </div>
          `;
          statusResultBox.hidden = false;
        } else {
          statusResultBox.innerHTML = `
            <div class="alert-box alert-error">
              <strong>Record Not Found:</strong> No registered cyber complaint found with ID "${caseId}". Please verify your 14-character reference (e.g. NCRP-2026-892103).
            </div>
          `;
          statusResultBox.hidden = false;
        }
      });
    }

    // =========================================================================
    // 5. DRAFT RESTORATION BANNER (AUTO-SAVE)
    // =========================================================================
    const draft = window.CcpDB.getDraft();
    const draftBanner = document.getElementById('draft-restore-banner');
    if (draft && draftBanner) {
      draftBanner.hidden = false;
      const draftTime = document.getElementById('draft-saved-time');
      if (draftTime) draftTime.textContent = new Date(draft.savedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
  }

  function renderSuspectResults(results, query, targetEl) {
    if (!targetEl) return;

    if (results.length === 0) {
      targetEl.innerHTML = `
        <div style="display:flex; align-items:center; gap:0.5rem; color:var(--gov-green);">
          <div style="font-size:1.5rem;">🛡️</div>
          <div>
            <strong>No Prior Fraud Reports Found for "${query}"</strong>
            <p style="font-size:0.75rem; color:var(--text-secondary); margin:0;">
              This identifier is not currently flagged in India's National I4C Cyber Crime Database. Always verify before making financial transactions.
            </p>
          </div>
        </div>
      `;
      targetEl.hidden = false;
      return;
    }

    const item = results[0];
    targetEl.innerHTML = `
      <div style="border-left: 4px solid var(--gov-crimson); padding-left: 0.75rem;">
        <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:0.35rem;">
          <div>
            <strong style="color:var(--gov-crimson); font-size:0.9375rem;">⚠️ High Risk Suspect Identifier Detected!</strong>
            <div style="font-family:var(--font-mono); font-size:0.8125rem; font-weight:700;">${item.identifier} (${item.type})</div>
          </div>
          <span style="background-color:var(--gov-crimson); color:#fff; font-size:0.6875rem; font-weight:800; padding:0.2rem 0.5rem; border-radius:var(--radius-sm);">
            Risk Score: ${item.riskScore}/100
          </span>
        </div>
        <p style="font-size:0.75rem; color:var(--text-secondary); margin-bottom:0.5rem;">${item.remarks}</p>
        <div style="font-size:0.6875rem; color:var(--text-muted);">
          Flagged in <strong>${item.reportsCount} citizen complaints</strong> across national banking nodes.
        </div>
      </div>
    `;
    targetEl.hidden = false;
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initApp);
  }

  window.CcpApp = {
    initApp,
    renderSuspectResults
  };

})(typeof window !== 'undefined' ? window : global);

