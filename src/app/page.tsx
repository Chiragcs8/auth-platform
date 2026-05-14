'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Shield, Users, Building2, HeadphonesIcon, LineChart, ArrowRight, CheckCircle2, Star, Zap, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';

const fadeInUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1,
    },
  },
};

const roles = [
  {
    icon: Shield,
    title: 'Admin',
    description: 'Full system control with user management, analytics, and configuration oversight.',
    features: ['User Management', 'System Analytics', 'Role Configuration', 'Audit Logs'],
    color: 'from-red-500 to-orange-500',
  },
  {
    icon: Building2,
    title: 'Vendor',
    description: 'Manage products, orders, and business operations with comprehensive dashboards.',
    features: ['Product Catalog', 'Order Management', 'Revenue Analytics', 'Customer Insights'],
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Users,
    title: 'Client',
    description: 'Browse services, manage orders, and track deliveries with an intuitive interface.',
    features: ['Service Discovery', 'Order Tracking', 'Payment Management', 'Review System'],
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: HeadphonesIcon,
    title: 'Support Staff',
    description: 'Handle tickets, resolve issues, and maintain customer satisfaction metrics.',
    features: ['Ticket Management', 'Issue Resolution', 'Customer Satisfaction', 'Knowledge Base'],
    color: 'from-purple-500 to-violet-500',
  },
  {
    icon: LineChart,
    title: 'Broker',
    description: 'Facilitate transactions, manage commissions, and analyze market opportunities.',
    features: ['Transaction Facilitation', 'Commission Tracking', 'Market Analysis', 'Client Matching'],
    color: 'from-amber-500 to-yellow-500',
  },
];

const features = [
  {
    icon: Shield,
    title: 'Enterprise Security',
    description: 'JWT-based authentication with HttpOnly cookies, bcrypt password hashing, and role-based access control.',
  },
  {
    icon: Zap,
    title: 'Blazing Fast',
    description: 'Built on Next.js with server-side rendering, optimized queries, and edge-ready architecture.',
  },
  {
    icon: Globe,
    title: 'Multi-Role Architecture',
    description: 'Five distinct role types with dedicated dashboards, custom navigation, and role-specific features.',
  },
  {
    icon: Star,
    title: 'Modern UI/UX',
    description: 'Shadcn/ui components, Framer Motion animations, dark/light mode, and fully responsive design.',
  },
];

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="flex items-center gap-2"
          >
            <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                AP
              </div>
              <span className="text-xl font-bold">AuthPlatform</span>
            </Link>
          </motion.div>

          <nav className="hidden md:flex items-center gap-6">
            <a href="#features" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Features</a>
            <a href="#roles" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Roles</a>
            <a href="#security" className="text-sm text-muted-foreground hover:text-foreground transition-colors">Security</a>
          </nav>

          <div className="flex items-center gap-3">
            <ThemeToggle />
            <Link href="/login">
              <Button variant="ghost" size="sm">Sign In</Button>
            </Link>
            <Link href="/register">
              <Button size="sm">Get Started</Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-background to-secondary/5" />
        <div className="relative z-10 container mx-auto px-4 py-20 md:py-32">
          <motion.div
            variants={staggerContainer}
            initial="initial"
            animate="animate"
            className="max-w-3xl mx-auto text-center space-y-6"
          >
            <motion.div variants={fadeInUp}>
              <Badge variant="secondary" className="px-4 py-1 text-sm">
                🚀 Production-Grade Multi-Role Auth Platform
              </Badge>
            </motion.div>

            <motion.h1 variants={fadeInUp} className="text-4xl md:text-6xl font-bold tracking-tight">
              Authentication & Profile
              <span className="text-primary"> Management</span>
              <br />
              Made <span className="text-primary">Simple</span>
            </motion.h1>

            <motion.p variants={fadeInUp} className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto">
              A complete multi-role platform with 5 distinct user types, enterprise-grade security,
              modern UI, and production-ready architecture. Built with Next.js, PostgreSQL, and Prisma.
            </motion.p>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Start Free Today
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  View Demo
                </Button>
              </Link>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex items-center justify-center gap-6 pt-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                No credit card required
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                5 role types
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <CheckCircle2 className="h-4 w-4 text-green-500" />
                Enterprise security
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Why Choose AuthPlatform?</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built from the ground up with modern technologies and best practices for
              production-grade authentication and profile management.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {features.map((feature, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="border hover:shadow-lg transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 mb-4">
                      <feature.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
                    <p className="text-sm text-muted-foreground">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Roles Section */}
      <section id="roles" className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Five Distinct Roles</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Each role has its own dedicated dashboard, navigation, and feature set
              tailored to specific responsibilities.
            </p>
          </motion.div>

          <motion.div
            variants={staggerContainer}
            initial="initial"
            whileInView="animate"
            viewport={{ once: true }}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
          >
            {roles.map((role, index) => (
              <motion.div key={index} variants={fadeInUp}>
                <Card className="border hover:shadow-lg transition-shadow overflow-hidden">
                  <div className={`h-2 bg-gradient-to-r ${role.color}`} />
                  <CardContent className="pt-6">
                    <div className="flex items-center gap-3 mb-4">
                      <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-gradient-to-r ${role.color} text-white`}>
                        <role.icon className="h-5 w-5" />
                      </div>
                      <h3 className="text-lg font-semibold">{role.title}</h3>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4">{role.description}</p>
                    <div className="space-y-2">
                      {role.features.map((feature, fIndex) => (
                        <div key={fIndex} className="flex items-center gap-2 text-sm">
                          <CheckCircle2 className="h-3 w-3 text-primary" />
                          {feature}
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </section>

      {/* Security Section */}
      <section id="security" className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-4xl mx-auto"
          >
            <div className="text-center mb-12">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Enterprise-Grade Security</h2>
              <p className="text-muted-foreground max-w-2xl mx-auto">
                Your data is protected with industry-standard security practices
                and modern authentication protocols.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {[
                { title: 'JWT Authentication', desc: 'Access & refresh token strategy with HttpOnly secure cookies' },
                { title: 'Password Security', desc: 'bcrypt hashing with 12 salt rounds for maximum protection' },
                { title: 'Role-Based Access', desc: 'Middleware route guards enforcing role-specific access control' },
                { title: 'Session Management', desc: 'Database-backed sessions with activity logging and audit trails' },
                { title: 'Input Validation', desc: 'Zod schema validation on both client and server side' },
                { title: 'CSRF Protection', desc: 'SameSite cookie attributes and origin verification' },
              ].map((item, index) => (
                <motion.div
                  key={index}
                  initial={{ opacity: 0, x: index % 2 === 0 ? -20 : 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Card className="border">
                    <CardContent className="pt-6">
                      <div className="flex items-center gap-3">
                        <Shield className="h-5 w-5 text-primary" />
                        <h3 className="font-semibold">{item.title}</h3>
                      </div>
                      <p className="text-sm text-muted-foreground mt-2">{item.desc}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="max-w-2xl mx-auto text-center"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Get Started?</h2>
            <p className="text-muted-foreground mb-8">
              Join thousands of users who trust AuthPlatform for their authentication
              and profile management needs.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/register">
                <Button size="lg" className="gap-2">
                  Create Your Account
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link href="/login">
                <Button variant="outline" size="lg">
                  Sign In to Dashboard
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t py-8">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-md bg-primary text-primary-foreground font-bold text-xs">
                AP
              </div>
              <span className="text-sm font-semibold">AuthPlatform</span>
            </div>
            <p className="text-sm text-muted-foreground">
              © {new Date().getFullYear()} AuthPlatform. Built with Next.js, PostgreSQL & Prisma.
            </p>
            <div className="flex items-center gap-4">
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Privacy</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Terms</a>
              <a href="#" className="text-sm text-muted-foreground hover:text-foreground">Support</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
