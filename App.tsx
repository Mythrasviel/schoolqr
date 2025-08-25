import React, { useState, useEffect } from 'react';
import LoginPage from './components/LoginPage';
import StudentRegistration from './components/StudentRegistration';
import AdminDashboard from './components/AdminDashboard';
import TeacherDashboard from './components/TeacherDashboard';
import StudentDashboard from './components/StudentDashboard';

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'teacher' | 'student';
  qrCode?: string;
}

export interface Student {
  id: string;
  name: string;
  email: string;
  class: string;
  schoolId: string; // Changed from rollNumber to schoolId
  qrCode: string;
}

export interface Teacher {
  id: string;
  name: string;
  email: string;
  subject?: string;
  createdBy: string;
  password: string;
  isDefaultPassword: boolean; // Track if using default password
}

export interface AttendanceRecord {
  id: string;
  studentId: string;
  studentName: string;
  date: string;
  time: string;
  status: 'present' | 'absent';
  markedBy: string;
}

export default function App() {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [currentView, setCurrentView] = useState<'login' | 'register'>('login');
  
  const [students, setStudents] = useState<Student[]>([
    {
      id: '1',
      name: 'John Doe',
      email: 'john.doe@student.edu',
      class: '10A',
      schoolId: 'STU2024001',
      qrCode: 'STU2024001-JOHN-DOE'
    },
    {
      id: '2',
      name: 'Jane Smith',
      email: 'jane.smith@student.edu',
      class: '10A',
      schoolId: 'STU2024002',
      qrCode: 'STU2024002-JANE-SMITH'
    },
    {
      id: '3',
      name: 'Mike Johnson',
      email: 'mike.johnson@student.edu',
      class: '10B',
      schoolId: 'STU2024003',
      qrCode: 'STU2024003-MIKE-JOHNSON'
    }
  ]);

  const [teachers, setTeachers] = useState<Teacher[]>([
    {
      id: 'teacher1',
      name: 'John Teacher',
      email: 'teacher@school.edu',
      subject: 'Mathematics',
      createdBy: 'admin@school.edu',
      password: 'teacher123',
      isDefaultPassword: true
    }
  ]);

  const [attendanceRecords, setAttendanceRecords] = useState<AttendanceRecord[]>([
    {
      id: '1',
      studentId: '1',
      studentName: 'John Doe',
      date: '2024-08-24',
      time: '09:00',
      status: 'present',
      markedBy: 'teacher@school.edu'
    },
    {
      id: '2',
      studentId: '2',
      studentName: 'Jane Smith',
      date: '2024-08-24',
      time: '09:02',
      status: 'present',
      markedBy: 'teacher@school.edu'
    }
  ]);

  const handleLogin = (user: User) => {
    setCurrentUser(user);
    setCurrentView('login');
  };

  const handleLogout = () => {
    setCurrentUser(null);
    setCurrentView('login');
  };

  const handleShowRegister = () => {
    setCurrentView('register');
  };

  const handleShowLogin = () => {
    setCurrentView('login');
  };

  const handleStudentRegistration = (student: Student) => {
    setStudents(prev => [...prev, student]);
    setCurrentView('login');
  };

  const isSchoolIdTaken = (schoolId: string) => {
    return students.some(s => s.schoolId === schoolId);
  };

  const markAttendance = (studentId: string, studentName: string, markedBy: string) => {
    const now = new Date();
    const newRecord: AttendanceRecord = {
      id: Date.now().toString(),
      studentId,
      studentName,
      date: now.toISOString().split('T')[0],
      time: now.toTimeString().split(' ')[0].substring(0, 5),
      status: 'present',
      markedBy
    };
    setAttendanceRecords(prev => [...prev, newRecord]);
  };

  const addTeacher = (teacher: Teacher) => {
    // Set default password for new teachers
    const newTeacher = {
      ...teacher,
      password: 'teacher123',
      isDefaultPassword: true
    };
    setTeachers(prev => [...prev, newTeacher]);
  };

  const updateTeacher = (updatedTeacher: Teacher) => {
    setTeachers(prev => prev.map(t => t.id === updatedTeacher.id ? updatedTeacher : t));
  };

  const deleteTeacher = (teacherId: string) => {
    setTeachers(prev => prev.filter(t => t.id !== teacherId));
  };

  const deleteStudent = (studentId: string) => {
    setStudents(prev => prev.filter(s => s.id !== studentId));
    setAttendanceRecords(prev => prev.filter(r => r.studentId !== studentId));
  };

  const changeTeacherPassword = (teacherId: string, newPassword: string) => {
    setTeachers(prev => prev.map(t => 
      t.id === teacherId 
        ? { ...t, password: newPassword, isDefaultPassword: false }
        : t
    ));
  };

  const getCurrentTeacher = () => {
    if (currentUser?.role === 'teacher') {
      return teachers.find(t => t.email === currentUser.email);
    }
    return null;
  };

  if (!currentUser) {
    if (currentView === 'register') {
      return (
        <StudentRegistration
          onRegister={handleStudentRegistration}
          onShowLogin={handleShowLogin}
          isSchoolIdTaken={isSchoolIdTaken}
        />
      );
    }
    return (
      <LoginPage
        onLogin={handleLogin}
        onShowRegister={handleShowRegister}
        students={students}
        teachers={teachers}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {currentUser.role === 'admin' && (
        <AdminDashboard
          user={currentUser}
          students={students}
          teachers={teachers}
          attendanceRecords={attendanceRecords}
          onLogout={handleLogout}
          onAddTeacher={addTeacher}
          onUpdateTeacher={updateTeacher}
          onDeleteTeacher={deleteTeacher}
          onDeleteStudent={deleteStudent}
        />
      )}
      {currentUser.role === 'teacher' && (
        <TeacherDashboard
          user={currentUser}
          teacher={getCurrentTeacher()}
          students={students}
          attendanceRecords={attendanceRecords}
          onLogout={handleLogout}
          onMarkAttendance={markAttendance}
          onChangePassword={changeTeacherPassword}
        />
      )}
      {currentUser.role === 'student' && (
        <StudentDashboard
          user={currentUser}
          attendanceRecords={attendanceRecords.filter(r => r.studentId === currentUser.id)}
          onLogout={handleLogout}
        />
      )}
    </div>
  );
}