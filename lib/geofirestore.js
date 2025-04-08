import { getFirestore } from "firebase/firestore";
import { GeoFirestore } from "geofirestore";

const firestore = getFirestore();
const geoFirestore = new GeoFirestore(firestore);

export default geoFirestore;

