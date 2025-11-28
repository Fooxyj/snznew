import React from 'react';
import { CodeAnalysisResult, Severity } from '../types';
import { IssueCard } from './IssueCard';
import { ShieldAlert, CheckCircle, FileCode, Zap } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

interface AnalysisDashboardProps {
  result: CodeAnalysisResult;
}

export const AnalysisDashboard: React.FC<AnalysisDashboardProps> = ({ result }) => {
  
  const getScoreColor = (score: number) => {
    if (score >= 90) return 'text-green-400';
    if (score >= 70) return 'text-yellow-400';
    if (score >= 50) return 'text-orange-400';
    return 'text-red-400';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 90) return 'Excellent';
    if (score >= 70) return 'Good';
    if (score >= 50) return 'Needs Work';
    return 'Critical';
  };

  const issueStats = [
    { name: 'Critical', value: result.issues.filter(i => i.severity === Severity.CRITICAL).length, color: '#ef4444' },
    { name: 'High', value: result.issues.filter(i => i.severity === Severity.HIGH).length, color: '#f97316' },
    { name: 'Medium', value: result.issues.filter(i => i.severity === Severity.MEDIUM).length, color: '#eab308' },
    { name: 'Low', value: result.issues.filter(i => i.severity === Severity.LOW).length, color: '#3b82f6' },
  ].filter(stat => stat.value > 0);

  return (
    <div className="h-full flex flex-col gap-6 animate-fade-in">
      
      {/* Top Summary Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Score Card */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col items-center justify-center relative overflow-hidden">
          <div className="absolute top-0 right-0 p-3 opacity-10">
            <Zap size={80} />
          </div>
          <span className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2">Quality Score</span>
          <div className={`text-6xl font-bold font-mono ${getScoreColor(result.score)}`}>
            {result.score}
          </div>
          <span className={`text-sm mt-2 font-medium bg-slate-900/50 px-3 py-1 rounded-full ${getScoreColor(result.score)}`}>
            {getScoreLabel(result.score)}
          </span>
        </div>

        {/* Language & Meta */}
        <div className="bg-slate-800 rounded-xl p-6 border border-slate-700 flex flex-col justify-center">
            <div className="flex items-center gap-3 mb-4">
                <FileCode className="text-purple-400" />
                <div>
                    <div className="text-slate-400 text-xs uppercase">Detected Language</div>
                    <div className="text-white font-semibold text-lg">{result.language}</div>
                </div>
            </div>
            <div className="flex items-center gap-3">
                <ShieldAlert className="text-red-400" />
                <div>
                    <div className="text-slate-400 text-xs uppercase">Security Risks</div>
                    <div className="text-white font-semibold text-lg">{result.securityRisks.length} Detected</div>
                </div>
            </div>
        </div>

        {/* Issue Chart */}
        <div className="bg-slate-800 rounded-xl p-4 border border-slate-700 flex flex-col items-center justify-center">
           <span className="text-slate-400 text-sm font-medium uppercase tracking-wider mb-2 w-full text-center">Issue Breakdown</span>
           {issueStats.length > 0 ? (
             <div className="w-full h-32">
                <ResponsiveContainer width="10