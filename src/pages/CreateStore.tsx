import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// import { useAuthStore } from '../stores/authStore';
// import { useStoreStore } from '../stores/storeStore';
import Button from '../components/Button';
import Input from '../components/Input';
import { useForm } from 'react-hook-form';
import { postVendorUsersCreateApi } from '../Api-Service/Apis';
import SingleImageUpload from '../components/products/SingleImageUpload';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import PaymentModel from '../components/paymentModal';

// const subscriptionPlans = [
//   { id: 'monthly', name: 'Monthly', price: 1000, duration: 1, durationUnit: 'month' },
//   { id: 'yearly', name: 'Yearly', price: 10000, duration: 1, durationUnit: 'year' },
//   { id: 'three_year', name: '3 Years', price: 20000, duration: 3, durationUnit: 'year' },
// ] as const;

export default function CreateStore() {
  const navigate = useNavigate();
  // const [selectedPlan, setSelectedPlan] = useState<typeof subscriptionPlans[number] | null>(null);
  // const userId: any = localStorage.getItem('userId');
  const mainVendor: any = localStorage.getItem('mainVendor');
  const [image, setImages] = useState<any>();
  const [logoImage, setLogoImage] = useState<any>();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [openModal, setOpenModal] = useState(false);
  const [vendorId, setVendorId] = useState<any>('');

  const storeSchema = yup.object().shape({
    store_name: yup
      .string()
      .required('Store Name is required'),

    // sub_domain_url: yup
    //   .string()
    //   .url('Enter a valid URL (e.g., http://example.com)')
    //   .required('Subdomain URL is required'),

    store_description: yup
      .string()
      .required('Store Description is required'),

    name: yup
      .string()
      .required('Full Name is required'),

    email: yup
      .string()
      .email('Enter a valid email')
      .required('Email is required'),

    password: yup
      .string()
      .min(6, 'Password must be at least 6 characters')
      .required('Password is required'),

    contact_number: yup
      .string()
      .matches(/^[0-9]{10}$/, 'Contact number must be 10 digits')
      .required('Contact Number is required'),

    support_email: yup
      .string()
      .email('Enter a valid email')
      .required('Support Email is required'),

    support_contact: yup
      .string()
      .matches(/^[0-9]{10}$/, 'Support contact must be 10 digits')
      .required('Support Contact is required'),

    location: yup
      .string()
      .required('Location is required'),

  });
  const {
    register,
    handleSubmit,
    control,
    formState: { errors }
  } = useForm({
    resolver: yupResolver(storeSchema),
  });

  const onSubmit = async (data: any) => {
    setErrorMessage('')
    setLoading(true);
    try {
      const payload = {
        name: data?.name,
        contact_number: data?.contact_number,
        email: data?.email,
        location: data?.location,
        password: data?.password,
        // rating: data?.rating,
        // sales_count: data?.sales_count,
        store_description: data?.store_description,
        store_name: data?.store_name,
        sub_domain_url: data?.sub_domain_url,
        logo: logoImage ? logoImage[0]?.url : '',
        profile_image: image ? image[0]?.url : '',
        theme_id: 2,
        // main_multi_vendor_user: 27,
        main_multi_vendor_user: mainVendor,
        created_by: 'main vendor',
        support_email: data?.support_email,
        support_contact: data?.support_contact,
        // status: false
        status: true
      };
      // setOpenModal(true);
      const updateApi = await postVendorUsersCreateApi('', payload);
      if (updateApi) {
        setVendorId(updateApi?.data?.vendor);
        setOpenModal(true); // open payment modal

        // navigate(`/store/${updateApi?.data?.vendor?.id}/products`);
      }
    } catch (error: any) {
      console.error("API request failed:", error?.
        response?.data?.details);
      setErrorMessage(
        error?.response?.data?.error || "Something went wrong. Please try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 px-4 py-10 ">
        <div className="w-full max-w-3xl bg-white rounded-2xl shadow-md p-8 space-y-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-800">Create a New Store</h1>
            <p className="text-sm text-gray-600 mt-1">Get started with your online store in minutes</p>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <Input label="Store Name" {...register('store_name')} error={errors.store_name?.message} />
            {/* <Input label="Subdomain (http://example11.com)" placeholder="http://example11.com" {...register('sub_domain_url')} error={errors.sub_domain_url?.message} /> */}
            {/* <Input label="Store Description" {...register('store_description')} error={errors.store_description?.message} /> */}

            <div className=''>
              <label className="block text-sm font-medium text-gray-700">Description</label>
              <textarea  {...register('store_description')} rows={3} className="mt-1 block w-full rounded-md border border-gray-600 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm" />
            </div>
            <Input label="Full Name" {...register('name')} error={errors.name?.message} />
            <Input type="email" label="Email" {...register('email')} error={errors.email?.message} />
            <Input label="Password" type="password" {...register('password')} error={errors.password?.message} />
            <Input type="number" label="Contact Number" {...register('contact_number')} error={errors.contact_number?.message} />

            <Input type="email" label="Support Email" {...register('support_email')} error={errors.support_email?.message} />
            <Input label="Support Contact" {...register('support_contact')} error={errors.support_contact?.message} />
            <Input label="Location" {...register('location')} error={errors.location?.message} />

            <div className="flex flex-wrap gap-5 mt-4 justify-center">
              <div>
                <label className="block text-sm font-medium text-gray-700">Profile Image</label>
                <SingleImageUpload images={image} onChange={setImages} />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Logo Image</label>
                <SingleImageUpload images={logoImage} onChange={setLogoImage} />
              </div>
            </div>

            {errorMessage && (
              <div className="text-red-600 bg-red-100 border border-red-400 px-4 py-2 rounded">
                {errorMessage}
              </div>
            )}

            <div className="flex justify-end gap-4 mt-6">
              <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
                Cancel
              </Button>
              <Button type="submit" loading={loading}>Create Store</Button>
            </div>
          </form>
        </div>
      </div>
      <PaymentModel
        vendorId={vendorId}
        open={openModal}
        close={() => setOpenModal(!openModal)}
      />
    </>
    // <div className="min-h-screen flex items-center justify-center bg-gradient-to-r from-blue-50 to-indigo-50 px-10 py-12">
    //   <div className="w-full  space-y-8 p-8 bg-white rounded-2xl shadow-lg">

    // <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
    //   <div>
    //     <h1 className="text-2xl font-semibold text-gray-900">Create a new store</h1>
    //     <p className="mt-2 text-sm text-gray-700">
    //       Get started with your online store in minutes
    //     </p>
    //   </div>

    //   <form
    //     onSubmit={handleSubmit(onSubmit)}
    //     className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8 space-y-6"
    //   >
    //     <Input label="Store Name" {...register('store_name')} />

    //     <Input label="Subdomain" placeholder='http://example11.com' {...register('sub_domain_url')} />
    //     <Input label="Store Description" {...register('store_description')} />


    //     <Input label="Full Name" {...register('name', { required: true })} />
    //     <Input type='email' label="Email" {...register('email', { required: true })} />
    //     <Input label="Password" type="password" {...register('password', { required: true })} />
    //     <Input type='number' label="Contact Number" {...register('contact_number')} />

    //     <Input type='support_email' label="Support Email" {...register('support_email', { required: true })} />
    //     <Input type='support_contact' label="Support Contact" {...register('support_contact')} />

    //     <Input label="Location" {...register('location')} />
    //     {/* <Input label="Rating" type="number" {...register('rating')} />
    //     <Input label="Sales Count" type="number" {...register('sales_count')} /> */}
    //     <div className='flex flex-wrap gap-5 justify-center'>
    //       <div>
    //         <label className="block text-sm font-medium text-gray-700">Profile Image</label>
    //         <SingleImageUpload images={image} onChange={setImages} />
    //       </div>
    //       <div>
    //         <label className="block text-sm font-medium text-gray-700">Logo Image</label>
    //         <SingleImageUpload images={logoImage} onChange={setLogoImage} />
    //       </div>
    //     </div>

    //     {errorMessage && (
    //       <div className="mb-4 text-red-600 bg-red-100 border border-red-400 px-4 py-2 rounded">
    //         {errorMessage}
    //       </div>
    //     )}
    //     <div className="flex justify-end space-x-3">
    //       <Button type="button" variant="outline" onClick={() => navigate('/dashboard')}>
    //         Cancel
    //       </Button>
    //       <Button type="submit" loading={loading}>Create Store</Button>
    //     </div>
    //   </form>
    // </div>
    // </div>
    // </div>
  );
}