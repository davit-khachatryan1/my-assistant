export type UILanguage = 'hy' | 'en';

export interface UIStrings {
  settingsTitle: string;
  settingsMode: string;
  settingsModel: string;
  settingsVoice: string;
  settingsLanguage: string;
  youSpeak: string;
  lukaAnswers: string;
  appLanguage: string;
  modeTutor: string;
  modeDigest: string;
  modeInterview: string;
  modeRetention: string;
  spokenReplies: string;
  voiceInputStillWorks: string;
  voiceHyFemale: string;
  voiceHyMale: string;
  modelSearchLockTitle: string;
  signIn: string;
  voiceModeVoice: string;
  voiceModeTextOnly: string;
  voiceModeAriaToText: string;
  voiceModeAriaToVoice: string;
  docGenerateError: string;
  docReadyToGenerate: string;
  docGenerating: string;
  docGenerate: string;
  emptyStateHeadline: string;
  micPermission: string;
  micNoSpeech: string;
  micProcessFailed: string;
  voiceNotConfigured: string;
  orbTapToSpeak: string;
  orbListening: string;
  orbSpeaking: string;
  orbThinking: string;
  orbSearching: string;
  orbWriting: string;
  modelSwitchedToGemini: string;
  modelNotSearchCapable: string;
  providerNotConfigured: (envVar: string) => string;
  searchUnavailable: string;
  genericError: string;
  speechFailed: string;
  connectionError: string;
  signinTitle: string;
  signinSubheading: string;
  signinSending: string;
  signinSendLink: string;
  signinCheckInbox: string;
  signinLinkSentTo: string;
  signinError: string;
  signinBackLink: string;
}

export const UI_STRINGS: Record<UILanguage, UIStrings> = {
  hy: {
    settingsTitle: 'Կարգավորումներ',
    settingsMode: 'Ռեժիմ',
    settingsModel: 'Մոդել',
    settingsVoice: 'Ձայն',
    settingsLanguage: 'Լեզու',
    youSpeak: 'Դու խոսում ես',
    lukaAnswers: 'Luka-ն պատասխանում է',
    appLanguage: 'Հավելվածի լեզու',
    modeTutor: 'Ուսուցիչ',
    modeDigest: 'Նորություններ',
    modeInterview: 'Հարցազրույց',
    modeRetention: 'Կրկնում',
    spokenReplies: 'Ձայնային պատասխաններ',
    voiceInputStillWorks: 'Ձայնային մուտքն աշխատում է նաև սա անջատված ժամանակ։',
    voiceHyFemale: 'Հայերեն — Իգական',
    voiceHyMale: 'Հայերեն — Արական',
    modelSearchLockTitle: 'Այս մոդելը չի աջակցում որոնում՝ պետք է Claude կամ Gemini',
    signIn: 'Մուտք',
    voiceModeVoice: 'Ձայն',
    voiceModeTextOnly: 'Միայն տեքստ',
    voiceModeAriaToText: 'Անցնել միայն տեքստային պատասխանների',
    voiceModeAriaToVoice: 'Անցնել ձայնային պատասխանների',
    docGenerateError: 'Չհաջողվեց ստեղծել փաստաթուղթը։ Փորձիր նորից։',
    docReadyToGenerate: 'Պատրաստ է ստեղծման համար',
    docGenerating: 'Ստեղծվում է…',
    docGenerate: 'Ստեղծել փաստաթուղթ',
    emptyStateHeadline: 'Ասա ինձ ինչ է պետք',
    micPermission: 'Խնդրում ենք թույլատրել մուտք դեպի խոսափողը։',
    micNoSpeech: 'Ձայնագրության մեջ խոսք չհայտնաբերվեց։',
    micProcessFailed: 'Ձայնագրությունը հնարավոր չեղավ մշակել։ Փորձիր նորից։',
    voiceNotConfigured: 'Ձայնային մուտքը կարգավորված չէ (ELEVENLABS_API_KEY բացակայում է)։',
    orbTapToSpeak: 'Հպեք՝ խոսելու համար',
    orbListening: 'ԼՍՈՒՄ Է',
    orbSpeaking: 'ԽՈՍՈՒՄ Է',
    orbThinking: 'ՄՏԱԾՈՒՄ Է',
    orbSearching: 'ՓՆՏՐՈՒՄ Է',
    orbWriting: 'ԳՐՈՒՄ Է ՓԱՍՏԱԹՈՒՂԹ',
    modelSwitchedToGemini:
      'Անցա Gemini 3 Flash մոդելին, քանի որ Նորություններ ռեժիմն աշխատում է միայն որոնման աջակցությամբ մոդելների հետ (Claude կամ Gemini)։',
    modelNotSearchCapable:
      'Ընտրված մոդելը չի աջակցում որոնում։ Ընտրիր Claude կամ Gemini մոդել Նորություններ ռեժիմի համար։',
    providerNotConfigured: (envVar) =>
      `Ընտրված մոդելը կարգավորված չէ (բացակայում է ${envVar})։ Ընտրիր այլ մոդել կամ ավելացրու բանալին .env.local ֆայլում։`,
    searchUnavailable: 'Որոնումը անհասանելի էր այս պահին։',
    genericError: 'Ներողություն, տեղի ունեցավ սխալ։ Փորձիր նորից։',
    speechFailed: 'Ձայնային պատասխանը հնարավոր չեղավ հնչեցնել։',
    connectionError: 'Կապի խնդիր առաջացավ։ Ստուգիր ինտերնետային կապը և փորձիր նորից։',
    signinTitle: 'Մուտք',
    signinSubheading: 'Մուտք գործիր՝ էլ. փոստով',
    signinSending: 'Ուղարկվում է…',
    signinSendLink: 'Ուղարկել մուտքի հղումը',
    signinCheckInbox: 'Ստուգիր փոստարկղդ',
    signinLinkSentTo: 'Մուտքի հղումն ուղարկվել է՝',
    signinError: 'Մուտքի հղումն ուղարկել չհաջողվեց։ Փորձիր նորից։',
    signinBackLink: '← Վերադառնալ Luka-ին',
  },
  en: {
    settingsTitle: 'Settings',
    settingsMode: 'Mode',
    settingsModel: 'Model',
    settingsVoice: 'Voice',
    settingsLanguage: 'Language',
    youSpeak: 'You speak',
    lukaAnswers: 'Luka answers',
    appLanguage: 'App language',
    modeTutor: 'Tutor',
    modeDigest: 'Digest',
    modeInterview: 'Interview',
    modeRetention: 'Retention',
    spokenReplies: 'Spoken replies',
    voiceInputStillWorks: 'Voice input still works when this is off.',
    voiceHyFemale: 'Armenian — Female',
    voiceHyMale: 'Armenian — Male',
    modelSearchLockTitle: "This model doesn't support search — use Claude or Gemini",
    signIn: 'Sign in',
    voiceModeVoice: 'Voice',
    voiceModeTextOnly: 'Text only',
    voiceModeAriaToText: 'Switch to text-only replies',
    voiceModeAriaToVoice: 'Switch to voice replies',
    docGenerateError: "Couldn't generate the document. Try again.",
    docReadyToGenerate: 'Ready to generate',
    docGenerating: 'Generating…',
    docGenerate: 'Generate document',
    emptyStateHeadline: 'Tell me what you need',
    micPermission: 'Please allow microphone access.',
    micNoSpeech: 'No speech detected in the recording.',
    micProcessFailed: "Couldn't process the recording. Try again.",
    voiceNotConfigured: "Voice input isn't configured (ELEVENLABS_API_KEY is missing).",
    orbTapToSpeak: 'Tap to speak',
    orbListening: 'LISTENING',
    orbSpeaking: 'SPEAKING',
    orbThinking: 'THINKING',
    orbSearching: 'SEARCHING',
    orbWriting: 'WRITING DOCUMENT',
    modelSwitchedToGemini:
      'Switched to Gemini 3 Flash, since Digest mode only works with search-capable models (Claude or Gemini).',
    modelNotSearchCapable:
      "The selected model doesn't support search. Choose a Claude or Gemini model for Digest mode.",
    providerNotConfigured: (envVar) =>
      `The selected model isn't configured (${envVar} is missing). Choose another model or add the key to .env.local.`,
    searchUnavailable: "Search wasn't available right now.",
    genericError: 'Sorry, something went wrong. Try again.',
    speechFailed: "Couldn't play the voice reply.",
    connectionError: 'Connection problem. Check your internet connection and try again.',
    signinTitle: 'Sign in',
    signinSubheading: 'Sign in with email',
    signinSending: 'Sending…',
    signinSendLink: 'Send sign-in link',
    signinCheckInbox: 'Check your inbox',
    signinLinkSentTo: 'A sign-in link was sent to',
    signinError: 'Failed to send the sign-in link. Try again.',
    signinBackLink: '← Back to Luka',
  },
};
