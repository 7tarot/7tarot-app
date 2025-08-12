const WHATSAPP_NUMBER = "44YOURNUMBER";
const MESSENGER_PAGE  = "yourfacebookpage";

// Messaging buttons
document.getElementById("whatsappBtn").href =
  `https://wa.me/${WHATSAPP_NUMBER}?text=` +
  encodeURIComponent("Hi! I have a question about a tarot reading.");
document.getElementById("messengerBtn").href =
  `https://m.me/${MESSENGER_PAGE}`;

// Load catalog for shop
async function loadCatalog() {
  const res = await fetch("catalog.json", { cache: "no-store" });
  const data = await res.json();
  renderShop(data);
}

// Render shop cards
function renderShop(items) {
  const grid = document.getElementById("shopGrid");
  grid.innerHTML = "";
  items.forEach(p => {
    const card = document.createElement("article");
    card.className = "card";
    card.innerHTML = `
      <div class="imgwrap">
        <img loading="lazy" alt="${p.name}" src="${p.image}">
        <span class="badge ${p.type === "physical" ? "phys" : ""}">${p.type === "digital" ? "Digital" : "Physical"}</span>
      </div>
      <h3>${p.name}</h3>
      <div class="price">${p.price || ""}</div>
      <div class="actions">
        <a class="btn primary buy" href="#">Buy Now</a>
        <a class="btn ghost" href="${p.url}" target="_blank" rel="noopener">Details</a>
      </div>
    `;
    card.querySelector(".buy").addEventListener("click", (e) => {
      e.preventDefault();
      if (p.type === "digital") {
        openIntake(p.url);
      } else {
        window.location.href = p.url;
      }
    });
    grid.appendChild(card);
  });
}

// Intake form
const formModal = document.getElementById("formModal");
const closeFormBtn = document.getElementById("closeForm");
const productUrlInput = document.getElementById("productUrl");
closeFormBtn.addEventListener("click", () => formModal.classList.add("hidden"));
formModal.addEventListener("click", (e) => { if (e.target === formModal) formModal.classList.add("hidden"); });

function openIntake(url) {
  productUrlInput.value = url;
  formModal.classList.remove("hidden");
}

document.getElementById("intakeForm").addEventListener("submit", (e) => {
  e.preventDefault();
  const email = document.getElementById("email").value.trim();
  const question = document.getElementById("question").value.trim();
  const context = document.getElementById("context").value.trim();
  const extra = document.getElementById("extra").value.trim();
  if (!email || !question) return;
  // Email you the intake via mailto (quick MVP)
  const subject = encodeURIComponent("New Tarot Reading Intake");
  const body = encodeURIComponent(
    `Email: ${email}\nQuestion: ${question}\nContext: ${context}\nExtra: ${extra}\nProduct: ${document.getElementById("productUrl").value}`
  );
  window.location.href = `mailto:you@example.com?subject=${subject}&body=${body}`;
  // Then take them to checkout
  setTimeout(() => {
    window.location.href = document.getElementById("productUrl").value;
  }, 500);
});

// Daily draw
let deck = [];
async function loadDeck() {
  const res = await fetch("deck.json", { cache: "no-store" });
  deck = await res.json();
  renderMeanings(deck);
  initDaily();
}

function renderMeanings(cards) {
  const grid = document.getElementById("meaningsGrid");
  grid.innerHTML = "";
  cards.forEach(c => {
    const el = document.createElement("article");
    el.className = "card";
    el.innerHTML = `
      <div class="imgwrap"><img loading="lazy" alt="${c.name}" src="${c.image}"></div>
      <h3>${c.name}</h3>
      <div class="price" style="opacity:.85">${c.upright}</div>
    `;
    grid.appendChild(el);
  });
}

function initDaily() {
  const drawBtn = document.getElementById("drawBtn");
  const cardView = document.getElementById("cardView");
  const img = document.getElementById("cardImg");
  const nameEl = document.getElementById("cardName");
  const meaningEl = document.getElementById("cardMeaning");
  const metaEl = document.getElementById("cardMeta");
  const key = "dailyCard";
  const today = new Date().toISOString().slice(0,10);

  // If already drawn today, show it
  try {
    const saved = JSON.parse(localStorage.getItem(key) || "{}");
    if (saved.date === today) {
      drawBtn.classList.add("hidden");
      cardView.classList.remove("hidden");
      img.src = saved.image; nameEl.textContent = saved.name;
      meaningEl.textContent = saved.meaning;
      metaEl.textContent = saved.reversed ? "Reversed • saved " + saved.date : "Upright • saved " + saved.date;
      return;
    }
  } catch {}

  drawBtn.addEventListener("click", () => {
    if (!deck.length) return;
    const idx = Math.floor(Math.random() * deck.length);
    const reversed = Math.random() < 0.5;
    const c = deck[idx];
    img.src = c.image;
    nameEl.textContent = c.name + (reversed ? " (Reversed)" : "");
    const meaning = reversed ? (c.reversed || c.upright) : c.upright;
    meaningEl.textContent = meaning;
    metaEl.textContent = reversed ? "Reversed • " + today : "Upright • " + today;
    cardView.classList.remove("hidden");
    drawBtn.classList.add("hidden");
    // Save
    localStorage.setItem("dailyCard", JSON.stringify({
      date: today, name: c.name, image: c.image, reversed, meaning
    }));
  });
}

// Simple routing to anchor links
function handleHash() {
  const hash = location.hash || "#shop";
  document.querySelectorAll(".panel").forEach(p => p.style.display = "none");
  document.querySelector(hash).style.display = "block";
}
window.addEventListener("hashchange", handleHash);
handleHash();

loadCatalog();
loadDeck();
