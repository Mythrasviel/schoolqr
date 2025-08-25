import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LogOut, QrCode, Users, Clock, CheckCircle, User, AlertCircle } from 'lucide-react';
import { User as UserType, Student, AttendanceRecord, Teacher } from '../App';
import CombinedQRScanner from './CombinedQRScanner';
import TeacherProfile from './TeacherProfile';

interface TeacherDashboardProps {
  user: UserType;
  teacher: Teacher | undefined;
  students: Student[];
  attendanceRecords: AttendanceRecord[];
  onLogout: () => void;
  onMarkAttendance: (studentId: string, studentName: string, markedBy: string) => void;
  onChangePassword: (teacherId: string, newPassword: string) => void;
}

export default function TeacherDashboard({
  user,
  teacher,
  students,
  attendanceRecords,
  onLogout,
  onMarkAttendance,
  onChangePassword
}: TeacherDashboardProps) {
  const [activeTab, setActiveTab] = useState('scan');

  // If teacher data is not found, show error
  if (!teacher) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Card className="w-full max-w-md">
          <CardContent className="p-6 text-center">
            <AlertCircle className="h-8 w-8 mx-auto mb-4 text-destructive" />
            <h3 className="mb-2">Account Error</h3>
            <p className="text-muted-foreground mb-4">
              Unable to load teacher account information. Please contact the administrator.
            </p>
            <Button onClick={onLogout}>Back to Login</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const todayAttendance = attendanceRecords.filter(
    record => record.date === new Date().toISOString().split('T')[0]
  );

  const attendanceRate = students.length > 0 
    ? (todayAttendance.length / students.length * 100).toFixed(1)
    : '0';

  // Get attendance for today, organized by time
  const todayAttendanceByTime = todayAttendance
    .sort((a, b) => b.time.localeCompare(a.time))
    .slice(0, 10); // Show latest 10

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1>Teacher Dashboard</h1>
            <div className="flex items-center gap-2">
              <p className="text-muted-foreground">Welcome back, {user.name}</p>
              {teacher.isDefaultPassword && (
                <div className="flex items-center gap-1 bg-orange-100 text-orange-800 px-2 py-1 rounded text-xs">
                  <AlertCircle className="h-3 w-3" />
                  Default Password
                </div>
              )}
            </div>
          </div>
          <Button variant="outline" onClick={onLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Logout
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="scan">QR Scanner</TabsTrigger>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="attendance">Today's Attendance</TabsTrigger>
            <TabsTrigger value="profile" className="flex items-center gap-2">
              <User className="h-4 w-4" />
              Profile
              {teacher.isDefaultPassword && (
                <div className="w-2 h-2 bg-orange-500 rounded-full"></div>
              )}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="scan">
            <CombinedQRScanner
              students={students}
              onMarkAttendance={onMarkAttendance}
              markedBy={user.email}
            />
          </TabsContent>

          <TabsContent value="overview" className="space-y-6">
            {/* Default Password Alert */}
            {teacher.isDefaultPassword && (
              <Card className="border-2 border-orange-200 bg-orange-50">
                <CardContent className="p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-orange-600 mt-0.5" />
                    <div>
                      <p className="text-orange-800">Security Reminder</p>
                      <p className="text-sm text-orange-600 mt-1">
                        You're using the default password. Please update it in your{' '}
                        <Button 
                          variant="link" 
                          className="p-0 h-auto text-orange-600 underline"
                          onClick={() => setActiveTab('profile')}
                        >
                          profile settings
                        </Button>
                        {' '}for better security.
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Stats Cards */}
            <div className="grid gap-4 md:grid-cols-3">
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Total Students</CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{students.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Registered students
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Present Today</CardTitle>
                  <CheckCircle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl text-green-600">{todayAttendance.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Students marked present
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Attendance Rate</CardTitle>
                  <Clock className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{attendanceRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    Today's attendance rate
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Attendance Marks</CardTitle>
                <CardDescription>Latest students marked present today</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {todayAttendanceByTime.map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-3 rounded border">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                        <div>
                          <p>{record.studentName}</p>
                          <p className="text-sm text-muted-foreground">
                            {students.find(s => s.id === record.studentId)?.schoolId} - 
                            {students.find(s => s.id === record.studentId)?.class}
                          </p>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {record.time}
                      </div>
                    </div>
                  ))}
                  {todayAttendance.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <QrCode className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No attendance marked yet today</p>
                      <p className="text-sm">Use the QR scanner to mark student attendance</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Scanning Methods Info */}
            <Card>
              <CardHeader>
                <CardTitle>Scanning Methods</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid gap-4 md:grid-cols-2">
                  <div className="p-4 border rounded-lg">
                    <h4 className="flex items-center gap-2 mb-2">
                      <QrCode className="h-4 w-4" />
                      Camera Scanner
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Fastest and most convenient</p>
                      <p>• Works with device camera</p>
                      <p>• Automatic QR code detection</p>
                      <p>• Requires camera permissions</p>
                    </div>
                  </div>
                  
                  <div className="p-4 border rounded-lg">
                    <h4 className="flex items-center gap-2 mb-2">
                      <Users className="h-4 w-4" />
                      Manual Input
                    </h4>
                    <div className="text-sm text-muted-foreground space-y-1">
                      <p>• Backup when camera fails</p>
                      <p>• Students read QR code aloud</p>
                      <p>• Works without camera access</p>
                      <p>• Reliable in any lighting</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="attendance">
            <Card>
              <CardHeader>
                <CardTitle>Today's Attendance Status</CardTitle>
                <CardDescription>
                  {new Date().toLocaleDateString()} - All students and their attendance status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {students.map((student) => {
                    const attendance = todayAttendance.find(r => r.studentId === student.id);
                    return (
                      <div key={student.id} className="flex items-center justify-between p-3 rounded border">
                        <div className="flex items-center gap-3">
                          <div className={`w-2 h-2 rounded-full ${attendance ? 'bg-green-500' : 'bg-red-500'}`}></div>
                          <div>
                            <p>{student.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {student.schoolId} - {student.class}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          {attendance ? (
                            <div>
                              <div className="text-green-600 text-sm">Present</div>
                              <div className="text-xs text-muted-foreground">{attendance.time}</div>
                            </div>
                          ) : (
                            <div className="text-red-600 text-sm">Absent</div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                  
                  {students.length === 0 && (
                    <div className="text-center py-8 text-muted-foreground">
                      <Users className="h-8 w-8 mx-auto mb-2 opacity-50" />
                      <p>No students registered yet</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profile">
            <TeacherProfile
              teacher={teacher}
              onChangePassword={onChangePassword}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
