import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { Link, useNavigate } from 'react-router-dom';
import { authApi } from '../services/api';
import { RegisterRequest } from '../types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { UserPlus } from "lucide-react";

const Register: React.FC = () => {
  const { register, handleSubmit, formState: { errors } } = useForm<RegisterRequest>();
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (data: RegisterRequest) => {
    setLoading(true);
    setError('');
    try {
      await authApi.register(data);
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.errors?.[0]?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 via-blue-50 to-indigo-50 p-2 sm:p-4">
      <Card className="w-full max-w-sm sm:max-w-md shadow-xl">
        <CardHeader className="space-y-1 text-center px-4 sm:px-6">
          <div className="flex justify-center mb-3 sm:mb-4">
            <div className="p-2 sm:p-3 bg-primary/10 rounded-full">
              <UserPlus className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
            </div>
          </div>
          <CardTitle className="text-xl sm:text-2xl font-bold">Create account</CardTitle>
          <CardDescription className="text-sm sm:text-base">
            Enter your details to create your account
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
              <Label htmlFor="name" className="text-sm">Full Name</Label>
              <Input
                id="name"
                {...register('name', { 
                  required: 'Name is required',
                  maxLength: { value: 100, message: 'Name must be less than 100 characters' }
                })}
                type="text"
                placeholder="Enter your full name"
                autoComplete="name"
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
              {errors.name && (
                <p className="text-xs sm:text-sm text-destructive">{errors.name.message}</p>
              )}
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="college" className="text-sm">College Name</Label>
              <Input
                id="college"
                {...register('college', { 
                  required: 'College is required',
                  maxLength: { value: 200, message: 'College name must be less than 200 characters' }
                })}
                type="text"
                placeholder="Enter your college name"
                autoComplete="organization"
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
              {errors.college && (
                <p className="text-xs sm:text-sm text-destructive">{errors.college.message}</p>
              )}
            </div>

            <div className="space-y-1 sm:space-y-2">
              <Label htmlFor="username" className="text-sm">Email</Label>
              <Input
                id="username"
                {...register('username', { 
                  required: 'Email is required',
                  pattern: {
                    value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                    message: 'Invalid email address'
                  }
                })}
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
                {...register('password', { 
                  required: 'Password is required',
                  minLength: { value: 6, message: 'Password must be at least 6 characters' }
                })}
                type="password"
                placeholder="Enter your password"
                autoComplete="new-password"
                className="h-10 sm:h-11 text-sm sm:text-base"
              />
              {errors.password && (
                <p className="text-xs sm:text-sm text-destructive">{errors.password.message}</p>
              )}
            </div>

            <Button type="submit" className="w-full h-10 sm:h-11 text-sm sm:text-base" disabled={loading}>
              {loading ? 'Creating account...' : 'Sign up'}
            </Button>

            <div className="text-center text-xs sm:text-sm">
              <span className="text-muted-foreground">Already have an account? </span>
              <Link to="/login" className="text-primary hover:underline font-medium">
                Sign in
              </Link>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};

export default Register;
