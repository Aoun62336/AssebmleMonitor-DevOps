/* ===== ASSEMBLEMONITOR — Global JavaScript ===== */

// Central API base URL — Vite proxies /api/* to the FastAPI backend (port 8000)
const API_BASE_URL = '/api';

// --- Auth Helpers ---
function getAuthToken() {
  const auth = localStorage.getItem('am_auth');
  return auth ? JSON.parse(auth).access_token : null;
}

function getAuthUser() {
  const authStr = localStorage.getItem('am_auth');
  if (!authStr) return null;
  const auth = JSON.parse(authStr);
  if (auth.user) return auth.user;
  // If it's a flat object (as saved by LoginPage.jsx), return the object itself
  if (auth.id && auth.role) return auth;
  return null;
}

function requireAuth(allowedRoles = []) {
  const token = getAuthToken();
  const user = getAuthUser();
  if (!token || !user) {
    window.location.href = getBasePath() + 'login.html';
    return false;
  }
  if (allowedRoles.length && !allowedRoles.includes(user.role)) {
    window.location.href = getBasePath() + 'login.html';
    return false;
  }
  return true;
}

async function apiFetch(endpoint, options = {}) {
  const url = endpoint.startsWith('http') ? endpoint : API_BASE_URL + endpoint;
  
  const headers = {
    'Content-Type': 'application/json',
    ...options.headers
  };

  const token = getAuthToken();
  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(url, { ...options, headers });
  
  if (response.status === 401) {
    localStorage.removeItem('am_auth');
    // Prevent infinite redirect loop: only redirect if not already on the login page
    const isOnLoginPage = window.location.pathname.includes('login');
    if (!isOnLoginPage) {
      window.location.href = getBasePath() + 'login.html';
    }
    throw new Error('Unauthorized');
  }

  if (!response.ok) {
    const errorData = await response.json().catch(() => null);
    throw new Error(errorData?.detail || `API Error: ${response.status}`);
  }

  return response.json().catch(() => null);
}
// -------------------
document.addEventListener('DOMContentLoaded', async () => {
  initNavScroll();
  initLoginForm();
  initForgotPasswordForm();
  initResetPasswordForm();
  initSidebarActive();
  initSidebarUser();
  initLogout();
  initAnimations();
  initMobileMenu();
  initChartBars();
  initAdminEnhancements();
  initHideSearchBtn();

  // Only make authenticated API calls if a valid token exists.
  // Without this guard, these functions fire on login.html, get a 401,
  // redirect back to login.html, and loop forever.
  if (getAuthToken()) {
    // await initPmPlanningForms(); // Removed to avoid conflict with page-specific scripts in create-task.html and others
    await initTaskStatusWorkflows();
    await initEditTaskPage();
    initNotifications();
  }
});

/* ---------- Edit Task Page Logic (PM/Admin) ---------- */
async function initEditTaskPage() {
  const form = document.getElementById('editTaskPageForm');
  if (!form) return;

  const urlParams = new URLSearchParams(window.location.search);
  const taskId = urlParams.get('id');

  if (!taskId) {
    showToast('No task ID provided.', 'warning');
    setTimeout(() => { window.location.href = 'manage-tasks.html'; }, 1500);
    return;
  }

  // Load Task Data first, then use project assignments for engineers
  try {
    const task = await apiFetch(`/v1/tasks/${taskId}`);
    
    // Fetch phase and project so we can get project-specific engineers
    let engineers = [];
    try {
      const phase = await apiFetch(`/v1/phases/${task.phase_id}`);
      const team = await apiFetch(`/v1/projects/${phase.project_id}/assignments`);
      engineers = (team || []).filter(m => {
        const r = (m.role || '').toLowerCase();
        return r === 'site_engineer';
      });
    } catch (engErr) {
      console.warn('Could not load project engineers:', engErr);
    }

    // Populate Engineers Dropdown
    const assignedSelect = document.getElementById('editTaskAssigned');
    if (assignedSelect) {
      assignedSelect.innerHTML = '<option value="">Unassigned</option>' +
        engineers.map(u => `<option value="${u.user_id}" ${String(u.user_id) === String(task.assigned_to) ? 'selected' : ''}>${u.full_name} (Site Engineer)</option>`).join('');
      // If the currently assigned engineer isn't in the list (e.g. removed from project), add them
      if (task.assigned_to && task.assignee_name && !engineers.find(e => String(e.user_id) === String(task.assigned_to))) {
        const opt = document.createElement('option');
        opt.value = task.assigned_to;
        opt.textContent = task.assignee_name + ' (Site Engineer)';
        opt.selected = true;
        assignedSelect.appendChild(opt);
      }
    }

    document.getElementById('editTaskId').value = task.id;
    document.getElementById('editTaskName').value = task.name;
    document.getElementById('editTaskStatus').value = task.status;
    
    // Normalize priority for selection
    const prioritySelect = document.getElementById('editTaskPriority');
    if (prioritySelect) {
      for (let opt of prioritySelect.options) {
        if (opt.value.toLowerCase() === (task.priority || '').toLowerCase()) {
          opt.selected = true;
          break;
        }
      }
    }

    document.getElementById('editTaskStart').value = task.start_date || '';
    document.getElementById('editTaskDue').value = task.due_date || '';
    // Always set description — if null show empty string
    document.getElementById('editTaskDesc').value = task.description || '';
  } catch (err) {
    console.error(err);
    showToast('Failed to load task details: ' + err.message, 'danger');
  }

  // Handle Submit
  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Saving...';
    btn.disabled = true;

    const payload = {
      name: document.getElementById('editTaskName').value.trim(),
      status: document.getElementById('editTaskStatus').value,
      priority: document.getElementById('editTaskPriority').value.toLowerCase(),
      assigned_to: document.getElementById('editTaskAssigned').value || null,
      due_date: document.getElementById('editTaskDue').value || null,
      description: document.getElementById('editTaskDesc').value.trim()
    };

    try {
      await apiFetch(`/v1/tasks/${taskId}`, {
        method: 'PATCH',
        body: JSON.stringify(payload)
      });
      showToast('Task updated successfully!', 'success');
      setTimeout(() => { window.location.href = 'manage-tasks.html'; }, 1000);
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to update task', 'danger');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });

  // Handle Delete
  const deleteBtn = document.getElementById('deleteTaskPageBtn');
  if (deleteBtn) {
    deleteBtn.addEventListener('click', async () => {
      if (!confirm('Are you sure you want to delete this task? This cannot be undone.')) return;
      
      try {
        await apiFetch(`/v1/tasks/${taskId}`, { method: 'DELETE' });
        showToast('Task deleted successfully.', 'info');
        setTimeout(() => { window.location.href = 'manage-tasks.html'; }, 1000);
      } catch (err) {
        showToast(err.message || 'Failed to delete task', 'danger');
      }
    });
  }
}

/* ---------- Navbar scroll effect ---------- */
function initNavScroll() {
  const nav = document.querySelector('.landing-nav');
  if (!nav) return;
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });
}

/* ---------- Login form ---------- */
function initLoginForm() {
  const form = document.getElementById('loginForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    const password = document.getElementById('password').value.trim();

    if (!email || !password) {
      showToast('Please fill in all fields', 'warning');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.textContent;
    btn.textContent = 'Logging in...';
    btn.disabled = true;

    try {
      const loginRes = await fetch(`${API_BASE_URL}/v1/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!loginRes.ok) {
        const errorData = await loginRes.json().catch(() => null);
        throw new Error(errorData?.detail || 'Invalid email or password');
      }

      const tokenData = await loginRes.json();
      
      // Store token temporarily to fetch user profile
      localStorage.setItem('am_auth', JSON.stringify({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token
      }));

      // Fetch user profile
      const user = await apiFetch('/v1/auth/me');
      
      // Update stored auth data
      localStorage.setItem('am_auth', JSON.stringify({
        access_token: tokenData.access_token,
        refresh_token: tokenData.refresh_token,
        user: {
          id: user.id,
          email: user.email,
          role: user.role,
          name: user.full_name
        },
        loggedIn: true
      }));

      showToast('Login successful! Redirecting...', 'success');

      // Redirect based on backend role
      setTimeout(() => {
        const basePath = getBasePath();
        switch (user.role) {
          case 'admin':
            window.location.href = basePath + 'admin/index.html';
            break;
          case 'project_manager':
            window.location.href = basePath + 'pm/index.html';
            break;
          case 'site_engineer':
            window.location.href = basePath + 'se/index.html';
            break;
          case 'client':
            window.location.href = basePath + 'client/index.html';
            break;
          default:
            window.location.href = basePath + 'index.html';
        }
      }, 800);

    } catch (err) {
      // Distinguish network errors (backend offline) from API errors (wrong password etc.)
      if (err instanceof TypeError && err.message.includes('fetch')) {
        showToast('Cannot reach server. Make sure the backend is running (npm run dev).', 'danger');
      } else {
        showToast(err.message || 'Login failed. Check your credentials.', 'danger');
      }
      localStorage.removeItem('am_auth');
    } finally {
      btn.innerHTML = '<span class="material-symbols-outlined">login</span> Sign In';
      btn.disabled = false;
    }
  });
}

/* ---------- Forgot Password form ---------- */
function initForgotPasswordForm() {
  const form = document.getElementById('forgotForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value.trim();
    if (!email) {
      showToast('Please enter your email address', 'warning');
      return;
    }
    
    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Sending...';
    btn.disabled = true;

    try {
      const res = await fetch(`${API_BASE_URL}/v1/auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to send reset link');
      
      showToast(data.message || 'Reset link sent to your email.', 'success');
      form.reset();
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });
}

/* ---------- Reset Password form ---------- */
function initResetPasswordForm() {
  const form = document.getElementById('resetForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const urlParams = new URLSearchParams(window.location.search);
    const token = urlParams.get('token');
    
    if (!token) {
      showToast('Invalid or missing reset token.', 'danger');
      return;
    }

    const newPassword = document.getElementById('newPassword').value;
    const confirmPassword = document.getElementById('confirmPassword').value;

    if (newPassword !== confirmPassword) {
      showToast('Passwords do not match.', 'warning');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Resetting...';
    btn.disabled = true;

    try {
      const res = await fetch(`${API_BASE_URL}/v1/auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, new_password: newPassword })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.detail || 'Failed to reset password');

      showToast('Password successfully reset.', 'success');
      setTimeout(() => {
        window.location.href = getBasePath() + 'login.html';
      }, 1500);
    } catch (err) {
      showToast(err.message, 'danger');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });
}

/* ---------- Sidebar active state ---------- */
function initSidebarActive() {
  const links = document.querySelectorAll('.sidebar-nav a:not(.logout-btn)');
  links.forEach(link => {
    link.addEventListener('click', (e) => {
      links.forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

/* ---------- Sidebar user info ---------- */
function initSidebarUser() {
  const user = getAuthUser();
  if (!user) return;
  const nameEl = document.querySelector('.sidebar-user-name');
  const roleEl = document.querySelector('.sidebar-user-role');
  const avatarEl = document.querySelector('.sidebar-user-avatar');
  const topbarAvatarEl = document.querySelector('.topbar-avatar');
  
  // Use the name from am_auth user object (Problem 2)
  if (nameEl) nameEl.textContent = user.name || user.full_name || 'User';
  
  if (roleEl) {
    const roleMap = { admin: 'Administrator', project_manager: 'Project Manager', site_engineer: 'Site Engineer', client: 'Client' };
    roleEl.textContent = roleMap[user.role] || user.role;
  }
  const initials = (user.name || user.full_name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
  if (avatarEl) avatarEl.textContent = initials;
  if (topbarAvatarEl) topbarAvatarEl.textContent = initials;
}

/* ---------- Logout ---------- */
function initLogout() {
  const logoutBtns = document.querySelectorAll('.logout-btn');
  logoutBtns.forEach(btn => {
    btn.addEventListener('click', async (e) => {
      e.preventDefault();
      try {
        await apiFetch('/v1/auth/logout', { method: 'POST' });
      } catch (err) {
        console.error('Logout API failed:', err);
      } finally {
        localStorage.removeItem('am_auth');
        showToast('Logged out successfully', 'info');
        setTimeout(() => {
          window.location.href = getBasePath() + 'login.html';
        }, 600);
      }
    });
  });
}

/* ---------- Animations on scroll ---------- */
function initAnimations() {
  const els = document.querySelectorAll('.animate-in');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.animationPlayState = 'running';
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  els.forEach(el => {
    el.style.animationPlayState = 'paused';
    observer.observe(el);
  });
}

/* ---------- Mobile sidebar toggle ---------- */
function initMobileMenu() {
  const toggle = document.getElementById('sidebarToggle');
  const sidebar = document.querySelector('.sidebar');
  if (!toggle || !sidebar) return;

  toggle.addEventListener('click', () => {
    sidebar.classList.toggle('open');
  });

  // Close sidebar on outside click
  document.addEventListener('click', (e) => {
    if (sidebar.classList.contains('open') &&
        !sidebar.contains(e.target) &&
        !toggle.contains(e.target)) {
      sidebar.classList.remove('open');
    }
  });
}

/* ---------- Animated chart bars ---------- */
function initChartBars() {
  const bars = document.querySelectorAll('.chart-bar');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const bar = entry.target;
        const height = bar.dataset.height || '60px';
        bar.style.height = height;
        observer.unobserve(bar);
      }
    });
  }, { threshold: 0.3 });

  bars.forEach(bar => {
    bar.style.height = '0';
    observer.observe(bar);
  });
}

/* ---------- Admin legacy enhancements ---------- */
function initAdminEnhancements() {
  // initStandaloneCreateUser and initStandaloneManageUsers removed:
  // those pages now have their own API-connected inline scripts.
  initStandaloneEngineerPicker();
}

/* ---------- PM planning form enhancements ---------- */
async function fetchProjects() {
  try {
    const projects = await apiFetch('/v1/projects');
    return projects || [];
  } catch (err) {
    console.error('Failed to fetch projects:', err);
    return [];
  }
}

// Keeping names for compatibility but making them async
async function getAvailableProjects() {
  return await fetchProjects();
}

async function getAvailablePhases(projectId) {
  try {
    // If no project ID, return all phases (backend usually handles this)
    const endpoint = projectId ? `/v1/phases?project_id=${projectId}` : '/v1/phases';
    const phases = await apiFetch(endpoint);
    return phases || [];
  } catch (err) {
    console.error('Failed to fetch phases:', err);
    return [];
  }
}

function normalizePhase(phase) {
  if (!phase || typeof phase !== 'object') return null;
  return {
    id: phase.id,
    name: phase.name,
    project_id: phase.project_id,
    startDate: phase.start_date,
    endDate: phase.end_date
  };
}

function initCreatePhaseForm(projects) {
  const form = document.querySelector('[data-create-phase-form]');
  if (!form) return;

  const projectSelect = form.querySelector('#phaseProjectSelect');
  const startDateInput = form.querySelector('#phaseStartDate');
  const endDateInput = form.querySelector('#phaseEndDate');

  if (startDateInput) {
    startDateInput.addEventListener('change', () => {
      if (endDateInput) endDateInput.min = startDateInput.value || '';
    });
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    const phaseName = form.elements.phaseName.value.trim();
    const project_id = form.elements.project.value;
    const startDate = form.elements.startDate.value;
    const endDate = form.elements.endDate.value;
    const description = form.elements.description.value.trim();

    if (!phaseName || !project_id || !startDate || !endDate) {
      showToast('Complete all required phase fields before saving.', 'warning');
      return;
    }

    if (startDate > endDate) {
      showToast('Phase end date must be on or after start date.', 'warning');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Saving...';
    btn.disabled = true;

    try {
      // Problem 1: Call real API instead of localStorage
      await apiFetch('/v1/phases', {
        method: 'POST',
        body: JSON.stringify({
          project_id: project_id,
          name: phaseName,
          description: description,
          start_date: startDate,
          end_date: endDate,
          order_index: 0
        })
      });

      showToast('Phase created successfully.', 'success');
      form.reset();
      if (projectSelect) projectSelect.value = '';
      if (endDateInput) endDateInput.min = '';
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to create phase', 'danger');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });
}

function initCreateTaskForm(projects) {
  const form = document.querySelector('[data-create-task-form]');
  if (!form) return;

  const projectSelect = form.querySelector('#taskProjectSelect');
  const phaseSelect = form.querySelector('#taskPhaseSelect');
  const statusSelect = form.querySelector('#taskStatus');

  form.addEventListener('submit', async (event) => {
    event.preventDefault();

    const title = form.elements.taskTitle.value.trim();
    const assignTo = form.elements.assignTo.value;
    const phase_id = form.elements.phase.value;
    const priority = form.elements.priority.value;
    const zone = form.elements.zone.value.trim();
    const startDate = form.elements.startDate.value;
    const dueDate = form.elements.dueDate.value;
    const description = form.elements.description ? form.elements.description.value.trim() : '';

    if (!title || !assignTo || !phase_id || !priority || !zone || !startDate || !dueDate) {
      showToast('Complete all required task fields before saving.', 'warning');
      return;
    }

    const btn = form.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Saving...';
    btn.disabled = true;

    try {
      // Problem 1: Call real API instead of localStorage
      await apiFetch('/v1/tasks', {
        method: 'POST',
        body: JSON.stringify({
          phase_id: phase_id,
          name: title,
          description: description,
          priority: priority.toLowerCase(), // API expects lowercase
          zone: zone,
          start_date: startDate,
          due_date: dueDate,
          assigned_to: assignTo
        })
      });

      showToast('Task created successfully.', 'success');
      form.reset();
      if (statusSelect) statusSelect.value = 'Not Started';
    } catch (err) {
      console.error(err);
      showToast(err.message || 'Failed to create task', 'danger');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });

  if (statusSelect) statusSelect.value = 'Not Started';
}

async function initPmPlanningForms() {
  const projects = await getAvailableProjects();
  initCreatePhaseForm(projects);
  initCreateTaskForm(projects);
}

async function initTaskStatusWorkflows() {
  await initPmTaskManagementTable();
  await initSiteEngineerTaskBoard();
}

async function initPmTaskManagementTable() {
  const table = document.querySelector('[data-pm-task-table]');
  if (!table) return;
  const body = table.querySelector('tbody');
  const titleEl = document.querySelector('[data-pm-task-count]');
  if (!body) return;

  const projectSelect = document.getElementById('taskProjectSelect');
  const phaseSelect = document.getElementById('taskPhaseSelect');

  // If the page has project/phase selects, wire them up
  if (projectSelect) {
    const savedPid = sessionStorage.getItem('pmManageTasksProjectId');
    const savedPhaseId = sessionStorage.getItem('pmManageTasksPhaseId');

    const loadPhasesForProject = async (pid, autoSelectPhaseId = null) => {
      phaseSelect.innerHTML = '<option value="">-- Select Phase --</option>';
      if (!pid) return;
      try {
        const phases = await apiFetch(`/v1/phases/project/${pid}`);
        phaseSelect.innerHTML = '<option value="">-- Select Phase --</option>' +
          phases.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
          
        if (autoSelectPhaseId) {
          phaseSelect.value = autoSelectPhaseId;
          if (phaseSelect.value === autoSelectPhaseId) { // Verify option exists
             loadTasksForPhase(autoSelectPhaseId, body, titleEl);
          } else {
             body.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:20px">Select a phase to load tasks</td></tr>';
          }
        }
      } catch (err) {
        console.error('Failed to load phases:', err);
      }
    };

    try {
      const projects = await apiFetch('/v1/projects');
      projectSelect.innerHTML = '<option value="">-- Select Project --</option>' +
        projects.map(p => `<option value="${p.id}">${p.name}</option>`).join('');
        
      if (savedPid) {
        projectSelect.value = savedPid;
        if (projectSelect.value === savedPid) {
          loadPhasesForProject(savedPid, savedPhaseId);
        }
      }
    } catch (err) {
      console.error('Failed to load projects:', err);
    }

    projectSelect.addEventListener('change', async () => {
      const pid = projectSelect.value;
      if (pid) {
        sessionStorage.setItem('pmManageTasksProjectId', pid);
      } else {
        sessionStorage.removeItem('pmManageTasksProjectId');
      }
      sessionStorage.removeItem('pmManageTasksPhaseId');
      body.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:20px">Select a phase to load tasks</td></tr>';
      loadPhasesForProject(pid);
    });

    phaseSelect && phaseSelect.addEventListener('change', () => {
      const phid = phaseSelect.value;
      if (phid) {
        sessionStorage.setItem('pmManageTasksPhaseId', phid);
      } else {
        sessionStorage.removeItem('pmManageTasksPhaseId');
      }
      loadTasksForPhase(phid, body, titleEl);
    });
    return; // Don't auto-load all tasks — wait for user to select
  }

  // No selects — load all tasks (legacy behavior)
  await loadTasksForBody(null, body, titleEl);
}

async function loadTasksForPhase(phaseId, body, titleEl) {
  if (!phaseId) {
    body.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:20px">Select a phase to load tasks</td></tr>';
    if (titleEl) titleEl.textContent = 'Tasks';
    return;
  }
  body.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:20px">Loading tasks...</td></tr>';
  try {
    const tasks = await apiFetch(`/v1/tasks/phase/${phaseId}`);
    renderTasksTable(tasks, body, titleEl);
  } catch (err) {
    body.innerHTML = `<tr><td colspan="7" style="text-align:center;color:var(--danger);padding:20px">Error: ${escapeHtml(err.message)}</td></tr>`;
  }
}

async function loadTasksForBody(phaseId, body, titleEl) {
  const tasks = await getAllTasks();
  renderTasksTable(tasks, body, titleEl);
}

function renderTasksTable(tasks, body, titleEl) {
  if (!tasks || !tasks.length) {
    body.innerHTML = '<tr><td colspan="7" style="text-align:center;color:var(--text-muted);padding:20px">No tasks found.</td></tr>';
    if (titleEl) titleEl.textContent = 'Tasks (0)';
    return;
  }

  body.innerHTML = tasks.map((task) => `
    <tr>
      <td>
        <strong>${escapeHtml(task.name || task.title)}</strong>
        ${task.description ? `<div style="font-size:0.82rem;color:var(--text-muted);margin-top:2px;max-width:320px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;" title="${escapeHtml(task.description)}">${escapeHtml(task.description)}</div>` : '<div style="font-size:0.82rem;color:var(--text-muted);margin-top:2px;font-style:italic;">No description provided</div>'}
      </td>
      <td>${escapeHtml(task.assignee_name || 'Unassigned')}</td>
      <td>${escapeHtml(task.phase_name || task.phase || '-')}</td>
      <td>${formatShortDate(task.due_date || task.dueDate)}</td>
      <td><span class="status-badge ${getPriorityBadgeClass(task.priority)}">${escapeHtml(task.priority)}</span></td>
      <td><span class="status-badge ${getTaskStatusBadgeClass(task.status)}">${normalizeTaskStatus(task.status)}</span></td>
      <td style="text-align:right">
        <a href="edit-task.html?id=${task.id}" class="btn btn-outline" style="padding:4px 12px; font-size:0.8rem;">Edit</a>
      </td>
    </tr>
  `).join('');
  if (titleEl) titleEl.textContent = `Tasks (${tasks.length})`;
}


async function initSiteEngineerTaskBoard() {
  const table = document.querySelector('[data-se-task-table]');
  if (!table) return;
  const body = table.querySelector('tbody');
  const titleEl = document.querySelector('[data-se-task-count]');
  const auth = getAuthUser();
  const currentEngineer = auth?.full_name || auth?.name || 'User';
  if (!body) return;

  const allTasks = await getAllTasks();
  const assignedTasks = allTasks.filter((task) => isTaskAssignedToEngineer(task.assigned_to || task.assignTo, currentEngineer));
  
  if (!assignedTasks.length) {
    body.innerHTML = '<tr><td colspan="5" style="text-align:center;color:var(--text-muted);padding:20px">No tasks assigned to you yet.</td></tr>';
    if (titleEl) titleEl.textContent = 'Active Tasks (0)';
    return;
  }

  body.innerHTML = assignedTasks.map((task) => `
    <tr data-task-row-id="${task.id}">
      <td><strong>${escapeHtml(task.name || task.title)}</strong></td>
      <td>${escapeHtml(task.zone || '-')}</td>
      <td>${formatShortDate(task.due_date || task.dueDate)}</td>
      <td><span class="status-badge ${getPriorityBadgeClass(task.priority)}">${escapeHtml(task.priority)}</span></td>
      <td>
        <select class="form-select" data-se-task-status="${task.id}" aria-label="Update status for ${escapeHtml(task.name || task.title)}">
          ${['not_started', 'in_progress', 'completed'].map((status) => `
            <option value="${status}" ${task.status === status || normalizeTaskStatus(task.status) === normalizeTaskStatus(status) ? 'selected' : ''}>
              ${normalizeTaskStatus(status)}
            </option>
          `).join('')}
        </select>
      </td>
    </tr>
  `).join('');
  if (titleEl) titleEl.textContent = `Active Tasks (${assignedTasks.length})`;

  body.querySelectorAll('[data-se-task-status]').forEach((select) => {
    select.addEventListener('change', async (event) => {
      const taskId = event.target.getAttribute('data-se-task-status');
      const nextStatus = event.target.value;
      const updated = await updateTaskStatus(taskId, nextStatus);
      if (!updated) {
        showToast('Failed to update task status.', 'danger');
        await initSiteEngineerTaskBoard();
        return;
      }
      showToast('Task status updated.', 'success');
      // Refresh both boards if they exist
      await initPmTaskManagementTable();
      await initSiteEngineerTaskBoard();
    });
  });
}

async function getAllTasks() {
  try {
    const tasks = await apiFetch('/v1/tasks');
    return tasks || [];
  } catch (err) {
    console.error('Failed to fetch tasks:', err);
    return [];
  }
}

function normalizeTask(task) {
  if (!task || typeof task !== 'object') return null;
  const required = ['title', 'assignTo', 'phase', 'priority', 'dueDate'];
  const hasRequiredValues = required.every((field) => typeof task[field] === 'string' && task[field].trim());
  if (!hasRequiredValues) return null;
  return {
    id: task.id || `task-${Date.now()}`,
    title: task.title.trim(),
    assignTo: task.assignTo.trim(),
    project: typeof task.project === 'string' ? task.project.trim() : '',
    phase: task.phase.trim(),
    dueDate: task.dueDate,
    priority: task.priority.trim(),
    zone: typeof task.zone === 'string' ? task.zone.trim() : '-',
    startDate: typeof task.startDate === 'string' ? task.startDate : '',
    status: normalizeTaskStatus(task.status)
  };
}

function normalizeTaskStatus(status) {
  if (!status) return 'Not Started';
  // Problem 3: Handle API lowercase snake_case values
  const s = status.toLowerCase().replace(/_/g, ' ');
  if (s === 'not started') return 'Not Started';
  if (s === 'in progress') return 'In Progress';
  if (s === 'completed') return 'Completed';
  if (s === 'blocked') return 'Blocked';
  
  // Default fallback: Title Case
  return status.split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ');
}

async function updateTaskStatus(taskId, nextStatus) {
  try {
    // API expects snake_case status
    const status = nextStatus.toLowerCase().replace(/ /g, '_');
    await apiFetch(`/v1/tasks/${taskId}`, {
      method: 'PATCH',
      body: JSON.stringify({ status })
    });
    return true;
  } catch (err) {
    console.error('Failed to update task status:', err);
    return false;
  }
}

function isTaskAssignedToEngineer(assigneeName, currentEngineer) {
  const normalize = (value) => String(value || '').trim().toLowerCase().replace(/\./g, '');
  return normalize(assigneeName) === normalize(currentEngineer);
}

function getTaskStatusBadgeClass(status) {
  const normalized = normalizeTaskStatus(status);
  if (normalized === 'Completed') return 'active';
  if (normalized === 'In Progress') return 'progress';
  if (normalized === 'Blocked') return 'overdue';
  return 'pending';
}

function getPriorityBadgeClass(priority) {
  if (priority === 'High') return 'overdue';
  if (priority === 'Low') return 'progress';
  return 'pending';
}

function formatShortDate(dateValue) {
  const date = new Date(dateValue);
  if (Number.isNaN(date.getTime())) return '-';
  const day = String(date.getDate()).padStart(2, '0');
  const month = date.toLocaleDateString('en-GB', { month: 'short' });
  const year = date.getFullYear();
  return `${day} ${month} ${year}`;
}

function escapeHtml(value) {
  return String(value || '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function readAuthUser() {
  try {
    const auth = localStorage.getItem('am_auth');
    return auth ? JSON.parse(auth) : null;
  } catch (error) {
    return null;
  }
}

function populateSelect(selectElement, values, options = {}) {
  if (!selectElement) return;
  const placeholder = options.placeholder || 'Select option';
  selectElement.innerHTML = `<option value="">${placeholder}</option>`;
  values.forEach((value) => {
    const option = document.createElement('option');
    option.value = value;
    option.textContent = value;
    selectElement.appendChild(option);
  });
}

function safeReadStorageArray(key) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    return [];
  }
}

// initStandaloneCreateUser removed — create-user.html has its own API-wired inline script.

function initStandaloneEngineerPicker() {
  const picker = document.querySelector('[data-engineer-picker]');
  const form = document.querySelector('[data-project-form]');
  if (!picker || !form) return;

  const tags = picker.querySelector('[data-engineer-tags]');
  const search = picker.querySelector('[data-engineer-search]');
  const clearButton = picker.querySelector('[data-clear-engineers]');
  const summary = picker.querySelector('[data-selection-count]');
  const nativeSelect = picker.querySelector('[data-native-engineers]');
  const checkboxes = Array.from(picker.querySelectorAll('input[type="checkbox"]'));
  const resetButton = document.querySelector('[data-project-reset]');

  function render() {
    const selected = checkboxes.filter((checkbox) => checkbox.checked);
    tags.innerHTML = '';

    if (!selected.length) {
      tags.innerHTML = '<span class="engineer-picker-placeholder">No site engineers selected yet.</span>';
    } else {
      selected.forEach((checkbox) => {
        const chip = document.createElement('span');
        chip.className = 'engineer-tag';
        chip.innerHTML = `<span>${checkbox.value}</span><button type="button" aria-label="Remove ${checkbox.value}">×</button>`;
        chip.querySelector('button').addEventListener('click', () => {
          checkbox.checked = false;
          render();
        });
        tags.appendChild(chip);
      });
    }

    checkboxes.forEach((checkbox) => {
      const option = checkbox.closest('.engineer-option');
      if (option) option.classList.toggle('is-selected', checkbox.checked);
    });

    Array.from(nativeSelect.options).forEach((option) => {
      option.selected = selected.some((checkbox) => checkbox.value === option.value);
    });

    summary.textContent = `${selected.length} engineer${selected.length === 1 ? '' : 's'} selected`;
  }

  function filterOptions() {
    const query = search.value.trim().toLowerCase();
    checkboxes.forEach((checkbox) => {
      const option = checkbox.closest('.engineer-option');
      const matches = !query || (option && option.textContent.toLowerCase().includes(query));
      if (option) option.classList.toggle('is-hidden', !matches);
    });
  }

  clearButton.addEventListener('click', () => {
    search.value = '';
    checkboxes.forEach((checkbox) => {
      checkbox.checked = false;
    });
    filterOptions();
    render();
  });

  search.addEventListener('input', filterOptions);
  checkboxes.forEach((checkbox) => {
    checkbox.addEventListener('change', render);
  });

  resetButton?.addEventListener('click', () => {
    window.setTimeout(() => {
      clearButton.click();
    }, 0);
  });

  render();
  filterOptions();
}

// initStandaloneManageUsers removed — manage-users.html has its own API-wired inline script.
function _initStandaloneManageUsers_REMOVED() {
  const rows = Array.from(document.querySelectorAll('[data-user-row]'));
  const searchInput = document.querySelector('[data-user-search]');
  const filterButtons = Array.from(document.querySelectorAll('[data-role-filter]'));
  const emptyState = document.querySelector('[data-empty-state]');
  const modal = document.querySelector('[data-user-modal]');
  const editForm = document.querySelector('[data-user-edit-form]');
  const totalEl = document.querySelector('[data-user-total]');
  const activeEl = document.querySelector('[data-active-total]');
  const inactiveEl = document.querySelector('[data-inactive-total]');
  const deleteButton = document.querySelector('[data-delete-user]');
  if (!rows.length || !searchInput || !modal || !editForm) return;

  modal.hidden = true;
  document.body.classList.remove('modal-open');
  document.documentElement.classList.remove('modal-open');

  let activeRole = 'all';
  let editingRow = null;

  function updateCounts() {
    const currentRows = Array.from(document.querySelectorAll('[data-user-row]'));
    const visibleRows = currentRows.filter((row) => !row.dataset.deleted);
    const activeRows = visibleRows.filter((row) => row.dataset.status === 'Active');
    totalEl.textContent = String(visibleRows.length);
    activeEl.textContent = String(activeRows.length);
    inactiveEl.textContent = String(visibleRows.length - activeRows.length);
  }

  function syncRow(row) {
    row.querySelector('[data-field="name"]').textContent = row.dataset.name;
    row.querySelector('[data-field="email"]').textContent = row.dataset.email;
    row.querySelector('[data-field="role"]').textContent = row.dataset.role;
    const statusEl = row.querySelector('[data-field="status"]');
    statusEl.textContent = row.dataset.status;
    statusEl.className = `status-badge ${row.dataset.status === 'Active' ? 'active' : 'pending'}`;
  }

  function applyFilters() {
    const query = searchInput.value.trim().toLowerCase();
    const hasSearchQuery = query.length > 0;
    const hasRoleFilter = activeRole !== 'all';
    let visibleCount = 0;
    const currentRows = Array.from(document.querySelectorAll('[data-user-row]'));

    currentRows.forEach((row) => {
      if (row.dataset.deleted) {
        row.hidden = true;
        return;
      }

      const haystack = [row.dataset.name, row.dataset.email, row.dataset.role, row.dataset.status].join(' ').toLowerCase();
      const matchesRole = activeRole === 'all' || row.dataset.role === activeRole;
      const matchesQuery = !query || haystack.includes(query);
      row.hidden = !(matchesRole && matchesQuery);
      if (!row.hidden) visibleCount += 1;
    });

    emptyState.hidden = !((hasSearchQuery || hasRoleFilter) && visibleCount === 0);
    updateCounts();
  }

  function closeModal() {
    modal.hidden = true;
    document.body.classList.remove('modal-open');
    document.documentElement.classList.remove('modal-open');
    editingRow = null;
  }

  function openModal(row) {
    editingRow = row;
    const availableRoles = Array.from(editForm.elements.role.options).map((option) => option.value);
    const safeRole = availableRoles.includes(row.dataset.role) ? row.dataset.role : 'Site Engineer';
    editForm.elements.name.value = row.dataset.name;
    editForm.elements.email.value = row.dataset.email;
    editForm.elements.password.value = '';
    editForm.elements.role.value = safeRole;
    editForm.elements.status.value = row.dataset.status;
    modal.hidden = false;
  }

  rows.forEach((row) => syncRow(row));
  applyFilters();

  searchInput.addEventListener('input', applyFilters);
  filterButtons.forEach((button) => {
    button.addEventListener('click', () => {
      activeRole = button.dataset.roleFilter;
      filterButtons.forEach((item) => item.classList.toggle('active', item === button));
      applyFilters();
    });
  });

  document.addEventListener('click', (event) => {
    const actionButton = event.target.closest('[data-user-action]');
    if (actionButton) {
      const row = actionButton.closest('[data-user-row]');
      const action = actionButton.dataset.userAction;

      if (action === 'edit') {
        openModal(row);
        return;
      }

    }

    if (event.target === modal || event.target.closest('[data-close-user-modal]')) {
      closeModal();
    }
  });

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && !modal.hidden) {
      closeModal();
    }
  });

  editForm.addEventListener('submit', async (event) => {
    event.preventDefault();
    if (!editingRow) return;

    const btn = editForm.querySelector('button[type="submit"]');
    const originalText = btn.innerHTML;
    btn.innerHTML = 'Saving...';
    btn.disabled = true;

    try {
      const name = editForm.elements.name.value.trim();
      const email = editForm.elements.email.value.trim();
      const rawRole = editForm.elements.role.value;
      const status = editForm.elements.status.value;
      const password = editForm.elements.password.value;
      const userId = editingRow.dataset.id;

      let role = 'site_engineer';
      if (rawRole === 'Project Manager') role = 'project_manager';
      if (rawRole === 'Client') role = 'client';
      if (rawRole === 'Administrator' || rawRole === 'Admin') role = 'admin';

      const payload = {
        full_name: name,
        role: role,
        is_active: status === 'Active'
      };

      if (password && password.length > 0) {
        payload.password = password;
      }

      if (userId) {
        await apiFetch(`/v1/users/${userId}`, {
          method: 'PATCH',
          body: JSON.stringify(payload)
        });
      }

      editingRow.dataset.name = name;
      editingRow.dataset.email = email;
      editingRow.dataset.role = rawRole;
      editingRow.dataset.status = status;
      syncRow(editingRow);
      applyFilters();
      closeModal();
      showToast('User updated', 'success');
    } catch (err) {
      console.error(err);
      showToast('Failed to update user', 'danger');
    } finally {
      btn.innerHTML = originalText;
      btn.disabled = false;
    }
  });

  deleteButton?.addEventListener('click', async () => {
    if (!editingRow) return;
    
    if (!confirm('Are you sure you want to deactivate this user?')) return;

    try {
      const userId = editingRow.dataset.id;
      if (userId) {
        await apiFetch(`/v1/users/${userId}`, {
          method: 'PATCH',
          body: JSON.stringify({ is_active: false })
        });
      }

      editingRow.dataset.status = 'Inactive';
      syncRow(editingRow);
      closeModal();
      applyFilters();
      showToast('User deactivated', 'info');
    } catch (err) {
      console.error(err);
      showToast('Failed to deactivate user', 'danger');
    }
  });
}

/* ---------- Helper: get user data by role ---------- */
function getUserByRole(role) {
  // Problem 2: Use getAuthUser() instead of hardcoded lookup
  const user = getAuthUser();
  if (user && user.role === role) {
    return {
      name: user.name || user.full_name,
      title: user.role === 'admin' ? 'Super Admin' : 
             user.role === 'project_manager' ? 'Project Manager' :
             user.role === 'site_engineer' ? 'Site Engineer' : 'Client',
      initials: (user.name || user.full_name || 'U').split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase()
    };
  }
  
  // Fallback map if no matching user is logged in
  const fallbacks = {
    admin: { name: 'Admin', title: 'Administrator', initials: 'AD' },
    pm: { name: 'PM', title: 'Project Manager', initials: 'PM' },
    se: { name: 'Engineer', title: 'Site Engineer', initials: 'SE' },
    client: { name: 'Client', title: 'Client Director', initials: 'CD' }
  };
  return fallbacks[role] || fallbacks.admin;
}

/* ---------- Helper: get base path ---------- */
function getBasePath() {
  const path = window.location.pathname;
  // If we're in a subdirectory (admin/, pm/, se/, client/), go up one level
  if (path.includes('/admin/') || path.includes('/pm/') || path.includes('/se/') || path.includes('/client/')) {
    return '../';
  }
  return './';
}

/* ---------- Hide topbar search button (removed globally) ---------- */
function initHideSearchBtn() {
  // Remove any topbar search icon buttons to clean up UI
  document.querySelectorAll('.topbar-right .topbar-icon-btn').forEach(btn => {
    if (btn.querySelector('.material-symbols-outlined')?.textContent?.trim() === 'search') {
      btn.style.display = 'none';
    }
  });
}

/* ---------- Notification system ---------- */
function initNotifications() {
  const notifBtn = document.querySelector('.topbar-right .topbar-icon-btn:has(.material-symbols-outlined)');
  // Find the notifications button specifically
  let notifIconBtn = null;
  document.querySelectorAll('.topbar-right .topbar-icon-btn').forEach(btn => {
    if (btn.querySelector('.material-symbols-outlined')?.textContent?.trim() === 'notifications') {
      notifIconBtn = btn;
    }
  });
  if (!notifIconBtn) return;

  // Inject notification panel into body
  if (!document.getElementById('notif-panel')) {
    const panel = document.createElement('div');
    panel.id = 'notif-panel';
    panel.style.cssText = `
      position:fixed; top:64px; right:16px; width:360px; max-height:480px;
      background:var(--surface,#fff); border:1px solid var(--border,#e2e8f0);
      border-radius:16px; box-shadow:0 20px 60px rgba(0,0,0,0.18);
      z-index:9990; overflow:hidden; display:none; flex-direction:column;
      font-family:'Inter',sans-serif;
    `;
    panel.innerHTML = `
      <div style="padding:16px 20px; border-bottom:1px solid var(--border,#e2e8f0); display:flex; align-items:center; justify-content:space-between;">
        <strong style="font-size:1rem; color:var(--text,#1a1a2e);">Notifications</strong>
        <button id="notif-mark-all" style="font-size:0.75rem; color:var(--primary,#6366f1); background:none; border:none; cursor:pointer; padding:4px 8px; border-radius:6px;">Mark all read</button>
      </div>
      <div id="notif-list" style="overflow-y:auto; flex:1; padding:8px 0;"></div>
    `;
    document.body.appendChild(panel);
  }

  const panel = document.getElementById('notif-panel');
  const notifList = document.getElementById('notif-list');
  const markAllBtn = document.getElementById('notif-mark-all');

  // Badge element already in HTML or needs creation
  let badge = notifIconBtn.querySelector('.topbar-badge');
  if (!badge) {
    badge = document.createElement('span');
    badge.className = 'topbar-badge';
    notifIconBtn.appendChild(badge);
  }

  async function loadNotifications() {
    try {
      const [notifs, countData] = await Promise.all([
        apiFetch('/v1/notifications'),
        apiFetch('/v1/notifications/unread-count')
      ]);

      const count = countData?.count || 0;
      badge.textContent = count > 0 ? (count > 9 ? '9+' : count) : '';
      badge.style.display = count > 0 ? 'flex' : 'none';

      notifList.innerHTML = '';
      if (!notifs || notifs.length === 0) {
        notifList.innerHTML = '<div style="text-align:center;padding:32px 20px;color:var(--text-muted,#888);font-size:0.875rem;">No notifications yet.</div>';
        return;
      }

      notifs.forEach(n => {
        const item = document.createElement('div');
        const typeColors = { success: '#27ae60', warning: '#f39c12', danger: '#e74c3c', info: '#6366f1' };
        const color = typeColors[n.type] || typeColors.info;
        item.style.cssText = `
          padding:12px 20px; display:flex; align-items:flex-start; gap:12px; cursor:pointer;
          border-left:3px solid ${n.is_read ? 'transparent' : color};
          background:${n.is_read ? 'transparent' : 'rgba(99,102,241,0.04)'};
          transition:background 0.2s;
        `;
        item.onmouseenter = () => item.style.background = 'var(--bg,#f8fafc)';
        item.onmouseleave = () => item.style.background = n.is_read ? 'transparent' : 'rgba(99,102,241,0.04)';

        const dot = `<span style="width:8px;height:8px;border-radius:50%;background:${color};flex-shrink:0;margin-top:4px;opacity:${n.is_read ? 0.3 : 1};"></span>`;
        const timeDate = new Date(n.created_at);
        const _td = timeDate;
        const time = `${String(_td.getDate()).padStart(2,'0')} ${_td.toLocaleDateString('en-GB',{month:'short'})} ${_td.getFullYear()}`;
        item.innerHTML = `
          ${dot}
          <div style="flex:1; min-width:0;">
            <div style="font-size:0.875rem;font-weight:${n.is_read ? 400 : 600};color:var(--text,#1a1a2e);margin-bottom:2px;">${n.title}</div>
            ${n.message ? `<div style="font-size:0.8rem;color:var(--text-muted,#888);white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">${n.message}</div>` : ''}
            <div style="font-size:0.72rem;color:var(--text-muted,#aaa);margin-top:4px;">${time}</div>
          </div>
          <button onclick="event.stopPropagation();deleteNotif('${n.id}')" title="Dismiss" style="background:none;border:none;cursor:pointer;color:var(--text-muted,#aaa);padding:2px;flex-shrink:0;font-size:16px;line-height:1;">×</button>
        `;

        if (!n.is_read) {
          item.addEventListener('click', async () => {
            await apiFetch(`/v1/notifications/${n.id}/read`, { method: 'PATCH' });
            n.is_read = true;
            await loadNotifications();
            if (n.link) window.location.href = n.link;
          });
        } else if (n.link) {
          item.addEventListener('click', () => window.location.href = n.link);
        }

        notifList.appendChild(item);
      });
    } catch (err) {
      console.error('Notifications error:', err);
    }
  }

  window.deleteNotif = async function(id) {
    try {
      await apiFetch(`/v1/notifications/${id}`, { method: 'DELETE' });
      await loadNotifications();
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  markAllBtn?.addEventListener('click', async () => {
    try {
      await apiFetch('/v1/notifications/mark-all-read', { method: 'PATCH' });
      await loadNotifications();
    } catch (err) {
      console.error('Mark all read failed:', err);
    }
  });

  notifIconBtn.addEventListener('click', (e) => {
    e.stopPropagation();
    const isVisible = panel.style.display === 'flex';
    panel.style.display = isVisible ? 'none' : 'flex';
    if (!isVisible) loadNotifications();
  });

  document.addEventListener('click', (e) => {
    if (!panel.contains(e.target) && !notifIconBtn.contains(e.target)) {
      panel.style.display = 'none';
    }
  });

  // Initial load
  loadNotifications();

  // Refresh every 60 seconds
  setInterval(loadNotifications, 60000);
}

/* ---------- Toast notification ---------- */

function showToast(message, type = 'info') {
  // Remove existing toast
  const existing = document.querySelector('.toast-notification');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = `toast-notification toast-${type}`;
  toast.innerHTML = `
    <span class="material-symbols-outlined">${getToastIcon(type)}</span>
    <span>${message}</span>
  `;

  // Toast styles
  Object.assign(toast.style, {
    position: 'fixed',
    top: '24px',
    right: '24px',
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    padding: '14px 24px',
    borderRadius: '10px',
    background: '#fff',
    boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
    zIndex: '9999',
    fontFamily: "'Inter', sans-serif",
    fontSize: '0.875rem',
    fontWeight: '500',
    color: '#2C3E50',
    animation: 'slideInRight 0.3s ease',
    borderLeft: `4px solid ${getToastColor(type)}`
  });

  // Add animation keyframes if not present
  if (!document.getElementById('toast-styles')) {
    const style = document.createElement('style');
    style.id = 'toast-styles';
    style.textContent = `
      @keyframes slideInRight {
        from { transform: translateX(100%); opacity: 0; }
        to { transform: translateX(0); opacity: 1; }
      }
      @keyframes slideOutRight {
        from { transform: translateX(0); opacity: 1; }
        to { transform: translateX(100%); opacity: 0; }
      }
    `;
    document.head.appendChild(style);
  }

  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOutRight 0.3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 3000);
}

function getToastIcon(type) {
  const icons = {
    success: 'check_circle',
    warning: 'warning',
    danger: 'error',
    info: 'info'
  };
  return icons[type] || 'info';
}

function getToastColor(type) {
  const colors = {
    success: '#27ae60',
    warning: '#f39c12',
    danger: '#e74c3c',
    info: '#3498db'
  };
  return colors[type] || '#3498db';
}
