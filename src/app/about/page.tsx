import { PageHeader } from "@/components/layout/page-header";
import { AccountSection } from "@/features/about/components/account-section";
import { ReminderToggle } from "@/features/reminders/components/reminder-toggle";

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="About me" />
      <ReminderToggle />
      <AccountSection />
    </div>
  );
}
