import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Eye, EyeOff, Lock, UserRound, BedDouble } from 'lucide-react';
import { Button, Input } from '@heroui/react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { getErrorMessage } from '../api/client';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [fieldErrors, setFieldErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const { login } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from || '/';

  const validate = () => {
    const errors = {};
    if (!username.trim()) errors.username = 'Username or email is required';
    if (!password) errors.password = 'Password is required';
    setFieldErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);
    try {
      await login(username.trim(), password);
      toast.success('Signed in successfully');
      navigate(from, { replace: true });
    } catch (err) {
      if (err.response && err.response.status === 401) {
        setFieldErrors({ password: 'Invalid username or password' });
      } else {
        toast.error(getErrorMessage(err));
      }
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen">
      <div className="relative hidden w-[45%] overflow-hidden bg-slate-900 lg:flex lg:flex-col">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-brand-900" />
        <div className="relative z-10 flex flex-1 flex-col justify-between p-10">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600 text-white shadow-lg shadow-brand-900/40">
              <BedDouble size={22} />
            </div>
            <div>
              <p className="text-lg font-bold text-white">HostelMS</p>
              <p className="text-xs font-medium text-slate-400">Hostel Management System</p>
            </div>
          </div>

          <div>
            <h1 className="text-3xl font-bold leading-tight text-white">
              Manage students, rooms, fees & complaints in one place.
            </h1>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-slate-400">
              A complete administration console for college hostels &mdash; room allotment, fee
              tracking with receipts, and a complaint desk, all backed by a MySQL database.
            </p>
          </div>

          <p className="text-xs text-slate-500">
            Development login &mdash; credentials are configured in backend/.env
          </p>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center bg-slate-100 px-4 py-10">
        <div className="w-full max-w-sm rounded-2xl border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-brand-600 text-white">
              <BedDouble size={20} />
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">HostelMS</p>
              <p className="text-[11px] font-medium text-slate-400">Hostel Management System</p>
            </div>
          </div>

          <h2 className="text-2xl font-bold tracking-tight text-slate-900">Sign in</h2>
          <p className="mt-1 text-sm text-slate-500">Enter your credentials to access the admin console.</p>

          <form onSubmit={handleSubmit} className="mt-7 space-y-4" noValidate>
            <div>
              <Input
                label="Username or Email"
                placeholder="admin"
                value={username}
                onValueChange={setUsername}
                isInvalid={!!fieldErrors.username}
                errorMessage={fieldErrors.username}
                startContent={<UserRound size={16} className="text-slate-400" />}
                variant="bordered"
                radius="md"
                autoComplete="username"
                classNames={{ input: 'text-sm', label: 'text-sm text-slate-500' }}
              />
            </div>
            <div>
              <Input
                label="Password"
                placeholder="Enter your password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onValueChange={setPassword}
                isInvalid={!!fieldErrors.password}
                errorMessage={fieldErrors.password}
                startContent={<Lock size={16} className="text-slate-400" />}
                endContent={
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="text-slate-400 hover:text-slate-600"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                }
                variant="bordered"
                radius="md"
                autoComplete="current-password"
                classNames={{ input: 'text-sm', label: 'text-sm text-slate-500' }}
              />
            </div>

            <Button
              type="submit"
              color="primary"
              size="lg"
              className="w-full font-semibold"
              isLoading={submitting}
              spinnerPlacement="start"
            >
              Sign in
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-slate-400">
            Single administrator account &middot; configured in backend/.env
          </p>
        </div>
      </div>
    </div>
  );
}
