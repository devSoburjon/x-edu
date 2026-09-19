/* Shablon. Nusxa oling va config.js deb nomlang:
     cp config.example.js config.js
   config.js git'ga tushmaydi — kalitlar hech qachon repozitoriyaga yozilmaydi. */
window.XEDU_CONFIG = {
  /* Gemini — https://aistudio.google.com/apikey
     Bo'sh qoldirilsa ilova zaxira tushuntirishlar bilan ishlaydi. */
  geminiKey: '',
  geminiModel: 'gemini-flash-lite-latest',
  aiTimeout: 12000,

  /* Firebase — console.firebase.google.com > Project settings > Your apps > Web
     Bo'sh qoldirilsa ilova localStorage rejimida to'liq ishlaydi. */
  firebase: {
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  }
};
