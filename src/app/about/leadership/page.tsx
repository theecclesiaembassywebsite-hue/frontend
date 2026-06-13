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
                It is with great joy that I welcome you to The Ecclesia Embassy,
                the assembly of the called-out ones. I strongly believe the Lord
                has handpicked you for something crucial in His end-time agenda
                on the earth.
              </p>
              <p>
                By divine privilege, we are on a mission to raise Word-cultured
                ambassadors capable of bearing God&rsquo;s burden and
                superimposing Heaven&rsquo;s culture here on earth. It is a huge
                task, and because of that, we are a people sold out to His cause,
                surrendered to His will, and committed to His bidding for all the
                days of our lives.
              </p>
              <p>
                Because that calling demands depth and equipment, we gather three
                times every week so that our lives can be shaped continually by
                the Word, Warfare, and Worship:
              </p>
              <ul className="list-disc space-y-1 pl-6">
                <li>
                  <span className="font-semibold text-white">Tuesdays at 5:30 PM</span> - a
                  time of warfare, heartfelt prayer, and intercession as we strongly
                  engage the Holy Ghost to birth God&rsquo;s will.
                </li>
                <li>
                  <span className="font-semibold text-white">Fridays at 5:30 PM</span> - a
                  time of passionate, spontaneous worship that often culminates in
                  supernatural encounters.
                </li>
                <li>
                  <span className="font-semibold text-white">Sundays at 8:00 AM</span> - a
                  special moment in God&rsquo;s Word, which we have understood to be
                  His major instrument of change, furtherance, and growth.
                </li>
              </ul>
              <p>
                A wise man said that in five years you will largely be the same
                person you are now except for two things: the books you read and
                the company you keep. That is why I urge you to be part of this
                loving church family. Keep company with us, and I dare to say
                your life promises much more than you have currently experienced.
                It begins with the first step of identifying with us.
              </p>
              <p>
                We would love to hear from you. Take advantage of our physical
                and virtual platforms, stay apprised of our rich calendar, and
                give yourself room to grow with what God is doing here.
              </p>
              <p className="font-semibold italic text-white">
                Your best days are not behind you. They are here, because God has
                much more in mind concerning you.
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
