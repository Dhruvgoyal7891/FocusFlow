// FocusFlow - script.js
(function(){
  // Elements
  const taskForm = document.getElementById('taskForm');
  const titleIn = document.getElementById('title');
  const subjectIn = document.getElementById('subject');
  const deadlineIn = document.getElementById('deadline');
  const priorityIn = document.getElementById('priority');
  const notesIn = document.getElementById('notes');
  const taskList = document.getElementById('taskList');
  const taskTemplate = document.getElementById('taskTemplate');
  const progressFill = document.getElementById('progressFill');
  const progressText = document.getElementById('progressText');
  const quoteEl = document.getElementById('quote');
  const clearAllBtn = document.getElementById('clearAll');

  // Theme
  const themeToggle = document.getElementById('themeToggle');
  const root = document.documentElement;

  // Timer
  const startTimer = document.getElementById('startTimer');
  const pauseTimer = document.getElementById('pauseTimer');
  const resetTimer = document.getElementById('resetTimer');
  const timerMin = document.getElementById('timerMin');
  const timerSec = document.getElementById('timerSec');
  const sessionLength = document.getElementById('sessionLength');

  let tasks = [];
  let editingId = null;

  // Quotes array (local)
  const quotes = [
    "Focus on being productive instead of busy.",
    "Small progress is still progress.",
    "The secret of getting ahead is getting started.",
    "Discipline is choosing between what you want now and what you want most."
  ];

  function randQuote(){ return quotes[Math.floor(Math.random()*quotes.length)]; }
  quoteEl.textContent = randQuote();

  // LocalStorage handling
  function save(){
    localStorage.setItem('focusflow_tasks', JSON.stringify(tasks));
  }
  function load(){
    const raw = localStorage.getItem('focusflow_tasks');
    if(raw) tasks = JSON.parse(raw);
    render();
  }

  // Render tasks
  function render(){
    taskList.innerHTML = '';
    tasks.forEach((t, idx) => {
      const clone = taskTemplate.content.cloneNode(true);
      const li = clone.querySelector('li');
      li.dataset.id = t.id;
      clone.querySelector('.taskTitle').textContent = t.title + (t.notes ? (" — " + t.notes) : '');
      clone.querySelector('.subject').textContent = t.subject || 'General';
      clone.querySelector('.deadline').textContent = t.deadline || 'No deadline';
      const p = clone.querySelector('.priority');
      p.textContent = t.priority;
      p.setAttribute('data-priority', t.priority);

      const completeBtn = clone.querySelector('.completeBtn');
      const editBtn = clone.querySelector('.editBtn');
      const delBtn = clone.querySelector('.delBtn');

      if(t.done){ li.style.opacity = 0.6; p.style.textDecoration = 'line-through'; }

      completeBtn.addEventListener('click', ()=>{ toggleDone(t.id); });
      editBtn.addEventListener('click', ()=>{ startEdit(t.id); });
      delBtn.addEventListener('click', ()=>{ removeTask(t.id); });

      taskList.appendChild(clone);
    });
    updateProgress();
    save();
  }

  function updateProgress(){
    const total = tasks.length;
    const done = tasks.filter(t => t.done).length;
    const pct = total ? Math.round((done/total)*100) : 0;
    progressFill.style.width = pct + '%';
    progressText.textContent = done + ' / ' + total + ' tasks completed';
  }

  function addTask(data){
    const task = {
      id: 't'+Date.now(),
      title: data.title,
      subject: data.subject,
      deadline: data.deadline,
      priority: data.priority,
      notes: data.notes,
      done: false
    };
    tasks.unshift(task);
    render();
  }

  function removeTask(id){
    tasks = tasks.filter(t => t.id !== id);
    render();
  }

  function toggleDone(id){
    tasks = tasks.map(t => t.id === id ? {...t, done: !t.done} : t);
    render();
  }

  function startEdit(id){
    const t = tasks.find(x => x.id === id);
    if(!t) return;
    editingId = id;
    titleIn.value = t.title;
    subjectIn.value = t.subject;
    deadlineIn.value = t.deadline;
    priorityIn.value = t.priority;
    notesIn.value = t.notes;
    window.scrollTo({top:0, behavior:'smooth'});
  }

  taskForm.addEventListener('submit', (e)=>{
    e.preventDefault();
    const data = {
      title: titleIn.value.trim(),
      subject: subjectIn.value.trim(),
      deadline: deadlineIn.value,
      priority: priorityIn.value,
      notes: notesIn.value.trim()
    };
    if(!data.title) return alert('Please add a title');
    if(editingId){
      tasks = tasks.map(t => t.id === editingId ? {...t, ...data} : t);
      editingId = null;
    } else {
      addTask(data);
    }
    taskForm.reset();
    quoteEl.textContent = randQuote();
  });

  clearAllBtn.addEventListener('click', ()=>{
    if(confirm('Clear all tasks?')){ tasks = []; render(); localStorage.removeItem('focusflow_tasks'); }
  });

  // Theme toggle & persist
  function setTheme(isLight){
    if(isLight){
      document.body.classList.add('light');
      themeToggle.textContent = '🌞';
      localStorage.setItem('focusflow_theme','light');
    } else {
      document.body.classList.remove('light');
      themeToggle.textContent = '🌙';
      localStorage.setItem('focusflow_theme','dark');
    }
  }
  themeToggle.addEventListener('click', ()=>{
    setTheme(!document.body.classList.contains('light'));
  });
  const savedTheme = localStorage.getItem('focusflow_theme') === 'light';
  setTheme(savedTheme);

  // Simple Pomodoro
  let timer = null, remaining = 0, running = false;
  function setTimer(mins){
    remaining = mins*60;
    updateTimerDisplay();
  }
  function updateTimerDisplay(){
    const m = Math.floor(remaining/60);
    const s = remaining % 60;
    timerMin.textContent = String(m).padStart(2,'0');
    timerSec.textContent = String(s).padStart(2,'0');
  }
  function tick(){
    if(remaining <= 0){ clearInterval(timer); running=false; alert('Session finished — take a short break!'); return; }
    remaining -= 1;
    updateTimerDisplay();
  }

  startTimer.addEventListener('click', ()=>{
    if(running) return;
    setTimer(parseInt(sessionLength.value)||25);
    timer = setInterval(tick, 1000);
    running = true;
  });
  pauseTimer.addEventListener('click', ()=>{
    if(timer) clearInterval(timer);
    running = false;
  });
  resetTimer.addEventListener('click', ()=>{
    if(timer) clearInterval(timer);
    running=false;
    setTimer(parseInt(sessionLength.value)||25);
  });

  // Initialize
  setTimer(parseInt(sessionLength.value)||25);
  load();

  // Expose for console debugging (optional)
  window.FocusFlow = { tasks, render, addTask };
})();
