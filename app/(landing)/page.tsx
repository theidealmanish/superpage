'use client';

import { motion } from 'framer-motion';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  ArrowRight, 
  Youtube, 
  Github, 
  Twitter,
  Star,
  Users,
  Gift,
  Zap,
  Shield,
  TrendingUp
} from 'lucide-react';

export default function Home() {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-b from-[#552CB7] to-[#058CD7]">
        {/* Animated background shapes */}
        <div className="absolute inset-0 overflow-hidden">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 1 }}
            className="absolute top-20 -left-20 w-96 h-96 bg-white rounded-full blur-3xl"
          />
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.1 }}
            transition={{ duration: 1, delay: 0.2 }}
            className="absolute bottom-20 -right-20 w-96 h-96 bg-[#FFC567] rounded-full blur-3xl"
          />
        </div>

        <div className="container mx-auto px-4 relative z-10">
          <div className="text-center">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              <Badge variant="secondary" className="mb-4 bg-white/10 text-white border-none">
                The Future of Creator Economy
              </Badge>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white mb-6"
            >
              Turn Fan Attention Into{' '}
              <span className="text-[#FFC567]">Real Value</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl text-white/80 mb-8 max-w-2xl mx-auto"
            >
              Web3-powered platform that rewards genuine engagement with loyalty tokens,
              direct tipping, and exclusive perks.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="flex flex-col sm:flex-row gap-4 justify-center"
            >
              <Button
                size="lg"
                className="bg-[#FFC567] text-[#552CB7] hover:bg-[#FFC567]/90 hover-glow"
                asChild
              >
                <Link href="/register">
                  Claim Your Creator Link
                  <ArrowRight className="ml-2" />
                </Link>
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 text-white hover:bg-white/10"
                asChild
              >
                <Link href="#how-it-works">
                  Learn More
                </Link>
              </Button>
            </motion.div>

            {/* Platform Icons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="mt-12 flex justify-center items-center gap-8"
            >
              <Youtube className="w-8 h-8 text-white/60" />
              <Github className="w-8 h-8 text-white/60" />
              <Twitter className="w-8 h-8 text-white/60" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section id="how-it-works" className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">How It Works</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Simple Steps to Get Started
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Start earning rewards for your engagement across platforms
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                icon: <Users className="w-8 h-8 text-[#552CB7]" />,
                title: "Connect & Engage",
                description: "Link your social accounts and engage with creators naturally"
              },
              {
                icon: <Star className="w-8 h-8 text-[#FFC567]" />,
                title: "Earn Points",
                description: "Get loyalty tokens for meaningful interactions and engagement"
              },
              {
                icon: <Gift className="w-8 h-8 text-[#FB7DA8]" />,
                title: "Redeem Rewards",
                description: "Use tokens for exclusive content, merchandise, or direct tips"
              }
            ].map((step, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-2xl border hover:border-primary/20 transition-all"
              >
                <div className="mb-4 p-3 bg-primary/5 w-fit rounded-xl">
                  {step.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <Badge variant="outline" className="mb-4">Why SuperPage</Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Built for the Creator Economy
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Empowering creators and fans with Web3 technology
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Zap className="w-6 h-6 text-[#FD5A46]" />,
                title: "No Platform Cuts",
                description: "Keep 100% of your earnings with direct fan support"
              },
              {
                icon: <Shield className="w-6 h-6 text-[#00995E]" />,
                title: "On-Chain Rewards",
                description: "Transparent and secure blockchain-based loyalty system"
              },
              {
                icon: <TrendingUp className="w-6 h-6 text-[#058CD7]" />,
                title: "Growth Tools",
                description: "Analytics and insights to grow your community"
              }
            ].map((feature, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                viewport={{ once: true }}
                className="bg-white p-6 rounded-xl shadow-sm hover:shadow-md transition-all"
              >
                <div className="flex items-center gap-3 mb-4">
                  {feature.icon}
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                </div>
                <p className="text-muted-foreground">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-[#552CB7] to-[#058CD7] text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-6">
            Ready to Transform Your Creator Journey?
          </h2>
          <p className="text-xl text-white/80 mb-8 max-w-2xl mx-auto">
            Join thousands of creators already using SuperPage to build stronger communities
          </p>
          <Button
            size="lg"
            className="bg-[#FFC567] text-[#552CB7] hover:bg-[#FFC567]/90 hover-glow"
            asChild
          >
            <Link href="/register">
              Get Started Now
              <ArrowRight className="ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </div>
  );
}