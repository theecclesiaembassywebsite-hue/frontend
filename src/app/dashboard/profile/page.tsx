"use client";

import { useEffect, useState } from "react";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import { profile as profileApi } from "@/lib/api";
import { useToast } from "@/components/ui/Toast";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import { Skeleton, SkeletonGroup } from "@/components/ui/Skeleton";

interface ProfileData {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  dateOfBirth?: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  occupation?: string;
  maritalStatus?: string;
  photoUrl?: string;
  ministryInvolvement?: string;
}

const maritalStatusOptions = [
  { value: "single", label: "Single" },
  { value: "married", label: "Married" },
  { value: "widowed", label: "Widowed" },
  { value: "divorced", label: "Divorced" },
  { value: "prefer_not_to_say", label: "Prefer not to say" },
];

const countryOptions = [
  { value: "NG", label: "Nigeria" },
  { value: "US", label: "United States" },
  { value: "UK", label: "United Kingdom" },
  { value: "CA", label: "Canada" },
  { value: "AU", label: "Australia" },
  { value: "ZA", label: "South Africa" },
  { value: "GH", label: "Ghana" },
  { value: "KE", label: "Kenya" },
  { value: "Other", label: "Other" },
];

function ProfileEditContent() {
  const { success, error: showError } = useToast();
  const [formData, setFormData] = useState<ProfileData>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setLoading(true);
        const data = await profileApi.getProfile("");
        setFormData(data || {});
        setErrors({});
      } catch (err) {
        showError(err instanceof Error ? err.message : "Failed to load profile");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [showError]);

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!formData.firstName?.trim()) {
      newErrors.firstName = "First name is required";
    }
    if (!formData.lastName?.trim()) {
      newErrors.lastName = "Last name is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      setSaving(true);
      await profileApi.updateProfile({
        firstName: formData.firstName,
        lastName: formData.lastName,
        photoUrl: formData.photoUrl,
      });
      success("Profile updated successfully!");
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-off-white min-h-screen">
        <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:px-8">
          <div className="flex items-center gap-3 mb-6">
            <Skeleton className="h-5 w-5" />
            <Skeleton className="h-8 w-48" />
          </div>
          <div className="bg-white rounded-[8px] border border-gray-border p-8">
            <SkeletonGroup count={8} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-off-white min-h-screen">
      <div className="mx-auto max-w-[1200px] px-4 py-8 sm:px-6 md:px-8">
        <div className="flex items-center gap-3 mb-6">
          <Link href="/dashboard" className="text-gray-text hover:text-purple transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <h1 className="font-heading text-2xl font-bold text-slate">
            Edit Profile
          </h1>
        </div>

        <div className="bg-white rounded-[8px] border border-gray-border p-6 shadow-sm md:p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Basic Information */}
            <div>
              <h2 className="font-heading text-lg font-bold text-slate mb-4">
                Basic Information
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  id="firstName"
                  name="firstName"
                  label="First Name"
                  placeholder="Your first name"
                  value={formData.firstName || ""}
                  onChange={handleInputChange}
                  error={errors.firstName}
                  required
                />
                <Input
                  id="lastName"
                  name="lastName"
                  label="Last Name"
                  placeholder="Your last name"
                  value={formData.lastName || ""}
                  onChange={handleInputChange}
                  error={errors.lastName}
                  required
                />
              </div>
            </div>

            {/* Contact Information */}
            <div>
              <h2 className="font-heading text-lg font-bold text-slate mb-4">
                Contact Information
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  id="phone"
                  name="phone"
                  label="Phone Number"
                  type="tel"
                  placeholder="+234..."
                  value={formData.phone || ""}
                  onChange={handleInputChange}
                />
                <Input
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  placeholder="your@email.com"
                  disabled
                  value={formData.email || ""}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
                <Input
                  id="address"
                  name="address"
                  label="Address"
                  placeholder="Street address"
                  value={formData.address || ""}
                  onChange={handleInputChange}
                />
                <Input
                  id="city"
                  name="city"
                  label="City"
                  placeholder="City"
                  value={formData.city || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
                <Input
                  id="state"
                  name="state"
                  label="State/Region"
                  placeholder="State or region"
                  value={formData.state || ""}
                  onChange={handleInputChange}
                />
                <Select
                  id="country"
                  name="country"
                  label="Country"
                  options={countryOptions}
                  placeholder="Select country"
                  value={formData.country || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Personal Information */}
            <div>
              <h2 className="font-heading text-lg font-bold text-slate mb-4">
                Personal Information
              </h2>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                <Input
                  id="dateOfBirth"
                  name="dateOfBirth"
                  label="Date of Birth"
                  type="date"
                  value={formData.dateOfBirth || ""}
                  onChange={handleInputChange}
                />
                <Select
                  id="maritalStatus"
                  name="maritalStatus"
                  label="Marital Status"
                  options={maritalStatusOptions}
                  placeholder="Select status"
                  value={formData.maritalStatus || ""}
                  onChange={handleInputChange}
                />
              </div>
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2 mt-4">
                <Input
                  id="occupation"
                  name="occupation"
                  label="Occupation"
                  placeholder="Your occupation"
                  value={formData.occupation || ""}
                  onChange={handleInputChange}
                />
                <Input
                  id="photoUrl"
                  name="photoUrl"
                  label="Photo URL"
                  placeholder="https://..."
                  value={formData.photoUrl || ""}
                  onChange={handleInputChange}
                />
              </div>
            </div>

            {/* Ministry */}
            <div>
              <h2 className="font-heading text-lg font-bold text-slate mb-4">
                Ministry Involvement
              </h2>
              <Input
                id="ministryInvolvement"
                name="ministryInvolvement"
                label="Areas of Ministry"
                placeholder="e.g., Worship, Prayer, Teaching, etc."
                value={formData.ministryInvolvement || ""}
                onChange={handleInputChange}
              />
            </div>

            {/* Actions */}
            <div className="flex gap-3 pt-6 border-t border-gray-border">
              <Button
                type="submit"
                variant="primary"
                loading={saving}
                disabled={saving}
              >
                Save Changes
              </Button>
              <Link href="/dashboard">
                <Button type="button" variant="secondary">
                  Cancel
                </Button>
              </Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default function ProfileEditPage() {
  return (
    <ProtectedRoute>
      <ProfileEditContent />
    </ProtectedRoute>
  );
}
