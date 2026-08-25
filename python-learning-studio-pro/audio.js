/* Robust Persian text-to-speech for Python Learning Studio Ultra.
   Works with Web Speech API where available, including iOS Safari/PWA. */
(() => {
  let voices = [];
  let speaking = false;

  const faText = [
    "در این درس با خروجی، متغیرها و انواع داده آشنا می‌شویم. تابع پرینت برای نمایش نتیجه برنامه استفاده می‌شود.",
    "در این درس ساختار شرطی را یاد می‌گیریم. با if، elif و else می‌توانیم برنامه را بر اساس شرایط مختلف کنترل کنیم.",
    "در این درس حلقه‌ها را بررسی می‌کنیم. با for و range می‌توانیم عملیات تکراری را به شکل ساده و خوانا اجرا کنیم.",
    "در این درس توابع را یاد می‌گیریم. تابع با def تعریف می‌شود و می‌تواند ورودی دریافت کرده و مقدار برگرداند.",
    "در این درس با NumPy برای محاسبات عددی و آرایه‌های علمی کار می‌کنیم. این کتابخانه در محاسبات مهندسی بسیار کاربردی است.",
    "در این درس با Matplotlib نمودارهای علمی رسم می‌کنیم. نمودارها برای تحلیل داده‌ها و نتایج مهندسی بسیار مهم هستند."
  ];

  function loadVoices() {
    if (!('speechSynthesis' in window)) return [];
    voices = window.speechSynthesis.getVoices() || [];
    return voices;
  }

  function chooseVoice() {
    loadVoices();
    return voices.find(v => /^fa(-|_)/i.test(v.lang)) ||
           voices.find(v => /Persian|Farsi/i.test(v.name)) ||
           voices.find(v => /^ar(-|_)/i.test(v.lang)) ||
           voices[0] || null;
  }

  function currentLessonText() {
    try {
      const i = (typeof state !== 'undefined' && Number.isInteger(state.lesson)) ? state.lesson : 0;
      return faText[i] || faText[0];
    } catch (_) {
      return faText[0];
    }
  }

  function setAudioButtonState(on) {
    const btn = document.getElementById('audioBtn');
    if (!btn) return;
    btn.textContent = on ? '⏹ توقف صوت' : '🔊 پخش توضیح صوتی';
    btn.setAttribute('aria-pressed', on ? 'true' : 'false');
  }

  function stopSpeech() {
    if (!('speechSynthesis' in window)) return;
    window.speechSynthesis.cancel();
    speaking = false;
    setAudioButtonState(false);
  }

  function speakLessonAudio() {
    if (!('speechSynthesis' in window) || typeof SpeechSynthesisUtterance === 'undefined') {
      if (typeof toast === 'function') toast('مرورگر شما پخش صوتی Web Speech را پشتیبانی نمی‌کند.');
      else alert('پخش صوتی در این مرورگر پشتیبانی نمی‌شود.');
      return;
    }

    // iOS/Safari requires speech to start directly from a user gesture.
    if (speaking || window.speechSynthesis.speaking) {
      stopSpeech();
      return;
    }

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(currentLessonText());
    const voice = chooseVoice();
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || 'fa-IR';
    utterance.rate = 0.9;
    utterance.pitch = 1.0;
    utterance.volume = 1.0;

    utterance.onstart = () => {
      speaking = true;
      setAudioButtonState(true);
      if (typeof toast === 'function') toast('پخش صوتی شروع شد');
    };
    utterance.onend = () => {
      speaking = false;
      setAudioButtonState(false);
    };
    utterance.onerror = (event) => {
      speaking = false;
      setAudioButtonState(false);
      const msg = event?.error === 'not-allowed'
        ? 'اجازه پخش صوت داده نشد. یک‌بار روی صفحه لمس کن و دوباره دکمه صوت را بزن.'
        : 'پخش صوتی انجام نشد. صدای فارسی دستگاه را بررسی کن.';
      if (typeof toast === 'function') toast(msg);
      else console.warn(msg, event);
    };

    // Small warm-up for Safari voice list; still executed inside click handler.
    loadVoices();
    window.speechSynthesis.speak(utterance);

    // Safari sometimes pauses long utterances unexpectedly.
    setTimeout(() => {
      if (window.speechSynthesis.speaking && window.speechSynthesis.paused) {
        window.speechSynthesis.resume();
      }
    }, 250);
  }

  if ('speechSynthesis' in window) {
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) stopSpeech();
    });
    window.addEventListener('pagehide', stopSpeech);
  }

  window.speakLessonAudio = speakLessonAudio;
  window.stopLessonAudio = stopSpeech;
})();