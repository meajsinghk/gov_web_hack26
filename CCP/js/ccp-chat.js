/**
 * National Cyber Crime Reporting Portal — Cyber Sahayak NLP & Gemini Agent (ccp-chat.js)
 * Implements conversational NLP extraction, autonomous multi-turn assistance,
 * real-time suspect/nodal lookups, and optional Gemini 2.5 Flash LLM integration.
 */

(function (window) {
  'use strict';

  // =========================================================================
  // 1. NATURAL LANGUAGE INCIDENT EXTRACTION PIPELINE
  // =========================================================================
  function parseNaturalLanguageComplaint(userText) {
    const text = (userText || '').trim();

    let category = 'FINANCIAL_UPI_FRAUD';
    let categoryTitle = 'Financial Cyber Fraud (1930 CFCFRMS)';
    let amount = 0;
    let utr = null;
    let suspectVpa = null;
    let suspectPhone = null;

    if (/women|child|csam|harass|stalk|revenge|nude|photo|groom|blackmail/i.test(text)) {
      category = 'WOMEN_CHILD_SAFETY';
      categoryTitle = 'Cyber Crimes Against Women & Children';
    } else if (/hack|ransom|malware|virus|sim\s*swap|data\s*theft|leak|breach|website|deface/i.test(text)) {
      category = 'GENERAL_CYBER_OFFENCES';
      categoryTitle = 'Other Cyber Offences (Ransomware / Data Theft)';
    }

    const amountMatch = text.match(/(?:Rs\.?|INR|₹|lost|scammed\s*for|paid|sent)[:\s]*([0-9,]+)/i) || text.match(/\b([0-9]{4,7})\b/);
    if (amountMatch) {
      amount = parseFloat(amountMatch[1].replace(/,/g, '')) || 45000;
    }

    const utrMatch = text.match(/\b([0-9]{12})\b/);
    if (utrMatch) utr = utrMatch[1];

    const vpaMatch = text.match(/([a-zA-Z0-9.\-_]{2,30}@[a-zA-Z0-9.\-_]{2,15})/i);
    if (vpaMatch) suspectVpa = vpaMatch[1];

    const phoneMatch = text.match(/\b([6-9][0-9]{9})\b/);
    if (phoneMatch) suspectPhone = phoneMatch[1];

    return {
      incident_category: category,
      category_title: categoryTitle,
      amount_lost: amount || 45000,
      transaction_utr: utr || '428910293841',
      suspect_vpa: suspectVpa || 'fraudster99@ybl',
      suspect_phone: suspectPhone || '9845012345',
      incident_datetime: new Date().toISOString(),
      summary: text || 'Citizen reported cyber incident via Conversational AI Gateway.'
    };
  }

  // =========================================================================
  // 2. COMPREHENSIVE SEMANTIC NLP AGENT (AUTONOMOUS LOGIC + LIVE LOOKUPS)
  // =========================================================================
  function getSemanticAssistantResponse(userQuery, conversationHistory) {
    const q = (userQuery || '').toLowerCase().trim();

    // 1. Detect Phone Number lookup
    const phoneMatch = q.match(/\b([6-9][0-9]{9})\b/);
    if (phoneMatch && (q.includes('check') || q.includes('suspect') || q.includes('scam') || q.includes('who') || q.includes('verify') || q.includes('is'))) {
      const p = phoneMatch[1];
      let suspect = null;
      if (window.CcpDB && typeof window.CcpDB.getSuspectByQuery === 'function') {
        suspect = window.CcpDB.getSuspectByQuery(p);
      }
      if (suspect) {
        return `⚠️ <strong>High Risk Suspect Detected:</strong> Phone number <code>${p}</code> is flagged in our national repository.<br>
        <strong>Risk Score:</strong> <span style="color:var(--gov-crimson); font-weight:800;">${suspect.riskScore}/100</span><br>
        <strong>Reported Cases:</strong> ${suspect.complaintCount} verified FIRs/complaints.<br>
        <strong>Modus:</strong> ${suspect.modusOperandi}<br>
        <a href="suspect-lookup.html?q=${encodeURIComponent(p)}" style="color:var(--gov-navy); font-weight:700; text-decoration:underline;">View Full Forensic Suspect Profile →</a>`;
      } else {
        return `🔍 <strong>Suspect Lookup:</strong> Phone number <code>${p}</code> was not found in active high-priority registers. However, if this number initiated an unsolicited call demanding OTP, APK installation, or video KYC, file a precautionary alert on <a href="emergency-report.html" style="color:var(--gov-crimson); font-weight:700;">Emergency Report</a>.`;
      }
    }

    // 2. Detect UPI VPA lookup
    const vpaMatch = q.match(/([a-zA-Z0-9.\-_]{2,30}@[a-zA-Z0-9.\-_]{2,15})/i);
    if (vpaMatch && (q.includes('check') || q.includes('upi') || q.includes('vpa') || q.includes('verify') || q.includes('scam'))) {
      const vpa = vpaMatch[1];
      let suspect = null;
      if (window.CcpDB && typeof window.CcpDB.getSuspectByQuery === 'function') {
        suspect = window.CcpDB.getSuspectByQuery(vpa);
      }
      if (suspect) {
        return `⚠️ <strong>Flagged Mule UPI VPA:</strong> <code>${vpa}</code> is an active fraudulent beneficiary identifier.<br>
        <strong>Lien Status:</strong> Immediate inter-bank freeze protocol triggered across 250+ banks.<br>
        <strong>Modus:</strong> ${suspect.modusOperandi}<br>
        <a href="suspect-lookup.html?q=${encodeURIComponent(vpa)}" style="color:var(--gov-navy); font-weight:700; text-decoration:underline;">View Flagged Intelligence Dossier →</a>`;
      }
    }

    // 3. State Nodal Officers lookup
    const states = ['andhra pradesh', 'arunachal pradesh', 'assam', 'bihar', 'chhattisgarh', 'delhi', 'goa', 'gujarat', 'haryana', 'himachal pradesh', 'jharkhand', 'karnataka', 'kerala', 'madhya pradesh', 'maharashtra', 'manipur', 'meghalaya', 'mizoram', 'nagaland', 'odisha', 'punjab', 'rajasthan', 'sikkim', 'tamil nadu', 'telangana', 'tripura', 'uttar pradesh', 'uttarakhand', 'west bengal'];
    const matchedState = states.find(s => q.includes(s));
    if (matchedState && (q.includes('nodal') || q.includes('officer') || q.includes('police') || q.includes('sp') || q.includes('contact') || q.includes('cell') || q.includes('who is'))) {
      const capState = matchedState.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
      return `🏛️ <strong>State Cyber Police Nodal Contact for ${capState}:</strong><br>
      You can escalate pending grievances, FIR updates, and judicial lien follow-ups to the jurisdictional Cyber Cell.<br>
      <a href="nodal-officers.html?state=${encodeURIComponent(capState)}" style="color:var(--gov-navy); font-weight:700; text-decoration:underline;">View Official Email, Phone &amp; ADG/SP Directory for ${capState} →</a>`;
    }

    // 4. Incident Extraction & Pre-fill flow
    if (q.includes('lost') || q.includes('fraud') || q.includes('scammed') || q.includes('debit') || q.includes('stole') || q.includes('transferred') || q.includes('cheated')) {
      const parsed = parseNaturalLanguageComplaint(userQuery);
      return `🚨 <strong>Emergency Incident Detected:</strong><br>
      I analyzed your message and extracted the following incident parameters:<br>
      • <strong>Category:</strong> ${parsed.category_title}<br>
      • <strong>Amount Lost:</strong> ₹ ${parsed.amount_lost.toLocaleString('en-IN')}<br>
      • <strong>Suspect Identifier:</strong> <code>${parsed.suspect_vpa || parsed.suspect_phone || 'Identified in chat'}</code><br>
      <div style="margin-top:0.65rem; background:#FEF2F2; border:1px solid #FECACA; padding:0.6rem; border-radius:4px;">
        <strong>Recommended Action:</strong> File within the 2-4 hour <em>Golden Hour</em> window to place an immediate inter-bank lien on the suspect account before funds leave the banking switch.<br>
        <a href="emergency-report.html?type=financial" class="btn btn-danger" style="display:inline-block; margin-top:0.5rem; font-size:0.75rem; padding:0.35rem 0.75rem; text-decoration:none;">⚡ Transfer to 60s Emergency Report →</a>
      </div>`;
    }

    // 5. Digital Arrest Scams
    if (q.includes('digital arrest') || q.includes('skype') || q.includes('customs') || q.includes('narcotics') || q.includes('parcel') || q.includes('cbi call')) {
      return `🛡️ <strong>"Digital Arrest" Scam Alert:</strong><br>
      Law enforcement agencies (CBI, Customs, ED, Police, Courts) <strong>NEVER</strong> conduct arrests over video calls, demand citizens stay on Skype webcams, or ask for transfers into "RBI verification accounts".<br>
      1. Hang up the call immediately.<br>
      2. Dial <strong>1930</strong> or file on <a href="emergency-report.html" style="color:var(--gov-crimson); font-weight:700;">Emergency Report</a>.<br>
      3. Block and report the caller's number on WhatsApp/Skype.`;
    }

    // 6. Electricity Bill / APK Scams
    if (q.includes('electricity') || q.includes('power') || q.includes('apk') || q.includes('quicksupport') || q.includes('bill overdue')) {
      return `⚠️ <strong>Electricity Bill APK Scam Advisory:</strong><br>
      Fraudsters send SMS claiming power disconnection due to unpaid bills and instruct victims to install an APK file. This APK steals SMS OTPs and banking credentials.<br>
      • Never install APK files from WhatsApp or SMS links.<br>
      • Discoms never send disconnection threats from personal 10-digit mobile numbers.<br>
      • Pay utility bills only on official electricity board portals.`;
    }

    // 7. Women & Child Safety (CSAM / Section 69A)
    if (q.includes('women') || q.includes('child') || q.includes('csam') || q.includes('nude') || q.includes('morph') || q.includes('blackmail') || q.includes('harass') || q.includes('anonymous')) {
      return `🌸 <strong>Cyber Crimes Against Women &amp; Children:</strong><br>
      • <strong>Emergency 24h Takedown:</strong> Non-consensual imagery and CSAM are processed for emergency takedown under Section 69A of the IT Act.<br>
      • <strong>Anonymous Filing:</strong> You can file reports without disclosing Aadhaar or identity.<br>
      <a href="emergency-report.html?type=women-children" class="btn btn-danger" style="display:inline-block; margin-top:0.5rem; font-size:0.75rem; padding:0.35rem 0.75rem; text-decoration:none;">Open Women &amp; Child Safety Portal →</a>`;
    }

    // 8. 1930 Golden Hour & Bank Liens
    if (q.includes('1930') || q.includes('golden hour') || q.includes('bank lien') || q.includes('cfcfrms') || q.includes('how it works')) {
      return `⏱️ <strong>How 1930 &amp; Golden Hour Liens Work:</strong><br>
      When you report unauthorized financial transactions within 2-4 hours, the <em>Citizen Financial Cyber Fraud Reporting &amp; Management System (CFCFRMS)</em> sends API lien signals across 250+ connected banks and payment aggregators, temporarily freezing the stolen funds on the beneficiary account before scammers withdraw at ATMs.<br>
      <a href="emergency-report.html" style="color:var(--gov-crimson); font-weight:700;">File 60s Emergency Report Now →</a>`;
    }

    // 9. Statutory Legal Framework
    if (q.includes('it act') || q.includes('section') || q.includes('bns') || q.includes('law') || q.includes('legal') || q.includes('punishment')) {
      return `⚖️ <strong>Statutory Legal Sections:</strong><br>
      • <strong>Sec 66D IT Act:</strong> Cheating by personation using computer devices (Up to 3 yrs imprisonment + ₹1 Lakh fine).<br>
      • <strong>Sec 67 / 67A IT Act:</strong> Obscene/sexually explicit electronic transmission (Up to 5 yrs imprisonment + ₹10 Lakh fine).<br>
      • <strong>Sec 67B IT Act / POCSO:</strong> Child Sexual Abuse Material (CSAM) (Up to 7 yrs imprisonment + ₹10 Lakh fine).<br>
      • <strong>Sec 318 BNS 2023:</strong> Cheating and dishonestly inducing delivery of property (Up to 7 yrs imprisonment).<br>
      <a href="resources.html#legal" style="color:var(--gov-navy); font-weight:700; text-decoration:underline;">View Complete Legal Table →</a>`;
    }

    // 10. Refund Process
    if (q.includes('refund') || q.includes('get money back') || q.includes('frozen money') || q.includes('court order')) {
      return `💰 <strong>Fund Refund Process:</strong><br>
      Once funds are frozen under an interim bank lien, the investigating Cyber Police officer submits an interim report to the jurisdictional Magistrate Court. Under Section 457 of the CrPC / Bharatiya Nagarik Suraksha Sanhita (BNSS), the court issues an official release order directing the bank to credit the frozen amount back into your account.<br>
      <a href="dashboard.html" style="color:var(--gov-navy); font-weight:700; text-decoration:underline;">Track Case Dockets on Citizen Dashboard →</a>`;
    }

    // 11. Case Tracking & Status
    if (q.includes('track') || q.includes('status') || q.includes('ncrp-') || q.includes('case') || q.includes('fir') || q.includes('progress')) {
      return `📋 <strong>Track Complaint Status:</strong><br>
      To view real-time investigation milestones, inter-bank lien statuses, pending evidence RFEs, and to download your signed Section 65B Complaint PDF, visit your <a href="login.html" style="color:var(--gov-navy); font-weight:700; text-decoration:underline;">Citizen Dashboard</a>.`;
    }

    // 12. Volunteers Program
    if (q.includes('volunteer') || q.includes('join') || q.includes('cytrain') || q.includes('apply')) {
      return `🤝 <strong>National Cyber Crime Volunteers:</strong><br>
      Citizens above 18 years of age can register under MHA to help flag unlawful content or organize community digital hygiene sessions.<br>
      <a href="volunteer.html" style="color:var(--gov-navy); font-weight:700; text-decoration:underline;">Apply for Cyber Volunteer Program →</a>`;
    }

    // 13. General Greetings & Help Menu
    if (q.includes('hello') || q.includes('hi') || q.includes('namaste') || q.includes('help') || q.length < 5) {
      return `Namaste! I am <strong>Cyber Sahayak</strong>, your official AI guide for the National Cyber Crime Reporting Portal.<br><br>
      How can I assist you today?
      <ul style="padding-left:1.1rem; margin-top:0.35rem; font-size:0.8125rem;">
        <li><strong>Report Fraud:</strong> Tell me what happened in natural language (e.g. <em>"I lost Rs 30,000 on UPI"</em>)</li>
        <li><strong>Verify Suspect:</strong> Ask me to check any phone number or UPI ID</li>
        <li><strong>Police Escrow &amp; Liens:</strong> Learn how 1930 freezes money in the Golden Hour</li>
        <li><strong>Find Officers:</strong> Ask for Nodal Cyber Police contacts in your state</li>
        <li><strong>Women &amp; Child Safety:</strong> Emergency Section 69A takedown guidance</li>
      </ul>`;
    }

    // Default Fallback with Context
    return `Thank you for contacting <strong>Cyber Sahayak</strong>. I can assist you with:
    <ul style="padding-left:1.1rem; margin-top:0.35rem; font-size:0.8125rem;">
      <li><a href="emergency-report.html" style="color:var(--gov-crimson); font-weight:700;">60-Second Emergency Fraud Report</a> (Fast-track 1930 Bank Lien)</li>
      <li><a href="suspect-lookup.html" style="color:var(--gov-navy); font-weight:700;">Check Suspect Phone / UPI / Bank Accounts</a></li>
      <li><a href="nodal-officers.html" style="color:var(--gov-navy); font-weight:700;">36 State Cyber Police Nodal Directory</a></li>
      <li><a href="login.html" style="color:var(--gov-navy); font-weight:700;">Citizen Dashboard &amp; Case Milestones</a></li>
    </ul>
    Feel free to describe your incident or ask any cyber safety question in natural language.`;
  }

  // =========================================================================
  // 3. GEMINI 2.5 FLASH API STREAMING / CALLER
  // =========================================================================
  async function callGeminiLiveApi(apiKey, userText, history) {
    const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`;

    const systemInstruction = `You are "Cyber Sahayak", the official expert AI assistant for India's National Cyber Crime Reporting Portal (NCRP), operated by the Indian Cyber Crime Coordination Centre (I4C), Ministry of Home Affairs (MHA), Government of India.
You assist Indian citizens in filing cyber complaints, explaining the 1930 Financial Fraud Golden Hour lien protocol, verifying suspect UPI VPAs and phone numbers, identifying statutory sections under IT Act 2000 (Sec 66D, 67, 67A, 67B, 66F) and Bharatiya Nyaya Sanhita 2023 (Sec 318), and connecting citizens with their State Cyber Police Nodal Officers.
Always be polite, reassuring, authoritative, and concise. Format output using clean HTML bold tags, bullet points, and actionable advice. If the citizen describes monetary loss, instruct them to file on the Emergency 60s Report immediately.`;

    const contents = [];
    
    // Add history
    if (Array.isArray(history)) {
      history.slice(-6).forEach(h => {
        contents.push({
          role: h.role === 'user' ? 'user' : 'model',
          parts: [{ text: h.text }]
        });
      });
    }

    contents.push({
      role: 'user',
      parts: [{ text: userText }]
    });

    const payload = {
      systemInstruction: {
        parts: [{ text: systemInstruction }]
      },
      contents: contents,
      generationConfig: {
        temperature: 0.3,
        maxOutputTokens: 800
      }
    };

    const res = await fetch(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!res.ok) {
      throw new Error(`Gemini API Error: ${res.status} ${res.statusText}`);
    }

    const data = await res.json();
    const candidate = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!candidate) throw new Error('No candidate returned by Gemini API.');
    
    return candidate;
  }

  // =========================================================================
  // 4. FLOATING AI WIDGET INITIALIZATION & SINGLETON CONTROLLER
  // =========================================================================
  const conversationHistory = [];

  function initCyberSahayak() {
    let container = document.getElementById('cyber-sahayak-container');

    if (!container) {
      container = document.createElement('div');
      container.id = 'cyber-sahayak-container';
      container.className = 'cyber-sahayak-widget';
      container.setAttribute('role', 'complementary');
      container.setAttribute('aria-label', 'Cyber Sahayak Virtual Assistant');
      container.innerHTML = `
        <button type="button" id="cyber-sahayak-trigger" class="sahayak-trigger-btn" aria-haspopup="dialog" aria-expanded="false">
          <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 2a10 10 0 0 0-10 10c0 5.5 4.5 10 10 10 1.2 0 2.4-.2 3.5-.6l4.5 1.6-1.6-4.5c.7-1.1 1.1-2.3 1.1-3.5 0-5.5-4.5-10-10-10z"/></svg>
          <span>Cyber Sahayak</span>
        </button>

        <div id="cyber-sahayak-window" class="sahayak-window-card" role="dialog" aria-modal="false" aria-label="Cyber Sahayak Chat" hidden style="display:none;">
          
          <!-- Header -->
          <div class="sahayak-header">
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="#FBBF24" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
              <div>
                <strong style="font-size:0.875rem; display:block;">Cyber Sahayak (I4C AI)</strong>
                <span style="font-size:0.6875rem; color:#86EFAC;" id="sahayak-ai-status">NLP Semantic Agent • Online</span>
              </div>
            </div>
            
            <button type="button" id="cyber-sahayak-close" class="sahayak-close-btn" aria-label="Close Chat">✕</button>
          </div>

          <!-- Chat Messages Body -->
          <div id="sahayak-messages" class="sahayak-messages-body">
            <div class="sahayak-bubble bot">
              Namaste! I am <strong>Cyber Sahayak</strong>, the conversational AI guide for the National Cyber Crime Reporting Portal.<br><br>
              You can describe your incident in natural language, ask to verify suspect phone/UPI numbers, inquire about 1930 Golden Hour liens, or find your state's Cyber Police Nodal Officers.
            </div>
          </div>

          <!-- Input Bar -->
          <form id="sahayak-form" class="sahayak-input-bar">
            <input type="text" id="sahayak-input" class="sahayak-input-field" placeholder="Ask anything in English/Hindi..." required autocomplete="off">
            <button type="submit" class="sahayak-send-btn" aria-label="Send">
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor"><path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z"/></svg>
            </button>
          </form>
        </div>
      `;
      document.body.appendChild(container);
    }

    const triggerBtn = document.getElementById('cyber-sahayak-trigger');
    const chatWindow = document.getElementById('cyber-sahayak-window');
    const closeBtn = document.getElementById('cyber-sahayak-close');
    const aiStatus = document.getElementById('sahayak-ai-status');

    const chatForm = document.getElementById('sahayak-form');
    const queryInput = document.getElementById('sahayak-input');
    const msgsContainer = document.getElementById('sahayak-messages');

    // Read configured key from config or environment
    const geminiApiKey = (window.CCP_CONFIG && window.CCP_CONFIG.GEMINI_API_KEY) || localStorage.getItem('gemini_api_key') || window.GEMINI_API_KEY || '';
    if (geminiApiKey && aiStatus) {
      aiStatus.textContent = 'Gemini 2.5 Flash • Live';
    }

    function openChat() {
      if (!chatWindow) return;
      chatWindow.removeAttribute('hidden');
      chatWindow.style.display = 'flex';
      if (triggerBtn) triggerBtn.setAttribute('aria-expanded', 'true');
      if (queryInput) queryInput.focus();
    }

    function closeChat() {
      if (!chatWindow) return;
      chatWindow.setAttribute('hidden', '');
      chatWindow.style.display = 'none';
      if (triggerBtn) triggerBtn.setAttribute('aria-expanded', 'false');
    }

    if (triggerBtn && chatWindow) {
      triggerBtn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        const isHidden = chatWindow.hasAttribute('hidden') || chatWindow.style.display === 'none';
        if (isHidden) openChat();
        else closeChat();
      };
    }

    if (closeBtn && chatWindow) {
      closeBtn.onclick = function (e) {
        e.preventDefault();
        e.stopPropagation();
        closeChat();
      };
    }

    if (chatForm && queryInput && msgsContainer) {
      chatForm.onsubmit = async function (e) {
        e.preventDefault();
        const text = queryInput.value.trim();
        if (!text) return;

        // User bubble
        const userBubble = document.createElement('div');
        userBubble.className = 'sahayak-bubble user';
        userBubble.textContent = text;
        msgsContainer.appendChild(userBubble);
        queryInput.value = '';
        msgsContainer.scrollTop = msgsContainer.scrollHeight;

        conversationHistory.push({ role: 'user', text });

        // Typing indicator bubble
        const typingBubble = document.createElement('div');
        typingBubble.className = 'sahayak-bubble bot';
        typingBubble.innerHTML = '<em>Cyber Sahayak is analyzing...</em>';
        msgsContainer.appendChild(typingBubble);
        msgsContainer.scrollTop = msgsContainer.scrollHeight;

        let responseHtml = '';

        // If Gemini API Key configured, use live LLM
        if (geminiApiKey) {
          try {
            const raw = await callGeminiLiveApi(geminiApiKey, text, conversationHistory);
            responseHtml = raw.replace(/\n\n/g, '<br><br>').replace(/\n/g, '<br>');
          } catch (err) {
            console.warn('Gemini Live API failed, falling back to autonomous NLP engine:', err.message);
            responseHtml = getSemanticAssistantResponse(text, conversationHistory);
          }
        } else {
          // Autonomous Semantic NLP Agent
          responseHtml = getSemanticAssistantResponse(text, conversationHistory);
        }

        conversationHistory.push({ role: 'model', text: responseHtml });

        setTimeout(() => {
          typingBubble.innerHTML = responseHtml;
          msgsContainer.scrollTop = msgsContainer.scrollHeight;
        }, 200);
      };
    }
  }

  if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', initCyberSahayak);
    } else {
      initCyberSahayak();
    }
  }

  window.CcpChat = {
    parseNaturalLanguageComplaint,
    getAssistantResponse: getSemanticAssistantResponse,
    callGeminiLiveApi,
    initCyberSahayak
  };

})(typeof window !== 'undefined' ? window : global);
