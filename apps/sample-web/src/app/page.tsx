import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sample Web App - SpecKit Monorepo',
  description: 'Demo Next.js application in monorepo setup',
};

export default function HomePage() {
  return (
    <main className="container">
      <h1>Sample Web Application</h1>
      <p>
        This is a Next.js application running in the SpecKit monorepo setup.
      </p>
      <div>
        <h2>Monorepo Features Demonstrated:</h2>
        <ul>
          <li>✅ Shared TypeScript configuration</li>
          <li>✅ Shared ESLint configuration</li>
          <li>✅ Turbo build system integration</li>
          <li>✅ pnpm workspace management</li>
        </ul>
      </div>
    </main>
  );
}