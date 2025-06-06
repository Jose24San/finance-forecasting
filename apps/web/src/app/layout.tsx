import './global.css';
import { SessionProvider } from '@/components/providers/session-provider';

export const metadata = {
  title: 'Finpilot - Financial Planning Made Simple',
  description: 'Plan your financial future with confidence using Finpilot',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <SessionProvider>{children}</SessionProvider>
      </body>
    </html>
  );
}
