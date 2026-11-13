const statusElement = () => document.getElementById("offline-status");

function updateStatus({ ready = false } = {}) {
  const element = statusElement();
  if (!element) return;
  const online = navigator.onLine;
  element.classList.toggle("is-offline", !online);
  element.classList.toggle("is-ready", ready || !online);
  const text = !online ? "آفلاین — برنامه آماده است" : ready ? "آفلاین آماده" : "متصل — در حال ذخیره";
  element.querySelector("span").textContent = text;
}

export async function registerOffline() {
  updateStatus();
  window.addEventListener("online", () => updateStatus({ ready: true }));
  window.addEventListener("offline", () => updateStatus({ ready: true }));

  if (!("serviceWorker" in navigator) || location.protocol === "file:") {
    updateStatus({ ready: true });
    return null;
  }

  try {
    const registration = await navigator.serviceWorker.register("./sw.js", { scope: "./" });
    await navigator.serviceWorker.ready;
    updateStatus({ ready: true });
    return registration;
  } catch (error) {
    console.warn("Service worker registration failed", error);
    updateStatus();
    return null;
  }
}

export function setupInstallExperience() {
  const installButton = document.getElementById("install-app");
  const helpDialog = document.getElementById("help-dialog");
  const installGuide = document.getElementById("install-guide");
  let promptEvent = null;

  const isIos = /iphone|ipad|ipod/i.test(navigator.userAgent);
  const isStandalone = window.matchMedia("(display-mode: standalone)").matches || navigator.standalone === true;
  const isNative = Boolean(window.Capacitor?.isNativePlatform?.());

  if (isStandalone || isNative) installButton.hidden = true;

  if (isIos) {
    installGuide.innerHTML = "<b>نصب روی آیفون</b><span>در Safari دکمه اشتراک‌گذاری را بزنید و «Add to Home Screen / افزودن به صفحه اصلی» را انتخاب کنید. پس از یک‌بار بازشدن، برنامه بدون اینترنت اجرا می‌شود.</span>";
  } else {
    installGuide.innerHTML = "<b>نصب آفلاین</b><span>دکمه نصب بالای صفحه را انتخاب کنید. در Windows و Android برنامه مانند یک نرم‌افزار مستقل در دسترس خواهد بود.</span>";
  }

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    promptEvent = event;
    installButton.hidden = false;
    installButton.classList.add("is-highlighted");
  });

  window.addEventListener("appinstalled", () => {
    promptEvent = null;
    installButton.hidden = true;
  });

  installButton.addEventListener("click", async () => {
    if (promptEvent) {
      promptEvent.prompt();
      await promptEvent.userChoice;
      promptEvent = null;
      installButton.classList.remove("is-highlighted");
      return;
    }
    helpDialog.showModal();
  });
}
