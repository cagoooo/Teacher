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
    Timestamp
} from 'firebase/firestore';

/**
 * 請假單 Collection: leaveRecords
 * 
 * 資料結構:
 * {
 *   teacherId: string,        // 請假教師 ID
 *   teacherName: string,      // 教師姓名 (denormalized)
 *   leaveType: string,        // '公假' | '事假' | '病假'
 *   startDate: Timestamp,     // 開始日期
 *   endDate: Timestamp,       // 結束日期
 *   periods: number[],        // 受影響的節次 [1,2,3,4,5,6,7]
 *   classes: string[],        // 受影響的班級 ["701", "702"]
 *   reason: string,           // 請假原因
 *   status: string,           // 'pending' | 'approved' | 'completed' | 'cancelled'
 *   createdAt: Timestamp,
 *   updatedAt: Timestamp
 * }
 */

// 新增請假單
export const addLeaveRecord = async (leaveData) => {
    try {
        const docRef = await addDoc(collection(db, 'leaveRecords'), {
            ...leaveData,
            startDate: Timestamp.fromDate(new Date(leaveData.startDate)),
            endDate: Timestamp.fromDate(new Date(leaveData.endDate)),
            status: leaveData.status || 'pending',
            createdAt: Timestamp.now(),
            updatedAt: Timestamp.now()
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding leave record: ", e);
        throw e;
    }
};

// 取得所有請假單
export const getLeaveRecords = async (filters = {}) => {
    try {
        let q = collection(db, 'leaveRecords');

        // 基本查詢 - 依建立時間排序
        q = query(q, orderBy('createdAt', 'desc'));

        const querySnapshot = await getDocs(q);
        let records = querySnapshot.docs.map(doc => {
            const data = doc.data();
            return {
                id: doc.id,
                ...data,
                startDate: data.startDate?.toDate?.() || data.startDate,
                endDate: data.endDate?.toDate?.() || data.endDate,
                createdAt: data.createdAt?.toDate?.() || data.createdAt
            };
        });

        // 前端篩選 (避免複雜索引)
        if (filters.status) {
            records = records.filter(r => r.status === filters.status);
        }
        if (filters.leaveType) {
            records = records.filter(r => r.leaveType === filters.leaveType);
        }
        if (filters.teacherId) {
            records = records.filter(r => r.teacherId === filters.teacherId);
        }

        return records;
    } catch (e) {
        console.error("Error getting leave records: ", e);
        throw e;
    }
};

// 取得單一請假單
export const getLeaveRecordById = async (id) => {
    try {
        const docRef = doc(db, 'leaveRecords', id);
        const docSnap = await getDoc(docRef);

        if (!docSnap.exists()) {
            throw new Error('請假單不存在');
        }

        const data = docSnap.data();
        return {
            id: docSnap.id,
            ...data,
            startDate: data.startDate?.toDate?.() || data.startDate,
            endDate: data.endDate?.toDate?.() || data.endDate
        };
    } catch (e) {
        console.error("Error getting leave record: ", e);
        throw e;
    }
};

// 更新請假單
export const updateLeaveRecord = async (id, data) => {
    try {
        const docRef = doc(db, 'leaveRecords', id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: Timestamp.now()
        });
    } catch (e) {
        console.error("Error updating leave record: ", e);
        throw e;
    }
};

// 刪除請假單
export const deleteLeaveRecord = async (id) => {
    try {
        const docRef = doc(db, 'leaveRecords', id);
        await deleteDoc(docRef);
    } catch (e) {
        console.error("Error deleting leave record: ", e);
        throw e;
    }
};

// 取得待處理的請假單數量 (用於儀表板)
export const getPendingLeaveCount = async () => {
    try {
        const q = query(
            collection(db, 'leaveRecords'),
            where('status', '==', 'pending')
        );
        const snapshot = await getDocs(q);
        return snapshot.size;
    } catch (e) {
        console.error("Error getting pending count: ", e);
        return 0;
    }
};
