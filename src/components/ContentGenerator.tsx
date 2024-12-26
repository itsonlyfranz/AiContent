import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Bot, Linkedin, Twitter, BookText, RefreshCw, Loader2, Download, LogOut, Sparkles, Check, Copy } from "lucide-react";
import { cn } from '@/lib/utils';
import { ParametersForm, type FormParameters } from './ParametersForm';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';
import { CampaignService, type CampaignContent } from '@/lib/campaign-service';
import { AIService } from '@/lib/ai-service';
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { User, Lock } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { User as SupabaseUser } from '@supabase/supabase-js';
import { Badge } from "@/components/ui/badge";
import { SubscriptionService, type Plan, type Profile } from '@/lib/subscription-service';
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";

type Platform = 'linkedin' | 'twitter' | 'blog';

export function ContentGenerator() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [activePlatform, setActivePlatform] = useState<Platform>('linkedin');
  const { toast } = useToast();
  const [parameters, setParameters] = useState<FormParameters>({
    tone: '',
    length: '',
    campaign: '',
    targetAudience: ''
  });
  const campaignService = new CampaignService();
  const aiService = new AIService();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [showProfile, setShowProfile] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [showPresets, setShowPresets] = useState(false);
  const [remainingGenerations, setRemainingGenerations] = useState<number | null>(null);
  const subscriptionService = new SubscriptionService();
  const [isLoadingSubscription, setIsLoadingSubscription] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [currentPlan, setCurrentPlan] = useState<Plan | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [showProfileDialog, setShowProfileDialog] = useState(false);
  const [showPlanDialog, setShowPlanDialog] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<string | null>(null);
  const [isUpdatingPlan, setIsUpdatingPlan] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      console.log('Auth session:', session);
      console.log('Auth error:', error);
      if (!session) {
        toast({
          variant: "destructive",
          title: "Not Authenticated",
          description: "Please log in to generate content.",
        });
      }
    };
    
    checkAuth();
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    
    fetchUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    async function fetchRemainingGenerations() {
      if (user) {
        setIsLoadingSubscription(true);
        try {
          const remaining = await subscriptionService.getRemainingGenerations(user.id);
          setRemainingGenerations(remaining);
        } catch (error) {
          console.error('Error fetching generations:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch subscription data.",
          });
        } finally {
          setIsLoadingSubscription(false);
        }
      }
    }
    fetchRemainingGenerations();
  }, [user]);

  useEffect(() => {
    async function fetchUserData() {
      if (user) {
        setIsLoadingProfile(true);
        try {
          const [subscription, userProfile] = await Promise.all([
            subscriptionService.getUserSubscription(user.id),
            subscriptionService.getUserProfile(user.id)
          ]);
          
          if (subscription?.plan) {
            setCurrentPlan(subscription.plan);
          }
          if (userProfile) {
            setProfile(userProfile);
          }
        } catch (error) {
          console.error('Error fetching user data:', error);
          toast({
            variant: "destructive",
            title: "Error",
            description: "Failed to fetch user data.",
          });
        } finally {
          setIsLoadingProfile(false);
        }
      }
    }
    fetchUserData();
  }, [user]);

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to sign out. Please try again.",
      });
    }
  };

  const handleGenerate = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      toast({
        variant: "destructive",
        title: "Not Authenticated",
        description: "Please log in to generate content.",
      });
      return;
    }

    // Check remaining generations before proceeding
    const remaining = await subscriptionService.getRemainingGenerations(session.user.id);
    if (remaining !== null && remaining <= 0) {
      toast({
        variant: "destructive",
        title: "Generation Limit Reached",
        description: "Please upgrade your plan to continue generating content.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      // Generate the content
      const result = await aiService.generateContent(
        input,
        {
          tone: parameters.tone,
          length: parameters.length,
          campaign: parameters.campaign,
          targetAudience: parameters.targetAudience
        },
        activePlatform
      );
      
      if (result) {
        setOutput(result);

        // Increment the generation count
        await subscriptionService.incrementGenerationCount(session.user.id);
        
        // Refresh the remaining generations count
        const newRemaining = await subscriptionService.getRemainingGenerations(session.user.id);
        setRemainingGenerations(newRemaining);

        // Save to campaign history if needed
        if (parameters.campaign) {
          await campaignService.saveCampaign({
            name: parameters.campaign,
            content: result,
            platform: activePlatform,
            userId: session.user.id
          });
        }
      }
    } catch (error) {
      console.error('Generation error:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to generate content. Please try again.",
      });
    } finally {
    setIsGenerating(false);
    }
  };

  const handleClear = () => {
    setInput('');
    setOutput('');
    setParameters({ tone: '', length: '', campaign: '', targetAudience: '' });
  };

  const handleDownload = () => {
    console.log('Downloading output as spreadsheet...');
  };

  const platformConfig = {
    linkedin: {
      icon: Linkedin,
      title: 'LinkedIn',
      placeholder: 'Enter topics for your LinkedIn post...',
      color: 'bg-[#0077B5] hover:bg-[#006399]',
      bgColor: 'bg-blue-50 dark:bg-blue-950/30'
    },
    twitter: {
      icon: Twitter,
      title: 'Twitter',
      placeholder: 'Enter topics for your tweet...',
      color: 'bg-[#1DA1F2] hover:bg-[#0d8bd9]',
      bgColor: 'bg-sky-50 dark:bg-sky-950/30'
    },
    blog: {
      icon: BookText,
      title: 'Blog Post',
      placeholder: 'Enter topics for your blog post...',
      color: 'bg-[#6366F1] hover:bg-[#4F46E5]',
      bgColor: 'bg-indigo-50 dark:bg-indigo-950/30'
    }
  };

  const validatePassword = (password: string) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (password.length < minLength) {
      return "Password must be at least 8 characters long";
    }
    if (!hasUpperCase || !hasLowerCase) {
      return "Password must contain both uppercase and lowercase letters";
    }
    if (!hasNumbers) {
      return "Password must contain at least one number";
    }
    if (!hasSpecialChar) {
      return "Password must contain at least one special character";
    }
    return null;
  };

  const handleChangePassword = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    
    if (!user) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No user found. Please try logging in again.",
      });
      return;
    }

    setIsChangingPassword(true);
    
    try {
      const formData = new FormData(e.currentTarget);
      const currentPassword = formData.get('current') as string;
      const newPassword = formData.get('new') as string;
      const confirm = formData.get('confirm') as string;

      // Validate all fields are filled
      if (!currentPassword || !newPassword || !confirm) {
        throw new Error("All fields are required");
      }

      // Check password match
      if (newPassword !== confirm) {
        throw new Error("New passwords do not match");
      }

      // Validate password strength
      const passwordError = validatePassword(newPassword);
      if (passwordError) {
        throw new Error(passwordError);
      }

      if (!user.email) {
        throw new Error("User email not found");
      }

      // Verify current password
      const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
        email: user.email,
        password: currentPassword,
      });

      if (signInError) {
        throw new Error("Current password is incorrect");
      }

      // Update password
      const { data, error: updateError } = await supabase.auth.updateUser({
        password: newPassword
      });

      if (updateError) {
        throw new Error(updateError.message);
      }

      if (!data.user) {
        throw new Error("Failed to update password");
      }

      toast({
        title: "Success",
        description: "Password updated successfully",
      });
      setShowChangePassword(false);
      
      // Clear the form
      e.currentTarget.reset();

    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error instanceof Error ? error.message : "An unexpected error occurred",
      });
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleProfileClick = () => {
    setShowProfileDialog(true);
  };

  const handlePlanChange = async () => {
    if (!selectedPlan || !user) return;
    
    setIsUpdatingPlan(true);
    try {
      console.log('Attempting plan update:', { userId: user.id, newPlan: selectedPlan });

      // Call the RPC function to upgrade the plan
      const { data: rpcResult, error: rpcError } = await supabase.rpc('upgrade_user_plan', {
        user_id_input: user.id, // This is already a UUID from Supabase auth
        plan_name_input: selectedPlan
      });

      console.log('RPC result:', rpcResult, 'RPC error:', rpcError);

      if (rpcError) throw rpcError;

      // Fetch fresh subscription data
      const { data: freshSubscription, error: subscriptionError } = await supabase
        .from('user_subscriptions')
        .select(`
          *,
          plan:plans(
            id,
            name,
            max_generations,
            price
          )
        `)
        .eq('user_id', user.id)
        .single();

      if (subscriptionError) throw subscriptionError;

      // Update local state with fresh data
      if (freshSubscription?.plan) {
        setCurrentPlan(freshSubscription.plan);
        const newRemaining = freshSubscription.plan.max_generations === null ? 
          null : 
          Math.max(0, freshSubscription.plan.max_generations - freshSubscription.generations_used);
        setRemainingGenerations(newRemaining);
      }

      toast({
        title: "Success",
        description: `Successfully switched to ${selectedPlan} plan.`,
      });
      setShowPlanDialog(false);
    } catch (error) {
      console.error('Detailed error in plan update:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to update plan. Please try again.",
      });
    } finally {
      setIsUpdatingPlan(false);
    }
  };

  const UserInfo = () => (
    <div className="flex items-center gap-4 p-4">
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" className="relative h-8 w-8 rounded-full">
            <Avatar className="h-8 w-8">
              <AvatarFallback>
                {profile?.full_name?.[0] ?? user?.email?.[0]?.toUpperCase()}
              </AvatarFallback>
            </Avatar>
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56" align="end">
          <DropdownMenuLabel className="font-normal">
            <div className="flex flex-col space-y-1">
              <p className="text-sm font-medium leading-none">
                {profile?.full_name || 'User'}
              </p>
              <p className="text-xs leading-none text-muted-foreground">
                {user?.email}
              </p>
            </div>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleProfileClick}>
            <User className="mr-2 h-4 w-4" />
            <span>Profile</span>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Sparkles className="mr-2 h-4 w-4" />
            <span>Plan: {currentPlan?.name || 'Free'}</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={handleLogout}>
            <LogOut className="mr-2 h-4 w-4" />
            <span>Log out</span>
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );

  return (
    <div className="min-h-screen w-full flex flex-col relative">
      <div className="fixed inset-0 z-0 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-50/90 via-white to-blue-50/90 dark:from-gray-900 dark:via-gray-900/95 dark:to-purple-900/90" />
        
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-gradient-to-br from-purple-200/20 to-blue-200/20 dark:from-purple-500/10 dark:to-blue-500/10 rounded-full blur-3xl animate-float" />
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-gradient-to-br from-blue-200/20 to-purple-200/20 dark:from-blue-500/10 dark:to-purple-500/10 rounded-full blur-3xl animate-float-delayed" />
        
        <div className="absolute inset-0 opacity-[0.015] dark:opacity-[0.03]"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%239C92AC' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />

        <div className="absolute inset-0 bg-[linear-gradient(to_right,#8882_1px,transparent_1px),linear-gradient(to_bottom,#8882_1px,transparent_1px)] bg-[size:14px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000,transparent)]" />
      </div>

      <header className="relative z-10 w-full border-b bg-white/60 dark:bg-gray-900/60 backdrop-blur-md sticky top-0">
        <div className="max-w-[1400px] mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="p-2 bg-gradient-to-br from-purple-500 to-blue-500 rounded-xl shadow-lg">
              <Bot className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
              AI Content Generator
            </h1>
          </div>
          
          <UserInfo />
        </div>
      </header>

      <main className="relative z-10 flex-1 w-full max-w-[1800px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_1fr_1fr] gap-8">
          <div className="space-y-6">
            <Card className="border-none shadow-lg bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm">
              <CardHeader className="border-b">
                <CardTitle>Content Input</CardTitle>
        </CardHeader>
              <CardContent className="p-6">
                <Tabs defaultValue="linkedin" value={activePlatform} onValueChange={(value) => setActivePlatform(value as Platform)}>
                  <TabsList className="flex p-1 space-x-2 bg-transparent">
                    {Object.entries(platformConfig).map(([key, { icon: Icon, title, color, bgColor }]) => (
                <TabsTrigger
                  key={key}
                  value={key}
                        className={cn(
                          "flex-1 flex items-center justify-center gap-2 px-4 py-2.5",
                          "rounded-lg transition-all duration-200",
                          "data-[state=inactive]:bg-transparent",
                          "data-[state=inactive]:hover:bg-gray-100 dark:data-[state=inactive]:hover:bg-gray-800",
                          "data-[state=active]:text-white",
                          `data-[state=active]:${color}`,
                          "data-[state=active]:shadow-sm"
                        )}
                >
                  <Icon className="w-4 h-4" />
                  <span>{title}</span>
                </TabsTrigger>
              ))}
            </TabsList>

                  <div className="mt-6">
                  <Textarea
                      placeholder={platformConfig[activePlatform].placeholder}
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                      className={cn(
                        "min-h-[200px] resize-none rounded-lg",
                        "border border-gray-200 dark:border-gray-800",
                        "bg-white dark:bg-gray-900",
                        "focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-blue-400",
                        "transition-all duration-200"
                      )}
                    />

                    <div className="mt-4 flex justify-end">
                    <Button
                      onClick={handleGenerate}
                        disabled={isGenerating || !input}
                        className={cn(
                          "relative overflow-hidden",
                          platformConfig[activePlatform].color,
                          "text-white font-medium",
                          "shadow-sm",
                          "transition-all duration-200"
                        )}
                    >
                      {isGenerating ? (
                        <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                          <>
                            <Sparkles className="w-4 h-4 mr-2" />
                            Generate Content
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-2 shadow-xl bg-white/80 backdrop-blur-xl hover:shadow-purple-100/50 transition-all duration-300">
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle>Content Parameters</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                <ParametersForm
                  parameters={parameters}
                  onChange={setParameters}
                />
              </CardContent>
            </Card>
          </div>

          <div className="space-y-6">
            <Card className="border-2 shadow-xl bg-white/80 backdrop-blur-xl hover:shadow-purple-100/50 transition-all duration-300">
              <CardHeader className="border-b bg-gradient-to-r from-purple-50 to-blue-50">
                <CardTitle>Generated Content</CardTitle>
              </CardHeader>
              <CardContent className="p-6">
                {output ? (
                  <div className="prose prose-purple dark:prose-invert max-w-none">
                    {output}
                  </div>
                ) : (
                  <div className="text-muted-foreground text-center py-8">
                    Generated content will appear here...
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-2xl">
              <User className="h-6 w-6 text-purple-500" />
              Profile Settings
            </DialogTitle>
            <DialogDescription className="text-gray-500">
              Manage your account settings and preferences
            </DialogDescription>
          </DialogHeader>

          <div className="mt-6 space-y-6">
            {/* Profile Info Section */}
            <div className="flex items-center space-x-4 p-4 bg-purple-50 rounded-lg">
              <Avatar className="h-16 w-16 border-2 border-purple-200">
                <AvatarImage src={user?.user_metadata?.avatar_url} />
                <AvatarFallback className="bg-purple-100 text-purple-700 text-xl">
                  {user?.email?.[0].toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h3 className="font-medium text-lg text-gray-900">
                  {user?.user_metadata?.full_name || 'User'}
                </h3>
                <p className="text-sm text-gray-500">{user?.email}</p>
                <Badge variant="outline" className="mt-2 bg-white">
                  {isLoadingProfile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    currentPlan?.name || 'Free'
                  )} Plan
                </Badge>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-2 gap-4">
              <Button
                variant="outline"
                className="flex items-center justify-center space-x-2 h-auto py-4 hover:bg-purple-50 hover:text-purple-600 hover:border-purple-200 transition-all"
                onClick={() => setShowChangePassword(true)}
              >
                <Lock className="h-4 w-4" />
                <span>Change Password</span>
                    </Button>
                    <Button
                      variant="outline"
                className="flex items-center justify-center space-x-2 h-auto py-4 hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-all"
                onClick={handleLogout}
                    >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
                    </Button>
                  </div>

            {/* Account Stats */}
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-center p-3 bg-white rounded-md shadow-sm">
                <h4 className="text-2xl font-semibold text-purple-600">
                  {isLoadingSubscription ? (
                    <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                  ) : (
                    remainingGenerations === null ? 
                      '∞' : 
                      `${remainingGenerations}/${currentPlan?.max_generations || 0}`
                  )}
                </h4>
                <p className="text-sm text-gray-500">Generations Left</p>
              </div>
              <div className="text-center p-3 bg-white rounded-md shadow-sm">
                <h4 className="text-2xl font-semibold text-green-600">12</h4>
                <p className="text-sm text-gray-500">Campaigns</p>
              </div>
            </div>

            {/* Subscription Info */}
            <div className="p-4 border border-purple-100 rounded-lg bg-white">
              <div className="flex justify-between items-center mb-2">
                <h3 className="font-medium text-gray-900">Current Plan</h3>
                <Badge variant="secondary" className="bg-purple-100 text-purple-700">
                  {isLoadingProfile ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    currentPlan?.name || 'Free'
                  )}
                </Badge>
              </div>
              <p className="text-sm text-gray-500 mb-4">
                {currentPlan?.name === 'Free' 
                  ? 'Upgrade to Pro for unlimited generations and advanced features'
                  : `You're on the ${currentPlan?.name} plan`
                }
              </p>
              {currentPlan?.name === 'Free' && (
                <Button 
                  className="w-full bg-purple-600 hover:bg-purple-700"
                  onClick={() => {
                    setSelectedPlan('Pro');
                    setShowPlanDialog(true);
                  }}
                >
                  Upgrade to Pro
                        </Button>
                      )}
            </div>

            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarFallback>
                      {profile?.full_name?.[0] ?? user?.email?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end">
                <DropdownMenuLabel className="font-normal">
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {profile?.full_name || 'User'}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user?.email}
                    </p>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleProfileClick}>
                  <User className="mr-2 h-4 w-4" />
                  <span>Profile</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Sparkles className="mr-2 h-4 w-4" />
                  <span>Plan: {currentPlan?.name || 'Free'}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </DialogContent>
      </Dialog>

      <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="h-5 w-5 text-purple-500" />
              Change Password
            </DialogTitle>
            <DialogDescription>
              Enter your new password below
            </DialogDescription>
          </DialogHeader>

          <form onSubmit={handleChangePassword} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                name="new-password"
                type="password"
                required
                className="h-10"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm Password</Label>
              <Input
                id="confirm-password"
                name="confirm-password"
                type="password"
                required
                className="h-10"
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowChangePassword(false)}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isChangingPassword}>
                {isChangingPassword ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  'Save Changes'
                )}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={showProfileDialog} onOpenChange={setShowProfileDialog}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Profile</DialogTitle>
            <DialogDescription>
              View and update your profile information.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="flex items-center gap-4">
              <Avatar className="h-16 w-16">
                <AvatarFallback>
                  {profile?.full_name?.[0] ?? user?.email?.[0]?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <div>
                <h3 className="font-medium">{profile?.full_name || 'User'}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Current Plan</Label>
              <div className="flex items-center justify-between bg-secondary p-3 rounded-lg">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium">{currentPlan?.name || 'Free'}</span>
                  <Badge variant="secondary">
                    {isLoadingSubscription ? (
                      <Loader2 className="h-4 w-4 animate-spin" />
                    ) : (
                      remainingGenerations === null ? 
                        'Unlimited' : 
                        `${remainingGenerations}/${currentPlan?.max_generations || 0} generations`
                    )}
                  </Badge>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    setSelectedPlan(currentPlan?.name || 'Free');
                    setShowPlanDialog(true);
                  }}
                >
                  Change Plan
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Account Created</Label>
              <div className="text-sm text-muted-foreground">
                {new Date(user?.created_at || '').toLocaleDateString()}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowProfileDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={showPlanDialog} onOpenChange={setShowPlanDialog}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Change Plan</DialogTitle>
            <DialogDescription>
              Select a plan that best suits your needs
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <RadioGroup
              value={selectedPlan || currentPlan?.name || 'Free'}
              onValueChange={setSelectedPlan}
              className="grid grid-cols-1 md:grid-cols-3 gap-4"
            >
              <div className={cn(
                "relative rounded-lg border p-4 cursor-pointer",
                selectedPlan === 'Free' ? "border-purple-600" : "border-gray-200"
              )}>
                <RadioGroupItem value="Free" className="absolute right-4 top-4" />
                <div className="mb-4">
                  <h3 className="font-medium">Free</h3>
                  <p className="text-sm text-gray-500">Basic features</p>
                </div>
                <div className="text-2xl font-bold mb-2">$0</div>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    50 generations/month
                  </li>
                </ul>
              </div>

              <div className={cn(
                "relative rounded-lg border p-4 cursor-pointer",
                selectedPlan === 'Pro' ? "border-purple-600" : "border-gray-200"
              )}>
                <RadioGroupItem value="Pro" className="absolute right-4 top-4" />
                <div className="mb-4">
                  <h3 className="font-medium">Pro</h3>
                  <p className="text-sm text-gray-500">For power users</p>
                </div>
                <div className="text-2xl font-bold mb-2">$29.99</div>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    200 generations/month
                  </li>
                </ul>
                      </div>

              <div className={cn(
                "relative rounded-lg border p-4 cursor-pointer",
                selectedPlan === 'Enterprise' ? "border-purple-600" : "border-gray-200"
              )}>
                <RadioGroupItem value="Enterprise" className="absolute right-4 top-4" />
                <div className="mb-4">
                  <h3 className="font-medium">Enterprise</h3>
                  <p className="text-sm text-gray-500">For teams</p>
                </div>
                <div className="text-2xl font-bold mb-2">$99.99</div>
                <ul className="text-sm space-y-2">
                  <li className="flex items-center">
                    <Check className="h-4 w-4 mr-2 text-green-500" />
                    Unlimited generations
                  </li>
                </ul>
              </div>
            </RadioGroup>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setShowPlanDialog(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handlePlanChange}
              disabled={isUpdatingPlan || !selectedPlan || selectedPlan === currentPlan?.name}
            >
              {isUpdatingPlan ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                'Confirm Change'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}