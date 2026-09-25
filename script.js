let identities = JSON.parse(localStorage.getItem('atomic-identities')) || [
  {
    id: "athlete",
    name: "The Identity (ex. Athelete)",
    icon: "fa-person-running",
    color: "#00d99b",
    level: 4,
    xp: 720,
    xpNext: 1000,
    votes: 47,
    title: "Contender"
  },
];

let habits = JSON.parse(localStorage.getItem("atomic-habits")) || [
  {
    id: "h1",
    identityId: "developer",
    name: "Code for 30 mins",
    cue: "After I have my morning coffee • In my room",
    xp: 20,
    vote: 1,
    streak: 7,
    doneToday: false
  },
];

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
    card.querySelector('.identity-arrow').addEventListener('click', (e) => {
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
    save()
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
renderIdentities();
///////////// Habits Handlers
function renderHabits() {
  const table = document.querySelector(".habit-table");
  table.querySelectorAll(".habit-row:not(.habit-row-head)").forEach(row => row.remove());

  habits.forEach(habit => {
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
    identity.xp += habit.xp;
    identity.votes += habit.vote;
    applyLevelUps(identity)
  } else {
    habit.streak = Math.max(0, habit.streak - 1);
    identity.xp = Math.max(0, identity.xp - habit.xp);
    habit.streak = Math.max(0, identity.votes - habit.vote)
  }
  save();
}
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
    openHabitMenu(row.dataset,moreBtn);
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

  const rect = anchorEl.getBoundingClientRect();
  menu.style.top = `${rect.bottom + window.scrollY + 4}px`;
  menu.style.left = `${rect.left + window.scrollX - menu.offsetWidth + rect.width}px`;// Used the same logic before here
}

function applyLevelUps(identity) {
  while (identity.xp >= identity.xpNext) {
    identity.xp -= identity.xpNext;
    identity.level ++;
    identity.xpNext = xpForNextLevel(identity.level);
  }
}

function xpForNextLevel(level) {
  return level * 200 + 200;
}

function saveAndRefresh() {
  localStorage.setItem("atomic-habits", JSON.stringify(habits));
  calculateDoneToday();
  calculateMaxStreak();
  updateProgressRing();
}

function addHabit() {
  const habitInput = document.getElementById("habit-input");
  const habitName = habitInput.value.trim();
  console.log(habitName);
  if (!habitName) return alert("Enter A Name first");
  const newHabit = {
    id: crypto.randomUUID(),
    name: habitName,
    streak: 0,
    category: selectedCategory,
    history: {},
  };
  habits.push(newHabit);
  habitInput.value = "";
  saveAndRefresh();
}

function removeHabit(habitId) {
  showCustomPopup({
    title: "Delete This Habit",
    bodyHtml:
      "<p style='color: var(--text-muted); font-size: 15px;'>Are you sure you want to delete this tracker? <br> This clear sequence cannot be undone.</p>",
    confirmText: "Delete",
    confirmBg: "var(--accent-danger)",
    onConfirm: () => {
      let newArray = habits.filter(
        (habit) => String(habit.id) !== String(habitId),
      );
      habits = newArray;
      saveAndRefresh();
    },
  });
}

function editHabit(habitId) {
  const habit = habits.find((habit) => String(habit.id) === String(habitId));
  if (!habit) return null;
  showCustomPopup({
    title: "Edit Habit",
    bodyHtml: `
    <div style="display: flex; flex-direction: column; gap: 16px; width: 100%; text-align: left;">
        <div class="form-section">
          <label class="section-label" style="color: var(--text-muted); font-size: 11px;">HABIT NAME</label>
          <input type="text" id="popup-edit-input" value="${habit.name}" 
                 class="habit-input-text" style="width: 100%;" autocomplete="off" />
        </div>
        
        <div class="form-section">
          <label class="section-label" style="color: var(--text-muted); font-size: 11px;">CATEGORY</label>
          <select id="popup-edit-category" class="edit-dropdown">
            <button>
              <selectedcontent></selectedcontent>
            </button>
            <option value="Fitness" ${habit.category === "Fitness" ? "selected" : ""}>
                <i class="fa-solid fa-dumbbell" style="color: rgb(99, 230, 190);"></i>              
              Fitness
            </option>
            <option value="Mind" ${habit.category === "Mind" ? "selected" : ""}>
              <i class="fa-solid fa-brain" style="color: rgb(116, 192, 252);"></i>
              Mind
            </option>
            <option value="Productivity" ${habit.category === "Productivity" ? "selected" : ""}>
              <i class="fa-solid fa-arrow-trend-up" style="color: rgb(255, 212, 59);"></i>
              Productivity
            </option>
          </select>
        </div>
      </div>
    `,
    confirmText: "Save Changes",
    confirmBg: "var(--accent-mind)",
    onConfirm: () => {
      const editInput = document.getElementById("popup-edit-input");
      const categoryField = document.getElementById("popup-edit-category");

      const updateName = editInput ? editInput.value.trim() : "";
      const updateCategory = categoryField
        ? categoryField.value
        : habit.category;

      if (!updateName) return alert("Habit name cannot be left blank");

      habit.name = updateName;
      habit.category = updateCategory;
      saveAndRefresh();
    },
  });
}
function showCustomPopup({
  title,
  bodyHtml,
  confirmText,
  confirmBg,
  onConfirm,
}) {
  const popup = document.getElementById("custom-popup");
  const popupTitle = document.getElementById("popup-title");
  const popupBody = document.getElementById("popup-body");
  let confirmBtn = document.getElementById("modal-confirm-btn");
  let cancelBtn = document.getElementById("modal-cancel-btn");

  popupTitle.textContent = title;
  popupBody.innerHTML = bodyHtml;
  confirmBtn.textContent = confirmText || "Confirm";
  confirmBtn.style.background = confirmBg || "var(--accent-mind)";

  window.scrollTo({ top: 0, behavior: "instant" });
  const scrollbarWidth =
    window.innerWidth - document.documentElement.clientWidth;
  document.body.style.setProperty("--scrollbar-width", `${scrollbarWidth}px`);
  document.body.classList.add("modal-open");

  popup.style.display = "flex";

  const closePopup = () => {
    popup.style.display = "none";
    document.body.classList.remove("modal-open");
  };

  const newConfirmBtn = confirmBtn.cloneNode(true);
  const newCancelBtn = cancelBtn.cloneNode(true);
  confirmBtn.replaceWith(newConfirmBtn);
  cancelBtn.replaceWith(newCancelBtn);

  newCancelBtn.addEventListener("click", closePopup);
  newConfirmBtn.addEventListener("click", () => {
    onConfirm();
    closePopup();
  });
}

const categoryTabs = document.querySelectorAll(".category-tabs .tab-item");

categoryTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    categoryTabs.forEach((t) => t.classList.remove("active"));
    tab.classList.add("active");
    selectedCategory = tab.dataset.category || "Fitness";
  });
});
/*
// habitSubmitBtn.addEventListener("click", (e) => {
//   e.preventDefault();
//   addHabit();
// });

habitContainer.addEventListener("click", (e) => {
  const deleteBtn = e.target.closest(".delete-habit");
  const editBtn = e.target.closest(".edit-habit");
  const dayNode = e.target.closest(".day-node");

  if (deleteBtn) {
    const habitId = deleteBtn.dataset.habitId;
    removeHabit(habitId);
  }
  if (dayNode) {
    addToHistory(dayNode.dataset.habitId, dayNode.dataset.date);
  }
  if (editBtn) {
    const habitId = editBtn.dataset.habitId;
    editHabit(habitId);
  }
});

const quickPresets = document.querySelectorAll(".preset-row .preset-btn");
quickPresets.forEach((preset) => {
  preset.addEventListener("click", () => {
    habits.push({
      id: crypto.randomUUID(),
      streak: 0,
      name: preset.dataset.name,
      history: {},
      category: preset.dataset.category,
    });
    saveAndRefresh();
  });
});
saveAndRefresh();
*/
save();
