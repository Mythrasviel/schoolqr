import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { User, Student, Teacher } from '../App';

interface LoginPageProps {
  onLogin: (user: User) => void;
  onShowRegister: () => void;
  students: Student[];
  teachers: Teacher[];
}

export default function LoginPage({ onLogin, onShowRegister, students, teachers }: LoginPageProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState<'admin' | 'teacher' | 'student'>('student');
  const [error, setError] = useState('');

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    // Mock authentication - in real app, this would connect to backend
    if (role === 'admin') {
      if (email === 'admin@school.edu' && password === 'admin123') {
        onLogin({
          id: 'admin1',
          name: 'School Administrator',
          email: 'admin@school.edu',
          role: 'admin'
        });
      } else {
        setError('Invalid admin credentials');
      }
    } else if (role === 'teacher') {
      const teacher = teachers.find(t => t.email === email);
      if (teacher && teacher.password === password) {
        onLogin({
          id: teacher.id,
          name: teacher.name,
          email: teacher.email,
          role: 'teacher'
        });
      } else {
        setError('Invalid teacher email or password');
      }
    } else if (role === 'student') {
      const student = students.find(s => s.email === email);
      if (student && password === 'student123') {
        onLogin({
          id: student.id,
          name: student.name,
          email: student.email,
          role: 'student',
          qrCode: student.qrCode
        });
      } else {
        setError('Invalid student credentials or account not found');
      }
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <CardTitle className="text-center">Attendance Management System</CardTitle>
          <CardDescription className="text-center">
            Sign in to your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleLogin} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="role">I am a</Label>
              <Select value={role} onValueChange={(value: 'admin' | 'teacher' | 'student') => setRole(value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrator</SelectItem>
                  <SelectItem value="teacher">Teacher</SelectItem>
                  <SelectItem value="student">Student</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            {error && (
              <div className="text-destructive text-sm">{error}</div>
            )}

            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

          {role === 'student' && (
            <div className="mt-4 text-center">
              <p className="text-sm text-muted-foreground">
                Don't have an account?{' '}
                <Button variant="link" onClick={onShowRegister} className="p-0 h-auto">
                  Register as Student
                </Button>
              </p>
            </div>
          )}


        </CardContent>
      </Card>
    </div>
  );
}
