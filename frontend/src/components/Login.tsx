import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { LoginRequest } from '../types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { LogIn } from "lucide-react";

const Login: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<LoginRequest>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const onSubmit = async (data: LoginRequest) => {
    setLoading(true);
    setError('');
    try {
      const response = await authApi.login(data);
      login(response.token);
      navigate('/dashboard');
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0]?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 p-2 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center px-4 sm:px-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-full">
              <LogIn className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">Welcome back</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Sign in to your account to continue
          </CardDescription>
        </CardHeader>
        <CardContent className="px-4 sm:px-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-3 sm:space-y-4">
            {error && (
              <div className="bg-destructive/15 text-destructive text-xs sm:text-sm p-2 sm:p-3 rounded-md border border-destructive/20">
                {error}
              </div>
            )}
            
            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="username" className="text-sm">Email</Label>
              <Input
                id="username"
                {...register('username', { required: 'Email is required' })}
                type="email"
                placeholder="Enter your email"
                autoComplete="username"
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
              {errors.username && (
                <p className="text-xs sm:text-sm text-destructive">{errors.username.message}</p>
              )}
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="password" className="text-sm">Password</Label>
              <Input
                id="password"
                {...register('password', { required: 'Password is required' })}
                type="password"
                placeholder="Enter your password"
                autoComplete="current-password"
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
              {errors.password && (
                <p className="text-xs sm:text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full h-10 sm:h-11 text-sm sm:text-base" disabled={loading}>
              {loading ? 'Signing in...' : 'Sign in'}
            </Button>

            <div className="text-center text-xs sm:text-sm">
              <span className="text-muted-foreground">Don't have an account? </span>
              <Link to="/register" className="text-primary hover:underline font-medium">
                Sign up
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
