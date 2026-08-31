import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useTenantStore } from '../../stores/tenantStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '../../components/ui/card';
import { Lock, Mail, Shield, AlertCircle, ArrowRight, CheckCircle2 } from 'lucide-react';

export function LoginPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const login = useAuthStore((s) => s.login);
  const tenant = useTenantStore((s) => s.tenant);

  const [email, setEmail] = useState('elena.vance@apexops.io');
  const [password, setPassword] = useState('password123');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const from = (location.state as any)?.from?.pathname || '/dashboard';

  const demoAccounts = [
    {
      role: 'Owner' as const,
      name: 'Elena Vance',
      title: 'Business Owner & Founder',
      email: 'elena.vance@apexops.io',
      password: 'password123',
      department: 'Executive Suite',
      badge: 'Full Business Authority',
      description: 'Full access to White-Label branding, domain settings, team management & deployment authority.',
      avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
    },
    {
      role: 'Admin' as const,
      name: 'Marcus Thorne',
      title: 'Operations Administrator',
      email: 'marcus.t@apexops.io',
      password: 'password123',
      department: 'Operations & Systems',
      badge: 'Systems, Access & Deploys',
      description: 'Manages team invitations, monitors server health telemetry, assigns issues & triggers deployments.',
      avatarUrl: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
    },
    {
      role: 'Manager' as const,
      name: 'Sofia Lin',
      title: 'Store & Catalog Manager',
      email: 'sofia.lin@apexops.io',
      password: 'password123',
      department: 'Store & Fulfillment',
      badge: 'Store Operations & Support',
      description: 'Creates and tracks store operational issues, submits urgent support requests & monitors live traffic.',
      avatarUrl: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80',
    },
  ];

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const res = await login({ email, password });
      if (res.requiresMfa) {
        navigate('/mfa', { state: { email, from } });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err: any) {
      setError(err.message || 'Invalid email or password credentials');
    } finally {
      setLoading(false);
    }
  };

  const handleQuickFill = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword('password123');
    setError(null);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-100/70 p-4 sm:p-6 lg:p-8">
      {/* Brand Header */}
      <div className="mb-6 flex flex-col items-center text-center">
        <div
          className="flex h-12 w-12 items-center justify-center rounded-xl text-white font-extrabold text-lg shadow-md mb-3"
          style={{ backgroundColor: tenant.primaryColor || '#0284c7' }}
        >
          {tenant.name.substring(0, 2).toUpperCase()}
        </div>
        <h1 className="text-xl font-extrabold text-slate-900 tracking-tight">
          {tenant.name}
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Multi-Tenant White-Label eCommerce Operations Hub
        </p>
      </div>

      <div className="w-full max-w-md space-y-4">
        <Card className="shadow-lg border-slate-200/90">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base font-bold text-slate-900">
              Sign in to operations portal
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Enter your corporate credentials or choose a prefilled test persona below.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleLogin}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="user@organization.com"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">Password</label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-sky-700 hover:text-sky-800 font-medium"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Lock className="absolute left-3 top-2.5 h-4 w-4 text-slate-400 pointer-events-none" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="pl-9 text-xs"
                  />
                </div>
              </div>

              <Button
                type="submit"
                className="w-full mt-2 font-semibold shadow-xs"
                isLoading={loading}
              >
                Sign In <ArrowRight className="h-4 w-4 ml-1.5" />
              </Button>
            </CardContent>
          </form>

          {/* Quick Demo Persona Switcher */}
          <CardFooter className="flex flex-col border-t border-slate-100 bg-slate-50/50 p-4 space-y-2.5">
            <div className="flex items-center justify-between w-full">
              <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Demo Accounts (1-Click Fill)
              </span>
              <span className="text-[10px] text-slate-400 font-mono">Pass: password123</span>
            </div>
            <div className="grid grid-cols-1 gap-2 w-full">
              {demoAccounts.map((acc) => {
                const isSelected = email === acc.email;
                return (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => handleQuickFill(acc.email)}
                    className={`flex items-start gap-3 rounded-lg border p-2.5 text-left text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'border-blue-600 bg-blue-50/70 text-slate-900 shadow-xs ring-1 ring-blue-500'
                        : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50 hover:border-slate-300'
                    }`}
                  >
                    <img
                      src={acc.avatarUrl}
                      alt={acc.name}
                      referrerPolicy="no-referrer"
                      className="h-8 w-8 rounded-full object-cover shrink-0 border border-slate-200"
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <p className="font-bold text-slate-900 text-xs truncate">{acc.name}</p>
                          <span className="text-[10px] text-slate-400 font-normal">({acc.title})</span>
                        </div>
                        <span
                          className={`shrink-0 text-[10px] font-semibold px-1.5 py-0.2 rounded border ${
                            acc.role === 'Owner'
                              ? 'bg-amber-50 text-amber-800 border-amber-200'
                              : acc.role === 'Admin'
                              ? 'bg-rose-50 text-rose-800 border-rose-200'
                              : 'bg-blue-50 text-blue-800 border-blue-200'
                          }`}
                        >
                          {acc.role}
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 font-mono mt-0.5">{acc.email}</p>
                      <p className="text-[10px] text-slate-400 mt-0.5 line-clamp-1">{acc.description}</p>
                    </div>
                  </button>
                );
              })}
            </div>
          </CardFooter>
        </Card>

        {/* Security assurance */}
        <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400">
          <Shield className="h-3.5 w-3.5" />
          <span>Encrypted TLS Session • Multi-Factor Authentication Enabled</span>
        </div>
      </div>
    </div>
  );
}
