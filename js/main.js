
function pick(items){return items[Math.floor(Math.random()*items.length)]}
function setText(id,value){const el=document.getElementById(id); if(el) el.textContent=value}
function $(id){return document.getElementById(id)}
function save(key,value){localStorage.setItem(key,JSON.stringify(value))}
function load(key, fallback){try{return JSON.parse(localStorage.getItem(key)) ?? fallback}catch{return fallback}}
function beep(freq=440,duration=.18,type='sine'){
  const AC=window.AudioContext||window.webkitAudioContext; if(!AC) return;
  const ctx=new AC(), osc=ctx.createOscillator(), gain=ctx.createGain();
  osc.type=type; osc.frequency.value=freq; gain.gain.value=.12;
  gain.gain.exponentialRampToValueAtTime(.001,ctx.currentTime+duration);
  osc.connect(gain); gain.connect(ctx.destination); osc.start(); osc.stop(ctx.currentTime+duration);
}


function escapeHtml(value){
  return String(value ?? '').replace(/[&<>"']/g, function(ch){
    return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'})[ch];
  });
}

function isTimestampLike(value) {
  if (value === null || value === undefined) return false;
  const str = String(value).trim();
  return /^\d{10,13}$/.test(str);
}

function formatTimestamp(value) {
  if (!isTimestampLike(value)) return value || "";
  let n = Number(value);
  if (String(value).length === 10) n = n * 1000;
  const d = new Date(n);
  if (Number.isNaN(d.getTime())) return "";
  return d.toLocaleString([], {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit"
  });
}

function cleanStatus(value, match) {
  const raw = value === null || value === undefined ? "" : String(value).trim();
  if (!raw || isTimestampLike(raw)) {
    const now = Date.now();
    const timeValue = getFirstValue(match, ["startTime", "start_time", "time", "timestamp", "date", "matchTime"]);
    if (isTimestampLike(timeValue)) {
      let n = Number(timeValue);
      if (String(timeValue).length === 10) n = n * 1000;
      if (n > now + 30 * 60 * 1000) return "Upcoming";
      if (n < now - 3 * 60 * 60 * 1000) return "Finished / Past";
      return "Live or starting soon";
    }
    return "Scheduled";
  }
  return raw;
}

function getFirstValue(obj, keys) {
  for (const key of keys) {
    if (obj && obj[key] !== undefined && obj[key] !== null && obj[key] !== "") {
      return obj[key];
    }
  }
  return "";
}

function getTeamName(value) {
  if (!value) return "";
  if (typeof value === "string") return value;
  return value.name || value.shortName || value.displayName || value.teamName || "";
}

function normalizeMatchCard(match) {
  const home = getTeamName(match.homeTeam) || getTeamName(match.home) || getFirstValue(match, ["home_name", "homeName", "team1", "team_a", "teamA", "home_team"]);
  const away = getTeamName(match.awayTeam) || getTeamName(match.away) || getFirstValue(match, ["away_name", "awayName", "team2", "team_b", "teamB", "away_team"]);
  const title = getFirstValue(match, ["title", "name", "event", "match"]) || `${home || "Team A"} vs ${away || "Team B"}`;
  const league = getTeamName(match.league) || getTeamName(match.competition) || getFirstValue(match, ["league", "competition", "tournament", "series", "category"]) || "SportsSRC";
  const timeRaw = getFirstValue(match, ["startTime", "start_time", "time", "timestamp", "date", "matchTime"]);
  const readableTime = formatTimestamp(timeRaw);
  const statusRaw = getFirstValue(match, ["status", "state", "matchStatus", "gameStatus", "statusText"]);
  const status = cleanStatus(statusRaw, match);

  let score = getFirstValue(match, ["score", "result", "scores", "fullTimeScore"]);
  if (!score && (match.homeScore !== undefined || match.awayScore !== undefined)) {
    score = `${match.homeScore ?? 0} - ${match.awayScore ?? 0}`;
  }

  return { title, league, readableTime, status, score };
}



function renderMatchCard(match) {
  const normalized = normalizeMatchCard(match);
  const scoreLine = normalized.score
    ? `<p><strong>Score:</strong> ${escapeHtml(String(normalized.score))}</p>`
    : "";
  const timeLine = normalized.readableTime
    ? `<p><strong>Time:</strong> ${escapeHtml(String(normalized.readableTime))}</p>`
    : "";

  return `
    <article class="score-card">
      <span class="live-pill">${normalized.status.toLowerCase().includes("live") ? "Live/Public Feed" : "Public Feed"}</span>
      <h3>${escapeHtml(String(normalized.title))}</h3>
      <p><strong>Status:</strong> ${escapeHtml(String(normalized.status))}</p>
      <p><strong>League:</strong> ${escapeHtml(String(normalized.league))}</p>
      ${timeLine}
      ${scoreLine}
    </article>
  `;
}

