const week = document.getElementById("current-week");
// const habitContainer = document.getElementById("habits-container");
const habitForm = document.getElementById("habit-form");
const completedCount = document.getElementById("remaining-count");
// let habits = JSON.parse(localStorage.getItem("atomic-habits")) || [
//   {name: 'No habits added. Explore the app',}
// ];

let habits = [
  {
    id: crypto.randomUUID(),
    name: "hi",
    streak: 0,
    history: {},
    category: 'fitness'
  },
];

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
  return `${year}-${month}-${day}`; //"YYYY-MM-DD"
};

function weekTracker() {
  const today = new Date();
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

function renderHabitCard() {
  calculateDoneToday();
  habitContainer.innerHTML = "";
  const dayDates = weekTracker();
  habits.forEach((habit) => {
    let html = `
    <div class="habit-row-card">
        <div class="card-header-row">
          <div class="habit-meta">
            <!-- Left Side Accent Indicator -->
            <div class="accent-bar fitness-bg"></div>
            <div>
              <p>${habit.name}</p>
              <span class="category-tag">${habit.category}</span>
            </div>
          </div>
          <div class="streak-pill">⚡ ${habit.streak}d streak</div>
        </div>

        <!-- Horizontal Weekly Checkers -->
        <div class="week-strip">
          <button class="day-node active-completed">
            <span class="day-name">Mon <span class="date-box">- 12</span></span>
            <span class="dot-indicator"></span>
          </button>
          <button class="day-node active-completed">
            <span class="day-name">Tue <span class="date-box">- 13</span></span>
            <span class="dot-indicator"></span>
          </button>
          <button class="day-node active-completed">
            <span class="day-name">Wed <span class="date-box">- 14</span></span>
            <span class="dot-indicator"></span>
          </button>
          <button class="day-node">
            <span class="day-name">Thu <span class="date-box">- 15</span></span>
            <span class="dot-indicator"></span>
          </button>
          <button class="day-node">
            <span class="day-name">Fri <span class="date-box">- 16</span></span>
            <span class="dot-indicator"></span>
          </button>
          <button class="day-node">
            <span class="day-name">Sat <span class="date-box">- 17</span></span>
            <span class="dot-indicator"></span>
          </button>
          <button class="day-node">
            <span class="day-name">Sun <span class="date-box">- 18</span></span>
            <span class="dot-indicator"></span>
          </button>
        </div>
      </div>
    `;

    dayDates.forEach((day) => {
      const isCompleted = habit.history[day.isoDate] === true || "";
      let buttonClass = "";
      const upcommingDay = day.isoDate > formatToISO(new Date());
      let disabled = "";
      if (upcommingDay) {
        buttonClass =
          "flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-950/40 border border-zinc-900 text-zinc-700 opacity-40 cursor-not-allowed";
        disabled = "disabled";
      } else if (isCompleted) {
        buttonClass =
          "flex flex-col items-center justify-center p-2 rounded-xl bg-gradient-to-r from-green-400 to-teal-400 hover:scale-105 text-zinc-950 font-bold cursor-pointer shadow-sm shadow-emerald-400";
      } else {
        buttonClass =
          "flex flex-col items-center justify-center p-2 rounded-xl bg-zinc-800 border border-zinc-600 text-zinc-400 hover:border-zinc-500 hover:text-zinc-200";
      }
    });
  });
}

function addHabit(e) {
  e.preventDefault();
  const habitInput = document.getElementById("habit-input");
  const habitName = habitInput.value.trim();
  if (!habitName) return alert("Enter A Name first");
  const newHabit = {
    id: crypto.randomUUID(),
    name: habitName,
    streak: 0,
    history: {},
  };
  habits.push(newHabit);
  habitInput.value = "";
  localStorage.setItem("atomic-habits", JSON.stringify(habits));
  renderHabitCard();
}

function removeHabit(habitId) {
  let newArray = habits.filter((habit) => String(habit.id) !== String(habitId));
  habits = newArray;
  localStorage.setItem("atomic-habits", JSON.stringify(habits));
  renderHabitCard();
}

function addToHistory(habitId, isoDate) {
  let habit = habits.find((habit) => {
    return habit.id === habitId || String(habit.id) === String(habitId);
  });
  if (habit.history[isoDate] === true) {
    habit.history[isoDate] = false;
  } else {
    habit.history[isoDate] = true;
  }
  localStorage.setItem("atomic-habits", JSON.stringify(habits));
  renderHabitCard();
}

function calculateDoneToday() {
  const today = new Date();
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
  completedCount.innerHTML = doneToday;
}
localStorage.setItem("atomic-habits", JSON.stringify(habits));
habitForm.addEventListener("submit", addHabit);
renderHabitCard();
weekTracker();
