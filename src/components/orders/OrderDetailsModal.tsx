import React, { useState } from 'react';
import { X } from 'lucide-react';
import { Order, OrderStatus } from '../../types/order';
import Button from '../Button';
import OrderStatusBadge from './OrderStatusBadge';
import { getOrderItemsApi, patchOrderStatusApi, postRefundApi } from '../../Api-Service/Apis';
import { InvalidateQueryFilters, useQuery, useQueryClient } from '@tanstack/react-query';
import formatDateTime from '../../lib/utils';
// import formatDateTime from '../../lib/utils';
// import { baseUrl } from '../../Api-Service/ApiUrls';
import { baseUrl } from '../../Api-Service/ApiUrls';
import axios from 'axios';
import { useParams } from 'react-router-dom';

interface OrderDetailsModalProps {
  order: any;
  onClose: () => void;
  onUpdateStatus: (status: OrderStatus) => void;
}

const formatYMD = (d: Date) => {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
};


export default function OrderDetailsModal({ order, onClose, onUpdateStatus }: OrderDetailsModalProps) {
  const queryClient = useQueryClient();
  const [showRefundForm, setShowRefundForm] = useState(false);
  const [refundReason, setRefundReason] = useState("");
  const [refundLoading, setRefundLoading] = useState(false);
  const { id } = useParams()

  // Date range: today → today + 10 days
  const today = new Date();
  const maxDateObj = new Date();
  maxDateObj.setDate(maxDateObj.getDate() + 10);
  const minDate = formatYMD(today);
  const maxDate = formatYMD(maxDateObj);

  const API_BASE_URL = baseUrl;
  const [pickupDate, setPickupDate] = useState<string>(minDate);
  const [loadingAction, setLoadingAction] = useState(false);
  const [pickupDone, setPickupDone] = useState(false);
  const [pdfLinks, setPdfLinks] = useState<{
    manifest?: string;
    label?: string;
    invoice?: string;
  }>({});

  const { data, isLoading, error }: any = useQuery({
    queryKey: ["getOrderItemsData", order?.user, order?.vendor, order?.id],
    queryFn: () => getOrderItemsApi(`?user_id=${order?.user}&vendor_id=${order?.vendor}&order_id=${order?.id}`),
  })

  const handleUpadteStatus = async (val: any) => {
    try {
      const updateApi = await patchOrderStatusApi(order?.id,
        {
          status: val,
          updated_by: "vendor"
        }
      )
      if (updateApi) {
        queryClient.invalidateQueries(['getProductData'] as InvalidateQueryFilters);
      }
    } catch (error) {

    }
  };


  const handleRefundSubmit = async () => {
    setRefundLoading(true);
    const payload = {
      order_id: order?.id,
      vendor_id: order?.vendor,
      created_by: `vendor${order?.vendor}`,
      reason: refundReason
    }
    try {
      const updateApi = await postRefundApi('', payload)
      if (updateApi) {
        setRefundLoading(false);
        queryClient.invalidateQueries(['getOrderItemsData'] as InvalidateQueryFilters);
        setShowRefundForm(false);
      }
    } catch (error) {

    }
    setShowRefundForm(false);
  };

  /** ✅ Shiprocket API Action */
  const handleShiprocketAction = async (action: string, pickupDate?: string) => {
    try {
      setLoadingAction(true);
      let url = "";
      let payload: any = { vendor_id: id };

      if (action === "pickup") {
        // Enforce pickup date range safety
        if (!pickupDate) {
          alert("Please select a pickup date.");
          return;
        }
        // Validate within allowed window
        const picked = new Date(pickupDate + "T00:00:00"); // local-safety parse
        const min = new Date(minDate + "T00:00:00");
        const max = new Date(maxDate + "T23:59:59");

        if (picked < min || picked > max) {
          alert(`Pickup date must be between ${minDate} and ${maxDate}.`);
          return;
        }

        url = `${API_BASE_URL}/orders/${order?.id}/shiprocket-pickup-request/`;
        payload.pickup_date = pickupDate; // <-- use user selection
      } else if (action === "manifest") {
        url = `${API_BASE_URL}/orders/${order?.id}/shiprocket-generate-manifest/`;
      } else if (action === "manifest-print") {
        url = `${API_BASE_URL}/orders/${order?.id}/shiprocket-manifest/print/`;
      } else if (action === "label") {
        url = `${API_BASE_URL}/orders/${order?.id}/shiprocket-generate-label/`;
      } else if (action === "invoice") {
        url = `${API_BASE_URL}/orders/${order?.id}/shiprocket-generate-invoice/`;
      } else {
        alert("Invalid action");
        return;
      }

      const response = await axios.post(url, payload);

      if (action === "pickup" && response.data.success) {
        setPickupDone(true);
      }

      if (response.data?.data?.manifest_url) {
        setPdfLinks((prev) => ({ ...prev, manifest: response.data.data.manifest_url }));
      }
      if (response.data?.data?.label_url) {
        setPdfLinks((prev) => ({ ...prev, label: response.data.data.label_url }));
      }
      if (response.data?.data?.invoice_url) {
        setPdfLinks((prev) => ({ ...prev, invoice: response.data.data.invoice_url }));
      }

      alert(response.data.message);
    } catch (error: any) {
      alert(error.response?.data?.message || "Something went wrong");
    } finally {
      setLoadingAction(false);
    }
  };


  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
          <div className="absolute right-0 top-0 pr-4 pt-4">
            <button onClick={onClose} className="text-gray-400 hover:text-gray-500">
              <X className="h-6 w-6" />
            </button>
          </div>
          {isLoading ? (
            <>
              <div className="sm:flex sm:items-start animate-pulse">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <div className="h-6 bg-gray-300 rounded w-1/3 mb-6"></div>

                  <div className="mt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                      <div className="h-6 w-20 bg-gray-300 rounded"></div>
                    </div>

                    <div>
                      <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                      <div className="h-10 bg-gray-300 rounded"></div>
                    </div>

                    <div>
                      <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>

                    <div>
                      <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                      <div className="space-y-1">
                        <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>

                    <div>
                      <div className="h-4 bg-gray-300 rounded w-1/4 mb-2"></div>
                      <div className="divide-y divide-gray-200">
                        {[...Array(3)].map((_, idx) => (
                          <div key={idx} className="py-3 flex justify-between">
                            <div className="flex items-center">
                              <div className="h-10 w-10 bg-gray-300 rounded mr-3"></div>
                              <div className="space-y-1">
                                <div className="h-4 bg-gray-300 rounded w-32"></div>
                              </div>
                            </div>
                            <div className="space-y-1 text-right">
                              <div className="h-4 bg-gray-300 rounded w-12"></div>
                              <div className="h-4 bg-gray-300 rounded w-16"></div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-base font-medium">
                        <div className="h-4 bg-gray-300 rounded w-16"></div>
                        <div className="h-4 bg-gray-300 rounded w-20"></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </>
          ) : (
            <>
              {/* <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    Order #{data?.data?.id}
                  </h3>

                  <div className="mt-4 space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-500">Status</span>
                      <OrderStatusBadge status={data?.data?.status} />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700">Update Status</label>
                      <select
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        value={data?.data?.status}
                        onChange={(e) => handleUpadteStatus(e.target.value)}
                      >
                        <option value="Pending">Pending</option>
                        <option value="Processing">Processing</option>
                        <option value="Shipped">Shipped</option>
                        <option value="Delivered">Delivered</option>
                        <option value="Cancelled">Cancelled</option>
                      </select>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-gray-700">Customer Details</h4>
                      <div className="mt-2 text-sm">
                        <p>{data?.data?.consumer_address?.customer_name}</p>
                        <p>{data?.data?.consumer_address?.email_address}</p>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-gray-700">Shipping Address</h4>
                      <div className="mt-2 text-sm">
                        <p>{data?.data?.consumer_address?.address_line1},{data?.data?.consumer_address?.address_line1}</p>
                        <p>{data?.data?.consumer_address?.city}, {data?.data?.consumer_address?.state} {data?.data?.consumer_address?.zipCode}</p>
                        <div className='flex gap-1'>
                          <p>{data?.data?.consumer_address?.country}</p>-<p>{data?.data?.consumer_address?.postal_code}</p>
                        </div>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-sm text-gray-700">Order Items</h4>
                      <div className="mt-2 divide-y divide-gray-200">
                        {data?.data?.order_items?.map((item: any) => (
                          <div key={item.id} className="py-3 flex justify-between">
                            <div className="flex items-center">
                              {item.product?.image_urls[0] && (
                                <img src={item?.product?.image_urls[0]} className="h-10 w-10 rounded object-cover mr-3" />
                              )}
                              <div className="text-sm">
                                <p className="font-medium">{item?.product?.name}</p>
                              </div>
                            </div>
                            <div className="text-sm">
                              <p> ₹{item?.price} × {item?.quantity}</p>
                              <p className="font-medium"> ₹{item?.price * item?.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="border-t pt-4">
                      <div className="flex justify-between text-base font-medium">
                        <p>Total</p>
                        <p> ₹{data?.data?.total_amount}</p>
                      </div>
                    </div>

                        <div className="flex justify-between items-center">
                      <span className="text-base  font-medium">Payment Status</span>
                      <div className={`p-1 rounded-lg uppercase ${data?.data?.payment_status === 'paid' ? 'bg-green-200 text-green-700' :'bg-yellow-50 text-yellow-700'}`}>{data?.data?.payment_status} </div>
                    </div>
                  </div>
                </div>
              </div> */}
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <h3 className="text-lg font-semibold leading-6 text-gray-900">
                    Order #{data?.data?.id}
                  </h3>
                  <div className="mt-4 space-y-4">
                    {/* Status + Dropdown */}
                    <div className="flex justify-between items-center">
                      <span className="text-md text-gray-900 font-bold">Status</span>
                      <OrderStatusBadge status={data?.data?.status} />
                    </div>

                    <div className='flex justify-between items-center'>
                      {/* {!(data?.data?.status === 'Cancelled' || data?.data?.status === 'Delivered' || data?.data?.status === 'Cancelled/Refunded' || data?.data?.status === 'Failed') && ( */}
                      {!(data?.data?.status === 'Cancelled/Refunded') && (
                        <div>
                          <label className="block text-md mb-2 font-medium text-black">Update Status</label>
                          <select
                            className="mt-1 block w-auto p-2 rounded-md border-gray-300 shadow-sm focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                            value={data?.data?.status}
                            onChange={(e) => handleUpadteStatus(e.target.value)}
                          >
                            {["Pending", "Processing", "Shipped", "Delivered", "Cancelled"].map((status) => (
                              <option key={status} value={status}>{status}</option>
                            ))}
                          </select>
                        </div>
                      )}
                      {/* Refund Button */}
                      {(!showRefundForm) && (
                        <>
                          {data?.data?.payment_status !== 'unpaid' && (
                            <div className="mt-4">
                              {(data?.data?.status !== 'Cancelled/Refunded') && (
                                <button
                                  className='bg-red-500 p-2 text-white rounded-md hover:bg-red-600'
                                  onClick={() => setShowRefundForm(!showRefundForm)}
                                >
                                  Refund
                                </button>
                              )}
                            </div>
                          )}
                        </>
                      )}

                    </div>

                    {showRefundForm && (
                      <div className="mt-4 p-4 bg-gray-50 rounded-lg border">
                        <h4 className="font-medium text-sm mb-1">Reason for Refund</h4>
                        <textarea
                          className="w-full border rounded px-3 py-2 text-sm"
                          rows={5}
                          placeholder="Enter refund reason"
                          value={refundReason}
                          onChange={(e) => setRefundReason(e.target.value)}
                        />
                        <div className="mt-1 flex justify-end gap-2">
                          <button
                            className='bg-red-500 p-2 text-white rounded-md hover:bg-red-600' onClick={() => setShowRefundForm(false)}>Cancel</button>
                          <Button onClick={handleRefundSubmit}>Submit</Button>
                        </div>
                      </div>
                    )}

                    {/* Customer */}
                    <div>
                      <h4 className=" text-sm font-medium text-black">Customer Details</h4>
                      <div className="mt-2 text-sm">
                        <p>{data?.data?.consumer_address?.customer_name}</p>
                        <p>{data?.data?.consumer_address?.email_address}</p>
                      </div>
                    </div>

                    {/* Address */}
                    <div>
                      <h4 className="text-sm font-medium text-black">Shipping Address</h4>
                      <div className="mt-2 text-sm text-gray-700">
                        <p className='flex flex-wrap'>{data?.data?.consumer_address?.address_line1}</p>
                        <p>{data?.data?.consumer_address?.city}, {data?.data?.consumer_address?.state} {data?.data?.consumer_address?.zipCode}</p>
                        <p>{data?.data?.consumer_address?.country} - {data?.data?.consumer_address?.postal_code}</p>
                      </div>
                    </div>

                    {/* Items */}
                    <div>
                      <h4 className="font-medium text-sm text-black">Order Items</h4>
                      {/* <div className="mt-2 divide-y divide-gray-200">
                        {data?.data?.order_items?.map((item: any) => (
                          <div key={item.id} className="py-3 flex justify-between">
                            <div className="flex items-center">
                              {item.product?.image_urls[0] && (
                                <img src={item.product.image_urls[0]} className="h-10 w-10 rounded object-cover mr-3" />
                              )}
                              <div className="text-sm">
                                <p className="font-medium">{item?.product?.name}</p>
                              </div>
                            </div>
                            <div className="text-sm text-right">
                              <p>₹{item.price} × {item.quantity}</p>
                              <p className="font-medium">₹{item.price * item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div> */}
                      <div className="mt-2 divide-y divide-gray-200">
                        {data?.data?.order_items?.map((item: any) => (
                          <div key={item.id} className="py-3">

                            {/* Product Display */}
                            <div className="flex justify-between items-center">
                              <div className="flex items-center">

                                {/* 🔹 Product Original Image */}
                                {item.product?.image_urls?.length > 0 && (
                                  <img
                                    src={item.product.image_urls[0]}
                                    className="h-10 w-10 rounded object-cover mr-3"
                                    alt="Product"
                                  />
                                )}

                                <div className="text-sm">
                                  <p className="font-medium">{item?.product?.name}</p>
                                </div>
                              </div>

                              <div className="text-sm text-right">
                                <p>₹{item.price} × {item.quantity}</p>
                                <p className="font-medium">₹{item.price * item.quantity}</p>
                              </div>
                            </div>

                            {item?.image_urls?.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm font-semibold mb-2">Customer Uploaded Image</p>

                                <div className="relative w-16 h-16 group">
                                  <img
                                    src={item.image_urls[0]}
                                    className="w-16 h-16 rounded object-cover border"
                                    alt="Uploaded"
                                  />

                                  {/* Click Download (JavaScript method) */}
                                  <button
                                    type="button"
                                    onClick={async () => {
                                      try {
                                        const response = await fetch(item.image_urls[0], { mode: "cors" });
                                        const blob = await response.blob();
                                        const link = document.createElement("a");
                                        link.href = URL.createObjectURL(blob);
                                        link.download = "customer-uploaded-image";
                                        link.click();
                                        URL.revokeObjectURL(link.href);
                                      } catch (error) {
                                        console.error("Download failed:", error);
                                      }
                                    }}
                                    className="absolute inset-0 bg-black bg-opacity-60 rounded flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                  >
                                    <svg
                                      xmlns="http://www.w3.org/2000/svg"
                                      className="h-6 w-6 text-white"
                                      fill="none"
                                      viewBox="0 0 24 24"
                                      stroke="currentColor"
                                    >
                                      <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5m0 0l5-5m-5 5V4"
                                      />
                                    </svg>
                                  </button>
                                </div>
                              </div>
                            )}





                          </div>
                        ))}
                      </div>

                    </div>

                    {/* Total */}
                    <div className="border-t pt-4">
                      <div className="flex justify-between text-base font-medium">
                        <p>Total</p>
                        <p>₹{data?.data?.total_amount}</p>
                      </div>
                    </div>

                    {/* Payment Status */}
                    <div className="flex justify-between items-center">
                      <span className="text-base font-medium">Payment Status</span>
                      <div className={`px-3 py-1 text-sm rounded-lg uppercase font-semibold tracking-wide 
            ${data?.data?.payment_status === 'paid' ? 'bg-green-200 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                        {data?.data?.payment_status}
                      </div>
                    </div>


                    {/* Dates */}
                    <div className="flex justify-between gap-2 flex-wrap text-sm text-gray-500 mt-1 mb-2">
                      <p className='font-bold text-black'>Created: <span className='text-gray-500'>{formatDateTime(data?.data?.created_at)}</span></p>
                      <p className='font-bold text-black'>Updated: <span className='text-gray-500'>{formatDateTime(data?.data?.updated_at)}</span></p>
                    </div>


                  </div>
                </div>
              </div>
              {data?.data?.delivery_partner === 'shiprocket' && data?.data?.status === 'Pending' && (
                <>
                  <div className="w-full bg-white rounded-xl p-2  shadow-sm mt-5">

                    {/* Title */}
                    <h4 className="font-semibold text-[15px] text-gray-800 mb-3">
                      Shiprocket
                    </h4>

                    {/* Row: Date + Button */}
                    <div className="flex items-center justify-between gap-3">

                      {/* Pickup Date Input */}
                      <div className="flex flex-col w-1/2">
                        <label
                          htmlFor="pickup-date"
                          className="text-[13px] text-gray-600 mb-1 font-medium"
                        >
                          Pickup Date
                        </label>

                        <input
                          id="pickup-date"
                          type="date"
                          className="border border-gray-300 rounded-lg px-3 py-2 text-sm
               focus:outline-none focus:ring-2 focus:ring-indigo-500
               disabled:bg-gray-100 disabled:text-gray-400"
                          value={pickupDate}
                          min={minDate}
                          max={maxDate}
                          onChange={(e) => setPickupDate(e.target.value)}
                        />
                      </div>

                      {/* Button */}
                      <Button
                        className="h-[42px] px-5 bg-indigo-600 text-white rounded-lg font-medium  mt-4
               hover:bg-indigo-700 transition disabled:bg-gray-300 whitespace-nowrap"
                        onClick={() => handleShiprocketAction("pickup", pickupDate)}
                        disabled={loadingAction || data?.data?.status !== "Pending"}
                      >
                        Request Pickup
                      </Button>
                    </div>
                  </div>
                </>
              )}


              {/* {data?.data?.status !== 'Delivered' && data?.data?.status !== 'Cancelled/Refunded' && data?.data?.status !== 'Shipment Failed' && data?.data?.status !== 'Cancelled' && data?.data?.status !== 'Failed' && data?.data?.status !== 'Cancellation Requested' && data?.data?.delivery_partner !== 'own_delivery' && ( */}
              {data?.data?.status === 'Shipped' && data?.data?.status === 'Out For Delivery' && data?.data?.status !== 'Processing' && data?.data?.delivery_partner === 'shiprocket' && (

                <>

                  {/* Shiprocket Actions */}
                  <div className="space-y-2 mt-4">
                    <div className="flex flex-wrap gap-2 mt-2">
                      <Button
                        onClick={() => handleShiprocketAction("manifest")}
                        disabled={data?.data?.status === 'Pending' || loadingAction}
                      >
                        Generate Manifest
                      </Button>
                      <Button
                        onClick={() => handleShiprocketAction("label")}
                        disabled={data?.data?.status === 'Pending' || loadingAction}
                      >
                        Generate Label
                      </Button>
                      <Button
                        onClick={() => handleShiprocketAction("invoice")}
                        disabled={data?.data?.status === 'Pending' || loadingAction}
                      >
                        Generate Invoice
                      </Button>
                    </div>
                  </div>

                  {/* Show Links */}
                  <div className="mt-4">
                    {pdfLinks.manifest && (
                      <p>
                        Manifest:{" "}
                        <a
                          href={pdfLinks.manifest}
                          target="_blank"
                          className="text-blue-600 underline"
                        >
                          Download
                        </a>
                      </p>
                    )}
                    {pdfLinks.label && (
                      <p>
                        Label:{" "}
                        <a
                          href={pdfLinks.label}
                          target="_blank"
                          className="text-blue-600 underline"
                        >
                          Download
                        </a>
                      </p>
                    )}
                    {pdfLinks.invoice && (
                      <p>
                        Invoice:{" "}
                        <a
                          href={pdfLinks.invoice}
                          target="_blank"
                          className="text-blue-600 underline"
                        >
                          Download
                        </a>
                      </p>
                    )}
                  </div>

                </>
              )}
            </>
          )}


          <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
            <Button onClick={onClose}>Close</Button>
          </div>
        </div>
      </div>

    </div>
  );
}