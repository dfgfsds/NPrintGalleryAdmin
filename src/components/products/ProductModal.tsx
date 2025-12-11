import React, { useEffect, useState } from 'react';
import { X, Plus, Loader2 } from 'lucide-react';
import Button from '../Button';
import Input from '../Input';
import { ProductForm } from '../../types/product';
import ImageUpload from './ImageUpload';
import { Controller, useFieldArray, useForm } from 'react-hook-form';
import { getCategoriesWithSubcategoriesApi, postImageUploadApi, postProductVariantSizesCreateApi, updateProductVariantSizesapi } from '../../Api-Service/Apis';
import SizeSection from './SizeSection';
import { InvalidateQueryFilters, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'react-router-dom';
import Select from 'react-select';
import { toast } from 'react-toastify';
import ReactQuill from 'react-quill';

interface ProductModalProps {
  productForm: any;
  onClose: () => void;
  onSubmit: (e: React.FormEvent) => void;
  onChange: (updates: Partial<ProductForm>) => void;
}

export default function ProductModal({
  productForm,
  onClose,
  // onSubmit,
  onChange,
}: ProductModalProps) {
  const queryClient = useQueryClient();
  const { id } = useParams<{ id: string }>();
  const [subcategoryOptions, setSubcategoryOptions] = useState([]);
  const [images, setImages] = useState<any[]>([]);
  const [variantImages, setVariantImages] = useState<any[]>([]);
  const [isLoadings, setIsLoading] = useState<any>(false);
  const [errorMessage, setErrorMessage] = useState('');
  const { register, handleSubmit, control, setValue, watch } = useForm<any>({
    defaultValues: {
      name: '',
      price: 0,
      discountedPrice: undefined,
      description: '',
      images: [],
    },
  });

  const { fields: optionFields, append: addOption, remove: removeOption } =
    useFieldArray({
      control,
      name: "product.options",
    });

  const {
    fields: pricingFields,
    append: addProductPricing,
    remove: removeProductPricing
  } = useFieldArray({
    control,
    name: "product.pricings",
  });

  const handleAddValue = (optionIndex: number) => {
    const currentOptions = watch("product.options");
    const updatedOptions = [...currentOptions];
    updatedOptions[optionIndex].values = [
      ...(updatedOptions[optionIndex].values || []),
      { value: "", pricings: [] },
    ];
    setValue("product.options", updatedOptions);
  };

  const handleAddPricing = (optionIndex: number, valueIndex: number) => {
    const currentOptions = watch("product.options");
    const updatedOptions = [...currentOptions];
    updatedOptions[optionIndex].values[valueIndex].pricings = [
      ...(updatedOptions[optionIndex].values[valueIndex].pricings || []),
      { price: "", starting_range: "", ending: "" },
    ];
    setValue("product.options", updatedOptions);
  };


  const { data, isLoading } = useQuery({
    queryKey: ["getCategoriesWithSubcategoriesData", id],
    queryFn: () => getCategoriesWithSubcategoriesApi(`vendor/${id}/`),
  })
  const handleCategoryChange = (selectedOption: any) => {
    setValue('category', selectedOption?.value);
    setValue('subcategory', null);
    const selectedCat = data?.data?.find((cat: any) => cat?.id === selectedOption?.value);
    setSubcategoryOptions(
      selectedCat?.subcategories?.map((sub: any) => ({
        value: sub?.id,
        label: sub?.name
      })) || []
    );
  };

  const categoryOptions = data?.data?.map((cat: any) => ({
    value: cat?.id,
    label: cat?.name
  })) || [];

  useEffect(() => {
    setValue('name', productForm?.name);
    setValue('slug_name', productForm?.slug_name);
    setValue('price', productForm?.price);
    setValue('discount', productForm?.discount);
    setValue('category', productForm?.category);
    setValue('subcategory', productForm?.subcategory);
    setValue('brand_name', productForm?.brand_name);
    setValue('commission', productForm?.commission);

    setValue('cost', productForm?.cost);
    setValue('weight', productForm?.weight);
    setValue('length', productForm?.length);
    setValue('breadth', productForm?.breadth);
    setValue('height', productForm?.height);
    setValue('is_custom_image_required', productForm?.is_custom_image_required);
    setValue('min_purchase_quantity', productForm?.min_purchase_quantity);
    setValue('max_purchase_quantity', productForm?.max_purchase_quantity);

    setValue('sku', productForm?.sku);
    setValue('stock_quantity', productForm?.stock_quantity);
    setValue('description', productForm?.description);
    setValue('description_2', productForm?.description_2);
    setValue('keywords', productForm?.keywords);
    setValue('meta_tax', productForm?.meta_tax);
    setValue('image_urls', setImages(productForm?.image_urls?.map((item: any) => { return item })));
    setValue('is_featured', productForm?.is_featured);
    // ⭐ SET SEPARATE PRICINGS
    if (productForm?.pricings?.length) {
      setValue(
        "product.pricings",
        productForm.pricings.map((p: any) => ({
          id: p?.id || "",
          starting_range: Number(p.starting_range),
          ending: Number(p.ending),
          price: Number(p.price),
          created_by: "admin",
        }))
      );
    } else {
      // ⭐ If no pricing → default one pricing row
      setValue("product.pricings", [
        {
          starting_range: "",
          ending: "",
          price: "",
          created_by: "admin",
        },
      ]);
    }

    if (productForm?.options?.length) {
      const formattedOptions = productForm.options.map((option: any) => ({
        option: option?.option || '',
        id: option?.id || '',
        values:
          option?.values?.map((value: any) => ({
            id: value?.id || '',
            value: value?.value || '',
            pricings:
              value?.pricings?.map((pricing: any) => ({
                id: pricing?.id || '',
                price: pricing?.price || '',
                starting_range: pricing?.starting_range || '',
                ending: pricing?.ending || '',
              })) || [],
          })) || [],
      }));

      setValue('product.options', formattedOptions);
    } else {
      setValue('product.options', []);
    }

  }, [productForm]);

  const onSubmit = async (data: any) => {
    setErrorMessage('');
    const formattedOptions = data?.product?.options?.map((option: any) => ({
      ...(productForm && { id: option?.id }),  // 👈 only in edit
      option: option?.option || "",

      values: option?.values?.map((value: any) => ({
        ...(productForm && { id: value?.id }), // 👈 only in edit
        value: value?.value || "",

        pricings: value?.pricings?.map((pricing: any) => ({
          ...(productForm && { id: pricing?.id }), // 👈 only in edit
          price: pricing?.price || "",
          starting_range: pricing?.starting_range || "",
          ending: pricing?.ending || "",
        })) || [],
      })) || [],
    })) || [];


    const payload = {
      product: {
        ...(productForm ? '' : { vendor: id }),
        name: data?.name,
        slug_name: data?.slug_name,
        brand_name: data?.brand_name,
        description: data?.description,
        description_2: data?.description_2,
        commission: data?.commission,
        cost: data?.cost,
        sku: data?.sku,
        price: data?.price,
        weight: data?.weight,
        length: data?.length,
        breadth: data?.breadth,
        height: data?.height,
        discount: data?.discount,
        stock_quantity: data?.stock_quantity,
        is_custom_image_required: data?.is_custom_image_required,
        min_purchase_quantity: data?.min_purchase_quantity,
        max_purchase_quantity: data?.max_purchase_quantity,

        ...(productForm
          ? {}
          : {
            ...(data?.category && { category: data?.category }),
            ...(data?.subcategory && { subcategory: data?.subcategory }),
          }),
        keywords: data?.keywords,
        meta_tax: data?.meta_tax,
        is_featured: !!data?.is_featured,
        ...(productForm ? { updated_by: "vendor" } : { created_by: "vendor" }),
        status: true,
        pricings: data.product.pricings?.map((p: any) => ({
          ...(productForm && { id: p?.id }),
          starting_range: Number(p.starting_range),
          ending: Number(p.ending),
          price: Number(p.price),
          created_by: "admin"
        })) || [],
        options: formattedOptions,
      },
      image_urls: images?.map((item: any) =>
        item?.url ? item?.url : item
      ),
    };

    try {
      let updateApi;
      if (productForm) {
        updateApi = await updateProductVariantSizesapi(productForm?.id, payload);
      } else {
        updateApi = await postProductVariantSizesCreateApi('', payload);
      }

      if (updateApi) {
        queryClient.invalidateQueries(['getProductData'] as InvalidateQueryFilters);
        onClose();
        toast.success("Product created successfully!");
      } else {
        throw new Error('Something went wrong. Please try again.');
      }
    } catch (error: any) {
      // setErrorMessage(error?.response?.data?.non_field_error || 'Something went wrong. Please try again.');
      if (error?.response?.data?.errors) {
        const errObj = error.response.data.errors;

        // first key + first message (0th index) mattum eduthukkurom
        const [key, value] = Object.entries(errObj)[0] || [];
        const firstMessage = Array.isArray(value) ? value[0] : value;

        setErrorMessage(`${key}: ${firstMessage}`);
      } else {
        setErrorMessage('Something went wrong. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-2xl sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-md bg-white text-gray-400 hover:text-gray-500"
            >
              <X className="h-6 w-6" />
            </button>
          </div>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 max-w-4xl mx-auto">
            <h1 className='font-bold'>{productForm ? 'Edit Products' : 'Products Create'}</h1>
            <div className='grid grid-cols-1 gap-2'>
              <div className='col-span-6 lg:col-span-6'>
                <Input label="Name" required {...register('name', { required: true })} />
              </div>
              <div className='col-span-6 lg:col-span-6'>
                <Input label="Slug Name" required {...register('slug_name', { required: true })} />
              </div>
              <div className='col-span-12 lg:col-span-12 py-1'>
                <ImageUpload images={images} product={productForm} onChange={setImages} />
              </div>
              <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6'>
                <Input type="number" label="Price" {...register('price')} />

              </div>
              <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6'>
                <Input type="number" label="MRP Price" {...register('discount')} />
              </div>

              {/* Category Dropdown */}
              <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 py-1">
                <label className="block text-sm font-bold  mb-1">Category</label>
                <Controller
                  name="category"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={categoryOptions}
                      placeholder="Select Category"
                      onChange={handleCategoryChange}
                      value={categoryOptions.find((opt: any) => opt.value === field.value) || null}
                    />
                  )}
                />
              </div>

              {/* Subcategory Dropdown */}
              <div className="col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 py-1">
                <label className="block text-sm font-bold  mb-1">subcategory</label>
                <Controller
                  name="subcategory"
                  control={control}
                  render={({ field }) => (
                    <Select
                      {...field}
                      options={subcategoryOptions}
                      placeholder="Select Subcategory"
                      isDisabled={!subcategoryOptions.length}
                      value={subcategoryOptions.find((opt: any) => opt.value === field.value) || null}
                      onChange={(selected: any) => setValue('subcategory', selected?.value)}
                    />
                  )}
                />
              </div>
              {/* </div> */}
              <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6'>
                <Input label="Brand Name" {...register('brand_name')} />
              </div>
              <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6'>
                <Input type="number" label="Commission" {...register('commission')} />
              </div>
              <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6'>
                <Input type="number" label="Cost" {...register('cost')} />
              </div>
              <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6'>
                <Input label="Weight" {...register('weight')} />
              </div>
              <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6'>
                <Input label="Length" {...register('length')} />
              </div>
              <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6'>
                <Input label="Breadth" {...register('breadth')} />
              </div>
              <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6'>
                <Input label="Height" {...register('height')} />
              </div>
              <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6'>
                <Input type="string" label="SKU" {...register('sku')} />
              </div>
              {/* Is Featured Checkbox */}
              <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 flex items-center gap-2 py-2'>
                <label className="block text-sm font-bold  mb-1">
                  Featured Product
                </label>
                <Input
                  type="checkbox"
                  id="is_featured"
                  {...register("is_featured")}
                  className="h-4 w-4 text-indigo-600 border-gray-300 rounded"
                />
              </div>
              <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 flex items-center gap-2 py-2'>
                <label className="block text-sm font-bold  mb-1">
                  Custom Image
                </label>
                <Input
                  type="checkbox"
                  id="is_custom_image_required"
                  {...register("is_custom_image_required")}
                  className="h-10 w-10 text-indigo-600 border-gray-300 rounded"
                />
              </div>

              {/* <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6'>
                <Input type="number" label="Stock Quantity" {...register('stock_quantity')} />
              </div> */}
              {/* <div className='col-span-12 lg:col-span-12'>
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <textarea  {...register('description')} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div> */}
              <div className='col-span-12 lg:col-span-12 py-1'>
                <label className="block text-sm font-bold  mb-1">Description</label>
                <Controller
                  name="description"
                  control={control}
                  defaultValue=""
                  render={({ field }) => (
                    <ReactQuill
                      {...field}
                      onChange={(value) => field.onChange(value)} // important
                      value={field.value}
                      theme="snow"
                    />
                  )}
                />
              </div>
              {/* <div className='col-span-12 lg:col-span-12'>
                <label className="block text-sm font-medium text-gray-700">Description 2</label>
                <textarea  {...register('description_2')} rows={3} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
              </div> */}

              <div className='col-span-12 lg:col-span-6 py-1'>
                <label className="block text-sm font-bold  mb-1">Keywords</label>
                <textarea
                  {...register('keywords', {
                    setValueAs: (value) =>
                      typeof value === 'string'
                        ? value.split(',').map((kw) => kw.trim()).filter(Boolean)
                        : Array.isArray(value)
                          ? value
                          : [],

                  })}
                  rows={3}
                  placeholder="e.g. dairy, milk"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

              <div className='col-span-12 lg:col-span-6'>
                <label className="block text-sm font-bold  mb-1">Meta Tags</label>
                <textarea
                  {...register('meta_tax', {
                    setValueAs: (value) =>
                      typeof value === 'string'
                        ? value.split(',').map((kw) => kw.trim()).filter(Boolean)
                        : Array.isArray(value)
                          ? value
                          : [],

                  })}
                  rows={3}
                  placeholder="e.g. dairy, milk"
                  className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                />
              </div>

               <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 mt-2'>
                <Input label="Minimum Purchase Quantity" {...register('min_purchase_quantity')} />
              </div>
              <div className='col-span-12 sm:col-span-6 md:col-span-6 lg:col-span-6 mt-2'>
                <Input label="Maximum Purchase Quantity" {...register('max_purchase_quantity')} />
              </div>
            </div>
            {/* <Button type="submit">Submit</Button> */}

             
      

            <div className="rounded-md">
              <h2 className="font-bold text-lg mb-2">Product Pricings</h2>
              {pricingFields.map((item, index) => (
                <div key={item.id} className="grid grid-cols-12 gap-2 mb-5  rounded">
                  <div className="col-span-4">
                    <Input
                      label="Starting Range"
                      type="number"
                      {...register(`product.pricings.${index}.starting_range`)}
                    />
                  </div>
                  <div className="col-span-4">
                    <Input
                      label="Ending Range"
                      type="number"
                      {...register(`product.pricings.${index}.ending`)}
                    />
                  </div>

                  <div className="col-span-3">
                    <Input
                      label="Price"
                      type="number"
                      {...register(`product.pricings.${index}.price`)}
                    />
                  </div>

                  <div className="col-span-1 flex justify-center items-center">
                    <button
                      type="button"
                      onClick={() => removeProductPricing(index)}
                      className="text-red-500 font-bold text-xl"
                    >
                      <X />
                    </button>
                  </div>
                </div>
              ))}

              <div className="flex justify-between items-center mb-2">

                <Button
                  type="button"
                  onClick={() =>
                    addProductPricing({
                      starting_range: "",
                      ending: "",
                      price: "",
                      created_by: "admin"
                    })
                  }
                  className='flex gap-2'
                >
                  + Add Pricing
                </Button>
              </div>
            </div>


            {/* OPTIONS SECTION */}
            <div className="space-y-4">
              <h2 className="font-bold text-lg mb-2">Product Options</h2>
              {optionFields.map((option, optionIndex) => (
                <div
                  key={option.id}
                  className="border rounded-lg p-4  space-y-3"
                >
                  <h3 className="font-semibold text-lg">Option {optionIndex + 1}</h3>
                  <div className="flex  items-center">
                    <Input
                      required
                      label="Product Options Title"
                      {...register(`product.options.${optionIndex}.option`)}
                    />
                    <button
                      type="button"
                      onClick={() => removeOption(optionIndex)}
                      className="ml-2 text-red-500"
                    >
                      <X size={18} />
                    </button>
                  </div>

                  {/* VALUES */}
                  {watch(`product.options.${optionIndex}.values`)?.map(
                    (value: any, valueIndex: number) => (
                      <div
                        key={valueIndex}
                        className="border rounded p-3 bg-white space-y-3"
                      >
                        <h3 className="font-semibold text-lg">Option Value {valueIndex + 1}</h3>
                        <div className="flex justify-between items-center">
                          <Input
                            required
                            label="Product Options Value"
                            {...register(
                              `product.options.${optionIndex}.values.${valueIndex}.value`
                            )}
                          />
                          <button
                            type="button"
                            onClick={() => {
                              const currentOptions = watch("product.options");
                              const updated = [...currentOptions];
                              updated[optionIndex].values.splice(valueIndex, 1);
                              setValue("product.options", updated);
                            }}
                            className="ml-2 text-red-500"
                          >
                            <X size={18} />
                          </button>
                        </div>

                        {/* PRICINGS SECTION */}
                        {value?.pricings?.map((pricing: any, pricingIndex: number) => (
                          <div
                            key={pricingIndex}
                            className="relative border rounded-lg p-4 bg-gray-50 shadow-sm mt-3"
                          >
                            <div className="flex justify-between items-center mb-3">
                              <h4 className="font-semibold text-sm text-gray-700">
                                Pricing {pricingIndex + 1}
                              </h4>
                              <button
                                type="button"
                                onClick={() => {
                                  const currentOptions = watch("product.options");
                                  const updated = [...currentOptions];
                                  updated[optionIndex].values[valueIndex].pricings.splice(pricingIndex, 1);
                                  setValue("product.options", updated);
                                }}
                                className="text-red-500 hover:text-red-600 text-sm flex items-center gap-1"
                              >
                                <X size={14} /> Remove
                              </button>
                            </div>

                            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                              <div>
                                <Input
                                  required
                                  label="Price"
                                  {...register(
                                    `product.options.${optionIndex}.values.${valueIndex}.pricings.${pricingIndex}.price`
                                  )}
                                />
                              </div>
                              <div>
                                <Input
                                  required
                                  label="Quantity starting range"
                                  {...register(
                                    `product.options.${optionIndex}.values.${valueIndex}.pricings.${pricingIndex}.starting_range`
                                  )}
                                />
                              </div>
                              <div>
                                <Input
                                  required
                                  label="Quantity ending range "
                                  {...register(
                                    `product.options.${optionIndex}.values.${valueIndex}.pricings.${pricingIndex}.ending`
                                  )}
                                />
                              </div>
                            </div>
                          </div>
                        ))}


                        <Button
                          type="button"
                          onClick={() => handleAddPricing(optionIndex, valueIndex)}
                          className="text-sm text-green-600"
                        >
                          + Add Pricing
                        </Button>
                      </div>
                    )
                  )}

                  <Button
                    type="button"
                    onClick={() => handleAddValue(optionIndex)}
                    className="text-sm text-blue-600"
                  >
                    + Add Value
                  </Button>
                </div>
              ))}

              <Button
                // type="button"
                onClick={() => addOption({ option: "", values: [] })}
                className='flex gap-2'
              >
                + Add Option
              </Button>
            </div>
            {errorMessage && (
              <p className="text-red-500 mt-2">{errorMessage}</p>
            )}
            <div className="flex justify-end gap-3">
              <Button className='flex gap-2' type="submit" disabled={isLoadings}>{productForm ? 'Edit Product' : 'Create Product'}
                {isLoadings && (<Loader2 className='mt-auto mb-auto animate-spin' />)}
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}