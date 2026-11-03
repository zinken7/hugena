import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'PitchProof — Make your next move a stronger one',
  description: 'Challenge your idea before the real world does. An interactive idea-review prototype.',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
