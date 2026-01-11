let HERO_DATA = [];
let currentSquad = 1;
let db = { global: 44.0, squads: { 1: { heroes: {} }, 2: { heroes: {} }, 3: { heroes: {} } } };

async function init() {
    // 1. Daten laden
    try {
        const response = await fetch('heroes.json');
        if (!response.ok) throw new Error('Data not found');
        HERO_DATA = await response.json();
        HERO_DATA.sort((a, b) => a.name.localeCompare(b.name));
    } catch (e) {
        console.error("JSON Error:", e);
        alert("Fehler: heroes.json konnte nicht geladen werden.");
    }

    // 2. Speicher laden
    const saved = localStorage.getItem('dr_squad_pro_db');
    if(saved) db = JSON.parse(saved);
    document.getElementById('globalBase').value = db.global;

    // 3. UI aufbauen
    generateFilters();
    renderHeroList();
    switchSquad(1);
    
    // Loader ausblenden
    document.getElementById('loader').style.opacity = '0';
    setTimeout(() => document.getElementById('loader').style.display = 'none', 500);
}

function generateFilters() {
    const cats = [...new Set(HERO_DATA.map(h => h.cat))];
    const container = document.getElementById('filterContainer');
    cats.forEach(cat => {
        const btn = document.createElement('button');
        btn.className = "filter-btn text-[10px] font-bold bg-gray-800 border border-gray-700 px-4 py-2 rounded-full hover:bg-blue-600 transition-all uppercase";
        btn.innerText = cat;
        btn.onclick = () => setFilter(cat);
        container.appendChild(btn);
    });
}

function renderHeroList() {
    const container = document.getElementById('heroList');
    HERO_DATA.forEach((hero, i) => {
        const div = document.createElement('div');
        div.id = `hero-card-${i}`;
        div.className = "hero-card bg-gray-900 border border-gray-800 p-5 rounded-2xl flex flex-col gap-4 shadow-lg";
        div.innerHTML = `
            <div class="flex justify-between items-start">
                <div>
                    <span class="font-black text-white italic uppercase text-sm tracking-tight">${hero.name}</span>
                    <div class="text-[9px] text-gray-600 font-bold uppercase mt-1">🎯 ${hero.target}</div>
                </div>
                <div class="flex gap-1">
                    <button onclick="toggleHero(${i}, 'front')" id="btn-${i}-front" class="row-pill pill-inactive">FRONT</button>
                    <button onclick="toggleHero(${i}, 'back')" id="btn-${i}-back" class="row-pill pill-inactive">BACK</button>
                </div>
            </div>
            <div class="flex items-center gap-3 bg-gray-950 p-2 rounded-xl border border-gray-800">
                <span class="text-[9px] font-black text-gray-700 ml-2 uppercase">Level</span>
                <input type="number" id="lvl-${i}" value="30" oninput="updateHeroLvl(${i})" class="bg-transparent w-full text-right font-mono text-blue-500 text-sm outline-none font-bold">
            </div>`;
        container.appendChild(div);
    });
}

function toggleHero(idx, pos) {
    const squad = db.squads[currentSquad].heroes;
    for(let sId in db.squads) {
        if(sId != currentSquad && db.squads[sId].heroes[idx]) { alert("Held bereits vergeben!"); return; }
    }
    if(squad[idx] && squad[idx].pos === pos) { delete squad[idx]; } 
    else {
        if(Object.keys(squad).length >= 5 && !squad[idx]) return;
        squad[idx] = { pos: pos, lvl: document.getElementById(`lvl-${idx}`).value };
    }
    saveAndCalc();
    refreshHeroUI();
}

function updateHeroLvl(idx) {
    if(db.squads[currentSquad].heroes[idx]) db.squads[currentSquad].heroes[idx].lvl = document.getElementById(`lvl-${idx}`).value;
    saveAndCalc();
}

function switchSquad(n) {
    currentSquad = n;
    document.querySelectorAll('.squad-tab').forEach((t, i) => {
        t.classList.toggle('active', i+1 === n);
        t.classList.toggle('text-blue-500', i+1 === n);
    });
    refreshHeroUI();
    calculate();
}

function refreshHeroUI() {
    const squad = db.squads[currentSquad].heroes;
    HERO_DATA.forEach((hero, i) => {
        const bF = document.getElementById(`btn-${i}-front`);
        const bB = document.getElementById(`btn-${i}-back`);
        document.getElementById(`hero-card-${i}`).classList.toggle('active', !!squad[i]);
        bF.className = squad[i]?.pos === 'front' ? "row-pill pill-front" : "row-pill pill-inactive";
        bB.className = squad[i]?.pos === 'back' ? "row-pill pill-back" : "row-pill pill-inactive";
        if(squad[i]) document.getElementById(`lvl-${i}`).value = squad[i].lvl;
    });
}

function calculate() {
    const base = parseFloat(document.getElementById('globalBase').value) || 0;
    let fVal = base, bVal = base;
    const heroes = db.squads[currentSquad].heroes;
    Object.keys(heroes).forEach(id => {
        const h = HERO_DATA[id];
        const dr = h.base + (parseInt(heroes[id].lvl) * h.inc);
        if(h.target === 'team') { fVal += dr; bVal += dr; }
        else if(h.target === 'front') { fVal += dr; }
        else if(h.target === 'self') {
            if(heroes[id].pos === 'front') fVal += (dr / 2);
            else bVal += (dr / 3);
        }
    });
    document.getElementById('frontDisplay').innerText = fVal.toFixed(2) + "%";
    document.getElementById('backDisplay').innerText = bVal.toFixed(2) + "%";
}

function saveAndCalc() {
    db.global = document.getElementById('globalBase').value;
    localStorage.setItem('dr_squad_pro_db', JSON.stringify(db));
    calculate();
}

function setFilter(cat) {
    HERO_DATA.forEach((h, i) => {
        document.getElementById(`hero-card-${i}`).style.display = (cat === 'All' || h.cat === cat) ? 'flex' : 'none';
    });
}

function exportJSON() {
    const blob = new Blob([JSON.stringify(db)], {type:'application/json'});
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `dr_squad_backup.json`;
    a.click();
}

function importJSON(e) {
    const reader = new FileReader();
    reader.onload = (ev) => { db = JSON.parse(ev.target.result); saveAndCalc(); location.reload(); };
    reader.readAsText(e.target.files[0]);
}

window.onload = init;