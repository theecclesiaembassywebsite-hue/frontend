import { describe, it, expect } from "vitest";
import { getCourseAvailability } from "@/lib/training-availability";

/**
 * The bug this covers: the label used to be looked up from `status` alone, so a
 * course that was in session with intake closed rendered "Open for Enrollment"
 * on a disabled button. Every combination of the two inputs is asserted here,
 * because it was the combination nobody enumerated that shipped wrong.
 */
describe("getCourseAvailability", () => {
  const cases = [
    { status: "IN_SESSION", registrationOpen: true, joinable: true, label: "Open for Enrollment" },
    { status: "IN_SESSION", registrationOpen: false, joinable: false, label: "Enrollment Closed" },
    { status: "UPCOMING", registrationOpen: true, joinable: false, label: "Starts Soon" },
    { status: "UPCOMING", registrationOpen: false, joinable: false, label: "Starts Soon" },
    { status: "ENDED", registrationOpen: true, joinable: false, label: "Not in Session" },
    { status: "ENDED", registrationOpen: false, joinable: false, label: "Not in Session" },
  ] as const;

  it.each(cases)(
    "$status + registrationOpen=$registrationOpen -> $label",
    ({ status, registrationOpen, joinable, label }) => {
      const result = getCourseAvailability({ status, registrationOpen });
      expect(result.joinable).toBe(joinable);
      expect(result.label).toBe(label);
    }
  );

  it("never captions a non-joinable course as open", () => {
    // The specific contradiction that was on the page: a disabled control
    // labelled as though enrolment were available.
    for (const { status, registrationOpen } of cases) {
      const result = getCourseAvailability({ status, registrationOpen });
      if (!result.joinable) {
        expect(result.label.toLowerCase()).not.toContain("open for");
        expect(result.shortLabel.toLowerCase()).not.toBe("open");
      }
    }
  });

  it("only reports joinable when the session is running and intake is open", () => {
    const joinable = cases.filter(
      (c) => getCourseAvailability(c).joinable
    );
    expect(joinable).toHaveLength(1);
    expect(joinable[0]).toMatchObject({
      status: "IN_SESSION",
      registrationOpen: true,
    });
  });

  it("gives every state a compact label for tight pills", () => {
    for (const { status, registrationOpen } of cases) {
      const { shortLabel } = getCourseAvailability({ status, registrationOpen });
      expect(shortLabel).toBeTruthy();
      expect(shortLabel.length).toBeLessThanOrEqual(10);
    }
  });
});
