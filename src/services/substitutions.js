import { db } from '../firebase';
import {
    collection,
    addDoc,
    getDocs,
    getDoc,
    doc,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    Timestamp,
    getCountFromServer
} from 'firebase/firestore';

/**
 * 代課紀錄 Collection: substitutions
 * 
 * 資料結構:
 * {
 *   leaveRecordId: string,        // 關聯請假單 ID
 *   originalTeacherId: string,    // 原任教師 ID
 *   originalTeacherName: string,  // 原任教師姓名
 *   substituteTeacherId: string,  // 代課教師 ID
 *   substituteTeacherName: string,// 代課教師姓名
 *   date: Timestamp,              // 代課日期
 *   period: number,               // 第幾節 (1-7)
 *   className: string,            // 班級 "701"
 *   subject: string,              // 科目
 *   type: string,                 // '代課' | '代理'
 *   leaveType: string,            // '公假' | '事假' | '病假'
 *   hourlyRate: number,           // 鐘點費
 *   isPaid: boolean,              // 是否已核銷
 *   notes: string,                // 備註
 *   createdAt: Timestamp,
 *   updatedAt: Timestamp
 * }
 */

// 新增代課紀錄
export const addSubstitution = async (subData) => {
    try {
        const docRef = await addDoc(collection(db, 'substitutions'), {
            ...subData,
            date: Timestamp.fromDate(new Date(subData.date)),
            isPaid: subData.isPaid || false,
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding substitution: ", e);
        throw e;
    }
};

// 批次新增代課紀錄 (用於一次指派多節)
export const addSubstitutionsBatch = async (substitutionsArray) => {
    try {
        const results = [];
        for (const sub of substitutionsArray) {
            const id = await addSubstitution(sub);
            results.push(id);
        }
        return results;
    } catch (e) {
        console.error("Error batch adding substitutions: ", e);
        throw e;
    }
};

// 取得所有代課紀錄
export const getSubstitutions = async (filters = {}) => {
    try {
        let q = collection(db, 'substitutions');
        q = query(q, orderBy('date', 'desc'));

        const querySnapshot = await getDocs(q);
        let records = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                date: data.date?.toDate?.() || data.date,
                createdAt: data.createdAt?.toDate?.() || data.createdAt
            };
        });

        // 前端篩選
        if (filters.leaveRecordId) {
            records = records.filter(r => r.leaveRecordId === filters.leaveRecordId);
        }
        if (filters.substituteTeacherId) {
            records = records.filter(r => r.substituteTeacherId === filters.substituteTeacherId);
        }
        if (filters.originalTeacherId) {
            records = records.filter(r => r.originalTeacherId === filters.originalTeacherId);
        }
        if (filters.leaveType) {
            records = records.filter(r => r.leaveType === filters.leaveType);
        }
        if (filters.isPaid !== undefined) {
            records = records.filter(r => r.isPaid === filters.isPaid);
        }
        if (filters.month) {
            const year = filters.year || new Date().getFullYear();
            records = records.filter(r => {
                const d = new Date(r.date);
                return d.getMonth() + 1 === filters.month && d.getFullYear() === year;
            });
        }

        return records;
    } catch (e) {
        console.error("Error getting substitutions: ", e);
        throw e;
    }
};

// 取得單一代課紀錄
export const getSubstitutionById = async (id) => {
    try {
        const docRef = doc(db, 'substitutions', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('代課紀錄不存在');
        }

        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            date: data.date?.toDate?.() || data.date
        };
    } catch (e) {
        console.error("Error getting substitution: ", e);
        throw e;
    }
};

// 更新代課紀錄
export const updateSubstitution = async (id, data) => {
    try {
        const docRef = doc(db, 'substitutions', id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: Timestamp.now()
        });
    } catch (e) {
        console.error("Error updating substitution: ", e);
        throw e;
    }
};

// 刪除代課紀錄
export const deleteSubstitution = async (id) => {
    try {
        const docRef = doc(db, 'substitutions', id);
        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting substitution: ", e);
        throw e;
    }
};

// 取得本月代課數量 (用於儀表板)
export const getCurrentMonthSubstitutionCount = async () => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59);

        const q = query(
            collection(db, 'substitutions'),
            where('date', '>=', Timestamp.fromDate(startOfMonth)),
            where('date', '<=', Timestamp.fromDate(endOfMonth))
        );

        const snapshot = await getCountFromServer(q);
        return snapshot.data().count;
    } catch (e) {
        console.error("Error getting current month count: ", e);
        // 如果查詢失敗，嘗試取得全部並在前端過濾
        try {
            const all = await getSubstitutions({ month: now.getMonth() + 1 });
            return all.length;
        } catch {
            return 0;
        }
    }
};

// 取得教師代課統計 (用於報表)
export const getTeacherSubstitutionStats = async (teacherId, year, month) => {
    try {
        const subs = await getSubstitutions({
            substituteTeacherId: teacherId,
            year,
            month
        });

        const totalHours = subs.length;
        const totalAmount = subs.reduce((sum, s) => sum + (s.hourlyRate || 0), 0);
        const unpaidAmount = subs.filter(s => !s.isPaid).reduce((sum, s) => sum + (s.hourlyRate || 0), 0);

        return {
            totalHours,
            totalAmount,
            unpaidAmount,
            records: subs
        };
    } catch (e) {
        console.error("Error getting teacher stats: ", e);
        throw e;
    }
};
