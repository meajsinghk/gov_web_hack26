# National Cyber Crime Reporting Portal (NCRP) — Next-Gen GovTech Architecture

> **Submission for the "Build what moves India" Hackathon**  
> **Track:** Government Digital Experience (GovTech) / UX4G & S3WaaS Modernization  
> **Agency:** Indian Cyber Crime Coordination Centre (I4C), Ministry of Home Affairs (MHA), Government of India  
> **Live Submission URL:** [https://meajsinghk.github.io/gov_web_hack26/](https://meajsinghk.github.io/gov_web_hack26/)  
> **Portal Direct Entry:** [https://meajsinghk.github.io/gov_web_hack26/CCP/index.html](https://meajsinghk.github.io/gov_web_hack26/CCP/index.html)

---

## 📌 Executive Summary

India's National Cyber Crime Reporting Portal (NCRP / `cybercrime.gov.in` / Helpline `1930`) handles over 15,000 daily cyber fraud incidents. The initial **2 to 4 hour "Golden Hour"** is critical to place inter-bank liens on scammer mule accounts before stolen funds leave the banking switch.

This project delivers a **ground-up redesign and modernization** conforming strictly to:
- **GIGW 3.0 (Guidelines for Indian Government Websites)**: WCAG 2.1 AA accessibility, AAA contrast compliance, sovereign trust verification drawer, text resizers, skip links, and semantic HTML5.
- **UX4G Sovereign Design Tokens**: Custom CSS token design system (< 30 KB, zero bulky UI framework dependencies) adhering to sovereign typography, color hierarchy, and responsive layouts.
- **On-Device WebAssembly & Canvas OCR Engine**: Automatically extracts 12-digit transaction UTRs, debited amounts, and suspect UPI VPAs from payment screenshots in `< 60 seconds` without transmitting raw image data to external servers.
- **Cyber Sahayak NLP & Gemini Agent**: Conversational AI assistant supporting unstructured natural language queries in English and Hindi, live suspect lookups, state police nodal officer routing, and automated complaint pre-filling.
- **Dedicated Authenticated Citizen Dashboard**: Private dashboard featuring incident dockets, bank lien freeze statuses, magistrate release orders under Section 457 CrPC / BNSS, pending evidence RFEs, and Section 65B signed complaint PDF export.

---

## 🏛️ Portal Structure & Page Directory

| File | Feature / Service Description |
| :--- | :--- |
| [`index.html`](index.html) | Root entry point with auto-redirect to CCP portal |
| [`CCP/index.html`](CCP/index.html) | High-impact citizen landing portal, national metrics ticker, triage search, statutory gateways |
| [`CCP/emergency-report.html`](CCP/emergency-report.html) | 60-Second Express Incident Reporting with On-Device OCR entity extraction |
| [`CCP/dashboard.html`](CCP/dashboard.html) | Authenticated Citizen Incident Dashboard, timeline milestones, and Section 65B dockets |
| [`CCP/suspect-lookup.html`](CCP/suspect-lookup.html) | Public national suspect check (Phone, UPI VPA, Bank Accounts, URLs) with risk scoring |
| [`CCP/nodal-officers.html`](CCP/nodal-officers.html) | Complete 36 State & UT Cyber Police Nodal Directory with searchable filters |
| [`CCP/volunteer.html`](CCP/volunteer.html) | National Cyber Crime Volunteer application framework under MHA |
| [`CCP/advisories.html`](CCP/advisories.html) | Official I4C threat bulletins (Digital Arrest, APK Malware, Fake Summons) |
| [`CCP/resources.html`](CCP/resources.html) | 8 Cyber Safety Pillars, CyTrain MOOC integration, IT Act 2000 & BNS 2023 legal table |
| [`CCP/faq.html`](CCP/faq.html) | Interactive categorized citizen help desk and procedures |
| [`CCP/login.html`](CCP/login.html) | Streamlined mobile OTP citizen single sign-on |

---

## 🚀 Live Demo & Testing Guide

1. **Visit Live Web URL**: [https://meajsinghk.github.io/gov_web_hack26/](https://meajsinghk.github.io/gov_web_hack26/)
2. **Download Sample Evidence**: On initial landing, download the sample UPI payment receipt (`sample_upi_receipt.png`).
3. **Test On-Device OCR**: Go to [Emergency 60s Report](CCP/emergency-report.html) and drop the downloaded receipt. Watch the 12-digit UTR (`428910293841`), Amount (`₹ 45,000`), and Suspect VPA (`fraudster99@ybl`) populate instantly.
4. **Test Citizen Login**: Go to [Citizen Login](CCP/login.html), submit the pre-filled demo number (`9876543210`), and enter OTP (`123456`) to access the [Citizen Dashboard](CCP/dashboard.html).
5. **Test Cyber Sahayak AI**: Open the floating chat widget on any page and ask:
   - *"I lost Rs 45,000 on UPI through a fake electricity bill SMS"*
   - *"Is 9876543210 safe to transact with?"*
   - *"Who is the Cyber Police Nodal Officer for Karnataka?"*
   - *"What is the punishment under Section 66D IT Act?"*

---

## 🧪 Verification & Automated Testing

Run the automated test suite locally:
```bash
node verify_ccp.js
```
**Results:** `27 / 27 PASSED (100%)` across file integrity, CSS size budgets (< 30 KB), OCR entity regexes, dataset compilation, and UI workflows.
