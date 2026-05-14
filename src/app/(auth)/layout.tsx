import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Auth - AuthPlatform',
  description: 'Authentication pages',
};

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background via-background to-primary/5 p-4 sm:p-6 md:p-8 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 left-0 w-64 h-64 bg-primary/5 rounded-full blur-3xl -translate-x-1/2 -translate-y-1/2" />
      <div className="absolute bottom-0 right-0 w-96 h-96 bg-primary/3 rounded-full blur-3xl translate-x-1/3 translate-y-1/3" />
      <div className="relative z-10 w-full max-w-md">
        {children}
      </div>
    </div>
  );
}