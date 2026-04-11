import { db } from '../firebase';
import { collection, getCountFromServer, query, where } from 'firebase/firestore';
import { getCurrentMonthSubstitutionCount } from './substitutions';
import { getPendingLeaveCount } from './leaveRecords';

export const getDashboardStats = async () => {
    try {
        const teachersColl = collection(db, 'teachers');

        // Total Teachers
        const totalSnapshot = await getCountFromServer(teachersColl);
        const totalTeachers = totalSnapshot.data().count;

        // Teachers by Role (Count '專任教師')
        const fullTimeQuery = query(teachersColl, where("role", "==", "專任教師"));
        const fullTimeSnapshot = await getCountFromServer(fullTimeQuery);
        const fullTimeTeachers = fullTimeSnapshot.data().count;

        // 本月代課統計 (從 substitutions Collection 取得)
        let currentMonthSubstitutes = 0;
        try {
            currentMonthSubstitutes = await getCurrentMonthSubstitutionCount();
        } catch (e) {
            console.warn("Could not get substitution count:", e);
        }

        // 待處理申請 (從 leaveRecords Collection 取得)
        let pendingApplications = 0;
        try {
            pendingApplications = await getPendingLeaveCount();
        } catch (e) {
            console.warn("Could not get pending count:", e);
        }

        return {
            totalTeachers,
            fullTimeTeachers,
            currentMonthSubstitutes,
            pendingApplications
        };
    } catch (error) {
        console.error("Error fetching dashboard stats:", error);
        throw error;
    }
};
