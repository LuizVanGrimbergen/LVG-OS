import { PageHeader } from "@/components/layout/page-header";
import { AccountSection } from "@/features/about/components/account-section";

export default function AboutPage() {
  return (
    <div className="space-y-6">
      <PageHeader title="About me" />
      <AccountSection />
    </div>
  );
}
