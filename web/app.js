// Base URL of the secure bridge server (never talks to the MCP process or
// filesystem directly - only this REST surface).
const API_BASE = window.__MCP_BRIDGE_URL__ || "http://localhost:4000/api";

const state = {
  tasks: [],
  status: "all", // all | pending | completed
  search: "",
  loading: true,
  error: null,
  editingId: null,
};

let pendingDeleteId = null;

// ---------- DOM refs ----------
const els = {
  navItems: document.querySelectorAll(".nav-item"),
  views: document.querySelectorAll(".view"),
  viewTitle: document.getElementById("viewTitle"),
  viewSubtitle: document.getElementById("viewSubtitle"),

  connDot: document.getElementById("connDot"),
  connLabel: document.getElementById("connLabel"),

  statTotal: document.getElementById("statTotal"),
  statPending: document.getElementById("statPending"),
  statCompleted: document.getElementById("statCompleted"),

  searchInput: document.getElementById("searchInput"),
  filterTabs: document.querySelectorAll(".filter-tab"),

  taskList: document.getElementById("taskList"),
  loadingState: document.getElementById("loadingState"),
  emptyState: document.getElementById("emptyState"),
  emptyStateBody: document.getElementById("emptyStateBody"),
  errorState: document.getElementById("errorState"),
  errorStateBody: document.getElementById("errorStateBody"),
  retryBtn: document.getElementById("retryBtn"),

  openAddTask: document.getElementById("openAddTask"),
  taskDialogBackdrop: document.getElementById("taskDialogBackdrop"),
  taskDialogTitle: document.getElementById("taskDialogTitle"),
  taskForm: document.getElementById("taskForm"),
  taskTitleInput: document.getElementById("taskTitleInput"),
  cancelTaskDialog: document.getElementById("cancelTaskDialog"),
  submitTaskDialog: document.getElementById("submitTaskDialog"),

  deleteDialogBackdrop: document.getElementById("deleteDialogBackdrop"),
  deleteDialogBody: document.getElementById("deleteDialogBody"),
  cancelDeleteDialog: document.getElementById("cancelDeleteDialog"),
  confirmDeleteDialog: document.getElementById("confirmDeleteDialog"),

  toastRegion: document.getElementById("toastRegion"),
  activityLog: document.getElementById("activityLog"),
  toolsGrid: document.getElementById("toolsGrid"),
};

// ---------- API layer ----------
async function apiRequest(method, path, body) {
  const startedAt = performance.now();
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: body ? { "Content-Type": "application/json" } : undefined,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    logActivity(method, path, null, "network error", true);
    setConnection(false);
    throw new Error(
      "Can't reach the bridge server. Is it running on " + API_BASE + "?",
    );
  }

  const durationMs = Math.round(performance.now() - startedAt);
  let data = null;
  try {
    data = await res.json();
  } catch {
    /* no body */
  }

  setConnection(true);

  if (!res.ok) {
    const message = data?.error || `Request failed (${res.status})`;
    logActivity(method, path, `${durationMs}ms`, message, true);
    throw new Error(message);
  }

  logActivity(method, path, `${durationMs}ms`, summarize(data));
  return data;
}

function summarize(data) {
  if (!data) return "ok";
  if (Array.isArray(data.items)) return `${data.items.length} item(s)`;
  if (data.title) return `"${data.title}"`;
  if (Array.isArray(data.tools)) return `${data.tools.length} tool(s)`;
  return "ok";
}

const toolByRoute = {
  "GET /tasks": "list_tasks",
  "POST /tasks": "add_task",
  "PATCH /tasks/:id": "update_task",
  "POST /tasks/:id/complete": "complete_task",
  "DELETE /tasks/:id": "delete_task",
  "GET /tools": "tools/list",
  "GET /health": "health",
};

function routeKey(method, path) {
  const normalized = path.replace(/\/tasks\/[^/]+/, "/tasks/:id");
  return `${method} ${normalized}`;
}

function logActivity(method, path, meta, detail, isError = false) {
  const tool = toolByRoute[routeKey(method, path)] || `${method} ${path}`;
  const time = new Date().toLocaleTimeString([], {
    hour12: false,
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });

  const empty = els.activityLog.querySelector(".activity-empty");
  if (empty) empty.remove();

  const li = document.createElement("li");
  if (isError) li.classList.add("is-error");
  li.innerHTML = `
    <span class="activity-time">${time}</span>
    <span class="activity-tool">${tool}</span>
    <span class="activity-detail">${escapeHtml(detail || "")}${meta ? ` · ${meta}` : ""}</span>
  `;
  els.activityLog.appendChild(li);

  // Cap log length for memory/perf.
  while (els.activityLog.children.length > 200) {
    els.activityLog.removeChild(els.activityLog.firstChild);
  }
}

function setConnection(online) {
  els.connDot.classList.toggle("is-online", online);
  els.connDot.classList.toggle("is-offline", !online);
  els.connLabel.textContent = online ? "Bridge connected" : "Bridge unreachable";
}

// ---------- Task API calls ----------
const TaskApi = {
  list: (status) =>
    apiRequest("GET", `/tasks${status && status !== "all" ? `?status=${status}` : "?status=all"}`),
  add: (title) => apiRequest("POST", "/tasks", { title }),
  update: (id, title) => apiRequest("PATCH", `/tasks/${encodeURIComponent(id)}`, { title }),
  complete: (id) => apiRequest("POST", `/tasks/${encodeURIComponent(id)}/complete`),
  remove: (id) => apiRequest("DELETE", `/tasks/${encodeURIComponent(id)}`),
  tools: () => apiRequest("GET", "/tools"),
};

// ---------- Rendering ----------
function render() {
  renderStats();
  renderTaskList();
}

function renderStats() {
  const total = state.tasks.length;
  const completed = state.tasks.filter((t) => t.status === "completed").length;
  els.statTotal.textContent = total;
  els.statPending.textContent = total - completed;
  els.statCompleted.textContent = completed;
}

function getVisibleTasks() {
  const q = state.search.trim().toLowerCase();
  return state.tasks.filter((t) => {
    const matchesStatus = state.status === "all" || t.status === state.status;
    const matchesSearch = !q || t.title.toLowerCase().includes(q);
    return matchesStatus && matchesSearch;
  });
}

function renderTaskList() {
  els.loadingState.hidden = !state.loading;
  els.errorState.hidden = !state.error;
  els.taskList.hidden = state.loading || !!state.error;

  if (state.error) {
    els.errorStateBody.textContent = state.error;
  }

  if (state.loading || state.error) {
    els.emptyState.hidden = true;
    els.taskList.innerHTML = "";
    return;
  }

  const visible = getVisibleTasks();

  els.emptyState.hidden = visible.length !== 0;
  if (visible.length === 0) {
    els.emptyStateBody.textContent =
      state.tasks.length === 0
        ? "Add your first task to get started."
        : "No tasks match your search or filter.";
  }

  els.taskList.innerHTML = "";
  for (const task of visible) {
    els.taskList.appendChild(renderTaskCard(task));
  }
}

function renderTaskCard(task) {
  const li = document.createElement("li");
  li.className = "task-card" + (task.status === "completed" ? " is-completed" : "");
  li.dataset.id = task.id;

  if (state.editingId === task.id) {
    li.innerHTML = `
      <span class="task-check" aria-hidden="true"></span>
      <div class="task-edit-row">
        <input type="text" class="edit-title-input" maxlength="200" value="${escapeAttr(task.title)}" aria-label="Edit task title" />
        <button class="btn btn-primary btn-save-edit" type="button">Save</button>
        <button class="btn btn-secondary btn-cancel-edit" type="button">Cancel</button>
      </div>
    `;
    const input = li.querySelector(".edit-title-input");
    li.querySelector(".btn-save-edit").addEventListener("click", () => submitEdit(task.id, input.value));
    li.querySelector(".btn-cancel-edit").addEventListener("click", () => {
      state.editingId = null;
      renderTaskList();
    });
    input.addEventListener("keydown", (e) => {
      if (e.key === "Enter") submitEdit(task.id, input.value);
      if (e.key === "Escape") {
        state.editingId = null;
        renderTaskList();
      }
    });
    queueMicrotask(() => input.focus());
    return li;
  }

  li.innerHTML = `
    <button class="task-check" aria-pressed="${task.status === "completed"}" aria-label="${task.status === "completed" ? "Mark as pending" : "Mark as completed"}">✓</button>
    <div class="task-body">
      <div class="task-title">${escapeHtml(task.title)}</div>
      <div class="task-meta">
        <span class="task-id">#${escapeHtml(task.id)}</span>
        <span class="task-badge ${task.status}">${task.status}</span>
      </div>
    </div>
    <div class="task-actions">
      <button class="icon-btn btn-edit" title="Edit" aria-label="Edit task">✎</button>
      <button class="icon-btn danger btn-delete" title="Delete" aria-label="Delete task">✕</button>
    </div>
  `;

  li.querySelector(".task-check").addEventListener("click", () => toggleComplete(task));
  li.querySelector(".btn-edit").addEventListener("click", () => {
    state.editingId = task.id;
    renderTaskList();
  });
  li.querySelector(".btn-delete").addEventListener("click", () => openDeleteDialog(task));

  return li;
}

// ---------- Actions ----------
async function loadTasks() {
  state.loading = true;
  state.error = null;
  renderTaskList();
  try {
    const data = await TaskApi.list("all");
    state.tasks = data.items;
    state.loading = false;
    render();
  } catch (err) {
    state.loading = false;
    state.error = err.message;
    renderTaskList();
  }
}

async function toggleComplete(task) {
  if (task.status === "completed") {
    // Reverting completion isn't one of the 5 tools; complete_task is
    // one-directional by design, so we surface that rather than fake it.
    showToast("Tasks can be completed but not reopened (no such MCP tool).", "error");
    return;
  }
  try {
    const updated = await TaskApi.complete(task.id);
    state.tasks = state.tasks.map((t) => (t.id === updated.id ? updated : t));
    render();
    showToast(`Marked "${updated.title}" as completed`, "success");
  } catch (err) {
    showToast(err.message, "error");
  }
}

async function submitEdit(id, rawTitle) {
  const title = rawTitle.trim();
  if (!title) {
    showToast("Title can't be empty", "error");
    return;
  }
  try {
    const updated = await TaskApi.update(id, title);
    state.tasks = state.tasks.map((t) => (t.id === updated.id ? updated : t));
    state.editingId = null;
    render();
    showToast("Task updated", "success");
  } catch (err) {
    showToast(err.message, "error");
  }
}

function openDeleteDialog(task) {
  pendingDeleteId = task.id;
  els.deleteDialogBody.textContent = `"${task.title}" (#${task.id}) will be permanently removed. This can't be undone.`;
  els.deleteDialogBackdrop.hidden = false;
  els.confirmDeleteDialog.focus();
}

function closeDeleteDialog() {
  pendingDeleteId = null;
  els.deleteDialogBackdrop.hidden = true;
}

async function confirmDelete() {
  if (!pendingDeleteId) return;
  const id = pendingDeleteId;
  els.confirmDeleteDialog.disabled = true;
  try {
    await TaskApi.remove(id);
    state.tasks = state.tasks.filter((t) => t.id !== id);
    render();
    showToast("Task deleted", "success");
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    els.confirmDeleteDialog.disabled = false;
    closeDeleteDialog();
  }
}

function openAddDialog() {
  els.taskDialogTitle.textContent = "New task";
  els.submitTaskDialog.textContent = "Add task";
  els.taskTitleInput.value = "";
  els.taskDialogBackdrop.hidden = false;
  els.taskTitleInput.focus();
}

function closeAddDialog() {
  els.taskDialogBackdrop.hidden = true;
}

async function submitAddTask(e) {
  e.preventDefault();
  const title = els.taskTitleInput.value.trim();
  if (!title) {
    showToast("Title can't be empty", "error");
    return;
  }
  els.submitTaskDialog.disabled = true;
  try {
    const task = await TaskApi.add(title);
    state.tasks = [...state.tasks, task];
    render();
    closeAddDialog();
    showToast(`Added "${task.title}"`, "success");
  } catch (err) {
    showToast(err.message, "error");
  } finally {
    els.submitTaskDialog.disabled = false;
  }
}

// ---------- Toasts ----------
function showToast(message, kind = "success") {
  const toast = document.createElement("div");
  toast.className = `toast toast-${kind}`;
  toast.textContent = message;
  els.toastRegion.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = "0";
    toast.style.transition = "opacity 0.2s ease";
    setTimeout(() => toast.remove(), 200);
  }, 3200);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}
function escapeAttr(str) {
  return escapeHtml(str).replace(/"/g, "&quot;");
}

// ---------- Views / nav ----------
function switchView(view) {
  els.navItems.forEach((btn) => {
    const active = btn.dataset.view === view;
    btn.classList.toggle("is-active", active);
    btn.setAttribute("aria-selected", String(active));
  });
  els.views.forEach((section) => {
    section.classList.toggle("is-active", section.id === `view-${view}`);
  });

  const titles = {
    dashboard: ["Dashboard", "Every action here calls a real MCP tool over the bridge."],
    activity: ["MCP Activity", "A live log of tool calls made by this dashboard."],
    tools: ["Registered Tools", "Live from the MCP server's tools/list response."],
  };
  els.viewTitle.textContent = titles[view][0];
  els.viewSubtitle.textContent = titles[view][1];

  if (view === "tools") loadTools();
}

let toolsLoaded = false;
async function loadTools() {
  if (toolsLoaded) return;
  try {
    const data = await TaskApi.tools();
    toolsLoaded = true;
    els.toolsGrid.innerHTML = data.tools
      .map(
        (t) => `
        <div class="tool-card">
          <div class="tool-name">${escapeHtml(t.name)}</div>
          <p class="tool-desc">${escapeHtml(t.description || "")}</p>
        </div>`,
      )
      .join("");
  } catch (err) {
    els.toolsGrid.innerHTML = `<p class="state-body">Couldn't load tool registry: ${escapeHtml(err.message)}</p>`;
  }
}

// ---------- Wire up events ----------
els.navItems.forEach((btn) => btn.addEventListener("click", () => switchView(btn.dataset.view)));

els.filterTabs.forEach((tab) =>
  tab.addEventListener("click", () => {
    state.status = tab.dataset.status;
    els.filterTabs.forEach((t) => {
      t.classList.toggle("is-active", t === tab);
      t.setAttribute("aria-selected", String(t === tab));
    });
    renderTaskList();
  }),
);

els.searchInput.addEventListener("input", (e) => {
  state.search = e.target.value;
  renderTaskList();
});

els.openAddTask.addEventListener("click", openAddDialog);
els.cancelTaskDialog.addEventListener("click", closeAddDialog);
els.taskForm.addEventListener("submit", submitAddTask);
els.taskDialogBackdrop.addEventListener("click", (e) => {
  if (e.target === els.taskDialogBackdrop) closeAddDialog();
});

els.cancelDeleteDialog.addEventListener("click", closeDeleteDialog);
els.confirmDeleteDialog.addEventListener("click", confirmDelete);
els.deleteDialogBackdrop.addEventListener("click", (e) => {
  if (e.target === els.deleteDialogBackdrop) closeDeleteDialog();
});

document.addEventListener("keydown", (e) => {
  if (e.key === "Escape") {
    if (!els.taskDialogBackdrop.hidden) closeAddDialog();
    if (!els.deleteDialogBackdrop.hidden) closeDeleteDialog();
  }
});

els.retryBtn.addEventListener("click", loadTasks);

// ---------- Init ----------
loadTasks();
