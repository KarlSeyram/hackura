
import { redirect } from 'next/navigation';

// This page has been replaced by /admin/users.
// This component simply redirects to the new page.
export default function OldAnalyticsPage() {
  redirect('/admin/users');
}
