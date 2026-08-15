const toast = document.querySelector("[data-toast]");
let toastTimer;

function notify(message) {
  if (!toast) return;
  toast.textContent = message;
  toast.classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove("show"), 2600);
}

const searchForm = document.querySelector("[data-search-form]");
const searchInput = document.querySelector("[data-search-input]");

if (searchForm && searchInput) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = searchInput.value.trim();
    if (/max|matterhorn/i.test(query)) {
      notify("Más de 18.000 resultados. La mayoría parecen escritos por Max.");
    } else {
      notify(`Quizá quisiste decir: Max Varenholt`);
    }
  });
}

const tabs = [...document.querySelectorAll("[data-tab]")];
const results = [...document.querySelectorAll("[data-result]")];
const resultCount = document.querySelector("[data-result-count]");
const activeSearchTab = document.querySelector(".search-tab.active");

if (activeSearchTab) {
  requestAnimationFrame(() => activeSearchTab.scrollIntoView({ block: "nearest", inline: "center" }));
}

function showCategory(category) {
  tabs.forEach((tab) => {
    const active = tab.dataset.tab === category;
    tab.classList.toggle("active", active);
    tab.setAttribute("aria-selected", String(active));
  });

  let visible = 0;
  results.forEach((result) => {
    const categories = result.dataset.result.split(" ");
    const show = category === "all" || categories.includes(category);
    result.hidden = !show;
    if (show) visible += 1;
  });

  if (resultCount) {
    const copy = {
      all: "Aproximadamente 18.700 resultados (0,42 segundos)",
      images: "6 imágenes provisionalmente idénticas (0,18 segundos)",
      news: `${visible} noticias y 34 exclusivas sin confirmar`,
      videos: `${visible} vídeos; ninguno grabado en vertical, sorprendentemente`,
      books: `${visible} libros atribuidos a Max Varenholt`,
      more: `${visible} registros, biografías y una duda razonable`
    };
    resultCount.textContent = copy[category] || copy.all;
  }
}

tabs.forEach((tab) => tab.addEventListener("click", () => showCategory(tab.dataset.tab)));
if (tabs.length) showCategory("all");

document.querySelectorAll("[data-action]").forEach((element) => {
  element.addEventListener("click", (event) => {
    if (element.tagName === "A" && element.getAttribute("href") === "#") event.preventDefault();
    notify(element.dataset.action);
  });
});

document.querySelectorAll("[data-lang]").forEach((button) => {
  button.addEventListener("click", () => {
    const language = button.dataset.lang;
    const labels = {
      es: "Idioma cambiado a español. Max sigue exagerando lo mismo.",
      en: "Language changed to English. The achievements remain suspicious.",
      de: "Sprache auf Deutsch geändert. Der Espresso bleibt fragwürdig."
    };
    notify(labels[language] || labels.es);
  });
});

const copyButton = document.querySelector("[data-copy]");
if (copyButton) {
  copyButton.addEventListener("click", async () => {
    const text = copyButton.dataset.copy;
    try {
      await navigator.clipboard.writeText(text);
      notify("Frase copiada. Úsala con cara de haber sido descubierto.");
    } catch {
      notify(text);
    }
  });
}

const quiz = document.querySelector("[data-quiz]");
const quizResult = document.querySelector("[data-quiz-result]");
if (quiz && quizResult) {
  quiz.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(quiz);
    const quizKeys = [...quiz.querySelectorAll(".quiz-question")].map((_, index) => `q${index + 1}`);
    const score = quizKeys.reduce((total, key) => total + Number(data.get(key) || 0), 0);
    const percentage = Math.round((score / (quizKeys.length * 3)) * 100);
    let title = "Persona con horarios verificables";
    let description = "Tus bolsillos son razonables, tus minutos duran sesenta segundos y probablemente admites cuando aquello fue un tiro.";
    if (percentage >= 75) {
      title = "Matterhorn federado";
      description = "Puedes localizar al grupo, defender una jugada durante una década y convertir una anécdota normal en una campaña continental.";
    } else if (percentage >= 42) {
      title = "Organizador informal de sobremesas";
      description = "Tienes instinto logístico y cierta flexibilidad con el tiempo. Te faltan bolsillos y una versión más ambiciosa de tu altura.";
    } else if (percentage >= 25) {
      title = "Max en pretemporada";
      description = "Ya discutes alguna estadística, pero todavía utilizas el reloj como si fuera una fuente autorizada.";
    }
    quizResult.innerHTML = `<strong>${percentage}% — ${title}</strong><p>${description}</p><p><a style="color:#e7c96c" href="personal.html">Comparar con el original</a></p>`;
    quizResult.classList.add("show");
    quizResult.scrollIntoView({ behavior: "smooth", block: "nearest" });
  });
}

const festivalForm = document.querySelector("[data-festival-form]");
if (festivalForm) {
  const festivalResult = festivalForm.querySelector("[data-festival-result]");
  const fields = {
    group: festivalForm.elements.group,
    hours: festivalForm.elements.hours,
    pockets: festivalForm.elements.pockets,
    max: festivalForm.elements.max
  };
  const outputs = {
    group: festivalForm.querySelector("[data-group-output]"),
    hours: festivalForm.querySelector("[data-hours-output]"),
    pockets: festivalForm.querySelector("[data-pockets-output]")
  };
  const updateFestivalForecast = () => {
    const group = Number(fields.group.value);
    const hours = Number(fields.hours.value);
    const pockets = Number(fields.pockets.value);
    const hasMax = fields.max.checked;
    outputs.group.textContent = group;
    outputs.hours.textContent = hours;
    outputs.pockets.textContent = pockets;
    const probability = Math.max(14, Math.min(99, Math.round(70 - group * 1.8 - hours * 1.3 + pockets * 3.6 + (hasMax ? 32 : 0))));
    let forecast = "Pronóstico: el grupo regresará unido, aunque nadie recordará por qué camino.";
    if (probability < 45) forecast = "Pronóstico: dos grupos nuevos, tres ubicaciones compartidas y un mensaje que dice ‘estoy detrás’.";
    else if (probability < 75) forecast = "Pronóstico: alguien desaparecerá el tiempo justo para volver con amigos nuevos.";
    else if (probability < 92) forecast = "Pronóstico: alguien perderá al grupo, pero no durante el tiempo suficiente para admitirlo.";
    festivalResult.innerHTML = `<strong>${probability}%</strong><span>Probabilidad de regresar juntos</span><p>${forecast}</p>`;
  };
  festivalForm.addEventListener("input", updateFestivalForecast);
  updateFestivalForecast();
}

const pageFile = window.location.pathname.split("/").pop() || "index.html";
const isBackstage = document.body.classList.contains("manual-page");
const isRealityOffice = document.body.classList.contains("reality-page");
const isNotFound = document.body.classList.contains("notfound-page");

if (!isBackstage && !isRealityOffice && !isNotFound) {
  const credibilityLink = document.createElement("a");
  credibilityLink.className = "credibility-link";
  credibilityLink.href = "reality.html";
  credibilityLink.textContent = "Fiabilidad 44,78%";
  credibilityLink.setAttribute("aria-label", "Consultar la fiabilidad del Archivo Matterhorn");
  document.body.append(credibilityLink);

  const trail = {
    "index.html": ["profile.html", "Abrir primer expediente"],
    "images.html": ["forum.html", "Investigar la coincidencia"],
    "news.html": ["gazette.html", "Abrir la exclusiva"],
    "videos.html": ["record.html", "Ver el récord"],
    "athlete.html": ["festival.html", "Abrir protocolo de festival"],
    "festival.html": ["style.html", "Consultar el uniforme"],
    "style.html": ["languages.html", "Abrir pasaporte lingüístico"],
    "languages.html": ["timeline.html", "Ver las contradicciones"],
    "timeline.html": ["forum.html", "Leer a los testigos"],
    "search-2.html": ["record.html", "Ver el récord"],
    "profile.html": ["gazette.html", "Siguiente aparición"],
    "gazette.html": ["interview.html", "Leer la entrevista"],
    "interview.html": ["record.html", "Comprobar el récord"],
    "record.html": ["institute.html", "Consultar al instituto"],
    "institute.html": ["books.html", "Ver bibliografía"],
    "books.html": ["foundation.html", "Seguir el dinero"],
    "foundation.html": ["network.html", "Ver contactos"],
    "network.html": ["forum.html", "Leer testimonios"],
    "restaurant.html": ["patent.html", "Ver la patente"],
    "auction.html": ["map.html", "Seguir el rastro"],
    "map.html": ["quiz.html", "Calcular tu índice"],
    "quiz.html": ["personal.html", "Conocer al original"],
    "wiki.html": ["foundation.html", "Continuar el expediente"],
    "personal.html": ["reality.html", "Auditar la historia"]
  };
  const next = trail[pageFile];

if (next) {
  const mobileTrail = document.createElement("nav");
  mobileTrail.className = "mobile-trail";
  mobileTrail.setAttribute("aria-label", "Ruta Matterhorn para móvil");
  mobileTrail.innerHTML = `<a href="index.html">Volver al buscador</a><a href="${next[0]}">${next[1]} →</a>`;
  document.body.append(mobileTrail);
}

// Subtle fiction / satire notice
const fictionNotice = document.createElement("div");
fictionNotice.className = "fiction-notice";

fictionNotice.innerHTML = `
  The Max Varenholt Archive —
  <a href="about.html">A fictional satirical universe.</a>
`;

document.body.appendChild(fictionNotice);
