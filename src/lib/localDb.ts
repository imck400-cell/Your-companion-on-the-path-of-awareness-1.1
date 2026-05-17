export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getFromStorage = (key: string) => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : null;
};

export const saveToStorage = (key: string, data: any) => {
  localStorage.setItem(key, JSON.stringify(data));
};

export const localDb = {
  getCollection: (collectionName: string) => {
    return getFromStorage(collectionName) || [];
  },
  
  getDoc: (collectionName: string, id: string) => {
    const docs = getFromStorage(collectionName) || [];
    return docs.find((d: any) => d.id === id) || null;
  },
  
  addDoc: (collectionName: string, data: any) => {
    const docs = getFromStorage(collectionName) || [];
    const newDoc = { 
      ...data, 
      id: generateId(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    docs.push(newDoc);
    saveToStorage(collectionName, docs);
    return newDoc;
  },
  
  updateDoc: (collectionName: string, id: string, data: any) => {
    const docs = getFromStorage(collectionName) || [];
    const index = docs.findIndex((d: any) => d.id === id);
    if (index !== -1) {
      docs[index] = { ...docs[index], ...data, updatedAt: new Date().toISOString() };
      saveToStorage(collectionName, docs);
      return docs[index];
    }
    return null;
  },
  
  deleteDoc: (collectionName: string, id: string) => {
    const docs = getFromStorage(collectionName) || [];
    const newDocs = docs.filter((d: any) => d.id !== id);
    saveToStorage(collectionName, newDocs);
  },
  
  setDoc: (collectionName: string, id: string, data: any) => {
    const docs = getFromStorage(collectionName) || [];
    const index = docs.findIndex((d: any) => d.id === id);
    const newDoc = { 
      ...data, 
      id,
      updatedAt: new Date().toISOString()
    };
    if (index !== -1) {
      docs[index] = { ...docs[index], ...newDoc };
    } else {
      newDoc.createdAt = new Date().toISOString();
      docs.push(newDoc);
    }
    saveToStorage(collectionName, docs);
    return newDoc;
  }
};
