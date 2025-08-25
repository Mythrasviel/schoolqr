import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Plus, Edit, Trash2, QrCode } from 'lucide-react';
import { Student } from '../App';
import QRCodeDisplay from './QRCodeDisplay';

interface StudentManagementProps {
  students: Student[];
  onAddStudent: (student: Student) => void;
  onUpdateStudent: (student: Student) => void;
  onDeleteStudent: (studentId: string) => void;
}

export default function StudentManagement({
  students,
  onAddStudent,
  onUpdateStudent,
  onDeleteStudent
}: StudentManagementProps) {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isQRDialogOpen, setIsQRDialogOpen] = useState(false);
  const [selectedStudent, setSelectedStudent] = useState<Student | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    class: '',
    schoolId: ''
  });

  const handleAddStudent = (e: React.FormEvent) => {
    e.preventDefault();
    const newStudent: Student = {
      id: Date.now().toString(),
      ...formData,
      qrCode: `${formData.schoolId}-${formData.name.replace(/\s+/g, '-').toUpperCase()}`
    };
    onAddStudent(newStudent);
    setFormData({ name: '', email: '', class: '', schoolId: '' });
    setIsAddDialogOpen(false);
  };

  const handleEditStudent = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedStudent) {
      const updatedStudent: Student = {
        ...selectedStudent,
        ...formData,
        qrCode: `${formData.schoolId}-${formData.name.replace(/\s+/g, '-').toUpperCase()}`
      };
      onUpdateStudent(updatedStudent);
      setIsEditDialogOpen(false);
      setSelectedStudent(null);
    }
  };

  const openEditDialog = (student: Student) => {
    setSelectedStudent(student);
    setFormData({
      name: student.name,
      email: student.email,
      class: student.class,
      schoolId: student.schoolId
    });
    setIsEditDialogOpen(true);
  };

  const openQRDialog = (student: Student) => {
    setSelectedStudent(student);
    setIsQRDialogOpen(true);
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Student Management</CardTitle>
            <CardDescription>Manage student records and QR codes</CardDescription>
          </div>
          <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Student
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Student</DialogTitle>
                <DialogDescription>
                  Enter the student's information to create a new record.
                </DialogDescription>
              </DialogHeader>
              <form onSubmit={handleAddStudent} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="class">Class</Label>
                  <Input
                    id="class"
                    value={formData.class}
                    onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="schoolId">School ID</Label>
                  <Input
                    id="schoolId"
                    value={formData.schoolId}
                    onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                    required
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button type="submit">Add Student</Button>
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
              <TableHead>Class</TableHead>
              <TableHead>School ID</TableHead>
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {students.map((student) => (
              <TableRow key={student.id}>
                <TableCell>{student.name}</TableCell>
                <TableCell>{student.email}</TableCell>
                <TableCell>{student.class}</TableCell>
                <TableCell>{student.schoolId}</TableCell>
                <TableCell>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openQRDialog(student)}
                    >
                      <QrCode className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => openEditDialog(student)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onDeleteStudent(student.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {/* Edit Dialog */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Edit Student</DialogTitle>
              <DialogDescription>
                Update the student's information.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleEditStudent} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Full Name</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-class">Class</Label>
                <Input
                  id="edit-class"
                  value={formData.class}
                  onChange={(e) => setFormData({ ...formData, class: e.target.value })}
                  required
                />
              </div>
                              <div className="space-y-2">
                  <Label htmlFor="edit-schoolId">School ID</Label>
                  <Input
                    id="edit-schoolId"
                    value={formData.schoolId}
                    onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                    required
                  />
                </div>
              <div className="flex justify-end space-x-2">
                <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit">Update Student</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* QR Code Dialog */}
        <Dialog open={isQRDialogOpen} onOpenChange={setIsQRDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Student QR Code</DialogTitle>
              <DialogDescription>
                {selectedStudent?.name}'s QR code for attendance
              </DialogDescription>
            </DialogHeader>
            {selectedStudent && (
                             <QRCodeDisplay
                 qrCode={selectedStudent.qrCode}
                 studentName={selectedStudent.name}
                 schoolId={selectedStudent.schoolId}
               />
            )}
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
