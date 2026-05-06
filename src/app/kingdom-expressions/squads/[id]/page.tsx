"use client";

import { useEffect, useState, use } from "react";
import Link from "next/link";
import { ArrowLeft, Users, Calendar, Clock, Activity, Check } from "lucide-react";
import SectionWrapper from "@/components/ui/SectionWrapper";
import Button from "@/components/ui/Button";
import { squads as squadsAPI } from "@/lib/api";
import { useAuth } from "@/lib/auth-context";
import { useToast } from "@/components/ui/Toast";
import { SkeletonGroup } from "@/components/ui/Skeleton";

interface Squad {
  id: string;
  name: string;
  description?: string;
  leader?: {
    id: string;
    email: string;
    profile?: { firstName?: string; lastName?: string; photoUrl?: string; phone?: string; bio?: string };
  } | null;
  members?: Array<{ user: { profile?: { firstName?: string; lastName?: string } } }>;
  _count?: { members: number };
  meetingDay?: string;
  meetingTime?: string;
  activities?: string;
}

export default function SquadDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [squad, setSquad] = useState<Squad | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [joining, setJoining] = useState(false);
  const [joined, setJoined] = useState(false);
  const { isAuthenticated } = useAuth();
  const { success, error: showError } = useToast();

  useEffect(() => {
    const fetchSquad = async () => {
      try {
        setLoading(true);
        const data = await squadsAPI.getSquad(id);
        if (!data) {
          setNotFound(true);
          return;
        }
        setSquad(data);
      } catch (err) {
        const message = err instanceof Error ? err.message : "";
        if (message.includes("404") || message.includes("not found")) {
          setNotFound(true);
        }
      } finally {
        setLoading(false);
      }
    };

    fetchSquad();
  }, [id]);

  const handleJoin = async () => {
    if (!isAuthenticated) {
      showError("Please log in to join a squad.");
      return;
    }
    setJoining(true);
    try {
      await squadsAPI.joinSquad(id);
      success("You have joined the squad!");
      setJoined(true);
    } catch (err) {
      showError(err instanceof Error ? err.message : "Failed to join squad.");
    } finally {
      setJoining(false);
    }
  };

  if (loading) {
    return (
      <div className="bg-off-white min-h-screen">
        <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6 md:px-8">
          <SkeletonGroup count={6} />
        </div>
      </div>
    );
  }

  if (notFound || !squad) {
    return (
      <div className="bg-off-white min-h-screen">
        <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6 md:px-8">
          <Link href="/kingdom-expressions/squads" className="flex items-center gap-2 text-purple-vivid hover:underline mb-8">
            <ArrowLeft size={18} /> Back to Squads
          </Link>
          <div className="rounded-[8px] border border-gray-border bg-white p-12 text-center shadow-sm">
            <h1 className="font-heading text-2xl font-bold text-slate mb-2">Squad Not Found</h1>
            <p className="font-body text-base text-gray-text mb-6">
              This squad doesn&apos;t exist or has been removed.
            </p>
            <Link href="/kingdom-expressions/squads">
              <Button variant="primary">Browse Squads</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const description = squad.description || "";
  const leaderName = squad.leader?.profile
    ? `${squad.leader.profile.firstName || ""} ${squad.leader.profile.lastName || ""}`.trim()
    : null;
  const memberCount = squad._count?.members ?? squad.members?.length ?? 0;

  return (
    <main className="min-h-screen bg-off-white">
      {/* Hero */}
      <section className="relative flex items-center justify-center py-24 md:py-32">
        <div className="absolute inset-0 bg-gradient-to-br from-purple-dark to-purple" />
        <div className="absolute inset-0 bg-[rgba(14,0,22,0.84)]" />
        <div className="relative z-10 mx-auto max-w-[1200px] px-4 text-center sm:px-6 md:px-8">
          <h1 className="font-heading text-4xl font-bold text-white md:text-[42px] md:leading-[48px]">
            {squad.name}
          </h1>
          {description && (
            <p className="mt-3 font-body text-lg text-off-white max-w-2xl mx-auto">
              {description}
            </p>
          )}
        </div>
      </section>

      <div className="mx-auto max-w-[1000px] px-4 py-8 sm:px-6 md:px-8">
        <Link href="/kingdom-expressions/squads" className="flex items-center gap-2 text-purple-vivid hover:underline mb-8">
          <ArrowLeft size={18} /> Back to Squads
        </Link>

        {/* Kingdom Life Squads Information Section */}
        <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm mb-8">
          <h2 className="font-heading text-2xl font-bold text-slate mb-2">KINGDOM LIFE SQUADS</h2>
          <p className="font-body text-base text-purple-vivid font-semibold mb-6">Christ on Missions…Expressing Christ, Reaching the Unreached, Meeting Needs</p>
          
          {/* Introduction */}
          <div className="mb-8 pb-6 border-b border-gray-border">
            <h3 className="font-heading text-lg font-bold text-slate mb-3">INTRODUCTION</h3>
            <div className="space-y-3 font-body text-sm text-slate leading-relaxed">
              <p>
                This is an arm of The Ecclesia Embassy committed to demonstrating the Scriptural lifestyle of the Kingdom of God.
              </p>
              <p>
                The Bible describes an approved religion, the type accepted as pure and undefiled before God, to be the one committed to meeting the needs of people (James 1:27). Jesus also outlined Ministry to be an avenue of meeting the needs of people with the Gospel in His Mission statement (Luke 4:18). He came to preach the Gospel to the poor, healing to the brokenhearted, deliverance to the captives, recovering of sight to the blind, and to set at liberty them that are bound.
              </p>
              <p>
                From the above, it is clear that Ministry involves meeting the needs of people, since all a captive needs is deliverance, and recovery of sight is all the blind needs, and so on.
              </p>
              <p>
                Jesus also mentioned that, meeting the needs of people is meeting His own needs, which ultimately improves our relationship with God, and also prepares a place for us in His Kingdom (Matthew 25:31-40).
              </p>
              <p>
                It is on the above premise that The Ecclesia Embassy seeks to demonstrate the love of God to the world around us. We use this platform in seizing every opportunity at our disposal, to meet the needs of individuals, communities and organizations around us.
              </p>
            </div>
          </div>

          {/* The Approach */}
          <div className="mb-8 pb-6 border-b border-gray-border">
            <h3 className="font-heading text-lg font-bold text-slate mb-3">THE APPROACH</h3>
            <p className="font-body text-sm text-slate leading-relaxed mb-4">
              It is obvious from observations that the needs of people and organizations around us will be cumbersome to be met through one channel. This is the reason for the existence of different Squads within the Kingdom Model Life Squads Initiative.
            </p>
            <p className="font-body text-sm text-slate font-semibold mb-4">Highlights of the fifteen (15) Squads:</p>
            
            <div className="space-y-4">
              <div>
                <p className="font-body text-sm font-semibold text-slate">1. AGED KINGDOM LIFE SQUAD</p>
                <p className="font-body text-sm text-slate leading-relaxed">This Squad is involved with taking care of individuals who are advanced in age and requires aid at different level. The support may range from provision of food items, toiletries, eye glasses, clothes, medical attention, etc.</p>
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-slate">2. BLESSED PEOPLE KINGDOM LIFE SQUAD</p>
                <p className="font-body text-sm text-slate leading-relaxed">This Squad is responsible for "Area boys", prostitutes, drug addicts, repentant criminals and other categories of individuals around these set of people; turning their lives around to be Christ-like. This Squad also engage in services that give these set of people a new beginning and improve their self-worth.</p>
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-slate">3. CHURCH AND MINISTRY KINGDOM LIFE SQUAD</p>
                <p className="font-body text-sm text-slate leading-relaxed">This Squad is saddled with the responsibility of reaching out to Churches, Ministries, NGOs, Ministers (Pastors, Evangelists, Music Ministers, etc.) that are challenged in some areas of need. We are committed to being a channel through which God will provide needs such as chairs, furniture, musical and sound equipment, and other peculiar needs in such Churches and NGOs. The squad also attends to the needs of Ministers.</p>
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-slate">4. COMMUNITY DEVELOPMENT KINGDOM LIFE SQUAD</p>
                <p className="font-body text-sm text-slate leading-relaxed">This Squad is concerned with community development programs and projects in different category. We are committed to visiting remote and underdeveloped communities where social amenities such as good roads, electricity, pipe borne water, and the likes, are not available, and we will be a part of meeting those need.</p>
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-slate">5. ENABLED KINGDOM LIFE SQUAD</p>
                <p className="font-body text-sm text-slate leading-relaxed">This Squad has the assignment of reaching out to disabled individuals of all sorts. This includes the blind, lame, deaf, dumb, handicapped, etc. We visit them in situations where they have a location for residence, or particular spots where they can be found. Our goal is to be a blessing to them through whichever means we can.</p>
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-slate">6. HOSPITAL KINGDOM LIFE SQUAD</p>
                <p className="font-body text-sm text-slate leading-relaxed">This Squad is concerned with taking care of the sick in the hospital and various health centers and even outdoor patients. The focus is centered on demonstrating the love of God to them by meeting their medical needs and praying for them for healing and perfection of their health.</p>
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-slate">7. IN-REACH KINGDOM LIFE SQUAD (MEMBERS' WELFARE)</p>
                <p className="font-body text-sm text-slate leading-relaxed">According to scriptures, we have the responsibility of reaching out to our immediate family before going out (Galatians 6:10). We have a high priority task of doing 'good' to all, especially those of our household of faith. This is why this particular squad exists to meet the needs of individuals within The Ecclesia Embassy. You know the popular phrase "Charity begins at home".</p>
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-slate">8. PRIVILEGED KINGDOM LIFE SQUAD</p>
                <p className="font-body text-sm text-slate leading-relaxed">This Squad is committed to meeting the needs of the less privileged and poor individuals in our community, who may not fall into any of the other categorized Squads. They find out the peculiar needs of the individuals in this category and become a source of blessing to them through the best means at our disposal.</p>
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-slate">9. MARKET KINGDOM LIFE SQUAD</p>
                <p className="font-body text-sm text-slate leading-relaxed">This Squad is concerned with reaching out to the market men and women. The activities here will include having a time of fellowship with them, cleaning the market environment, providing necessities such as waste bins and drainages, and supporting ongoing projects and initiating new ones, as situation demands. Gospel tracts and hand bills will also be distributed to them to help their spiritual life.</p>
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-slate">10. ORPHANAGE KINGDOM LIFE SQUAD</p>
                <p className="font-body text-sm text-slate leading-relaxed">This Squad concentrates on reaching out to orphans, at every opportunity we get. This includes taking care of orphans around us and visiting those living in orphanages, with basic needs and having a time of fellowship and love with them.</p>
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-slate">11. PRIMARY AND SECONDARY SCHOOLS KINGDOM LIFE SQUAD</p>
                <p className="font-body text-sm text-slate leading-relaxed">This Squad is essentially committed to reaching out to children and teenagers in Primary and Secondary schools. Individuals in this Squad are people with passion for children and teenagers. They visit schools to delineate their needs and meet them. Also, they initiate and execute life transforming programs that will both educate and improve their lives.</p>
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-slate">12. FREE AND CHANGED MEN KINGDOM LIFE SQUAD</p>
                <p className="font-body text-sm text-slate leading-relaxed">This Squad is essentially concerned with prisoners, their welfare, spiritual life and rehabilitation. They are involved in visiting prisons at different locations, to be a blessing to them in ways that will lead to their transformation. They also offer legal aids to prisoners who needs the service.</p>
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-slate">13. RE-MIND KINGDOM LIFE SQUAD</p>
                <p className="font-body text-sm text-slate leading-relaxed">This Squad is committed to helping individuals with any form of mental disorder. This involves seeking out the mentally deranged, those with mood disorders, anxiety disorders, psychotic disorders, depression, and other related issues. This squad, is all out to help individuals in this category regain sanity and order.</p>
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-slate">14. SPECIAL CHILDREN KINGDOM LIFE SQUAD</p>
                <p className="font-body text-sm text-slate leading-relaxed">This Squad is committed to meeting an imminent and desperate need of this time. The group of children to be attended to in this Squad include children suffering from Autism, Down Syndrome, Cerebral Palsy, Difficulty in Learning, ADHD (Attention Deficit Hyperactivity Disorder), Attention Deficit Disorder (ADD), and the likes. The squad locates the aforementioned children in order to meet their needs. The foremost need for these children is love and that's what we give them unreservedly and also meet other needs.</p>
              </div>
              <div>
                <p className="font-body text-sm font-semibold text-slate">15. JESUS' BRIDE KINGDOM LIFE SQUAD</p>
                <p className="font-body text-sm text-slate leading-relaxed">This Squad is concerned with reaching out to widows (women that have lost their husbands), and single mothers of children that have been abandoned by their husbands. They locate individuals in this category that genuinely need help and reach out to them with the means we have.</p>
              </div>
            </div>
          </div>

          {/* Target Area */}
          <div className="mb-8 pb-6 border-b border-gray-border">
            <h3 className="font-heading text-lg font-bold text-slate mb-3">OUR TARGET AREA</h3>
            <p className="font-body text-sm text-slate leading-relaxed">
              In reaching out to people, Jesus gave His disciples a pattern in Acts 1:8, saying they should begin from their immediate environment Jerusalem, to Judea, to Samaria, and then to the uttermost part of the earth. In that same light, we would begin again, by reaching out to the great people in our immediate community of Asokoro, spread all over Abuja then spread all over Nigeria, and ultimately to the whole world. In all, no one around us that requires genuine aid must be left unattended to.
            </p>
          </div>

          {/* Ultimate Aim */}
          <div>
            <h3 className="font-heading text-lg font-bold text-slate mb-3">OUR ULTIMATE AIM</h3>
            <div className="space-y-3 font-body text-sm text-slate leading-relaxed">
              <p>
                Our one and only purpose of Kingdom Life Squads is to demonstrate the love of God to humanity. Our drive is to live the true life that Jesus expects from us, according to Matthew 25:31-46, and James 1:27.
              </p>
              <p>
                For us, these are our Kingdom Ministries where we communicate Christ, His love and life to humanity and our society.
              </p>
              <p>
                We are committed to putting smiles on the faces of millions of individuals all over the world. Just like Job, in chapter 29:11-17 of his book, we will be eyes to the blind, foot to the lame, and fathers to the poor.
              </p>
              <p className="font-semibold">
                We are going all out for Jesus. The Ecclesia Embassy… It's time to recommit to the works of Christ! Hallelujah!
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          {/* Main content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Leader Profile */}
            <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm">
              <h2 className="font-heading text-xl font-bold text-slate mb-4">Squad Leader</h2>
              <div className="flex items-start gap-4">
                <div className="flex h-14 w-14 items-center justify-center rounded-full bg-purple-vivid flex-shrink-0">
                  <span className="font-heading text-lg font-bold text-white">
                    {(leaderName || "?").charAt(0)}
                  </span>
                </div>
                <div>
                  <p className="font-heading text-base font-semibold text-slate">
                    {leaderName || "To Be Announced"}
                  </p>
                  {squad.leader?.profile?.bio && (
                    <p className="mt-2 font-body text-sm text-slate leading-relaxed">{squad.leader.profile.bio}</p>
                  )}
                </div>
              </div>
            </div>

            {/* Meeting Schedule */}
            {(squad.meetingDay || squad.meetingTime) && (
              <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm">
                <h2 className="font-heading text-xl font-bold text-slate mb-4">Meeting Schedule</h2>
                <div className="space-y-3">
                  {squad.meetingDay && (
                    <div className="flex items-center gap-3 font-body text-sm text-slate">
                      <Calendar size={18} className="text-purple flex-shrink-0" />
                      <span>{squad.meetingDay}</span>
                    </div>
                  )}
                  {squad.meetingTime && (
                    <div className="flex items-center gap-3 font-body text-sm text-slate">
                      <Clock size={18} className="text-purple flex-shrink-0" />
                      <span>{squad.meetingTime}</span>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Activities */}
            {squad.activities && (
              <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm">
                <h2 className="font-heading text-xl font-bold text-slate mb-4">Activities</h2>
                <div className="flex items-start gap-3">
                  <Activity size={18} className="text-purple flex-shrink-0 mt-0.5" />
                  <p className="font-body text-sm text-slate leading-relaxed whitespace-pre-wrap">
                    {squad.activities}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="rounded-[8px] border border-gray-border bg-white p-6 shadow-sm sticky top-20">
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-2 text-gray-text font-body text-sm mb-4">
                  <Users size={18} className="text-purple" />
                  <span>{memberCount} members</span>
                </div>
              </div>

              {joined ? (
                <div className="text-center py-4">
                  <Check className="mx-auto h-10 w-10 text-success mb-3" />
                  <h3 className="font-heading text-lg font-bold text-slate mb-1">You&apos;re In!</h3>
                  <p className="font-body text-sm text-gray-text">
                    Welcome to {squad.name}. Check your dashboard for updates.
                  </p>
                </div>
              ) : (
                <>
                  <Button
                    variant="primary"
                    className="w-full bg-[#771996] hover:bg-[#4A1D6E]"
                    onClick={handleJoin}
                    disabled={joining}
                    loading={joining}
                  >
                    {joining ? "Joining..." : "Request to Join"}
                  </Button>
                  {!isAuthenticated && (
                    <p className="mt-4 font-body text-xs text-gray-text text-center">
                      <Link href="/auth/login" className="text-purple-vivid hover:underline">
                        Log in
                      </Link>{" "}
                      to join this squad.
                    </p>
                  )}
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
