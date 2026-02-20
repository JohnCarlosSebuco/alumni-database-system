import {
  getFirestore,
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  DocumentSnapshot,
  QuerySnapshot,
  DocumentData,
  QueryDocumentSnapshot,
  CollectionReference,
  Query,
  writeBatch,
  increment,
} from "firebase/firestore";
import app from "./config";

export const db = getFirestore(app);

export {
  collection,
  doc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  addDoc,
  query,
  where,
  orderBy,
  limit,
  startAfter,
  onSnapshot,
  serverTimestamp,
  Timestamp,
  writeBatch,
  increment,
};

export type {
  DocumentSnapshot,
  QuerySnapshot,
  DocumentData,
  QueryDocumentSnapshot,
  CollectionReference,
  Query,
};

// Typed helpers
export function userDocRef(uid: string) {
  return doc(db, "users", uid);
}

export function profileDocRef(uid: string) {
  return doc(db, "users", uid, "profile", "data");
}

export function jobsRef() {
  return collection(db, "jobs");
}

export function jobRef(jobId: string) {
  return doc(db, "jobs", jobId);
}

export function applicantsRef(jobId: string) {
  return collection(db, "jobs", jobId, "applicants");
}

export function applicantRef(jobId: string, userId: string) {
  return doc(db, "jobs", jobId, "applicants", userId);
}

export function eventsRef() {
  return collection(db, "events");
}

export function eventRef(eventId: string) {
  return doc(db, "events", eventId);
}

export function attendeesRef(eventId: string) {
  return collection(db, "events", eventId, "attendees");
}

export function attendeeRef(eventId: string, userId: string) {
  return doc(db, "events", eventId, "attendees", userId);
}

export function notificationsRef() {
  return collection(db, "notifications");
}

export function notifStatusRef(uid: string) {
  return collection(db, "users", uid, "notifStatus");
}

export function notifStatusDoc(uid: string, notifId: string) {
  return doc(db, "users", uid, "notifStatus", notifId);
}

export function departmentsRef() {
  return collection(db, "departments");
}
