import './globals.css';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Thai Bank Money Map',
  description: 'Interactive 3D map of the Thai banking system',
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="th">
      <body>{children}</body>
    </html>
  );
}
