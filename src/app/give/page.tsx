"use client";

import { useState } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import { giving } from "@/lib/api";
import { Heart, CreditCard, Building, Smartphone, Copy, Check } from "lucide-react";

const givingCategories = [
  { value: "TITHE", label: "Tithes" },
  { value: "OFFERING", label: "Offerings" },
  { value: "SOW_A_SEED", label: "Sow a Seed" },
  { value: "PROJECT_GIVING", label: "Project Giving" },
  { value: "SPECIAL_OFFERING", label: "Special Offerings" },
];

const currencies = [
  { value: "NGN", label: "NGN (\u20A6)" },
  { value: "USD", label: "USD ($)" },
  { value: "GBP", label: "GBP (\u00A3)" },
  { value: "EUR", label: "EUR (\u20AC)" },
];

export default function GivePage() {
  const { user } = useAuth();
  const { success, error } = useToast();
  const [paymentTab, setPaymentTab] = useState<"paystack" | "paypal">("paystack");
  const [currency, setCurrency] = useState("NGN");
  const [isRecurring, setIsRecurring] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [copied, setCopied] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    category: "",
    amount: "",
    name: user?.profile.firstName || "",
    email: user?.email || "",
  });

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!formData.category || !formData.amount) return;

    try {
      setSubmitting(true);
      const amount = parseFloat(formData.amount);

      if (paymentTab === "paystack") {
        const result = await giving.initializePaystack({
          amount,
          email: formData.email,
          recurring: isRecurring,
        });
        success("Payment initialized! Redirecting to Paystack...");
        if (result.authorization_url) {
          window.location.href = result.authorization_url;
        }
      } else {
        const result = await giving.initializePaypal({
          amount,
          currency,
        });
        success("Payment initialized! Redirecting to PayPal...");
        if (result.id) {
          window.location.href = `https://www.paypal.com/checkoutnow?token=${result.id}`;
        }
      }

      setSubmitted(true);
    } catch (err) {
      error("Failed to initialize payment. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  function handleCopy(text: string) {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleFormChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    const { id, value } = e.target;
    setFormData(prev => ({ ...prev, [id]: value }));
  }

  return (
    <>
      {/* Hero */}
      <section className="relative flex items-center justify-center py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <h1 className="font-heading text-4xl font-bold text-white md:text-[42px] md:leading-[48px]">
            Give / Sow
          </h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">
            &ldquo;Give, and it shall be given unto you&rdquo; — Luke 6:38
          </h6>
        </div>
      </section>

      {/* Giving Form */}
      <SectionWrapper variant="white">
        <div className="mx-auto max-w-xl">
          {submitted ? (
            <div className="rounded-[8px] bg-success/10 border border-success/30 p-8 text-center">
              <Heart className="mx-auto h-12 w-12 text-success mb-4" />
              <h3 className="font-heading text-xl font-bold text-success">
                Thank You for Your Generosity!
              </h3>
              <p className="mt-2 font-body text-sm text-gray-text">
                Your gift has been received. A receipt will be sent to your email
                within 2 minutes.
              </p>
              <Button
                variant="primary"
                className="mt-6"
                onClick={() => setSubmitted(false)}
              >
                Give Again
              </Button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-5">
              <div className="text-center mb-2">
                <h2 className="font-heading text-[28px] font-bold text-slate">
                  Make a Gift
                </h2>
                <p className="mt-1 font-body text-sm text-gray-text">
                  Give securely via Paystack or PayPal
                </p>
              </div>

              {/* Category */}
              <div>
                <label className="font-body text-sm font-medium text-slate mb-2 block">
                  Giving Category
                </label>
                <select
                  id="category"
                  value={formData.category}
                  onChange={handleFormChange}
                  required
                  className="w-full rounded-[8px] border border-gray-border bg-off-white px-4 py-3 font-body text-sm text-slate placeholder:text-gray-text focus:border-purple-vivid focus:outline-none focus:ring-2 focus:ring-purple-vivid/15"
                >
                  <option value="">Select a category</option>
                  {givingCategories.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.label}</option>
                  ))}
                </select>
              </div>

              {/* Amount + Currency */}
              <div className="grid grid-cols-3 gap-3">
                <div className="col-span-2">
                  <Input
                    id="amount"
                    label="Amount"
                    type="number"
                    placeholder="0.00"
                    min="100"
                    step="0.01"
                    value={formData.amount}
                    onChange={handleFormChange}
                    required
                  />
                </div>
                <div>
                  <label className="font-body text-sm font-medium text-slate mb-2 block">
                    Currency
                  </label>
                  <select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    className="w-full rounded-[8px] border border-gray-border bg-off-white px-4 py-3 font-body text-sm text-slate focus:border-purple-vivid focus:outline-none focus:ring-2 focus:ring-purple-vivid/15"
                  >
                    {currencies.map(curr => (
                      <option key={curr.value} value={curr.value}>{curr.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Guest info (for non-logged-in users) */}
              <div className="space-y-3 rounded-[8px] bg-off-white p-4">
                <p className="font-heading text-xs font-semibold uppercase tracking-wider text-gray-text">
                  Your Information
                </p>
                <Input
                  id="name"
                  label="Full Name"
                  placeholder="Enter your full name"
                  value={formData.name}
                  onChange={handleFormChange}
                  required
                />
                <Input
                  id="email"
                  label="Email Address"
                  type="email"
                  placeholder="you@example.com"
                  value={formData.email}
                  onChange={handleFormChange}
                  required
                />
              </div>

              {/* Payment Method Tabs */}
              <div>
                <label className="font-body text-sm font-medium text-slate mb-2 block">
                  Payment Method
                </label>
                <div className="flex rounded-[4px] border border-gray-border overflow-hidden">
                  <button
                    type="button"
                    onClick={() => setPaymentTab("paystack")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-heading font-semibold transition-colors ${
                      paymentTab === "paystack"
                        ? "bg-purple text-white"
                        : "bg-white text-slate hover:bg-off-white"
                    }`}
                  >
                    <CreditCard size={16} />
                    Paystack (Nigeria)
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentTab("paypal")}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-heading font-semibold transition-colors ${
                      paymentTab === "paypal"
                        ? "bg-purple text-white"
                        : "bg-white text-slate hover:bg-off-white"
                    }`}
                  >
                    <Building size={16} />
                    PayPal (International)
                  </button>
                </div>

                {/* Paystack options */}
                {paymentTab === "paystack" && (
                  <div className="mt-3 flex gap-3">
                    {[
                      { icon: CreditCard, label: "Card" },
                      { icon: Building, label: "Bank Transfer" },
                      { icon: Smartphone, label: "USSD" },
                    ].map((opt) => (
                      <label
                        key={opt.label}
                        className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-[4px] border border-gray-border py-2.5 text-xs font-heading font-semibold text-slate hover:border-purple-vivid hover:bg-purple-light/30 transition-colors has-[:checked]:border-purple-vivid has-[:checked]:bg-purple-light/30"
                      >
                        <input
                          type="radio"
                          name="paystackMethod"
                          value={opt.label}
                          className="sr-only"
                          defaultChecked={opt.label === "Card"}
                        />
                        <opt.icon size={14} />
                        {opt.label}
                      </label>
                    ))}
                  </div>
                )}

                {paymentTab === "paypal" && (
                  <p className="mt-3 font-body text-xs text-gray-text">
                    You will be redirected to PayPal to complete your payment.
                    Supports credit/debit cards and PayPal balance.
                  </p>
                )}
              </div>

              {/* Recurring */}
              <Checkbox
                id="recurring"
                label="Make this a monthly recurring gift"
                checked={isRecurring}
                onChange={() => setIsRecurring(!isRecurring)}
              />
              {isRecurring && (
                <p className="text-xs font-body text-gray-text -mt-3 ml-7">
                  You will be debited automatically each month. You can cancel
                  anytime from your dashboard. A reminder email is sent 3 days
                  before each debit.
                </p>
              )}

              {/* Submit */}
              <Button
                type="submit"
                variant="giving"
                className="w-full mt-2"
                disabled={submitting || !formData.category || !formData.amount}
              >
                {submitting ? "Processing..." : (paymentTab === "paystack" ? "Give with Paystack" : "Give with PayPal")}
              </Button>
            </form>
          )}
        </div>
      </SectionWrapper>

      {/* Offline Giving Instructions */}
      <SectionWrapper variant="off-white" id="offline">
        <div className="mx-auto max-w-xl">
          <div className="text-center mb-6">
            <h2 className="font-heading text-[28px] font-bold text-slate">
              Offline Giving
            </h2>
            <p className="mt-1 font-body text-sm text-gray-text">
              You can also give via direct bank transfer
            </p>
          </div>

          <div className="rounded-[8px] border border-gray-border bg-white p-6 space-y-4">
            {[
              { label: "Bank Name", value: "First Bank of Nigeria" },
              { label: "Account Name", value: "The Ecclesia Embassy" },
              { label: "Account Number", value: "0123456789" },
            ].map((item) => (
              <div
                key={item.label}
                className="flex items-center justify-between"
              >
                <div>
                  <p className="font-body text-xs text-gray-text">
                    {item.label}
                  </p>
                  <p className="font-heading text-base font-semibold text-slate">
                    {item.value}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleCopy(item.value)}
                  className="flex items-center gap-1 rounded-[4px] bg-off-white px-3 py-1.5 text-xs font-heading font-semibold text-gray-text hover:text-purple transition-colors"
                >
                  {copied ? <Check size={14} /> : <Copy size={14} />}
                  {copied ? "Copied" : "Copy"}
                </button>
              </div>
            ))}
            <p className="font-body text-xs text-gray-text pt-2 border-t border-gray-border">
              After transfer, please send your receipt to{" "}
              <span className="text-purple-vivid">info@theecclesiaembassy.org</span>{" "}
              for confirmation.
            </p>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
