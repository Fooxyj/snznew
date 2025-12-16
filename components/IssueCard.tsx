import React from 'react';
import { CodeIssue, Severity } from '../types';
import { AlertTriangle, Info, AlertCircle, XCircle } from 'lucide-react';

interface IssueCardProps {
  issue: CodeIssue;
}

export const IssueCard: React.FC<IssueCardProps> = ({ issue }) => {
  const getSeverityColor = (sev: Severity) => {
    switch (sev) {
      case Severity.CRITICAL: return 'bg-red-500/10 border-red-500/50 text-red-400';
      case Severity.HIGH: return 'bg-orange-500/10 border-orange-500/50 text-orange-400';
      case Severity.MEDIUM: return 'bg-yellow-500/10 border-yellow-500/50 text-yellow-400';
      case Severity.LOW: return 'bg-blue-500/10 border-blue-500/50 text-blue-400';
      default: return 'bg-gray-700 border-gray-600 text-gray-300';
    }
  };

  const getIcon = (sev: Severity) => {
    switch (sev) {
      case Severity.CRITICAL: return <XCircle className="w-5 h-5 text-red-500" />;
      case Severity.HIGH: return <AlertTriangle className="w-5 h-5 text-orange-500" />;
      case Severity.MEDIUM: return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      case Severity.LOW: return <Info className="w-5 h-5 text-blue-500" />;
    }
  };

  return (
    <div className={`p-4 rounded-lg border mb-3 transition-all hover:shadow-md ${getSeverityColor(issue.severity)}`}>
      <div className="flex items-start gap-3">
        <div className="mt-0.5 shrink-0">
          {getIcon(issue.severity)}
        </div>
        <div className="flex-1">
          <div className="flex justify-between items-center mb-1">
            <h4 className="font-semibold text-sm uppercase tracking-wide opacity-90">{issue.title}</h4>
            {issue.line && issue.line > 0 && (
              <span className="text-xs font-mono bg-black/20 px-2 py-0.5 rounded text-inherit opacity-80">
                Line {issue.line}
              </span>
            )}
          </div>
          <p className="text-sm opacity-90 mb-2">{issue.description}</p>
          <div className="mt-2 text-sm bg-black/20 p-2 rounded border border-white/5">
            <span className="font-bold text-xs uppercase opacity-70 block mb-1">Suggestion:</span>
            <code className="font-mono text-xs break-words whitespace-pre-wrap">{issue.suggestion}</code>
          </div>
        </div>
      </div>
    </div>
  );
};