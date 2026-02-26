import type {Metadata} from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'EuroData',
  description: 'Official data. No editorials.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html>
      <body>{children}</body>
    </html>
  );
}
