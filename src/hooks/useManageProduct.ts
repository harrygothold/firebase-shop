import { useState } from 'react';
import { AddProductData, Product, UploadProduct } from '../types';
import { useAsyncCall } from './useAsyncCall';
import { createImageRef, productsRef } from '../firebase';
import { firebase, storageRef } from '../firebase/config';

export const useManageProduct = () => {
  const [uploadProgression, setUploadProgression] = useState(0);
  const [addProductFinished, setAddProductFinished] = useState(false);
  const [editProductFinished, setEditProductFinished] = useState(false);
  const { loading, setLoading, error, setError } = useAsyncCall();

  const uploadImageToStorage = (
    image: File,
    cb: (imageUrl: string, imagePath: string) => void
  ) => {
    setLoading(true);
    const imageRef = createImageRef(image.name);
    const uploadTask = imageRef.put(image);

    uploadTask.on(
      'state_change',
      (snapshot) => {
        // calculate upload progression
        const progression =
          (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        setUploadProgression(progression);
      },
      (err) => {
        setError(err.message);
        setLoading(false);
      },
      () => {
        // success

        // get image url
        uploadTask.snapshot.ref
          .getDownloadURL()
          .then((imageUrl) => {
            cb(imageUrl, imageRef.fullPath);
          })
          .catch((err) => {
            const { message } = err as { message: string };
            setError(message);
            setLoading(false);
          });
      }
    );
  };

  const addNewProduct = (data: AddProductData, creator: string) => (
    imageUrl: string,
    imagePath: string
  ) => {
    const {
      title,
      description,
      price,
      category,
      inventory,
      imageFileName,
    } = data;
    setLoading(true);
    setAddProductFinished(false);
    const newProduct: UploadProduct = {
      title,
      description,
      price: +price,
      category,
      inventory: +inventory,
      imageUrl,
      imageFileName,
      imageRef: imagePath,
      creator,
      createdAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    productsRef
      .add(newProduct)
      .then(() => {
        setAddProductFinished(true);
        setLoading(false);
      })
      .catch((err) => {
        const { message } = err as { message: string };
        setError(message);
        setLoading(false);
      });
  };

  const editProduct = (
    productId: string,
    data: AddProductData,
    creator: string
  ) => (imageUrl: string, imagePath: string) => {
    const {
      title,
      description,
      price,
      category,
      inventory,
      imageFileName,
    } = data;
    setLoading(true);
    setEditProductFinished(false);
    const editedProduct: UploadProduct = {
      title,
      description,
      price: +price,
      category,
      inventory: +inventory,
      imageUrl,
      imageFileName,
      imageRef: imagePath,
      creator,
      updatedAt: firebase.firestore.FieldValue.serverTimestamp(),
    };
    productsRef
      .doc(productId)
      .set(editedProduct, { merge: true })
      .then(() => {
        setEditProductFinished(true);
        setLoading(false);
      })
      .catch((err) => {
        const { message } = err as { message: string };
        setError(message);
        setLoading(false);
      });
  };

  const deleteProduct = async (product: Product) => {
    try {
      setLoading(true);
      // delete product image
      const imageRef = storageRef.child(product.imageRef);
      await imageRef.delete();
      // delete document from products collection
      await productsRef.doc(product.id).delete();
      return true;
      // Delete cart item
    } catch (err) {
      const { message } = err as { message: string };
      setError(message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    addNewProduct,
    uploadProgression,
    addProductFinished,
    loading,
    error,
    setUploadProgression,
    uploadImageToStorage,
    editProduct,
    editProductFinished,
    deleteProduct,
  };
};
