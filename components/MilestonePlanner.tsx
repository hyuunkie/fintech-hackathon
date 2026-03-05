'use client';

import { useState } from 'react';
import { C, MILESTONES_DATA } from '@/lib/constants';
import { Plus, X, Target, TrendingUp, Car, Plane, Home, BookOpen, Umbrella } from 'lucide-react';

interface Milestone {
  id: number;
  name: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string;
  priority: 'high' | 'medium' | 'low';
  category: string;
}

export default function MilestonePlanner() {
  const [milestones, setMilestones] = useState<Milestone[]>(MILESTONES_DATA as Milestone[]);
  const [showAddMilestone, setShowAddMilestone] = useState(false);
  const [newMilestone, setNewMilestone] = useState<{
    name: string;
    targetAmount: number;
    currentAmount: number;
    deadline: string;
    priority: 'high' | 'medium' | 'low';
    category: string;
  }>({
    name: '',
    targetAmount: 0,
    currentAmount: 0,
    deadline: '',
    priority: 'medium',
    category: 'other',
  });

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(value);
  };

  const calculateDaysLeft = (deadline: string) => {
    const today = new Date();
    const deadlineDate = new Date(deadline);
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const calculateMonthlyNeeded = (target: number, current: number, deadline: string) => {
    const daysLeft = calculateDaysLeft(deadline);
    const monthsLeft = Math.max(daysLeft / 30, 0.1);
    const remaining = Math.max(target - current, 0);
    return remaining / monthsLeft;
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return C.red;
      case 'medium':
        return C.gold;
      case 'low':
        return C.green;
      default:
        return C.textMid;
    }
  };

  const getCategoryIcon = (category: string) => {
    const s = { size: 22 };
    switch (category) {
      case 'vehicle':    return <Car      {...s} style={{ color: C.blue }}   />;
      case 'travel':     return <Plane    {...s} style={{ color: C.teal }}   />;
      case 'home':       return <Home     {...s} style={{ color: C.green }}  />;
      case 'education':  return <BookOpen {...s} style={{ color: C.purple }} />;
      case 'retirement': return <Umbrella {...s} style={{ color: C.gold }}   />;
      default:           return <Target   {...s} style={{ color: C.blue }}   />;
    }
  };

  const handleAddMilestone = () => {
    if (newMilestone.name && newMilestone.targetAmount > 0) {
      const milestone: Milestone = {
        id: Math.max(...milestones.map((m) => m.id), 0) + 1,
        ...newMilestone,
      };
      setMilestones([...milestones, milestone]);
      setNewMilestone({
        name: '',
        targetAmount: 0,
        currentAmount: 0,
        deadline: '',
        priority: 'medium',
        category: 'other',
      });
      setShowAddMilestone(false);
    }
  };

  const removeMilestone = (id: number) => {
    setMilestones(milestones.filter((m) => m.id !== id));
  };

  const updateMilestoneAmount = (id: number, currentAmount: number) => {
    setMilestones(
      milestones.map((m) =>
        m.id === id ? { ...m, currentAmount: Math.min(currentAmount, m.targetAmount) } : m
      )
    );
  };

  const totalTarget = milestones.reduce((sum, m) => sum + m.targetAmount, 0);
  const totalCurrent = milestones.reduce((sum, m) => sum + m.currentAmount, 0);
  const overallProgress = (totalCurrent / totalTarget) * 100;

  return (
    <div className="space-y-8">
      {/* Overview */}
      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="border rounded-2xl p-8"
      >
        <h2 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-3xl font-bold mb-2">
          Milestone Planner
        </h2>
        <p style={{ color: C.textMid }} className="text-sm mb-8">
          Plan and track your financial goals and milestones
        </p>

        <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
          <div
            style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
            className="border rounded-lg p-4"
          >
            <p style={{ color: C.textMid }} className="text-xs mb-2">
              Active Milestones
            </p>
            <p className="text-3xl font-bold">{milestones.length}</p>
          </div>

          <div
            style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
            className="border rounded-lg p-4"
          >
            <p style={{ color: C.textMid }} className="text-xs mb-2">
              Total Target
            </p>
            <p className="text-2xl font-bold text-center">
              {formatCurrency(totalTarget)}
            </p>
          </div>

          <div
            style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
            className="border rounded-lg p-4"
          >
            <p style={{ color: C.textMid }} className="text-xs mb-2">
              Saved
            </p>
            <p className="text-2xl font-bold text-center" style={{ color: C.green }}>
              {formatCurrency(totalCurrent)}
            </p>
          </div>

          <div
            style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
            className="border rounded-lg p-4"
          >
            <p style={{ color: C.textMid }} className="text-xs mb-2">
              Remaining
            </p>
            <p className="text-2xl font-bold text-center" style={{ color: C.gold }}>
              {formatCurrency(totalTarget - totalCurrent)}
            </p>
          </div>

          <div
            style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
            className="border rounded-lg p-4"
          >
            <p style={{ color: C.textMid }} className="text-xs mb-2">
              Progress
            </p>
            <p className="text-3xl font-bold text-center">
              {overallProgress.toFixed(0)}%
            </p>
          </div>
        </div>

        {/* Overall Progress Bar */}
        <div>
          <div className="flex items-end justify-between mb-2">
            <p className="font-semibold">Overall Progress</p>
            <p style={{ color: C.textMid }} className="text-sm">
              {formatCurrency(totalCurrent)} / {formatCurrency(totalTarget)}
            </p>
          </div>
          <div
            className="h-4 rounded-lg overflow-hidden"
            style={{ backgroundColor: C.bgElevated }}
          >
            <div
              className="h-full transition-all duration-500"
              style={{
                width: `${overallProgress}%`,
                backgroundColor:
                  overallProgress >= 75
                    ? C.green
                    : overallProgress >= 50
                      ? C.gold
                      : C.gold,
              }}
            ></div>
          </div>
        </div>
      </div>

      {/* Add New Milestone Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowAddMilestone(!showAddMilestone)}
          style={{ backgroundColor: C.blue, color: '#000' }}
          className="flex items-center gap-2 px-6 py-3 rounded-lg font-semibold hover:opacity-80 transition"
        >
          <Plus size={20} /> Add Milestone
        </button>
      </div>

      {/* Add Milestone Form */}
      {showAddMilestone && (
        <div
          style={{ backgroundColor: C.bgCard, borderColor: C.border }}
          className="border rounded-2xl p-8"
        >
          <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold mb-6">
            Create New Milestone
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <label style={{ color: C.textMid }} className="text-sm block mb-2 font-semibold">
                Milestone Name
              </label>
              <input
                type="text"
                placeholder="e.g., Dream Vacation"
                value={newMilestone.name}
                onChange={(e) => setNewMilestone({ ...newMilestone, name: e.target.value })}
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: C.border,
                  color: C.text,
                }}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label style={{ color: C.textMid }} className="text-sm block mb-2 font-semibold">
                Category
              </label>
              <select
                value={newMilestone.category}
                onChange={(e) => setNewMilestone({ ...newMilestone, category: e.target.value })}
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: C.border,
                  color: C.text,
                }}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="other">Other</option>
                <option value="vehicle">Vehicle</option>
                <option value="travel">Travel</option>
                <option value="home">Home</option>
                <option value="education">Education</option>
                <option value="retirement">Retirement</option>
              </select>
            </div>

            <div>
              <label style={{ color: C.textMid }} className="text-sm block mb-2 font-semibold">
                Target Amount
              </label>
              <input
                type="number"
                placeholder="0"
                value={newMilestone.targetAmount}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, targetAmount: parseFloat(e.target.value) })
                }
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: C.border,
                  color: C.text,
                }}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label style={{ color: C.textMid }} className="text-sm block mb-2 font-semibold">
                Current Amount
              </label>
              <input
                type="number"
                placeholder="0"
                value={newMilestone.currentAmount}
                onChange={(e) =>
                  setNewMilestone({ ...newMilestone, currentAmount: parseFloat(e.target.value) })
                }
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: C.border,
                  color: C.text,
                }}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label style={{ color: C.textMid }} className="text-sm block mb-2 font-semibold">
                Target Date
              </label>
              <input
                type="date"
                value={newMilestone.deadline}
                onChange={(e) => setNewMilestone({ ...newMilestone, deadline: e.target.value })}
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: C.border,
                  color: C.text,
                }}
                className="w-full border rounded-lg px-4 py-2"
              />
            </div>

            <div>
              <label style={{ color: C.textMid }} className="text-sm block mb-2 font-semibold">
                Priority
              </label>
              <select
                value={newMilestone.priority}
                onChange={(e) => {
                  const newPriority = e.target.value as 'high' | 'medium' | 'low';
                  setNewMilestone({
                    ...newMilestone,
                    priority: newPriority,
                  });
                }}
                style={{
                  backgroundColor: C.bgElevated,
                  borderColor: C.border,
                  color: C.text,
                }}
                className="w-full border rounded-lg px-4 py-2"
              >
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="flex gap-3">
            <button
              onClick={handleAddMilestone}
              style={{ backgroundColor: C.green, color: '#000' }}
              className="px-6 py-2 rounded-lg font-semibold hover:opacity-80 transition"
            >
              Create Milestone
            </button>
            <button
              onClick={() => setShowAddMilestone(false)}
              style={{ borderColor: C.border }}
              className="px-6 py-2 border rounded-lg font-semibold hover:opacity-80 transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Milestones List */}
      <div className="space-y-4">
        {milestones.length === 0 ? (
          <div
            style={{ backgroundColor: C.bgCard, borderColor: C.border }}
            className="border rounded-2xl p-12 text-center"
          >
            <Target size={48} style={{ color: C.textDim, margin: '0 auto 1rem' }} />
            <p style={{ color: C.textMid }} className="text-lg">
              No milestones yet. Create your first goal now!
            </p>
          </div>
        ) : (
          milestones.map((milestone) => {
            const progress = (milestone.currentAmount / milestone.targetAmount) * 100;
            const daysLeft = calculateDaysLeft(milestone.deadline);
            const monthlyNeeded = calculateMonthlyNeeded(
              milestone.targetAmount,
              milestone.currentAmount,
              milestone.deadline
            );
            const isAchieved = milestone.currentAmount >= milestone.targetAmount;

            return (
              <div
                key={milestone.id}
                style={{ backgroundColor: C.bgCard, borderColor: C.border }}
                className="border rounded-xl p-6"
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-9 h-9 flex items-center justify-center rounded-lg" style={{ backgroundColor: C.bgElevated }}>{getCategoryIcon(milestone.category)}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        <h4 className="text-lg font-bold">{milestone.name}</h4>
                        <span
                          className="px-2 py-1 rounded text-xs font-semibold"
                          style={{
                            backgroundColor: `${getPriorityColor(milestone.priority)}30`,
                            color: getPriorityColor(milestone.priority),
                          }}
                        >
                          {milestone.priority === 'high'
                            ? 'High'
                            : milestone.priority === 'medium'
                              ? 'Medium'
                              : 'Low'}{' '}
                          Priority
                        </span>
                      </div>
                      <p style={{ color: C.textMid }} className="text-sm">
                        {formatCurrency(milestone.currentAmount)} / {formatCurrency(milestone.targetAmount)}
                      </p>
                    </div>
                  </div>
                  <button
                    onClick={() => removeMilestone(milestone.id)}
                    className="p-2 hover:opacity-50 transition"
                    style={{ color: C.textDim }}
                  >
                    <X size={20} />
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-4">
                  <div
                    className="h-3 rounded-full overflow-hidden"
                    style={{ backgroundColor: C.bgElevated }}
                  >
                    <div
                      className="h-full transition-all duration-500"
                      style={{
                        width: `${Math.min(progress, 100)}%`,
                        backgroundColor: isAchieved ? C.green : C.gold,
                      }}
                    ></div>
                  </div>
                </div>

                {/* Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <p style={{ color: C.textDim }} className="text-xs mb-1">
                      Progress
                    </p>
                    <p className="font-bold">{progress.toFixed(0)}%</p>
                  </div>
                  <div>
                    <p style={{ color: C.textDim }} className="text-xs mb-1">
                      Days Left
                    </p>
                    <p
                      className="font-bold"
                      style={{
                        color:
                          daysLeft < 60 ? C.red : daysLeft < 180 ? C.gold : C.green,
                      }}
                    >
                      {daysLeft > 0 ? daysLeft : 'Overdue'}
                    </p>
                  </div>
                  <div>
                    <p style={{ color: C.textDim }} className="text-xs mb-1">
                      Monthly Needed
                    </p>
                    <p className="font-bold">{formatCurrency(monthlyNeeded)}</p>
                  </div>
                  <div>
                    <p style={{ color: C.textDim }} className="text-xs mb-1">
                      Still Need
                    </p>
                    <p className="font-bold" style={{ color: C.gold }}>
                      {formatCurrency(Math.max(milestone.targetAmount - milestone.currentAmount, 0))}
                    </p>
                  </div>
                </div>

                {/* Progress Control */}
                <div className="mt-4 pt-4 border-t" style={{ borderColor: C.border }}>
                  <label style={{ color: C.textMid }} className="text-xs block mb-2">
                    Update Progress
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="range"
                      min="0"
                      max={milestone.targetAmount}
                      value={milestone.currentAmount}
                      onChange={(e) =>
                        updateMilestoneAmount(milestone.id, parseFloat(e.target.value))
                      }
                      className="flex-1"
                      style={{
                        accentColor:
                          progress >= 75 ? C.green : progress >= 40 ? C.gold : C.red,
                      }}
                    />
                    <input
                      type="number"
                      value={milestone.currentAmount}
                      onChange={(e) =>
                        updateMilestoneAmount(milestone.id, parseFloat(e.target.value))
                      }
                      style={{
                        backgroundColor: C.bgElevated,
                        borderColor: C.border,
                        color: C.text,
                      }}
                      className="w-24 border rounded px-2 py-1 text-sm"
                    />
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Tips */}
      <div
        style={{ backgroundColor: C.bgCard, borderColor: C.border }}
        className="border rounded-2xl p-8"
      >
        <h3 style={{ fontFamily: "'Playfair Display', Georgia, serif" }} className="text-2xl font-bold mb-4">
          Smart Tips
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div
            style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
            className="border rounded-lg p-4"
          >
            <p className="font-semibold mb-2">Break Down Large Goals</p>
            <p style={{ color: C.textMid }} className="text-sm">
              Divide big financial goals into smaller monthly targets to make them more achievable.
            </p>
          </div>
          <div
            style={{ backgroundColor: C.bgElevated, borderColor: C.borderLight }}
            className="border rounded-lg p-4"
          >
            <p className="font-semibold mb-2">Automate Your Savings</p>
            <p style={{ color: C.textMid }} className="text-sm">
              Set up automatic transfers to a dedicated savings account for each milestone.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
