
import { useCallback, useEffect, useState } from "react";
import axios from "axios";
import "./App.css";

const API_URL = "http://localhost:5000/api/employees";

const emptyForm = {
  name: "",
  department: "",
  role: "",
  salary: "",
  joinDate: "",
};

const currency = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

function formatDate(date) {
  if (!date) return "—";

  const parsed = new Date(date);
  if (Number.isNaN(parsed.getTime())) return "—";

  return parsed.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
}

function getErrorMessage(error) {
  return (
    error.response?.data?.message ||
    error.response?.data?.error ||
    error.message ||
    "Something went wrong. Please try again."
  );
}

export default function App() {
  const [employees, setEmployees] = useState([]);
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [search, setSearch] = useState("");
  const [sortBy, setSortBy] = useState("name");
  const [order, setOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const fetchEmployees = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const response = await axios.get(API_URL, {
        params: {
          search: search.trim(),
          sortBy,
          order,
        },
      });

      const data = response.data;
      setEmployees(Array.isArray(data) ? data : data.employees || []);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [search, sortBy, order]);

  useEffect(() => {
    const timeout = setTimeout(fetchEmployees, 250);
    return () => clearTimeout(timeout);
  }, [fetchEmployees]);

  useEffect(() => {
    if (!message) return;

    const timeout = setTimeout(() => setMessage(""), 3500);
    return () => clearTimeout(timeout);
  }, [message]);

  const departments = new Set(
    employees.map((employee) => employee.department).filter(Boolean)
  );

  const totalSalary = employees.reduce(
    (sum, employee) => sum + (Number(employee.salary) || 0),
    0
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  }

  function resetForm() {
    setForm(emptyForm);
    setEditingId(null);
  }

  function goToForm() {
    resetForm();
    setMessage("");
    setError("");

    document.getElementById("employee-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setMessage("");
    setError("");

    if (
      !form.name.trim() ||
      !form.department.trim() ||
      !form.role.trim() ||
      !form.joinDate ||
      form.salary === ""
    ) {
      setError("Please complete all required fields.");
      return;
    }

    const salary = Number(form.salary);

    if (!Number.isFinite(salary) || salary < 0) {
      setError("Enter a valid, non-negative salary.");
      return;
    }

    setSaving(true);

    const payload = {
      name: form.name.trim(),
      department: form.department.trim(),
      role: form.role.trim(),
      salary,
      joinDate: form.joinDate,
    };

    try {
      if (editingId) {
        await axios.put(`${API_URL}/${editingId}`, payload);
        setMessage("Employee updated successfully.");
      } else {
        await axios.post(API_URL, payload);
        setMessage("Employee added successfully.");
      }

      resetForm();
      await fetchEmployees();
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setSaving(false);
    }
  }

  function handleEdit(employee) {
    setEditingId(employee._id);

    setForm({
      name: employee.name || "",
      department: employee.department || "",
      role: employee.role || "",
      salary: String(employee.salary ?? ""),
      joinDate: employee.joinDate
        ? new Date(employee.joinDate).toISOString().slice(0, 10)
        : "",
    });

    setMessage("");
    setError("");

    document.getElementById("employee-form")?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }

  async function handleDelete(employee) {
    const confirmed = window.confirm(
      `Delete ${employee.name}? This action cannot be undone.`
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      await axios.delete(`${API_URL}/${employee._id}`);
      setMessage(`${employee.name} was deleted.`);

      if (editingId === employee._id) resetForm();

      await fetchEmployees();
    } catch (err) {
      setError(getErrorMessage(err));
    }
  }

  function toggleSort(field) {
    if (sortBy === field) {
      setOrder((current) => (current === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(field);
      setOrder("asc");
    }
  }

  function initials(name = "?") {
    return name
      .trim()
      .split(/\s+/)
      .slice(0, 2)
      .map((part) => part[0])
      .join("")
      .toUpperCase();
  }

  return (
    <div className="app-shell">
      {/* LEFT SIDEBAR */}
      <aside className="sidebar">
        <a className="brand" href="#dashboard">
          <span className="brand-mark">S</span>
          <span>
            <strong>StaffSync</strong>
            <small>People management</small>
          </span>
        </a>

        <p className="sidebar-label">WORKSPACE</p>

        <nav className="sidebar-nav" aria-label="Main navigation">
          <a className="sidebar-link active" href="#dashboard">
            <span className="nav-icon">▦</span>
            <span>Dashboard</span>
          </a>

          <a className="sidebar-link" href="#employee-directory">
            <span className="nav-icon">♙</span>
            <span>Employees</span>
          </a>

          <button className="sidebar-link" onClick={goToForm}>
            <span className="nav-icon">＋</span>
            <span>Add Employee</span>
          </button>

          <a className="sidebar-link" href="#settings">
            <span className="nav-icon">⚙</span>
            <span>Settings</span>
          </a>
        </nav>

        <div className="sidebar-bottom" id="settings">
          <div className="sidebar-help-icon">✦</div>
          <strong>Better teams, better work.</strong>
          <p>
            Keep employee information organized with StaffSync.
          </p>
          <div className="sidebar-status">
            <span className="live-dot" />
            Employee workspace
          </div>
          <small>StaffSync © {new Date().getFullYear()}</small>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <div className="main-area">
        <header className="topbar">
          <div className="topbar-title">
            <span className="topbar-title-icon">▦</span>
            Employee Management
          </div>

          <div className="topbar-right">
            <span className="live-indicator">
              <span className="live-dot" />
              Workspace
            </span>
            <div className="profile-avatar">SF</div>
          </div>
        </header>

        <main className="page-content" id="dashboard">
          <section className="welcome-row">
            <div>
              <p className="eyebrow">PEOPLE OPERATIONS</p>
              <h1>Employee overview</h1>
              <p className="welcome-subtitle">
                Manage your team, organize employee records, and keep
                everything in one place.
              </p>
            </div>

            <button className="button button-primary" onClick={goToForm}>
              <span aria-hidden="true">＋</span>
              Add employee
            </button>
          </section>

          {message && (
            <div className="alert alert-success" role="status">
              <span>✓</span>
              {message}
              <button
                onClick={() => setMessage("")}
                aria-label="Dismiss message"
              >
                ×
              </button>
            </div>
          )}

          {error && (
            <div className="alert alert-error" role="alert">
              <span>!</span>
              {error}
              <button
                onClick={() => setError("")}
                aria-label="Dismiss error"
              >
                ×
              </button>
            </div>
          )}

          {/* DASHBOARD STATISTICS */}
          <section className="stats-grid" aria-label="Employee statistics">
            <article className="stat-card">
              <div className="stat-icon stat-icon-purple">♙</div>
              <div>
                <p>Total employees</p>
                <h2>{loading ? "—" : employees.length}</h2>
                <span className="stat-note">Employees in current view</span>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-icon stat-icon-green">▦</div>
              <div>
                <p>Departments</p>
                <h2>{loading ? "—" : departments.size}</h2>
                <span className="stat-note">Distinct departments in view</span>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-icon stat-icon-orange">₹</div>
              <div>
                <p>Total monthly salary</p>
                <h2 className="salary-stat">
                  {loading ? "—" : currency.format(totalSalary)}
                </h2>
                <span className="stat-note">Based on current results</span>
              </div>
            </article>

            <article className="stat-card">
              <div className="stat-icon stat-icon-blue">↻</div>
              <div>
                <p>Data status</p>
                <h2 className="status-heading">
                  {loading ? "Loading" : error ? "Check API" : "Connected"}
                </h2>
                <span className="stat-note">Employee service</span>
              </div>
            </article>
          </section>

          {/* EMPLOYEE TABLE AND FORM */}
          <section className="workspace-grid">
            <section
              className="panel directory-panel"
              id="employee-directory"
            >
              <div className="panel-heading">
                <div>
                  <p className="eyebrow">YOUR TEAM</p>
                  <h2>Employee directory</h2>
                  <p className="panel-description">
                    Search, review, and manage employee records.
                  </p>
                </div>

                <span className="record-count">
                  {employees.length}{" "}
                  {employees.length === 1 ? "record" : "records"}
                </span>
              </div>

              <div className="toolbar">
                <label className="search-box">
                  <span aria-hidden="true">⌕</span>
                  <input
                    type="search"
                    placeholder="Search name, department, or role..."
                    value={search}
                    onChange={(event) => setSearch(event.target.value)}
                    aria-label="Search employees"
                  />

                  {search && (
                    <button
                      className="clear-search"
                      type="button"
                      onClick={() => setSearch("")}
                      aria-label="Clear search"
                    >
                      ×
                    </button>
                  )}
                </label>

                <label className="sort-control">
                  <span>Sort</span>
                  <select
                    value={sortBy}
                    onChange={(event) => setSortBy(event.target.value)}
                  >
                    <option value="name">Name</option>
                    <option value="department">Department</option>
                    <option value="salary">Salary</option>
                    <option value="joinDate">Joining date</option>
                  </select>
                </label>

                <button
                  className="button button-secondary sort-direction"
                  onClick={() =>
                    setOrder((current) =>
                      current === "asc" ? "desc" : "asc"
                    )
                  }
                  aria-label={`Change sort order, currently ${order}`}
                  title={`Current order: ${order}`}
                >
                  {order === "asc" ? "↑" : "↓"}
                </button>
              </div>

              <div className="table-wrap">
                <table className="employee-table">
                  <thead>
                    <tr>
                      <th>
                        <button
                          className="th-sort"
                          onClick={() => toggleSort("name")}
                        >
                          Employee{" "}
                          {sortBy === "name"
                            ? order === "asc"
                              ? "↑"
                              : "↓"
                            : ""}
                        </button>
                      </th>

                      <th>
                        <button
                          className="th-sort"
                          onClick={() => toggleSort("department")}
                        >
                          Department / Role{" "}
                          {sortBy === "department"
                            ? order === "asc"
                              ? "↑"
                              : "↓"
                            : ""}
                        </button>
                      </th>

                      <th>
                        <button
                          className="th-sort"
                          onClick={() => toggleSort("salary")}
                        >
                          Monthly salary{" "}
                          {sortBy === "salary"
                            ? order === "asc"
                              ? "↑"
                              : "↓"
                            : ""}
                        </button>
                      </th>

                      <th>
                        <button
                          className="th-sort"
                          onClick={() => toggleSort("joinDate")}
                        >
                          Joining date{" "}
                          {sortBy === "joinDate"
                            ? order === "asc"
                              ? "↑"
                              : "↓"
                            : ""}
                        </button>
                      </th>

                      <th>Actions</th>
                    </tr>
                  </thead>

                  <tbody>
                    {loading ? (
                      <tr>
                        <td colSpan="5" className="table-message">
                          <span className="spinner" />
                          Loading employee records...
                        </td>
                      </tr>
                    ) : error && employees.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="table-message">
                          Could not load employees. Check that your backend
                          is running.
                          <br />
                          <button
                            className="inline-retry"
                            onClick={fetchEmployees}
                          >
                            Try again
                          </button>
                        </td>
                      </tr>
                    ) : employees.length === 0 ? (
                      <tr>
                        <td colSpan="5" className="table-message">
                          <div className="empty-state-icon">♙</div>
                          <strong>No employees found</strong>
                          <p>
                            {search
                              ? "Try another search term."
                              : "Add your first employee using the form."}
                          </p>
                          {search && (
                            <button
                              className="inline-retry"
                              onClick={() => setSearch("")}
                            >
                              Clear search
                            </button>
                          )}
                        </td>
                      </tr>
                    ) : (
                      employees.map((employee) => (
                        <tr key={employee._id}>
                          <td>
                            <div className="employee-cell">
                              <div className="employee-avatar">
                                {initials(employee.name)}
                              </div>
                              <div className="employee-name-wrap">
                                <strong>{employee.name}</strong>
                                <span>Employee</span>
                              </div>
                            </div>
                          </td>

                          <td>
                            <div className="department-cell">
                              <strong>{employee.department}</strong>
                              <span>{employee.role}</span>
                            </div>
                          </td>

                          <td className="salary-cell">
                            {currency.format(Number(employee.salary) || 0)}
                          </td>

                          <td className="date-cell">
                            {formatDate(employee.joinDate)}
                          </td>

                          <td>
                            <div className="action-group">
                              <button
                                className="action-button edit-button"
                                onClick={() => handleEdit(employee)}
                                title="Edit employee"
                              >
                                <span aria-hidden="true">✎</span> Edit
                              </button>

                              <button
                                className="action-button delete-button"
                                onClick={() => handleDelete(employee)}
                                title="Delete employee"
                              >
                                <span aria-hidden="true">×</span> Delete
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>

              <div className="table-footer">
                <span>
                  Showing {employees.length}{" "}
                  {employees.length === 1 ? "employee" : "employees"}
                </span>

                <button
                  className="refresh-button"
                  onClick={fetchEmployees}
                  disabled={loading}
                >
                  ↻ Refresh records
                </button>
              </div>
            </section>

            {/* ADD / EDIT EMPLOYEE FORM */}
            <aside className="panel form-panel" id="employee-form">
              <div className="form-panel-heading">
                <div className="form-heading-icon">
                  {editingId ? "✎" : "＋"}
                </div>

                <div>
                  <p className="eyebrow">
                    {editingId ? "UPDATE RECORD" : "NEW TEAM MEMBER"}
                  </p>
                  <h2>{editingId ? "Edit employee" : "Add employee"}</h2>
                  <p className="panel-description">
                    {editingId
                      ? "Make changes to the selected employee."
                      : "Enter the details to create a record."}
                  </p>
                </div>
              </div>

              <form className="employee-form" onSubmit={handleSubmit}>
                <label className="form-field">
                  <span>
                    Full name <b>*</b>
                  </span>
                  <input
                    name="name"
                    value={form.name}
                    onChange={handleChange}
                    placeholder="e.g. Nikita Sharma"
                    maxLength="100"
                    required
                  />
                </label>

                <label className="form-field">
                  <span>
                    Department <b>*</b>
                  </span>
                  <input
                    name="department"
                    value={form.department}
                    onChange={handleChange}
                    placeholder="e.g. Development"
                    maxLength="100"
                    required
                  />
                </label>

                <label className="form-field">
                  <span>
                    Job role <b>*</b>
                  </span>
                  <input
                    name="role"
                    value={form.role}
                    onChange={handleChange}
                    placeholder="e.g. Frontend Developer"
                    maxLength="100"
                    required
                  />
                </label>

                <label className="form-field">
                  <span>
                    Monthly salary (₹) <b>*</b>
                  </span>
                  <div className="input-with-prefix">
                    <span>₹</span>
                    <input
                      name="salary"
                      type="number"
                      min="0"
                      step="1"
                      value={form.salary}
                      onChange={handleChange}
                      placeholder="45000"
                      required
                    />
                  </div>
                </label>

                <label className="form-field">
                  <span>
                    Joining date <b>*</b>
                  </span>
                  <input
                    name="joinDate"
                    type="date"
                    value={form.joinDate}
                    onChange={handleChange}
                    required
                  />
                </label>

                <button
                  className="button button-primary submit-button"
                  type="submit"
                  disabled={saving}
                >
                  {saving
                    ? "Saving..."
                    : editingId
                      ? "Save changes →"
                      : "＋  Add employee"}
                </button>

                {editingId && (
                  <button
                    className="button button-secondary cancel-button"
                    type="button"
                    onClick={resetForm}
                  >
                    Cancel editing
                  </button>
                )}
              </form>

              <div className="form-tip">
                <div className="tip-icon">✦</div>
                <div>
                  <strong>Quick tip</strong>
                  <p>
                    Keep employee information accurate. Required fields are
                    marked with an asterisk.
                  </p>
                </div>
              </div>
            </aside>
          </section>

          <footer className="page-footer">
            <span>© {new Date().getFullYear()} StaffSync</span>
            <span>Employee management made simpler.</span>
          </footer>
        </main>
      </div>
    </div>
  );
}
