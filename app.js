const RSVP_ENDPOINT = "PASTE_GOOGLE_APPS_SCRIPT_WEB_APP_URL_HERE";

const body = document.body;
const revealItems = document.querySelectorAll(".reveal");
const rsvpDialog = document.querySelector("#rsvpDialog");
const rsvpForm = document.querySelector("#rsvpForm");
const modalFormView = document.querySelector("#modalFormView");
const modalSuccess = document.querySelector("#modalSuccess");
const formError = document.querySelector("#formError");
const submitButton = rsvpForm?.querySelector(".submit-button");
const loaderMinimumMs = 1150;
const loaderStartedAt = Date.now();

window.addEventListener("load", () => {
  const wait = Math.max(0, loaderMinimumMs - (Date.now() - loaderStartedAt));

  window.setTimeout(() => {
    body.classList.remove("is-loading");
    body.classList.add("site-ready");
  }, wait);
});

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
