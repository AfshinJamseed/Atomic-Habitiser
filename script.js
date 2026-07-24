const week = document.getElementById("current-week");
const habitContainer = document.getElementById("habits-container");
const habitForm = document.getElementById("habit-form");
const completedCount = document.getElementById("completed-count");
const totalCount = document.getElementById("total-count");
let habits = JSON.parse(localStorage.getItem("atomic-habits")) || [];

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
  week.innerHTML = `${formatDate(firstDay)} - ${formatDate(lastDay)}`;
  return dayDates;
}

function renderHabitCard() {
  calculateDoneToday();
  habitContainer.innerHTML = "";
  const dayDates = weekTracker();
  habits.forEach((habit) => {
    const article = document.createElement("article");
    article.className =
      "-translate-y-2 mb-5 p-4 rounded-xl border border-zinc-500 bg-zinc-700 shadow-lg shadow-zinc-50 hover:shadow-none hover:translate-y-0 transition-all duration-300";
    article.innerHTML = `
          <div
            class="top flex justify-between w-full bg-zinc-700 items-center mb-4"
          >
            <h1 class="text-lg font-bold text-zinc-100 flex items-center gap-2">
              ${habit.name}<span
                class="text-sm font-bold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/50 cursor-pointer"
                >${habit.streak} 🔥</span
              >
            </h1>
  
            <button
              class="text-sm font-semibold text-rose-500/80 hover:text-rose-400 transition-colors cursor-pointer"
            >
              <a onclick="removeHabit('${habit.id}')">Delete 🗑</a>
            </button>
          </div>
  
          <div class="grid grid-cols-7 gap-2" id="day-grid">
            <!-- Dynamic -->
          </div>
        `;
    const gridContainer = article.querySelector("#day-grid");

    dayDates.forEach((day) => {
      const isCompleted = habit.history[day.isoDate] === true;
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
      gridContainer.innerHTML += `
      <button class="${buttonClass}"
      onclick="addToHistory('${habit.id}','${day.isoDate}')" ${disabled}>
            <span
              class="text-[11px] font-bold opacity-80 uppercase tracking-wider"
              >${day.dayName}</span>
          <span class="text-sm font-extrabold mt-0.5">${day.dateNum}</span>
      </button>
    `;
    });
    habitContainer.appendChild(article);
  });
}

function addHabit(e) {
  e.preventDefault();
  const habitInput = document.getElementById("habit-input");
  const habitName = habitInput.value.trim();
  if (!habitName) return;
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
    if (habit.history[isoDate] === true) {
      doneToday += 1;
    }
  });
  console.log(doneToday);
  completedCount.innerHTML = doneToday;
  totalCount.innerHTML = habits.length;
}
localStorage.setItem("atomic-habits", JSON.stringify(habits));
habitForm.addEventListener("submit", addHabit);
renderHabitCard();
weekTracker();
