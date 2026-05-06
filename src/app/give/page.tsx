"use client";

import { useState } from "react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import Checkbox from "@/components/ui/Checkbox";
import { useToast } from "@/components/ui/Toast";
import { FadeIn, ScaleIn } from "@/components/ui/Motion";
import { Heart, CreditCard, Building, Copy, Check } from "lucide-react";
import { giving } from "@/lib/api";

export default function GivePage() {
  const { success, error } = useToast();

  // Form state
  const [category, setCategory] = useState("SOW_A_SEED");
  const [amount, setAmount] = useState("");
  const [currency, setCurrency] = useState("NGN");
  const [paymentMethod, setPaymentMethod] = useState<"online" | "bank">(
    "online"
  );
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [isRecurring, setIsRecurring] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);

  const bankAccounts = [
    {
      label: "Main Account",
      bank: "Zenith Bank Plc.",
      name: "The Ecclesia Embassy",
      number: "1014839248",
    },
    {
      label: "Gilgal Camp Account",
      bank: "Zenith Bank Plc.",
      name: "The Ecclesia Embassy Gilgal",
      number: "1014915517",
    },
    {
      label: "Domiciliary Account",
      bank: "Zenith Bank Plc.",
      name: "Ecclesia Christian Embassy Domiciliary",
      number: "5366144582",
    },
    {
      label: "Kingdom Life Squads Mission Account",
      bank: "Zenith Bank Plc.",
      name: "Kingdom Model Life Squad Initiative",
      number: "1015080164",
    },
  ];

  const handleCopyAccountNumber = async (number: string, index: number) => {
    try {
      await navigator.clipboard.writeText(number);
      setCopiedIndex(index);
      success("Account number copied to clipboard");
      setTimeout(() => setCopiedIndex(null), 2000);
    } catch {
      error("Failed to copy account number");
    }
  };

  const handleOnlinePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name || !email || !amount) {
      error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      const parsedAmount = parseFloat(amount);
      const isInternational = currency !== "NGN";

      if (isInternational) {
        // PayPal for international
        const response = await giving.initializePaypal({
          amount: parsedAmount,
          currency,
          category,
          email,
          name,
        });
        success("Payment initiated via PayPal. Redirecting...");
        if (response.orderId) {
          window.location.href = `https://www.paypal.com/checkoutnow?token=${response.orderId}`;
        }
      } else {
        // Paystack for Nigeria
        const response = await giving.initializePaystack({
          amount: parsedAmount,
          currency,
          category,
          email,
          name,
          isRecurring,
        });
        if (response.authorization_url) {
          window.location.href = response.authorization_url;
        } else {
          success("Payment initiated. Redirecting...");
        }
      }
    } catch (err) {
      error(
        err instanceof Error
          ? err.message
          : "Failed to initiate payment"
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {/* HERO SECTION */}
      <div
        className="relative min-h-[500px] flex items-center justify-center overflow-hidden"
        style={{
          backgroundImage: `url(https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?w=1920&q=80)`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      >
        <div className="absolute inset-0 bg-black/50" />
        <div className="relative z-10 text-center px-6">
          <h1 className="font-heading text-5xl md:text-6xl text-white mb-4">
            Give / Sow
          </h1>
          <p className="font-serif italic text-xl md:text-2xl text-white/90 mb-6">
            Your generosity fuels the Kingdom
          </p>
          <div className="w-20 h-[2px] bg-purple-vivid mx-auto mt-4" />
        </div>
      </div>

      {/* GIVING FORM SECTION */}
      <SectionWrapper variant="white">
        <div className="max-w-2xl mx-auto">
          <FadeIn>
            {/* Header */}
            <div className="mb-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-3">
                <Heart
                  size={32}
                  className="text-purple"
                  fill="currentColor"
                />
                <h2 className="font-heading text-4xl text-slate">
                  Give what the Lord has put in your heart 
                </h2>
              </div>
              <p className="font-body text-gray-text">
                The Lord bless you abundantly as you give with a cheerful heart.
              </p>
            </div>

            {/* Form */}
            <form
              onSubmit={handleOnlinePaymentSubmit}
              className="space-y-6"
            >
              {/* Category Select */}
              <div>
                <label className="block font-body text-sm font-medium text-slate mb-2">
                  Gift Category
                </label>
                <Select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  options={[
                    { value: "TITHE", label: "Tithe" },
                    { value: "OFFERING", label: "Offering" },
                    { value: "SOW_A_SEED", label: "Sow a Seed" },
                    { value: "PROJECT_GIVING", label: "Project Giving" },
                    { value: "SPECIAL_OFFERING", label: "Special Offering" },
                  ]}
                  className="w-full"
                />
              </div>

              {/* Amount and Currency */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2">
                  <label className="block font-body text-sm font-medium text-slate mb-2">
                    Amount
                  </label>
                  <Input
                    type="number"
                    placeholder="Enter amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="w-full"
                    min="0"
                    step="0.01"
                  />
                </div>
                <div>
                  <label className="block font-body text-sm font-medium text-slate mb-2">
                    Currency
                  </label>
                  <Select
                    value={currency}
                    onChange={(e) => setCurrency(e.target.value)}
                    options={[
                      { value: "NGN", label: "NGN" },
                      { value: "USD", label: "USD" },
                      { value: "GBP", label: "GBP" },
                      { value: "EUR", label: "EUR" },
                    ]}
                    className="w-full"
                  />
                </div>
              </div>

              {/* Payment Method Tabs */}
              <div>
                <label className="block font-body text-sm font-medium text-slate mb-3">
                  Payment Method
                </label>
                <div className="flex gap-2 border-b border-lavender">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("online")}
                    className={`pb-3 px-4 font-body text-sm font-medium transition-colors ${
                      paymentMethod === "online"
                        ? "border-b-2 border-purple bg-purple text-white -mb-[2px]"
                        : "text-gray-text border-b-2 border-transparent hover:text-slate"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <CreditCard size={16} />
                      Online Payment
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("bank")}
                    className={`pb-3 px-4 font-body text-sm font-medium transition-colors ${
                      paymentMethod === "bank"
                        ? "border-b-2 border-purple bg-purple text-white -mb-[2px]"
                        : "text-gray-text border-b-2 border-transparent hover:text-slate"
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <Building size={16} />
                      Bank Transfer
                    </div>
                  </button>
                </div>
              </div>

              {/* ONLINE PAYMENT TAB */}
              {paymentMethod === "online" && (
                <FadeIn>
                  <div className="space-y-4 pt-2">
                    {/* Name Input */}
                    <div>
                      <label className="block font-body text-sm font-medium text-slate mb-2">
                        Full Name
                      </label>
                      <Input
                        type="text"
                        placeholder="Your full name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Email Input */}
                    <div>
                      <label className="block font-body text-sm font-medium text-slate mb-2">
                        Email Address
                      </label>
                      <Input
                        type="email"
                        placeholder="your@email.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        className="w-full"
                      />
                    </div>

                    {/* Recurring Gift Checkbox */}
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={isRecurring}
                        onChange={(e) =>
                          setIsRecurring(e.target.checked)
                        }
                        id="recurring"
                      />
                      <label
                        htmlFor="recurring"
                        className="font-body text-sm text-gray-text cursor-pointer"
                      >
                        Make this a recurring monthly gift
                      </label>
                    </div>

                    {/* Submit Button */}
                    <Button
                      type="submit"
                      variant="giving"
                      disabled={isLoading}
                      className="w-full mt-6"
                    >
                      {isLoading ? "Processing..." : "Give Now"}
                    </Button>
                  </div>
                </FadeIn>
              )}

              {/* BANK TRANSFER TAB */}
              {paymentMethod === "bank" && (
                <ScaleIn>
                  <div className="pt-2 space-y-4">
                    {bankAccounts.map((account, i) => (
                      <div
                        key={i}
                        className="bg-off-white rounded-lg p-5 border border-lavender"
                      >
                        <h4 className="font-heading text-sm font-bold text-purple mb-3">
                          {account.label}
                        </h4>
                        <div className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="font-body text-xs text-gray-text">Bank</span>
                            <span className="font-body text-sm font-medium text-slate">{account.bank}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-body text-xs text-gray-text">Account Name</span>
                            <span className="font-body text-sm font-medium text-slate text-right">{account.name}</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="font-body text-xs text-gray-text">Account Number</span>
                            <div className="flex items-center gap-2">
                              <span className="font-mono text-sm font-bold text-slate tracking-wider">
                                {account.number}
                              </span>
                              <button
                                type="button"
                                onClick={() => handleCopyAccountNumber(account.number, i)}
                                className="inline-flex items-center justify-center p-1.5 rounded-md hover:bg-lavender transition-colors text-purple"
                                aria-label="Copy account number"
                              >
                                {copiedIndex === i ? (
                                  <Check size={16} />
                                ) : (
                                  <Copy size={16} />
                                )}
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}

                    {/* Instructions */}
                    <div className="p-4 bg-purple-light rounded-lg border border-lavender">
                      <p className="font-body text-sm text-slate">
                        <span className="font-medium">Instructions:</span>{" "}
                        Transfer the amount to the appropriate bank account above.
                        Please include your name as the transfer reference so we
                        can acknowledge your gift.
                      </p>
                    </div>
                  </div>
                </ScaleIn>
              )}
            </form>
          </FadeIn>
        </div>
      </SectionWrapper>

      {/* SCRIPTURE SECTION */}
      <SectionWrapper variant="dark-purple">
        <div className="max-w-2xl mx-auto text-center">
          <p className="font-serif italic text-xl md:text-2xl text-white mb-4">
            "Each of you should give what you have decided in your heart to
            give, not reluctantly or under compulsion, for God loves a cheerful
            giver."
          </p>
          <p className="font-serif italic text-white/60">
            — 2 Corinthians 9:7
          </p>
        </div>
      </SectionWrapper>
    </>
  );
}
