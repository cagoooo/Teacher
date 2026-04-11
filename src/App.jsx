import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import Layout from './components/Layout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import TeacherList from './pages/TeacherList';
import AddTeacher from './pages/AddTeacher';
import OfficialSubstitute from './pages/OfficialSubstitute';
import PersonalSubstitute from './pages/PersonalSubstitute';
import OvertimeTeachers from './pages/OvertimeTeachers';
import HourlyTeachersSchedule from './pages/HourlyTeachersSchedule';
import LeaveStats from './pages/LeaveStats';
import SubStats from './pages/SubStats';
import OfficialProxy from './pages/OfficialProxy';
import PersonalProxy from './pages/PersonalProxy';

const PrivateRoute = ({ children }) => {
    const { currentUser } = useAuth();
    return currentUser ? children : <Navigate to="/login" />;
};

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Routes>
                    <Route path="/login" element={<Login />} />

                    <Route path="/" element={
                        <PrivateRoute>
                            <Layout />
                        </PrivateRoute>
                    }>
                        <Route index element={<Dashboard />} />

                        {/* 派代管理路由 */}
                        <Route path="official-sub" element={<OfficialSubstitute />} />
                        <Route path="official-proxy" element={<OfficialProxy />} />
                        <Route path="personal-sub" element={<PersonalSubstitute />} />
                        <Route path="personal-proxy" element={<PersonalProxy />} />
                        <Route path="overtime-teachers" element={<OvertimeTeachers />} />
                        <Route path="hourly-teachers-schedule" element={<HourlyTeachersSchedule />} />

                        {/* 教師管理路由 */}
                        <Route path="hourly-teachers" element={<TeacherList />} />
                        <Route path="teachers" element={<TeacherList />} />
                        <Route path="teachers/new" element={<AddTeacher />} />

                        {/* 統計報表路由 */}
                        <Route path="stats/leave" element={<LeaveStats />} />
                        <Route path="stats/sub" element={<SubStats />} />
                    </Route>
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
