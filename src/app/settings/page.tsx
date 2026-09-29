import { PageHeader } from "@/components/layout/page-header";
import { AccountSection } from "@/features/settings/components/account-section";
import { ReminderToggle } from "@/features/reminders/components/reminder-toggle";

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="Settings" />
      <ReminderToggle />
      <AccountSection />
    </div>
  );
}
