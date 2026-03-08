'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Menu, X, BarChart2, Briefcase, Lightbulb, TrendingUp, CalendarDays, Target, Wallet, Lock } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { getUserByAuthId, getUserByEmail } from '@/app/actions/users';
import FinancialSummary from '@/components/FinancialSummary';
import PortfolioInfographic from '@/components/PortfolioInfographic';
import PortfolioRecommendations from '@/components/PortfolioRecommendations';
import FinancialHealthScore from '@/components/FinancialHealthScore';
import FinancialStoryboard from '@/components/FinancialStoryboard';
import MilestonePlanner from '@/components/MilestonePlanner';
import SpendingInsights from '@/components/SpendingInsights';
import SecurityCenter from '@/components/SecurityCenter';


const C = {
  bg: "#080D14",
  bgCard: "#0F1622",
  bgElevated: "#162032",
  border: "#1E2D45",
  borderLight: "#253650",
  gold: "#C8A84B",
  goldDim: "#8A7033",
  teal: "#00C2A3",
  tealDim: "#007A68",
  red: "#F06060",
  green: "#4FCE8A",
  blue: "#4E9EF5",
  purple: "#9B7FEA",
  text: "#E8EDF5",
  textMid: "#7A90B0",
  textDim: "#3D5070",
};

const sections = [
  { id: 'summary',         label: 'Summary',          icon: <BarChart2    size={15} /> },
  { id: 'portfolio',       label: 'Portfolio',         icon: <Briefcase    size={15} /> },
  { id: 'recommendations', label: 'Recommendations',   icon: <Lightbulb    size={15} /> },
  { id: 'health-score',    label: 'Health Score',      icon: <TrendingUp   size={15} /> },
  { id: 'storyboard',      label: 'Financial Story',   icon: <CalendarDays size={15} /> },
  { id: 'milestones',      label: 'Milestones',        icon: <Target       size={15} /> },
  { id: 'spending',        label: 'Spending',          icon: <Wallet       size={15} /> },
  { id: 'security',        label: 'Security',          icon: <Lock         size={15} /> }
];

export default function Home() {
  const { session, loading, signOut } = useAuth();
  const router = useRouter();
  const [activeSection, setActiveSection] = useState('summary');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [dbUserId, setDbUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && !session) {
      router.replace('/login');
    }
  }, [loading, session, router]);

  useEffect(() => {
    if (!session?.user) return;
    const { id, email } = session.user;
    getUserByAuthId(id)
      .then(user => user ?? getUserByEmail(email ?? ''))
      .then(user => { if (user) setDbUserId(user.id); });
  }, [session?.user?.id]);

  if (loading || !session) {
    return (
      <div style={{ backgroundColor: C.bg }} className="min-h-screen flex items-center justify-center">
        <div style={{ color: C.textMid }} className="text-sm">Loading…</div>
      </div>
    );
  }

  return (
    <div style={{ backgroundColor: C.bg, color: C.text }} className="min-h-screen font-sans">
      {/* Header */}
      <header style={{ backgroundColor: C.bgElevated, borderBottomColor: C.border }} className="sticky top-0 z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div style={{ backgroundColor: C.gold }} className="w-10 h-10 rounded-lg flex items-center justify-center font-bold text-black">
                W
              </div>
              <h1 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold">
                Wealth & Wellness Hub
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <span style={{ color: C.textMid }} className="hidden md:block text-sm">{session.user.email}</span>
              <button
                onClick={signOut}
                style={{ borderColor: C.border, color: C.textMid }}
                className="hidden md:block px-3 py-1.5 rounded-lg border text-sm hover:opacity-75"
              >
                Sign out
              </button>
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className="md:hidden p-2 rounded-lg hover:opacity-75"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <nav
          style={{ backgroundColor: C.bg, borderTopColor: C.border }}
          className={`border-t ${mobileMenuOpen ? 'block' : 'hidden'} md:block`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 flex flex-wrap gap-1 md:gap-2 overflow-x-auto">
            {sections.map((section) => (
              <button
                key={section.id}
                onClick={() => {
                  setActiveSection(section.id);
                  setMobileMenuOpen(false);
                }}
                style={{
                  backgroundColor: activeSection === section.id ? C.gold : 'transparent',
                  color: activeSection === section.id ? '#000' : C.text,
                  borderColor: activeSection === section.id ? C.gold : C.border,
                }}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg border transition-colors whitespace-nowrap text-sm md:text-base hover:opacity-80"
              >
                {section.icon} {section.label}
              </button>
            ))}
          </div>
        </nav>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {activeSection === 'summary'         && <FinancialSummary    userId={dbUserId} />}
        {activeSection === 'portfolio'       && <PortfolioInfographic userId={dbUserId} />}
        {activeSection === 'recommendations' && <PortfolioRecommendations />}
        {activeSection === 'health-score'    && <FinancialHealthScore  userId={dbUserId} />}
        {activeSection === 'storyboard'      && <FinancialStoryboard   userId={dbUserId} />}
        {activeSection === 'milestones'      && <MilestonePlanner      userId={dbUserId} />}
        {activeSection === 'spending'        && <SpendingInsights      userId={dbUserId} />}
      </main>
    </div>
  );
}
