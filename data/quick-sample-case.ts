import type { Claim } from './sample-case';

export const quickSampleCase = {
  id: 'PP-002',
  date: '3 November 2026',
  feeCents: 1000,
  reportPages: 2,
  claim: {
    claim: 'One developer can deliver a service-booking MVP in 5 working days.',
    category: 'Delivery plan',
    context: 'A single-location service business needs a web app with customer sign-in, six predefined services, fixed appointment slots, booking and cancellation, and a staff booking list. One experienced full-stack developer is available for 8 hours per day for 5 working days.',
    constraints: '40 working hours total, including testing, deployment and 4 hours reserved for fixes. Before day 1: approved screen sketches, service names and durations, slot data, hosting access and a chosen authentication service are ready. No payments, email/SMS, recurring bookings, multiple locations or calendar integrations.',
    decision: 'Can I approve this limited MVP for a five-working-day delivery window?',
  } satisfies Claim,
  verdict: 'Insufficient evidence',
  summary: 'The scoped estimate fits 40 hours, including a 4-hour fix reserve. This is a testable five-day plan, not proof of delivery: the developer has not validated the estimates or completed the acceptance checks.',
  prerequisites: 'An experienced developer, approved screen sketches, six service records, fixed slot data, hosting access and the selected auth service must be ready before day 1.',
  exclusions: 'Payments, email/SMS, recurring bookings, multiple locations, calendar sync and a service/slot editor are excluded. Services and slots are seeded; staff cannot create new slots in this release.',
  days: [
    { day: 1, title: 'Foundation & sign-in', tasks: [
      { text: 'Create repository, app routes and environment template', hours: 1 },
      { text: 'Create users, services, slots and bookings tables; run migrations', hours: 2 },
      { text: 'Connect sign-in/sign-out and protect customer/staff routes', hours: 3 },
      { text: 'Seed six services, fixed slots and two test accounts', hours: 2 },
    ], done: 'Both test accounts sign in; customers cannot open staff routes.' },
    { day: 2, title: 'Services & available slots', tasks: [
      { text: 'Build service list and detail screens', hours: 2 },
      { text: 'Show available slots filtered by service and date', hours: 2 },
      { text: 'Validate inputs; display all times in Australia/Perth', hours: 2 },
      { text: 'Add loading, empty and error states; check mobile layout', hours: 2 },
    ], done: 'A customer selects a service and sees only future, available slots.' },
    { day: 3, title: 'Book, view & cancel', tasks: [
      { text: 'Save bookings atomically; reject a second booking of the same slot', hours: 3 },
      { text: 'Build My bookings with owner-only access', hours: 2 },
      { text: 'Cancel a future booking and release its slot', hours: 2 },
      { text: 'Show booking reference and confirmation screen', hours: 1 },
    ], done: 'Two requests for one slot produce one booking; cancellation reopens it.' },
    { day: 4, title: 'Staff view & critical checks', tasks: [
      { text: 'Build staff daily booking list with date filter', hours: 2 },
      { text: 'Allow staff to mark bookings completed; enforce staff-only writes', hours: 2 },
      { text: 'Test booking, cancellation, double-booking and account isolation', hours: 3 },
      { text: 'Check customer and staff screens at 390px width', hours: 1 },
    ], done: 'Staff update a booking; another customer cannot read or alter it.' },
    { day: 5, title: 'Deploy, hand over & fix', tasks: [
      { text: 'Deploy app, configure environment and apply migrations', hours: 1 },
      { text: 'Smoke-test sign-in, booking and cancellation on the deployed app', hours: 1 },
      { text: 'Write setup, seeded-data and rollback instructions', hours: 1 },
      { text: 'Walk through acceptance checks with the owner', hours: 1 },
      { text: 'Reserve for defects found during testing and sign-off', hours: 4, reserve: true },
    ], done: 'The owner completes the live flow; no blocking defects remain.' },
  ],
} as const;

export const quickTotalHours = quickSampleCase.days.reduce((total, day) => total + day.tasks.reduce((sum, task) => sum + task.hours, 0), 0);
export const quickReserveHours = quickSampleCase.days.reduce((total, day) => total + day.tasks.reduce((sum, task) => sum + ('reserve' in task ? task.hours : 0), 0), 0);
