let identities = JSON.parse(localStorage.getItem('atomic-identities')) || [];

let habits = JSON.parse(localStorage.getItem("atomic-habits")) || [];

let activeFilter = 'all';
let selectedIdentity = null;
let today = new Date();
let selectedCategory = "Fitness";

const week = document.getElementById("current-week");
const habitContainer = document.getElementById("habits-container");
const remeiningCountElem = document.getElementById("remaining-count");
const habitSubmitBtn = document.getElementById("habit-submit-btn");
const habitForm = document.getElementById("habit-form");
const totalHabitsElem = document.querySelector("#total-habits .count");

function save() {
  localStorage.setItem("atomic-identities", JSON.stringify(identities));
  localStorage.setItem("atomic-habits", JSON.stringify(habits));
  renderHabits();
  renderIdentities();
  renderChips();
  updateTopStats();
}

const formatDate = (date) => {
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = String(date.getFullYear()).slice(-2);

  return `${day}/${month}`;
};

const formatToISO = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
};

function weekTracker() {
  const day = today.getDay();
  const distanceToMonday = day === 0 ? 6 : day - 1;
  // First day
  const firstDay = new Date(today);
  firstDay.setDate(today.getDate() - distanceToMonday);
  // Last day
  const lastDay = new Date(firstDay);
  lastDay.setDate(firstDay.getDate() + 6);

  const dayDates = [];
  const dayNames = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

  for (let i = 0; i < 7; i++) {
    const nextDate = new Date(firstDay);
    nextDate.setDate(firstDay.getDate() + i);
    formatToISO(nextDate);
    dayDates.push({
      dayName: dayNames[i],
      dateNum: String(nextDate.getDate()).padStart(2, "0"),
      isoDate: formatToISO(nextDate),
    });
  }
  week.innerHTML = `${formatDate(firstDay)} -- ${formatDate(lastDay)}`;
  return dayDates;
}
function addToHistory(habitId, isoDate) {
  const todayISO = formatToISO(today);
  let habit = habits.find((habit) => {
    return habit.id === habitId || String(habit.id) === String(habitId);
  });
  if (isoDate > todayISO) {
    return;
  }
  if (habit.history[isoDate] === true) {
    habit.history[isoDate] = false;
  } else {
    habit.history[isoDate] = true;
  }
  const newStreak = calculateStreak(habit);
  habit.streak = newStreak;
  saveAndRefresh();
}

function calculateDoneToday() {
  let doneToday = 0;
  const isoDate = formatToISO(today);
  habits.forEach((habit) => {
    if (habit.history) {
      if (habit.history[isoDate] === true) {
        doneToday += 1;
      }
    }
  });
  console.log(doneToday);
  remeiningCountElem.innerHTML = habits.length - doneToday;
  return doneToday;
}
function calculateStreak(habit) {
  let streak = 0;
  const date = new Date(today);
  date.setHours(0, 0, 0, 0);
  const todayISO = formatToISO(today);

  if (habit.history[todayISO] !== true) {
    date.setDate(date.getDate() - 1);
  }

  while (true) {
    const isoDate = formatToISO(date);

    if (habit.history[isoDate] !== true) {
      break;
    }
    streak++;
    date.setDate(date.getDate() - 1);
  }
  return streak;
}

function calculateMaxStreak() {
  let maxStreak = 0;
  habits.forEach((habit) => {
    const streaks = habit.streak;
    if (streaks > maxStreak) {
      maxStreak = streaks;
    }
    document.getElementById("max-streak").innerHTML =
      `<i class="fa-solid fa-fire-flame-curved flame-icon"></i> ${maxStreak} days`;
  });
}
function updateProgressRing() {
  const ring = document.getElementById("progress-ring-fill");
  const precentageText = document.querySelector(".percentage");

  if (!ring || !precentageText) return;

  const totalHabits = habits.length;

  if (totalHabits === 0) {
    precentageText.textContent = "0%";
    ring.style.strokeDasharray = "207.35";
    ring.style.strokeDashoffset = "207.35";
    return;
  }

  const todayISO = formatToISO(today);
  const completedToday = calculateDoneToday();

  const percentage = Math.round((completedToday / totalHabits) * 100);
  const circumference = 2 * Math.PI * 33;
  const offset = circumference - (percentage / 100) * circumference;

  ring.style.strokeDasharray = circumference;
  ring.style.strokeDashoffset = offset;

  precentageText.textContent = `${percentage}%`
}
//////// Identities Handlers
function renderIdentities() {
  const container = document.querySelector('.identities');
  const addBtn = container.querySelector('.add-identity');
  container.querySelectorAll(".identity:not(.add-identity)").forEach(elem => elem.remove());

  identities.forEach(identity => {
    const percentage = Math.min(100, Math.round((identity.xp / identity.xpNext) * 100));
    const card = document.createElement("div");
    card.className = "identity";
    card.style.setProperty("--identity-color", identity.color);
    card.dataset.id = identity.id;
    card.innerHTML = `
    <div class="identity-head">
      <div class="identity-logo">
        <i class="fa-solid ${identity.icon}"></i>
      </div>
      <div class="identity-details">
        <p class="identity-title">${identity.name}</p>
        <p class="identity-level">
          <span class="level">
            Level ${identity.level}
          </span> · 
          <span class="level-identity">${identity.title}</span></p>
      </div>
      <i class="fa-solid fa-chevron-right identity-arrow"></i>
    </div>
    <div class="identity-progress">
      <div class="identity-progress-bar"><span style="width: ${percentage}%;"></span></div>
      <p class="identity-count">${identity.xp} / ${identity.xpNext} XP</p>
    </div>
    <div class="identity-vote">
      <i class="fa-regular fa-circle-check"></i>
      <p><span class="vote-count">${identity.votes}</span> votes cast</p>
    </div>
    `;
    card.querySelector('.identity-head').addEventListener('click', (e) => {
      e.stopPropagation();
      openIdentityMenu(identity.id, e.currentTarget);
    })
    container.insertBefore(card, addBtn);
  })
}
function openIdentityMenu(identityId, anchorCard) {
  document.querySelectorAll(".row-menu").forEach(menu => menu.remove());
  const menu = document.createElement("div");
  menu.classList = "row-menu";
  menu.innerHTML = `
    <button class="row-menu-item edit"><i class="fa-solid fa-pen"></i> Edit</button>
    <button class="row-menu-item delete"><i class="fa-solid fa-trash"></i> Delete</button>`;
  document.body.appendChild(menu);

  const rect = anchorCard.getBoundingClientRect(); // Used google ais help because i got no idea about this
  menu.style.top = `${rect.bottom + window.scrollY + 4}px`;
  menu.style.left = `${rect.left + window.scrollX - menu.offsetWidth + rect.width}px`;

  menu.querySelector(".edit").addEventListener('click', () => {
    openIdentityModal(identities.find(i => i.id === identityId))
  })

  menu.querySelector(".delete").addEventListener('click', () => {
    identities = identities.filter(i => i.id !== identityId);
    habits = habits.filter(h => h.identityId !== identityId);
    save();
    renderIdentities();
    menu.remove();
  })
  setTimeout(() => {
    document.addEventListener("click", function closeMenu(e) {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener("click", closeMenu)
      }
    })
  }, 0)
}
let editingIdentity = null;
const identityModal = document.querySelector(".identity-modal");

function openIdentityModal(identity = null) {
  editingIdentity = identity;
  const form = identityModal.querySelector(".identity-form");
  form.querySelector('[name="name"]').value = identity ? identity.name : "";
  form.querySelector('[name="icon"]').value = identity ? identity.icon : "fa-pen";
  form.querySelector('[name="color"]').value = identity ? identity.color : "#f0883e";
  identityModal.querySelector(".modal-title").textContent = identity ? "Edit Identity" : "New Identiy"
  identityModal.querySelector(".save-btn").textContent = identity ? "Save Changes" : "Create";
  identityModal.showModal();
}
document.querySelector(".add-identity").addEventListener('click', () => openIdentityModal())
document.querySelector(".cancel-btn").addEventListener('click', () => identityModal.close())

identityModal.querySelector(".identity-form").addEventListener("submit", e => {
  const data = new FormData(e.target);
  const color = clampLightness(data.get("color"))

  if (editingIdentity) {
    editingIdentity.name = data.get("name");
    editingIdentity.icon = data.get("icon");
    editingIdentity.color = color;
  } else {
    identities.push({
      id: crypto.randomUUID(),
      name: data.get("name"),
      icon: data.get("icon"),
      color,
      level: 1,
      xp: 0,
      xpNext: xpForNextLevel(1),
      votes: 0,
      title: "Beginner",
    });
  }
  save();
  renderIdentities();
  editingIdentity = null;
  e.target.reset();
})

function clampLightness(hex) {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const l = (Math.max(r, g, b) + Math.min(r, g, b)) / 2;
  return (l < 0.25 || l > 0.85) ? "#7c5cff" : hex;
} //AI got me here
/////////////
///////////// Habits Handlers
function renderHabits() {
  const table = document.querySelector(".habit-table");
  table.querySelectorAll(".habit-row:not(.habit-row-head)").forEach(row => row.remove());

  const visible = activeFilter === "all"
    ? habits
    : habits.filter(h => h.identityId === activeFilter);

  visible.forEach(habit => {
    const identity = identities.find(i => i.id === habit.identityId);
    if (!identity) return;

    const row = document.createElement("div");
    row.className = "habit-row" + (habit.doneToday ? " done" : "");
    row.dataset.id = habit.id;
    row.innerHTML = `
      <button class="habit-check"><i class="fa-solid fa-check"></i></button>
      <div class="habit-info">
        <p class="habit-name">${habit.name}</p>
        <p class="habit-cue">${habit.cue}</p>
      </div>
      <span class="tag" style="--identity-color:${identity.color}; color:var(--identity-color); background:color-mix(in srgb, var(--identity-color) 12%, transparent); border:1px solid color-mix(in srgb, var(--identity-color) 25%, transparent);">${identity.name}</span>
      <p class="habit-streak">🔥 ${habit.streak} days</p>
      <div class="habit-xp">
        <p class="xp">+${habit.xp} XP</p>
        <p class="vote">+${habit.vote} vote</p>
      </div>
      <button class="habit-more"><i class="fa-solid fa-ellipsis-vertical"></i></button>`;

    table.appendChild(row);
  });
}
function toggleHabit(habitId) {
  const habit = habits.find(habit => habit.id === habitId);
  const identity = identities.find(identity => identity.id === habit.identityId);
  if (!habit || !identity) return;

  habit.doneToday = !habit.doneToday;
  if (habit.doneToday) {
    habit.streak += 1;
    habit.lastCompleteDate = formatToISO(today);
    identity.xp += habit.xp;
    identity.votes += habit.vote;
    applyLevelUps(identity);
  } else {
    habit.streak = Math.max(0, habit.streak - 1);
    identity.xp = Math.max(0, identity.xp - habit.xp);
    identity.votes = Math.max(0, identity.votes - habit.vote);
  }
  save();
}
function resetDailyCompletion() {
  const todayISO = formatToISO(today);
  let changed = false;

  habits.forEach(habit => {
    if (habit.doneToday && habit.lastCompleteDate !== todayISO) {
      habit.doneToday = false;
      changed = true;
    }
  });

  if (changed) save();
}
function cleanOrphanedHabits() {
  const before = habits.length;
  habits = habits.filter(h => h.identityId && identities.some(i => i.id === h.identityId));
  if (habits.length !== before) save();
}
cleanOrphanedHabits();
document.querySelector(".habit-table").addEventListener('click', (e) => {
  const checkBtn = e.target.closest(".habit-check");
  const moreBtn = e.target.closest(".habit-more");

  if (checkBtn) {
    const row = checkBtn.closest(".habit-row");
    toggleHabit(row.dataset.id);
  }
  if (moreBtn) {
    e.stopPropagation();
    const row = moreBtn.closest(".habit-row");
    openHabitMenu(row.dataset.id, moreBtn);
  }
});

function openHabitMenu(habitId, anchorElem) {
  document.querySelectorAll(".row-menu").forEach(menu => menu.remove());
  const menu = document.createElement("div");
  menu.className = "row-menu";
  menu.innerHTML = `
    <button class="row-menu-item edit"><i class="fa-solid fa-pen"></i> Edit</button>
    <button class="row-menu-item delete"><i class="fa-solid fa-trash"></i> Delete</button>`;
  document.body.appendChild(menu);

  const rect = anchorElem.getBoundingClientRect();
  menu.style.top = `${rect.bottom + window.scrollY + 4}px`;
  menu.style.left = `${rect.left + window.scrollX - menu.offsetWidth + rect.width}px`;// Used the same logic before here

  menu.querySelector(".edit").addEventListener('click', () => {
    openHabitModal(habits.find(h => h.id === habitId))
    menu.remove();
    save();
  })
  menu.querySelector(".delete").addEventListener('click', () => {
    habits = habits.filter(h => h.id !== habitId)
    save();
    menu.remove();
  });
  setTimeout(() => {
    document.addEventListener("click", function closeMenu(e) {
      if (!menu.contains(e.target)) {
        menu.remove();
        document.removeEventListener("click", closeMenu);
      }
    });
  }, 0);
}

let editingHabit = null;
const habitModal = document.querySelector(".habit-modal");
function renderIdentityPicker() {
  const picker = habitModal.querySelector(".identity-picker");
  picker.innerHTML = "";
  if (identities.length > 0) {
    identities.forEach(identity => {
      const btn = document.createElement("button");
      btn.type = "button";
      btn.className = "identity-pick";
      btn.style.setProperty("--identity-color", identity.color);
      btn.innerHTML = `
        <span class="identity-pick-logo"><i class="fa-solid ${identity.icon}"></i></span>
        <span>${identity.name}</span>`;
      btn.addEventListener("click", () => goToHabitStep2(identity));
      picker.appendChild(btn);
    });
  } else {
    picker.innerHTML = "Add an Identity First";
  }
}
function goToHabitStep2(identity) {
  selectedIdentity = identity;
  habitModal.querySelector('[data-step="1"]').hidden = true;
  habitModal.querySelector('[data-step="2"]').hidden = false;
  habitModal.querySelector('.picked-identity').textContent = `Identity: ${identity.name}`;
}
function openHabitModal(habit = null) {
  editingHabit = habit;
  renderIdentityPicker();

  const form = habitModal.querySelector(".habit-form");
  const step2 = habitModal.querySelector('[data-step="2"]');

  if (habit) {
    const identity = identities.find(i => i.id === habit.identityId);
    goToHabitStep2(identity);
    form.querySelector('[name="name"]').value = habit.name;
    form.querySelector('[name="cue"]').value = "";
    form.querySelector('[name="location"]').value = habit.location ? habit.location : "";
    form.querySelector('[name="xp"]').value = habit.xp;
    form.querySelector('[name="vote"]').value = habit.vote;
    habitModal.querySelector(".save-btn").textContent = "Save Changes";
  } else {
    habitModal.querySelector('[data-step="1"]').hidden = false;
    step2.hidden = true;
    form.reset();
    habitModal.querySelector(".save-btn").textContent = "Create Habit"
  }
  habitModal.showModal();
}
habitModal.querySelector(".modal-close").addEventListener('click', () => {
  habitModal.close();
  editingHabit = null;
  selectedIdentity = null;
})
habitModal.querySelector(".back-btn").addEventListener('click', () => {
  habitModal.querySelector('[data-step="2"]').hidden = true;
  habitModal.querySelector('[data-step="1"]').hidden = false;
})
function xpForNextLevel(level) {
  return level * 200 + 200;
}
habitModal.querySelector(".habit-form").addEventListener("submit", (e) => {
  if (!selectedIdentity) return;
  const data = new FormData(e.target);
  const cueText = `
    After ${data.get("cue")}${data.get("location") ? " • " + data.get("location") : ""}`
  if (editingHabit) {
    editingHabit.identityId = selectedIdentity.id;
    editingHabit.name = data.get("name");
    editingHabit.cue = cueText;
    editingHabit.location = data.get('location');
    editingHabit.xp = Number(data.get("xp"));
    editingHabit.vote = Number(data.get("vote"));
  } else {
    habits.push({
      id: crypto.randomUUID(),
      identityId: selectedIdentity.id,
      name: data.get("name"),
      cue: cueText,
      location: data.get("location"),
      xp: Number(data.get("xp")),
      vote: Number(data.get("vote")),
      streak: 0,
      doneToday: false,
    })
  }
  save();
  renderHabits();
  editingHabit = null;
  selectedIdentity = null;
  e.target.reset();
});

document.querySelector(".add-habit-btn").addEventListener("click", () => openHabitModal());
document.querySelector(".quick-add-button").addEventListener("click", () => openHabitModal());
/////////////////////////
///////////////////////// Chips and filters handlers
function renderChips() {
  const bar = document.querySelector(".habit-filters");
  bar.innerHTML = "";
  const validHabits = habits.filter(h => identities.some(i => i.id === h.identityId));

  const allChip = document.createElement("button");
  allChip.className = "chip" + (activeFilter === "all" ? " active" : "");
  allChip.dataset.filter = "all";
  allChip.innerHTML = `All <span class="chip-count">${validHabits.length}</span>`
  bar.appendChild(allChip);

  identities.forEach(identity => {
    const count = habits.filter(h => h.identityId === identity.id).length;
    const chip = document.createElement("button");
    chip.className = "chip" + (activeFilter === identity.id ? " active" : "");
    chip.style.setProperty("--identity-color", identity.color);
    chip.dataset.filter = identity.id;
    chip.innerHTML = `${identity.name} <span class="chip-count">${count}</span>`;
    bar.appendChild(chip);
  })
}
document.querySelector(".habit-filters").addEventListener("click", (e) => {
  const chip = e.target.closest(".chip");
  if (!chip) return;
  activeFilter = chip.dataset.filter;
  renderChips();
  renderHabits();
});
////////////////////////
//////////////////////// Updating Top stats bar
function updateTopStats() {
  const total = habits.length;
  const done = habits.filter(h => h.doneToday).length;
  const percentage = total === 0 ? 0 : Math.round((done / total) * 100);
  const bestStreak = habits.reduce((max, h) => Math.max(max, h.streak), 0);
  const totalXp = identities.reduce((sum, id) => sum + id.xp + (id.level - 1) * 200, 0);
  const completion = total === 0 ? 0 : Math.round((habits.filter(h => h.streak > 0).length / total) * 100);

  document.querySelector(".ring").style.setProperty("--progress", `${percentage}%`);
  document.querySelector(".percentage").textContent = `${percentage}%`;
  document.getElementById("completed-count").textContent = done;
  document.getElementById("total-count").textContent = total;

  const values = document.querySelectorAll(".stats-grid .value");
  if (values[0]) values[0].innerHTML = `<i class="fa-solid fa-crown"></i> ${bestStreak}`;
  if (values[1]) values[1].innerHTML = `<i class="fa-solid fa-circle-check"></i> ${completion}%`;
  if (values[2]) values[2].innerHTML = `<i class="fa-regular fa-star"></i> ${totalXp.toLocaleString()}`;
}
////////////////////////
//////////////////////// Settings section this was claude's idea to make settings fill
document.querySelector(".export-btn").addEventListener('click', () => {
  const data = JSON.stringify({identities, habits}, null, 2);
  const blob = new Blob([data], {type: "application/json"});
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "atomic-habitizer-backup.json";
  a.click();
  URL.revokeObjectURL(url);
});
let importFileInput = document.querySelector(".import-file");
document.querySelector(".import-btn").addEventListener("click", e => importFileInput.click());
importFileInput.addEventListener("change", e => {
  const file = e.target.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    try {
      const parsed = JSON.parse(reader.result);
      if (!Array.isArray(parsed.identities) || !Array.isArray(parsed.habits)) {
        alert("This file dosent look like a valid atomic backup file");
        return;
      }
      if (!confirm("This replaces your current identities and habits. Continue?")) return;
      identities = parsed.identities;
      habits = parsed.habits;
      save();
      alert("Import Succesful. ");
    } catch (error) {
      alert("Couldn't read the file - make sure it's a valid JSON export");
    }
  }
  reader.readAsText(file);
  importFileInput = "";
})
document.querySelector(".reset-btn").addEventListener("click", () => {
  if (!confirm("This deletes all identities and habits permanently. Continue?")) return;
  localStorage.removeItem("atomic-identities");
  localStorage.removeItem("atomic-habits");
  location.reload();
});
////////////////////////

//////////////////////// NAVIGATION
const navItems = document.querySelectorAll(".nav-item");
const dashboardHeaderElem = document.querySelector(".dashboard-header");
const identitySectionElem = document.querySelector(".identity-section");
const habitsPanelElem = document.querySelector(".habits-panel");
const lawsPanelElem = document.querySelector(".laws-panel");
const settingsPanelElem = document.querySelector(".settings-panel");
function setActiveNav(index) {
  navItems.forEach(item => item.classList.remove("active"));
  navItems[index].classList.add("active");
}
function setPanels({ header, identity, habitsPanel, lawsPanel, settings }) {
  dashboardHeaderElem.hidden = !header;
  identitySectionElem.hidden = !identity;
  habitsPanelElem.hidden = !habitsPanel;
  lawsPanelElem.hidden = !lawsPanel;
  settingsPanelElem.hidden = !settings;
}
function showDashboard() {
  setActiveNav(0);
  setPanels({ header: true, identity: true, habitsPanel: true, lawsPanel: true, settings: false });
  window.scrollTo({ top: 0, behavior: "smooth" });
}
function showHabits() {
  setActiveNav(1);
  setPanels({ header: false, identity: false, habitsPanel: true, lawsPanel: false, settings: false });
}
function showIdentities() {
  setActiveNav(2);
  setPanels({ header: false, identity: true, habitsPanel: false, lawsPanel: false, settings: false });
}
function showLaws() {
  setActiveNav(3);
  setPanels({ header: false, identity: false, habitsPanel: false, lawsPanel: true, settings: false });
}
function showSettings() {
  setActiveNav(4);
  setPanels({ header: false, identity: false, habitsPanel: false, lawsPanel: false, settings: true });
}
navItems.forEach((item, i) => {
  item.addEventListener('click', e => {
    e.preventDefault();
    if (i === 0) showDashboard();
    else if (i === 1) showHabits();
    else if (i === 2) showIdentities();
    else if (i === 3) showLaws();
    else if (i === 4) showSettings();
  })
})
// Nav state Toggle
document.querySelector(".sidebar-toggle").addEventListener('click', () => {
  document.querySelector(".sidebar").classList.toggle("collapsed");
}
)
////////////////////////
function applyLevelUps(identity) {
  while (identity.xp >= identity.xpNext) {
    identity.xp -= identity.xpNext;
    identity.level++;
    identity.xpNext = xpForNextLevel(identity.level);
  }
}
save();
resetDailyCompletion();
