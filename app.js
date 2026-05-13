const RSVP_ENDPOINT = "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

const body = document.body;
const revealItems = document.querySelectorAll(".reveal");
const rsvpDialog = document.querySelector("#rsvpDialog");
const rsvpForm = document.querySelector("#rsvpForm");
const modalFormView = document.querySelector("#modalFormView");
const modalSuccess = document.querySelector("#modalSuccess");
const formError = document.querySelector("#formError");
const submitButton = rsvpForm?.querySelector(".submit-button");
const mapLinks = document.querySelectorAll("[data-map-link]");
const loaderMinimumMs = 2150;
const loaderMaximumMs = 3000;
const loaderStartedAt = Date.now();
let loaderFinished = false;
let stableViewportWidth = window.innerWidth;

setStableHeroHeight();

window.addEventListener("orientationchange", () => {
  window.setTimeout(() => {
    stableViewportWidth = window.innerWidth;
    setStableHeroHeight();
  }, 180);
});

window.addEventListener("resize", () => {
  if (Math.abs(window.innerWidth - stableViewportWidth) < 24) return;
  stableViewportWidth = window.innerWidth;
  setStableHeroHeight();
});

window.addEventListener("load", () => {
  schedulePreloaderFinish();
});

const loaderFallbackTimer = window.setTimeout(finishPreloader, loaderMaximumMs);

function schedulePreloaderFinish() {
  const wait = Math.max(0, loaderMinimumMs - (Date.now() - loaderStartedAt));
  window.setTimeout(finishPreloader, wait);
}

function finishPreloader() {
  if (loaderFinished) return;
  loaderFinished = true;
  window.clearTimeout(loaderFallbackTimer);
  body.classList.remove("is-loading");
  body.classList.add("site-ready");
}

function setStableHeroHeight() {
  document.documentElement.style.setProperty("--stable-hero-height", `${window.innerHeight}px`);
}

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      });
    },
    {
      threshold: 0.14,
      rootMargin: "0px 0px -44px",
    },
  );

  revealItems.forEach((item) => revealObserver.observe(item));
} else {
  revealItems.forEach((item) => item.classList.add("is-visible"));
}

document.querySelectorAll("[data-open-rsvp]").forEach((button) => {
  button.addEventListener("click", openRsvpDialog);
});

document.querySelectorAll("[data-close-rsvp]").forEach((button) => {
  button.addEventListener("click", closeRsvpDialog);
});

mapLinks.forEach((link) => {
  link.addEventListener("click", openMapLink);
});

rsvpDialog?.addEventListener("click", (event) => {
  if (event.target === rsvpDialog) closeRsvpDialog();
});

rsvpDialog?.addEventListener("cancel", (event) => {
  event.preventDefault();
  closeRsvpDialog();
});

rsvpForm?.addEventListener("submit", async (event) => {
  event.preventDefault();

  if (!rsvpForm.reportValidity()) return;

  const formData = new FormData(rsvpForm);
  const payload = {
    firstName: String(formData.get("firstName") || "").trim(),
    lastName: String(formData.get("lastName") || "").trim(),
    guestsCount: String(formData.get("guestsCount") || "").trim(),
    comment: String(formData.get("comment") || "").trim(),
    createdAt: new Date().toISOString(),
  };

  setSubmitState(true);
  formError.hidden = true;

  try {
    await sendRsvp(payload);
    showRsvpSuccess();
  } catch (error) {
    formError.hidden = false;
  } finally {
    setSubmitState(false);
  }
});

function openRsvpDialog() {
  resetRsvpDialog();
  rsvpDialog.showModal();
  body.classList.add("modal-open");
  requestAnimationFrame(() => rsvpDialog.classList.add("is-open"));
}

function closeRsvpDialog() {
  rsvpDialog.classList.remove("is-open");
  body.classList.remove("modal-open");
  window.setTimeout(() => {
    if (rsvpDialog.open) rsvpDialog.close();
  }, 240);
}

function resetRsvpDialog() {
  formError.hidden = true;
  modalSuccess.hidden = true;
  modalFormView.hidden = false;
  rsvpForm.reset();
  setSubmitState(false);
}

function openMapLink(event) {
  const link = event.currentTarget;
  const appHref = link.dataset.appHref;
  const webHref = link.href;

  if (!appHref || !webHref) return;

  event.preventDefault();

  let fallbackTimer;
  const clearFallback = () => {
    window.clearTimeout(fallbackTimer);
    document.removeEventListener("visibilitychange", handleVisibilityChange);
    window.removeEventListener("pagehide", clearFallback);
  };
  const handleVisibilityChange = () => {
    if (document.hidden) clearFallback();
  };

  document.addEventListener("visibilitychange", handleVisibilityChange);
  window.addEventListener("pagehide", clearFallback, { once: true });

  fallbackTimer = window.setTimeout(() => {
    clearFallback();
    window.location.href = webHref;
  }, 900);

  window.location.href = appHref;
}

function setSubmitState(isLoading) {
  if (!submitButton) return;
  submitButton.classList.toggle("is-loading", isLoading);
  submitButton.disabled = isLoading;
  submitButton.textContent = isLoading ? "Отправляем..." : "Отправить";
}

async function sendRsvp(payload) {
  const endpointReady =
    RSVP_ENDPOINT && !RSVP_ENDPOINT.includes("PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE");

  if (!endpointReady) {
    console.warn("RSVP_ENDPOINT не настроен. Форма работает в demo-mode.", payload);
    await wait(520);
    return;
  }

  // If Google Apps Script blocks CORS in your deployment, see RSVP_SETUP.md for the iframe fallback option.
  const response = await fetch(RSVP_ENDPOINT, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  if (!response.ok) {
    throw new Error("RSVP request failed");
  }
}

function showRsvpSuccess() {
  modalFormView.hidden = true;
  modalSuccess.hidden = false;
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}
