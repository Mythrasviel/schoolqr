import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Badge } from './ui/badge';
import { Plus, Edit, Trash2, Key, AlertCircle } from 'lucide-react';
import { Teacher } from '../App';

interface TeacherManagementProps {
  teachers: Teacher[];
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (teacherId: string) => void;
  adminEmail: string;
}

export default function TeacherManagement({
  teachers,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  adminEmail
}: TeacherManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [selectedTeacher, setSelectedTeacher] = useState<Teacher | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    } else {
      // Check if email is already taken (excluding current teacher in edit mode)
      const emailTaken = teachers.some(t => 
        t.email === formData.email && t.id !== selectedTeacher?.id
      );
      if (emailTaken) {
        newErrors.email = 'This email is already in use';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleAddTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    const newTeacher: Teacher = {
      id: Date.now().toString(),
      ...formData,
      createdBy: adminEmail,
      password: 'teacher123', // Default password
      isDefaultPassword: true
    };
    onAddTeacher(newTeacher);
    setFormData({ name: '', email: '', subject: '' });
    setIsAddDialogOpen(false);
  };

  const handleEditTeacher = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedTeacher) return;

    const updatedTeacher: Teacher = {
      ...selectedTeacher,
      ...formData
    };
    onUpdateTeacher(updatedTeacher);
    setIsEditDialogOpen(false);
    setSelectedTeacher(null);
  };

  const openEditDialog = (teacher: Teacher) => {
    setSelectedTeacher(teacher);
    setFormData({
      name: teacher.name,
      email: teacher.email,
      subject: teacher.subject || ''
    });
    setErrors({});
    setIsEditDialogOpen(true);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const resetAddForm = () => {
    setFormData({ name: '', email: '', subject: '' });
    setErrors({});
  };

  const resetTeacherPassword = (teacher: Teacher) => {
    const updatedTeacher = {
      ...teacher,
      password: 'teacher123',
      isDefaultPassword: true
    };
    onUpdateTeacher(updatedTeacher);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Teacher Management</CardTitle>
            <CardDescription>Manage teacher accounts and permissions</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={(open) => {
            setIsAddDialogOpen(open);
            if (open) resetAddForm();
          }}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Teacher
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Teacher</DialogTitle>
                <DialogDescription>
                  Create a new teacher account. The teacher will start with the default password "teacher123" and should change it after first login.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddTeacher} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange('name', e.target.value)}
                    className={errors.name ? 'border-destructive' : ''}
                    placeholder="Enter teacher's full name"
                  />
                  {errors.name && (
                    <p className="text-destructive text-sm">{errors.name}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange('email', e.target.value)}
                    className={errors.email ? 'border-destructive' : ''}
                    placeholder="Enter teacher's email"
                  />
                  {errors.email && (
                    <p className="text-destructive text-sm">{errors.email}</p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject (Optional)</Label>
                  <Input
                    id="subject"
                    value={formData.subject}
                    onChange={(e) => handleInputChange('subject', e.target.value)}
                    placeholder="e.g., Mathematics, English, Science"
                  />
                </div>
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex items-start gap-2">
                    <Key className="h-4 w-4 text-blue-600 mt-0.5" />
                    <div className="text-sm">
                      <p className="text-blue-800">Default Login</p>
                      <p className="text-blue-600">Password: teacher123</p>
                      <p className="text-blue-600 text-xs mt-1">
                        Teacher should change this password after first login
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Teacher</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Name</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Subject</TableHead>
              <TableHead>Password Status</TableHead>
              <TableHead>Created By</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {teachers.map((teacher) => (
              <TableRow key={teacher.id}>
                <TableCell>{teacher.name}</TableCell>
                <TableCell>{teacher.email}</TableCell>
                <TableCell>{teacher.subject || '-'}</TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    {teacher.isDefaultPassword ? (
                      <Badge variant="outline" className="text-orange-600 border-orange-200">
                        <AlertCircle className="h-3 w-3 mr-1" />
                        Default
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="text-green-600 border-green-200">
                        <Key className="h-3 w-3 mr-1" />
                        Custom
                      </Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell className="text-muted-foreground">{teacher.createdBy}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(teacher)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    {!teacher.isDefaultPassword && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => resetTeacherPassword(teacher)}
                        title="Reset to default password"
                      >
                        <Key className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteTeacher(teacher.id)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {teachers.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground py-4">
                  No teachers added yet
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Teacher</DialogTitle>
              <DialogDescription>
                Update the teacher's information. Password settings are managed separately.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditTeacher} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className={errors.name ? 'border-destructive' : ''}
                />
                {errors.name && (
                  <p className="text-destructive text-sm">{errors.name}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className={errors.email ? 'border-destructive' : ''}
                />
                {errors.email && (
                  <p className="text-destructive text-sm">{errors.email}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-subject">Subject (Optional)</Label>
                <Input
                  id="edit-subject"
                  value={formData.subject}
                  onChange={(e) => handleInputChange('subject', e.target.value)}
                />
              </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Teacher</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
