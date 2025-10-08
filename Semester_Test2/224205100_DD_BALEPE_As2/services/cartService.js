import { database } from '../firebase';
import { ref, set, get, update, remove, onValue, off } from 'firebase/database';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CART_STORAGE_KEY = 'shopez_cart';

export const addToCart = async (userId, productId, product) => {
  try {
    const cartRef = ref(database, `carts/${userId}/${productId}`);
    const snapshot = await get(cartRef);
    
    if (snapshot.exists()) {
      const currentData = snapshot.val();
      await update(cartRef, {
        quantity: currentData.quantity + 1
      });
    } else {
      await set(cartRef, {
        ...product,
        quantity: 1,
        addedAt: Date.now()
      });
    }

    await updateLocalCart(userId, productId, product, 'add');
  } catch (error) {
    throw error;
  }
};

export const getCart = (userId, callback) => {
  const cartRef = ref(database, `carts/${userId}`);
  
  const unsubscribe = onValue(cartRef, (snapshot) => {
    const cartData = snapshot.val() || {};
    const cartItems = Object.keys(cartData).map(key => ({
      id: key,
      ...cartData[key]
    }));
    callback(cartItems);
  });

  return unsubscribe;
};

export const updateCartItemQuantity = async (userId, productId, newQuantity) => {
  try {
    if (newQuantity <= 0) {
      await removeFromCart(userId, productId);
      return;
    }

    const cartRef = ref(database, `carts/${userId}/${productId}`);
    await update(cartRef, {
      quantity: newQuantity
    });

    await updateLocalCart(userId, productId, null, 'update', newQuantity);
  } catch (error) {
    throw error;
  }
};

export const removeFromCart = async (userId, productId) => {
  try {
    const cartRef = ref(database, `carts/${userId}/${productId}`);
    await remove(cartRef);

    await updateLocalCart(userId, productId, null, 'remove');
  } catch (error) {
    throw error;
  }
};

const updateLocalCart = async (userId, productId, product, action, newQuantity = null) => {
  try {
    const key = `${CART_STORAGE_KEY}_${userId}`;
    const localCart = await getLocalCart(userId);
    
    let updatedCart = { ...localCart };
    
    switch (action) {
      case 'add':
        if (updatedCart[productId]) {
          updatedCart[productId].quantity += 1;
        } else {
          updatedCart[productId] = { ...product, quantity: 1 };
        }
        break;
      case 'update':
        if (updatedCart[productId]) {
          updatedCart[productId].quantity = newQuantity;
        }
        break;
      case 'remove':
        delete updatedCart[productId];
        break;
    }

    await AsyncStorage.setItem(key, JSON.stringify(updatedCart));
  } catch (error) {
    console.error('Error updating local cart:', error);
  }
};

export const getLocalCart = async (userId) => {
  try {
    const key = `${CART_STORAGE_KEY}_${userId}`;
    const cartJson = await AsyncStorage.getItem(key);
    return cartJson ? JSON.parse(cartJson) : {};
  } catch (error) {
    console.error('Error getting local cart:', error);
    return {};
  }
};

export const syncLocalCartToServer = async (userId) => {
  try {
    const localCart = await getLocalCart(userId);
    const cartRef = ref(database, `carts/${userId}`);
    
    await set(cartRef, localCart);
    
    const key = `${CART_STORAGE_KEY}_${userId}`;
    await AsyncStorage.removeItem(key);
  } catch (error) {
    console.error('Error syncing local cart to server:', error);
  }
};