import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { Loader, X } from 'lucide-react';
// import { postAddressCreateApi, updateAddressApi } from '../../api-endpoints/CartsApi';
import { InvalidateQueryFilters, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { postAddressCreateApi, updateAddressApi } from '../Api-Service/Apis';
import { useParams } from 'react-router-dom';

interface AddressFormProps {
  openModal: boolean;
  handleClose: () => void;
  editData: any;
  setEditData: any;
  pickupValue?: any;
}

export function AddressForm({ openModal, handleClose, editData, setEditData, pickupValue }: AddressFormProps) {
  const userName = localStorage.getItem('userName');
  const [loading, setLoading] = useState(false);
  const queryClient = useQueryClient();
  const { id } = useParams();

  const { control, handleSubmit, setValue, reset, formState: { errors } } = useForm<any>({
    defaultValues: {
      address_line1: editData?.address_line1 || '',
      address_line2: editData?.address_line2 || '',
      address_type: editData?.address_type || '',
      city: editData?.city || '',
      state: editData?.state || '',
      postal_code: editData?.postal_code || '',
      country: editData?.country || '',
      landmark: editData?.landmark || '',
    }
  });

  // Use useEffect to update form values when editData changes
  useEffect(() => {
    if (editData) {
      setValue('address_line1', editData?.address_line1 || '');
      setValue('address_line2', editData?.address_line2 || '');
      setValue('address_type', editData?.address_type || '');
      setValue('city', editData?.city || '');
      setValue('state', editData?.state || '');
      setValue('postal_code', editData?.postal_code || '');
      setValue('country', editData?.country || '');
      setValue('landmark', editData?.landmark || '');
      setValue('is_primary', editData?.is_primary || false);
      setValue('selected_address', editData?.selected_address || false);
      setValue('pickup_location', editData?.pickup_location);

      if (pickupValue === 'shiprocket') {
        setValue('company_name', editData?.company_name || '');
      }
    }
  }, [editData, setValue, pickupValue]);

  // Return null if the modal is not open
  if (!openModal) return null;

  // Form submission handler
  const onFormSubmit = async (data: any) => {
    setLoading(true);
    const formattedData = {
      vendor: id,
      ...(pickupValue === 'shiprocket' && {
        company_name: data.company_name,
        pickup_location: data?.pickup_location,
      }),
      address_line1: data.address_line1,
      address_line2: data.address_line2,
      address_type: data.address_type,
      city: data.city,
      state: data.state,
      postal_code: data.postal_code,
      country: data.country,
      landmark: data.landmark,
      is_primary: data?.is_primary || false,
      selected_address: data?.selected_address || false,
      ...(editData
        ? { updated_by: userName || 'vendor' }
        : { created_by: userName || 'vendor' })

    };
    if (editData) {
      try {
        const response = await updateAddressApi(`${editData?.id}`, formattedData);
        if (response) {
          queryClient.invalidateQueries(['getAddressData'] as InvalidateQueryFilters);
          handleClose();
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    } else {
      try {
        const response = await postAddressCreateApi('', formattedData);
        if (response) {
          queryClient.invalidateQueries(['postGoalType'] as InvalidateQueryFilters);
          handleClose();
          setLoading(false);
        }
      } catch (error) {
        console.error(error);
        setLoading(false);
      }
    }

  };

  return (
  <div className="fixed inset-0 bg-black/40 flex justify-center items-center z-50">
  <div
    className="bg-white w-full max-w-4xl rounded-md shadow-xl"
    onClick={(e) => e.stopPropagation()}
  >
    {/* Header */}
    <div className="flex items-center justify-between px-6 py-4 border-b">
      <h2 className="text-xl font-semibold text-black">
        Add Your Address
      </h2>
      <button
        onClick={() => { handleClose(); setEditData(''); reset(); }}
        className="text-gray-500 hover:text-black"
      >
        <X size={20} />
      </button>
    </div>

    {/* Form */}
    <form
      onSubmit={handleSubmit(onFormSubmit)}
      className="px-6 py-6 space-y-6 max-h-[80vh] overflow-y-auto"
    >
      {/* Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-1 text-sm font-medium">Address Line 1</label>
          <Controller
            control={control}
            name="address_line1"
            render={({ field }) => (
              <textarea
                {...field}
                rows={3}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              />
            )}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Address Line 2</label>
          <Controller
            control={control}
            name="address_line2"
            render={({ field }) => (
              <textarea
                {...field}
                rows={3}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              />
            )}
          />
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-1 text-sm font-medium">Address Type</label>
          <Controller
            control={control}
            name="address_type"
            render={({ field }) => (
              <input
                {...field}
                placeholder="e.g. Home, Office"
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              />
            )}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">City</label>
          <Controller
            control={control}
            name="city"
            render={({ field }) => (
              <input
                {...field}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              />
            )}
          />
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-1 text-sm font-medium">State</label>
          <Controller
            control={control}
            name="state"
            render={({ field }) => (
              <input
                {...field}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              />
            )}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Pin Code</label>
          <Controller
            control={control}
            name="postal_code"
            render={({ field }) => (
              <input
                {...field}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              />
            )}
          />
        </div>
      </div>

      {/* Row 4 */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block mb-1 text-sm font-medium">Country</label>
          <Controller
            control={control}
            name="country"
            render={({ field }) => (
              <input
                {...field}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              />
            )}
          />
        </div>

        <div>
          <label className="block mb-1 text-sm font-medium">Landmark</label>
          <Controller
            control={control}
            name="landmark"
            render={({ field }) => (
              <textarea
                {...field}
                rows={2}
                className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
              />
            )}
          />
        </div>
      </div>

      {/* Shiprocket Section */}
      {pickupValue === 'shiprocket' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t">
          <div>
            <label className="block mb-1 text-sm font-medium">Company Name</label>
            <Controller
              control={control}
              name="company_name"
              render={({ field }) => (
                <input
                  {...field}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                />
              )}
            />
          </div>

          <div>
            <label className="block mb-1 text-sm font-medium">
              Pickup Location
            </label>
            <Controller
              control={control}
              name="pickup_location"
              render={({ field }) => (
                <input
                  {...field}
                  className="w-full border rounded-md px-3 py-2 focus:outline-none focus:ring-1 focus:ring-black"
                />
              )}
            />
          </div>
        </div>
      )}

      {/* Footer */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <button
          type="button"
          onClick={() => { handleClose(); setEditData(''); reset(); }}
          className="px-6 py-2 border rounded-md text-sm"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={loading}
          className="px-6 py-2 bg-black text-white rounded-md text-sm flex items-center gap-2 disabled:opacity-50"
        >
          Save
          {loading && <Loader size={16} className="animate-spin" />}
        </button>
      </div>
    </form>
  </div>
</div>

  );
}