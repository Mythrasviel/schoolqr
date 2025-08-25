import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { ArrowLeft, UserPlus } from 'lucide-react';
import { Student } from '../App';

interface StudentRegistrationProps {
  onRegister: (student: Student) => void;
  onShowLogin: () => void;
  isSchoolIdTaken: (schoolId: string) => boolean;
}

export default function StudentRegistration({
  onRegister,
  onShowLogin,
  isSchoolIdTaken
}: StudentRegistrationProps) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    schoolId: '',
    class: '',
    confirmEmail: ''
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const classes = [
    '9A', '9B', '9C',
    '10A', '10B', '10C',
    '11A', '11B', '11C',
    '12A', '12B', '12C'
  ];

  const validateForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Full name is required';
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (!formData.confirmEmail.trim()) {
      newErrors.confirmEmail = 'Please confirm your email';
    } else if (formData.email !== formData.confirmEmail) {
      newErrors.confirmEmail = 'Emails do not match';
    }

    if (!formData.schoolId.trim()) {
      newErrors.schoolId = 'School ID is required';
    } else if (formData.schoolId.length < 6) {
      newErrors.schoolId = 'School ID must be at least 6 characters';
    } else if (isSchoolIdTaken(formData.schoolId)) {
      newErrors.schoolId = 'This School ID is already registered';
    }

    if (!formData.class) {
      newErrors.class = 'Please select your class';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate registration process
    setTimeout(() => {
      const newStudent: Student = {
        id: Date.now().toString(),
        name: formData.name,
        email: formData.email,
        class: formData.class,
        schoolId: formData.schoolId,
        qrCode: `${formData.schoolId}-${formData.name.replace(/\s+/g, '-').toUpperCase()}`
      };

      onRegister(newStudent);
      setIsLoading(false);
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-muted/20 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={onShowLogin}
              className="p-1"
            >
              <ArrowLeft className="h-4 w-4" />
            </Button>
            <div className="flex-1">
              <CardTitle className="text-center">Student Registration</CardTitle>
              <CardDescription className="text-center">
                Create your student account
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                className={errors.name ? 'border-destructive' : ''}
              />
              {errors.name && (
                <p className="text-destructive text-sm">{errors.name}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="schoolId">School ID</Label>
              <Input
                id="schoolId"
                value={formData.schoolId}
                onChange={(e) => handleInputChange('schoolId', e.target.value.toUpperCase())}
                placeholder="Enter your school ID (e.g., STU2024001)"
                className={errors.schoolId ? 'border-destructive' : ''}
              />
              {errors.schoolId && (
                <p className="text-destructive text-sm">{errors.schoolId}</p>
              )}
              <p className="text-muted-foreground text-sm">
                Your unique school identification number
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="class">Class</Label>
              <Select value={formData.class} onValueChange={(value) => handleInputChange('class', value)}>
                <SelectTrigger className={errors.class ? 'border-destructive' : ''}>
                  <SelectValue placeholder="Select your class" />
                </SelectTrigger>
                <SelectContent>
                  {classes.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.class && (
                <p className="text-destructive text-sm">{errors.class}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                className={errors.email ? 'border-destructive' : ''}
              />
              {errors.email && (
                <p className="text-destructive text-sm">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="confirmEmail">Confirm Email</Label>
              <Input
                id="confirmEmail"
                type="email"
                value={formData.confirmEmail}
                onChange={(e) => handleInputChange('confirmEmail', e.target.value)}
                placeholder="Confirm your email address"
                className={errors.confirmEmail ? 'border-destructive' : ''}
              />
              {errors.confirmEmail && (
                <p className="text-destructive text-sm">{errors.confirmEmail}</p>
              )}
            </div>

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Creating Account...
                </>
              ) : (
                <>
                  <UserPlus className="h-4 w-4 mr-2" />
                  Register
                </>
              )}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-muted-foreground">
              Already have an account?{' '}
              <Button variant="link" onClick={onShowLogin} className="p-0 h-auto">
                Sign in here
              </Button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
