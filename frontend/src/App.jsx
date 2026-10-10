
import { useEffect, useMemo, useState } from "react";
import {
  Activity,
  ArrowDownRight,
  ArrowUpRight,
  Check,
  CheckCircle2,
  Circle,
  Clock3,
  Code2,
  Command,
  Container,
  Ellipsis,
  LayoutDashboard,
  ListTodo,
  Plus,
  Search,
  Server,
  ShieldCheck,
  Trash2,
  X,
  Zap,
} from "lucide-react";
import "./App.css";

const API_URL = "http://localhost:3000/api";

function StatCard({ icon: Icon, label, value, subtitle, trend, tone }) {
  return (
    <article className="stat-card">
      <div className="stat-top">
        <span className={`stat-icon ${tone}`}>
          <Icon size={20} />
        </span>
        <span
          className={`trend ${
            trend === "Up" ? "trend-up" : "trend-neutral"
          }`}
        >
          {trend === "Up" ? (
            <ArrowUpRight size={14} />
          ) : (
            <ArrowDownRight size={14} />
          )}
          {subtitle}
        </span>
      </div>
      <p className="stat-label">{label}</p>
      <div className="stat-bottom">
        <h2>{value.toString().padStart(2, "0")}</h2>
      </div>
    </article>
  );
}

function App() {
  const [tasks, setTasks] = useState([]);
  const [newTask, setNewTask] = useState("");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("All tasks");
  const [notice, setNotice] = useState("");
  const [apiError, setApiError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Fetch tasks from Express.
  async function loadTasks(showLoading = true) {
    if (showLoading) {
      setLoading(true);
    }

    setApiError("");

    try {
      const response = await fetch(`${API_URL}/tasks`);
      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to load tasks.");
      }

      setTasks(result.data);
    } catch (error) {
      setApiError(
        error.message || "Unable to connect to the ContainerHub backend."
      );
    } finally {
      setLoading(false);
    }
  }

  // Load tasks when the dashboard opens.
  useEffect(() => {
    loadTasks();
  }, []);

  const completed = tasks.filter((task) => task.completed).length;
  const pending = tasks.length - completed;

  const visibleTasks = useMemo(() => {
    return tasks.filter((task) => {
      const matchesSearch = task.title
        .toLowerCase()
        .includes(search.toLowerCase());

      const matchesFilter =
        filter === "All tasks" ||
        (filter === "Completed" && task.completed) ||
        (filter === "Pending" && !task.completed);

      return matchesSearch && matchesFilter;
    });
  }, [tasks, search, filter]);

  // Create a task using POST.
  async function addTask(event) {
    event.preventDefault();

    const title = newTask.trim();

    if (!title) {
      setNotice("Enter a task name first.");
      return;
    }

    setSaving(true);
    setNotice("");
    setApiError("");

    try {
      const response = await fetch(`${API_URL}/tasks`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          category: "General",
          priority: "Medium",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to add task.");
      }

      setNewTask("");
      setNotice("Task added successfully.");

      await loadTasks(false);
    } catch (error) {
      setApiError(error.message || "Unable to add task.");
    } finally {
      setSaving(false);
    }
  }

  // Complete or reopen a task using PUT.
  async function toggleTask(id) {
    const task = tasks.find((item) => item.id === id);

    if (!task) return;

    setSaving(true);
    setNotice("");
    setApiError("");

    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          completed: !task.completed,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to update task.");
      }

      setNotice("Task status updated successfully.");

      await loadTasks(false);
    } catch (error) {
      setApiError(error.message || "Unable to update task.");
    } finally {
      setSaving(false);
    }
  }

  // Delete a task using DELETE.
  async function deleteTask(id) {
    setSaving(true);
    setNotice("");
    setApiError("");

    try {
      const response = await fetch(`${API_URL}/tasks/${id}`, {
        method: "DELETE",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Unable to delete task.");
      }

      setNotice("Task deleted successfully.");

      await loadTasks(false);
    } catch (error) {
      setApiError(error.message || "Unable to delete task.");
    } finally {
      setSaving(false);
    }
  }

  const progress = tasks.length
    ? Math.round((completed / tasks.length) * 100)
    : 0;

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <a
          className="brand"
          href="#dashboard"
          aria-label="ContainerHub home"
        >
          <span className="brand-mark">
            <Container size={23} strokeWidth={2.2} />
          </span>
          <span className="brand-copy">
            <strong>ContainerHub</strong>
            <small>WORKSPACE</small>
          </span>
        </a>

        <div className="sidebar-label">WORKSPACE</div>

        <nav className="side-nav" aria-label="Main navigation">
          <a className="nav-item active" href="#dashboard">
            <LayoutDashboard size={18} />
            <span>Dashboard</span>
          </a>

          <a className="nav-item" href="#tasks">
            <ListTodo size={18} />
            <span>My tasks</span>
            <span className="nav-count">{pending}</span>
          </a>

          <a
            className="nav-item"
            href="#application-status"
            onClick={() => setNotice("Viewing application status.")}
          >
            <Activity size={18} />
            <span>System status</span>
          </a>
        </nav>

        <div className="sidebar-label projects-label">YOUR PROJECT</div>

        <div className="project-chip">
          <span className="project-dot" />
          <span>ContainerHub MVP</span>
          <Ellipsis size={17} className="project-more" />
        </div>

        <div className="sidebar-spacer" />

        <div className="sidebar-tip">
          <div className="tip-icon">
            <Zap size={17} />
          </div>
          <strong>Keep making progress</strong>
          <p>Small tasks. Consistent progress. Better delivery.</p>

          <div className="tip-progress">
            <span style={{ width: `${progress}%` }} />
          </div>

          <small>{progress}% of tasks completed</small>
        </div>

        <div className="profile">
          <div className="avatar">CH</div>
          <div className="profile-info">
            <strong>Workspace Owner</strong>
            <small>Local workspace</small>
          </div>
          <Ellipsis size={18} className="profile-more" />
        </div>
      </aside>

      <main className="main-content" id="dashboard">
        <header className="topbar">
          <div className="breadcrumbs">
            <span>Workspace</span>
            <span className="breadcrumb-slash">/</span>
            <strong>Dashboard</strong>
          </div>

          <div className="topbar-right">
            <span className="environment-tag">
              <span className="environment-dot" />
              Development
            </span>
            <span className="version-tag">v1.0.0</span>
            <div className="top-avatar">CH</div>
          </div>
        </header>

        <div className="dashboard-content">
          <section className="welcome-section">
            <div>
              <div className="eyebrow">
                <span className="eyebrow-line" />
                YOUR WORKSPACE AT A GLANCE
              </div>

              <h1>Good work starts here.</h1>

              <p className="welcome-description">
                Organize your priorities, track progress, and keep your
                projects moving forward.
              </p>
            </div>

            <div className="welcome-status">
              <span className="status-check">
                <CheckCircle2 size={17} />
              </span>
              <div>
                <strong>Workspace ready</strong>
                <small>ContainerHub v1.0.0</small>
              </div>
            </div>
          </section>

          <section className="stats-grid" aria-label="Task statistics">
            <StatCard
              icon={ListTodo}
              label="Total tasks"
              value={tasks.length}
              subtitle="All tasks"
              tone="blue"
            />

            <StatCard
              icon={CheckCircle2}
              label="Completed"
              value={completed}
              subtitle="Done"
              trend="Up"
              tone="green"
            />

            <StatCard
              icon={Clock3}
              label="Pending"
              value={pending}
              subtitle="Remaining"
              tone="orange"
            />
          </section>

          <section className="content-grid">
            <article className="panel tasks-panel" id="tasks">
              <div className="panel-heading">
                <div>
                  <div className="heading-title">
                    <h2>My tasks</h2>
                    <span className="task-count">{tasks.length}</span>
                  </div>
                  <p>Manage your work, one task at a time.</p>
                </div>

                <span className="panel-icon">
                  <ListTodo size={19} />
                </span>
              </div>

              <form className="add-task-form" onSubmit={addTask}>
                <div className="add-input-wrap">
                  <Plus size={18} />

                  <input
                    type="text"
                    value={newTask}
                    onChange={(event) => setNewTask(event.target.value)}
                    placeholder="What needs to get done?"
                    aria-label="New task name"
                    maxLength={160}
                    disabled={saving}
                  />

                  {newTask && (
                    <button
                      className="clear-input"
                      type="button"
                      onClick={() => setNewTask("")}
                      aria-label="Clear input"
                    >
                      <X size={15} />
                    </button>
                  )}
                </div>

                <button
                  className="add-button"
                  type="submit"
                  disabled={saving || loading}
                >
                  <Plus size={17} />
                  {saving ? "Saving..." : "Add task"}
                </button>
              </form>

              <div className="task-toolbar">
                <div className="filter-tabs" aria-label="Filter tasks">
                  {["All tasks", "Pending", "Completed"].map((item) => (
                    <button
                      key={item}
                      type="button"
                      className={`filter-tab ${
                        filter === item ? "selected" : ""
                      }`}
                      onClick={() => setFilter(item)}
                    >
                      {item}
                    </button>
                  ))}
                </div>

                <label className="search-box">
                  <Search size={16} />
                  <input
                    type="search"
                    placeholder="Search tasks"
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    aria-label="Search tasks"
                  />
                </label>
              </div>

              <div className="task-list">
                {loading ? (
                  <div className="empty-state">
                    <strong>Loading tasks...</strong>
                    <p>Connecting to the ContainerHub backend.</p>
                  </div>
                ) : apiError ? (
                  <div className="empty-state" role="alert">
                    <span>
                      <Server size={24} />
                    </span>
                    <strong>Backend connection issue</strong>
                    <p>{apiError}</p>
                    <button
                      type="button"
                      className="add-button"
                      onClick={() => loadTasks()}
                    >
                      Retry connection
                    </button>
                  </div>
                ) : visibleTasks.length > 0 ? (
                  visibleTasks.map((task) => (
                    <div className="task-row" key={task.id}>
                      <button
                        className={`task-check ${
                          task.completed ? "checked" : ""
                        }`}
                        type="button"
                        disabled={saving}
                        onClick={() => toggleTask(task.id)}
                        aria-label={
                          task.completed
                            ? `Mark ${task.title} as pending`
                            : `Complete ${task.title}`
                        }
                      >
                        {task.completed ? (
                          <Check size={14} />
                        ) : (
                          <Circle size={19} />
                        )}
                      </button>

                      <div className="task-main">
                        <span
                          className={`task-title ${
                            task.completed ? "completed-title" : ""
                          }`}
                        >
                          {task.title}
                        </span>

                        <div className="task-meta">
                          <span className="category-label">
                            {task.category}
                          </span>

                          <span
                            className={`priority priority-${(
                              task.priority || "Medium"
                            ).toLowerCase()}`}
                          >
                            <span />
                            {task.priority || "Medium"}
                          </span>
                        </div>
                      </div>

                      <span
                        className={`task-status ${
                          task.completed
                            ? "status-completed"
                            : "status-pending"
                        }`}
                      >
                        {task.completed ? "Completed" : "Pending"}
                      </span>

                      <button
                        className="delete-button"
                        type="button"
                        disabled={saving}
                        onClick={() => deleteTask(task.id)}
                        aria-label={`Delete ${task.title}`}
                        title="Delete task"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="empty-state">
                    <span>
                      <ListTodo size={24} />
                    </span>
                    <strong>No tasks found</strong>
                    <p>Try a different search or add a new task.</p>
                  </div>
                )}
              </div>

              <div className="task-footer">
                <span>
                  <span className="footer-dot" />
                  {pending} task{pending === 1 ? "" : "s"} remaining
                </span>
                <span>
                  {completed} of {tasks.length} completed
                </span>
              </div>

              {apiError && !loading && (
                <div className="notice error-notice" role="alert">
                  <span>{apiError}</span>
                  <button
                    type="button"
                    onClick={() => loadTasks()}
                    aria-label="Retry loading tasks"
                  >
                    Retry
                  </button>
                </div>
              )}

              {notice && (
                <div className="notice" role="status">
                  <span>{notice}</span>
                  <button
                    type="button"
                    onClick={() => setNotice("")}
                    aria-label="Dismiss notification"
                  >
                    <X size={14} />
                  </button>
                </div>
              )}
            </article>

            <div className="right-column">
              <article className="panel progress-panel">
                <div className="panel-heading">
                  <div>
                    <h2>Task progress</h2>
                    <p>Your current completion rate.</p>
                  </div>

                  <span className="panel-icon green-icon">
                    <Activity size={18} />
                  </span>
                </div>

                <div className="progress-display">
                  <div
                    className="progress-ring"
                    style={{
                      "--progress-angle": `${progress * 3.6}deg`,
                    }}
                  >
                    <div className="progress-ring-inner">
                      <strong>{progress}%</strong>
                      <span>Completed</span>
                    </div>
                  </div>
                </div>

                <div className="progress-legend">
                  <div>
                    <span className="legend-dot green-dot" />
                    <span>Completed</span>
                    <strong>{completed}</strong>
                  </div>

                  <div>
                    <span className="legend-dot orange-dot" />
                    <span>Pending</span>
                    <strong>{pending}</strong>
                  </div>
                </div>
              </article>

              <article
                className="panel status-panel"
                id="application-status"
              >
                <div className="panel-heading">
                  <div>
                    <h2>Application status</h2>
                    <p>Runtime information</p>
                  </div>

                  <span className="panel-icon">
                    <Server size={18} />
                  </span>
                </div>

                <div className="app-status-banner">
                  <span className="running-pulse" />

                  <div>
                    <strong>ContainerHub</strong>
                    <small>
                      {apiError
                        ? "Backend connection unavailable"
                        : loading
                          ? "Checking backend connection..."
                          : "Connected to Express API"}
                    </small>
                  </div>

                  <span className="healthy-badge">
                    {apiError ? "Offline" : loading ? "Checking" : "Healthy"}
                  </span>
                </div>

                <div className="status-details">
                  <div>
                    <span>Version</span>
                    <strong>v1.0.0</strong>
                  </div>

                  <div>
                    <span>Environment</span>
                    <strong>Development</strong>
                  </div>

                  <div>
                    <span>Container</span>
                    <strong className="not-deployed">Not deployed</strong>
                  </div>

                  <div>
                    <span>Port</span>
                    <strong>3000</strong>
                  </div>
                </div>

                <div className="status-note">
                  <ShieldCheck size={16} />
                  <span>
                    Local development · AWS deployment pending
                  </span>
                </div>
              </article>
            </div>
          </section>

          <footer className="dashboard-footer">
            <div className="footer-brand">
              <Command size={15} />
              <span>ContainerHub</span>
              <span className="footer-separator">/</span>
              <span>Task workspace</span>
            </div>

            <div className="footer-right">
              <span>
                <Code2 size={14} />
                Built for better workflows
              </span>
              <span className="footer-version">v1.0.0</span>
            </div>
          </footer>
        </div>
      </main>
    </div>
  );
}

export default App;
