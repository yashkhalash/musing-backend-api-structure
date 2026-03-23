export interface RouteItem {
  path: string;
  label: string;
  icon: string;
  animationDelay: number;
  method: string;
  body: any;
  headers: any;
}

export interface RoleRoutes {
  role: string;
  routes: RouteItem[];
}

export const ROLE_BASED_ROUTES: RoleRoutes[] = [
  {
    role: "user",
    routes: [
      { path: "/dashboard", label: "My Dashboard", icon: "LayoutDashboard", animationDelay: 0.1, method: "GET", body: null, headers: null },
      { path: "/mood-tracker", label: "Mood Tracker", icon: "Smile", animationDelay: 0.2, method: "GET", body: null, headers: null },
      { path: "/profile", label: "Profile Settings", icon: "User", animationDelay: 0.3, method: "GET", body: null, headers: null },
    ],
  },
  {
    role: "admin",
    routes: [
      { path: "/admin/home", label: "Super Admin Home", icon: "Shield", animationDelay: 0.1, method: "GET", body: null, headers: null },
      { path: "/admin/manage-users", label: "Manage All Users", icon: "Users", animationDelay: 0.2, method: "GET", body: null, headers: null },
      { path: "/admin/analytics", label: "Global Analytics", icon: "Activity", animationDelay: 0.3, method: "GET", body: null, headers: null },
    ],
  },
  {
    role: "organization",
    routes: [
      { path: "/org/summary", label: "Org Summary", icon: "Building", animationDelay: 0.1, method: "GET", body: null, headers: null },
      { path: "/org/team", label: "Manage Team", icon: "UsersRound", animationDelay: 0.2, method: "GET", body: null, headers: null },
      { path: "/org/reports", label: "Org Reports", icon: "BarChart3", animationDelay: 0.3, method: "GET", body: null, headers: null },
    ],
  },
];

export function getRoutesByRole(roleName: string): RouteItem[] {
  const roleRoutes = ROLE_BASED_ROUTES.find(r => r.role === roleName.toLowerCase());
  return roleRoutes ? roleRoutes.routes : [];
}
