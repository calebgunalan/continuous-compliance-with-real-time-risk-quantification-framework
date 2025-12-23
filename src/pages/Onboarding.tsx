import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { useAuth } from '@/hooks/useAuth';
import { useCreateOrganization } from '@/hooks/useOrganization';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { Shield, Building2, Users, ArrowRight, Loader2, Plus, UserPlus } from 'lucide-react';
import type { OrganizationSize } from '@/types/database';

const createOrgSchema = z.object({
  name: z.string().trim().min(2, { message: 'Organization name must be at least 2 characters' }).max(100),
  industry: z.string().trim().min(2, { message: 'Industry is required' }),
  size: z.enum(['small', 'medium', 'large', 'enterprise'] as const),
});

const joinOrgSchema = z.object({
  inviteCode: z.string().trim().min(6, { message: 'Invalid invite code' }).max(20),
});

const INDUSTRIES = [
  'Financial Services',
  'Healthcare',
  'Technology',
  'Manufacturing',
  'Retail',
  'Government',
  'Education',
  'Energy',
  'Telecommunications',
  'Other',
];

const SIZES: { value: OrganizationSize; label: string; description: string }[] = [
  { value: 'small', label: 'Small', description: '1-50 employees' },
  { value: 'medium', label: 'Medium', description: '51-500 employees' },
  { value: 'large', label: 'Large', description: '501-5000 employees' },
  { value: 'enterprise', label: 'Enterprise', description: '5000+ employees' },
];

const Onboarding = () => {
  const navigate = useNavigate();
  const { user, profile, signOut } = useAuth();
  const { toast } = useToast();
  const createOrganization = useCreateOrganization();
  
  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [selectedSize, setSelectedSize] = useState<OrganizationSize>('medium');
  const [selectedIndustry, setSelectedIndustry] = useState<string>('');

  const handleCreateOrganization = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      name: formData.get('orgName') as string,
      industry: selectedIndustry,
      size: selectedSize,
    };

    const validation = createOrgSchema.safeParse(data);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    try {
      // Create the organization
      const newOrg = await createOrganization.mutateAsync({
        name: data.name,
        industry: data.industry,
        size: data.size,
        current_maturity_level: 'level_1',
        baseline_risk_exposure: 0,
      });

      // Update the user's profile with the organization ID
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ organization_id: newOrg.id })
        .eq('id', user?.id);

      if (updateError) {
        throw updateError;
      }

      toast({
        title: 'Organization created!',
        description: `Welcome to ${data.name}. Let's get started with your compliance journey.`,
      });

      // Force page reload to update profile state
      window.location.href = '/';
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Failed to create organization';
      toast({
        variant: 'destructive',
        title: 'Error',
        description: errorMessage,
      });
    }
    
    setIsLoading(false);
  };

  const handleJoinOrganization = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setErrors({});
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data = {
      inviteCode: formData.get('inviteCode') as string,
    };

    const validation = joinOrgSchema.safeParse(data);
    if (!validation.success) {
      const fieldErrors: Record<string, string> = {};
      validation.error.errors.forEach((err) => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as string] = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsLoading(false);
      return;
    }

    // For now, show a message that invite codes are coming soon
    // In a real implementation, you would validate the invite code against a database
    toast({
      title: 'Coming Soon',
      description: 'Organization invite codes will be available in a future update. Please create a new organization for now.',
    });
    
    setIsLoading(false);
  };

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col items-center justify-center p-4">
      {/* Background glow effect */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[400px] rounded-full bg-primary/5 blur-3xl" />
      </div>

      {/* Logo and branding */}
      <div className="flex items-center gap-3 mb-8 animate-fade-in">
        <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary/15 border border-primary/30">
          <Shield className="h-6 w-6 text-primary" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-foreground">ComplianceIQ</h1>
          <p className="text-xs text-muted-foreground">Continuous Compliance & Risk Framework</p>
        </div>
      </div>

      {/* Welcome message */}
      <div className="text-center mb-6 animate-fade-in">
        <h2 className="text-2xl font-bold text-foreground">
          Welcome, {profile?.full_name || 'there'}!
        </h2>
        <p className="text-muted-foreground mt-1">
          Let's set up your organization to get started
        </p>
      </div>

      {/* Onboarding Card */}
      <Card className="w-full max-w-lg border-border/50 bg-card/80 backdrop-blur-sm animate-slide-up">
        <CardHeader className="text-center pb-2">
          <CardTitle className="text-xl font-bold flex items-center justify-center gap-2">
            <Building2 className="h-5 w-5" />
            Organization Setup
          </CardTitle>
          <CardDescription>
            Create a new organization or join an existing one
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="create" className="w-full">
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="create" className="gap-2">
                <Plus className="h-4 w-4" />
                Create New
              </TabsTrigger>
              <TabsTrigger value="join" className="gap-2">
                <UserPlus className="h-4 w-4" />
                Join Existing
              </TabsTrigger>
            </TabsList>

            {/* Create Organization Tab */}
            <TabsContent value="create">
              <form onSubmit={handleCreateOrganization} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="orgName">Organization Name</Label>
                  <div className="relative">
                    <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="orgName"
                      name="orgName"
                      type="text"
                      placeholder="Acme Corporation"
                      className="pl-10"
                      disabled={isLoading}
                    />
                  </div>
                  {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Industry</Label>
                  <Select value={selectedIndustry} onValueChange={setSelectedIndustry} disabled={isLoading}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your industry" />
                    </SelectTrigger>
                    <SelectContent>
                      {INDUSTRIES.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.industry && <p className="text-xs text-destructive">{errors.industry}</p>}
                </div>

                <div className="space-y-2">
                  <Label>Organization Size</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {SIZES.map((size) => (
                      <button
                        key={size.value}
                        type="button"
                        onClick={() => setSelectedSize(size.value)}
                        disabled={isLoading}
                        className={`flex flex-col items-start p-3 rounded-lg border transition-all text-left ${
                          selectedSize === size.value
                            ? 'border-primary bg-primary/10 text-foreground'
                            : 'border-border bg-muted/30 text-muted-foreground hover:border-border hover:bg-muted/50'
                        }`}
                      >
                        <span className="font-medium text-sm">{size.label}</span>
                        <span className="text-xs opacity-70">{size.description}</span>
                      </button>
                    ))}
                  </div>
                  {errors.size && <p className="text-xs text-destructive">{errors.size}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  Create Organization
                </Button>
              </form>
            </TabsContent>

            {/* Join Organization Tab */}
            <TabsContent value="join">
              <form onSubmit={handleJoinOrganization} className="space-y-4">
                <div className="rounded-lg border border-border/50 bg-muted/30 p-4">
                  <div className="flex items-start gap-3">
                    <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm font-medium text-foreground">Have an invite code?</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Enter the invite code provided by your organization administrator to join their compliance workspace.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="inviteCode">Invite Code</Label>
                  <Input
                    id="inviteCode"
                    name="inviteCode"
                    type="text"
                    placeholder="Enter your invite code"
                    disabled={isLoading}
                    className="text-center tracking-widest font-mono"
                  />
                  {errors.inviteCode && <p className="text-xs text-destructive">{errors.inviteCode}</p>}
                </div>

                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  ) : (
                    <ArrowRight className="h-4 w-4 mr-2" />
                  )}
                  Join Organization
                </Button>
              </form>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Footer */}
      <div className="mt-8 flex flex-col items-center gap-4 animate-fade-in">
        <p className="text-sm text-muted-foreground">
          Signed in as {user?.email}
        </p>
        <Button variant="ghost" size="sm" onClick={handleSignOut}>
          Sign out
        </Button>
      </div>
    </div>
  );
};

export default Onboarding;
