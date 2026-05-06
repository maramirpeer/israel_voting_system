import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CheckCircle2, Lock, Eye, Users, Shield, Zap } from "lucide-react";
import { useState } from "react";

/**
 * Design Philosophy: Modern Tech-Forward Governance
 * - Color Palette: Deep blues (#1e40af) with teal accents (#06b6d4)
 * - Typography: Bold headers with clean body text
 * - Layout: Asymmetric sections with ample whitespace
 * - Interaction: Smooth transitions and engaging hover states
 */

export default function Home() {
  const [activeDemo, setActiveDemo] = useState("auth");

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
            <a href="#architecture" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">Architecture</a>
            <a href="#features" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">Features</a>
            <a href="#demo" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">Demo</a>
            <a href="#faq" className="text-sm font-medium text-gray-700 hover:text-blue-600 transition">FAQ</a>
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
                  A blockchain-powered voting system for Israel that combines cutting-edge cryptography with democratic principles. Your vote. Your voice. Our future.
                </p>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white">
                  Explore Architecture
                </Button>
                <Button size="lg" variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50">
                  View Documentation
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
                  <p className="text-3xl font-bold text-blue-900">1</p>
                  <p className="text-sm text-gray-600">Vote Per Citizen</p>
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

      {/* Key Principles Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <h2 className="text-4xl font-bold text-center text-blue-900 mb-16">Core Principles</h2>
          <div className="grid md:grid-cols-5 gap-6">
            {[
              { icon: Users, title: "Voter Anonymity", desc: "Votes cannot be linked to voters" },
              { icon: Eye, title: "Verifiability", desc: "Anyone can audit the results" },
              { icon: Lock, title: "Immutability", desc: "Tamper-proof records" },
              { icon: Shield, title: "Security", desc: "Resists cyberattacks" },
              { icon: Zap, title: "Accessibility", desc: "Easy for all citizens" }
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
      <section id="architecture" className="py-20 bg-gradient-to-r from-blue-50 to-cyan-50">
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
      <section id="features" className="py-20 bg-white">
        <div className="container">
          <h2 className="text-4xl font-bold text-blue-900 mb-16">Key Features</h2>
          <Tabs defaultValue="registration" className="w-full">
            <TabsList className="grid w-full grid-cols-4 mb-12 bg-blue-50">
              <TabsTrigger value="registration" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Registration</TabsTrigger>
              <TabsTrigger value="voting" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Voting</TabsTrigger>
              <TabsTrigger value="blockchain" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Blockchain</TabsTrigger>
              <TabsTrigger value="tallying" className="data-[state=active]:bg-white data-[state=active]:text-blue-600">Tallying</TabsTrigger>
            </TabsList>

            <TabsContent value="registration" className="space-y-6">
              <Card className="p-8 border-blue-100">
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
              <Card className="p-8 border-blue-100">
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
              <Card className="p-8 border-blue-100">
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

            <TabsContent value="tallying" className="space-y-6">
              <Card className="p-8 border-blue-100">
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Tallying & Audit</h3>
                <div className="space-y-4">
                  <div className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-blue-900">Multi-Party Decryption</p>
                      <p className="text-gray-600">Votes are decrypted collaboratively by multiple trusted authorities, preventing any single entity from knowing individual votes.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-blue-900">Public Auditability</p>
                      <p className="text-gray-600">All encrypted votes and final tally are publicly auditable on the blockchain for complete transparency.</p>
                    </div>
                  </div>
                  <div className="flex gap-4">
                    <CheckCircle2 className="w-6 h-6 text-cyan-500 flex-shrink-0 mt-1" />
                    <div>
                      <p className="font-semibold text-blue-900">Individual Verification</p>
                      <p className="text-gray-600">Voters can verify their encrypted vote was recorded correctly using a unique receipt.</p>
                    </div>
                  </div>
                </div>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </section>

      {/* Voting Flow Section */}
      <section id="demo" className="py-20 bg-gradient-to-r from-cyan-50 to-blue-50">
        <div className="container">
          <h2 className="text-4xl font-bold text-blue-900 mb-4">The Voting Process</h2>
          <p className="text-lg text-gray-600 mb-12 max-w-2xl">
            A step-by-step walkthrough of how the blockchain voting system works, from authentication to verification.
          </p>
          <div className="rounded-2xl overflow-hidden shadow-2xl">
            <img 
              src="https://d2xsxph8kpxj0f.cloudfront.net/310519663429815346/U6pRes7wCe3Tq4MFFrBU3d/voting-flow-visual-i2SMz3WcAxW7LTSytgHR9G.webp"
              alt="Voting Process Flow"
              className="w-full h-auto"
            />
          </div>
        </div>
      </section>

      {/* Security Features Section */}
      <section className="py-20 bg-white">
        <div className="container">
          <h2 className="text-4xl font-bold text-blue-900 mb-16">Security Features</h2>
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <img 
                src="https://d2xsxph8kpxj0f.cloudfront.net/310519663429815346/U6pRes7wCe3Tq4MFFrBU3d/security-features-visual-GrBs7DguuFMBgTm9pPRFNL.webp"
                alt="Security Features"
                className="w-full h-auto"
              />
            </div>
            <div className="space-y-8">
              <div>
                <h3 className="text-2xl font-bold text-blue-900 mb-4">Comprehensive Protection</h3>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Our system employs multiple layers of security to protect against fraud, coercion, and cyberattacks.
                </p>
              </div>
              
              <div className="space-y-4">
                <div className="border-l-4 border-cyan-500 pl-4">
                  <h4 className="font-bold text-blue-900 mb-1">Biometric Authentication</h4>
                  <p className="text-sm text-gray-600">Leverages Israel's biometric Teudat Zehut to prevent identity theft and impersonation.</p>
                </div>
                
                <div className="border-l-4 border-cyan-500 pl-4">
                  <h4 className="font-bold text-blue-900 mb-1">One-Time Tokens</h4>
                  <p className="text-sm text-gray-600">Prevents selling or transferring voting rights, eliminating vote buying schemes.</p>
                </div>
                
                <div className="border-l-4 border-cyan-500 pl-4">
                  <h4 className="font-bold text-blue-900 mb-1">Vote Secrecy</h4>
                  <p className="text-sm text-gray-600">zk-SNARKs ensure votes remain private even if voters are coerced.</p>
                </div>
                
                <div className="border-l-4 border-cyan-500 pl-4">
                  <h4 className="font-bold text-blue-900 mb-1">Quantum-Resistant Cryptography</h4>
                  <p className="text-sm text-gray-600">Considered for long-term security against future computational threats.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-20 bg-blue-50">
        <div className="container max-w-3xl">
          <h2 className="text-4xl font-bold text-blue-900 mb-12 text-center">Frequently Asked Questions</h2>
          
          <div className="space-y-4">
            {[
              {
                q: "How does the system ensure voter anonymity?",
                a: "The system uses zero-knowledge proofs (zk-SNARKs) to verify that a voter is eligible and has a valid token without revealing their identity. Votes are encrypted client-side and decrypted only after the election closes using multi-party computation."
              },
              {
                q: "What is a one-time voting token?",
                a: "Upon authentication through GovID, each voter receives a unique, cryptographically generated token that can only be used once. This token is linked to voter eligibility but decoupled from their identity, preventing double-voting."
              },
              {
                q: "Can voters verify their vote was counted?",
                a: "Yes. Voters receive a unique receipt during voting that allows them to verify their encrypted vote was correctly recorded on the blockchain, without revealing their actual vote choice."
              },
              {
                q: "Is the blockchain truly decentralized?",
                a: "We propose a permissioned consortium blockchain managed by the Central Elections Committee and other trusted entities. This balances decentralization with the control necessary for national elections."
              },
              {
                q: "What about cybersecurity threats?",
                a: "The entire system undergoes rigorous security audits and penetration testing. We employ quantum-resistant cryptography and distributed architecture to prevent single points of failure."
              },
              {
                q: "How will this integrate with current Israeli law?",
                a: "Adapting existing election laws to accommodate blockchain voting is a significant undertaking. This proposal serves as a technical blueprint for legal and policy discussions."
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

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-cyan-500">
        <div className="container text-center">
          <h2 className="text-4xl font-bold text-white mb-6">Ready to Learn More?</h2>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            This proposal represents a comprehensive approach to modernizing democratic voting through blockchain technology. Explore the full technical documentation to understand every component.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="bg-white text-blue-600 hover:bg-blue-50">
              Download Full Architecture
            </Button>
            <Button size="lg" variant="outline" className="border-white text-white hover:bg-white/10">
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-blue-900 text-blue-100 py-12">
        <div className="container">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <h4 className="font-bold text-white mb-4">VoteChain</h4>
              <p className="text-sm">A blockchain-based voting system for Israel, designed for security, transparency, and trust.</p>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Architecture</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">System Design</a></li>
                <li><a href="#" className="hover:text-white transition">Components</a></li>
                <li><a href="#" className="hover:text-white transition">Security</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-bold text-white mb-4">Resources</h4>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white transition">Documentation</a></li>
                <li><a href="#" className="hover:text-white transition">Research</a></li>
                <li><a href="#" className="hover:text-white transition">FAQ</a></li>
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
            <p>&copy; 2026 VoteChain. A proposal for secure democratic voting in Israel.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
