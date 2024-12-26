import { useState, useRef } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { MessageCircle, X, Bot, Globe, Clock, Sparkles, Check, ArrowUp, Instagram, Facebook, Twitter, Youtube, Linkedin, ArrowRight, Zap, Cpu, Shield, Palette, Upload } from 'lucide-react'
import { Dialog, DialogContent } from "@/components/ui/dialog"
import { Login } from './auth/Login'
import { cn } from '@/lib/utils'
import { motion } from 'framer-motion';
import { useInView } from 'framer-motion';

interface Message {
  role: 'user' | 'bot'
  content: string
}

function TikTokIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5" />
    </svg>
  );
}

export function LandingPage() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [showLogin, setShowLogin] = useState(false)
  const [showSignUp, setShowSignUp] = useState(false)

  const features = [
    {
      icon: Globe,
      title: 'Multi-Platform Support',
      description: 'Create content for LinkedIn, Twitter, and blog posts',
      gradient: 'bg-blue-500'
    },
    {
      icon: Cpu,
      title: 'Advanced AI',
      description: 'Powered by cutting-edge language models',
      gradient: 'bg-purple-500'
    },
    {
      icon: Clock,
      title: 'Instant Generation',
      description: 'Get high-quality content in seconds',
      gradient: 'bg-green-500'
    },
    {
      icon: Shield,
      title: 'Content Safety',
      description: 'AI-powered content filtering and verification',
      gradient: 'bg-red-500'
    },
    {
      icon: Palette,
      title: 'Smart Templates',
      description: 'Choose from various pre-built content templates',
      gradient: 'bg-orange-500'
    },
    {
      icon: Upload,
      title: 'Quick Export',
      description: 'Export to multiple formats instantly',
      gradient: 'bg-indigo-500'
    }
  ]

  const pricingTiers = [
    {
      name: 'Free',
      price: '0',
      description: 'Perfect for trying out our services',
      features: [
        '50 AI generations per month',
        'Basic templates',
        'Standard support',
        'Single platform posts'
      ],
    },
    {
      name: 'Pro',
      price: '29',
      description: 'Best for professionals and creators',
      features: [
        'Unlimited AI generations',
        'Advanced templates',
        'Priority support',
        'Multi-platform posts',
        'Custom branding',
        'Analytics dashboard'
      ],
      popular: true
    },
    {
      name: 'Enterprise',
      price: '99',
      description: 'For teams and businesses',
      features: [
        'Everything in Pro',
        'Team collaboration',
        'API access',
        'Custom AI training',
        'Dedicated account manager',
        'SSO & advanced security'
      ],
    },
  ]

  // Animation variants
  const fadeInUp = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const fadeInDown = {
    hidden: { opacity: 0, y: -20 },
    visible: { opacity: 1, y: 0 }
  };

  // Refs for scroll animations
  const heroRef = useRef(null);
  const featuresRef = useRef(null);
  const pricingRef = useRef(null);

  // Check if sections are in view, with once: false to allow repeated animations
  const isHeroInView = useInView(heroRef, { 
    once: false, 
    margin: "-100px",
    amount: 0.3 // Trigger when 30% of the element is visible
  });

  const isFeaturesInView = useInView(featuresRef, { 
    once: false, 
    margin: "-100px",
    amount: 0.3
  });

  const isPricingInView = useInView(pricingRef, { 
    once: false, 
    margin: "-100px",
    amount: 0.3
  });

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* Header */}
      <header className="bg-white/90 backdrop-blur-sm fixed w-full z-50 border-b border-gray-100">
        <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center space-x-2">
              <Bot className="h-6 w-6 text-purple-600" />
              <span className="text-xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 text-transparent bg-clip-text">
                Theosym
              </span>
            </div>
            
            <div className="flex items-center gap-8">
              <a href="#" className="text-gray-600 hover:text-purple-600">Dashboard</a>
              <a href="#" className="text-gray-600 hover:text-purple-600">History</a>
              <Button variant="outline" onClick={() => setShowLogin(true)}>Log in</Button>
              <Button 
                className="bg-purple-600 hover:bg-purple-700"
                onClick={() => {
                  setShowLogin(true)
                  setShowSignUp(true)
                }}
              >
                Sign up
              </Button>
            </div>
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <motion.main 
        ref={heroRef}
        initial="hidden"
        animate={isHeroInView ? "visible" : "hidden"}
        variants={fadeInDown}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="relative bg-gradient-to-br from-purple-600 to-indigo-600 pt-24 pb-16"
      >
        <div className="absolute inset-0 bg-grid-white/[0.2] bg-grid-8" />
        <div className="absolute inset-0 bg-gradient-to-t from-purple-600/50" />
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Badge className="inline-flex items-center space-x-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-8">
            <Sparkles className="h-4 w-4 text-purple-200" />
            <span className="text-sm font-medium text-white">AI-Powered Content Generation</span>
          </Badge>

          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold text-white tracking-tight mb-6">
            Transform Your Content
            <span className="block text-transparent bg-clip-text bg-gradient-to-r from-yellow-200 to-pink-200">
              With AI Magic
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-lg sm:text-xl text-purple-100 mb-8">
            Generate engaging content for multiple platforms in seconds. Powered by advanced AI to create compelling posts tailored to your audience.
          </p>

          <div className="flex justify-center space-x-4">
            <Button 
              size="lg"
              className="group px-8 py-3 bg-white text-purple-600 rounded-lg hover:bg-purple-50 font-medium transition-all duration-200 transform hover:scale-105"
              onClick={() => {
                setShowLogin(true)
                setShowSignUp(true)
              }}
            >
              <Zap className="mr-2 h-5 w-5" />
              Get Started Free
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="px-8 py-3 bg-purple-700/50 text-white rounded-lg border border-purple-400/30 hover:bg-purple-700/60 font-medium backdrop-blur-sm transition-all duration-200"
            >
              View Examples
            </Button>
          </div>
        </div>
        
        {/* Animated background blobs */}
        <div className="absolute top-0 left-1/4 w-72 h-72 bg-purple-400 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob" />
        <div className="absolute top-0 right-1/4 w-72 h-72 bg-yellow-200 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-2000" />
        <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-2xl opacity-70 animate-blob animation-delay-4000" />
      </motion.main>

      {/* Features Section */}
      <motion.section
        ref={featuresRef}
        initial="hidden"
        animate={isFeaturesInView ? "visible" : "hidden"}
        variants={fadeInUp}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="py-24 bg-gray-50"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-extrabold text-gray-900 sm:text-4xl">
              Supercharge Your Content Creation
            </h2>
            <p className="mt-4 text-xl text-gray-600">
              Everything you need to create amazing content at scale
            </p>
          </div>
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((feature) => (
              <div 
                key={feature.title} 
                className="relative group p-8 bg-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1"
              >
                <div className={`w-14 h-14 ${feature.gradient} rounded-xl flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300`}>
                  <feature.icon className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Pricing Section */}
      <motion.section
        ref={pricingRef}
        initial="hidden"
        animate={isPricingInView ? "visible" : "hidden"}
        variants={fadeInUp}
        transition={{ duration: 0.5, ease: "easeOut" }}
        className="py-24"
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {pricingTiers.map((tier) => (
              <Card 
                key={tier.name}
                className={cn(
                  "relative p-8 border rounded-xl overflow-hidden transition-all duration-200",
                  tier.popular ? "border-purple-200 shadow-xl scale-105" : "border-gray-200 hover:border-purple-200"
                )}
              >
                {tier.popular && (
                  <Badge 
                    className="absolute top-4 right-4 bg-purple-100 text-purple-700 hover:bg-purple-100"
                  >
                    Most Popular
                  </Badge>
                )}
                <div className="space-y-6">
                  <h3 className="text-2xl font-bold text-gray-900">{tier.name}</h3>
                  <div className="flex items-baseline">
                    <span className="text-4xl font-bold text-gray-900">${tier.price}</span>
                    <span className="ml-2 text-gray-500">/month</span>
                  </div>
                  <p className="text-gray-500">{tier.description}</p>
                  <Button 
                    className={cn(
                      "w-full",
                      tier.popular ? "bg-purple-600 hover:bg-purple-700" : "bg-gray-900 hover:bg-gray-800"
                    )}
                    onClick={() => {
                      setShowLogin(true)
                      setShowSignUp(true)
                    }}
                  >
                    Get Started
                  </Button>
                  <ul className="space-y-4 mt-8">
                    {tier.features.map((feature) => (
                      <li key={feature} className="flex items-center gap-3 text-gray-600">
                        <Check className="h-5 w-5 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </Card>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Chatbot UI */}
      {!isOpen ? (
        <Button
          className="fixed bottom-4 right-4 rounded-full p-4 bg-purple-600 hover:bg-purple-700 shadow-lg"
          onClick={() => setIsOpen(true)}
        >
          <MessageCircle className="h-6 w-6 text-white" />
        </Button>
      ) : (
        <Card className="fixed bottom-4 right-4 w-80 h-[500px] flex flex-col shadow-xl rounded-2xl border border-gray-200 z-50">
          <div className="flex items-center justify-between p-4 border-b bg-white rounded-t-2xl">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5 text-purple-600" />
              <h3 className="font-medium">AI Assistant</h3>
            </div>
            <Button 
              variant="ghost" 
              size="icon"
              className="h-6 w-6 rounded-full p-0 bg-white hover:bg-white"
              onClick={() => setIsOpen(false)}
            >
              <X className="h-5 w-5 text-black hover:text-gray-600 transition-colors" />
              <span className="sr-only">Close</span>
            </Button>
          </div>

          <div className="flex-grow overflow-y-auto p-4 space-y-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-4">
                <MessageCircle className="h-8 w-8 mx-auto mb-2 text-purple-200" />
                <p className="text-sm">Hi! How can I help you today?</p>
              </div>
            ) : (
              messages.map((message, index) => (
                <div 
                  key={index} 
                  className={cn(
                    "flex",
                    message.role === 'user' ? "justify-end" : "justify-start"
                  )}
                >
                  <div className={cn(
                    "max-w-[80%] rounded-2xl px-4 py-2",
                    message.role === 'user' 
                      ? "bg-purple-600 text-white rounded-br-none"
                      : "bg-gray-100 text-gray-900 rounded-bl-none"
                  )}>
                    {message.content}
                  </div>
                </div>
              ))
            )}
          </div>

          <form 
            onSubmit={(e) => {
              e.preventDefault()
              if (input.trim()) {
                setMessages([...messages, { role: 'user', content: input }])
                // Add your bot response logic here
                setTimeout(() => {
                  setMessages(prev => [...prev, { 
                    role: 'bot', 
                    content: "Thanks for your message! I'm here to help." 
                  }])
                }, 1000)
                setInput('')
              }
            }} 
            className="p-4 border-t bg-white rounded-b-2xl"
          >
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your message..."
                className="flex-grow rounded-full border-gray-200 focus:border-purple-500 focus:ring-purple-500"
              />
              <Button 
                type="submit" 
                size="icon"
                className="rounded-full bg-purple-600 hover:bg-purple-700"
              >
                <ArrowRight className="h-4 w-4" />
                <span className="sr-only">Send message</span>
              </Button>
            </div>
          </form>
        </Card>
      )}

      {/* Login Dialog */}
      <Dialog open={showLogin} onOpenChange={setShowLogin}>
        <DialogContent className="sm:max-w-md">
          <Login 
            showSignUp={showSignUp} 
            setShowSignUp={setShowSignUp} 
            setShowLogin={setShowLogin}
          />
        </DialogContent>
      </Dialog>

      {/* Footer */}
      <footer className="border-t">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 flex items-center justify-between">
          <p className="text-sm text-gray-500">
            © 2023 Theosym, Inc. All rights reserved.
          </p>
          
          {/* Middle section */}
          <div className="flex items-center gap-4">
            <a 
              href="https://theosym.com/contact-us"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Contact Us
            </a>
            <span className="text-gray-300">|</span>
            <a 
              href="https://theosym.com/blog"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Blog
            </a>
            <span className="text-gray-300">|</span>
            <a 
              href="https://theosym.com/privacy-policy"
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-gray-500 hover:text-gray-900 transition-colors"
            >
              Privacy Policy
            </a>
          </div>

          {/* Social media icons */}
          <div className="flex items-center gap-4">
            <a 
              href="https://www.instagram.com/theosymai/"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-pink-600 transition-colors"
              aria-label="Follow us on Instagram"
            >
              <Instagram className="h-5 w-5" />
            </a>
            <a 
              href="https://www.facebook.com/TheoSym"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-600 transition-colors"
              aria-label="Follow us on Facebook"
            >
              <Facebook className="h-5 w-5" />
            </a>
            <a 
              href="https://twitter.com/theosymai"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-sky-500 transition-colors"
              aria-label="Follow us on Twitter"
            >
              <Twitter className="h-5 w-5" />
            </a>
            <a 
              href="https://www.tiktok.com/@gsammane77"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-black transition-colors"
              aria-label="Follow us on TikTok"
            >
              <TikTokIcon className="h-5 w-5" />
            </a>
            <a 
              href="https://www.linkedin.com/company/theosym/posts/?feedView=all"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-blue-700 transition-colors"
              aria-label="Follow us on LinkedIn"
            >
              <Linkedin className="h-5 w-5" />
            </a>
            <a 
              href="https://www.youtube.com/@TheoSym"
              target="_blank"
              rel="noopener noreferrer"
              className="hover:text-red-600 transition-colors"
              aria-label="Subscribe to our YouTube channel"
            >
              <Youtube className="h-5 w-5" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
} 