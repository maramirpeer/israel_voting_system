import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Lock, Eye, Users, Shield, Zap, ArrowRight } from "lucide-react";
import { useLocation } from "wouter";

/**
 * Design Philosophy: Modern Tech-Forward Governance
 * - Color Palette: Deep blues (#1e40af) with teal accents (#06b6d4)
 * - Typography: Bold headers with clean body text
 * - Layout: Asymmetric sections with ample whitespace
 * - Interaction: Smooth transitions and engaging hover states
 */

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [, setLocation] = useLocation();

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 via-white to-cyan-50">
      {/* Navigation Header */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b border-blue-100">
        <div className="container flex items-center justify-between py-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-cyan-500 rounded-lg flex items-center justify-center">
              <Lock className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-blue-900">VoteChain</h1>
              <p className="text-xs text-cyan-600 font-medium">Israel Voting System</p>
            </div>
          </div>
          <nav className="hidden md:flex items-center gap-8">
            <a href="#systems" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">Systems</a>
            <a href="#architecture" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">Architecture</a>
            <a href="#features" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">Features</a>
            <a href="#faq" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">FAQ</a>
            {isAuthenticated && (
              <div className="flex gap-2">
                <Button onClick={() => setLocation("/governance")} className="bg-blue-600 hover:bg-blue-700">
                  Go to Governance
                </Button>
                <Button onClick={() => setLocation("/ministry-dashboard")} variant="outline" className="border-blue-300">
                  📊 Dashboards
                </Button>
              </div>
            )}
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="container py-20 md:py-32">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div>
                <h2 className="text-5xl md:text-6xl font-bold text-blue-900 leading-tight mb-4">
                  Secure. Transparent. <span className="text-cyan-500">Trusted.</span>
                </h2>
                <p className="text-lg text-gray-600 leading-relaxed">
                  A comprehensive democratic system for Israel combining blockchain voting with transparent government operations. From elections to daily governance.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white" onClick={() => setLocation("/governance")}>
                  Enter Governance System
                </Button>
                <Button size="lg" variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                  Learn More
                </Button>
              </div>
              <div className="flex gap-8 pt-4">
                <div>
                  <p className="text-3xl font-bold text-blue-900">100%</p>
                  <p className="text-sm text-gray-600">Voter Anonymity</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-900">∞</p>
                  <p className="text-sm text-gray-600">Immutable Records</p>
                </div>
                <div>
                  <p className="text-3xl font-bold text-blue-900">51%</p>
                  <p className="text-sm text-gray-600">Citizen Veto Power</p>
                </div>
              </div>
            </div>
            <div className="relative">
              <img 
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663429815346/U6pRes7wCe3Tq4MFFrBU3d/hero-blockchain-voting-QZMGzn4EM44k5Skr4RYqWZ.webp"
                alt="Blockchain Voting Hero"
                className="w-full h-auto rounded-2xl shadow-2xl"
              />
            </div>
          </div>
        </div>
      </section>

      {/* Two Systems Section */}
      <section id="systems" className="py-20 bg-white">
        <div className="container">
          <h2 className="text-4xl font-bold text-center text-blue-900 mb-4">Two Integrated Systems</h2>
          <p className="text-center text-gray-600 mb-16 max-w-2xl mx-auto">
            A complete democratic infrastructure: secure elections and transparent daily governance with citizen participation.
          </p>
          
          <div className="grid md:grid-cols-2 gap-8">
            {/* System 1: Elections */}
            <Card className="p-8 border-2 border-blue-200 hover:shadow-xl transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900">Part 1: Blockchain Elections</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Secure, decentralized voting for the Knesset using blockchain technology with biometric authentication.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Biometric GovID authentication</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">One-time voting tokens</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Zero-knowledge proofs for anonymity</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Immutable audit trail</span>
                </li>
              </ul>
              <p className="text-xs text-gray-500">Foundation: Secure, verifiable elections</p>
            </Card>

            {/* System 2: Governance */}
            <Card className="p-8 border-2 border-cyan-200 hover:shadow-xl transition">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-cyan-600" />
                </div>
                <h3 className="text-2xl font-bold text-blue-900">Part 2: Transparent Governance</h3>
              </div>
              <p className="text-gray-600 mb-4">
                Daily government operations with full transparency and citizen participation through direct voting.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">9 Israeli ministries</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Ministers propose decisions</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">Citizens vote with 51% veto power</span>
                </li>
                <li className="flex gap-2">
                  <CheckCircle2 className="w-5 h-5 text-cyan-500 flex-shrink-0 mt-0.5" />
                  <span className="text-sm text-gray-700">72-hour voting windows</span>
                </li>
              </ul>
              <p className="text-xs text-gray-500">Operational: Transparent daily governance</p>
            </Card>
          </div>
        </div>
      </section>

      {/* Key Principles Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="container">
          <h2 className="text-4xl font-bold text-center text-blue-900 mb-16">Democratic Principles</h2>
          <div className="grid md:grid-cols-5 gap-6">
            {[
              { icon: Users, title: "Voter Anonymity", desc: "Votes cannot be linked to voters" },
              { icon: Eye, title: "Transparency", desc: "All decisions visible to citizens" },
              { icon: Lock, title: "Immutability", desc: "Tamper-proof records" },
              { icon: Shield, title: "Security", desc: "Resists cyberattacks" },
              { icon: Zap, title: "Accessibility", desc: "Easy participation for all" }
            ].map((item, i) => (
              <Card key={i} className="p-6 border-blue-100 hover:shadow-lg transition">
                <item.icon className="w-8 h-8 text-cyan-500 mb-4" />
                <h3 className="font-bold text-blue-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-600">{item.desc}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Architecture Section */}
      <section id="architecture" className="py-20 bg-white">
        <div className="container">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">System Architecture</h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl">
            Our blockchain-based voting system integrates Israel's biometric identity infrastructure with advanced cryptography to ensure secure, transparent, and verifiable elections.
          </p>
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663429815346/U6pRes7wCe3Tq4MFFrBU3d/architecture-diagram-visual-Cx438E4fGXRPX4NKRhyzJM.webp"
              alt="System Architecture"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-20 bg-gradient-to-r from-blue-50 to-cyan-50">
        <div className="container">
          <h2 className="text-4xl font-bold text-blue-900 mb-16">How It Works</h2>
          <Tabs defaultValue="registration" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-12 bg-white">
              <TabsTrigger value="registration" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">Registration</TabsTrigger>
              <TabsTrigger value="voting" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">Voting</TabsTrigger>
              <TabsTrigger value="blockchain" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">Blockchain</TabsTrigger>
              <TabsTrigger value="governance" className="data-[state=active]:bg-blue-50 data-[state=active]:text-blue-600">Governance</TabsTrigger>
            </TabsList>

            <TabsContent value="registration" className="space-y-6">
              <Card className="p-8 bg-white border-blue-100">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Voter Registration & Eligibility</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-blue-900">GovID Integration</p>
                      <p className="text-gray-600">Voters authenticate using their biometric Teudat Zehut and GovID credentials, verifying identity and eligibility.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-blue-900">One-Time Voting Token</p>
                      <p className="text-gray-600">Upon authentication, a unique token is generated that is cryptographically decoupled from voter identity.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-blue-900">Blockchain Record</p>
                      <p className="text-gray-600">Token issuance is recorded on the permissioned blockchain, ensuring each voter receives only one token.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="voting" className="space-y-6">
              <Card className="p-8 bg-white border-blue-100">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Voting Client Application</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-blue-900">Secure Interface</p>
                      <p className="text-gray-600">User-friendly web and mobile application with rigorous security audits.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-blue-900">Client-Side Encryption</p>
                      <p className="text-gray-600">Votes are encrypted on the user's device using election-specific public keys.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-blue-900">Zero-Knowledge Proofs</p>
                      <p className="text-gray-600">zk-SNARKs ensure voter anonymity and prevent double-voting without revealing identity.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="blockchain" className="space-y-6">
              <Card className="p-8 bg-white border-blue-100">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Blockchain Network</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-blue-900">Permissioned Consortium</p>
                      <p className="text-gray-600">Managed by the Central Elections Committee and trusted government entities for balance between decentralization and control.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-blue-900">Smart Contracts</p>
                      <p className="text-gray-600">Govern token issuance, vote submission, and automatic tallying after election closes.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-blue-900">Distributed Ledger</p>
                      <p className="text-gray-600">Each node maintains a copy, ensuring data integrity and resilience against single points of failure.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="governance" className="space-y-6">
              <Card className="p-8 bg-white border-cyan-100">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Transparent Government Operations</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-blue-900">Ministers Propose Decisions</p>
                      <p className="text-gray-600">Each of the 9 ministries can propose decisions affecting their domain, with full transparency and public visibility.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-blue-900">Citizens Vote with Veto Power</p>
                      <p className="text-gray-600">Citizens can vote on major decisions. If 51% vote against, the decision is automatically rejected regardless of ministerial intent.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-blue-900">72-Hour Voting Windows</p>
                      <p className="text-gray-600">Each decision has a 72-hour voting period, allowing citizens adequate time to review and participate.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-blue-900">No Process Delays</p>
                      <p className="text-gray-600">Routine decisions bypass voting, ensuring government efficiency while maintaining transparency for important matters.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="container text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Experience Democratic Governance?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Enter the governance system to see how transparent, citizen-powered government can work in practice.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50" onClick={() => setLocation("/governance")}>
              Enter Governance System <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Learn More About Architecture
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-white">
        <div className="container max-w-3xl">
          <h2 className="text-4xl font-bold text-blue-900 mb-12 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {[
              {
                q: "How does the 51% veto threshold work?",
                a: "If more than 51% of voting citizens vote against a decision, it is automatically rejected regardless of the minister's position. This ensures citizen participation in government decisions."
              },
              {
                q: "What happens if a decision is rejected?",
                a: "The minister receives feedback about citizen concerns and can either revise the decision or explain their reasoning to the public. The decision is logged for transparency."
              },
              {
                q: "Do all decisions require citizen voting?",
                a: "No. Only major and medium-level decisions require voting. Routine operational decisions bypass voting to maintain government efficiency."
              },
              {
                q: "How is voter anonymity maintained?",
                a: "Votes are encrypted and decoupled from voter identity using zero-knowledge proofs. Even the government cannot link votes to specific citizens."
              },
              {
                q: "What prevents government shutdown?",
                a: "The system is designed so that routine decisions proceed without delay. Only significant policy decisions require citizen input, preventing gridlock."
              },
              {
                q: "How is this different from direct democracy?",
                a: "This is representative democracy enhanced with citizen veto power. Ministers still lead and propose decisions, but citizens can reject them through voting."
              }
            ].map((item, i) => (
              <Card key={i} className="p-6 border-blue-100 hover:border-cyan-300 transition">
                <h3 className="font-bold text-blue-900 mb-3">{item.q}</h3>
                <p className="text-gray-600 text-sm leading-relaxed">{item.a}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-blue-100 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4">VoteChain</h4>
              <p className="text-sm">A comprehensive democratic system for Israel, designed for security, transparency, and citizen participation.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Systems</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#systems" className="hover:text-white transition">Overview</a></li>
                <li><a href="#" onClick={() => setLocation("/governance")} className="hover:text-white transition">Governance</a></li>
                <li><a href="#architecture" className="hover:text-white transition">Architecture</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#features" className="hover:text-white transition">How It Works</a></li>
                <li><a href="#faq" className="hover:text-white transition">FAQ</a></li>
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Privacy</a></li>
                <li><a href="#" className="hover:text-white transition">Terms</a></li>
                <li><a href="#" className="hover:text-white transition">Contact</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-blue-800 pt-8 text-center text-sm">
            <p>© 2026 VoteChain. A proposal for secure democratic governance in Israel.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
