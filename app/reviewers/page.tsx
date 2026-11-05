import { redirect } from 'next/navigation';

// The adviser workspace moved to /advisers; keep old links working.
export default function Page() { redirect('/advisers'); }
