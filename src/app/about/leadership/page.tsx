import { User } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";

export default function LeadershipPage() {
  return (
    <>
      {/* Hero Banner */}
      <section className="relative flex items-center justify-center py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <h1 className="font-heading text-4xl font-bold text-white md:text-[42px] md:leading-[48px]">
            Leadership
          </h1>
          <h6 className="mt-3 font-serif text-lg font-light text-off-white">
            A Word from The Lead Brother
          </h6>
        </div>
      </section>

      {/* Lead Brother Profile */}
      <SectionWrapper variant="dark-purple">
        <div className="grid grid-cols-1 items-center gap-12 md:grid-cols-2">
          <div className="flex justify-center">
            <div className="flex h-72 w-72 items-center justify-center overflow-hidden rounded-full bg-purple-light shadow-lg md:h-80 md:w-80">
              <User className="h-32 w-32 text-purple/40" />
            </div>
          </div>

          <div>
            <h2 className="font-heading text-[28px] font-bold text-white">
              Victor Oluwadamilare
            </h2>
            <p className="mt-1 font-serif text-lg italic text-purple-light">
              The Lead Brother
            </p>

            <div className="mt-6 space-y-4 font-body text-base leading-relaxed text-white/80">
              <p>
                The Ecclesia Embassy is the assembly of the called-out ones and the
                dwelling place of those chosen to showcase the beauty and excellence
                of Christ. We are committed to raising a people with a thriving
                relationship with God, operating with Kingdom worldview, for
                societal relevance.
              </p>
              <p>
                We believe the Church is not just a gathering, but a living
                Ecclesia: a people called out in Christ and sent as His
                ambassadors. Our philosophy is simple and demanding: living the
                Words of Christ, doing the works of Christ, and loving as He loves.
              </p>
              <p>
                At The Ecclesia Embassy, every gathering is designed to build you
                up in faith and purpose. The movement is built on three foundations
                God gave us in 2016: the Word, Warfare (Prayer), and Worship. Our
                weekly meetings reflect those priorities:
              </p>
              <ul className="list-disc space-y-1 pl-6">
                <li>
                  <span className="font-semibold text-white">Sundays</span> - The Word:
                  a deep immersion in Scripture for training, clarity, and Kingdom
                  living.
                </li>
                <li>
                  <span className="font-semibold text-white">Tuesdays</span> - Prayer and
                  Warfare: a time to pray, contend, and stand in the spirit.
                </li>
                <li>
                  <span className="font-semibold text-white">Fridays</span> - Worship: a
                  gathering of reverence, encounter, and wholehearted devotion to
                  God.
                </li>
              </ul>
              <p>
                Whether you are new to the faith or a seasoned believer, there is a
                place for you here. Come and be part of a community that is
                passionate about God, serious about His Word, and intentional about
                Kingdom advancement.
              </p>
              <p className="font-semibold italic text-white">
                Welcome to The Ecclesia Embassy - where intentionality, Word,
                Prayer, and Worship shape ambassadors for Christ.
              </p>
            </div>
          </div>
        </div>
      </SectionWrapper>

      <SectionWrapper variant="off-white">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-heading text-[28px] font-bold text-slate">
            Join Us
          </h2>
          <p className="mt-4 font-body text-base leading-relaxed text-gray-text">
            Whether you are joining us onsite or connecting from another city or
            nation, The Ecclesia Embassy welcomes you. Come experience powerful
            worship, deep teaching, and a community committed to raising
            ambassadors for Christ.
          </p>
        </div>
      </SectionWrapper>
    </>
  );
}
