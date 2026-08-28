/**
 * National Cyber Crime Reporting Portal — Dual-Mode Authentication Engine (ccp-auth.js)
 * Implements SMS OTP simulation and 1-Click Reviewer Sandbox login.
 */

(function (window) {
  'use strict';

  let countdownInterval = null;

  function initAuthUI() {
    const loginModal = document.getElementById('auth-modal-dialog');
    const reviewerBtn = document.getElementById('btn-reviewer-login');
    const sendOtpBtn = document.getElementById('btn-send-sms-otp');
    const verifyOtpBtn = document.getElementById('btn-verify-sms-otp');
    const mobileInput = document.getElementById('auth-mobile-input');
    const otpInputWrap = document.getElementById('auth-otp-step-wrap');
    const mobileInputWrap = document.getElementById('auth-mobile-step-wrap');
    const authErrorAlert = document.getElementById('auth-error-alert');
    const resendBtn = document.getElementById('btn-resend-otp');
    const countdownSpan = document.getElementById('otp-countdown-val');

    // 1. One-Click Reviewer Sandbox Login
    if (reviewerBtn) {
      reviewerBtn.addEventListener('click', () => {
        const user = window.CcpDB.DEFAULT_USER;
        window.CcpDB.setUserSession(user);
        if (loginModal && typeof loginModal.close === 'function') loginModal.close();
        window.location.href = 'dashboard.html';
      });
    }

    // 2. Mobile Input Formatting
    if (mobileInput) {
      mobileInput.addEventListener('input', (e) => {
        e.target.value = e.target.value.replace(/\D/g, '').slice(0, 10);
        if (authErrorAlert) authErrorAlert.hidden = true;
      });
    }

    // 3. Send SMS OTP Simulation
    if (sendOtpBtn && mobileInput) {
      sendOtpBtn.addEventListener('click', () => {
        const rawMobile = mobileInput.value.replace(/\D/g, '');
        if (rawMobile.length !== 10) {
          if (authErrorAlert) {
            authErrorAlert.textContent = 'Please enter a valid 10-digit Indian Mobile Number (+91).';
            authErrorAlert.hidden = false;
          }
          mobileInput.focus();
          return;
        }

        sendOtpBtn.disabled = true;
        sendOtpBtn.textContent = 'Sending OTP...';

        setTimeout(() => {
          if (mobileInputWrap) mobileInputWrap.hidden = true;
          if (otpInputWrap) otpInputWrap.hidden = false;
          if (sendOtpBtn) sendOtpBtn.hidden = true;
          if (verifyOtpBtn) verifyOtpBtn.hidden = false;

          const maskedMobileSpan = document.getElementById('otp-sent-mobile-masked');
          if (maskedMobileSpan) maskedMobileSpan.textContent = `+91 ${rawMobile.slice(0, 2)}******${rawMobile.slice(-2)}`;

          // Pre-fill demo OTP
          const otpField = document.getElementById('auth-otp-input');
          if (otpField) {
            otpField.value = '592810';
            otpField.focus();
          }

          startOtpCountdown(countdownSpan, resendBtn);
        }, 600);
      });
    }

    // 4. Verify SMS OTP
    if (verifyOtpBtn) {
      verifyOtpBtn.addEventListener('click', () => {
        const otpField = document.getElementById('auth-otp-input');
        const otpVal = otpField ? otpField.value.replace(/\D/g, '') : '';

        if (otpVal.length !== 6) {
          if (authErrorAlert) {
            authErrorAlert.textContent = 'Please enter the 6-digit OTP received via SMS.';
            authErrorAlert.hidden = false;
          }
          if (otpField) otpField.focus();
          return;
        }

        verifyOtpBtn.disabled = true;
        verifyOtpBtn.textContent = 'Verifying Session...';

        setTimeout(() => {
          const rawMobile = mobileInput ? mobileInput.value.replace(/\D/g, '') : '9876543210';
          const user = {
            name: 'Citizen (Verified)',
            mobile: rawMobile,
            email: `user_${rawMobile.slice(-4)}@epfo-citizen.gov.in`,
            state: 'Karnataka',
            district: 'Bengaluru Urban',
            isReviewer: false
          };

          window.CcpDB.setUserSession(user);
          if (loginModal && typeof loginModal.close === 'function') loginModal.close();
          window.location.href = 'dashboard.html';
        }, 500);
      });
    }

    // 5. Resend Countdown
    if (resendBtn) {
      resendBtn.addEventListener('click', () => {
        resendBtn.disabled = true;
        startOtpCountdown(countdownSpan, resendBtn);
        const otpField = document.getElementById('auth-otp-input');
        if (otpField) otpField.value = '719402';
      });
    }
  }

  function startOtpCountdown(countdownSpan, resendBtn) {
    if (countdownInterval) clearInterval(countdownInterval);
    let secondsLeft = 30;

    if (resendBtn) resendBtn.disabled = true;
    if (countdownSpan) countdownSpan.textContent = `(${secondsLeft}s)`;

    countdownInterval = setInterval(() => {
      secondsLeft--;
      if (countdownSpan) countdownSpan.textContent = `(${secondsLeft}s)`;

      if (secondsLeft <= 0) {
        clearInterval(countdownInterval);
        if (countdownSpan) countdownSpan.textContent = '';
        if (resendBtn) resendBtn.disabled = false;
      }
    }, 1000);
  }

  function openAuthModal() {
    const loginModal = document.getElementById('auth-modal-dialog');
    if (loginModal && typeof loginModal.showModal === 'function') {
      loginModal.showModal();
    }
  }

  function loginAsReviewer() {
    const user = (window.CcpDB && window.CcpDB.DEFAULT_USER) ? window.CcpDB.DEFAULT_USER : {
      name: 'Ramesh Kumar',
      mobile: '+91 9876543210',
      email: 'ramesh.kumar@example.gov.in',
      aadhaarLast4: '8821'
    };
    if (window.CcpDB && typeof window.CcpDB.setUserSession === 'function') {
      window.CcpDB.setUserSession(user);
    } else {
      localStorage.setItem('ccp_user_session', JSON.stringify(user));
    }
    return user;
  }

  function closeAuthModal() {
    const loginModal = document.getElementById('auth-modal-dialog');
    if (loginModal && typeof loginModal.close === 'function') {
      loginModal.close();
    }
  }

  function checkSessionOrPrompt(callback) {
    const user = window.CcpDB ? window.CcpDB.getUserSession() : null;
    if (user) {
      if (typeof callback === 'function') callback(user);
    } else {
      openAuthModal();
    }
  }

  if (typeof document !== 'undefined') {
    document.addEventListener('DOMContentLoaded', initAuthUI);
  }

  window.CcpAuth = {
    initAuthUI,
    openAuthModal,
    closeAuthModal,
    loginAsReviewer,
    checkSessionOrPrompt
  };

})(typeof window !== 'undefined' ? window : global);

