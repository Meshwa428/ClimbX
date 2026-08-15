import Legal from "@/components/sections/legal";
import { TERMS_CONDITIONS } from "@/lib/legal-content";

export const metadata = { title: "Terms & Conditions — ClimbX Digital" };

export default function Page() {
  return <Legal doc={TERMS_CONDITIONS} eyebrow="Legal" />;
}
