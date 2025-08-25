import React, { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { AlertCircle, Key, User, Shield, CheckCircle } from 'lucide-react';
import { Teacher } from '../App';
import { toast } from 'sonner';

interface TeacherProfileProps {
  teacher: Teacher;
  onChangePassword: (teacherId: string, newPassword: string) => void;
}

export default function TeacherProfile({ teacher, onChangePassword }: TeacherProfileProps) {
  const [isPasswordDialogOpen, setIsPasswordDialogOpen] = useState(false);
  const [passwordForm, setPasswordForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [passwordErrors, setPasswordErrors] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(false);

  const validatePasswordForm = () => {
    const newErrors: { [key: string]: string } = {};

    if (!passwordForm.currentPassword) {
      newErrors.currentPassword = 'Current password is required';
    } else if (passwordForm.currentPassword !== teacher.password) {
      newErrors.currentPassword = 'Current password is incorrect';
    }

    if (!passwordForm.newPassword) {
      newErrors.newPassword = 'New password is required';
    } else if (passwordForm.newPassword.length < 6) {
      newErrors.newPassword = 'Password must be at least 6 characters';
    } else if (passwordForm.newPassword === teacher.password) {
      newErrors.newPassword = 'New password must be different from current password';
    }

    if (!passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your new password';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }

    setPasswordErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validatePasswordForm()) {
      return;
    }

    setIsLoading(true);

    // Simulate password change process
    setTimeout(() => {
      onChangePassword(teacher.id, passwordForm.newPassword);
      setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
      setIsPasswordDialogOpen(false);
      setIsLoading(false);
      
      toast.success('Password changed successfully', {
        description: 'Your password has been updated'
      });
    }, 1000);
  };

  const handleInputChange = (field: string, value: string) => {
    setPasswordForm(prev => ({ ...prev, [field]: value }));
    if (passwordErrors[field]) {
      setPasswordErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const resetPasswordForm = () => {
    setPasswordForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    setPasswordErrors({});
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>Your account details and information</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label className="text-sm">Full Name</Label>
              <p className="p-2 bg-muted rounded">{teacher.name}</p>
            </div>
            <div>
              <Label className="text-sm">Email Address</Label>
              <p className="p-2 bg-muted rounded">{teacher.email}</p>
            </div>
            <div>
              <Label className="text-sm">Subject</Label>
              <p className="p-2 bg-muted rounded">{teacher.subject || 'Not specified'}</p>
            </div>
            <div>
              <Label className="text-sm">Account Created By</Label>
              <p className="p-2 bg-muted rounded text-sm">{teacher.createdBy}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Security Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Security Settings
          </CardTitle>
          <CardDescription>Manage your account security and password</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Default Password Warning */}
          {teacher.isDefaultPassword && (
            <div className="flex items-start gap-3 p-4 border-2 border-orange-200 bg-orange-50 rounded-lg">
              <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
              <div>
                <p className="text-orange-800">Default Password Warning</p>
                <p className="text-sm text-orange-600 mt-1">
                  You are currently using the default password. Please change it to secure your account.
                </p>
              </div>
            </div>
          )}

          {/* Password Status */}
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div className="flex items-center gap-3">
              <Key className="h-5 w-5 text-muted-foreground" />
              <div>
                <p>Password</p>
                <p className="text-sm text-muted-foreground">
                  {teacher.isDefaultPassword ? 'Using default password' : 'Custom password set'}
                </p>
              </div>
            </div>
            <Dialog open={isPasswordDialogOpen} onOpenChange={(open) => {
              setIsPasswordDialogOpen(open);
              if (open) resetPasswordForm();
            }}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  Change Password
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Change Password</DialogTitle>
                  <DialogDescription>
                    Create a new password for your account. Make sure it's secure and memorable.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handlePasswordChange} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="current-password">Current Password</Label>
                    <Input
                      id="current-password"
                      type="password"
                      value={passwordForm.currentPassword}
                      onChange={(e) => handleInputChange('currentPassword', e.target.value)}
                      className={passwordErrors.currentPassword ? 'border-destructive' : ''}
                      placeholder="Enter your current password"
                    />
                    {passwordErrors.currentPassword && (
                      <p className="text-destructive text-sm">{passwordErrors.currentPassword}</p>
                    )}
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="new-password">New Password</Label>
                    <Input
                      id="new-password"
                      type="password"
                      value={passwordForm.newPassword}
                      onChange={(e) => handleInputChange('newPassword', e.target.value)}
                      className={passwordErrors.newPassword ? 'border-destructive' : ''}
                      placeholder="Enter your new password"
                    />
                    {passwordErrors.newPassword && (
                      <p className="text-destructive text-sm">{passwordErrors.newPassword}</p>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Password must be at least 6 characters long
                    </p>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="confirm-password">Confirm New Password</Label>
                    <Input
                      id="confirm-password"
                      type="password"
                      value={passwordForm.confirmPassword}
                      onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
                      className={passwordErrors.confirmPassword ? 'border-destructive' : ''}
                      placeholder="Confirm your new password"
                    />
                    {passwordErrors.confirmPassword && (
                      <p className="text-destructive text-sm">{passwordErrors.confirmPassword}</p>
                    )}
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button 
                      type="button" 
                      variant="outline" 
                      onClick={() => setIsPasswordDialogOpen(false)}
                      disabled={isLoading}
                    >
                      Cancel
                    </Button>
                    <Button type="submit" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Changing...
                        </>
                      ) : (
                        <>
                          <CheckCircle className="h-4 w-4 mr-2" />
                          Change Password
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Password Security Tips */}
          <div className="p-4 bg-muted/50 rounded-lg">
            <h4 className="mb-2">Password Security Tips</h4>
            <div className="text-sm text-muted-foreground space-y-1">
              <p>• Use at least 6 characters (longer is better)</p>
              <p>• Include a mix of letters, numbers, and symbols</p>
              <p>• Don't use personal information like your name or email</p>
              <p>• Don't reuse passwords from other accounts</p>
              <p>• Change your password regularly</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
