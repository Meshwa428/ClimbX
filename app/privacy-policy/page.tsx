import Legal from "@/components/sections/legal";
import { PRIVACY_POLICY } from "@/lib/legal-content";

export const metadata = { title: "Privacy Policy — ClimbX Digital" };

export default function Page() {
  return <Legal doc={PRIVACY_POLICY} eyebrow="Legal" />;
}
