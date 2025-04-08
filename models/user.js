import { doc, setDoc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export const createUser = async (userId, name, email, phone, role = "user") => {
  const userRef = doc(db, "users", userId);
  await setDoc(userRef, {
    name,
    email,
    phone,
    role,
    createdAt: new Date(),
  });
};

export const getUser = async (userId) => {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  return userSnap.exists() ? userSnap.data() : null;
};
