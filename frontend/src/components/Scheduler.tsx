import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useForm, useFieldArray } from 'react-hook-form';
import { projectsApi, schedulerApi } from '../services/api';
import { ProjectDetail, ScheduleRequest, ScheduleResponse, ScheduleTaskInput } from '../types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Plus, Trash2, Zap, Calendar, Clock, AlertTriangle, CheckCircle, Target } from "lucide-react";

const Scheduler: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [scheduleResult, setScheduleResult] = useState<ScheduleResponse | null>(null);
  const [taskStatus, setTaskStatus] = useState<{[key: string]: {isCompleted: boolean, taskId?: number}}>({});
  const [loading, setLoading] = useState(false);

  const { register, control, handleSubmit, setValue, watch } = useForm<any>({
    defaultValues: {
      tasks: [],
      workingHoursPerDay: 8
    }
  });

  const { fields, append, remove } = useFieldArray({
    control,
    name: 'tasks'
  });

  useEffect(() => {
    if (id) {
      loadProject();
      loadSchedulerData();
    }
  }, [id]);

  const loadProject = async () => {
    try {
      const data = await projectsApi.getById(parseInt(id!));
      setProject(data);
    } catch (error) {
      console.error('Failed to load project:', error);
    }
  };

  const loadSchedulerData = async () => {
    try {
      // Load saved scheduler tasks
      const savedTasks = await schedulerApi.getSchedulerTasks(parseInt(id!));
      if (savedTasks.length > 0) {
        setValue('tasks', savedTasks.map(task => ({
          ...task,
          dependencies: Array.isArray(task.dependencies) ? task.dependencies.join(', ') : task.dependencies
        })) as any);
      } else {
        // Load from project tasks if no scheduler tasks exist
        const projectData = await projectsApi.getById(parseInt(id!));
        const taskInputs = projectData.tasks.map(task => ({
          title: task.title,
          estimatedHours: 8,
          dueDate: task.dueDate ? task.dueDate.split('T')[0] : undefined,
          dependencies: ''
        }));
        setValue('tasks', taskInputs as any);
      }
      
      // Load saved schedule result
      const savedScheduleResult = await schedulerApi.getScheduleResult(parseInt(id!));
      if (savedScheduleResult) {
        setScheduleResult(savedScheduleResult);
      }
      
      // Load task completion status
      const status = await schedulerApi.getSchedulerStatus(parseInt(id!));
      const statusMap: {[key: string]: {isCompleted: boolean, taskId?: number}} = {};
      status.forEach(s => {
        statusMap[s.title] = { isCompleted: s.isCompleted, taskId: s.taskId };
      });
      setTaskStatus(statusMap);
    } catch (error) {
      console.error('Failed to load scheduler data:', error);
    }
  };

  const onSubmit = async (data: any) => {
    setLoading(true);
    try {
      const processedData = {
        ...data,
        tasks: data.tasks.map((task: any) => ({
          ...task,
          dependencies: typeof task.dependencies === 'string' 
            ? task.dependencies.split(',').map((dep: string) => dep.trim()).filter((dep: string) => dep.length > 0)
            : task.dependencies || []
        }))
      };
      
      const result = await schedulerApi.generateSchedule(parseInt(id!), processedData);
      setScheduleResult(result);
      
      // Reload status after generating schedule
      await loadSchedulerData();
    } catch (error) {
      console.error('Failed to generate schedule:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveCurrentTasks = async () => {
    try {
      const tasks = watch('tasks');
      const processedTasks = tasks.map((task: any) => ({
        ...task,
        dependencies: typeof task.dependencies === 'string' 
          ? task.dependencies.split(',').map((dep: string) => dep.trim()).filter((dep: string) => dep.length > 0)
          : task.dependencies || []
      }));
      
      await schedulerApi.saveSchedulerTasks(parseInt(id!), processedTasks);
    } catch (error) {
      console.error('Failed to save tasks:', error);
    }
  };

  const addTask = () => {
    append({
      title: '',
      estimatedHours: 8,
      dueDate: undefined,
      dependencies: []
    });
  };

  // Auto-save when tasks change
  const tasks = watch('tasks');
  useEffect(() => {
    if (tasks.length > 0 && tasks.some(task => task.title)) {
      const timeoutId = setTimeout(() => {
        saveCurrentTasks();
      }, 1000); // Debounce for 1 second
      
      return () => clearTimeout(timeoutId);
    }
  }, [tasks]);

  const getTaskCompletionStatus = (taskTitle: string) => {
    return taskStatus[taskTitle]?.isCompleted || false;
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white/80 backdrop-blur-sm border-b sticky top-0 z-50">
        <div className="container mx-auto px-2 sm:px-4 py-3 sm:py-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-3 sm:space-y-0">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link to={`/projects/${id}`}>
                <Button variant="outline" size="sm">
                  <ArrowLeft className="h-4 w-4 mr-1 sm:mr-2" />
                  <span className="hidden sm:inline">Back to Project</span>
                  <span className="sm:hidden">Back</span>
                </Button>
              </Link>
              <div className="flex items-center space-x-2 sm:space-x-3">
                <div className="p-1.5 sm:p-2 bg-purple-100 rounded-lg">
                  <Zap className="h-5 w-5 sm:h-6 sm:w-6 text-purple-600" />
                </div>
                <div>
                  <h1 className="text-lg sm:text-xl font-bold">Smart Scheduler</h1>
                  <p className="text-xs sm:text-sm text-muted-foreground">AI-powered task scheduling</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4 sm:gap-8">
          {/* Configuration Panel */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Target className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-blue-600" />
                Task Configuration
              </CardTitle>
              <CardDescription className="text-sm">
                Configure your tasks with dependencies and time estimates
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="workingHours" className="text-sm">Working Hours Per Day</Label>
                  <Input
                    id="workingHours"
                    {...register('workingHoursPerDay', { 
                      required: true, 
                      min: 1, 
                      max: 24,
                      valueAsNumber: true 
                    })}
                    type="number"
                    min="1"
                    max="24"
                    className="w-24 sm:w-32"
                  />
                </div>

                <Separator />

                <div className="space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between space-y-2 sm:space-y-0">
                    <h3 className="text-base sm:text-lg font-semibold">Tasks</h3>
                    <Button type="button" onClick={addTask} variant="outline" size="sm" className="w-full sm:w-auto">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Task
                    </Button>
                  </div>

                  <div className="space-y-3 sm:space-y-4 max-h-80 sm:max-h-96 overflow-y-auto">
                    {fields.map((field, index) => (
                      <Card key={field.id} className="border-2 border-dashed border-muted">
                        <CardHeader className="pb-2 sm:pb-3">
                          <div className="flex items-center justify-between">
                            <Badge variant="outline" className="text-xs">Task {index + 1}</Badge>
                            <Button
                              type="button"
                              onClick={() => remove(index)}
                              variant="ghost"
                              size="sm"
                              className="text-destructive hover:text-destructive p-1"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3 pt-0">
                          <div className="space-y-2">
                            <Label className="text-sm">Task Title</Label>
                            <Input
                              {...register(`tasks.${index}.title`, { required: true })}
                              placeholder="Enter task title"
                              className="text-sm"
                            />
                          </div>
                          
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <div className="space-y-2">
                              <Label className="text-sm">Estimated Hours</Label>
                              <Input
                                {...register(`tasks.${index}.estimatedHours`, { 
                                  required: true, 
                                  min: 0.1,
                                  valueAsNumber: true 
                                })}
                                type="number"
                                step="0.5"
                                min="0.1"
                                placeholder="8"
                                className="text-sm"
                              />
                            </div>
                            
                            <div className="space-y-2">
                              <Label className="text-sm">Due Date</Label>
                              <Input
                                {...register(`tasks.${index}.dueDate`)}
                                type="date"
                                className="text-sm"
                              />
                            </div>
                          </div>
                          
                          <div className="space-y-2">
                            <Label className="text-sm">Dependencies</Label>
                            <Input
                              {...register(`tasks.${index}.dependencies`)}
                              placeholder="Task A, Task B"
                              className="text-sm"
                            />
                            <p className="text-xs text-muted-foreground">
                              Enter task titles separated by commas
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>

                  {fields.length === 0 && (
                    <Card className="border-2 border-dashed border-muted text-center py-6 sm:py-8">
                      <CardContent>
                        <div className="flex flex-col items-center space-y-2">
                          <Clock className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                          <p className="text-muted-foreground text-sm">No tasks configured</p>
                          <Button type="button" onClick={addTask} variant="outline" size="sm" className="w-full sm:w-auto">
                            <Plus className="h-4 w-4 mr-2" />
                            Add Your First Task
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-10 sm:h-12 text-sm sm:text-lg shadow-lg" 
                  disabled={loading || fields.length === 0}
                >
                  {loading ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      <span className="hidden sm:inline">Generating Schedule...</span>
                      <span className="sm:hidden">Generating...</span>
                    </>
                  ) : (
                    <>
                      <Zap className="h-4 w-4 sm:h-5 sm:w-5 mr-2" />
                      <span className="hidden sm:inline">Generate Smart Schedule</span>
                      <span className="sm:hidden">Generate Schedule</span>
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Results Panel */}
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="flex items-center text-base sm:text-lg">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5 mr-2 text-green-600" />
                Schedule Results
              </CardTitle>
              <CardDescription className="text-sm">
                AI-generated task schedule and recommendations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {scheduleResult ? (
                <div className="space-y-4 sm:space-y-6">
                  {/* Errors */}
                  {scheduleResult.errors.length > 0 && (
                    <Card className="border-destructive bg-destructive/5">
                      <CardHeader className="pb-2 sm:pb-3">
                        <CardTitle className="text-destructive flex items-center text-sm sm:text-base">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Errors Found
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {scheduleResult.errors.map((error, index) => (
                            <li key={index} className="text-xs sm:text-sm text-destructive flex items-start">
                              <span className="w-2 h-2 bg-destructive rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                              <span className="break-words">{error}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Warnings */}
                  {scheduleResult.warnings.length > 0 && (
                    <Card className="border-yellow-500 bg-yellow-50">
                      <CardHeader className="pb-2 sm:pb-3">
                        <CardTitle className="text-yellow-700 flex items-center text-sm sm:text-base">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Warnings
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ul className="space-y-1">
                          {scheduleResult.warnings.map((warning, index) => (
                            <li key={index} className="text-xs sm:text-sm text-yellow-700 flex items-start">
                              <span className="w-2 h-2 bg-yellow-500 rounded-full mt-1.5 mr-2 flex-shrink-0"></span>
                              <span className="break-words">{warning}</span>
                            </li>
                          ))}
                        </ul>
                      </CardContent>
                    </Card>
                  )}

                  {/* Recommended Order */}
                  {scheduleResult.recommendedOrder.length > 0 && (
                    <Card className="border-blue-200 bg-blue-50">
                      <CardHeader className="pb-2 sm:pb-3">
                        <CardTitle className="text-blue-700 flex items-center text-sm sm:text-base">
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Recommended Order
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <ol className="space-y-2">
                          {scheduleResult.recommendedOrder.map((task, index) => {
                            const isCompleted = getTaskCompletionStatus(task);
                            const canStart = index === 0 || getTaskCompletionStatus(scheduleResult.recommendedOrder[index - 1]);
                            
                            return (
                              <li key={index} className="flex items-center">
                                <Badge 
                                  variant={isCompleted ? "default" : canStart ? "outline" : "secondary"} 
                                  className={`mr-2 sm:mr-3 w-6 h-6 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs ${
                                    isCompleted ? 'bg-green-600' : canStart ? 'bg-blue-600 text-white' : ''
                                  }`}
                                >
                                  {isCompleted ? '✓' : index + 1}
                                </Badge>
                                <span className={`text-xs sm:text-sm font-medium break-words ${
                                  isCompleted ? 'line-through text-muted-foreground' : 
                                  canStart ? 'text-blue-700 font-semibold' : 'text-muted-foreground'
                                }`}>
                                  {task}
                                </span>
                                {isCompleted && (
                                  <Badge variant="secondary" className="ml-2 text-xs bg-green-100 text-green-700">
                                    Completed
                                  </Badge>
                                )}
                                {canStart && !isCompleted && index > 0 && (
                                  <Badge variant="outline" className="ml-2 text-xs border-blue-600 text-blue-600">
                                    Ready to Start
                                  </Badge>
                                )}
                              </li>
                            );
                          })}
                        </ol>
                      </CardContent>
                    </Card>
                  )}

                  {/* Detailed Schedule */}
                  {scheduleResult.schedule.length > 0 && (
                    <Card className="border-green-200 bg-green-50">
                      <CardHeader className="pb-2 sm:pb-3">
                        <CardTitle className="text-green-700 flex items-center text-sm sm:text-base">
                          <Calendar className="h-4 w-4 mr-2" />
                          Detailed Schedule
                        </CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2 sm:space-y-3">
                          {scheduleResult.schedule.map((task, index) => {
                            const isCompleted = getTaskCompletionStatus(task.title);
                            
                            return (
                              <Card key={index} className={`border ${
                                isCompleted ? 'border-green-400 bg-green-100' : 'border-green-200'
                              }`}>
                                <CardContent className="p-3 sm:p-4">
                                  <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2 space-y-1 sm:space-y-0">
                                    <div className="flex items-center">
                                      <h4 className={`font-semibold text-green-800 text-sm sm:text-base break-words ${
                                        isCompleted ? 'line-through' : ''
                                      }`}>
                                        {task.title}
                                      </h4>
                                      {isCompleted && (
                                        <CheckCircle className="h-4 w-4 text-green-600 ml-2" />
                                      )}
                                    </div>
                                    <div className="flex items-center space-x-2">
                                      <Badge variant="secondary" className="text-xs self-start sm:self-auto">
                                        {task.allocatedHours}h
                                      </Badge>
                                      {isCompleted && (
                                        <Badge variant="default" className="text-xs bg-green-600">
                                          ✓ Done
                                        </Badge>
                                      )}
                                    </div>
                                  </div>
                                  <div className="flex items-center text-xs sm:text-sm text-green-600">
                                    <Calendar className="h-3 w-3 mr-1 flex-shrink-0" />
                                    <span className="break-words">
                                      {new Date(task.startDate).toLocaleDateString()} - {new Date(task.endDate).toLocaleDateString()}
                                    </span>
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </CardContent>
                    </Card>
                  )}
                </div>
              ) : (
                <Card className="border-2 border-dashed border-muted text-center py-8 sm:py-12">
                  <CardContent>
                    <div className="flex flex-col items-center space-y-4">
                      <div className="p-3 sm:p-4 bg-muted rounded-full">
                        <Zap className="h-6 w-6 sm:h-8 sm:w-8 text-muted-foreground" />
                      </div>
                      <div>
                        <h3 className="text-base sm:text-lg font-semibold">Ready to Schedule</h3>
                        <p className="text-muted-foreground text-sm sm:text-base">Configure your tasks and generate an AI-powered schedule</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
};

export default Scheduler;
