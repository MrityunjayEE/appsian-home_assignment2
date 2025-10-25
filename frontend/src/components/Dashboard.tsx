import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { projectsApi, authApi } from '../services/api';
import { useAuth } from '../contexts/AuthContext';
import { Project, ChangePasswordRequest } from '../types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, FolderOpen, Calendar, Settings, LogOut, Eye, Trash2 } from "lucide-react";

const Dashboard: React.FC = () => {
  const [projects, setProjects] = useState<Project[]>([]);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [deleteProjectId, setDeleteProjectId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const { user, logout } = useAuth();
  const { register, handleSubmit, reset, formState: { errors } } = useForm<{title: string; description?: string}>();
  const { register: registerPassword, handleSubmit: handlePasswordSubmit, reset: resetPassword, formState: { errors: passwordErrors } } = useForm<ChangePasswordRequest>();

  useEffect(() => {
    loadProjects();
  }, []);

  const loadProjects = async () => {
    try {
      const data = await projectsApi.getAll();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const onCreateProject = async (data: {title: string; description?: string}) => {
    try {
      await projectsApi.create(data);
      reset();
      setShowCreateForm(false);
      loadProjects();
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const onDeleteProject = async () => {
    if (!deleteProjectId) return;
    try {
      await projectsApi.delete(deleteProjectId);
      setDeleteProjectId(null);
      loadProjects();
    } catch (error) {
      console.error('Failed to delete project:', error);
    }
  };

  const onChangePassword = async (data: ChangePasswordRequest) => {
    try {
      await authApi.changePassword(data);
      resetPassword();
      setShowChangePassword(false);
      alert('Password changed successfully!');
    } catch (error: any) {
      console.error('Failed to change password:', error);
      alert(error.response?.data?.errors?.[0]?.message || 'Failed to change password');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 sm:space-x-3">
              <div className="p-1.5 sm:p-2 bg-primary/10 rounded-lg">
                <FolderOpen className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold">Project Manager</h1>
                <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">Manage your projects efficiently</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-1 sm:space-x-3">
              <div className="text-right hidden md:block">
                <p className="text-sm font-medium">Welcome back!</p>
                <p className="text-xs text-muted-foreground">{user?.name || user?.username}</p>
              </div>
              
              <Dialog open={showChangePassword} onOpenChange={setShowChangePassword}>
                <DialogTrigger asChild>
                  <Button variant="outline" size="sm" className="hidden sm:flex">
                    <Settings className="h-4 w-4 mr-2" />
                    Settings
                  </Button>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-md">
                  <DialogHeader>
                    <DialogTitle>Change Password</DialogTitle>
                    <DialogDescription>
                      Enter your current password and a new password.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handlePasswordSubmit(onChangePassword)} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="currentPassword">Current Password</Label>
                      <Input
                        id="currentPassword"
                        {...registerPassword('currentPassword', { required: 'Current password is required' })}
                        type="password"
                        placeholder="Enter current password"
                      />
                      {passwordErrors.currentPassword && (
                        <p className="text-sm text-destructive">{passwordErrors.currentPassword.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="newPassword">New Password</Label>
                      <Input
                        id="newPassword"
                        {...registerPassword('newPassword', { 
                          required: 'New password is required',
                          minLength: { value: 6, message: 'Password must be at least 6 characters' }
                        })}
                        type="password"
                        placeholder="Enter new password"
                      />
                      {passwordErrors.newPassword && (
                        <p className="text-sm text-destructive">{passwordErrors.newPassword.message}</p>
                      )}
                    </div>
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setShowChangePassword(false)}>
                        Cancel
                      </Button>
                      <Button type="submit">Change Password</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>

              {/* Mobile Settings Button */}
              <Button variant="outline" size="sm" className="sm:hidden p-2" onClick={() => setShowChangePassword(true)}>
                <Settings className="h-4 w-4" />
              </Button>

              <Button variant="outline" size="sm" onClick={logout} className="hidden sm:flex">
                <LogOut className="h-4 w-4 mr-2" />
                Logout
              </Button>

              {/* Mobile Logout Button */}
              <Button variant="outline" size="sm" className="sm:hidden p-2" onClick={logout}>
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-6 sm:mb-8 space-y-4 sm:space-y-0">
          <div>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight">Your Projects</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Create and manage your projects</p>
          </div>
          
          <Dialog open={showCreateForm} onOpenChange={setShowCreateForm}>
            <DialogTrigger asChild>
              <Button className="shadow-lg w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Create Project
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md">
              <DialogHeader>
                <DialogTitle>Create New Project</DialogTitle>
                <DialogDescription>
                  Add a new project to organize your tasks.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(onCreateProject)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Project Title</Label>
                  <Input
                    id="title"
                    {...register('title', { 
                      required: 'Title is required',
                      minLength: { value: 3, message: 'Title must be at least 3 characters' },
                      maxLength: { value: 100, message: 'Title must be less than 100 characters' }
                    })}
                    placeholder="Enter project title"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description (Optional)</Label>
                  <Textarea
                    id="description"
                    {...register('description', {
                      maxLength: { value: 500, message: 'Description must be less than 500 characters' }
                    })}
                    placeholder="Enter project description"
                    rows={3}
                  />
                  {errors.description && (
                    <p className="text-sm text-destructive">{errors.description.message}</p>
                  )}
                </div>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button type="button" variant="outline" onClick={() => setShowCreateForm(false)} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">Create Project</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Projects Grid */}
        {projects.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {projects.map((project) => (
              <Card key={project.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <CardTitle className="text-base sm:text-lg line-clamp-2 pr-2">{project.title}</CardTitle>
                    <Badge variant="secondary" className="ml-2 text-xs whitespace-nowrap">
                      <Calendar className="h-3 w-3 mr-1" />
                      <span className="hidden sm:inline">{new Date(project.createdAt).toLocaleDateString()}</span>
                      <span className="sm:hidden">{new Date(project.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
                    </Badge>
                  </div>
                  {project.description && (
                    <CardDescription className="line-clamp-3 text-sm">
                      {project.description}
                    </CardDescription>
                  )}
                </CardHeader>
                <Separator />
                <CardContent className="pt-4">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-2 sm:space-y-0">
                    <Link to={`/projects/${project.id}`} className="w-full sm:w-auto">
                      <Button variant="outline" size="sm" className="w-full sm:w-auto">
                        <Eye className="h-4 w-4 mr-2" />
                        View Project
                      </Button>
                    </Link>
                    
                    <Dialog open={deleteProjectId === project.id} onOpenChange={(open) => {
                      if (!open) setDeleteProjectId(null);
                    }}>
                      <DialogTrigger asChild>
                        <Button 
                          variant="outline" 
                          size="sm" 
                          onClick={() => setDeleteProjectId(project.id)}
                          className="text-destructive hover:text-destructive w-full sm:w-auto"
                        >
                          <Trash2 className="h-4 w-4 sm:mr-0" />
                          <span className="sm:hidden ml-2">Delete</span>
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="w-[95vw] max-w-md">
                        <DialogHeader>
                          <DialogTitle>Delete Project</DialogTitle>
                          <DialogDescription>
                            Are you sure you want to delete "{project.title}"? This will also delete all tasks in this project. This action cannot be undone.
                          </DialogDescription>
                        </DialogHeader>
                        <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                          <Button variant="outline" onClick={() => setDeleteProjectId(null)} className="w-full sm:w-auto">
                            Cancel
                          </Button>
                          <Button variant="destructive" onClick={onDeleteProject} className="w-full sm:w-auto">
                            Delete Project
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (
          <Card className="text-center py-8 sm:py-12">
            <CardContent>
              <div className="flex flex-col items-center space-y-4">
                <div className="p-3 sm:p-4 bg-muted rounded-full">
                  <FolderOpen className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold">No projects yet</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">Create your first project to get started</p>
                </div>
                <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Create Your First Project
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Dashboard;
