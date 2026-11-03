import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PitchProof | Human verification for AI claims',
  description: 'Check the AI claim behind your next decision. Compare adviser opinions, choose your expert, and get an evidence-based finding.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
