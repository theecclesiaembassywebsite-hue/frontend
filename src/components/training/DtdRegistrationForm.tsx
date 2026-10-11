"use client";

import { useState } from "react";
import { BadgeCheck } from "lucide-react";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Button from "@/components/ui/Button";
import { FormGuardFields } from "@/components/forms/FormGuardFields";

export interface DtdRegistrationValues {
  title: string;
  fullName: string;
  gender: string;
  phone: string;
  email: string;
  homeAddress: string;
  isSaved: string;
  savedDate: string;
  localAssembly: string;
  servesInAssembly: string;
  assemblyCapacity: string;
  prevBibleSchool: string;
  prevSchoolsList: string;
  attendanceMode: string;
}

const EMPTY: DtdRegistrationValues = {
  title: "",
  fullName: "",
  gender: "",
  phone: "",
  email: "",
  homeAddress: "",
  isSaved: "",
  savedDate: "",
  localAssembly: "",
  servesInAssembly: "",
  assemblyCapacity: "",
  prevBibleSchool: "",
  prevSchoolsList: "",
  attendanceMode: "",
};

const MAX_PHOTO_BYTES = 10 * 1024 * 1024;
const PHOTO_TYPES = ["image/jpeg", "image/png", "image/webp", "application/pdf"];

const titleOptions = [
  { value: "Mr.", label: "Mr." },
  { value: "Mrs.", label: "Mrs." },
  { value: "Miss", label: "Miss" },
  { value: "Other", label: "Other" },
];

const textareaClass =
  "w-full rounded-[4px] border border-gray-border bg-white px-4 py-3 font-body text-base text-slate placeholder:text-gray-text transition-colors duration-150 focus:border-purple-vivid focus:ring-3 focus:ring-purple-vivid/15 focus:outline-none";

function Section({ title, hint, children }: { title: string; hint?: string; children: React.ReactNode }) {
  return (
    <fieldset className="space-y-4 border-t border-gray-border pt-5">
      <legend className="font-heading text-sm font-bold uppercase tracking-[0.12em] text-slate">
        {title}
      </legend>
      {hint && <p className="-mt-2 font-body text-xs text-gray-text">{hint}</p>}
      {children}
    </fieldset>
  );
}

function YesNo({
  name,
  label,
  options = ["Yes", "No"],
  value,
  onChange,
}: {
  name: string;
  label: string;
  options?: string[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div>
      <p className="font-body text-sm font-medium text-slate">
        {label} <span className="text-error">*</span>
      </p>
      <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
        {options.map((opt) => (
          <label key={opt} className="inline-flex cursor-pointer items-center gap-2 font-body text-sm text-slate">
            <input
              type="radio"
              name={name}
              value={opt}
              checked={value === opt}
              onChange={() => onChange(opt)}
              required
              className="h-4 w-4 accent-[var(--color-purple,#5b2a9e)]"
            />
            {opt}
          </label>
        ))}
      </div>
    </div>
  );
}

interface Props {
  feeLabel: string;
  submitLabel: string;
  onCancel: () => void;
  /** Resolves when the whole registration (including the photo) is filed. */
  onSubmit: (values: DtdRegistrationValues, photo: File) => Promise<void> | void;
}

export default function DtdRegistrationForm({ feeLabel, submitLabel, onCancel, onSubmit }: Props) {
  const [values, setValues] = useState<DtdRegistrationValues>(EMPTY);
  const [titleOther, setTitleOther] = useState("");
  const [photo, setPhoto] = useState<File | null>(null);
  const [photoError, setPhotoError] = useState("");
  const [read, setRead] = useState(false);
  const [declared, setDeclared] = useState(false);

  const set = <K extends keyof DtdRegistrationValues>(key: K, v: DtdRegistrationValues[K]) =>
    setValues((prev) => ({ ...prev, [key]: v }));

  function pickPhoto(file: File | null) {
    setPhotoError("");
    if (!file) return setPhoto(null);
    if (!PHOTO_TYPES.includes(file.type)) {
      setPhoto(null);
      return setPhotoError("Upload a JPG, PNG, WebP or PDF file.");
    }
    if (file.size > MAX_PHOTO_BYTES) {
      setPhoto(null);
      return setPhotoError("File is larger than 10 MB.");
    }
    setPhoto(file);
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!photo) return setPhotoError("Please upload your passport photograph.");
    const title = values.title === "Other" ? titleOther.trim() || "Other" : values.title;
    void onSubmit(
      {
        ...values,
        title,
        savedDate: values.isSaved === "Yes" ? values.savedDate : "",
        assemblyCapacity: values.servesInAssembly === "Yes" ? values.assemblyCapacity : "",
        prevSchoolsList: values.prevBibleSchool === "Yes" ? values.prevSchoolsList : "",
      },
      photo,
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <FormGuardFields />

      <div className="space-y-2 rounded-[10px] bg-purple-light/40 px-4 py-3 text-sm">
        <p className="font-heading font-semibold text-slate">Important communication</p>
        <p className="text-[13px] text-gray-text">
          Congratulations! We are glad to know that you have made this life-transforming decision.
        </p>
        <p className="text-[13px] text-gray-text">
          Support team — WhatsApp (only): 09167641473 · Email: kisolam@theecclesiaembassy.org
        </p>
        <p className="text-[12px] text-gray-text">
          <strong>Privacy notice:</strong> Every piece of information you provide in this form is private
          and will not be used outside of the purpose it is taken for. Your details remain safe with us and
          will only be accessed by those authorized for the sake of the training.
        </p>
        <p className="font-heading text-[13px] font-bold text-purple">{feeLabel}</p>
      </div>

      <label className="flex cursor-pointer items-start gap-2 font-body text-sm text-slate">
        <input
          type="checkbox"
          checked={read}
          onChange={(e) => setRead(e.target.checked)}
          required
          className="mt-0.5 h-4 w-4"
        />
        <span>
          I have read the instructions above carefully. <span className="text-error">*</span>
        </span>
      </label>

      <Section title="Personal data" hint="Getting to know you.">
        <Select
          id="dtd-title"
          label="Title"
          placeholder="Select title"
          options={titleOptions}
          value={values.title}
          onChange={(e) => set("title", e.target.value)}
          required
        />
        {values.title === "Other" && (
          <Input
            id="dtd-title-other"
            label="Specify title"
            value={titleOther}
            onChange={(e) => setTitleOther(e.target.value)}
            maxLength={30}
            required
          />
        )}
        <Input
          id="dtd-name"
          label="Full Name"
          value={values.fullName}
          onChange={(e) => set("fullName", e.target.value)}
          maxLength={100}
          required
        />
        <YesNo
          name="gender"
          label="Gender"
          options={["Male", "Female"]}
          value={values.gender}
          onChange={(v) => set("gender", v)}
        />
        <Input
          id="dtd-phone"
          label="Phone Number"
          type="tel"
          placeholder="+234..."
          value={values.phone}
          onChange={(e) => set("phone", e.target.value)}
          maxLength={20}
          required
        />
        <Input
          id="dtd-email"
          label="Email Address"
          type="email"
          placeholder="you@example.com"
          value={values.email}
          onChange={(e) => set("email", e.target.value)}
          required
        />
        <div className="flex flex-col gap-1.5">
          <label htmlFor="dtd-address" className="font-body text-sm font-medium text-slate">
            Home Address
          </label>
          <textarea
            id="dtd-address"
            rows={2}
            className={textareaClass}
            value={values.homeAddress}
            onChange={(e) => set("homeAddress", e.target.value)}
            maxLength={500}
            required
          />
        </div>
      </Section>

      <Section title="Spiritual growth" hint="Sharing your new birth and stewardship information.">
        <YesNo name="isSaved" label="Are you saved?" value={values.isSaved} onChange={(v) => set("isSaved", v)} />
        {values.isSaved === "Yes" && (
          <Input
            id="dtd-saved-date"
            label="If yes, when?"
            type="date"
            value={values.savedDate}
            onChange={(e) => set("savedDate", e.target.value)}
          />
        )}
        <Input
          id="dtd-assembly"
          label="Name of your local assembly"
          value={values.localAssembly}
          onChange={(e) => set("localAssembly", e.target.value)}
          maxLength={150}
          required
        />
        <YesNo
          name="servesInAssembly"
          label="Do you serve God in your local assembly?"
          value={values.servesInAssembly}
          onChange={(v) => set("servesInAssembly", v)}
        />
        {values.servesInAssembly === "Yes" && (
          <Input
            id="dtd-capacity"
            label="If yes, in what capacity?"
            value={values.assemblyCapacity}
            onChange={(e) => set("assemblyCapacity", e.target.value)}
            maxLength={150}
          />
        )}
      </Section>

      <Section title="Bible school training history" hint="Previous Bible school trainings.">
        <YesNo
          name="prevBibleSchool"
          label="Have you attended any Bible school training program before now?"
          value={values.prevBibleSchool}
          onChange={(v) => set("prevBibleSchool", v)}
        />
        {values.prevBibleSchool === "Yes" && (
          <div className="flex flex-col gap-1.5">
            <label htmlFor="dtd-prev" className="font-body text-sm font-medium text-slate">
              If yes, which? (please list all attended)
            </label>
            <textarea
              id="dtd-prev"
              rows={2}
              className={textareaClass}
              value={values.prevSchoolsList}
              onChange={(e) => set("prevSchoolsList", e.target.value)}
              maxLength={500}
            />
          </div>
        )}
      </Section>

      <Section title="Declaration and attendance" hint="Please read the statement and answer appropriately.">
        <label className="flex cursor-pointer items-start gap-2 font-body text-sm text-slate">
          <input
            type="checkbox"
            checked={declared}
            onChange={(e) => setDeclared(e.target.checked)}
            required
            className="mt-0.5 h-4 w-4"
          />
          <span>
            I declare that the information provided is true and accurate. <strong>Yes, I do.</strong>{" "}
            <span className="text-error">*</span>
          </span>
        </label>

        <div>
          <YesNo
            name="attendanceMode"
            label="How would you be attending this training?"
            options={["Online", "Onsite"]}
            value={values.attendanceMode}
            onChange={(v) => set("attendanceMode", v)}
          />
          <p className="mt-2 font-body text-xs text-gray-text">
            Note: partakers residing in Abuja require an extra level of approval to attend online.
          </p>
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="dtd-photo" className="font-body text-sm font-medium text-slate">
            Passport photograph <span className="text-error">*</span>
          </label>
          <input
            id="dtd-photo"
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.pdf,image/jpeg,image/png,image/webp,application/pdf"
            onChange={(e) => pickPhoto(e.target.files?.[0] ?? null)}
            required
            className="font-body text-sm text-gray-text file:mr-4 file:rounded-[4px] file:border-0 file:bg-purple-light/60 file:px-4 file:py-2 file:font-heading file:text-sm file:font-semibold file:text-purple"
          />
          <p className="font-body text-xs text-gray-text">JPG, PNG, WebP or PDF. Max 10 MB.</p>
          {photoError && <span className="font-body text-xs text-error">{photoError}</span>}
        </div>
      </Section>

      <div className="flex gap-2 pt-2">
        <Button type="button" variant="secondary" className="flex-1" onClick={onCancel}>
          Cancel
        </Button>
        <Button type="submit" variant="giving" className="flex-1 justify-center gap-2">
          <BadgeCheck size={15} />
          {submitLabel}
        </Button>
      </div>
    </form>
  );
}
