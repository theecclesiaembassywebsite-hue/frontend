import SectionWrapper from "@/components/ui/SectionWrapper";
import { Heart, BookOpen, Sparkles, Crown } from "lucide-react";
import Link from "next/link";
import Button from "@/components/ui/Button";

const coreValues = [
  {
    icon: Heart,
    title: "God-Interest",
    description:
      "Everything we do is motivated by a genuine passion for the things of God and His kingdom.",
  },
  {
    icon: BookOpen,
    title: "Word-Cultured",
    description:
      "We are a people immersed in the Word — shaped, guided, and governed by Scripture.",
  },
  {
    icon: Sparkles,
    title: "Spirit-Led",
    description:
      "We follow the leading of the Holy Spirit in all things — worship, service, and daily living.",
  },
  {
    icon: Crown,
    title: "Kingdom-Focused",
    description:
      "Our mandate is to advance the Kingdom of God on earth through every sphere of influence.",
  },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero Banner */}
      <section className="relative flex items-center justify-center py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <h1 className="font-heading text-4xl font-bold text-white md:text-[42px] md:leading-[48px]">
            Who We Are
          </h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">
            Raising Word-cultured Ambassadors
          </h6>
        </div>
      </section>

      {/* Vision & Mission */}
      <SectionWrapper variant="white">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-[28px] font-bold text-slate">
            The Vision
          </h2>
          <p className="mt-4 font-serif text-xl italic text-purple-vivid">
            &ldquo;Raising Word-cultured Ambassadors&rdquo;
          </p>
          <p className="mt-6 font-body text-base text-gray-text leading-relaxed">
            The Ecclesia Embassy is an apostolic and prophetic ministry committed to
            raising a generation of believers who are deeply rooted in the Word of
            God, led by the Spirit, and positioned for kingdom influence. Under the
            leadership of Brother Victor Oluwadamilare (The Lead Brother), we are
            building a community that reflects the government of heaven on earth.
          </p>
        </div>
      </SectionWrapper>

      {/* Core Values */}
      <SectionWrapper variant="off-white">
        <div className="text-center mb-10">
          <h2 className="font-heading text-[28px] font-bold text-slate">
            Our Core Values
          </h2>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {coreValues.map((value) => {
            const Icon = value.icon;
            return (
              <div
                key={value.title}
                className="flex flex-col items-center text-center"
              >
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-purple-light">
                  <Icon className="h-7 w-7 text-purple" />
                </div>
                <h3 className="mt-4 font-heading text-lg font-bold text-slate">
                  {value.title}
                </h3>
                <p className="mt-2 font-body text-sm text-gray-text leading-relaxed">
                  {value.description}
                </p>
              </div>
            );
          })}
        </div>
      </SectionWrapper>

      {/* Ministry Mandate */}
      <SectionWrapper variant="dark-purple">
        <div className="mx-auto max-w-3xl text-center">
          <h2 className="font-heading text-[28px] font-bold text-white">
            The Apostolic Mandate
          </h2>
          <p className="mt-6 font-body text-base text-white/80 leading-relaxed">
            We carry a mandate to build the Ecclesia — the called-out assembly of
            God — and to see believers equipped for works of ministry. Through the
            Word, worship, and kingdom expressions, we are raising sons who
            understand their identity and walk in the fullness of their assignment.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link href="/about/leadership">
              <Button variant="secondary" onDark>
                Meet the Lead Brother
              </Button>
            </Link>
            <Link href="/about/experience">
              <Button variant="secondary" onDark>
                The Ecclesia Experience
              </Button>
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </>
  );
}
