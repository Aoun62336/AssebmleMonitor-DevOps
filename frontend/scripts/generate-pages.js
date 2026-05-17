/* ===== PAGE GENERATOR v2 — Full inline sidebar ===== */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ========== SIDEBAR DEFINITIONS ==========
const sidebarDefs = {
  admin: {
    user: { name: 'Rajesh Kumar', role: 'Super Admin', initials: 'RK' },
    sections: [
      {
        label: 'Main', items: [
          { icon: 'dashboard', text: 'Admin Dashboard', href: 'index.html' }
        ]
      },
      {
        label: 'User Management', items: [
          { icon: 'person_add', text: 'Create User', href: 'create-user.html' },
          { icon: 'group', text: 'Manage Users', href: 'manage-users.html' }
        ]
      },
      {
        label: 'Projects', items: [
          { icon: 'add_circle', text: 'Create Project', href: 'create-project.html' },
          { icon: 'list_alt', text: 'Project List', href: 'project-list.html' }
        ]
      },
      {
        label: 'Operations', items: [
          { icon: 'fact_check', text: 'Attendance View', href: 'attendance.html' },
          { icon: 'account_balance', text: 'Budget Management', href: 'budget.html' },
          { icon: 'payments', text: 'Expense View', href: 'expenses.html' }
        ]
      },
      {
        label: 'Media', items: [
          { icon: 'add_a_photo', text: 'Photo Upload', href: 'photo-upload.html' },
          { icon: 'photo_library', text: 'Photo Gallery', href: 'photo-gallery.html' }
        ]
      },
      {
        label: 'Insights', items: [
          { icon: 'analytics', text: 'Full Analytics', href: 'analytics.html' },
          { icon: 'view_timeline', text: 'Gantt Chart', href: 'gantt.html' }
        ]
      }
    ]
  },
  pm: {
    user: { name: 'Arjun Mehta', role: 'Senior PM', initials: 'AM' },
    sections: [
      {
        label: 'Main', items: [
          { icon: 'dashboard', text: 'PM Dashboard', href: 'index.html' }
        ]
      },
      {
        label: 'Planning', items: [
          { icon: 'layers', text: 'Create Phase', href: 'create-phase.html' },
          { icon: 'add_task', text: 'Create Task', href: 'create-task.html' },
          { icon: 'assignment', text: 'Task Management', href: 'task-management.html' }
        ]
      },
      {
        label: 'Materials', items: [
          { icon: 'inventory_2', text: 'Material Master', href: 'material-master.html' },
          { icon: 'receipt_long', text: 'Material Stock Entry', href: 'material-stock.html' },
          { icon: 'description', text: 'Material Report', href: 'material-report.html' }
        ]
      },
      {
        label: 'Finance', items: [
          { icon: 'add_card', text: 'Expense Entry', href: 'expense-entry.html' },
          { icon: 'payments', text: 'Expense List', href: 'expense-list.html' },
          { icon: 'account_balance', text: 'Budget Summary', href: 'budget-summary.html' }
        ]
      },
      {
        label: 'Operations', items: [
          { icon: 'fact_check', text: 'Attendance View', href: 'attendance.html' }
        ]
      },
      {
        label: 'Media & Insights', items: [
          { icon: 'add_a_photo', text: 'Photo Upload', href: 'photo-upload.html' },
          { icon: 'photo_library', text: 'Photo Gallery', href: 'photo-gallery.html' },
          { icon: 'analytics', text: 'Analytics Dashboard', href: 'analytics.html' },
          { icon: 'view_timeline', text: 'Gantt Chart', href: 'gantt.html' }
        ]
      }
    ]
  },
  se: {
    user: { name: 'Vikram Patel', role: 'Site Engineer', initials: 'VP' },
    sections: [
      {
        label: 'Main', items: [
          { icon: 'dashboard', text: 'Engineer Dashboard', href: 'index.html' }
        ]
      },
      {
        label: 'Field Work', items: [
          { icon: 'assignment', text: 'My Tasks', href: 'my-tasks.html' },
          { icon: 'inventory_2', text: 'Material Usage', href: 'material-usage.html' }
        ]
      },
      {
        label: 'Attendance', items: [
          { icon: 'login', text: 'Check-in / Check-out', href: 'check-in.html' },
          { icon: 'schedule', text: 'Attendance History', href: 'attendance-history.html' }
        ]
      },
      {
        label: 'Reports', items: [
          { icon: 'trending_up', text: 'Performance Progress', href: 'performance.html' }
        ]
      }
    ]
  },
  client: {
    user: { name: 'Neha Sharma', role: 'Client Director', initials: 'NS' },
    sections: [
      {
        label: 'Portfolio', items: [
          { icon: 'dashboard', text: 'Client Dashboard', href: 'index.html' },
          { icon: 'analytics', text: 'Project Progress', href: 'project-progress.html' },
          { icon: 'step', text: 'Phase Progress', href: 'phase-progress.html' },
          { icon: 'photo_library', text: 'Photo Gallery', href: 'photo-gallery.html' },
          { icon: 'view_timeline', text: 'Gantt View', href: 'gantt.html' }
        ]
      }
    ]
  }
};

function buildSidebar(role, activeHref) {
  const def = sidebarDefs[role];
  let html = `    <aside class="sidebar">
      <div class="sidebar-header">
        <img src="/assets/logo.png" alt="AssembleMonitor">
        <span class="sidebar-brand">Assemble<span>Monitor</span></span>
      </div>
      <div class="sidebar-section-label">${def.sections[0].label}</div>
      <nav class="sidebar-nav">\n`;

  def.sections.forEach((section, si) => {
    section.items.forEach(item => {
      const active = item.href === activeHref ? ' class="active"' : '';
      const absHref = `/${role}/${item.href}`;
      html += `        <a href="${absHref}"${active}><span class="material-symbols-outlined">${item.icon}</span> ${item.text}</a>\n`;
    });
    if (si < def.sections.length - 1) {
      html += `        <div class="sidebar-section-label" style="padding-left:0">${def.sections[si + 1].label}</div>\n`;
    }
  });

  html += `        <div class="divider"></div>
        <a href="#" class="logout-btn"><span class="material-symbols-outlined">logout</span> Logout</a>
      </nav>
      <div class="sidebar-footer">
        <div class="sidebar-user">
          <div class="sidebar-user-avatar">${def.user.initials}</div>
          <div class="sidebar-user-info">
            <div class="sidebar-user-name">${def.user.name}</div>
            <div class="sidebar-user-role">${def.user.role}</div>
          </div>
        </div>
      </div>
    </aside>`;
  return html;
}

function makePage(role, filename, title, breadcrumb, contentHTML) {
  const def = sidebarDefs[role];
  const sidebar = buildSidebar(role, filename);
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | AssembleMonitor</title>
  <link rel="stylesheet" href="/css/styles.css">
  <link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200" />
</head>
<body>
  <div class="dashboard">
${sidebar}
    <div class="main-content">
      <header class="topbar">
        <div class="topbar-left">
          <button id="sidebarToggle" class="topbar-icon-btn" style="display:none"><span class="material-symbols-outlined">menu</span></button>
          <div>
            <div class="topbar-title">${title}</div>
            <div class="topbar-breadcrumb">${breadcrumb}</div>
          </div>
        </div>
        <div class="topbar-right">
          <button class="topbar-icon-btn"><span class="material-symbols-outlined">search</span></button>
          <button class="topbar-icon-btn"><span class="material-symbols-outlined">notifications</span><span class="topbar-badge"></span></button>
          <div class="topbar-avatar">${def.user.initials}</div>
        </div>
      </header>
      <div class="dash-content">
${contentHTML}
      </div>
    </div>
  </div>
  <script src="/js/app.js"></script>
</body>
</html>`;
}

// ==================== ADMIN CONTENT ====================
const adminPages = [
  {
    file: 'index.html', title: 'Admin Dashboard', bc: 'Admin &gt; <span>Dashboard</span>', content: `
        <div class="dash-welcome animate-in"><h1>Welcome back, Rajesh 👋</h1><p>Here's a snapshot of your enterprise construction portfolio today.</p></div>
        <div class="stats-grid">
          <div class="stat-card animate-in animate-in-delay-1"><div class="stat-card-header"><div><div class="stat-card-label">Total Projects</div><div class="stat-card-value">24</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">architecture</span></div></div><div class="stat-card-change up"><span class="material-symbols-outlined" style="font-size:14px">trending_up</span> +12% from last quarter</div></div>
          <div class="stat-card animate-in animate-in-delay-2"><div class="stat-card-header"><div><div class="stat-card-label">Active Workforce</div><div class="stat-card-value">3,240</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">groups</span></div></div><div class="stat-card-change up"><span class="material-symbols-outlined" style="font-size:14px">trending_up</span> +5.2% deployment rate</div></div>
          <div class="stat-card animate-in animate-in-delay-3"><div class="stat-card-header"><div><div class="stat-card-label">Budget Utilized</div><div class="stat-card-value">₹42.8 Cr</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">account_balance_wallet</span></div></div><div class="stat-card-change up"><span class="material-symbols-outlined" style="font-size:14px">trending_up</span> On track — 68% allocated</div></div>
          <div class="stat-card animate-in animate-in-delay-4"><div class="stat-card-header"><div><div class="stat-card-label">Pending Alerts</div><div class="stat-card-value">7</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">warning</span></div></div><div class="stat-card-change down"><span class="material-symbols-outlined" style="font-size:14px">trending_down</span> 3 require immediate action</div></div>
        </div>
        <div class="dash-grid">
          <div class="panel animate-in"><div class="panel-header"><span class="panel-title">Enterprise Progress Flow</span><span class="panel-action">View Details →</span></div><div class="panel-body"><div class="chart-placeholder"><div class="chart-bars"><div class="chart-bar" data-height="65px"></div><div class="chart-bar" data-height="90px"></div><div class="chart-bar" data-height="45px"></div><div class="chart-bar" data-height="110px"></div><div class="chart-bar" data-height="75px"></div><div class="chart-bar" data-height="95px"></div><div class="chart-bar" data-height="60px"></div><div class="chart-bar" data-height="85px"></div><div class="chart-bar" data-height="100px"></div><div class="chart-bar" data-height="55px"></div></div><div class="chart-label">Project Completion Rate — 4.2% higher than previous quarter</div></div></div></div>
          <div class="panel animate-in animate-in-delay-1"><div class="panel-header"><span class="panel-title">System Logs</span><span class="panel-action">View All →</span></div><div class="panel-body"><div class="activity-feed"><div class="activity-item"><div class="activity-dot orange"></div><div class="activity-content"><h4>Anil Sharma updated Foundation Blueprint</h4><p>SkyTower Plaza — structural modifications</p><span class="activity-time">14 minutes ago</span></div></div><div class="activity-item"><div class="activity-dot red"></div><div class="activity-content"><h4>Budget Overrun Alert</h4><p>Material Procurement — Current: ₹4,20,000</p><span class="activity-time">2 hours ago</span></div></div><div class="activity-item"><div class="activity-dot green"></div><div class="activity-content"><h4>Phase 3 — Completed</h4><p>Skyline Residency electrical wiring approved</p><span class="activity-time">Yesterday</span></div></div></div></div></div>
        </div>
        <div class="dash-grid-equal">
          <div class="panel animate-in"><div class="panel-header"><span class="panel-title">Alert Center</span></div><div class="panel-body"><div class="alert-item warning"><div class="alert-tag">Cement Shortage</div><p>Site B (Pune) reporting material exhaustion.</p></div><div class="alert-item danger"><div class="alert-tag">Inspection Pending</div><p>Structural audit due for Sector 7 Bridge by EOD.</p></div><div class="alert-item success"><div class="alert-tag">Milestone Achieved</div><p>SkyTower Plaza Phase 2 sign-off completed.</p></div></div></div>
          <div class="panel animate-in animate-in-delay-1"><div class="panel-header"><span class="panel-title">Blueprint Status</span></div><div class="panel-body"><div class="progress-bar-wrapper"><div class="progress-label"><span>SkyTower Plaza</span><span>78%</span></div><div class="progress-track"><div class="progress-fill" style="width:78%"></div></div></div><div class="progress-bar-wrapper"><div class="progress-label"><span>Mumbai Airport</span><span>45%</span></div><div class="progress-track"><div class="progress-fill blue" style="width:45%"></div></div></div><div class="progress-bar-wrapper"><div class="progress-label"><span>Sector 7 Bridge</span><span>92%</span></div><div class="progress-track"><div class="progress-fill green" style="width:92%"></div></div></div><div class="progress-bar-wrapper"><div class="progress-label"><span>Hubli Tech Park</span><span>33%</span></div><div class="progress-track"><div class="progress-fill" style="width:33%"></div></div></div></div></div>
        </div>` },
  {
    file: 'create-user.html', title: 'Create User', bc: 'Admin &gt; <span>Create User</span>', content: `
        <div class="dash-welcome animate-in"><h1>Create New User</h1><p>Create users exactly as defined in the SOW with role-based access and login status control.</p></div>
        <div class="panel animate-in animate-in-delay-1"><div class="panel-header"><span class="panel-title">User Information</span></div><div class="panel-body"><form data-create-user-form><div class="admin-form-grid"><div class="form-group"><label>Full Name</label><input name="name" type="text" class="form-control" placeholder="Enter full name"></div><div class="form-group"><label>Email</label><input name="email" type="email" class="form-control" placeholder="user@company.com"></div><div class="form-group"><label>Password</label><input name="password" type="password" class="form-control" placeholder="Enter password"></div><div class="form-group"><label>Role</label><select name="role" class="form-select"><option value="">Select role</option><option>Project Manager</option><option>Site Engineer</option><option>Client</option></select></div><div class="form-group"><label>Status</label><select name="status" class="form-select"><option>Active</option><option>Inactive</option></select></div></div><div class="form-actions"><button type="submit" class="btn btn-primary"><span class="material-symbols-outlined">person_add</span>Create User</button><button type="reset" class="btn btn-outline">Reset</button></div></form></div></div>` },
  {
    file: 'manage-users.html', title: 'Manage Users', bc: 'Admin &gt; <span>Manage Users</span>', content: `
        <div class="dash-welcome animate-in"><h1>Manage Users</h1><p>See all users with their core credentials and open a full edit form for any selected user.</p></div>
        <div class="stats-grid"><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Total Users</div><div class="stat-card-value" data-user-total>6</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">groups</span></div></div></div><div class="stat-card animate-in animate-in-delay-1"><div class="stat-card-header"><div><div class="stat-card-label">Active Users</div><div class="stat-card-value" data-active-total>5</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">verified_user</span></div></div></div><div class="stat-card animate-in animate-in-delay-2"><div class="stat-card-header"><div><div class="stat-card-label">Inactive Users</div><div class="stat-card-value" data-inactive-total>1</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">block</span></div></div></div></div>
        <div class="panel animate-in"><div class="panel-header"><span class="panel-title">All Users</span><span class="panel-action"><a href="create-user.html" style="color:var(--accent)">+ Add User</a></span></div><div class="panel-body"><div class="manage-users-toolbar"><input type="text" class="form-control" data-user-search placeholder="Search by name, email, role, or status"><div class="role-filter-group"><button type="button" class="role-filter-btn active" data-role-filter="all">All</button><button type="button" class="role-filter-btn" data-role-filter="Project Manager">PM</button><button type="button" class="role-filter-btn" data-role-filter="Site Engineer">Site Engineer</button><button type="button" class="role-filter-btn" data-role-filter="Client">Client</button></div></div></div><div class="panel-body" style="padding:0"><table class="task-table manage-users-table"><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th style="text-align:right;">Edit</th></tr></thead><tbody data-user-table-body><tr data-user-row data-name="Arjun Mehta" data-email="arjun@company.com" data-role="Project Manager" data-status="Active"><td><strong data-field="name">Arjun Mehta</strong></td><td data-field="email">arjun@company.com</td><td data-field="role">Project Manager</td><td><span class="status-badge active" data-field="status">Active</span></td><td class="manage-users-actions"><button type="button" class="table-action-btn" data-user-action="edit">Edit</button></td></tr><tr data-user-row data-name="Vikram Patel" data-email="vikram@company.com" data-role="Site Engineer" data-status="Active"><td><strong data-field="name">Vikram Patel</strong></td><td data-field="email">vikram@company.com</td><td data-field="role">Site Engineer</td><td><span class="status-badge active" data-field="status">Active</span></td><td class="manage-users-actions"><button type="button" class="table-action-btn" data-user-action="edit">Edit</button></td></tr><tr data-user-row data-name="Neha Sharma" data-email="neha@company.com" data-role="Client" data-status="Active"><td><strong data-field="name">Neha Sharma</strong></td><td data-field="email">neha@company.com</td><td data-field="role">Client</td><td><span class="status-badge active" data-field="status">Active</span></td><td class="manage-users-actions"><button type="button" class="table-action-btn" data-user-action="edit">Edit</button></td></tr><tr data-user-row data-name="Priya D." data-email="priya@company.com" data-role="Site Engineer" data-status="Active"><td><strong data-field="name">Priya D.</strong></td><td data-field="email">priya@company.com</td><td data-field="role">Site Engineer</td><td><span class="status-badge active" data-field="status">Active</span></td><td class="manage-users-actions"><button type="button" class="table-action-btn" data-user-action="edit">Edit</button></td></tr><tr data-user-row data-name="Kumar Verma" data-email="kumar@company.com" data-role="Site Engineer" data-status="Inactive"><td><strong data-field="name">Kumar Verma</strong></td><td data-field="email">kumar@company.com</td><td data-field="role">Site Engineer</td><td><span class="status-badge pending" data-field="status">Inactive</span></td><td class="manage-users-actions"><button type="button" class="table-action-btn" data-user-action="edit">Edit</button></td></tr><tr data-user-row data-name="Suresh Rao" data-email="suresh@company.com" data-role="Project Manager" data-status="Active"><td><strong data-field="name">Suresh Rao</strong></td><td data-field="email">suresh@company.com</td><td data-field="role">Project Manager</td><td><span class="status-badge active" data-field="status">Active</span></td><td class="manage-users-actions"><button type="button" class="table-action-btn" data-user-action="edit">Edit</button></td></tr></tbody></table><div class="manage-users-empty" data-empty-state hidden><span class="material-symbols-outlined">manage_search</span><h3>No users match this filter</h3><p>Try a different search term or switch to another role filter.</p></div></div><div class="user-modal-backdrop" data-user-modal hidden><div class="user-modal"><div class="user-modal-header"><div><h3>Edit User</h3><p>Update all user fields here, then save changes or delete that specific user.</p></div><button type="button" class="user-modal-close" data-close-user-modal><span class="material-symbols-outlined">close</span></button></div><form class="user-modal-form" data-user-edit-form><div class="admin-form-grid"><div class="form-group"><label>Full Name</label><input id="editUserName" name="name" type="text" class="form-control"></div><div class="form-group"><label>Email</label><input id="editUserEmail" name="email" type="email" class="form-control"></div><div class="form-group"><label>Password</label><input id="editUserPassword" name="password" type="password" class="form-control" placeholder="Enter new password if needed"></div><div class="form-group"><label>Role</label><select id="editUserRole" name="role" class="form-select"><option>Project Manager</option><option>Site Engineer</option><option>Client</option></select></div><div class="form-group"><label>Status</label><select id="editUserStatus" name="status" class="form-select"><option>Active</option><option>Inactive</option></select></div></div><div class="form-actions form-actions-between"><button type="button" class="btn btn-outline btn-danger-outline" data-delete-user>Delete User</button><div class="modal-action-group"><button type="submit" class="btn btn-primary">Save Changes</button><button type="button" class="btn btn-outline" data-close-user-modal>Cancel</button></div></div></form></div></div>` },
  {
    file: 'create-project.html', title: 'Create Project', bc: 'Admin &gt; <span>Create Project</span>', content: `
        <div class="dash-welcome animate-in"><h1>Create New Project</h1><p>Register a new construction project, assign the project manager, and clearly map one or more site engineers before activation.</p></div>
        <div class="panel animate-in"><div class="panel-header"><span class="panel-title">Project Details & Assignments</span></div><div class="panel-body"><form data-project-form><div class="admin-form-grid"><div class="form-group"><label>Project Name</label><input id="projectName" type="text" class="form-control" placeholder="e.g. Skyline Residency Phase II"></div><div class="form-group"><label>Location</label><input id="projectLocation" type="text" class="form-control" placeholder="City, State"></div><div class="form-group"><label>Start Date</label><input id="projectStartDate" type="date" class="form-control"></div><div class="form-group"><label>Expected Completion</label><input id="projectEndDate" type="date" class="form-control"></div><div class="form-group"><label>Total Budget (Rs.)</label><input id="projectBudget" type="text" class="form-control" placeholder="e.g. 18,50,00,000"></div><div class="form-group"><label>Project Manager</label><select id="projectManager" class="form-select"><option value="">Select project manager</option><option>Arjun Mehta</option><option>Suresh Rao</option><option>Meenal Kulkarni</option></select></div><div class="form-group admin-form-span-full"><label>Site Engineers</label><div class="assignment-callout"><span class="material-symbols-outlined">group_add</span><div><strong>Assign one or more site engineers</strong><p>Search, select, and review assigned engineers without relying on Ctrl/Cmd multi-select.</p></div></div><div class="engineer-picker" data-engineer-picker><div class="engineer-picker-control"><div class="engineer-picker-tags" data-engineer-tags><span class="engineer-picker-placeholder">No site engineers selected yet.</span></div><div class="engineer-picker-actions"><input type="text" class="form-control engineer-picker-search" data-engineer-search placeholder="Search by engineer name"><button type="button" class="btn btn-outline engineer-picker-clear" data-clear-engineers>Clear</button></div></div><div class="engineer-picker-dropdown" data-engineer-options><label class="engineer-option"><input type="checkbox" value="Vikram Patel"><span><strong>Vikram Patel</strong><small>Structural execution • Skyline Residency</small></span></label><label class="engineer-option"><input type="checkbox" value="Priya D."><span><strong>Priya D.</strong><small>Concrete quality • Mumbai Airport</small></span></label><label class="engineer-option"><input type="checkbox" value="Amit Singh"><span><strong>Amit Singh</strong><small>MEP coordination • Titanium Hub</small></span></label><label class="engineer-option"><input type="checkbox" value="Rohan Iyer"><span><strong>Rohan Iyer</strong><small>Finishing oversight • Sector 7 Bridge</small></span></label></div><div class="engineer-picker-summary"><span class="engineer-selection-count" data-selection-count>0 engineers selected</span><span class="text-muted">Selected engineers will receive access when the project is created.</span></div><select class="form-select" multiple hidden data-native-engineers><option>Vikram Patel</option><option>Priya D.</option><option>Amit Singh</option><option>Rohan Iyer</option></select></div></div><div class="form-group"><label>Client</label><select id="projectClient" class="form-select"><option value="">Select client</option><option>Neha Sharma</option><option>ABC Corp</option><option>Urban Crest Holdings</option></select></div><div class="form-group"><label>Launch Priority</label><select id="projectPriority" class="form-select"><option>Standard</option><option>High Priority</option><option>Fast Track</option></select></div><div class="form-group admin-form-span-full"><label>Description</label><textarea id="projectDescription" class="form-control" rows="4" placeholder="Brief project scope, delivery expectations, and handover notes..."></textarea></div></div><div class="form-actions"><button type="submit" class="btn btn-primary" data-create-project-submit><span class="material-symbols-outlined">add_circle</span> Create Project</button><button type="button" class="btn btn-outline" data-project-reset>Reset</button></div></form></div></div>` },
  {
    file: 'project-list.html', title: 'Project List', bc: 'Admin &gt; <span>Project List</span>', content: `
        <div class="dash-welcome animate-in"><h1>Project List</h1><p>All registered construction projects across the enterprise.</p></div>
        <div class="stats-grid" style="margin-bottom:24px"><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Total</div><div class="stat-card-value">12</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">architecture</span></div></div></div><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Active</div><div class="stat-card-value">08</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">play_circle</span></div></div></div><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Completed</div><div class="stat-card-value">04</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">check_circle</span></div></div></div><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Budget</div><div class="stat-card-value">₹62 Cr</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">account_balance</span></div></div></div></div>
        <div class="panel animate-in"><div class="panel-header"><span class="panel-title">All Projects</span><span class="panel-action"><a href="create-project.html" style="color:var(--accent)">+ New Project</a></span></div><div class="panel-body" style="padding:0"><table class="task-table"><thead><tr><th>Project</th><th>Location</th><th>PM</th><th>Budget</th><th>Progress</th><th>Status</th></tr></thead><tbody><tr><td><strong>SkyTower Plaza</strong></td><td>Mumbai</td><td>Arjun Mehta</td><td>₹22 Cr</td><td>78%</td><td><span class="status-badge active">On Track</span></td></tr><tr><td><strong>Mumbai Airport</strong></td><td>Mumbai</td><td>Suresh Rao</td><td>₹45 Cr</td><td>45%</td><td><span class="status-badge progress">In Progress</span></td></tr><tr><td><strong>Titanium Hub</strong></td><td>Ahmedabad</td><td>Arjun Mehta</td><td>₹18.5 Cr</td><td>68%</td><td><span class="status-badge active">On Track</span></td></tr><tr><td><strong>Sector 7 Bridge</strong></td><td>Pune</td><td>Suresh Rao</td><td>₹8 Cr</td><td>92%</td><td><span class="status-badge active">Near Complete</span></td></tr><tr><td><strong>Hubli Tech Park</strong></td><td>Hubli</td><td>Arjun Mehta</td><td>₹12 Cr</td><td>33%</td><td><span class="status-badge pending">Delayed</span></td></tr></tbody></table></div></div>` },
  {
    file: 'attendance.html', title: 'Attendance View', bc: 'Admin &gt; <span>Attendance View</span>', content: `
        <div class="dash-welcome animate-in"><h1>Attendance View</h1><p>Monitor workforce attendance across all project sites.</p></div>
        <div class="stats-grid" style="margin-bottom:24px"><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Present</div><div class="stat-card-value">2,890</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">check_circle</span></div></div></div><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Absent</div><div class="stat-card-value">350</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">cancel</span></div></div></div><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">On Leave</div><div class="stat-card-value">120</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">event_busy</span></div></div></div><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Avg. Rate</div><div class="stat-card-value">89%</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">percent</span></div></div></div></div>
        <div class="panel animate-in"><div class="panel-header"><span class="panel-title">Today's Attendance</span><span class="panel-action">Export CSV →</span></div><div class="panel-body" style="padding:0"><table class="task-table" id="attendanceTable"><thead><tr><th>Employee Name</th><th>Role</th><th>Project/Site</th><th>Check-In</th><th>Check-Out</th><th>Hours</th><th>Status</th></tr></thead><tbody><tr><td><strong>Vikram Patel</strong></td><td>Site Engineer</td><td>SkyTower Plaza</td><td>08:30</td><td>—</td><td></td><td><span class="status-badge active">Present</span></td></tr><tr><td><strong>Kumar Verma</strong></td><td>Foreman</td><td>SkyTower Plaza</td><td>07:45</td><td>17:15</td><td></td><td><span class="status-badge active">Present</span></td></tr><tr><td><strong>Amit Singh</strong></td><td>Electrician</td><td>Mumbai Airport</td><td>—</td><td>—</td><td></td><td><span class="status-badge overdue">Absent</span></td></tr><tr><td><strong>Ravi Sharma</strong></td><td>Mason</td><td>Titanium Hub</td><td>09:00</td><td>—</td><td></td><td><span class="status-badge pending">Late</span></td></tr><tr><td><strong>Priya D.</strong></td><td>Site Engineer</td><td>Titanium Hub</td><td>08:15</td><td>18:30</td><td></td><td><span class="status-badge active">Present</span></td></tr><tr><td><strong>Rahul K.</strong></td><td>Mason</td><td>Hubli Tech Park</td><td>—</td><td>—</td><td></td><td><span class="status-badge overdue">Absent</span></td></tr><tr><td><strong>Rohan Iyer</strong></td><td>Site Engineer</td><td>Sector 7 Bridge</td><td>08:00</td><td>17:30</td><td></td><td><span class="status-badge active">Present</span></td></tr></tbody></table></div></div>
<script>
  document.addEventListener("DOMContentLoaded", function() {
    const rows = document.querySelectorAll('#attendanceTable tbody tr');
    rows.forEach(row => {
      const checkIn = row.cells[3].innerText.trim();
      const checkOut = row.cells[4].innerText.trim();
      const hoursCell = row.cells[5];
      
      if (checkIn && checkIn !== '—' && checkOut && checkOut !== '—') {
        const [inH, inM] = checkIn.split(':').map(Number);
        const [outH, outM] = checkOut.split(':').map(Number);
        let start = inH * 60 + inM;
        let end = outH * 60 + outM;
        let diff = end - start;
        if (diff < 0) diff += 24 * 60;
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        hoursCell.innerText = h + 'h' + (m > 0 ? ' ' + m + 'm' : '');
      } else {
        hoursCell.innerText = '—';
      }
    });
  });
</script>` },
  {
    file: 'budget.html', title: 'Budget Management', bc: 'Admin &gt; <span>Budget Management</span>', content: `
        <div class="dash-welcome animate-in"><h1>Budget Management</h1><p>Edit and track budget allocations across all projects.</p></div>
        <div class="stats-grid" style="margin-bottom:24px"><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Total Budget</div><div class="stat-card-value">₹62 Cr</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">account_balance</span></div></div></div><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Spent</div><div class="stat-card-value">₹42.8 Cr</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">payments</span></div></div></div><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Remaining</div><div class="stat-card-value">₹19.2 Cr</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">savings</span></div></div></div><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Utilization</div><div class="stat-card-value">69%</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">pie_chart</span></div></div></div></div>
        <div class="panel animate-in"><div class="panel-header"><span class="panel-title">Budget by Project</span><span class="panel-action">Edit Budget →</span></div><div class="panel-body"><div class="progress-bar-wrapper"><div class="progress-label"><span>SkyTower Plaza — ₹22 Cr</span><span>78% spent</span></div><div class="progress-track"><div class="progress-fill" style="width:78%"></div></div></div><div class="progress-bar-wrapper"><div class="progress-label"><span>Mumbai Airport — ₹45 Cr</span><span>45% spent</span></div><div class="progress-track"><div class="progress-fill blue" style="width:45%"></div></div></div><div class="progress-bar-wrapper"><div class="progress-label"><span>Titanium Hub — ₹18.5 Cr</span><span>68% spent</span></div><div class="progress-track"><div class="progress-fill green" style="width:68%"></div></div></div><div class="progress-bar-wrapper"><div class="progress-label"><span>Sector 7 Bridge — ₹8 Cr</span><span>92% spent</span></div><div class="progress-track"><div class="progress-fill" style="width:92%"></div></div></div></div></div>` },
  {
    file: 'expenses.html', title: 'Expense View', bc: 'Admin &gt; <span>Expense View</span>', content: `
        <div class="dash-welcome animate-in"><h1>Expense View</h1><p>Review all expense records across the portfolio.</p></div>
        <div class="panel animate-in"><div class="panel-header"><span class="panel-title">Expense Records</span><span class="panel-action">Export →</span></div><div class="panel-body" style="padding:0"><table class="task-table"><thead><tr><th>Date</th><th>Description</th><th>Project</th><th>Category</th><th>Amount</th><th>Entered By</th></tr></thead><tbody><tr><td>11 Apr</td><td><strong>Labour Wages W14</strong></td><td>Mumbai Airport</td><td><span class="category-badge labour">Labour Payment</span></td><td>₹8,40,000</td><td>Suresh Rao (PM)</td></tr><tr><td>10 Apr</td><td><strong>Crane Rental</strong></td><td>Sector 7</td><td><span class="category-badge equipment">Equipment Rental</span></td><td>₹2,50,000</td><td>Suresh Rao (PM)</td></tr><tr><td>09 Apr</td><td><strong>Site Visit Transport</strong></td><td>SkyTower</td><td><span class="category-badge transport">Transportation</span></td><td>₹12,000</td><td>Arjun Mehta (PM)</td></tr><tr><td>08 Apr</td><td><strong>Office Stationery</strong></td><td>Titanium</td><td><span class="category-badge misc">Miscellaneous</span></td><td>₹4,500</td><td>Arjun Mehta (PM)</td></tr></tbody></table></div></div>` },
  {
    file: 'photo-upload.html', title: 'Photo Upload', bc: 'Admin &gt; <span>Photo Upload</span>', content: `
        <div class="dash-welcome animate-in"><h1>Photo Upload</h1><p>Upload site photographs for documentation and tracking.</p></div>
        <div class="panel animate-in"><div class="panel-header"><span class="panel-title">Upload New Photos</span></div><div class="panel-body"><div style="border:2px dashed var(--border);border-radius:var(--radius);padding:60px;text-align:center;background:var(--bg)"><span class="material-symbols-outlined" style="font-size:48px;color:var(--accent);display:block;margin-bottom:16px">cloud_upload</span><h3 style="color:var(--primary);margin-bottom:8px">Drag & drop photos here</h3><p style="color:var(--text-muted);font-size:0.875rem;margin-bottom:16px">JPG, PNG up to 10MB each</p><button class="btn btn-primary"><span class="material-symbols-outlined">add_a_photo</span> Select Files</button></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:24px"><div class="form-group"><label>Project</label><select class="form-select"><option value="">Select Project</option><option>SkyTower Plaza</option><option>Mumbai Airport</option><option>Titanium Hub</option><option>Sector 7 Bridge</option><option>Hubli Tech Park</option></select></div><div class="form-group"><label>Category</label><select class="form-select"><option value="">Select Category</option><option>Progress</option><option>Foundation</option><option>Structural</option><option>Finishing</option><option>Material Delivery</option><option>Equipment</option><option>Labour</option><option>Safety Audit</option><option>Inspection</option><option>Issue / Delay</option></select></div><div class="form-group"><label>Uploaded By (auto)</label><input type="text" class="form-control" value="Rajesh Kumar" readonly style="background:var(--bg);cursor:not-allowed;"></div><div class="form-group"><label>Date</label><input type="date" class="form-control" id="uploadDate" readonly style="background:var(--bg);cursor:not-allowed;"></div></div></div></div><script>document.getElementById('uploadDate').valueAsDate = new Date();</script>` },
  {
    file: 'photo-gallery.html', title: 'Photo Gallery', bc: 'Admin &gt; <span>Photo Gallery</span>', content: `
        <div class="dash-welcome animate-in"><h1>Photo Gallery</h1><p>Browse site photographs across all projects.</p></div>
        <div class="panel animate-in"><div class="panel-header"><span class="panel-title">Gallery</span><span class="panel-action"><a href="photo-upload.html" style="color:var(--accent)">+ Upload</a></span></div><div class="panel-body"><div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:20px"><select id="galleryProjectFilter" class="form-select" style="min-width:200px"><option value="all">All Projects</option><option value="SkyTower Plaza">SkyTower Plaza</option><option value="Mumbai Airport">Mumbai Airport</option><option value="Titanium Hub">Titanium Hub</option><option value="Sector 7 Bridge">Sector 7 Bridge</option><option value="Hubli Tech Park">Hubli Tech Park</option></select><select id="galleryCategoryFilter" class="form-select" style="min-width:200px"><option value="all">All Categories</option><option value="Progress">Progress</option><option value="Foundation">Foundation</option><option value="Structural">Structural</option><option value="Finishing">Finishing</option><option value="Material Delivery">Material Delivery</option><option value="Equipment">Equipment</option><option value="Labour">Labour</option><option value="Safety Audit">Safety Audit</option><option value="Inspection">Inspection</option><option value="Issue / Delay">Issue / Delay</option></select></div><div class="dash-grid-3" id="photoGalleryGrid"><div class="photo-card" data-project="SkyTower Plaza" data-category="Foundation" style="background:linear-gradient(135deg,#2C3E50,#34495E);border-radius:var(--radius-sm);height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(255,255,255,0.8);gap:8px"><span class="material-symbols-outlined" style="font-size:36px;color:var(--accent)">photo_camera</span><span style="font-size:0.813rem;font-weight:600">Foundation</span><span style="font-size:0.688rem;opacity:0.6">SkyTower Plaza • 2 hours ago</span><span style="font-size:0.688rem;opacity:0.6;font-style:italic">By: Arjun Mehta</span></div><div class="photo-card" data-project="Mumbai Airport" data-category="Structural" style="background:linear-gradient(135deg,#34495E,#2C3E50);border-radius:var(--radius-sm);height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(255,255,255,0.8);gap:8px"><span class="material-symbols-outlined" style="font-size:36px;color:var(--accent)">photo_camera</span><span style="font-size:0.813rem;font-weight:600">Structural</span><span style="font-size:0.688rem;opacity:0.6">Mumbai Airport • 1 day ago</span><span style="font-size:0.688rem;opacity:0.6;font-style:italic">By: Suresh Rao</span></div><div class="photo-card" data-project="Titanium Hub" data-category="Equipment" style="background:linear-gradient(135deg,#2C3E50,#1a252f);border-radius:var(--radius-sm);height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(255,255,255,0.8);gap:8px"><span class="material-symbols-outlined" style="font-size:36px;color:var(--accent)">photo_camera</span><span style="font-size:0.813rem;font-weight:600">Equipment</span><span style="font-size:0.688rem;opacity:0.6">Titanium Hub • 3 days ago</span><span style="font-size:0.688rem;opacity:0.6;font-style:italic">By: Arjun Mehta</span></div><div class="photo-card" data-project="Sector 7 Bridge" data-category="Progress" style="background:linear-gradient(135deg,#1a252f,#2C3E50);border-radius:var(--radius-sm);height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(255,255,255,0.8);gap:8px"><span class="material-symbols-outlined" style="font-size:36px;color:var(--accent)">photo_camera</span><span style="font-size:0.813rem;font-weight:600">Progress</span><span style="font-size:0.688rem;opacity:0.6">Sector 7 Bridge • 4 days ago</span><span style="font-size:0.688rem;opacity:0.6;font-style:italic">By: Suresh Rao</span></div><div class="photo-card" data-project="Hubli Tech Park" data-category="Safety Audit" style="background:linear-gradient(135deg,#34495E,#1a252f);border-radius:var(--radius-sm);height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(255,255,255,0.8);gap:8px"><span class="material-symbols-outlined" style="font-size:36px;color:var(--accent)">photo_camera</span><span style="font-size:0.813rem;font-weight:600">Safety Audit</span><span style="font-size:0.688rem;opacity:0.6">Hubli Tech Park • 5 days ago</span><span style="font-size:0.688rem;opacity:0.6;font-style:italic">By: Vikram Patel</span></div><div class="photo-card" data-project="Mumbai Airport" data-category="Inspection" style="background:linear-gradient(135deg,#2C3E50,#34495E);border-radius:var(--radius-sm);height:200px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(255,255,255,0.8);gap:8px"><span class="material-symbols-outlined" style="font-size:36px;color:var(--accent)">photo_camera</span><span style="font-size:0.813rem;font-weight:600">Inspection</span><span style="font-size:0.688rem;opacity:0.6">Mumbai Airport • 1 week ago</span><span style="font-size:0.688rem;opacity:0.6;font-style:italic">By: Neha Sharma</span></div></div></div></div>
        <script>
          document.addEventListener("DOMContentLoaded", function() {
            const pF = document.getElementById('galleryProjectFilter');
            const cF = document.getElementById('galleryCategoryFilter');
            const cards = document.querySelectorAll('.photo-card');
            function filterAll() {
              const pV = pF.value;
              const cV = cF.value;
              cards.forEach(c => {
                const pM = (pV === 'all' || c.dataset.project === pV);
                const cM = (cV === 'all' || c.dataset.category === cV);
                c.style.display = (pM && cM) ? 'flex' : 'none';
              });
            }
            if(pF && cF) {
              pF.addEventListener('change', filterAll);
              cF.addEventListener('change', filterAll);
            }
          });
        </script>` },
  {
    file: 'analytics.html', title: 'Full Analytics', bc: 'Admin &gt; <span>Full Analytics</span>', content: `
        <div class="dash-welcome animate-in"><h1>Full Analytics Dashboard</h1><p>Enterprise-wide data insights and performance metrics.</p></div>
        <div class="stats-grid"><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Tasks Done</div><div class="stat-card-value">1,847</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">task_alt</span></div></div></div><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">On-Time Rate</div><div class="stat-card-value">94.2%</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">speed</span></div></div></div><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Cost Efficiency</div><div class="stat-card-value">87%</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">savings</span></div></div></div><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Safety Score</div><div class="stat-card-value">98%</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">health_and_safety</span></div></div></div></div>
        <div class="dash-grid-equal"><div class="panel animate-in"><div class="panel-header"><span class="panel-title">Completion Trend</span></div><div class="panel-body"><div class="chart-placeholder"><div class="chart-bars"><div class="chart-bar" data-height="50px"></div><div class="chart-bar" data-height="70px"></div><div class="chart-bar" data-height="90px"></div><div class="chart-bar" data-height="85px"></div><div class="chart-bar" data-height="110px"></div><div class="chart-bar" data-height="95px"></div><div class="chart-bar" data-height="100px"></div></div><div class="chart-label">Monthly completion — Last 7 months</div></div></div></div><div class="panel animate-in"><div class="panel-header"><span class="panel-title">Budget Utilization</span></div><div class="panel-body"><div class="chart-placeholder"><div class="chart-bars"><div class="chart-bar" data-height="40px"></div><div class="chart-bar" data-height="55px"></div><div class="chart-bar" data-height="75px"></div><div class="chart-bar" data-height="70px"></div><div class="chart-bar" data-height="85px"></div><div class="chart-bar" data-height="90px"></div><div class="chart-bar" data-height="95px"></div></div><div class="chart-label">Monthly spend vs allocation</div></div></div></div></div>` },
  {
    file: 'gantt.html', title: 'Gantt Chart', bc: 'Admin &gt; <span>Gantt Chart</span>', content: `
        <div class="dash-welcome animate-in"><h1>Gantt Chart</h1><p>Visual project timeline and phase dependencies.</p></div>
        <div class="panel animate-in">
          <div class="panel-header" style="display:flex;align-items:center;justify-content:space-between;gap:16px">
            <span class="panel-title">Project Timeline</span>
            <div style="display:flex;align-items:center;gap:10px">
              <label for="projectSelect" style="font-size:0.875rem;color:var(--text-muted);white-space:nowrap">Select project:</label>
              <select id="projectSelect" data-gantt-select class="form-select" style="min-width:220px">
                <option>SkyTower Plaza</option>
                <option>Mumbai Airport</option>
                <option>Titanium Hub</option>
                <option>Sector 7 Bridge</option>
                <option>Hubli Tech Park</option>
              </select>
            </div>
          </div>
          <div class="panel-body">
            <div id="ganttTimeline">
              <div class="gantt-project" data-gantt-project="SkyTower Plaza">
                <div style="overflow-x:auto">
                  <div style="min-width:800px">
                    <div style="display:grid;grid-template-columns:200px 1fr;gap:0;border:1px solid var(--border);border-radius:var(--radius-sm)">
                      <div style="padding:12px 16px;font-weight:600;font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);background:var(--bg);border-bottom:1px solid var(--border)">Task / Phase</div>
                      <div style="padding:12px 16px;font-weight:600;font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);background:var(--bg);border-bottom:1px solid var(--border);display:flex;justify-content:space-between"><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Foundation</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--success);height:20px;border-radius:4px;width:95%"></div></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Structural</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--info);height:20px;border-radius:4px;width:70%;margin-left:10%"></div></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">MEP</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--accent);height:20px;border-radius:4px;width:50%;margin-left:25%"></div></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Interior</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--primary);opacity:0.4;height:20px;border-radius:4px;width:40%;margin-left:45%"></div></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500">Handover</div>
                      <div style="padding:10px 16px"><div style="background:var(--text-muted);opacity:0.3;height:20px;border-radius:4px;width:15%;margin-left:80%"></div></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="gantt-project" data-gantt-project="Mumbai Airport" style="display:none">
                <div style="overflow-x:auto">
                  <div style="min-width:800px">
                    <div style="display:grid;grid-template-columns:200px 1fr;gap:0;border:1px solid var(--border);border-radius:var(--radius-sm)">
                      <div style="padding:12px 16px;font-weight:600;font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);background:var(--bg);border-bottom:1px solid var(--border)">Task / Phase</div>
                      <div style="padding:12px 16px;font-weight:600;font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);background:var(--bg);border-bottom:1px solid var(--border);display:flex;justify-content:space-between"><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Mobilization</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--success);height:20px;border-radius:4px;width:55%"></div></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Foundation</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--info);height:20px;border-radius:4px;width:85%;margin-left:5%"></div></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Superstructure</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--accent);height:20px;border-radius:4px;width:65%;margin-left:15%"></div></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Facade</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--primary);opacity:0.4;height:20px;border-radius:4px;width:40%;margin-left:55%"></div></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500">Commissioning</div>
                      <div style="padding:10px 16px"><div style="background:var(--text-muted);opacity:0.3;height:20px;border-radius:4px;width:20%;margin-left:70%"></div></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="gantt-project" data-gantt-project="Titanium Hub" style="display:none">
                <div style="overflow-x:auto">
                  <div style="min-width:800px">
                    <div style="display:grid;grid-template-columns:200px 1fr;gap:0;border:1px solid var(--border);border-radius:var(--radius-sm)">
                      <div style="padding:12px 16px;font-weight:600;font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);background:var(--bg);border-bottom:1px solid var(--border)">Task / Phase</div>
                      <div style="padding:12px 16px;font-weight:600;font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);background:var(--bg);border-bottom:1px solid var(--border);display:flex;justify-content:space-between"><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Design</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--success);height:20px;border-radius:4px;width:35%"></div></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Structure</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--info);height:20px;border-radius:4px;width:90%;margin-left:5%"></div></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">MEP</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--accent);height:20px;border-radius:4px;width:45%;margin-left:35%"></div></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Finishing</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--primary);opacity:0.4;height:20px;border-radius:4px;width:25%;margin-left:60%"></div></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500">Handover</div>
                      <div style="padding:10px 16px"><div style="background:var(--text-muted);opacity:0.3;height:20px;border-radius:4px;width:18%;margin-left:75%"></div></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="gantt-project" data-gantt-project="Sector 7 Bridge" style="display:none">
                <div style="overflow-x:auto">
                  <div style="min-width:800px">
                    <div style="display:grid;grid-template-columns:200px 1fr;gap:0;border:1px solid var(--border);border-radius:var(--radius-sm)">
                      <div style="padding:12px 16px;font-weight:600;font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);background:var(--bg);border-bottom:1px solid var(--border)">Task / Phase</div>
                      <div style="padding:12px 16px;font-weight:600;font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);background:var(--bg);border-bottom:1px solid var(--border);display:flex;justify-content:space-between"><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Site Prep</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--success);height:20px;border-radius:4px;width:80%"></div></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Piling</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--info);height:20px;border-radius:4px;width:70%;margin-left:10%"></div></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Decking</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--accent);height:20px;border-radius:4px;width:50%;margin-left:25%"></div></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Finishes</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--primary);opacity:0.4;height:20px;border-radius:4px;width:30%;margin-left:60%"></div></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500">Inspection</div>
                      <div style="padding:10px 16px"><div style="background:var(--text-muted);opacity:0.3;height:20px;border-radius:4px;width:25%;margin-left:65%"></div></div>
                    </div>
                  </div>
                </div>
              </div>
              <div class="gantt-project" data-gantt-project="Hubli Tech Park" style="display:none">
                <div style="overflow-x:auto">
                  <div style="min-width:800px">
                    <div style="display:grid;grid-template-columns:200px 1fr;gap:0;border:1px solid var(--border);border-radius:var(--radius-sm)">
                      <div style="padding:12px 16px;font-weight:600;font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);background:var(--bg);border-bottom:1px solid var(--border)">Task / Phase</div>
                      <div style="padding:12px 16px;font-weight:600;font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);background:var(--bg);border-bottom:1px solid var(--border);display:flex;justify-content:space-between"><span>Apr</span><span>May</span><span>Jun</span><span>Jul</span><span>Aug</span><span>Sep</span></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Permits</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--success);height:20px;border-radius:4px;width:35%"></div></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Foundation</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--info);height:20px;border-radius:4px;width:60%;margin-left:10%"></div></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Core & Shell</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--accent);height:20px;border-radius:4px;width:40%;margin-left:30%"></div></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">MEP</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--primary);opacity:0.4;height:20px;border-radius:4px;width:25%;margin-left:55%"></div></div>
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500">Handover</div>
                      <div style="padding:10px 16px"><div style="background:var(--text-muted);opacity:0.3;height:20px;border-radius:4px;width:12%;margin-left:78%"></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <script>
          const projectSelect = document.getElementById('projectSelect');
          const projectPanels = document.querySelectorAll('#ganttTimeline .gantt-project');
          function showProject(project) {
            projectPanels.forEach(panel => panel.style.display = panel.dataset.ganttProject === project ? 'block' : 'none');
          }
          projectSelect.addEventListener('change', e => showProject(e.target.value));
          showProject(projectSelect.value);
        </script>` }
];

// ==================== PM CONTENT ====================
const pmPages = [
  {
    file: 'index.html', title: 'PM Dashboard', bc: 'PM Module &gt; <span>Dashboard</span>', content: `
        <div class="dash-welcome animate-in"><h1>Project Execution Hub 🔧</h1><p>Real-time oversight for Skyline Residency. 14 days remaining in Phase 4.</p></div>
        <div class="stats-grid"><div class="stat-card animate-in animate-in-delay-1"><div class="stat-card-header"><div><div class="stat-card-label">Global Completion</div><div class="stat-card-value">72%</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">pie_chart</span></div></div><div class="stat-card-change up"><span class="material-symbols-outlined" style="font-size:14px">trending_up</span> +6.4% from last phase</div></div><div class="stat-card animate-in animate-in-delay-2"><div class="stat-card-header"><div><div class="stat-card-label">Active Tasks</div><div class="stat-card-value">38</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">task_alt</span></div></div><div class="stat-card-change up"><span class="material-symbols-outlined" style="font-size:14px">trending_up</span> 12 completed this week</div></div><div class="stat-card animate-in animate-in-delay-3"><div class="stat-card-header"><div><div class="stat-card-label">Budget Used</div><div class="stat-card-value">₹18.5 Cr</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">account_balance_wallet</span></div></div><div class="stat-card-change up"><span class="material-symbols-outlined" style="font-size:14px">trending_up</span> Within 3% of allocation</div></div><div class="stat-card animate-in animate-in-delay-4"><div class="stat-card-header"><div><div class="stat-card-label">Urgent Alerts</div><div class="stat-card-value">3</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">priority_high</span></div></div><div class="stat-card-change down"><span class="material-symbols-outlined" style="font-size:14px">trending_down</span> 2 require escalation</div></div></div>
        <div class="dash-grid"><div class="panel animate-in"><div class="panel-header"><span class="panel-title">Completion Progress</span></div><div class="panel-body"><div class="progress-bar-wrapper"><div class="progress-label"><span>Skyline — Phase 4</span><span>72%</span></div><div class="progress-track"><div class="progress-fill" style="width:72%"></div></div></div><div class="progress-bar-wrapper"><div class="progress-label"><span>Foundation</span><span>95%</span></div><div class="progress-track"><div class="progress-fill green" style="width:95%"></div></div></div><div class="progress-bar-wrapper"><div class="progress-label"><span>Framing</span><span>80%</span></div><div class="progress-track"><div class="progress-fill blue" style="width:80%"></div></div></div><div class="progress-bar-wrapper"><div class="progress-label"><span>MEP</span><span>55%</span></div><div class="progress-track"><div class="progress-fill" style="width:55%"></div></div></div><div class="chart-placeholder" style="margin-top:20px;height:160px"><div class="chart-bars"><div class="chart-bar" data-height="70px"></div><div class="chart-bar" data-height="100px"></div><div class="chart-bar" data-height="50px"></div><div class="chart-bar" data-height="85px"></div><div class="chart-bar" data-height="60px"></div><div class="chart-bar" data-height="95px"></div></div><div class="chart-label">Weekly task trend</div></div></div></div><div class="panel animate-in animate-in-delay-1"><div class="panel-header"><span class="panel-title">Recent Activity</span></div><div class="panel-body"><div class="activity-feed"><div class="activity-item"><div class="activity-dot orange"></div><div class="activity-content"><h4>Cement Stock Updated</h4><p>500 bags added — ₹1,85,000</p><span class="activity-time">14 min ago</span></div></div><div class="activity-item"><div class="activity-dot blue"></div><div class="activity-content"><h4>Task Reassigned</h4><p>Foundation Pour → Suresh R.</p><span class="activity-time">2 hours ago</span></div></div><div class="activity-item"><div class="activity-dot green"></div><div class="activity-content"><h4>Photos Uploaded</h4><p>12 images from slab inspection</p><span class="activity-time">5 hours ago</span></div></div></div></div></div></div>
        <div class="dash-grid-equal"><div class="panel animate-in"><div class="panel-header"><span class="panel-title">Urgent Alerts</span></div><div class="panel-body"><div class="alert-item danger"><div class="alert-tag">Plumbing</div><p>Contractor missing at Zone C.</p></div><div class="alert-item warning"><div class="alert-tag">Steel TMT</div><p>Stock: 1.2T. Next phase needs 4T.</p></div></div></div><div class="panel animate-in"><div class="panel-header"><span class="panel-title">Quick Actions</span></div><div class="panel-body"><div class="quick-actions"><button class="quick-action-btn"><span class="material-symbols-outlined">layers</span> Create Phase</button><button class="quick-action-btn"><span class="material-symbols-outlined">add_task</span> New Task</button><button class="quick-action-btn"><span class="material-symbols-outlined">inventory_2</span> Stock Entry</button><button class="quick-action-btn"><span class="material-symbols-outlined">add_card</span> Log Expense</button></div></div></div></div>` },
  { file: 'create-phase.html', title: 'Create Phase', bc: 'PM &gt; <span>Create Phase</span>', content: `<div class="dash-welcome animate-in"><h1>Create New Phase</h1><p>Define a new construction phase for the active project.</p></div><div class="panel animate-in"><div class="panel-header"><span class="panel-title">Phase Details</span></div><div class="panel-body"><form id="createPhaseForm"><div style="display:grid;grid-template-columns:1fr 1fr;gap:20px"><div class="form-group"><label>Phase Name</label><input type="text" class="form-control" placeholder="e.g. Phase 5: Interior Finishing" required></div><div class="form-group"><label>Project</label><select id="phaseProject" class="form-select" required><option value="">Select Project</option><option>SkyTower Plaza</option><option>Mumbai Airport</option><option>Titanium Hub</option><option>Sector 7 Bridge</option><option>Hubli Tech Park</option></select></div><div class="form-group"><label>Start Date</label><input type="date" id="phaseStartDate" class="form-control" required></div><div class="form-group"><label>End Date</label><input type="date" id="phaseEndDate" class="form-control" required></div><div class="form-group" style="grid-column:1/-1"><label>Description</label><textarea class="form-control" rows="3" placeholder="Scope..."></textarea></div></div><div style="margin-top:24px"><button type="submit" class="btn btn-primary"><span class="material-symbols-outlined">layers</span> Create Phase</button></div></form></div></div>` },
  {
    file: 'create-task.html', title: 'Create Task', bc: 'PM &gt; <span>Create Task</span>', content: `<div class="dash-welcome animate-in"><h1>Create New Task</h1><p>Assign a task to a team member.</p></div><div class="panel animate-in"><div class="panel-header"><span class="panel-title">Task Details</span></div><div class="panel-body"><form id="createTaskForm"><div style="display:grid;grid-template-columns:1fr 1fr;gap:20px"><div class="form-group"><label>Task Title</label><input type="text" class="form-control" placeholder="e.g. Foundation Pour Zone A" required></div><div class="form-group"><label>Project</label><select id="taskProject" class="form-select" required><option value="">Select Project</option><option value="SkyTower Plaza">SkyTower Plaza</option><option value="Mumbai Airport">Mumbai Airport</option><option value="Titanium Hub">Titanium Hub</option><option value="Sector 7 Bridge">Sector 7 Bridge</option><option value="Hubli Tech Park">Hubli Tech Park</option></select></div><div class="form-group"><label>Phase</label><select id="taskPhase" class="form-select" required disabled><option value="">Select Phase</option></select></div><div class="form-group"><label>Assign To</label><select class="form-select" required><option value="">Select Site Engineer</option><option>Vikram Patel</option><option>Kumar Verma</option><option>Suresh R.</option></select></div><div class="form-group"><label>Zone</label><input type="text" class="form-control" placeholder="Zone A" required></div><div class="form-group"><label>Priority</label><select class="form-select"><option>High</option><option>Medium</option><option>Low</option></select></div><div class="form-group"><label>Start Date</label><input type="date" id="taskStartDate" class="form-control" required></div><div class="form-group"><label>Due Date</label><input type="date" id="taskDueDate" class="form-control" required></div><div class="form-group"><label>Status</label><select class="form-select" disabled style="background:var(--bg);cursor:not-allowed;"><option value="Not Started" selected>Not Started</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option></select><small style="color:var(--text-muted);display:block;margin-top:4px">Status is explicitly set by the assigned Site Engineer. PM sets initial proxy.</small></div></div><div style="margin-top:24px"><button type="submit" class="btn btn-primary"><span class="material-symbols-outlined">add_task</span> Create Task</button></div></form></div></div><script>
  const projectPhases = {
    "SkyTower Plaza": [
      { name: "Phase 1: Foundation", start: "2026-04-01", end: "2026-05-15" },
      { name: "Phase 2: Structural", start: "2026-05-16", end: "2026-07-30" }
    ],
    "Mumbai Airport": [
      { name: "Phase 1: Mobilization", start: "2026-03-01", end: "2026-04-10" },
      { name: "Phase 2: Foundation", start: "2026-04-11", end: "2026-06-20" }
    ],
    "Titanium Hub": [
      { name: "Phase 3: MEP", start: "2026-04-01", end: "2026-06-30" }
    ],
    "Sector 7 Bridge": [
      { name: "Phase 1: Site Prep", start: "2026-04-05", end: "2026-04-20" }
    ],
    "Hubli Tech Park": [
      { name: "Phase 1: Permits", start: "2026-04-10", end: "2026-05-10" }
    ]
  };

  const projectSelect = document.getElementById("taskProject");
  const phaseSelect = document.getElementById("taskPhase");
  const startDateInput = document.getElementById("taskStartDate");
  const dueDateInput = document.getElementById("taskDueDate");
  const form = document.getElementById("createTaskForm");
  
  let currentPhases = [];

  if (projectSelect) {
    projectSelect.addEventListener("change", function() {
      const project = this.value;
      phaseSelect.innerHTML = '<option value="">Select Phase</option>';
      if (project && projectPhases[project]) {
        currentPhases = projectPhases[project];
        currentPhases.forEach((p, idx) => {
          const opt = document.createElement("option");
          opt.value = idx;
          opt.textContent = p.name + " (" + p.start + " to " + p.end + ")";
          phaseSelect.appendChild(opt);
        });
        phaseSelect.disabled = false;
      } else {
        currentPhases = [];
        phaseSelect.disabled = true;
      }
    });
  }

  if (form) {
    form.addEventListener("submit", function(e) {
      const phaseIdx = phaseSelect.value;
      if (phaseIdx !== "" && currentPhases[phaseIdx]) {
        const selectedPhase = currentPhases[phaseIdx];
        const taskStart = new Date(startDateInput.value);
        const taskDue = new Date(dueDateInput.value);
        const phaseStart = new Date(selectedPhase.start);
        const phaseEnd = new Date(selectedPhase.end);

        if (taskStart < phaseStart) {
          e.preventDefault();
          alert("Validation Error: Task Start Date cannot be earlier than Phase Start Date (" + selectedPhase.start + ").");
          return;
        }
        if (taskDue > phaseEnd) {
          e.preventDefault();
          alert("Validation Error: Task Due Date cannot be later than Phase End Date (" + selectedPhase.end + ").");
          return;
        }
        
        e.preventDefault();
        alert("Task successfully created!");
      }
    });
  }
</script>` },
  { file: 'task-management.html', title: 'Task Management', bc: 'PM &gt; <span>Tasks</span>', content: `<div class="dash-welcome animate-in"><h1>Task Management</h1><p>View and manage all tasks.</p></div><div class="panel animate-in"><div class="panel-header"><span class="panel-title">All Tasks (38)</span><span class="panel-action"><a href="create-task.html" style="color:var(--accent)">+ New Task</a></span></div><div class="panel-body" style="padding:0"><table class="task-table"><thead><tr><th>Task</th><th>Assigned</th><th>Phase</th><th>Due</th><th>Priority</th><th>Status</th></tr></thead><tbody><tr><td><strong>Foundation Pour — A</strong></td><td>Kumar V.</td><td>Phase 4</td><td>15 Apr</td><td><span class="status-badge overdue">High</span></td><td><span class="status-badge progress">In Progress</span></td></tr><tr><td><strong>Column Rebar</strong></td><td>Vikram P.</td><td>Phase 4</td><td>16 Apr</td><td><span class="status-badge overdue">High</span></td><td><span class="status-badge progress">In Progress</span></td></tr><tr><td><strong>Beam Formwork</strong></td><td>Suresh R.</td><td>Phase 4</td><td>18 Apr</td><td><span class="status-badge pending">Medium</span></td><td><span class="status-badge pending">Pending</span></td></tr><tr><td><strong>Plumbing L2</strong></td><td>Amit S.</td><td>Phase 3</td><td>12 Apr</td><td><span class="status-badge progress">Low</span></td><td><span class="status-badge active">Completed</span></td></tr></tbody></table></div></div>` },
  { file: 'material-master.html', title: 'Material Master', bc: 'PM &gt; <span>Materials</span>', content: `<div class="dash-welcome animate-in"><h1>Material Master</h1><p>Central catalogue of all construction materials.</p></div><div class="panel animate-in"><div class="panel-header"><span class="panel-title">Inventory</span></div><div class="panel-body" style="padding:0"><table class="task-table"><thead><tr><th>Material</th><th>Unit</th><th>Stock</th><th>Min Qty</th><th>Rate (₹)</th><th>Status</th></tr></thead><tbody><tr><td><strong>Cement OPC 53</strong></td><td>Bags</td><td>1,200</td><td>500</td><td>370</td><td><span class="status-badge active">In Stock</span></td></tr><tr><td><strong>TMT Steel Bars</strong></td><td>Tons</td><td>1.2</td><td>4.0</td><td>58,000</td><td><span class="status-badge overdue">Low Stock</span></td></tr><tr><td><strong>River Sand</strong></td><td>Cu.m</td><td>85</td><td>30</td><td>1,800</td><td><span class="status-badge active">In Stock</span></td></tr><tr><td><strong>Aggregate</strong></td><td>Cu.m</td><td>120</td><td>50</td><td>1,200</td><td><span class="status-badge active">In Stock</span></td></tr><tr><td><strong>Plywood</strong></td><td>Sheets</td><td>180</td><td>100</td><td>1,450</td><td><span class="status-badge active">In Stock</span></td></tr></tbody></table></div></div>` },
  { file: 'material-stock.html', title: 'Material Stock Entry', bc: 'PM &gt; <span>Stock Entry</span>', content: `<div class="dash-welcome animate-in"><h1>Material Stock Entry</h1><p>Record incoming material stock.</p></div><div class="panel animate-in"><div class="panel-header"><span class="panel-title">New Entry</span></div><div class="panel-body"><form id="materialStockForm"><div style="display:grid;grid-template-columns:1fr 1fr;gap:20px"><div class="form-group"><label>Material Name</label><input type="text" class="form-control" placeholder="e.g. Cement OPC 53" required></div><div class="form-group"><label>Unit</label><input type="text" class="form-control" placeholder="e.g. Bags, Tons, Kg" required></div><div class="form-group"><label>Quantity</label><input type="number" class="form-control" placeholder="500" required></div><div class="form-group"><label>Rate (₹)</label><input type="number" step="0.01" class="form-control" placeholder="370" required></div><div class="form-group"><label>Supplier</label><input type="text" class="form-control" placeholder="Supplier name" required></div><div class="form-group"><label>Invoice No.</label><input type="text" class="form-control" placeholder="INV-2026-XXX" required></div><div class="form-group"><label>Date</label><input type="date" class="form-control" required></div></div><div style="margin-top:24px"><button type="submit" class="btn btn-primary"><span class="material-symbols-outlined">inventory_2</span> Add Stock</button></div></form></div></div>` },
  { file: 'material-report.html', title: 'Material Report', bc: 'PM &gt; <span>Material Report</span>', content: `<div class="dash-welcome animate-in"><h1>Material Report</h1><p>Consumption and procurement analytics.</p></div><div class="stats-grid" style="margin-bottom:24px"><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Total Items</div><div class="stat-card-value">24</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">category</span></div></div></div><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Low Stock</div><div class="stat-card-value">3</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">warning</span></div></div></div><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Total Spend</div><div class="stat-card-value">₹14.2L</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">payments</span></div></div></div><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">This Month</div><div class="stat-card-value">₹3.8L</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">calendar_today</span></div></div></div></div><div class="panel animate-in"><div class="panel-header"><span class="panel-title">Consumption Trend</span></div><div class="panel-body"><div class="chart-placeholder"><div class="chart-bars"><div class="chart-bar" data-height="70px"></div><div class="chart-bar" data-height="55px"></div><div class="chart-bar" data-height="90px"></div><div class="chart-bar" data-height="80px"></div><div class="chart-bar" data-height="60px"></div><div class="chart-bar" data-height="100px"></div></div><div class="chart-label">Monthly consumption — 6 months</div></div></div></div>` },
  { file: 'expense-entry.html', title: 'Expense Entry', bc: 'PM &gt; <span>Expense Entry</span>', content: `<div class="dash-welcome animate-in"><h1>Expense Entry</h1><p>Log a new project expense.</p></div><div class="panel animate-in"><div class="panel-header"><span class="panel-title">New Expense</span></div><div class="panel-body"><form id="expenseEntryForm"><div style="display:grid;grid-template-columns:1fr 1fr;gap:20px"><div class="form-group"><label>Project</label><select id="expenseProject" class="form-select" required><option value="">Select Project</option><option value="SkyTower Plaza">SkyTower Plaza</option><option value="Mumbai Airport">Mumbai Airport</option><option value="Titanium Hub">Titanium Hub</option><option value="Sector 7 Bridge">Sector 7 Bridge</option><option value="Hubli Tech Park">Hubli Tech Park</option></select></div><div class="form-group"><label>Description</label><input type="text" class="form-control" placeholder="e.g. Weekly Labour Payment" required></div><div class="form-group"><label>Amount (₹)</label><input type="number" class="form-control" placeholder="840000" required></div><div class="form-group"><label>Category</label><select class="form-select" required><option>Labour Payment</option><option>Equipment Rental</option><option>Transportation</option><option>Miscellaneous</option></select></div><div class="form-group"><label>Date</label><input type="date" class="form-control" required></div><div class="form-group"><label>Invoice</label><input type="text" class="form-control" placeholder="INV-XXX"></div><div class="form-group"><label>Vendor</label><input type="text" class="form-control" placeholder="Vendor name" required></div></div><div style="margin-top:24px"><button type="submit" class="btn btn-primary"><span class="material-symbols-outlined">add_card</span> Log Expense</button></div></form></div></div>` },
  { file: 'expense-list.html', title: 'Expense List', bc: 'PM &gt; <span>Expense List</span>', content: `<div class="dash-welcome animate-in"><h1>Expense List</h1><p>All recorded expenses.</p></div><div class="panel animate-in"><div class="panel-header"><span class="panel-title">Expenses</span><span class="panel-action"><a href="expense-entry.html" style="color:var(--accent)">+ New</a></span></div><div class="panel-body" style="padding:0"><table class="task-table"><thead><tr><th>Date</th><th>Description</th><th>Project</th><th>Category</th><th>Amount</th><th>Vendor</th><th>Entered By</th></tr></thead><tbody><tr><td>11 Apr</td><td><strong>Labour W14</strong></td><td>Mumbai Airport</td><td><span class="category-badge labour">Labour Payment</span></td><td>₹4,20,000</td><td>Manpower Solutions</td><td>Arjun Mehta (PM)</td></tr><tr><td>10 Apr</td><td><strong>Crane Rental</strong></td><td>SkyTower Plaza</td><td><span class="category-badge equipment">Equipment Rental</span></td><td>₹1,50,000</td><td>HeavyGear Ltd</td><td>Arjun Mehta (PM)</td></tr><tr><td>09 Apr</td><td><strong>Site Visit Transport</strong></td><td>Titanium Hub</td><td><span class="category-badge transport">Transportation</span></td><td>₹12,000</td><td>City Cabs</td><td>Arjun Mehta (PM)</td></tr><tr><td>08 Apr</td><td><strong>Office Stationery</strong></td><td>Sector 7 Bridge</td><td><span class="category-badge misc">Miscellaneous</span></td><td>₹4,500</td><td>Office Depot</td><td>Arjun Mehta (PM)</td></tr></tbody></table></div></div>` },
  { file: 'budget-summary.html', title: 'Budget Summary', bc: 'PM &gt; <span>Budget</span>', content: `<div class="dash-welcome animate-in"><h1>Budget Summary</h1><p>Financial overview of Skyline Residency.</p></div><div class="stats-grid" style="margin-bottom:24px"><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Total Budget</div><div class="stat-card-value">₹22 Cr</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">account_balance</span></div></div></div><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Spent</div><div class="stat-card-value">₹15.8 Cr</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">payments</span></div></div></div><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Remaining</div><div class="stat-card-value">₹6.2 Cr</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">savings</span></div></div></div><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Utilization</div><div class="stat-card-value">72%</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">pie_chart</span></div></div></div></div><div class="panel animate-in"><div class="panel-header"><span class="panel-title">By Category</span></div><div class="panel-body"><div class="progress-bar-wrapper"><div class="progress-label"><span>Materials</span><span>₹8.4 Cr (38%)</span></div><div class="progress-track"><div class="progress-fill" style="width:62%"></div></div></div><div class="progress-bar-wrapper"><div class="progress-label"><span>Labour</span><span>₹5.2 Cr (24%)</span></div><div class="progress-track"><div class="progress-fill blue" style="width:78%"></div></div></div><div class="progress-bar-wrapper"><div class="progress-label"><span>Equipment</span><span>₹1.8 Cr (8%)</span></div><div class="progress-track"><div class="progress-fill green" style="width:45%"></div></div></div></div></div>` },
  {
    file: 'attendance.html', title: 'Attendance View', bc: 'PM &gt; <span>Attendance</span>', content: `<div class="dash-welcome animate-in"><h1>Attendance View</h1><p>Track team attendance.</p></div><div class="panel animate-in"><div class="panel-header"><span class="panel-title">Today's Attendance</span><span class="panel-action">Export →</span></div><div class="panel-body" style="padding:0"><table class="task-table" id="attendanceTable"><thead><tr><th>Employee Name</th><th>Role</th><th>Project/Site</th><th>Check-In</th><th>Check-Out</th><th>Hours</th><th>Status</th></tr></thead><tbody><tr><td><strong>Vikram P.</strong></td><td>SE</td><td>SkyTower Plaza</td><td>08:30</td><td>—</td><td></td><td><span class="status-badge active">Present</span></td></tr><tr><td><strong>Kumar V.</strong></td><td>Foreman</td><td>SkyTower Plaza</td><td>07:45</td><td>17:15</td><td></td><td><span class="status-badge active">Present</span></td></tr><tr><td><strong>Ravi S.</strong></td><td>Electrician</td><td>Titanium Hub</td><td>09:00</td><td>—</td><td></td><td><span class="status-badge pending">Late</span></td></tr><tr><td><strong>Priya D.</strong></td><td>SE</td><td>Titanium Hub</td><td>08:15</td><td>18:30</td><td></td><td><span class="status-badge active">Present</span></td></tr><tr><td><strong>Rahul K.</strong></td><td>Mason</td><td>Hubli Tech Park</td><td>—</td><td>—</td><td></td><td><span class="status-badge overdue">Absent</span></td></tr></tbody></table></div></div>
<script>
  document.addEventListener("DOMContentLoaded", function() {
    const rows = document.querySelectorAll('#attendanceTable tbody tr');
    rows.forEach(row => {
      const checkIn = row.cells[3].innerText.trim();
      const checkOut = row.cells[4].innerText.trim();
      const hoursCell = row.cells[5];
      
      if (checkIn && checkIn !== '—' && checkOut && checkOut !== '—') {
        const [inH, inM] = checkIn.split(':').map(Number);
        const [outH, outM] = checkOut.split(':').map(Number);
        let start = inH * 60 + inM;
        let end = outH * 60 + outM;
        let diff = end - start;
        if (diff < 0) diff += 24 * 60;
        const h = Math.floor(diff / 60);
        const m = diff % 60;
        hoursCell.innerText = h + 'h' + (m > 0 ? ' ' + m + 'm' : '');
      } else {
        hoursCell.innerText = '—';
      }
    });
  });
</script>` },
  { file: 'photo-upload.html', title: 'Photo Upload', bc: 'PM &gt; <span>Upload</span>', content: `<div class="dash-welcome animate-in"><h1>Photo Upload</h1><p>Upload site progress photos.</p></div><div class="panel animate-in"><div class="panel-header"><span class="panel-title">Upload</span></div><div class="panel-body"><div style="border:2px dashed var(--border);border-radius:var(--radius);padding:60px;text-align:center;background:var(--bg)"><span class="material-symbols-outlined" style="font-size:48px;color:var(--accent);display:block;margin-bottom:16px">cloud_upload</span><h3 style="color:var(--primary);margin-bottom:8px">Drag & drop photos here</h3><p style="color:var(--text-muted);font-size:0.875rem;margin-bottom:16px">JPG, PNG up to 10MB</p><button class="btn btn-primary"><span class="material-symbols-outlined">add_a_photo</span> Select Files</button></div><div style="display:grid;grid-template-columns:1fr 1fr;gap:20px;margin-top:24px"><div class="form-group"><label>Project</label><select class="form-select"><option value="">Select Project</option><option>SkyTower Plaza</option><option>Titanium Hub</option><option>Hubli Tech Park</option></select></div><div class="form-group"><label>Category</label><select class="form-select"><option value="">Select Category</option><option>Progress</option><option>Foundation</option><option>Structural</option><option>Finishing</option><option>Material Delivery</option><option>Equipment</option><option>Labour</option><option>Safety Audit</option><option>Inspection</option><option>Issue / Delay</option></select></div><div class="form-group"><label>Uploaded By (auto)</label><input type="text" class="form-control" value="Arjun Mehta" readonly style="background:var(--bg);cursor:not-allowed;"></div><div class="form-group"><label>Date</label><input type="date" class="form-control" id="pmUploadDate" readonly style="background:var(--bg);cursor:not-allowed;"></div></div></div></div><script>document.getElementById('pmUploadDate').valueAsDate = new Date();</script>` },
  { file: 'photo-gallery.html', title: 'Photo Gallery', bc: 'PM &gt; <span>Gallery</span>', content: `<div class="dash-welcome animate-in"><h1>Photo Gallery</h1><p>Browse site photographs.</p></div><div class="panel animate-in"><div class="panel-header"><span class="panel-title">Gallery</span><span class="panel-action"><a href="photo-upload.html" style="color:var(--accent)">+ Upload</a></span></div><div class="panel-body"><div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:20px"><select id="pmGalleryProjectFilter" class="form-select" style="min-width:200px"><option value="all">All Projects</option><option value="SkyTower Plaza">SkyTower Plaza</option><option value="Titanium Hub">Titanium Hub</option><option value="Hubli Tech Park">Hubli Tech Park</option></select><select id="pmGalleryCategoryFilter" class="form-select" style="min-width:200px"><option value="all">All Categories</option><option value="Progress">Progress</option><option value="Foundation">Foundation</option><option value="Structural">Structural</option><option value="Finishing">Finishing</option><option value="Material Delivery">Material Delivery</option><option value="Equipment">Equipment</option><option value="Labour">Labour</option><option value="Safety Audit">Safety Audit</option><option value="Inspection">Inspection</option><option value="Issue / Delay">Issue / Delay</option></select></div><div class="dash-grid-3" id="pmPhotoGalleryGrid"><div class="photo-card" data-project="SkyTower Plaza" data-category="Foundation" style="background:linear-gradient(135deg,#2C3E50,#34495E);border-radius:var(--radius-sm);height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(255,255,255,0.8);gap:8px"><span class="material-symbols-outlined" style="font-size:36px;color:var(--accent)">photo_camera</span><span style="font-size:0.813rem;font-weight:600">Foundation</span><span style="font-size:0.688rem;opacity:0.6">SkyTower Plaza • 2 hours ago</span><span style="font-size:0.688rem;opacity:0.6;font-style:italic">By: Arjun Mehta</span></div><div class="photo-card" data-project="Titanium Hub" data-category="Structural" style="background:linear-gradient(135deg,#34495E,#2C3E50);border-radius:var(--radius-sm);height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(255,255,255,0.8);gap:8px"><span class="material-symbols-outlined" style="font-size:36px;color:var(--accent)">photo_camera</span><span style="font-size:0.813rem;font-weight:600">Structural</span><span style="font-size:0.688rem;opacity:0.6">Titanium Hub • 1 day ago</span><span style="font-size:0.688rem;opacity:0.6;font-style:italic">By: Arjun Mehta</span></div><div class="photo-card" data-project="Hubli Tech Park" data-category="Equipment" style="background:linear-gradient(135deg,#2C3E50,#1a252f);border-radius:var(--radius-sm);height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(255,255,255,0.8);gap:8px"><span class="material-symbols-outlined" style="font-size:36px;color:var(--accent)">photo_camera</span><span style="font-size:0.813rem;font-weight:600">Equipment</span><span style="font-size:0.688rem;opacity:0.6">Hubli Tech Park • 3 days ago</span><span style="font-size:0.688rem;opacity:0.6;font-style:italic">By: Arjun Mehta</span></div><div class="photo-card" data-project="SkyTower Plaza" data-category="Progress" style="background:linear-gradient(135deg,#1a252f,#2C3E50);border-radius:var(--radius-sm);height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(255,255,255,0.8);gap:8px"><span class="material-symbols-outlined" style="font-size:36px;color:var(--accent)">photo_camera</span><span style="font-size:0.813rem;font-weight:600">Progress</span><span style="font-size:0.688rem;opacity:0.6">SkyTower Plaza • 4 days ago</span><span style="font-size:0.688rem;opacity:0.6;font-style:italic">By: Arjun Mehta</span></div><div class="photo-card" data-project="Titanium Hub" data-category="Safety Audit" style="background:linear-gradient(135deg,#34495E,#1a252f);border-radius:var(--radius-sm);height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(255,255,255,0.8);gap:8px"><span class="material-symbols-outlined" style="font-size:36px;color:var(--accent)">photo_camera</span><span style="font-size:0.813rem;font-weight:600">Safety Audit</span><span style="font-size:0.688rem;opacity:0.6">Titanium Hub • 5 days ago</span><span style="font-size:0.688rem;opacity:0.6;font-style:italic">By: Arjun Mehta</span></div><div class="photo-card" data-project="Hubli Tech Park" data-category="Inspection" style="background:linear-gradient(135deg,#2C3E50,#34495E);border-radius:var(--radius-sm);height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(255,255,255,0.8);gap:8px"><span class="material-symbols-outlined" style="font-size:36px;color:var(--accent)">photo_camera</span><span style="font-size:0.813rem;font-weight:600">Inspection</span><span style="font-size:0.688rem;opacity:0.6">Hubli Tech Park • 1 week ago</span><span style="font-size:0.688rem;opacity:0.6;font-style:italic">By: Arjun Mehta</span></div></div></div></div><script>document.addEventListener("DOMContentLoaded", function() { const pF = document.getElementById("pmGalleryProjectFilter"); const cF = document.getElementById("pmGalleryCategoryFilter"); const cards = document.querySelectorAll(".photo-card"); function filterAll() { const pV = pF.value; const cV = cF.value; cards.forEach(c => { const pM = (pV === "all" || c.dataset.project === pV); const cM = (cV === "all" || c.dataset.category === cV); c.style.display = (pM && cM) ? "flex" : "none"; }); } if(pF && cF) { pF.addEventListener("change", filterAll); cF.addEventListener("change", filterAll); }});</script>` },
  { file: 'analytics.html', title: 'Analytics Dashboard', bc: 'PM &gt; <span>Analytics</span>', content: `<div class="dash-welcome animate-in"><h1>Analytics Dashboard</h1><p>Project performance metrics.</p></div><div class="stats-grid"><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Task Done</div><div class="stat-card-value">84%</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">task_alt</span></div></div></div><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">On-Time</div><div class="stat-card-value">91%</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">schedule</span></div></div></div><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Budget</div><div class="stat-card-value">Good</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">favorite</span></div></div></div><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Efficiency</div><div class="stat-card-value">88%</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">speed</span></div></div></div></div><div class="panel animate-in"><div class="panel-header"><span class="panel-title">Weekly Performance</span></div><div class="panel-body"><div class="chart-placeholder"><div class="chart-bars"><div class="chart-bar" data-height="70px"></div><div class="chart-bar" data-height="90px"></div><div class="chart-bar" data-height="60px"></div><div class="chart-bar" data-height="100px"></div><div class="chart-bar" data-height="80px"></div><div class="chart-bar" data-height="95px"></div></div><div class="chart-label">Tasks per week</div></div></div></div>` },
  {
    file: 'gantt.html', title: 'Gantt Chart', bc: 'PM &gt; <span>Gantt</span>', content: `
        <div class="dash-welcome animate-in"><h1>Gantt Chart</h1><p>Project timeline.</p></div>
        <div class="panel animate-in">
          <div class="panel-header" style="display:flex;align-items:center;justify-content:space-between;gap:16px">
            <span class="panel-title">Project Timeline</span>
            <div style="display:flex;align-items:center;gap:10px">
              <label for="pmGanttProjectSelect" style="font-size:0.875rem;color:var(--text-muted);white-space:nowrap">Project:</label>
              <select id="pmGanttProjectSelect" class="form-select" style="min-width:220px">
                <option value="">Select Project</option>
                <option value="SkyTower Plaza">SkyTower Plaza</option>
                <option value="Titanium Hub">Titanium Hub</option>
                <option value="Hubli Tech Park">Hubli Tech Park</option>
              </select>
            </div>
          </div>
          <div class="panel-body">
            <div id="pmGanttTimeline">
              <div id="pmGanttEmptyState" style="text-align:center;padding:40px 20px;color:var(--text-muted);">
                <span class="material-symbols-outlined" style="font-size:48px;opacity:0.5;margin-bottom:12px;display:block">timeline</span>
                <p>Select a project to view timeline</p>
              </div>

              <div class="pm-gantt-project" data-gantt-project="SkyTower Plaza" style="display:none">
                <div style="overflow-x:auto">
                  <div style="min-width:800px">
                    <div style="display:grid;grid-template-columns:200px 1fr;gap:0;border:1px solid var(--border);border-radius:var(--radius-sm)">
                      <div style="padding:12px 16px;font-weight:600;font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);background:var(--bg);border-bottom:1px solid var(--border)">Phase</div>
                      <div style="padding:12px 16px;font-weight:600;font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);background:var(--bg);border-bottom:1px solid var(--border);display:flex;justify-content:space-between"><span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span></div>
                      
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Phase 3: MEP</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--success);height:20px;border-radius:4px;width:100%"></div></div>
                      
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Phase 4: Structural</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--accent);height:20px;border-radius:4px;width:72%;margin-left:5%"></div></div>
                      
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500">Phase 5: Interior</div>
                      <div style="padding:10px 16px"><div style="background:var(--primary);opacity:0.3;height:20px;border-radius:4px;width:40%;margin-left:50%"></div></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="pm-gantt-project" data-gantt-project="Titanium Hub" style="display:none">
                <div style="overflow-x:auto">
                  <div style="min-width:800px">
                    <div style="display:grid;grid-template-columns:200px 1fr;gap:0;border:1px solid var(--border);border-radius:var(--radius-sm)">
                      <div style="padding:12px 16px;font-weight:600;font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);background:var(--bg);border-bottom:1px solid var(--border)">Phase</div>
                      <div style="padding:12px 16px;font-weight:600;font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);background:var(--bg);border-bottom:1px solid var(--border);display:flex;justify-content:space-between"><span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span></div>
                      
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Phase 3: MEP</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--success);height:20px;border-radius:4px;width:80%"></div></div>
                      
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500">Phase 4: Finishing</div>
                      <div style="padding:10px 16px"><div style="background:var(--accent);height:20px;border-radius:4px;width:50%;margin-left:30%"></div></div>
                    </div>
                  </div>
                </div>
              </div>

              <div class="pm-gantt-project" data-gantt-project="Hubli Tech Park" style="display:none">
                <div style="overflow-x:auto">
                  <div style="min-width:800px">
                    <div style="display:grid;grid-template-columns:200px 1fr;gap:0;border:1px solid var(--border);border-radius:var(--radius-sm)">
                      <div style="padding:12px 16px;font-weight:600;font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);background:var(--bg);border-bottom:1px solid var(--border)">Phase</div>
                      <div style="padding:12px 16px;font-weight:600;font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);background:var(--bg);border-bottom:1px solid var(--border);display:flex;justify-content:space-between"><span>W1</span><span>W2</span><span>W3</span><span>W4</span><span>W5</span><span>W6</span></div>
                      
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Phase 1: Foundation</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--success);height:20px;border-radius:4px;width:60%"></div></div>
                      
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Phase 2: Core & Shell</div>
                      <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--accent);height:20px;border-radius:4px;width:50%;margin-left:30%"></div></div>
                      
                      <div style="padding:10px 16px;font-size:0.875rem;font-weight:500">Phase 3: MEP</div>
                      <div style="padding:10px 16px"><div style="background:var(--primary);opacity:0.3;height:20px;border-radius:4px;width:40%;margin-left:55%"></div></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <script>
          document.addEventListener("DOMContentLoaded", function() {
            const select = document.getElementById("pmGanttProjectSelect");
            const panels = document.querySelectorAll(".pm-gantt-project");
            const emptyState = document.getElementById("pmGanttEmptyState");

            function updateGantt() {
              const selectedValue = select.value;
              if (!selectedValue) {
                panels.forEach(p => p.style.display = 'none');
                emptyState.style.display = 'block';
                return;
              }
              
              emptyState.style.display = 'none';
              panels.forEach(p => {
                p.style.display = p.dataset.ganttProject === selectedValue ? 'block' : 'none';
              });
            }

            if (select) {
              select.addEventListener("change", updateGantt);
              updateGantt();
            }
          });
        </script>`
  }
];

// ==================== SE CONTENT ====================
const sePages = [
  {
    file: 'index.html', title: 'Engineer Dashboard', bc: 'Site Engineer &gt; <span>Dashboard</span>', content: `
        <div class="dash-welcome animate-in"><h1>Good Morning, Vikram 🏗️</h1></div>
        <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
          <div class="stat-card animate-in animate-in-delay-2"><div class="stat-card-header"><div><div class="stat-card-label">Today's Tasks</div><div class="stat-card-value">8</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">checklist</span></div></div><div class="stat-card-change up"><span class="material-symbols-outlined" style="font-size:14px">trending_up</span> 3 done, 5 active</div></div>
          <div class="stat-card animate-in animate-in-delay-3"><div class="stat-card-header"><div><div class="stat-card-label">Materials Logged Today</div><div class="stat-card-value">1,240</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">category</span></div></div><div class="stat-card-change up"><span class="material-symbols-outlined" style="font-size:14px">trending_up</span> Central inventory updated</div></div>
          <div class="stat-card animate-in animate-in-delay-4"><div class="stat-card-header"><div><div class="stat-card-label">Attendance</div><div class="stat-card-value">✓ In</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">login</span></div></div><div class="stat-card-change up"><span class="material-symbols-outlined" style="font-size:14px">schedule</span> 08:30 AM</div></div>
        </div>
        <div class="dash-grid">
          <div class="panel animate-in">
            <div class="panel-header"><span class="panel-title">Task Completion Tracker</span></div>
            <div class="panel-body">
              <div class="progress-bar-wrapper"><div class="progress-label"><span>Column Reinforcement</span><span>85%</span></div><div class="progress-track"><div class="progress-fill green" style="width:85%"></div></div></div>
              <div class="progress-bar-wrapper"><div class="progress-label"><span>Beam Formwork</span><span>60%</span></div><div class="progress-track"><div class="progress-fill" style="width:60%"></div></div></div>
              <div class="progress-bar-wrapper"><div class="progress-label"><span>Slab Casting</span><span>40%</span></div><div class="progress-track"><div class="progress-fill blue" style="width:40%"></div></div></div>
              <table class="task-table" style="font-size:0.813rem;margin-top:20px" id="dashboardTaskTable">
                <thead><tr><th>Task</th><th>Zone</th><th>Priority</th><th>Status</th></tr></thead>
                <tbody>
                  <tr>
                    <td>Column rebar L4</td><td>A</td><td><span class="status-badge overdue">High</span></td>
                    <td>
                      <div class="status-update-wrapper">
                        <select class="form-select dash-status-select"><option value="Not Started">Not Started</option><option value="In Progress" selected>In Progress</option><option value="Completed">Completed</option></select>
                        <span class="completion-date"></span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Beam formwork</td><td>B</td><td><span class="status-badge pending">Med</span></td>
                    <td>
                      <div class="status-update-wrapper">
                        <select class="form-select dash-status-select"><option value="Not Started">Not Started</option><option value="In Progress" selected>In Progress</option><option value="Completed">Completed</option></select>
                        <span class="completion-date"></span>
                      </div>
                    </td>
                  </tr>
                  <tr>
                    <td>Plumbing L2</td><td>C</td><td><span class="status-badge progress">Low</span></td>
                    <td>
                      <div class="status-update-wrapper">
                        <select class="form-select dash-status-select"><option value="Not Started">Not Started</option><option value="In Progress">In Progress</option><option value="Completed" selected>Completed</option></select>
                        <span class="completion-date" style="display:inline-block;margin-left:8px;font-size:0.75rem;color:var(--text-muted)">(Done)</span>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
          <div style="display:flex;flex-direction:column;gap:24px">
            <div class="panel animate-in"><div class="panel-header"><span class="panel-title">Quick Actions</span></div><div class="panel-body"><div class="quick-actions"><button class="quick-action-btn"><span class="material-symbols-outlined">edit_document</span> Update Task</button><button class="quick-action-btn"><span class="material-symbols-outlined">inventory_2</span> Log Materials</button><button class="quick-action-btn"><span class="material-symbols-outlined">login</span> Check In/Out</button></div></div></div>
            <div class="panel animate-in"><div class="panel-header"><span class="panel-title">Activity</span></div><div class="panel-body"><div class="activity-feed"><div class="activity-item"><div class="activity-dot green"></div><div class="activity-content"><h4>Task Update</h4><p>Column rebar L4 marked 'Completed'</p><span class="activity-time">10 min ago</span></div></div><div class="activity-item"><div class="activity-dot orange"></div><div class="activity-content"><h4>Material Logged</h4><p>80 Bags of Cement OPC 53</p><span class="activity-time">45 min ago</span></div></div><div class="activity-item"><div class="activity-dot blue"></div><div class="activity-content"><h4>Photo Uploaded</h4><p>Sector B-12 structural casting</p><span class="activity-time">2 hours ago</span></div></div><div class="activity-item"><div class="activity-dot gray"></div><div class="activity-content"><h4>Checked In</h4><p>Attendance recorded</p><span class="activity-time">Today, 08:30 AM</span></div></div></div></div></div>
          </div>
        </div>
        <script>
          document.addEventListener("DOMContentLoaded", function() {
            const selects = document.querySelectorAll(".dash-status-select");
            selects.forEach(select => {
              select.addEventListener("change", function(e) {
                const wrapper = this.closest('.status-update-wrapper');
                let dateSpan = wrapper.querySelector('.completion-date');
                if (!dateSpan) {
                  dateSpan = document.createElement("span");
                  dateSpan.className = "completion-date";
                  wrapper.appendChild(dateSpan);
                }
                
                let saveMsg = wrapper.querySelector('.save-msg');
                if (!saveMsg) {
                  saveMsg = document.createElement("div");
                  saveMsg.className = 'save-msg';
                  saveMsg.innerHTML = '<span class="material-symbols-outlined" style="font-size:14px;color:var(--success)">check_circle</span> <span style="color:var(--success);font-size:0.75rem">Saved</span>';
                  saveMsg.style.cssText = "display:flex; align-items:center; gap:4px; width:100%; margin-top:6px;";
                  wrapper.appendChild(saveMsg);
                } else {
                  saveMsg.style.display = 'flex';
                }
                setTimeout(() => { if(saveMsg) saveMsg.style.display = 'none'; }, 2000);

                if (this.value === "Completed") {
                  const today = new Date();
                  const opts = { day: 'numeric', month: 'short' };
                  dateSpan.textContent = '(' + today.toLocaleDateString("en-GB", opts) + ')';
                  dateSpan.style.display = 'inline-block';
                  dateSpan.style.marginLeft = '8px';
                  dateSpan.style.fontSize = '0.75rem';
                  dateSpan.style.color = 'var(--text-muted)';
                } else {
                  dateSpan.textContent = '';
                  dateSpan.style.display = 'none';
                }
              });
            });
          });
        </script>
        <style>
          .status-update-wrapper { display: flex; align-items: center; flex-wrap: wrap; }
          .dash-status-select { min-width: 110px; padding: 4px 8px; font-size: 0.75rem; height: auto; border: 1px solid var(--border); border-radius: var(--radius-sm); background-color: var(--bg); color: var(--text); }
          .dash-status-select:focus { border-color: var(--accent); outline: none; }
        </style>` },
  {
    file: 'my-tasks.html', title: 'My Tasks', bc: 'SE &gt; <span>My Tasks</span>', content: `<div class="dash-welcome animate-in"><h1>My Tasks</h1><p>Tasks assigned exclusively to you.</p></div><div class="panel animate-in"><div class="panel-header"><span class="panel-title">Your Assignments</span></div><div class="panel-body" style="padding:0"><table class="task-table" id="seTaskTable"><thead><tr><th>Task</th><th>Zone</th><th>Due Date</th><th>Priority</th><th>Status</th></tr></thead><tbody><tr><td><strong>Column rebar L4</strong></td><td>Zone A</td><td>15 Apr</td><td><span class="status-badge overdue">High</span></td><td><div class="status-update-wrapper"><select class="form-select se-status-select"><option value="Not Started">Not Started</option><option value="In Progress" selected>In Progress</option><option value="Completed">Completed</option></select><span class="completion-date"></span></div></td></tr><tr><td><strong>Beam formwork</strong></td><td>Zone B</td><td>16 Apr</td><td><span class="status-badge pending">Medium</span></td><td><div class="status-update-wrapper"><select class="form-select se-status-select"><option value="Not Started" selected>Not Started</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option></select><span class="completion-date"></span></div></td></tr><tr><td><strong>Concrete pour prep</strong></td><td>Zone A</td><td>17 Apr</td><td><span class="status-badge overdue">High</span></td><td><div class="status-update-wrapper"><select class="form-select se-status-select"><option value="Not Started" selected>Not Started</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option></select><span class="completion-date"></span></div></td></tr><tr><td><strong>Quality inspection</strong></td><td>Zone C</td><td>18 Apr</td><td><span class="status-badge pending">Medium</span></td><td><div class="status-update-wrapper"><select class="form-select se-status-select"><option value="Not Started" selected>Not Started</option><option value="In Progress">In Progress</option><option value="Completed">Completed</option></select><span class="completion-date"></span></div></td></tr><tr><td><strong>Plumbing L2</strong></td><td>Zone C</td><td>12 Apr</td><td><span class="status-badge progress">Low</span></td><td><div class="status-update-wrapper"><select class="form-select se-status-select"><option value="Not Started">Not Started</option><option value="In Progress">In Progress</option><option value="Completed" selected>Completed</option></select><span class="completion-date" style="display:inline-block;margin-left:8px;font-size:0.75rem;color:var(--text-muted)">(12 Apr)</span></div></td></tr></tbody></table></div></div>
<script>
  document.addEventListener("DOMContentLoaded", function() {
    const selects = document.querySelectorAll(".se-status-select");
    selects.forEach(select => {
      select.addEventListener("change", function(e) {
        const wrapper = this.closest('.status-update-wrapper');
        const dateSpan = wrapper.querySelector('.completion-date');
        
        let saveMsg = wrapper.querySelector('.save-msg');
        if (!saveMsg) {
          saveMsg = document.createElement("div");
          saveMsg.className = 'save-msg';
          saveMsg.innerHTML = '<span class="material-symbols-outlined" style="font-size:14px;color:var(--success)">check_circle</span> <span style="color:var(--success);font-size:0.75rem">Saved</span>';
          saveMsg.style.cssText = "display:flex; align-items:center; gap:4px; width:100%; margin-top:6px;";
          wrapper.appendChild(saveMsg);
        } else {
          saveMsg.style.display = 'flex';
        }
        
        setTimeout(() => { if(saveMsg) saveMsg.style.display = 'none'; }, 2000);

        if (this.value === "Completed") {
          const today = new Date();
          const opts = { day: 'numeric', month: 'short' };
          dateSpan.textContent = '(' + today.toLocaleDateString("en-GB", opts) + ')';
          dateSpan.style.display = 'inline-block';
          dateSpan.style.marginLeft = '8px';
          dateSpan.style.fontSize = '0.75rem';
          dateSpan.style.color = 'var(--text-muted)';
        } else {
          dateSpan.textContent = '';
          dateSpan.style.display = 'none';
        }
      });
    });
  });
</script>
<style>
  .status-update-wrapper { display: flex; align-items: center; flex-wrap: wrap; }
  .se-status-select { min-width: 140px; padding: 6px 12px; font-size: 0.813rem; height: auto; border: 1px solid var(--border); border-radius: var(--radius-sm); background-color: var(--bg); color: var(--text); }
  .se-status-select:focus { border-color: var(--accent); outline: none; }
</style>` },
  {
    file: 'material-usage.html', title: 'Material Usage', bc: 'SE &gt; <span>Material Usage</span>', content: `<div class="dash-welcome animate-in"><h1>Material Usage</h1><p>Log materials used on site.</p></div>
<div class="panel animate-in">
  <div class="panel-header">
    <span class="panel-title">Log Usage</span>
  </div>
  <div class="panel-body">
    <form id="materialUsageForm">
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:20px">
        <div class="form-group">
          <label>Material (From Master)</label>
          <select id="usageMaterial" class="form-select" required>
            <option value="">Select Material</option>
            <option value="Cement OPC 53">Cement OPC 53 (Stock: 1,200 Bags)</option>
            <option value="TMT Steel Bars">TMT Steel Bars (Stock: 1.2 Tons)</option>
            <option value="River Sand">River Sand (Stock: 85 Cu.m)</option>
            <option value="Aggregate">Aggregate (Stock: 120 Cu.m)</option>
            <option value="Plywood">Plywood (Stock: 180 Sheets)</option>
          </select>
        </div>
        <div class="form-group">
          <label>Quantity</label>
          <input type="number" id="usageQuantity" class="form-control" placeholder="Enter numeric quantity" min="0.01" step="0.01" required>
        </div>
        <div class="form-group">
          <label>Assigned Task</label>
          <select id="usageTask" class="form-select" required>
            <option value="">Select Task</option>
            <option value="Column rebar L4" data-zone="Zone A">Column rebar L4</option>
            <option value="Beam formwork" data-zone="Zone B">Beam formwork</option>
            <option value="Concrete pour prep" data-zone="Zone A">Concrete pour prep</option>
            <option value="Quality inspection" data-zone="Zone C">Quality inspection</option>
            <option value="Plumbing L2" data-zone="Zone C">Plumbing L2</option>
          </select>
        </div>
        <div class="form-group">
          <label>Zone (Auto-selected)</label>
          <input type="text" id="usageZone" class="form-control" placeholder="Select task to lock zone" readonly style="background:var(--bg);cursor:not-allowed;">
        </div>
      </div>
      <div style="margin-top:24px">
        <button type="submit" class="btn btn-primary">
          <span class="material-symbols-outlined">inventory_2</span> Log Material Used
        </button>
      </div>
    </form>
  </div>
</div>
<div class="panel animate-in" style="margin-top:24px">
  <div class="panel-header">
    <span class="panel-title">Today's Log</span>
  </div>
  <div class="panel-body" style="padding:0">
    <table class="task-table" id="usageTable">
      <thead>
        <tr>
          <th>Material</th>
          <th>Qty</th>
          <th>Task</th>
          <th>Zone</th>
          <th>Time</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>TMT Steel Bars</td>
          <td>0.4 Tons</td>
          <td>Column rebar L4</td>
          <td>Zone A</td>
          <td>10:30 AM</td>
        </tr>
        <tr>
          <td>Cement OPC 53</td>
          <td>80 Bags</td>
          <td>Concrete pour prep</td>
          <td>Zone A</td>
          <td>09:15 AM</td>
        </tr>
      </tbody>
    </table>
  </div>
</div>
<script>
  document.addEventListener("DOMContentLoaded", function() {
    const taskSelect = document.getElementById("usageTask");
    const zoneInput = document.getElementById("usageZone");
    const form = document.getElementById("materialUsageForm");
    const tbody = document.querySelector("#usageTable tbody");
    
    // Auto-fill Zone based on Task
    taskSelect.addEventListener("change", function() {
      const selectedOption = this.options[this.selectedIndex];
      if (selectedOption.value) {
        zoneInput.value = selectedOption.dataset.zone;
      } else {
        zoneInput.value = "";
      }
    });

    // Handle form submission to update table and alert stock reduction
    form.addEventListener("submit", function(e) {
      e.preventDefault();
      
      const materialSelect = document.getElementById("usageMaterial");
      const quantity = document.getElementById("usageQuantity").value;
      const taskVal = taskSelect.options[taskSelect.selectedIndex].text;
      const zoneVal = zoneInput.value;
      
      let materialName = materialSelect.value;
      let unit = "units";
      if(materialName.includes("Cement")) unit = "Bags";
      else if(materialName.includes("Steel")) unit = "Tons";
      else if(materialName.includes("Sand") || materialName.includes("Aggregate")) unit = "Cu.m";
      else if(materialName.includes("Plywood")) unit = "Sheets";
      
      const now = new Date();
      const timeStr = now.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'});
      
      const tr = document.createElement("tr");
      tr.innerHTML = \`
        <td><strong>\${materialName}</strong></td>
        <td>\${quantity} \${unit}</td>
        <td>\${taskVal}</td>
        <td>\${zoneVal}</td>
        <td>\${timeStr}</td>
      \`;
      tbody.prepend(tr);
      
      const successMsg = document.createElement("div");
      successMsg.innerHTML = '<span class="material-symbols-outlined" style="font-size:18px;vertical-align:middle;margin-right:6px">check_circle</span> Material consumption linked to ' + taskVal + '. Central stock reduced successfully.';
      successMsg.style.cssText = "padding:12px; background:var(--success); color:white; border-radius:var(--radius-sm); margin-top:20px; text-align:left; display:flex; align-items:center;";
      form.appendChild(successMsg);
      
      form.reset();
      zoneInput.value = "";
      
      setTimeout(() => { successMsg.remove(); }, 4000);
    });
  });
</script>` },
  { file: 'check-in.html', title: 'Check-in / Check-out', bc: 'SE &gt; <span>Check-in</span>', content: `<div class="dash-welcome animate-in"><h1>Check-in / Check-out</h1><p>Mark your daily attendance.</p></div><div class="dash-grid-equal"><div class="panel animate-in"><div class="panel-body" style="text-align:center;padding:48px"><span class="material-symbols-outlined" style="font-size:64px;color:var(--success);display:block;margin-bottom:16px">login</span><h2 style="color:var(--primary);margin-bottom:8px">Check In</h2><p style="color:var(--text-muted);margin-bottom:24px">Record your arrival</p><button class="btn btn-primary btn-lg"><span class="material-symbols-outlined">check_circle</span> Check In Now</button><p style="margin-top:16px;font-size:0.813rem;color:var(--success);font-weight:600">✓ Checked in at 08:30 AM</p></div></div><div class="panel animate-in"><div class="panel-body" style="text-align:center;padding:48px"><span class="material-symbols-outlined" style="font-size:64px;color:var(--accent);display:block;margin-bottom:16px">logout</span><h2 style="color:var(--primary);margin-bottom:8px">Check Out</h2><p style="color:var(--text-muted);margin-bottom:24px">Record your departure</p><button class="btn btn-outline btn-lg"><span class="material-symbols-outlined">exit_to_app</span> Check Out Now</button></div></div></div>` },
  { file: 'attendance-history.html', title: 'Attendance History', bc: 'SE &gt; <span>History</span>', content: `<div class="dash-welcome animate-in"><h1>Attendance History</h1><p>Your past attendance records.</p></div><div class="panel animate-in"><div class="panel-header"><span class="panel-title">Last 7 Days</span></div><div class="panel-body" style="padding:0"><table class="task-table"><thead><tr><th>Date</th><th>Check-In</th><th>Check-Out</th><th>Hours</th><th>Status</th></tr></thead><tbody><tr><td><strong>13 Apr</strong></td><td>08:30</td><td>—</td><td>4h</td><td><span class="status-badge active">Present</span></td></tr><tr><td><strong>12 Apr</strong></td><td>08:15</td><td>18:00</td><td>9h 45m</td><td><span class="status-badge active">Present</span></td></tr><tr><td><strong>11 Apr</strong></td><td>08:45</td><td>17:30</td><td>8h 45m</td><td><span class="status-badge active">Present</span></td></tr><tr><td><strong>10 Apr</strong></td><td>09:15</td><td>18:15</td><td>9h</td><td><span class="status-badge pending">Late</span></td></tr><tr><td><strong>09 Apr</strong></td><td>08:00</td><td>17:45</td><td>9h 45m</td><td><span class="status-badge active">Present</span></td></tr><tr><td><strong>08 Apr</strong></td><td>—</td><td>—</td><td>—</td><td><span class="status-badge progress">Leave</span></td></tr><tr><td><strong>07 Apr</strong></td><td>08:30</td><td>18:00</td><td>9h 30m</td><td><span class="status-badge active">Present</span></td></tr></tbody></table></div></div>` },
  { file: 'performance.html', title: 'Performance Progress', bc: 'SE &gt; <span>Performance</span>', content: `<div class="dash-welcome animate-in"><h1>Performance Progress</h1><p>Your task completion and efficiency metrics.</p></div><div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);"><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Tasks Done</div><div class="stat-card-value">42</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">check_circle</span></div></div></div><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">On-Time Percentage</div><div class="stat-card-value">93%</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">schedule</span></div></div></div><div class="stat-card animate-in"><div class="stat-card-header"><div><div class="stat-card-label">Average Hours</div><div class="stat-card-value">9.2h</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">timer</span></div></div></div></div>` }
];

// ==================== CLIENT CONTENT ====================
const clientPages = [
  {
    file: 'index.html', title: 'Client Dashboard', bc: 'Client Portal &gt; <span>Overview</span>', content: `
        <div class="dash-welcome animate-in"><h1>Project Overview 📊</h1><p>Performance across your investments.</p></div>
        <div class="panel animate-in" style="margin-bottom:24px;">
          <div class="panel-header" style="display:flex;align-items:center;justify-content:space-between;">
            <span class="panel-title">Select Project</span>
            <select id="clientProjectSelect" class="form-select" style="min-width:250px;">
              <option value="">Select Project</option>
              <option value="Titanium Business Hub">Titanium Business Hub</option>
              <option value="SkyTower Plaza">SkyTower Plaza</option>
              <option value="Hubli Tech Park">Hubli Tech Park</option>
            </select>
          </div>
        </div>
        <div id="clientDashboardContent" style="display:none;">
           <div class="stats-grid" style="grid-template-columns: repeat(3, 1fr);">
              <div class="stat-card animate-in">
                 <div class="stat-card-header"><div><div class="stat-card-label">Overall Progress</div><div class="stat-card-value" id="cdProgress">--%</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">analytics</span></div></div>
              </div>
              <div class="stat-card animate-in">
                 <div class="stat-card-header"><div><div class="stat-card-label">Status</div><div class="stat-card-value"><span class="status-badge" id="cdStatus">--</span></div></div><div class="stat-card-icon"><span class="material-symbols-outlined">info</span></div></div>
              </div>
              <div class="stat-card animate-in">
                 <div class="stat-card-header"><div><div class="stat-card-label">Timeline</div><div class="stat-card-value" id="cdTimeline" style="font-size:1.1rem">--</div></div><div class="stat-card-icon"><span class="material-symbols-outlined">calendar_today</span></div></div>
              </div>
           </div>
           <div>
             <div class="panel animate-in">
               <div class="panel-header"><span class="panel-title">Overall Progress</span></div>
               <div class="panel-body">
                 <div class="progress-bar-wrapper" style="margin-top:12px;margin-bottom:0">
                   <div class="progress-label"><span id="cdBarLabel">--</span><span id="cdBarStatus">--</span></div>
                   <div class="progress-track"><div id="cdBarFill" class="progress-fill" style="width:0%"></div></div>
                 </div>
               </div>
             </div>
           </div>
        </div>
        <script>
          const clientData = {
            "Titanium Business Hub": { progress: 68, status: "On Track", badge: "active", start: "Jan 2023", end: "Aug 2024" },
            "SkyTower Plaza": { progress: 78, status: "On Track", badge: "active", start: "Mar 2023", end: "Dec 2024" },
            "Hubli Tech Park": { progress: 33, status: "Delayed", badge: "pending", start: "Aug 2023", end: "May 2025" }
          };
          document.addEventListener('DOMContentLoaded', () => {
            const select = document.getElementById("clientProjectSelect");
            if(select) {
              select.addEventListener("change", function(e) {
                const val = e.target.value;
                const content = document.getElementById("clientDashboardContent");
                if (!val) { content.style.display = 'none'; return; }
                const d = clientData[val];
                document.getElementById("cdProgress").innerText = d.progress + "%";
                document.getElementById("cdStatus").className = "status-badge " + d.badge;
                document.getElementById("cdStatus").innerText = d.status;
                document.getElementById("cdTimeline").innerText = d.start + " - " + d.end;
                document.getElementById("cdBarLabel").innerText = d.progress + "%";
                document.getElementById("cdBarStatus").innerText = d.status;
                document.getElementById("cdBarFill").style.width = d.progress + "%";
                content.style.display = 'block';
              });
            }
          });
        </script>` },
  {
    file: 'project-progress.html', title: 'Project Progress', bc: 'Client &gt; <span>Projects</span>', content: `
        <div class="dash-welcome animate-in"><h1>Project Progress</h1><p>High-level breakdown of your projects.</p></div>
        <div class="panel animate-in">
          <div class="panel-header"><span class="panel-title">My Projects</span></div>
          <div class="panel-body" style="padding:0">
            <table class="task-table">
              <thead>
                <tr><th>Project Name</th><th>Location</th><th>Start Date</th><th>End Date</th><th>Progress</th><th>Status</th></tr>
              </thead>
              <tbody>
                <tr><td><strong>Titanium Business Hub</strong></td><td>Ahmedabad</td><td>Jan 2023</td><td>Aug 2024</td><td>68%</td><td><span class="status-badge active">On Track</span></td></tr>
                <tr><td><strong>SkyTower Plaza</strong></td><td>Mumbai</td><td>Mar 2023</td><td>Dec 2024</td><td>78%</td><td><span class="status-badge active">On Track</span></td></tr>
                <tr><td><strong>Hubli Tech Park</strong></td><td>Hubli</td><td>Aug 2023</td><td>May 2025</td><td>33%</td><td><span class="status-badge pending">Delayed</span></td></tr>
              </tbody>
            </table>
          </div>
        </div>` },
  {
    file: 'phase-progress.html', title: 'Phase Progress', bc: 'Client &gt; <span>Phases</span>', content: `
        <div class="dash-welcome animate-in"><h1>Phase Progress</h1><p>Phase-level breakdown for your projects.</p></div>
        <div class="panel animate-in">
          <div class="panel-header" style="display:flex;align-items:center;justify-content:space-between;">
            <span class="panel-title">Phase Breakdown</span>
            <select id="clientPhaseSelect" class="form-select" style="min-width:250px;">
              <option value="">Select Project</option>
              <option value="Titanium Business Hub">Titanium Business Hub</option>
              <option value="SkyTower Plaza">SkyTower Plaza</option>
              <option value="Hubli Tech Park">Hubli Tech Park</option>
            </select>
          </div>
          <div class="panel-body" id="clientPhaseContent">
            <div style="text-align:center;padding:40px 20px;color:var(--text-muted);">Select a project to view phase progress</div>
          </div>
        </div>
        <script>
          const phaseData = {
            "Titanium Business Hub": '<div class="progress-bar-wrapper"><div class="progress-label"><span>Phase 1: Site Prep</span><span>100%</span></div><div class="progress-track"><div class="progress-fill green" style="width:100%"></div></div></div><div class="progress-bar-wrapper"><div class="progress-label"><span>Phase 2: Foundation</span><span>100%</span></div><div class="progress-track"><div class="progress-fill green" style="width:100%"></div></div></div><div class="progress-bar-wrapper"><div class="progress-label"><span>Phase 3: Structural</span><span>85%</span></div><div class="progress-track"><div class="progress-fill blue" style="width:85%"></div></div></div><div class="progress-bar-wrapper"><div class="progress-label"><span>Phase 4: MEP</span><span>55%</span></div><div class="progress-track"><div class="progress-fill" style="width:55%"></div></div></div>',
            "SkyTower Plaza": '<div class="progress-bar-wrapper"><div class="progress-label"><span>Phase 1: Foundation</span><span>100%</span></div><div class="progress-track"><div class="progress-fill green" style="width:100%"></div></div></div><div class="progress-bar-wrapper"><div class="progress-label"><span>Phase 2: Structural</span><span>90%</span></div><div class="progress-track"><div class="progress-fill blue" style="width:90%"></div></div></div><div class="progress-bar-wrapper"><div class="progress-label"><span>Phase 3: MEP</span><span>40%</span></div><div class="progress-track"><div class="progress-fill" style="width:40%"></div></div></div>',
            "Hubli Tech Park": '<div class="progress-bar-wrapper"><div class="progress-label"><span>Phase 1: Site Prep</span><span>80%</span></div><div class="progress-track"><div class="progress-fill blue" style="width:80%"></div></div></div><div class="progress-bar-wrapper"><div class="progress-label"><span>Phase 2: Foundation</span><span>10%</span></div><div class="progress-track"><div class="progress-fill" style="width:10%"></div></div></div>'
          };
          document.addEventListener('DOMContentLoaded', () => {
            const select = document.getElementById("clientPhaseSelect");
            if(select) {
              select.addEventListener("change", function(e) {
                const val = e.target.value;
                const content = document.getElementById("clientPhaseContent");
                if (!val) { content.innerHTML = '<div style="text-align:center;padding:40px 20px;color:var(--text-muted);">Select a project to view phase progress</div>'; return; }
                content.innerHTML = phaseData[val];
              });
            }
          });
        </script>` },
  {
    file: 'photo-gallery.html', title: 'Photo Gallery', bc: 'Client &gt; <span>Photos</span>', content: `
        <div class="dash-welcome animate-in"><h1>Photo Gallery</h1><p>Site progress photos for your projects.</p></div>
        <div class="panel animate-in">
          <div class="panel-header">
            <span class="panel-title">Gallery</span>
          </div>
          <div class="panel-body">
            <div style="display:flex;flex-wrap:wrap;gap:16px;margin-bottom:20px">
              <select id="clientGalleryProjectFilter" class="form-select" style="min-width:200px">
                <option value="all">All My Projects</option>
                <option value="Titanium Business Hub">Titanium Business Hub</option>
                <option value="SkyTower Plaza">SkyTower Plaza</option>
                <option value="Hubli Tech Park">Hubli Tech Park</option>
              </select>
              <select id="clientGalleryCategoryFilter" class="form-select" style="min-width:200px">
                <option value="all">All Categories</option>
                <option value="Progress">Progress</option>
                <option value="Structural">Structural</option>
                <option value="Finishing">Finishing</option>
              </select>
            </div>
            <div class="dash-grid-3" id="clientPhotoGalleryGrid">
              <div class="photo-card" data-project="Titanium Business Hub" data-category="Progress" style="background:linear-gradient(135deg,#2C3E50,#34495E);border-radius:var(--radius-sm);height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(255,255,255,0.8);gap:8px">
                <span class="material-symbols-outlined" style="font-size:36px;color:var(--accent)">photo_camera</span>
                <span style="font-size:0.813rem;font-weight:600">Progress</span>
                <span style="font-size:0.688rem;opacity:0.6">Titanium Business Hub • 2 days ago</span>
              </div>
              <div class="photo-card" data-project="SkyTower Plaza" data-category="Structural" style="background:linear-gradient(135deg,#34495E,#2C3E50);border-radius:var(--radius-sm);height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(255,255,255,0.8);gap:8px">
                <span class="material-symbols-outlined" style="font-size:36px;color:var(--accent)">photo_camera</span>
                <span style="font-size:0.813rem;font-weight:600">Structural</span>
                <span style="font-size:0.688rem;opacity:0.6">SkyTower Plaza • 3 days ago</span>
              </div>
              <div class="photo-card" data-project="Hubli Tech Park" data-category="Finishing" style="background:linear-gradient(135deg,#2C3E50,#1a252f);border-radius:var(--radius-sm);height:180px;display:flex;flex-direction:column;align-items:center;justify-content:center;color:rgba(255,255,255,0.8);gap:8px">
                <span class="material-symbols-outlined" style="font-size:36px;color:var(--accent)">photo_camera</span>
                <span style="font-size:0.813rem;font-weight:600">Finishing</span>
                <span style="font-size:0.688rem;opacity:0.6">Hubli Tech Park • 5 days ago</span>
              </div>
            </div>
          </div>
        </div>
        <script>
          document.addEventListener("DOMContentLoaded", function() {
            const pF = document.getElementById("clientGalleryProjectFilter");
            const cF = document.getElementById("clientGalleryCategoryFilter");
            const cards = document.querySelectorAll(".photo-card");
            function filterAll() {
              const pV = pF.value;
              const cV = cF.value;
              cards.forEach(c => {
                const pM = (pV === "all" || c.dataset.project === pV);
                const cM = (cV === "all" || c.dataset.category === cV);
                c.style.display = (pM && cM) ? "flex" : "none";
              });
            }
            if(pF && cF) { pF.addEventListener("change", filterAll); cF.addEventListener("change", filterAll); }
          });
        </script>` },
  {
    file: 'gantt.html', title: 'Gantt View', bc: 'Client &gt; <span>Timeline</span>', content: `
        <div class="dash-welcome animate-in"><h1>Gantt Timeline</h1><p>Visual phase-wise timeline.</p></div>
        <div class="panel animate-in">
          <div class="panel-header" style="display:flex;align-items:center;justify-content:space-between;gap:16px">
            <span class="panel-title">Project Timeline</span>
            <div style="display:flex;align-items:center;gap:10px">
              <label for="clientGanttSelect" style="font-size:0.875rem;color:var(--text-muted);white-space:nowrap">Project:</label>
              <select id="clientGanttSelect" class="form-select" style="min-width:220px">
                <option value="">Select Project</option>
                <option value="Titanium Business Hub">Titanium Business Hub</option>
                <option value="SkyTower Plaza">SkyTower Plaza</option>
                <option value="Hubli Tech Park">Hubli Tech Park</option>
              </select>
            </div>
          </div>
          <div class="panel-body">
            <div id="clientGanttEmptyState" style="text-align:center;padding:40px 20px;color:var(--text-muted);">
              <span class="material-symbols-outlined" style="font-size:48px;opacity:0.5;margin-bottom:12px;display:block">timeline</span>
              <p>Select a project to view timeline</p>
            </div>
            
            <div class="client-gantt-project" data-gantt-project="Titanium Business Hub" style="display:none">
              <div style="overflow-x:auto">
                <div style="min-width:800px">
                  <div style="display:grid;grid-template-columns:200px 1fr;gap:0;border:1px solid var(--border);border-radius:var(--radius-sm)">
                    <div style="padding:12px 16px;font-weight:600;font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);background:var(--bg);border-bottom:1px solid var(--border)">Phase</div>
                    <div style="padding:12px 16px;font-weight:600;font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);background:var(--bg);border-bottom:1px solid var(--border);display:flex;justify-content:space-between"><span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span></div>
                    <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Phase 1 & 2: Foundation</div>
                    <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--success);height:20px;border-radius:4px;width:25%"></div></div>
                    <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Phase 3: Structural</div>
                    <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--info);height:20px;border-radius:4px;width:35%;margin-left:20%"></div></div>
                    <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Phase 4: MEP</div>
                    <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--accent);height:20px;border-radius:4px;width:30%;margin-left:40%"></div></div>
                    <div style="padding:10px 16px;font-size:0.875rem;font-weight:500">Phase 5 & 6: Finishing</div>
                    <div style="padding:10px 16px"><div style="background:var(--primary);opacity:0.3;height:20px;border-radius:4px;width:25%;margin-left:65%"></div></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="client-gantt-project" data-gantt-project="SkyTower Plaza" style="display:none">
              <div style="overflow-x:auto">
                <div style="min-width:800px">
                  <div style="display:grid;grid-template-columns:200px 1fr;gap:0;border:1px solid var(--border);border-radius:var(--radius-sm)">
                    <div style="padding:12px 16px;font-weight:600;font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);background:var(--bg);border-bottom:1px solid var(--border)">Phase</div>
                    <div style="padding:12px 16px;font-weight:600;font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);background:var(--bg);border-bottom:1px solid var(--border);display:flex;justify-content:space-between"><span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span></div>
                    <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Phase 1: Foundation</div>
                    <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--success);height:20px;border-radius:4px;width:30%"></div></div>
                    <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Phase 2: Structural</div>
                    <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--info);height:20px;border-radius:4px;width:40%;margin-left:25%"></div></div>
                    <div style="padding:10px 16px;font-size:0.875rem;font-weight:500">Phase 3: MEP</div>
                    <div style="padding:10px 16px"><div style="background:var(--accent);height:20px;border-radius:4px;width:30%;margin-left:60%"></div></div>
                  </div>
                </div>
              </div>
            </div>
            
            <div class="client-gantt-project" data-gantt-project="Hubli Tech Park" style="display:none">
              <div style="overflow-x:auto">
                <div style="min-width:800px">
                  <div style="display:grid;grid-template-columns:200px 1fr;gap:0;border:1px solid var(--border);border-radius:var(--radius-sm)">
                    <div style="padding:12px 16px;font-weight:600;font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);background:var(--bg);border-bottom:1px solid var(--border)">Phase</div>
                    <div style="padding:12px 16px;font-weight:600;font-size:0.75rem;text-transform:uppercase;color:var(--text-muted);background:var(--bg);border-bottom:1px solid var(--border);display:flex;justify-content:space-between"><span>Q1</span><span>Q2</span><span>Q3</span><span>Q4</span></div>
                    <div style="padding:10px 16px;font-size:0.875rem;font-weight:500;border-bottom:1px solid var(--border)">Phase 1: Site Prep</div>
                    <div style="padding:10px 16px;border-bottom:1px solid var(--border)"><div style="background:var(--success);height:20px;border-radius:4px;width:20%"></div></div>
                    <div style="padding:10px 16px;font-size:0.875rem;font-weight:500">Phase 2: Foundation</div>
                    <div style="padding:10px 16px"><div style="background:var(--info);height:20px;border-radius:4px;width:30%;margin-left:15%"></div></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <script>
          document.addEventListener("DOMContentLoaded", function() {
            const select = document.getElementById("clientGanttSelect");
            const panels = document.querySelectorAll(".client-gantt-project");
            const emptyState = document.getElementById("clientGanttEmptyState");

            function updateClientGantt() {
              const selectedValue = select.value;
              if (!selectedValue) {
                panels.forEach(p => p.style.display = 'none');
                emptyState.style.display = 'block';
                return;
              }
              emptyState.style.display = 'none';
              panels.forEach(p => {
                p.style.display = p.dataset.ganttProject === selectedValue ? 'block' : 'none';
              });
            }

            if (select) {
              select.addEventListener("change", updateClientGantt);
              updateClientGantt();
            }
          });
        </script>` }
];

// ==================== GENERATE ====================
const allRoles = { admin: adminPages, pm: pmPages, se: sePages, client: clientPages };
let count = 0;
for (const [role, pages] of Object.entries(allRoles)) {
  const dir = path.join(__dirname, role);
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
  for (const pg of pages) {
    const html = makePage(role, pg.file, pg.title, pg.bc, pg.content);
    fs.writeFileSync(path.join(dir, pg.file), html, 'utf8');
    count++;
  }
}
console.log(`Done! Generated ${count} pages with inline sidebars.`);
