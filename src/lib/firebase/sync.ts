import { extDb } from "./ext";

export async function syncSet(collection: string, docId: string, data: Record<string, any>) {
  const db = extDb();
  if (!db) return;

  try {
    await db.collection(collection).doc(docId).set(data, { merge: true });
  } catch (err) {
  }
}

export async function syncUpdate(
  collection: string,
  docId: string,
  data: Record<string, any>
) {
  const db = extDb();
  if (!db) return;

  try {
    await db.collection(collection).doc(docId).update(data);
  } catch (err) {
  }
}

export async function syncSetSub(
  collection: string,
  docId: string,
  sub: string,
  subDocId: string,
  data: Record<string, any>
) {
  const db = extDb();
  if (!db) return;

  try {
    await db
      .collection(collection)
      .doc(docId)
      .collection(sub)
      .doc(subDocId)
      .set(data, { merge: true });
  } catch (err) {
  }
}

export async function syncDelete(collection: string, docId: string) {
  const db = extDb();
  if (!db) return;

  try {
    await db.collection(collection).doc(docId).delete();
  } catch (err) {
  }
}
