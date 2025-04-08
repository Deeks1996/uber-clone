import geoFirestore from './geofirestore';

export const findNearbyDrivers = async (pickupLat, pickupLng) => {
  const query = geoFirestore.collection('drivers').near({
    center: new firebase.firestore.GeoPoint(pickupLat, pickupLng),
    radius: 5 // in kilometers
  });

  const snapshot = await query.get();
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
};
