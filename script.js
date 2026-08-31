let habits = JSON.parse(localStorage.getItem("atomic-habits")) || [];
let today = new Date();
let selectedCategory = "Fitness";
// today = new Date("2025-05-15T00:00:00");

const week = document.getElementById("current-week");
const habitContainer = document.getElementById("habits-container");
const remeiningCountElem = document.getElementById("remaining-count");
const habitSubmitBtn = document.getElementById("habit-submit-btn");
const habitForm = document.getElementById("habit-form");
const totalHabitsElem = document.querySelector("#total-habits .count");

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
function renderHabitCard() {
  habitContainer.innerHTML = "";
  const dayDates = weekTracker();
  totalHabitsElem.innerText = habits.length;
  if (habits.length === 0) {
    habitContainer.innerHTML = "You havent "
  }
  habits.forEach((habit) => {
    const dayNodesHtml = dayDates
      .map((day) => {
        const isCompleted = habit.history[day.isoDate] === true || "";
        const upcommingDay = day.isoDate > formatToISO(today);
        const istodaysNode = day.isoDate === formatToISO(today);

        return `${
          upcommingDay
            ? `<button disabled class="day-node upcomming">
              <i class='fas fa-lock upcomming'style="font-size:16px;color: var(--bg-surface)"></i>
              </button>`
            : `<button 
              class="day-node
              ${isCompleted ? "active-completed" : ""} 
              ${istodaysNode ? "today-node" : ""}
              ${isCompleted && istodaysNode ? "active-today" : ""}" 
              data-habit-id="${habit.id}" data-date="${day.isoDate}">
                <span class="day-name"
                  >${day.dayName} <span class="date-box">- ${day.dateNum}</span></span
                >
                <span class="dot-indicator"></span>
              </button>`
        }`;
      })
      .join("");

    let html = `
    <div class="habit-row-card ${habit.category.toLocaleLowerCase()}">
      <div class="card-header-row">
        <div class="habit-meta">
          <!-- Left Side Accent Indicator -->
          <div class="accent-bar"></div>
          <div>
            <p>${habit.name}</p>
            <span class="category-tag">${habit.category}</span>
          </div>
          <div class="streak-pill">⚡${habit.streak}</div>
        </div>
        <div class="edit-delete-container">
          <i
          id="edit-habit"
          class="fa-solid fa-pen-to-square edit-habit"
          data-habit-id="${habit.id}"></i>
          <i id="delete-habit" class="fa-regular fa-trash-can delete-habit"
          data-habit-id="${habit.id}"></i>
        </div>
      </div>
      <!-- Horizontal Weekly Checkers -->
      <div class="week-strip" id="week-strip">${dayNodesHtml}</div>`;
    habitContainer.innerHTML += html;
  });
  calculateMaxStreak();
}

function saveAndRefresh() {
  localStorage.setItem("atomic-habits", JSON.stringify(habits));
  renderHabitCard();
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

habitSubmitBtn.addEventListener("click", (e) => {
  e.preventDefault();
  addHabit();
});

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
