'use client';
import { useState, useEffect, FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useUser } from '@/contexts/UserContext';
// Types
interface LoginFormData {
  username: string;
  password: string;
}

interface LoginState {
  isLoading: boolean;
  error: string;
}

// Custom hook for login logic
function useLogin() {
  const [state, setState] = useState<LoginState>({
    isLoading: false,
    error: ''
  });
  const { setUserId } = useUser();
  const router = useRouter();

  const login = async (formData: LoginFormData) => {
    setState({ isLoading: true, error: '' });

    try {
      // Validation
      if (!formData.username.trim() || !formData.password.trim()) {
        throw new Error('Please enter both username and password');
      }

      // Simulate API call - replace with actual authentication
      await authenticateUser(formData);
      
      // Success - save user and redirect
      setUserId(formData.username);
      router.push('/demo/estudiante');
      
    } catch (error) {
      setState({ 
        isLoading: false, 
        error: error instanceof Error ? error.message : 'Login failed. Please try again.' 
      });
    }
  };

  const clearError = () => {
    setState(prev => ({ ...prev, error: '' }));
  };

  return { ...state, login, clearError };
}

// Mock authentication function - replace with your actual API call
async function authenticateUser(formData: LoginFormData): Promise<void> {
  // Simulate API call delay
    const response = await fetch("http://localhost:8000/user/register", {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
    },
    body: JSON.stringify({user_id: formData.username, classroom:""}),
    });
    console.log(response);
  // Mock validation - replace with real authentication logic
  if (!formData.username || !formData.password) {
    throw new Error('Invalid credentials');
  }
}

// Reusable Input Component
interface InputFieldProps {
  id: string;
  name: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  required?: boolean;
  className?: string;
}

function InputField({ 
  id, 
  name, 
  type, 
  placeholder, 
  value, 
  onChange, 
  disabled = false, 
  required = false,
  className = ''
}: InputFieldProps) {
  return (
    <div>
      <label htmlFor={id} className="sr-only">
        {placeholder}
      </label>
      <input
        id={id}
        name={name}
        type={type}
        required={required}
        className={`appearance-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm ${className}`}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
      />
    </div>
  );
}

// Loading Spinner Component
function LoadingSpinner({ className = 'h-5 w-5' }: { className?: string }) {
  return (
    <svg 
      className={`animate-spin ${className}`} 
      xmlns="http://www.w3.org/2000/svg" 
      fill="none" 
      viewBox="0 0 24 24"
    >
      <circle 
        className="opacity-25" 
        cx="12" 
        cy="12" 
        r="10" 
        stroke="currentColor" 
        strokeWidth="4"
      />
      <path 
        className="opacity-75" 
        fill="currentColor" 
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

// Error Message Component
function ErrorMessage({ message, onClose }: { message: string; onClose?: () => void }) {
  if (!message) return null;
  
  return (
    <div className="rounded-md bg-red-50 p-4">
      <div className="flex">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3">
          <p className="text-sm text-red-700">{message}</p>
        </div>
        {onClose && (
          <div className="ml-auto pl-3">
            <button
              onClick={onClose}
              className="inline-flex rounded-md bg-red-50 p-1.5 text-red-500 hover:bg-red-100 focus:outline-none focus:ring-2 focus:ring-red-600 focus:ring-offset-2 focus:ring-offset-red-50"
            >
              <span className="sr-only">Dismiss</span>
              <svg className="h-3 w-3" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

// Login Form Component
function LoginForm() {
  const [formData, setFormData] = useState<LoginFormData>({
    username: '',
    password: ''
  });
  
  const { isLoading, error, login, clearError } = useLogin();

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    await login(formData);
  };

  const updateFormData = (field: keyof LoginFormData) => (value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (error) clearError();
  };

  return (
    <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
      <div className="rounded-md shadow-sm -space-y-px">
        <InputField
          id="username"
          name="username"
          type="text"
          placeholder="Username"
          value={formData.username}
          onChange={updateFormData('username')}
          disabled={isLoading}
          required
          className="rounded-t-md"
        />
        
        <InputField
          id="password"
          name="password"
          type="password"
          placeholder="Password"
          value={formData.password}
          onChange={updateFormData('password')}
          disabled={isLoading}
          required
          className="rounded-b-md"
        />
      </div>

      <ErrorMessage message={error} onClose={clearError} />

      <div>
        <button
          type="submit"
          disabled={isLoading}
          className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <span className="flex items-center">
              <LoadingSpinner className="mr-3 h-5 w-5 text-white" />
              Signing in...
            </span>
          ) : (
            'Sign in'
          )}
        </button>
      </div>
    </form>
  );
}

// Page Loading Component
function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="flex items-center space-x-2">
        <LoadingSpinner className="h-8 w-8 text-indigo-600" />
        <span className="text-gray-600">Loading...</span>
      </div>
    </div>
  );
}

// Main Login Component
export default function Login() {
  const { userId, isLoading: userLoading } = useUser();
  const router = useRouter();

  // Redirect if user is already logged in
  useEffect(() => {
    if (!userLoading && userId) {
      router.push('/demo/estudiante');
    }
  }, [userId, userLoading, router]);

  // Show loading spinner while checking for existing user
  if (userLoading) {
    return <PageLoading />;
  }

  return (
    <div className="h-[250px] flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
            Sign in to your account
          </h2>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
