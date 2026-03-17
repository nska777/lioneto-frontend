import DashboardStats from "./DashboardStats";
import DashboardQuickLinks from "./DashboardQuickLinks";
import DashboardRecentNews from "./DashboardRecentNews";
import DashboardCalendarWidget from "./DashboardCalendarWidget";
import DashboardActivityLogger from "./DashboardActivityLogger";

export default function Page() {
  return (
    <div className="space-y-6">
      <DashboardActivityLogger />

      <DashboardStats />

      <div className="grid gap-6 lg:grid-cols-2">
        <DashboardQuickLinks />
        <DashboardCalendarWidget />
      </div>

      <DashboardRecentNews />
    </div>
  );
}
