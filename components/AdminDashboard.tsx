import React, { useState } from 'react';
import { Button } from './ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from './ui/tabs';
import { LogOut, Users, BarChart, UserPlus } from 'lucide-react';
import { User, Student, Teacher, AttendanceRecord } from '../App';
import TeacherManagement from './TeacherManagement';
import AttendanceReports from './AttendanceReports';

interface AdminDashboardProps {
  user: User;
  students: Student[];
  teachers: Teacher[];
  attendanceRecords: AttendanceRecord[];
  onLogout: () => void;
  onAddTeacher: (teacher: Teacher) => void;
  onUpdateTeacher: (teacher: Teacher) => void;
  onDeleteTeacher: (teacherId: string) => void;
  onDeleteStudent: (studentId: string) => void;
}

export default function AdminDashboard({
  user,
  students,
  teachers,
  attendanceRecords,
  onLogout,
  onAddTeacher,
  onUpdateTeacher,
  onDeleteTeacher,
  onDeleteStudent
}: AdminDashboardProps) {
  const [activeTab, setActiveTab] = useState('overview');

  const todayAttendance = attendanceRecords.filter(
    record => record.date === new Date().toISOString().split('T')[0]
  );

  const attendanceRate = students.length > 0 
    ? (todayAttendance.length / students.length * 100).toFixed(1)
    : '0';

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div>
            <h1>Admin Dashboard</h1>
            <p className="text-muted-foreground">Welcome back, {user.name}</p>
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
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="teachers">Teachers</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
            <TabsTrigger value="reports">Reports</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <div className="grid gap-4 md:grid-cols-4">
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
                  <CardTitle className="text-sm">Teachers</CardTitle>
                  <UserPlus className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{teachers.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Active teachers
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Today's Attendance</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{todayAttendance.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Students present today
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm">Attendance Rate</CardTitle>
                  <BarChart className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl">{attendanceRate}%</div>
                  <p className="text-xs text-muted-foreground">
                    Today's attendance rate
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>Latest attendance records</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {attendanceRecords.slice(-5).reverse().map((record) => (
                    <div key={record.id} className="flex items-center justify-between p-2 rounded border">
                      <div>
                        <p>{record.studentName}</p>
                        <p className="text-sm text-muted-foreground">{record.date} at {record.time}</p>
                      </div>
                      <div className="text-sm text-green-600">Present</div>
                    </div>
                  ))}
                  {attendanceRecords.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">No attendance records yet</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="teachers">
            <TeacherManagement
              teachers={teachers}
              onAddTeacher={onAddTeacher}
              onUpdateTeacher={onUpdateTeacher}
              onDeleteTeacher={onDeleteTeacher}
              adminEmail={user.email}
            />
          </TabsContent>

          <TabsContent value="students">
            <Card>
              <CardHeader>
                <CardTitle>Registered Students</CardTitle>
                <CardDescription>Students who have self-registered in the system</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {students.map((student) => (
                    <div key={student.id} className="flex items-center justify-between p-3 rounded border">
                      <div>
                        <p>{student.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {student.schoolId} - {student.class} - {student.email}
                        </p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => onDeleteStudent(student.id)}
                        className="text-destructive hover:text-destructive"
                      >
                        Remove
                      </Button>
                    </div>
                  ))}
                  {students.length === 0 && (
                    <p className="text-muted-foreground text-center py-4">
                      No students registered yet
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="reports">
            <AttendanceReports
              students={students}
              attendanceRecords={attendanceRecords}
            />
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
