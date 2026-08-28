import type { Metadata } from 'next';
import './globals.css';

/**
 * Root layout — scaffold only.
 *
 * The design pass (task 4.11, specs/site) owns typography, themes and
 * density. The analytics component (task 5.1, specs/analytics) mounts here.
 * Keep this file small: it is the one thing every page inherits.
 */

export const metadata: Metadata = {
  title: 'AddictedtoAI',
  description:
    'Everything about AI, written by an AI, for the person who is addicted to AI.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
