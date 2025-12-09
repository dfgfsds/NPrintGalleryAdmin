"use client";

import { useState } from "react";
// import { useRouter } from "next/navigation";
import axios from "axios";
import ApiUrl from "../../Api-Service/ApiUrls";
import { useNavigate } from "react-router-dom";

interface PaymentModelProps {
    open: boolean;
    close: () => void;
    vendorId: any; // vendor_id
}

const plans = [
    {
        plan_id: 1,
        name: "Starter",
        price: { monthly: 499, yearly: 4999 },
        features: [
            "Add up to 50 products",
            "Order management",
            "Basic Support",
            "All Core Features",
        ],
        popular: false,
    },
    {
        plan_id: 2,
        name: "Pro",
        price: { monthly: 1499, yearly: 9999 },
        features: [
            "Unlimited products",
            "Inventory & order management",
            "Priority Support",
            "Advanced Analytics",
            "All Core Features",
        ],
        popular: true,
    },
    {
        plan_id: 3,
        name: "Enterprise",
        price: { monthly: 2999, yearly: 19999 },
        features: [
            "Unlimited Projects",
            "Custom storefront design",
            "Dedicated Support",
            "Priority customer support",
            "All Core Features",
        ],
        popular: false,
    },
];

type BillingType = "monthly" | "yearly";

export default function PaymentModel({ open, close, vendorId }: PaymentModelProps) {
    // const router = useRouter();
    const [step, setStep] = useState(1);
    const [selectedBilling, setSelectedBilling] = useState<BillingType>("monthly");
    const [selectedPlan, setSelectedPlan] = useState<any>(null);
    const [loading, setLoading] = useState(false);
    const [paymentSuccess, setPaymentSuccess] = useState(false);
    const navigate = useNavigate();
    if (!open) return null;

    const handleNext = () => setStep((prev) => prev + 1);
    const handleBack = () => setStep((prev) => prev - 1);



    const handlePayNow = async () => {
        // if (!vendorId) {
        //   alert("Vendor ID missing!");
        //   return;
        // }

        setLoading(true);
        try {
            const { data } = await axios.post(ApiUrl?.paymentGateway,
                {
                    plan_id: 1,
                    vendor_id: vendorId?.id,
                    main_multi_vendor_user_id: vendorId?.main_multi_vendor_user,
                }
            );

            if (data?.success) {
                console.log(data, "checkkk")
                console.log(Number(data?.payment_data?.amount), "checkkk")

                const options = {
                    key: "rzp_live_jAcHs3oc6QO8UD",
                    amount: Number(data?.payment_data?.amount) * 100,
                    currency: "INR",
                    name: "Gubara",
                    description: "Plan Payment",
                    order_id: data?.payment_data?.payment_order_id,
                    handler: function (response: any) {
                        // alert("Payment Successful!");
                        // console.log("Payment Success:", response);
                        // close();
                        navigate(`/store/${vendorId?.id}`);
                    },
                    prefill: {
                        name: vendorId?.store_name || "Vendor Name",
                        email: vendorId?.user?.email || "Vendor Email",
                        contact: vendorId?.user?.email || "Vendor Contact",
                    },
                    theme: {
                        color: "#3399cc",
                    },
                };

                const rzp: any = new window.Razorpay(options);
                rzp.open();
            } else {
                alert(data?.message || "Payment initiation failed!");
            }
        } catch (error) {
            console.error(error);
            alert("Something went wrong while initiating payment!");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
            <div className="bg-white w-full max-w-3xl rounded-lg shadow-lg p-6 relative overflow-y-auto max-h-[90vh]">
                {/* Close Button */}
                <button
                    onClick={() => { close(); setStep(1); setPaymentSuccess(false),navigate('/dashboard') }}
                    className="absolute top-2 right-4 text-gray-500 text-2xl hover:text-red-500"
                >
                    &times;
                </button>

                {/* Step 1 - Choose Plan */}
                {step === 1 && (
                    <>
                        <h2 className="text-xl font-bold mb-6 text-center">Choose a Plan</h2>

                        {/* Billing Toggle */}
                        <div className="mb-6 flex justify-center gap-2">
                            <button
                                onClick={() => setSelectedBilling("monthly")}
                                className={`px-4 py-2 rounded-l-full font-medium transition ${selectedBilling === "monthly"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-600 text-gray-300"
                                    }`}
                            >
                                Monthly
                            </button>
                            <button
                                onClick={() => setSelectedBilling("yearly")}
                                className={`px-4 py-2 rounded-r-full font-medium transition ${selectedBilling === "yearly"
                                    ? "bg-indigo-600 text-white"
                                    : "bg-gray-600 text-gray-300"
                                    }`}
                            >
                                Yearly <span className="ml-2 text-xs text-blue-300">(Save 20%)</span>
                            </button>
                        </div>

                        {/* Plan Cards */}
                        <div className="grid gap-6 sm:grid-cols-3">
                            {plans.map((plan) => (
                                <div
                                    key={plan.plan_id}
                                    className={`relative flex flex-col rounded-xl border border-slate-700 bg-gray-900 p-6 shadow-md ${plan.popular ? "border-blue-500 ring-2 ring-blue-500" : ""
                                        }`}
                                >
                                    {plan.popular && (
                                        <span className="absolute right-3 top-3 rounded-full bg-blue-600 px-2 py-1 text-xs font-semibold text-white">
                                            Most Popular
                                        </span>
                                    )}

                                    <h3 className="mb-2 text-lg font-semibold text-white">
                                        {plan.name}
                                    </h3>

                                    <div className="mb-4 flex items-end justify-start">
                                        <span className="text-2xl font-bold text-white">
                                            ₹{plan.price[selectedBilling]}
                                        </span>
                                        <span className="ml-2 text-gray-400 text-sm font-medium">
                                            /{selectedBilling === "monthly" ? "mo" : "yr"}
                                        </span>
                                    </div>

                                    <ul className="mb-4 space-y-1 text-sm text-gray-300">
                                        {plan.features.map((feature) => (
                                            <li key={feature} className="flex items-center">
                                                <svg
                                                    className="mr-2 h-4 w-4 text-blue-400"
                                                    fill="none"
                                                    stroke="currentColor"
                                                    strokeWidth={2}
                                                    viewBox="0 0 24 24"
                                                >
                                                    <path
                                                        strokeLinecap="round"
                                                        strokeLinejoin="round"
                                                        d="M5 13l4 4L19 7"
                                                    />
                                                </svg>
                                                {feature}
                                            </li>
                                        ))}
                                    </ul>

                                    <button
                                        onClick={() => {
                                            setSelectedPlan(plan);
                                            handleNext();
                                        }}
                                        className="mt-auto w-full rounded bg-indigo-600 py-2 text-white hover:bg-indigo-700"
                                    >
                                        Choose {plan.name}
                                    </button>
                                </div>
                            ))}
                        </div>
                    </>
                )}

                {/* Step 2 - Show Plan Details + Pay Now */}
                {step === 2 && !paymentSuccess && selectedPlan && (
                    <div className="space-y-6">
                        <h2 className="text-2xl font-semibold text-center text-gray-800">
                            Confirm Your Plan
                        </h2>

                        <div className="border-t pt-4">
                            <div className="flex justify-between text-lg text-gray-700">
                                <span>Selected Plan:</span>
                                <span className="font-medium text-gray-900">{selectedPlan.name}</span>
                            </div>
                            <div className="flex justify-between text-lg text-gray-700 mt-1">
                                <span>Total:</span>
                                <span className="font-semibold text-gray-900">
                                    ₹{selectedPlan.price[selectedBilling]}
                                </span>
                            </div>
                        </div>

                        <div className="flex justify-between pt-4">
                            <button
                                onClick={handleBack}
                                className="px-4 py-2 rounded border border-gray-300 hover:bg-gray-100 transition"
                            >
                                Back
                            </button>
                            <button
                                onClick={handlePayNow}
                                disabled={loading}
                                className="px-4 py-2 rounded bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
                            >
                                {loading ? "Processing..." : "Pay Now"}
                            </button>
                        </div>
                    </div>
                )}

                {/* Step - Payment Success */}
                {paymentSuccess && (
                    <div className="flex flex-col items-center justify-center text-center space-y-4 py-10">
                        <img
                            src="https://cdn-icons-png.flaticon.com/512/845/845646.png"
                            alt="Success"
                            className="w-20 h-20"
                        />
                        <h2 className="text-2xl font-semibold text-green-600">Payment Successful</h2>
                        <p className="text-gray-600">Thank you for purchasing the {selectedPlan?.name} plan.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
