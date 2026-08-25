/**
 * my-first-mcp Task Dashboard
 * Browser → HTTP bridge (localhost:4000) → stdio MCP server → data/todos.json
 */

const API_BASE =
  window.__MCP_BRIDGE_URL__ || "https://my-first-mcp-cc7w.onrender.com/api";

const state = {
  tasks: [],
  filter: "all",
  search: "",
  loading: true,
  error: null,
  currentView: "dashboard",
  editingTask: null,
  deletingTask: null,
  activities: [],
};

// ── DOM helpers ──────────────────────────────────────────────

function $(id) {
  return document.getElementById(id);
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// ── Modal management ─────────────────────────────────────────

function showModal(el) {
  el.hidden = false;
  el.setAttribute("aria-hidden", "false");
}

function hideModal(el) {
  el.hidden = true;
  el.setAttribute("aria-hidden", "true");
}

// ── Toast notifications ──────────────────────────────────────

function toast(message, type = "success") {
  const container = $("toastContainer");
  const el = document.createElement("div");
  el.className = `toast ${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = "0";
    el.style.transition = "opacity 0.2s";
    setTimeout(() => el.remove(), 200);
  }, 3500);
}

// ── Activity logging ───────────────────────────────────────────

const ROUTE_TOOLS = {
  "GET /tasks": "list_tasks",
  "POST /tasks": "add_task",
  "PATCH /tasks/:id": "update_task",
  "POST /tasks/:id/complete": "complete_task",
  "DELETE /tasks/:id": "delete_task",
  "GET /tools": "tools/list",
  "GET /health": "health",
};

function routeKey(method, path) {
  const normalized = path
    .replace(/\/tasks\/[^/]+\/complete/, "/tasks/:id/complete")
    .replace(/\/tasks\/[^/?]+/, "/tasks/:id")
    .split("?")[0];
  return `${method} ${normalized}`;
}

function logActivity(method, path, detail, isError = false) {
  const tool = ROUTE_TOOLS[routeKey(method, path)] || `${method} ${path}`;
  const entry = {
    time: new Date().toLocaleTimeString([], { hour12: false, hour: "2-digit", minute: "2-digit", second: "2-digit" }),
    tool,
    detail,
    isError,
  };
  state.activities.unshift(entry);
  if (state.activities.length > 200) state.activities.length = 200;
  renderActivity();
}

function renderActivityEntry(entry) {
  return `<li class="${entry.isError ? "is-error" : ""}">
    <span class="activity-time">${entry.time}</span>
    <span class="activity-tool">${escapeHtml(entry.tool)}</span>
    <span class="activity-detail">${escapeHtml(entry.detail)}</span>
  </li>`;
}

function renderActivity() {
  const feed = $("activityFeed");
  const log = $("activityLog");
  const html = state.activities.length
    ? state.activities.slice(0, 8).map(renderActivityEntry).join("")
    : '<li class="activity-empty">No activity yet.</li>';
  const fullHtml = state.activities.length
    ? state.activities.map(renderActivityEntry).join("")
    : '<li class="activity-empty">No activity yet — actions you take will appear here.</li>';
  feed.innerHTML = html;
  log.innerHTML = fullHtml;
}

// ── Connection status ──────────────────────────────────────────

function setConnection(online) {
  const dot = $("connDot");
  const label = $("connLabel");
  dot.classList.toggle("online", online);
  dot.classList.toggle("offline", !online);
  label.textContent = online ? "Bridge connected" : "Bridge unreachable";
}

// ── API layer ──────────────────────────────────────────────────

async function api(method, path, body) {
  const start = performance.now();
  let res;
  try {
    res = await fetch(`${API_BASE}${path}`, {
      method,
      headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    setConnection(false);
    logActivity(method, path, "Network error — bridge unreachable", true);
    throw new Error("Can't reach the bridge server at " + API_BASE.replace("/api", "") + ". Is it running?");
  }

  const ms = Math.round(performance.now() - start);
  let data = null;
  const text = await res.text();
  if (text) {
    try { data = JSON.parse(text); } catch { data = { raw: text }; }
  }

  setConnection(true);

  if (!res.ok) {
    const msg = data?.error || data?.details?.join(", ") || `Request failed (${res.status})`;
    logActivity(method, path, `${msg} · ${ms}ms`, true);
    throw new Error(msg);
  }

  const summary = summarizeResponse(data);
  logActivity(method, path, `${summary} · ${ms}ms`);
  return data;
}

function summarizeResponse(data) {
  if (!data) return "ok";
  if (Array.isArray(data.items)) return `${data.items.length} task(s)`;
  if (Array.isArray(data.tools)) return `${data.tools.length} tool(s)`;
  if (data.title) return `"${data.title}"`;
  if (data.status === "ok") return "ok";
  return "ok";
}

const TaskApi = {
  list: (status) => api("GET", `/tasks${status && status !== "all" ? `?status=${status}` : "?status=all"}`),
  add: (title, description) => api("POST", "/tasks", { title, description }),
  update: (id, title, description) =>
    api("PATCH", `/tasks/${encodeURIComponent(id)}`, { title, description }),
  complete: (id) => api("POST", `/tasks/${encodeURIComponent(id)}/complete`),
  remove: (id) => api("DELETE", `/tasks/${encodeURIComponent(id)}`),
  tools: () => api("GET", "/tools"),
};

// ── Rendering ──────────────────────────────────────────────────

function computeStats() {
  const total = state.tasks.length;
  const completed = state.tasks.filter((t) => t.status === "completed").length;
  const pending = total - completed;
  const rate = total > 0 ? Math.round((completed / total) * 100) : 0;
  return { total, pending, completed, rate };
}

function renderStats() {
  const { total, pending, completed, rate } = computeStats();
  $("statTotal").textContent = total;
  $("statPending").textContent = pending;
  $("statCompleted").textContent = completed;
  $("statRate").textContent = `${rate}%`;
}

function getVisibleTasks() {
  const q = state.search.trim().toLowerCase();
  return state.tasks.filter((t) => {
    const matchStatus = state.filter === "all" || t.status === state.filter;
    const matchSearch = !q || t.title.toLowerCase().includes(q);
    return matchStatus && matchSearch;
  });
}

function renderRecentTasks() {
  const el = $("recentTasks");
  const recent = [...state.tasks].slice(-5).reverse();

  if (!recent.length) {
    el.innerHTML = '<li class="recent-empty">No tasks yet.</li>';
    return;
  }

  el.innerHTML = recent
    .map(
      (t) => `
        <li class="recent-task-row" data-id="${escapeHtml(t.id)}">
          <div class="recent-task-main">
            <span class="badge badge-${t.status}">${t.status}</span>
            <span class="recent-title">${escapeHtml(t.title)}</span>
          </div>

          <div class="recent-task-actions">
            ${
              t.status !== "completed"
                ? `<button
                    class="icon-btn"
                    data-action="complete"
                    data-id="${escapeHtml(t.id)}"
                    type="button"
                    aria-label="Complete task"
                    title="Complete"
                  >✓</button>`
                : ""
            }

            <button
              class="icon-btn"
              data-action="edit"
              data-id="${escapeHtml(t.id)}"
              type="button"
              aria-label="Edit task"
              title="Edit"
            >✎</button>

            <button
              class="icon-btn danger"
              data-action="delete"
              data-id="${escapeHtml(t.id)}"
              type="button"
              aria-label="Delete task"
              title="Delete"
            >✕</button>
          </div>
        </li>
      `,
    )
    .join("");

  el.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", handleTaskAction);
  });
}

function renderTaskList() {
  const loading = $("loadingState");
  const error = $("errorState");
  const empty = $("emptyState");
  const list = $("taskList");

  loading.hidden = !state.loading;
  error.hidden = !state.error;
  list.hidden = state.loading || !!state.error;
  empty.hidden = true;

  if (state.error) {
    $("errorMessage").textContent = state.error;
    list.innerHTML = "";
    return;
  }

  if (state.loading) {
    list.innerHTML = "";
    return;
  }

  const visible = getVisibleTasks();

  if (!visible.length) {
    empty.hidden = false;
    $("emptyMessage").textContent =
      state.tasks.length === 0
        ? "Add your first task to get started."
        : "No tasks match your search or filter.";
    list.innerHTML = "";
    return;
  }

  list.innerHTML = visible.map(renderTaskRow).join("");

  list.querySelectorAll("[data-action]").forEach((btn) => {
    btn.addEventListener("click", handleTaskAction);
  });
}

function renderTaskRow(task) {
  const done = task.status === "completed";
  return `<li class="task-row${done ? " is-completed" : ""}" data-id="${escapeHtml(task.id)}">
    <button class="task-check" data-action="complete" data-id="${escapeHtml(task.id)}" type="button"
      aria-label="${done ? "Already completed" : "Mark as completed"}"
      ${done ? "disabled" : ""}>✓</button>
    <div class="task-info">
      <div class="task-title">${escapeHtml(task.title)}</div>
      ${task.description ? `<div class="task-desc">${escapeHtml(task.description)}</div>` : ""}
      <div class="task-meta">
        <span class="task-id">#${escapeHtml(task.id)}</span>
        <span class="badge badge-${task.status}">${task.status}</span>
      </div>
    </div>
    <span class="badge badge-${task.status}">${task.status}</span>
    <div class="task-actions">
      <button class="icon-btn" data-action="edit" data-id="${escapeHtml(task.id)}" type="button" aria-label="Edit task" title="Edit">✎</button>
      <button class="icon-btn danger" data-action="delete" data-id="${escapeHtml(task.id)}" type="button" aria-label="Delete task" title="Delete">✕</button>
    </div>
  </li>`;
}

function renderAll() {
  renderStats();
  renderRecentTasks();
  if (state.currentView.startsWith("tasks") || state.currentView === "tasks") {
    renderTaskList();
  }
}

// ── Task actions ───────────────────────────────────────────────

async function loadTasks() {
  state.loading = true;
  state.error = null;
  if (state.currentView.startsWith("tasks") || state.currentView === "tasks") {
    renderTaskList();
  }
  try {
    const data = await TaskApi.list("all");
    state.tasks = data.items || [];
    state.loading = false;
    renderAll();
  } catch (err) {
    state.loading = false;
    state.error = err.message;
    renderTaskList();
    renderStats();
  }
}

function handleTaskAction(e) {
  const btn = e.currentTarget;
  const action = btn.dataset.action;
  const id = btn.dataset.id;
  const task = state.tasks.find((t) => t.id === id);
  if (!task) return;

  if (action === "complete") completeTask(task);
  else if (action === "edit") openEditModal(task);
  else if (action === "delete") openDeleteModal(task);
}

async function completeTask(task) {
  if (task.status === "completed") {
    toast("Task is already completed.", "error");
    return;
  }
  try {
    const updated = await TaskApi.complete(task.id);
    state.tasks = state.tasks.map((t) => (t.id === updated.id ? updated : t));
    renderAll();
    toast(`Completed "${updated.title}"`, "success");
  } catch (err) {
    toast(err.message, "error");
  }
}

function openAddModal() {
  state.editingTask = null;
  $("taskModalTitle").textContent = "New Task";
  $("taskModalSubmit").textContent = "Add Task";
  $("taskTitleInput").value = "";
  $("taskDescInput").value = "";
  showModal($("taskModal"));
  setTimeout(() => $("taskTitleInput").focus(), 50);
}

function openEditModal(task) {
  state.editingTask = task;
  $("taskModalTitle").textContent = "Edit Task";
  $("taskModalSubmit").textContent = "Save Changes";
  $("taskTitleInput").value = task.title;
  $("taskDescInput").value = task.description || "";
  showModal($("taskModal"));
  setTimeout(() => {
    const input = $("taskTitleInput");
    input.focus();
    input.select();
  }, 50);
}

function closeTaskModal() {
  hideModal($("taskModal"));
  state.editingTask = null;
}

async function submitTaskForm(e) {
  e.preventDefault();
  const title = $("taskTitleInput").value.trim();
  const description = $("taskDescInput").value.trim();
  if (!title) {
    toast("Title can't be empty.", "error");
    return;
  }

  const submitBtn = $("taskModalSubmit");
  submitBtn.disabled = true;

  try {
    if (state.editingTask) {
      const updated = await TaskApi.update(state.editingTask.id, title, description);
      state.tasks = state.tasks.map((t) => (t.id === updated.id ? updated : t));
      toast("Task updated.", "success");
    } else {
      const created = await TaskApi.add(title, description);
      state.tasks = [...state.tasks, created];
      toast(`Added "${created.title}"`, "success");
    }
    closeTaskModal();
    renderAll();
  } catch (err) {
    toast(err.message, "error");
  } finally {
    submitBtn.disabled = false;
  }
}

function openDeleteModal(task) {
  state.deletingTask = task;
  $("deleteModalBody").innerHTML =
    `<strong>${escapeHtml(task.title)}</strong> (#${escapeHtml(task.id)}) will be permanently removed. This cannot be undone.`;
  showModal($("deleteModal"));
  setTimeout(() => $("deleteModalConfirm").focus(), 50);
}

function closeDeleteModal() {
  hideModal($("deleteModal"));
  state.deletingTask = null;
}

async function confirmDelete() {
  if (!state.deletingTask) return;
  const { id, title } = state.deletingTask;
  const btn = $("deleteModalConfirm");
  btn.disabled = true;
  try {
    await TaskApi.remove(id);
    state.tasks = state.tasks.filter((t) => t.id !== id);
    renderAll();
    toast(`Deleted "${title}"`, "success");
  } catch (err) {
    toast(err.message, "error");
  } finally {
    btn.disabled = false;
    closeDeleteModal();
  }
}

// ── Tools page ─────────────────────────────────────────────────

async function loadTools() {
  const container = $("toolsContainer");
  container.innerHTML = '<div class="state-panel"><div class="spinner"></div><p>Loading tools…</p></div>';
  try {
    const data = await TaskApi.tools();
    const tools = data.tools || [];
    if (!tools.length) {
      container.innerHTML = '<div class="state-panel"><p class="state-body">No tools registered.</p></div>';
      return;
    }
    container.innerHTML = `<div class="tools-grid">${tools.map(renderToolCard).join("")}</div>`;
  } catch (err) {
    container.innerHTML = `<div class="state-panel state-error"><p class="state-body">${escapeHtml(err.message)}</p></div>`;
  }
}

function renderToolCard(tool) {
  const schema = tool.inputSchema
    ? JSON.stringify(tool.inputSchema, null, 2)
    : "No schema provided";
  return `<article class="tool-card">
    <div class="tool-header">
      <span class="tool-name">${escapeHtml(tool.name)}</span>
      <span class="tool-status">Active</span>
    </div>
    <p class="tool-desc">${escapeHtml(tool.description || "No description")}</p>
    <pre class="tool-schema">${escapeHtml(schema)}</pre>
  </article>`;
}

// ── Navigation ─────────────────────────────────────────────────

const VIEW_META = {
  dashboard: { title: "Dashboard", subtitle: "Overview of your MCP-backed task list." },
  "tasks-all": { title: "All Tasks", subtitle: "Every task stored in data/todos.json via list_tasks." },
  "tasks-pending": { title: "Pending Tasks", subtitle: "Tasks awaiting completion." },
  "tasks-completed": { title: "Completed Tasks", subtitle: "Tasks marked done via complete_task." },
  tools: { title: "MCP Tools", subtitle: "Live registry from the MCP server's tools/list." },
  activity: { title: "MCP Activity", subtitle: "Real tool calls made by this dashboard." },
};

function switchView(view, filter) {
  state.currentView = view;

  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.view === view);
  });

  document.querySelectorAll(".view").forEach((section) => {
    const isTaskView = view.startsWith("tasks");
    const isActive =
      section.id === `view-${view}` ||
      (isTaskView && section.id === "view-tasks");
    section.classList.toggle("is-active", isActive);
  });

  if (filter) {
    state.filter = filter;
    document.querySelectorAll(".filter-btn").forEach((btn) => {
      btn.classList.toggle("is-active", btn.dataset.status === filter);
    });
  }

  const meta = VIEW_META[view] || VIEW_META.dashboard;
  $("pageTitle").textContent = meta.title;
  $("pageSubtitle").textContent = meta.subtitle;

  if (view.startsWith("tasks")) {
    renderTaskList();
  }
  if (view === "tools") {
    loadTools();
  }
}

// ── Event wiring ───────────────────────────────────────────────

function initEvents() {
  document.querySelectorAll(".nav-item").forEach((btn) => {
    btn.addEventListener("click", () => {
      const view = btn.dataset.view;
      const filter = btn.dataset.filter || null;
      switchView(view, filter);
    });
  });

  document.querySelectorAll(".filter-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      state.filter = btn.dataset.status;
      document.querySelectorAll(".filter-btn").forEach((b) => {
        b.classList.toggle("is-active", b === btn);
      });
      renderTaskList();
    });
  });

  $("searchInput").addEventListener("input", (e) => {
    state.search = e.target.value;
    renderTaskList();
  });

  $("btnAddTask").addEventListener("click", openAddModal);
  $("taskModalClose").addEventListener("click", closeTaskModal);
  $("taskModalCancel").addEventListener("click", closeTaskModal);
  $("taskForm").addEventListener("submit", submitTaskForm);

  $("deleteModalClose").addEventListener("click", closeDeleteModal);
  $("deleteModalCancel").addEventListener("click", closeDeleteModal);
  $("deleteModalConfirm").addEventListener("click", confirmDelete);

  $("btnRetry").addEventListener("click", loadTasks);
  $("btnViewAllTasks").addEventListener("click", () => switchView("tasks-all", "all"));
  $("btnViewActivity").addEventListener("click", () => switchView("activity"));
  $("btnRefreshTools").addEventListener("click", loadTools);
  $("btnClearActivity").addEventListener("click", () => {
    state.activities = [];
    renderActivity();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      if (!$("taskModal").hidden) closeTaskModal();
      if (!$("deleteModal").hidden) closeDeleteModal();
    }
  });

  $("taskModal").addEventListener("click", (e) => {
    if (e.target === $("taskModal")) closeTaskModal();
  });
  $("deleteModal").addEventListener("click", (e) => {
    if (e.target === $("deleteModal")) closeDeleteModal();
  });
}

// ── Init ───────────────────────────────────────────────────────

initEvents();
loadTasks();
