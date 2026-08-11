import type { TrainingCourse } from "@/lib/api";

/**
 * Whether a course can be enrolled in right now, and what to call its state.
 *
 * Two independent things decide this and the UI used to read only one of them.
 * `status` is derived from the session dates (UPCOMING / IN_SESSION / ENDED);
 * `registrationOpen` is an admin toggle that closes intake independently. A
 * course that is in session with intake closed therefore rendered as "Open for
 * Enrollment" on a button that was disabled — the label said one thing and the
 * control did the other.
 *
 * Both programme pages read this so their wording cannot drift apart, and the
 * `joinable` flag comes from the same place as the label, so a disabled control
 * can never be captioned as open.
 */
export type CourseAvailability = {
  joinable: boolean;
  /** Full wording, for buttons and roomy badges. */
  label: string;
  /** Compact wording, for small pills and inline parentheses. */
  shortLabel: string;
};

type AvailabilityInput = Pick<TrainingCourse, "status" | "registrationOpen">;

export function getCourseAvailability(
  course: AvailabilityInput
): CourseAvailability {
  if (course.status === "ENDED") {
    return { joinable: false, label: "Not in Session", shortLabel: "Ended" };
  }

  // The backend refuses enrolment outside IN_SESSION regardless of the toggle
  // (TrainingService.enroll), so an upcoming course is never joinable and must
  // not be captioned as though intake were open.
  if (course.status === "UPCOMING") {
    return { joinable: false, label: "Starts Soon", shortLabel: "Upcoming" };
  }

  if (!course.registrationOpen) {
    return {
      joinable: false,
      label: "Enrollment Closed",
      shortLabel: "Closed",
    };
  }

  return {
    joinable: true,
    label: "Open for Enrollment",
    shortLabel: "Open",
  };
}
