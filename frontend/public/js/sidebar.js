/* ===== SHARED SIDEBAR GENERATOR ===== */
/* This file injects the correct sidebar into every dashboard page.
   The sidebar is 100% identical across all pages of a role. */

(function () {
  const path = window.location.pathname;
  let role = '';
  if (path.includes('/admin/')) role = 'admin';
  else if (path.includes('/pm/')) role = 'pm';
  else if (path.includes('/se/')) role = 'se';
  else if (path.includes('/client/')) role = 'client';
  if (!role) return;

  const page = path.split('/').pop() || 'index.html';

  const sidebars = {
    admin: {
      user: { name: 'Rajesh Kumar', role: 'Super Admin', initials: 'RK' },
      sections: [
        { label: 'Main', items: [
          { icon: 'dashboard', text: 'Admin Dashboard', href: 'index.html' }
        ]},
        { label: 'User Management', items: [
          { icon: 'person_add', text: 'Create User', href: 'create-user.html' },
          { icon: 'group', text: 'Manage Users', href: 'manage-users.html' }
        ]},
        { label: 'Projects', items: [
          { icon: 'add_circle', text: 'Create Project', href: 'create-project.html' },
          { icon: 'list_alt', text: 'Project List', href: 'project-list.html' }
        ]},
        { label: 'Operations', items: [
          { icon: 'fact_check', text: 'Attendance View', href: 'attendance.html' },
          { icon: 'account_balance', text: 'Budget Management', href: 'budget.html' },
          { icon: 'payments', text: 'Expense View', href: 'expenses.html' }
        ]},
        { label: 'Media', items: [
          { icon: 'add_a_photo', text: 'Photo Upload', href: 'photo-upload.html' },
          { icon: 'photo_library', text: 'Photo Gallery', href: 'photo-gallery.html' }
        ]},
        { label: 'Insights', items: [
          { icon: 'analytics', text: 'Full Analytics', href: 'analytics.html' },
          { icon: 'view_timeline', text: 'Gantt Chart', href: 'gantt.html' }
        ]}
      ]
    },
    pm: {
      user: { name: 'Arjun Mehta', role: 'Senior PM', initials: 'AM' },
      sections: [
        { label: 'Main', items: [
          { icon: 'dashboard', text: 'PM Dashboard', href: 'index.html' }
        ]},
        { label: 'Planning', items: [
          { icon: 'layers', text: 'Create Phase', href: 'create-phase.html' },
          { icon: 'add_task', text: 'Create Task', href: 'create-task.html' },
          { icon: 'assignment', text: 'Task Management', href: 'task-management.html' }
        ]},
        { label: 'Materials', items: [
          { icon: 'inventory_2', text: 'Material Master', href: 'material-master.html' },
          { icon: 'receipt_long', text: 'Material Stock Entry', href: 'material-stock.html' },
          { icon: 'description', text: 'Material Report', href: 'material-report.html' }
        ]},
        { label: 'Finance', items: [
          { icon: 'payments', text: 'Expense List', href: 'expense-list.html' },
          { icon: 'account_balance', text: 'Budget Summary', href: 'budget-summary.html' }
        ]},
        { label: 'Operations', items: [
          { icon: 'fact_check', text: 'Attendance View', href: 'attendance.html' }
        ]},
        { label: 'Media & Insights', items: [
          { icon: 'add_a_photo', text: 'Photo Upload', href: 'photo-upload.html' },
          { icon: 'photo_library', text: 'Photo Gallery', href: 'photo-gallery.html' },
          { icon: 'analytics', text: 'Analytics Dashboard', href: 'analytics.html' },
          { icon: 'view_timeline', text: 'Gantt Chart', href: 'gantt.html' }
        ]}
      ]
    },
    se: {
      user: { name: 'Vikram Patel', role: 'Site Engineer', initials: 'VP' },
      sections: [
        { label: 'Main', items: [
          { icon: 'dashboard', text: 'Engineer Dashboard', href: 'index.html' }
        ]},
        { label: 'Field Work', items: [
          { icon: 'assignment', text: 'My Tasks', href: 'my-tasks.html' },
          { icon: 'inventory_2', text: 'Material Usage', href: 'material-usage.html' }
        ]},
        { label: 'Attendance', items: [
          { icon: 'login', text: 'Check-in / Check-out', href: 'check-in.html' },
          { icon: 'schedule', text: 'Attendance History', href: 'attendance-history.html' }
        ]},
        { label: 'Reports', items: [
          { icon: 'trending_up', text: 'Performance Progress', href: 'performance.html' },
          { icon: 'photo_library', text: 'Photo Gallery', href: 'gallery.html' }
        ]}
      ]
    },
    client: {
      user: { name: 'Neha Sharma', role: 'Client Director', initials: 'NS' },
      sections: [
        { label: 'Portfolio', items: [
          { icon: 'dashboard', text: 'Client Dashboard', href: 'index.html' },
          { icon: 'analytics', text: 'Project Progress', href: 'project-progress.html' },
          { icon: 'step', text: 'Phase Progress', href: 'phase-progress.html' },
          { icon: 'photo_library', text: 'Photo Gallery', href: 'photo-gallery.html' },
          { icon: 'view_timeline', text: 'Gantt View', href: 'gantt.html' }
        ]}
      ]
    }
  };

  const config = sidebars[role];
  if (!config) return;

  let navHTML = '';
  config.sections.forEach((section, si) => {
    if (si === 0) {
      navHTML += '';
    }
    navHTML += section.items.map(item => {
      const isActive = item.href === page ? ' class="active"' : '';
      return `<a href="${item.href}"${isActive}><span class="material-symbols-outlined">${item.icon}</span> ${item.text}</a>`;
    }).join('');
    if (si < config.sections.length - 1) {
      navHTML += `<div class="sidebar-section-label" style="padding-left:0">${config.sections[si + 1].label}</div>`;
    }
  });

  navHTML += '<div class="divider"></div>';
  navHTML += '<a href="#" class="logout-btn"><span class="material-symbols-outlined">logout</span> Logout</a>';

  const sidebarHTML = `
    <div class="sidebar-header">
      <img src="../assets/logo.png" alt="AssembleMonitor">
      <span class="sidebar-brand">Assemble<span>Monitor</span></span>
    </div>
    <div class="sidebar-section-label">${config.sections[0].label}</div>
    <nav class="sidebar-nav">${navHTML}</nav>
    <div class="sidebar-footer">
      <div class="sidebar-user">
        <div class="sidebar-user-avatar">${config.user.initials}</div>
        <div class="sidebar-user-info">
          <div class="sidebar-user-name">${config.user.name}</div>
          <div class="sidebar-user-role">${config.user.role}</div>
        </div>
      </div>
    </div>`;

  const sidebar = document.getElementById('sidebar');
  if (sidebar) {
    sidebar.innerHTML = sidebarHTML;
  }
})();
