const form = document.querySelector("#drewForm");
const input = document.querySelector("#drewInput");
const messages = document.querySelector("#drewMessages");
const suggestions = document.querySelectorAll("[data-prompt]");
const sendButton = document.querySelector("#drewSend");
const stopButton = document.querySelector("#drewStop");

const state = {
  lastTopic: "generale",
  lastFootballContext: null,
  messageCount: 0,
  userName: "Nicolò",
  activeController: null,
  activeQuestion: "",
  history: [
    {
      role: "assistant",
      content: "Ciao, sono DrewGPT. Cerco sul web, confronto piu fonti e poi ti rispondo in modo completo."
    }
  ]
};

const thinkingSteps = [
  "DrewGPT sta cercando fonti affidabili...",
  "DrewGPT sta confrontando i risultati...",
  "DrewGPT sta preparando una risposta completa..."
];

const footballData = {
  champions: {
    name: "Champions League",
    winners: {
      2010: { winner: "Inter", opponent: "Bayern Monaco", score: "2-0", note: "finale giocata a Madrid, con doppietta di Diego Milito e triplete nerazzurro." },
      2011: { winner: "Barcellona", opponent: "Manchester United", score: "3-1", note: "finale a Wembley, una delle grandi partite del Barça di Guardiola." },
      2012: { winner: "Chelsea", opponent: "Bayern Monaco", score: "1-1, 4-3 ai rigori", note: "finale a Monaco, decisa ai rigori dopo il gol di Drogba." },
      2013: { winner: "Bayern Monaco", opponent: "Borussia Dortmund", score: "2-1", note: "finale tedesca a Wembley, decisa da Robben nel finale." },
      2014: { winner: "Real Madrid", opponent: "Atletico Madrid", score: "4-1 dopo i supplementari", note: "la Decima del Real, con il pari di Sergio Ramos al 93'." },
      2015: { winner: "Barcellona", opponent: "Juventus", score: "3-1", note: "tridente Messi-Suarez-Neymar e secondo triplete blaugrana." },
      2016: { winner: "Real Madrid", opponent: "Atletico Madrid", score: "1-1, 5-3 ai rigori", note: "finale a Milano, vinta dal Real di Zidane ai rigori." },
      2017: { winner: "Real Madrid", opponent: "Juventus", score: "4-1", note: "finale a Cardiff: doppietta di Cristiano Ronaldo, poi Casemiro e Asensio." },
      2018: { winner: "Real Madrid", opponent: "Liverpool", score: "3-1", note: "terza Champions consecutiva del Real, con doppietta di Bale." },
      2019: { winner: "Liverpool", opponent: "Tottenham", score: "2-0", note: "finale inglese a Madrid, con gol di Salah e Origi." },
      2020: { winner: "Bayern Monaco", opponent: "Paris Saint-Germain", score: "1-0", note: "finale a Lisbona, decisa da Coman." },
      2021: { winner: "Chelsea", opponent: "Manchester City", score: "1-0", note: "finale a Porto, gol decisivo di Havertz." },
      2022: { winner: "Real Madrid", opponent: "Liverpool", score: "1-0", note: "finale a Parigi, gol di Vinicius Junior e grande partita di Courtois." },
      2023: { winner: "Manchester City", opponent: "Inter", score: "1-0", note: "finale a Istanbul, gol di Rodri e primo titolo Champions del City." },
      2024: { winner: "Real Madrid", opponent: "Borussia Dortmund", score: "2-0", note: "finale a Wembley, con gol di Carvajal e Vinicius Junior." },
      2025: { winner: "Paris Saint-Germain", opponent: "Inter", score: "5-0", note: "finale a Monaco di Baviera, primo trionfo Champions del PSG." }
    }
  },
  worldCup: {
    name: "Mondiale",
    winners: {
      2010: { winner: "Spagna", opponent: "Olanda", score: "1-0 dopo i supplementari", note: "gol decisivo di Iniesta." },
      2014: { winner: "Germania", opponent: "Argentina", score: "1-0 dopo i supplementari", note: "gol di Gotze al Maracana." },
      2018: { winner: "Francia", opponent: "Croazia", score: "4-2", note: "finale spettacolare a Mosca." },
      2022: { winner: "Argentina", opponent: "Francia", score: "3-3, 4-2 ai rigori", note: "finale storica con Messi e Mbappe protagonisti." }
    }
  },
  euro: {
    name: "Europeo",
    winners: {
      2012: { winner: "Spagna", opponent: "Italia", score: "4-0", note: "dominio tecnico della Spagna." },
      2016: { winner: "Portogallo", opponent: "Francia", score: "1-0 dopo i supplementari", note: "gol decisivo di Eder." },
      2021: { winner: "Italia", opponent: "Inghilterra", score: "1-1, 3-2 ai rigori", note: "Europeo 2020 giocato nel 2021, finale a Wembley." },
      2024: { winner: "Spagna", opponent: "Inghilterra", score: "2-1", note: "quarta vittoria europea per la Spagna." }
    }
  }
};

const topics = [
  {
    id: "calcio",
    label: "calcio",
    keys: ["calcio", "football", "champions", "league", "ucl", "mondiale", "europeo", "serie a", "gol", "squadra", "modulo", "tattica", "fuorigioco", "attaccante", "centrocampista", "difensore", "portiere", "messi", "ronaldo", "real madrid", "barcellona", "inter", "juventus", "milan", "napoli"],
    answer: ({ text }) => createFootballReply(text).split("\n")
  },
  {
    id: "sito",
    label: "sito",
    keys: ["sito", "pagina", "grafica", "design", "animazione", "apple", "portfolio", "home"],
    answer: ({ text }) => [
      "Per il sito ragionerei come farebbe un designer: prima chiarezza, poi effetto wow.",
      "",
      "1. Metti in evidenza una cosa forte per sezione.",
      "2. Usa animazioni lente e pulite, non troppe tutte insieme.",
      "3. Trasforma le card in piccole esperienze: hover, dettagli, pulsanti utili.",
      "4. Tieni i testi brevi, con titoli grandi e senza punteggiatura pesante.",
      "",
      text.includes("rubik") ? "Sul Cubo di Rubik possiamo aggiungere preset, pattern preferiti e una cronologia mosse più chiara." : "La prossima miglioria bella sarebbe una sezione progetti con anteprime interattive."
    ]
  },
  {
    id: "informatica",
    label: "informatica",
    keys: ["informatica", "codice", "html", "css", "javascript", "computer", "programmare", "bug"],
    answer: () => [
      "Te lo spiego da progetto, non da libro.",
      "",
      "HTML è la struttura, CSS è lo stile, JavaScript è il comportamento.",
      "",
      "Esempio: se hai un bottone, HTML lo crea, CSS lo rende bello, JavaScript decide cosa succede quando lo clicchi.",
      "",
      "Il modo più veloce per imparare è costruire cose piccole ma complete: una chat, una scacchiera, un timer, un mini gioco o un generatore di idee."
    ]
  },
  {
    id: "scacchi",
    label: "scacchi",
    keys: ["scacchi", "scacchiera", "chess", "partita", "apertura", "matto"],
    answer: () => [
      "Per migliorare a scacchi ti serve una routine semplice.",
      "",
      "1. Prima controlla il centro.",
      "2. Sviluppa cavalli e alfieri.",
      "3. Arrocca presto.",
      "4. Prima di ogni mossa chiediti: cosa minaccia l'avversario?",
      "5. Dopo la partita guarda solo due errori, non tutta la partita.",
      "",
      "Se vuoi allenarti sul sito, la scacchiera potrebbe avere puzzle giornalieri e suggerimenti dopo una mossa sbagliata."
    ]
  },
  {
    id: "rubik",
    label: "Rubik",
    keys: ["rubik", "cubo", "algoritmo", "mosse", "pattern", "sexy", "mossa"],
    answer: () => [
      "Sul Cubo di Rubik la cosa importante è separare memoria e logica.",
      "",
      "Per allenarti bene:",
      "1. Ripeti poche sequenze finché diventano automatiche.",
      "2. Guarda sempre cosa cambia sul cubo dopo ogni algoritmo.",
      "3. Usa i pattern come esercizio visivo, non solo come decorazione.",
      "",
      "Il tasto Sexy move è ottimo perché dopo 6 ripetizioni torna al punto di partenza: è perfetto per capire come si muovono angoli e spigoli."
    ]
  },
  {
    id: "progetto",
    label: "progetto",
    keys: ["idea", "idee", "progetto", "creare", "costruire", "app", "gioco"],
    answer: () => [
      "Ti propongo tre mini progetti belli per il tuo sito:",
      "",
      "1. Modalità laboratorio: una pagina con tutti gli esperimenti che hai creato.",
      "2. Allenatore Rubik: scegli un algoritmo e il sito ti fa vedere le mosse una alla volta.",
      "3. Sezione sfide: scacchi, cubo e informatica con obiettivi giornalieri.",
      "",
      "Io partirei dal laboratorio, perché collega bene DrewGPT, Rubik e scacchi."
    ]
  },
  {
    id: "studio",
    label: "studio",
    keys: ["scuola", "studiare", "liceo", "verifica", "compiti", "materia"],
    answer: () => [
      "Per studiare meglio usa un sistema breve:",
      "",
      "1. Leggi una volta per capire il senso.",
      "2. Scrivi 5 parole chiave.",
      "3. Spiega l'argomento come se lo stessi insegnando.",
      "4. Fai una pausa piccola.",
      "5. Ripeti senza guardare.",
      "",
      "Se non riesci a spiegare un punto, quello è il punto da ripassare."
    ]
  }
];

const quickReplies = [
  "Vuoi che lo trasformi in una sezione del sito?",
  "Posso farti anche una versione più breve.",
  "Se vuoi, posso dividerlo in passaggi da fare uno alla volta.",
  "Posso darti un esempio pratico."
];

function normalize(text) {
  return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

function detectTopic(text) {
  const clean = normalize(text);
  let bestTopic = topics[0];
  let bestScore = 0;

  topics.forEach((topic) => {
    const score = topic.keys.reduce((total, key) => total + (clean.includes(normalize(key)) ? 1 : 0), 0);

    if (score > bestScore) {
      bestScore = score;
      bestTopic = topic;
    }
  });

  if (bestScore === 0 && ["spiega meglio", "continua", "approfondisci", "fammi un esempio"].some((phrase) => clean.includes(phrase))) {
    return topics.find((topic) => topic.id === state.lastTopic) || bestTopic;
  }

  return bestScore === 0 ? null : bestTopic;
}

function createMessageText(lines) {
  return `${lines.join("\n")}\n\n${quickReplies[state.messageCount % quickReplies.length]}`;
}

function extractYear(text) {
  const match = text.match(/\b(19|20)\d{2}\b/);
  return match ? Number(match[0]) : null;
}

function detectCompetition(text) {
  if (text.includes("champions") || text.includes("ucl") || text.includes("coppa dei campioni")) return "champions";
  if (text.includes("mondiale") || text.includes("world cup")) return "worldCup";
  if (text.includes("europeo") || text.includes("euro ")) return "euro";
  return state.lastFootballContext?.competition || null;
}

function formatWinnerAnswer(competitionKey, year) {
  const competition = footballData[competitionKey];
  const record = competition?.winners[year];

  if (!competition || !record) return null;

  state.lastFootballContext = { competition: competitionKey, year };

  return [
    `Nel ${year} ha vinto la ${competition.name} il ${record.winner}.`,
    "",
    `Finale: ${record.winner} contro ${record.opponent}, risultato ${record.score}.`,
    `Contesto: ${record.note}`,
    "",
    "Quindi la risposta breve è:",
    `${record.winner}.`
  ].join("\n");
}

function createTacticalAnswer(text) {
  if (text.includes("fuorigioco")) {
    return [
      "Il fuorigioco serve a impedire agli attaccanti di restare sempre davanti alla difesa.",
      "",
      "Un giocatore è in fuorigioco se, nel momento in cui parte il passaggio di un compagno, è più vicino alla porta avversaria rispetto al penultimo difendente e partecipa all'azione.",
      "",
      "Non basta essere oltre la linea: conta il momento del passaggio e conta se il giocatore influenza davvero il gioco."
    ].join("\n");
  }

  if (text.includes("4-3-3") || text.includes("433")) {
    return [
      "Il 4-3-3 è un modulo molto offensivo ma equilibrato.",
      "",
      "Hai 4 difensori, 3 centrocampisti e 3 attaccanti. Di solito funziona bene se hai esterni rapidi, un mediano intelligente e terzini che sanno spingere.",
      "",
      "Punti forti: ampiezza, pressing alto, tanti uomini in zona offensiva.",
      "Punti deboli: se gli esterni non rientrano, i terzini restano scoperti."
    ].join("\n");
  }

  if (text.includes("4-2-3-1") || text.includes("4231")) {
    return [
      "Il 4-2-3-1 è uno dei moduli più completi.",
      "",
      "I due mediani proteggono la difesa, i tre trequartisti creano gioco tra le linee e la punta attacca l'area.",
      "",
      "È utile quando vuoi equilibrio: puoi difendere con tanti uomini e ripartire velocemente."
    ].join("\n");
  }

  if (text.includes("pressing") || text.includes("pressare")) {
    return [
      "Il pressing è il tentativo organizzato di recuperare palla subito, non correre a caso.",
      "",
      "Una squadra pressa bene quando tutti si muovono insieme: punta sul difensore, esterni sulle linee di passaggio, centrocampisti pronti ad accorciare.",
      "",
      "Il segreto è chiudere le opzioni facili, non solo inseguire il pallone."
    ].join("\n");
  }

  return null;
}

function createFootballReply(clean) {
  const year = extractYear(clean);
  const competitionKey = detectCompetition(clean);
  const asksWinner = ["chi ha vinto", "vincitore", "ha vinto", "vinto"].some((phrase) => clean.includes(phrase));
  const continuation = ["e nel", "invece nel", "nel "].some((phrase) => clean.includes(phrase)) && state.lastFootballContext;

  if (year && competitionKey && (asksWinner || continuation)) {
    const answer = formatWinnerAnswer(competitionKey, year);
    if (answer) return answer;

    return `Non ho un dato sicuro per ${footballData[competitionKey]?.name || "questa competizione"} nel ${year}. Posso però aiutarti a ragionare sulla competizione, sulle squadre favorite o sulla storia recente.`;
  }

  const tactical = createTacticalAnswer(clean);
  if (tactical) {
    state.lastFootballContext = { competition: null, year: null };
    return tactical;
  }

  if (clean.includes("messi") && clean.includes("ronaldo")) {
    return [
      "Messi e Cristiano Ronaldo sono confrontabili solo se separi gli aspetti.",
      "",
      "Messi è più associato a conduzione, ultimo passaggio, creatività e controllo del ritmo.",
      "Cristiano Ronaldo è più associato ad attacco dell'area, finalizzazione, gioco aereo e mentalità realizzativa.",
      "",
      "Se parli di talento tecnico puro, molti scelgono Messi. Se parli di completezza realizzativa e longevità fisica, Cristiano è un caso quasi unico."
    ].join("\n");
  }

  if (clean.includes("come migliorare") || clean.includes("allenarmi") || clean.includes("diventare bravo")) {
    return [
      "Per migliorare a calcio ti serve un allenamento che unisca tecnica, scelta e fisico.",
      "",
      "1. Tecnica: 15 minuti al giorno di controllo palla, conduzione e passaggi contro un muro.",
      "2. Scelta: guarda partite fermandoti su una domanda: dove dovrebbe muoversi il giocatore senza palla?",
      "3. Fisico: scatti brevi, cambi di direzione e resistenza.",
      "4. Partita: dopo ogni allenamento scegli una cosa da migliorare, non dieci.",
      "",
      "Il salto di qualità arriva quando giochi più veloce non perché corri di più, ma perché decidi prima."
    ].join("\n");
  }

  return [
    "Sul calcio posso risponderti in modo tecnico o storico.",
    "",
    "Posso aiutarti su:",
    "1. vincitori di Champions League, Mondiali ed Europei",
    "2. tattica e moduli, tipo 4-3-3 o 4-2-3-1",
    "3. ruoli: portiere, difensore, centrocampista, attaccante",
    "4. confronto tra giocatori o squadre",
    "5. allenamento e miglioramento personale",
    "",
    "Esempio: se mi chiedi 'chi ha vinto la Champions League nel 2017?', ti rispondo direttamente con squadra, finale, risultato e contesto."
  ].join("\n");
}

function isFootballText(clean) {
  const footballWords = topics.find((topic) => topic.id === "calcio").keys;
  const hasFootballWord = footballWords.some((key) => clean.includes(normalize(key)));
  const continuesFootballQuestion = Boolean(state.lastFootballContext && extractYear(clean) && /(e\s+nel|invece\s+nel|nel)\s+\d{4}/.test(clean));

  return hasFootballWord || continuesFootballQuestion;
}

function createReply(text) {
  const clean = normalize(text);

  if (["ciao", "hey", "salve", "buongiorno"].some((word) => clean.includes(word))) {
    state.lastTopic = "generale";
    return "Ciao Nicolò. Sono DrewGPT, versione migliorata: ora riconosco meglio gli argomenti, tengo memoria dell'ultima conversazione e posso rispondere con piani, esempi e idee pratiche.";
  }

  if (clean.includes("chi sei") || clean.includes("cosa sai fare")) {
    return "Sono DrewGPT, l'assistente del tuo sito. Posso aiutarti su calcio, design, codice, scuola, Rubik, scacchi e idee per nuovi progetti. Ora provo anche a cercare sul web e a confrontare piu fonti prima di risponderti.";
  }

  if (clean.includes("riassumi") || clean.includes("breve")) {
    return "Versione breve: dimmi l'obiettivo, scegliamo lo stile, dividiamo il lavoro in passaggi piccoli e poi miglioriamo il risultato finché sembra fatto bene.";
  }

  if (isFootballText(clean)) {
    state.lastTopic = "calcio";
    return createMessageText(createFootballReply(clean).split("\n"));
  }

  const topic = detectTopic(text);

  if (topic) {
    state.lastTopic = topic.id;
    return createMessageText(topic.answer({ text: clean }));
  }

  return createMessageText([
    "Bella domanda. La affronterei così:",
    "",
    "1. Capire cosa vuoi ottenere.",
    "2. Scegliere il risultato più semplice che funziona.",
    "3. Migliorarlo con stile, dettagli e interazione.",
    "",
    "Nel tuo sito questa tecnica funziona benissimo: prima una funzione utile, poi la rendiamo bella."
  ]);
}

function createSourcesList(sources) {
  const wrapper = document.createElement("div");
  wrapper.className = "drew-sources";

  const title = document.createElement("strong");
  title.textContent = "Fonti confrontate";
  wrapper.append(title);

  sources.slice(0, 5).forEach((source) => {
    const link = document.createElement("a");
    link.href = source.url || "#";
    link.target = "_blank";
    link.rel = "noreferrer";
    link.textContent = `${source.source}: ${source.title || "risultato"}`;
    wrapper.append(link);
  });

  return wrapper;
}

function editQuestion(text) {
  if (state.activeController) {
    state.activeController.abort();
  }

  input.value = text;
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 150)}px`;
  input.focus();
}

function addMessage(kind, text, options = {}) {
  const article = document.createElement("article");
  article.className = `drew-message drew-message--${kind}`;

  if (options.typing) {
    article.classList.add("drew-message--typing");
  }

  const badge = document.createElement("span");
  badge.textContent = kind === "user" ? "N" : "D";

  const paragraph = document.createElement("p");
  paragraph.textContent = text;

  const content = document.createElement("div");
  content.className = "drew-message-content";
  content.append(paragraph);

  if (kind === "user") {
    const edit = document.createElement("button");
    edit.className = "drew-edit";
    edit.type = "button";
    edit.textContent = "Modifica";
    edit.addEventListener("click", () => editQuestion(text));
    content.append(edit);
  }

  if (options.sources?.length) {
    content.append(createSourcesList(options.sources));
  }

  article.append(badge, content);
  messages.append(article);
  messages.scrollTop = messages.scrollHeight;

  return article;
}

function setThinking(isThinking) {
  form.classList.toggle("is-thinking", isThinking);
  sendButton.disabled = isThinking;
  stopButton.hidden = !isThinking;
  suggestions.forEach((button) => {
    button.disabled = isThinking;
  });
}

function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

async function askDrewGpt(value, signal) {
  const payload = JSON.stringify({
    question: value,
    history: state.history.slice(-8)
  });
  const endpoints = ["/api/drewgpt", "http://localhost:3001/api/drewgpt"];
  let lastError = null;

  for (const endpoint of endpoints) {
    try {
      const response = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: payload,
        signal
      });

      if (response.ok) {
        return response.json();
      }

      lastError = new Error(`DrewGPT endpoint ${endpoint} returned ${response.status}`);
    } catch (error) {
      lastError = error;
    }
  }

  throw lastError || new Error("DrewGPT web search failed");
}

async function submitPrompt(text) {
  const value = text.trim();
  if (!value || state.activeController) return;

  state.messageCount += 1;
  addMessage("user", value);
  state.history.push({ role: "user", content: value });
  state.activeQuestion = value;
  state.activeController = new AbortController();
  input.value = "";
  input.style.height = "auto";
  setThinking(true);

  const typingMessage = addMessage("bot", thinkingSteps[0], { typing: true });
  let stepIndex = 0;
  const stepTimer = window.setInterval(() => {
    stepIndex = Math.min(stepIndex + 1, thinkingSteps.length - 1);
    typingMessage.querySelector("p").textContent = thinkingSteps[stepIndex];
  }, 1300);
  const startedAt = performance.now();

  try {
    const data = await askDrewGpt(value, state.activeController.signal);
    const remaining = Math.max(0, 900 - (performance.now() - startedAt));
    await sleep(remaining);
    typingMessage.remove();
    addMessage("bot", data.answer, { sources: data.sources || [] });
    state.history.push({ role: "assistant", content: data.answer });
  } catch (error) {
    typingMessage.remove();
    if (error.name === "AbortError") {
      input.value = value;
      input.style.height = "auto";
      input.style.height = `${Math.min(input.scrollHeight, 150)}px`;
      return;
    }

    const fallback = `${createReply(value)}\n\nNota: in questo momento non riesco a collegarmi alla ricerca web, quindi questa e una risposta locale.`;
    addMessage("bot", fallback);
    state.history.push({ role: "assistant", content: fallback });
  } finally {
    window.clearInterval(stepTimer);
    state.activeController = null;
    state.activeQuestion = "";
    setThinking(false);
    input.focus();
  }
}

stopButton.addEventListener("click", () => {
  if (state.activeController) {
    state.activeController.abort();
  }
});

form.addEventListener("submit", (event) => {
  event.preventDefault();
  submitPrompt(input.value);
});

input.addEventListener("input", () => {
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, 150)}px`;
});

input.addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey) {
    event.preventDefault();
    form.requestSubmit();
  }
});

suggestions.forEach((button) => {
  button.addEventListener("click", () => {
    submitPrompt(button.dataset.prompt || "");
  });
});
