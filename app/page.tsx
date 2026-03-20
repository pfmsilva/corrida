// Root page — immediately redirects to /dashboard.
// The middleware handles the actual auth check:
//   - authenticated   → /dashboard (via this redirect)
//   - unauthenticated → /login     (caught by middleware)
import { redirect } from "next/navigation";

export default function Home() {
  redirect("/dashboard");
}
