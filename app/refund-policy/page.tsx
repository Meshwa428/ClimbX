import Legal from "@/components/sections/legal";
import { REFUND_POLICY } from "@/lib/legal-content";

export const metadata = { title: "Cancellation & Refund Policy — ClimbX Digital" };

export default function Page() {
  return <Legal doc={REFUND_POLICY} eyebrow="Legal" />;
}
