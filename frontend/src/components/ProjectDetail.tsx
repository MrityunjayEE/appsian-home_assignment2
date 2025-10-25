import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { projectsApi, tasksApi } from '../services/api';
import { ProjectDetail as ProjectDetailType, Task } from '../types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { ArrowLeft, Plus, Calendar, CheckCircle2, Circle, Edit, Trash2, Zap, Clock } from "lucide-react";

const ProjectDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [project, setProject] = useState<ProjectDetailType | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [deleteTaskId, setDeleteTaskId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  
  const { register, handleSubmit, reset, setValue, formState: { errors } } = useForm<{title: string; dueDate?: string}>();

  useEffect(() => {
    if (id) {
      loadProject();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      const data = await projectsApi.getById(parseInt(id!));
      setProject(data);
    } catch (error) {
      console.error('Failed to load project:', error);
    } finally {
      setLoading(false);
    }
  };

  const onCreateTask = async (data: {title: string; dueDate?: string}) => {
    try {
      await tasksApi.create(parseInt(id!), data);
      reset();
      setShowCreateForm(false);
      loadProject();
    } catch (error) {
      console.error('Failed to create task:', error);
    }
  };

  const onUpdateTask = async (data: {title: string; dueDate?: string}) => {
    if (!editingTask) return;
    try {
      await tasksApi.update(editingTask.id, data);
      setEditingTask(null);
      reset();
      loadProject();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const onToggleComplete = async (task: Task) => {
    try {
      await tasksApi.update(task.id, { isCompleted: !task.isCompleted });
      loadProject();
    } catch (error) {
      console.error('Failed to update task:', error);
    }
  };

  const onDeleteTask = async () => {
    if (!deleteTaskId) return;
    try {
      await tasksApi.delete(deleteTaskId);
      setDeleteTaskId(null);
      loadProject();
    } catch (error) {
      console.error('Failed to delete task:', error);
    }
  };

  const startEditing = (task: Task) => {
    setEditingTask(task);
    setValue('title', task.title);
    setValue('dueDate', task.dueDate ? task.dueDate.split('T')[0] : '');
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
          <p className="mt-2 text-muted-foreground">Loading project...</p>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="text-center p-8">
          <CardContent>
            <h2 className="text-xl font-semibold mb-2">Project not found</h2>
            <p className="text-muted-foreground mb-4">The project you're looking for doesn't exist.</p>
            <Link to="/dashboard">
              <Button>
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  const completedTasks = project.tasks.filter(task => task.isCompleted).length;
  const totalTasks = project.tasks.length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link to="/dashboard">
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Dashboard</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <div>
                <h1 className="text-lg sm:text-xl font-bold line-clamp-1">{project.title}</h1>
                <p className="text-xs sm:text-sm text-muted-foreground">
                  {completedTasks} of {totalTasks} tasks completed
                </p>
              </div>
            </div>
            
            <Link to={`/projects/${project.id}/scheduler`} className="w-full sm:w-auto">
              <Button className="shadow-lg w-full sm:w-auto">
                <Zap className="h-4 w-4 mr-2" />
                Smart Scheduler
              </Button>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        {/* Project Info */}
        {project.description && (
          <Card className="mb-6 sm:mb-8">
            <CardHeader>
              <CardTitle className="text-base sm:text-lg">Project Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-muted-foreground text-sm sm:text-base">{project.description}</p>
            </CardContent>
          </Card>
        )}

        {/* Tasks Section */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-4 sm:mb-6 space-y-3 sm:space-y-0">
          <div>
            <h2 className="text-xl sm:text-2xl font-bold tracking-tight">Tasks</h2>
            <p className="text-muted-foreground text-sm sm:text-base">Manage your project tasks</p>
          </div>
          
          <Dialog open={showCreateForm || !!editingTask} onOpenChange={(open) => {
            if (!open) {
              setShowCreateForm(false);
              setEditingTask(null);
              reset();
            }
          }}>
            <DialogTrigger asChild>
              <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto">
                <Plus className="h-4 w-4 mr-2" />
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-md">
              <DialogHeader>
                <DialogTitle>{editingTask ? 'Edit Task' : 'Create New Task'}</DialogTitle>
                <DialogDescription>
                  {editingTask ? 'Update the task details.' : 'Add a new task to your project.'}
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleSubmit(editingTask ? onUpdateTask : onCreateTask)} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Task Title</Label>
                  <Input
                    id="title"
                    {...register('title', { required: 'Title is required' })}
                    placeholder="Enter task title"
                  />
                  {errors.title && (
                    <p className="text-sm text-destructive">{errors.title.message}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dueDate">Due Date (Optional)</Label>
                  <Input
                    id="dueDate"
                    {...register('dueDate')}
                    type="date"
                  />
                </div>
                <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                  <Button type="button" variant="outline" onClick={() => {
                    setShowCreateForm(false);
                    setEditingTask(null);
                    reset();
                  }} className="w-full sm:w-auto">
                    Cancel
                  </Button>
                  <Button type="submit" className="w-full sm:w-auto">
                    {editingTask ? 'Update Task' : 'Create Task'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Tasks List */}
        {project.tasks.length > 0 ? (
          <div className="space-y-3 sm:space-y-4">
            {project.tasks.map((task) => (
              <Card key={task.id} className={`transition-all duration-200 ${task.isCompleted ? 'bg-muted/50' : 'hover:shadow-md'}`}>
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start justify-between space-x-3">
                    <div className="flex items-start space-x-3 flex-1 min-w-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onToggleComplete(task)}
                        className="p-0 h-auto mt-0.5 flex-shrink-0"
                      >
                        {task.isCompleted ? (
                          <CheckCircle2 className="h-5 w-5 text-green-600" />
                        ) : (
                          <Circle className="h-5 w-5 text-muted-foreground" />
                        )}
                      </Button>
                      
                      <div className="flex-1 min-w-0">
                        <h3 className={`font-medium text-sm sm:text-base ${task.isCompleted ? 'line-through text-muted-foreground' : ''} break-words`}>
                          {task.title}
                        </h3>
                        {task.dueDate && (
                          <div className="flex items-center mt-1">
                            <Calendar className="h-3 w-3 mr-1 text-muted-foreground flex-shrink-0" />
                            <span className="text-xs text-muted-foreground">
                              Due: {new Date(task.dueDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        <div className="mt-2 sm:hidden">
                          <Badge variant={task.isCompleted ? "secondary" : "outline"} className="text-xs">
                            {task.isCompleted ? "Completed" : "Pending"}
                          </Badge>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-1 sm:space-x-2 flex-shrink-0">
                      <Badge variant={task.isCompleted ? "secondary" : "outline"} className="hidden sm:inline-flex">
                        {task.isCompleted ? "Completed" : "Pending"}
                      </Badge>
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => startEditing(task)}
                        className="p-1 sm:p-2"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      
                      <Dialog open={deleteTaskId === task.id} onOpenChange={(open) => {
                        if (!open) setDeleteTaskId(null);
                      }}>
                        <DialogTrigger asChild>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setDeleteTaskId(task.id)}
                            className="text-destructive hover:text-destructive p-1 sm:p-2"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="w-[95vw] max-w-md">
                          <DialogHeader>
                            <DialogTitle>Delete Task</DialogTitle>
                            <DialogDescription>
                              Are you sure you want to delete "{task.title}"? This action cannot be undone.
                            </DialogDescription>
                          </DialogHeader>
                          <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-2">
                            <Button variant="outline" onClick={() => setDeleteTaskId(null)} className="w-full sm:w-auto">
                              Cancel
                            </Button>
                            <Button variant="destructive" onClick={onDeleteTask} className="w-full sm:w-auto">
                              Delete Task
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
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
                  <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-semibold">No tasks yet</h3>
                  <p className="text-muted-foreground text-sm sm:text-base">Add your first task to get started</p>
                </div>
                <Button onClick={() => setShowCreateForm(true)} className="w-full sm:w-auto">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Your First Task
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default ProjectDetail;
