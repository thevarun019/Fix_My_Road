/**
 * AppRouter — legacy export kept for backward compatibility.
 * Actual routing is now handled inside each shell:
 *   CitizenShell  →  /  /report  /track  /map  /about  /login
 *   OfficerShell  →  /authority  /authority/map  /authority/resolved  /authority/scorecard
 *   AdminShell    →  /admin  /admin/complaints  /admin/escalations  /admin/leaderboard  /admin/sla-rules  /admin/audit
 *
 * Shell selection is done in App.tsx based on user.role from useAuthStore.
 */
export {};
