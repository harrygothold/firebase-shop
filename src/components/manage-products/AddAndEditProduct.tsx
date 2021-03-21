import React, { ChangeEvent, FC, useRef, useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import Input from '../Input/Input';
import Button from '../Button/Button';
import { useAuthContext } from '../../state/auth-context';
import { useManageProduct } from '../../hooks/useManageProduct';
import { AddProductData, Product } from '../../types';
import { categories } from '../../helpers';
import { storageRef } from '../../firebase/config';

const fileType = ['image/png', 'image/jpeg', 'image/jpg'];

interface Props {
  setOpenProductForm: (open: boolean) => void;
  productToEdit: Product | null;
  setProductToEdit: (product: Product | null) => void;
}

const AddAndEditProduct: FC<Props> = ({
  setOpenProductForm,
  setProductToEdit,
  productToEdit,
}) => {
  const {
    authState: { authUser },
  } = useAuthContext();
  const {
    addNewProduct,
    addProductFinished,
    uploadProgression,
    loading,
    error,
    setUploadProgression,
    uploadImageToStorage,
    editProduct,
    editProductFinished,
  } = useManageProduct();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const { register, handleSubmit, errors, reset } = useForm<AddProductData>();

  const inputRef = useRef<HTMLInputElement>(null);

  const handleOpenUploadBox = () => {
    if (inputRef?.current) {
      inputRef.current.click();
    }
  };

  const handleSelectFile = (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;

    if (!files || !files[0]) return;

    const file = files[0];

    if (!fileType.includes(file.type)) {
      alert('Wrong file format, allow only "png", "jpeg" or "jpg"');
      return;
    }
    setSelectedFile(file);
  };

  const handleAddProduct = handleSubmit((data) => {
    if (!selectedFile || !authUser) return;
    return uploadImageToStorage(
      selectedFile,
      addNewProduct(data, authUser?.uid)
    );
  });

  useEffect(() => {
    if (addProductFinished) {
      reset();
      setSelectedFile(null);
      setUploadProgression(0);
    }
  }, [addProductFinished, reset, setUploadProgression, setSelectedFile]);

  useEffect(() => {
    if (editProductFinished) {
      reset();
      setSelectedFile(null);
      setUploadProgression(0);
      setProductToEdit(null);
      setOpenProductForm(false);
    }
  }, [
    editProductFinished,
    reset,
    setUploadProgression,
    setSelectedFile,
    setProductToEdit,
    setOpenProductForm,
  ]);

  const handleEditProduct = handleSubmit(async (data) => {
    if (!productToEdit || !authUser) return;
    const {
      title,
      description,
      price,
      imageFileName,
      category,
      inventory,
      imageRef,
      imageUrl,
    } = productToEdit;
    // check if product data has been changed
    const isNotEdited =
      title === data.title &&
      description === data.description &&
      +price === +data.price &&
      imageFileName === data.imageFileName &&
      category === data.category &&
      +inventory === +data.inventory;
    if (isNotEdited) return;
    if (imageFileName !== data.imageFileName) {
      if (!selectedFile) return;
      const oldImageRef = storageRef.child(imageRef);
      await oldImageRef.delete();

      return uploadImageToStorage(
        selectedFile,
        editProduct(productToEdit.id, data, authUser?.uid)
      );
    } else {
      return editProduct(
        productToEdit.id,
        data,
        authUser?.uid
      )(imageUrl, imageRef);
    }
  });

  return (
    <>
      <div
        className="backdrop"
        onClick={() => {
          setOpenProductForm(false);
          setProductToEdit(null);
        }}
      ></div>
      <div className="modal modal--add-product">
        <div
          className="modal-close"
          onClick={() => {
            setOpenProductForm(false);
            setProductToEdit(null);
          }}
        >
          &times;
        </div>
        <h2 className="header--center">
          {productToEdit ? 'Edit a Product' : 'Add a New Product'}
        </h2>
        <form
          className="form"
          onSubmit={productToEdit ? handleEditProduct : handleAddProduct}
        >
          <Input
            label="Title"
            name="title"
            placeholder="Product Title"
            defaultValue={productToEdit ? productToEdit.title : ''}
            ref={register({
              required: 'Title is required',
              minLength: {
                value: 3,
                message: 'Product Title must be at least 3 characters',
              },
            })}
            error={errors.title?.message}
          />
          <Input
            label="Description"
            name="description"
            placeholder="Product Description"
            defaultValue={productToEdit ? productToEdit.description : ''}
            ref={register({
              required: 'Description is required',
              minLength: {
                value: 6,
                message: 'Product Description must be at least 6 characters',
              },
              maxLength: {
                value: 200,
                message:
                  'Product Description must be not more than 200 characters',
              },
            })}
            error={errors.description?.message}
          />
          <Input
            label="Price"
            type="number"
            name="price"
            placeholder="Product Price"
            defaultValue={productToEdit ? productToEdit.price : ''}
            ref={register({
              required: 'Price is required',
              min: {
                value: 1,
                message: 'Product price must be at least $1',
              },
            })}
            error={errors.price?.message}
          />
          <div className="form__input-container">
            <label htmlFor="Image" className="form__input-label">
              Image
            </label>
            <div className="form__input-file-upload">
              {uploadProgression ? (
                <div style={{ width: '70%' }}>
                  <input
                    type="text"
                    className="upload-progression"
                    style={{
                      width: `${uploadProgression}%`,
                      color: 'white',
                      textAlign: 'center',
                    }}
                    value={`${uploadProgression}%`}
                    readOnly
                  />
                </div>
              ) : (
                <input
                  type="text"
                  className="input"
                  name="imageFileName"
                  readOnly
                  value={
                    selectedFile
                      ? selectedFile.name
                      : productToEdit
                      ? productToEdit.imageFileName
                      : ''
                  }
                  style={{ width: '70%', cursor: 'pointer' }}
                  onClick={handleOpenUploadBox}
                  ref={register({ required: 'Product Image is required ' })}
                />
              )}

              <Button
                width="30%"
                height="100%"
                type="button"
                style={{ borderRadius: '0', border: '1px solid #282c2499' }}
                onClick={handleOpenUploadBox}
              >
                <span className="paragraph--small">Select Image</span>
              </Button>
              <input
                ref={inputRef}
                onChange={handleSelectFile}
                type="file"
                style={{ display: 'none' }}
              />
            </div>
            {errors?.imageFileName && !selectedFile && (
              <p className="paragraph paragraph--error-small">
                {errors.imageFileName.message}
              </p>
            )}
          </div>
          <div className="form__input-container">
            <label htmlFor="Category" className="form__input-label">
              Category
            </label>
            <select
              name="category"
              defaultValue={productToEdit ? productToEdit.category : undefined}
              className="input"
              ref={register({ required: 'Product Category is required' })}
            >
              <option style={{ display: 'none' }}></option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors?.category && (
              <p className="paragraph paragraph--error-small">
                {errors.category.message}
              </p>
            )}
          </div>
          <Input
            label="Inventory"
            name="inventory"
            type="number"
            placeholder="Product Inventory"
            defaultValue={productToEdit ? productToEdit.inventory : ''}
            ref={register({
              required: 'Inventory is required',
              min: 0,
              pattern: {
                value: /^[0-9]\d*$/,
                message: 'Inventory must be a positive whole number',
              },
            })}
            error={errors.inventory?.message}
          />
          <Button
            className="btn--orange"
            type="submit"
            width="100%"
            style={{ marginTop: '1rem' }}
            loading={loading}
            disabled={loading}
          >
            Submit
          </Button>
        </form>
        {error && <p className="paragraph paragraph--error">{error}</p>}
      </div>
    </>
  );
};

export default AddAndEditProduct;
