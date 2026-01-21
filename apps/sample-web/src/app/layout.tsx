import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    template: '%s | Sample Web App',
    default: 'Sample Web App - SpecKit Monorepo',
  },
  description: 'Demo Next.js application in monorepo setup',
};

interface RootLayoutProps {
  children: React.ReactNode;
}

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en">
      <head />
      <body>
        <div id="__next">{children}</div>
      </body>
    </html>
  );
}