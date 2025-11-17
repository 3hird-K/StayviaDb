// app/protected/landlords/page.tsx

import Feedbacks from "@/components/feedbacks"
import { SiteHeader } from "@/components/site-header"

export default function FeedbackPage() {
  return <>
      <SiteHeader title="Manage Feedbacks" subtitle="Dashboard" />
      <Feedbacks />
  </>
}
