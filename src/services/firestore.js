import { db } from '../firebase';
import { collection, addDoc, getDocs, query, orderBy, doc, updateDoc, deleteDoc } from 'firebase/firestore';

export const addTeacher = async (teacherData) => {
    try {
        const docRef = await addDoc(collection(db, 'teachers'), {
            ...teacherData,
            createdAt: new Date()
        });
        return docRef.id;
    } catch (e) {
        console.error("Error adding document: ", e);
        throw e;
    }
};

export const getTeachers = async () => {
    try {
        const q = query(collection(db, 'teachers'), orderBy('createdAt', 'desc'));
        const querySnapshot = await getDocs(q);
        return querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    } catch (e) {
        console.error("Error getting documents: ", e);
        throw e;
    }
};

export const updateTeacher = async (id, teacherData) => {
    try {
        const teacherRef = doc(db, 'teachers', id);
        await updateDoc(teacherRef, {
            ...teacherData,
            updatedAt: new Date()
        });
    } catch (e) {
        console.error("Error updating document: ", e);
        throw e;
    }
};

export const deleteTeacher = async (id) => {
    try {
        const teacherRef = doc(db, 'teachers', id);
        await deleteDoc(teacherRef);
    } catch (e) {
        console.error("Error deleting document: ", e);
        throw e;
    }
};
