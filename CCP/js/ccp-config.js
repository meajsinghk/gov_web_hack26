/**
 * National Cyber Crime Reporting Portal (NCRP) Global Application Configuration
 * Developed for the "Build what moves India" Hackathon (GovTech / UX4G Track).
 *
 * Provides application-wide configuration parameters, environment detection,
 * rate limit policies, and optional Google Gemini 2.5 Flash API credentials.
 */

(function (window) {
  'use strict';

  window.CCP_CONFIG = {
    // Application Identity
    APP_NAME: 'National Cyber Crime Reporting Portal (NCRP)',
    PORTAL_VERSION: '3.0.0-GIGW',
    HACKATHON_TRACK: 'Build what moves India',
    OPERATING_AGENCY: 'Indian Cyber Crime Coordination Centre (I4C), MHA',
    
    // Emergency Helplines
    EMERGENCY_HELPLINE: '1930',
    NATIONAL_HELPLINE: '112',
    
    // Optional Google Gemini 2.5 Flash / Vertex AI Key
    // When populated, Cyber Sahayak elevates to live generative reasoning.
    // When left empty, Cyber Sahayak runs autonomously on its high-speed built-in NLP Semantic Agent.
    GEMINI_API_KEY: '',

    // Model Architecture
    MODEL_NAME: 'gemini-2.5-flash',
    TEMPERATURE: 0.3,
    MAX_OUTPUT_TOKENS: 800,

    // Storage Keys
    SESSION_STORAGE_KEY: 'ccp_user_session',
    WELCOME_DIALOG_KEY: 'ccp_hackathon_dialog_shown'
  };

})(typeof window !== 'undefined' ? window : global);

