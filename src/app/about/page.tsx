import Link from "next/link";
import { Heart, BookOpen, Sparkles, Crown } from "lucide-react";
import Button from "@/components/ui/Button";
import SectionWrapper from "@/components/ui/SectionWrapper";

const CoreValueCard = ({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  description: string;
}) => (
  <div className="flex flex-col items-center text-center border-t-2 border-purple-vivid pt-6">
    <div className="h-16 w-16 rounded-full bg-lavender flex items-center justify-center mb-4">
      <Icon className="h-8 w-8 text-purple-vivid" />
    </div>
    <h3 className="text-lg font-heading font-bold text-slate mb-2">{title}</h3>
    <p className="text-sm text-gray-text leading-relaxed">{description}</p>
  </div>
);

export default function AboutPage() {
  return (
    <main className="w-full">
      {/* Hero Banner */}
      <section
        className="w-full py-28 md:py-36 bg-cover bg-center flex items-center justify-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1438032005730-c779502df39b?w=1920&q=80')`,
          backgroundColor: "rgba(14, 0, 22, 0.84)",
          backgroundBlendMode: "overlay",
        }}
      >
        <div className="text-center px-4 md:px-6">
          <h1 className="text-4xl md:text-5xl font-heading font-bold text-white mb-4">
            Who We Are
          </h1>
          <p className="font-serif italic text-off-white text-lg md:text-xl mb-4">
            Raising Word-cultured Ambassadors
          </p>
          <div className="w-20 h-[2px] bg-purple-vivid mx-auto mt-4" />
        </div>
      </section>

      {/* Vision & Mission */}
      <SectionWrapper variant="white" className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-purple-dark mb-8">
            The Vision
          </h2>

          <div className="mb-8">
            <p className="font-serif italic text-xl md:text-2xl text-purple-vivid mb-2">
              &ldquo;Raising Word-cultured Ambassadors&rdquo;
            </p>
          </div>

          <p className="text-gray-text leading-relaxed mb-6">
            The Ecclesia Embassy is a vibrant ministry dedicated to fostering a deep, transformative
            relationship with God's Word. We believe that true spiritual growth comes from immersing
            ourselves in Scripture and allowing it to shape our identity, values, and purpose. Our
            mission is to cultivate a community of believers who are not just familiar with the Word
            of God, but are cultured by it—living as authentic ambassadors of Christ in every sphere
            of life.
          </p>

          <p className="text-gray-text leading-relaxed mb-8">
            Under the leadership of <span className="font-semibold text-slate">Brother Victor Oluwadamilare</span>,
            our Lead Brother, we are committed to creating an atmosphere where the Word of God is
            central, the Holy Spirit is honored, and the Kingdom of God is advanced through faithful
            servants who embody biblical truth.
          </p>
        </div>
      </SectionWrapper>

      {/* Core Values */}
      <SectionWrapper variant="off-white" className="py-16 md:py-20">
        <div className="mb-12">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-slate text-center mb-2">
            Our Core Values
          </h2>
          <p className="text-center text-gray-text">
            These principles guide our ministry and shape our community
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8 md:gap-6">
          <CoreValueCard
            icon={Heart}
            title="God-Interest"
            description="We prioritize the interests and glory of God above all else, allowing His will to shape our decisions and direction."
          />
          <CoreValueCard
            icon={BookOpen}
            title="Word-Cultured"
            description="We immerse ourselves in Scripture, allowing God's Word to transform our thinking and guide our actions."
          />
          <CoreValueCard
            icon={Sparkles}
            title="Spirit-Led"
            description="We yield to the guidance of the Holy Spirit, trusting His wisdom and sensitivity in all we do."
          />
          <CoreValueCard
            icon={Crown}
            title="Kingdom-Focused"
            description="We live with an eternal perspective, advancing God's Kingdom and fulfilling His purpose for our lives."
          />
        </div>
      </SectionWrapper>

      {/* Apostolic Mandate */}
      <SectionWrapper variant="dark-purple" className="py-16 md:py-20">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-heading font-bold text-white mb-6">
            The Apostolic Mandate
          </h2>

          <p className="text-white/80 leading-relaxed mb-8">
            We are committed to equipping believers with deep biblical knowledge and spiritual
            maturity. The Ecclesia Embassy exists to establish a generation of word-cultured
            ambassadors—men and women who understand God's Word thoroughly, live it authentically,
            and represent Christ powerfully in their families, workplaces, and communities. This is
            our calling, our passion, and our unwavering commitment to the Kingdom of God.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/about/lead-brother">
              <Button variant="secondary" onDark>
                Meet the Lead Brother
              </Button>
            </Link>
            <Link href="/experience">
              <Button variant="secondary" onDark>
                The Ecclesia Experience
              </Button>
            </Link>
          </div>
        </div>
      </SectionWrapper>
    </main>
  );
}
