export const roleUsers = {
  admin: { name: "Rajesh Kumar", title: "Super Admin", initials: "RK" },
  pm: { name: "Arjun Mehta", title: "Senior PM", initials: "AM" },
  se: { name: "Vikram Patel", title: "Site Engineer", initials: "VP" },
  client: { name: "Neha Sharma", title: "Client Director", initials: "NS" },
};

export const sidebarDefs = {
  admin: [
    {
      label: "Main",
      items: [{ icon: "dashboard", text: "Admin Dashboard", slug: "index" }],
    },
    {
      label: "User Management",
      items: [
        { icon: "group", text: "Manage Users", slug: "manage-users" },
      ],
    },
    {
      label: "Projects",
      items: [
        { icon: "list_alt", text: "Project List", slug: "project-list" },
      ],
    },
    {
      label: "Operations",
      items: [
        { icon: "fact_check", text: "Attendance View", slug: "attendance" },
        { icon: "account_balance", text: "Budget Management", slug: "budget" },
        { icon: "payments", text: "Expense View", slug: "expenses" },
      ],
    },
    {
      label: "Media",
      items: [
        { icon: "photo_library", text: "Photo Gallery", slug: "photo-gallery" },
      ],
    },
    {
      label: "Insights",
      items: [
        { icon: "analytics", text: "Full Analytics", slug: "analytics" },
        { icon: "view_timeline", text: "Gantt Chart", slug: "gantt" },
      ],
    },
  ],
  pm: [
    {
      label: "Main",
      items: [{ icon: "dashboard", text: "PM Dashboard", slug: "index" }],
    },
    {
      label: "Planning",
      items: [
        { icon: "account_tree", text: "Manage Phases", slug: "manage-phases" },
        { icon: "assignment", text: "Manage Tasks", slug: "manage-tasks" },
      ],
    },
    {
      label: "Materials",
      items: [
        { icon: "inventory_2", text: "Material Master", slug: "material-master" },
        {
          icon: "receipt_long",
          text: "Material Stock Entry",
          slug: "material-stock",
        },
        { icon: "description", text: "Material Report", slug: "material-report" },
      ],
    },
    {
      label: "Finance",
      items: [
        { icon: "payments", text: "Expense List", slug: "expense-list" },
        { icon: "account_balance", text: "Budget Summary", slug: "budget-summary" },
      ],
    },
    {
      label: "Operations",
      items: [{ icon: "fact_check", text: "Attendance View", slug: "attendance" }],
    },
    {
      label: "Media & Insights",
      items: [
        { icon: "photo_library", text: "Photo Gallery", slug: "photo-gallery" },
        { icon: "analytics", text: "Analytics Dashboard", slug: "analytics" },
        { icon: "view_timeline", text: "Gantt Chart", slug: "gantt" },
      ],
    },
  ],
  se: [
    {
      label: "Main",
      items: [{ icon: "dashboard", text: "Engineer Dashboard", slug: "index" }],
    },
    {
      label: "Field Work",
      items: [
        { icon: "assignment", text: "My Tasks", slug: "my-tasks" },
        { icon: "inventory_2", text: "Material Usage", slug: "material-usage" },
      ],
    },
    {
      label: "Attendance",
      items: [
        { icon: "login", text: "Check-in / Check-out", slug: "check-in" },
        { icon: "schedule", text: "Attendance History", slug: "attendance-history" },
      ],
    },
    {
      label: "Reports",
      items: [
        { icon: "trending_up", text: "Performance Progress", slug: "performance" },
        { icon: "photo_library", text: "Photo Gallery", slug: "gallery" },
      ],
    },
  ],
  client: [
    {
      label: "Portfolio",
      items: [
        { icon: "dashboard", text: "Client Dashboard", slug: "index" },
        { icon: "analytics", text: "Project Progress", slug: "project-progress" },
        { icon: "step", text: "Phase Progress", slug: "phase-progress" },
        { icon: "photo_library", text: "Photo Gallery", slug: "photo-gallery" },
        { icon: "view_timeline", text: "Gantt View", slug: "gantt" },
      ],
    },
  ],
};

const route = (role, slug, title, breadcrumb) => ({
  role,
  slug,
  fileName: `${slug}.html`,
  title,
  breadcrumb,
});

export const dashboardRoutes = [
  route("admin", "index", "Admin Dashboard", "Admin > Dashboard"),
  route("admin", "create-user", "Create User", "Admin > Create User"),
  route("admin", "manage-users", "Manage Users", "Admin > Manage Users"),
  route("admin", "create-project", "Create Project", "Admin > Create Project"),
  route("admin", "edit-project", "Edit Project", "Admin > Edit Project"),
  route("admin", "project-list", "Project List", "Admin > Project List"),
  route("admin", "attendance", "Attendance View", "Admin > Attendance View"),
  route("admin", "budget", "Budget Management", "Admin > Budget Management"),
  route("admin", "expenses", "Expense View", "Admin > Expense View"),
  route("admin", "photo-upload", "Photo Upload", "Admin > Photo Upload"),
  route("admin", "photo-gallery", "Photo Gallery", "Admin > Photo Gallery"),
  route("admin", "analytics", "Full Analytics", "Admin > Full Analytics"),
  route("admin", "gantt", "Gantt Chart", "Admin > Gantt Chart"),
  route("admin", "system-logs", "System Logs", "Admin > System Logs"),

  route("pm", "index", "PM Dashboard", "PM > Dashboard"),
  route("pm", "create-phase", "Create Phase", "PM > Create Phase"),
  route("pm", "manage-phases", "Manage Phases", "PM > Manage Phases"),
  route("pm", "view-phase", "View Phase", "PM > View Phase"),
  route("pm", "edit-phase", "Edit Phase", "PM > Edit Phase"),
  route("pm", "create-task", "Create Task", "PM > Create Task"),
  route("pm", "manage-tasks", "Manage Tasks", "PM > Manage Tasks"),
  route("pm", "view-task", "View Task", "PM > View Task"),
  route("pm", "edit-task", "Edit Task", "PM > Edit Task"),
  route("pm", "material-master", "Material Master", "PM > Materials"),
  route("pm", "material-stock", "Material Stock Entry", "PM > Stock Entry"),
  route("pm", "material-report", "Material Report", "PM > Material Report"),
  route("pm", "expense-entry", "Expense Entry", "PM > Expense Entry"),
  route("pm", "expense-list", "Expense List", "PM > Expense List"),
  route("pm", "budget-summary", "Budget Summary", "PM > Budget"),
  route("pm", "attendance", "Attendance View", "PM > Attendance"),
  route("pm", "photo-upload", "Photo Upload", "PM > Upload"),
  route("pm", "photo-gallery", "Photo Gallery", "PM > Gallery"),
  route("pm", "analytics", "Analytics Dashboard", "PM > Analytics"),
  route("pm", "gantt", "Gantt Chart", "PM > Gantt"),

  route("se", "index", "Engineer Dashboard", "Site Engineer > Dashboard"),
  route("se", "my-tasks", "My Tasks", "SE > My Tasks"),
  route("se", "material-usage", "Material Usage", "SE > Material Usage"),
  route("se", "check-in", "Check-in / Check-out", "SE > Check-in"),
  route("se", "attendance-history", "Attendance History", "SE > History"),
  route("se", "performance", "Performance Progress", "SE > Performance"),
  route("se", "gallery", "Photo Gallery", "SE > Gallery"),

  route("client", "index", "Client Dashboard", "Client Portal > Overview"),
  route("client", "project-progress", "Project Progress", "Client > Projects"),
  route("client", "phase-progress", "Phase Progress", "Client > Phases"),
  route("client", "photo-gallery", "Photo Gallery", "Client > Photos"),
  route("client", "gantt", "Gantt View", "Client > Timeline"),
];

export const authRedirectByRole = {
  admin: "/admin",
  pm: "/pm",
  se: "/se",
  client: "/client",
};
