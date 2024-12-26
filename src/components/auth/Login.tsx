import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { signInWithGoogle } from '@/lib/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowRight, Sparkles, Target, Zap, Loader2, Bot } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface LoginProps {
  showSignUp: boolean
  setShowSignUp: (show: boolean) => void
  setShowLogin: (show: boolean) => void
}

export function Login({ showSignUp, setShowSignUp, setShowLogin }: LoginProps) {
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();

  const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      setLoading(false);
    } else {
      setShowLogin(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    
    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        },
      },
    });

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      setLoading(false);
    } else {
      toast({
        title: "Success",
        description: "Check your email to confirm your account",
      });
      setShowLogin(false);
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await signInWithGoogle();
    
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
      setLoading(false);
    } else {
      setShowLogin(false);
    }
  };

  const loginForm = (
    <div className="w-full max-w-md mx-auto">
      <Card className="w-full">
        <CardContent className="pt-6">
          <div className="flex flex-col items-center mb-6">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg mb-4">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900">
              {showSignUp ? 'Create your account' : 'Welcome back'}
            </h2>
            <p className="text-gray-600 mt-1">
              {showSignUp 
                ? 'Start your journey with Theosym' 
                : 'Sign in to continue to Theosym'}
            </p>
          </div>

          <form onSubmit={showSignUp ? handleSignUp : handleLogin} className="space-y-4">
            {showSignUp && (
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  type="text"
                  placeholder="John Doe"
                  required
                  className="h-12 text-base"
                />
              </div>
            )}

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                placeholder="name@example.com"
                required
                className="h-12 text-base"
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                {!showSignUp && (
                  <a
                    href="#"
                    className="text-sm text-purple-600 hover:text-purple-800 font-medium"
                    onClick={(e) => {
                      e.preventDefault();
                      // Add forgot password handler
                    }}
                  >
                    Forgot password?
                  </a>
                )}
              </div>
              <Input
                id="password"
                name="password"
                type="password"
                placeholder="••••••••"
                required
                className="h-12 text-base"
              />
            </div>

            <Button 
              type="submit"
              className="w-full h-12 bg-purple-600 hover:bg-purple-700 text-white text-base font-medium"
              disabled={loading}
            >
              {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
              ) : (
                showSignUp ? 'Create Account' : 'Sign In'
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              {showSignUp ? 'Already have an account?' : "Don't have an account?"}{' '}
              <a
                href="#"
                className="text-purple-600 hover:text-purple-800 font-medium"
                onClick={(e) => {
                  e.preventDefault();
                  setShowSignUp(!showSignUp);
                }}
              >
                {showSignUp ? 'Sign In' : 'Create Account'}
              </a>
            </p>
          </div>

          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-gray-500">Or continue with</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-12 font-medium border-gray-200"
            onClick={signInWithGoogle}
            disabled={loading}
          >
            <img 
              src="https://www.google.com/favicon.ico" 
              alt="Google" 
              className="w-5 h-5 mr-2"
            />
            {showSignUp ? 'Sign up with Google' : 'Sign in with Google'}
          </Button>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="w-full">
      {loginForm}
    </div>
  );
}