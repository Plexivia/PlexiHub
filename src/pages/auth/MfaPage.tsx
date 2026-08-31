import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuthStore } from '../../stores/authStore';
import { useTenantStore } from '../../stores/tenantStore';
import { Button } from '../../components/ui/button';
import { Input } from '../../components/ui/input';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/card';
import { ShieldCheck, AlertCircle, ArrowLeft, RefreshCw, KeyRound } from 'lucide-react';

export function MfaPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const verifyMfa = useAuthStore((s) => s.verifyMfa);
  const tempMfaUser = useAuthStore((s) => s.tempMfaUser);
  const tenant = useTenantStore((s) => s.tenant);

  const email = (location.state as any)?.email || tempMfaUser?.email || 'elena.vance@apexops.io';
  const from = (location.state as any)?.from || '/dashboard';

  const [code, setCode] = useState('123456');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const targetUser = tempMfaUser || {
        id: 'usr_demo',
        name: email.split('@')[0] || 'User',
        email: email,
        role: 'Admin',
        avatarUrl: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        department: 'Operations',
        isActive: true,
      };
      await verifyMfa({ email, otp: code.trim() }, targetUser as any);
      navigate(from, { replace: true });
    } catch (err: any) {
      setError(err.message || 'Invalid MFA code. Try using default code: 123456');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = () => {
    setResendStatus('New 6-digit TOTP code dispatched to your registered authenticator device.');
    setTimeout(() => setResendStatus(null), 4000);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-100/70 p-4 sm:p-6">
      <div className="w-full max-w-md space-y-4">
        <Card className="shadow-lg border-slate-200/90">
          <CardHeader className="text-center space-y-2 pb-4">
            <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-sky-50 text-sky-600 border border-sky-200">
              <KeyRound className="h-6 w-6" />
            </div>
            <CardTitle className="text-base font-bold text-slate-900">
              Two-Factor Authentication
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Enter the 6-digit verification code from your authenticator app or hardware token for{' '}
              <strong className="text-slate-700">{email}</strong>.
            </CardDescription>
          </CardHeader>

          <form onSubmit={handleVerify}>
            <CardContent className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                  <AlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {resendStatus && (
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-2.5 text-xs text-emerald-800">
                  {resendStatus}
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-center text-xs font-semibold text-slate-700">
                  Security Code (Mock Default: 123456)
                </label>
                <Input
                  type="text"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  required
                  placeholder="123456"
                  className="text-center text-xl tracking-widest font-mono font-bold h-12"
                />
              </div>

              <Button
                type="submit"
                className="w-full font-semibold shadow-xs"
                isLoading={loading}
              >
                Verify & Authorize Session
              </Button>

              <div className="flex items-center justify-between pt-2 text-xs">
                <button
                  type="button"
                  onClick={handleResend}
                  className="text-sky-700 hover:text-sky-800 font-medium inline-flex items-center gap-1"
                >
                  <RefreshCw className="h-3 w-3" /> Resend Code
                </button>
                <Link
                  to="/login"
                  className="text-slate-500 hover:text-slate-800 font-medium inline-flex items-center gap-1"
                >
                  <ArrowLeft className="h-3 w-3" /> Back to Login
                </Link>
              </div>
            </CardContent>
          </form>
        </Card>
      </div>
    </div>
  );
}

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-100/70 p-4 sm:p-6">
      <div className="w-full max-w-md space-y-4">
        <Card className="shadow-lg border-slate-200/90">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base font-bold text-slate-900">
              Reset your password
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Enter your registered corporate email to receive a password reset link.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {submitted ? (
              <div className="space-y-3 text-center py-2">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900 space-y-1">
                  <p className="font-bold">Password reset link dispatched</p>
                  <p className="text-slate-600">
                    If an account matches <strong>{email}</strong>, you will receive instructions shortly.
                  </p>
                </div>
                <div className="pt-2">
                  <Link to={`/reset-password?token=mock_token_123`}>
                    <Button variant="outline" size="sm" className="w-full text-xs">
                      Simulate Clicking Reset Link In Email
                    </Button>
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Email Address
                  </label>
                  <Input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="user@organization.com"
                    className="text-xs"
                  />
                </div>
                <Button type="submit" className="w-full" isLoading={loading}>
                  Send Password Reset Link
                </Button>
              </form>
            )}

            <div className="mt-4 text-center">
              <Link to="/login" className="text-xs text-sky-700 hover:text-sky-800 font-medium inline-flex items-center gap-1">
                <ArrowLeft className="h-3 w-3" /> Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password.length < 8) {
      setError('Password must be at least 8 characters long');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    setError(null);
    setLoading(true);
    await new Promise((r) => setTimeout(r, 600));
    setLoading(false);
    setDone(true);
  };

  return (
    <div className="min-h-screen w-full flex flex-col justify-center items-center bg-slate-100/70 p-4 sm:p-6">
      <div className="w-full max-w-md space-y-4">
        <Card className="shadow-lg border-slate-200/90">
          <CardHeader className="space-y-1 pb-4">
            <CardTitle className="text-base font-bold text-slate-900">
              Set New Password
            </CardTitle>
            <CardDescription className="text-xs text-slate-500">
              Choose a secure password with at least 8 characters.
            </CardDescription>
          </CardHeader>

          <CardContent>
            {done ? (
              <div className="space-y-4 text-center py-2">
                <div className="rounded-lg border border-emerald-200 bg-emerald-50 p-4 text-xs text-emerald-900">
                  <p className="font-bold">Password Updated Successfully</p>
                  <p className="mt-1 text-slate-600">You can now sign in with your new password.</p>
                </div>
                <Button onClick={() => navigate('/login')} className="w-full">
                  Proceed to Sign In
                </Button>
              </div>
            ) : (
              <form onSubmit={handleReset} className="space-y-4">
                {error && (
                  <div className="flex items-center gap-2 rounded-lg border border-rose-200 bg-rose-50 p-3 text-xs text-rose-700">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    New Password
                  </label>
                  <Input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="text-xs"
                  />
                </div>

                <Button type="submit" className="w-full" isLoading={loading}>
                  Update Password
                </Button>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
