
import React from 'react';

interface SkeletonProps {
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ className = "" }) => {
  return (
    <div className={`animate-pulse bg-gray-200 dark:bg-gray-700 rounded-md ${className}`}></div>
  );
};

export const CardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-4 rounded-xl border dark:border-gray-700 shadow-sm flex flex-col md:flex-row gap-4 h-auto md:h-40">
        <Skeleton className="w-full md:w-48 h-40 md:h-full rounded-lg shrink-0" />
        <div className="flex-1 flex flex-col gap-3 p-2">
            <Skeleton className="h-6 w-3/4" />
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-2/3" />
            <div className="mt-auto flex gap-2">
                <Skeleton className="h-4 w-20" />
                <Skeleton className="h-4 w-20" />
            </div>
        </div>
    </div>
);

export const AdGridSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-xl border dark:border-gray-700 shadow-sm overflow-hidden flex flex-col h-[300px]">
        <Skeleton className="w-full h-48 rounded-none" />
        <div className="p-3 flex-1 flex flex-col gap-2">
            <div className="flex justify-between">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-4 w-1/4" />
            </div>
            <Skeleton className="h-5 w-3/4" />
            <Skeleton className="h-3 w-1/2 mt-auto" />
        </div>
    </div>
);

export const BusinessCardSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 rounded-2xl border dark:border-gray-700 shadow-sm flex flex-col h-[320px] overflow-hidden">
        <Skeleton className="h-48 w-full rounded-none" />
        <div className="p-5 flex-1 flex flex-col gap-3">
            <Skeleton className="h-6 w-2/3" />
            <Skeleton className="h-4 w-full" />
            <div className="mt-auto pt-2 border-t dark:border-gray-700 flex justify-between items-center">
                <Skeleton className="h-4 w-1/3" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
        </div>
    </div>
);

export const DashboardWidgetSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-5 rounded-2xl border dark:border-gray-700 shadow-sm h-32 flex flex-col justify-between">
        <Skeleton className="h-4 w-1/2" />
        <Skeleton className="h-8 w-1/3" />
    </div>
);

export const ChartSkeleton: React.FC = () => (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border dark:border-gray-700 shadow-sm h-80 flex flex-col gap-4">
        <Skeleton className="h-6 w-1/4" />
        <div className="flex-1 flex items-end gap-2">
            {[...Array(7)].map((_, i) => (
                <Skeleton key={i} className={`flex-1 rounded-t-lg h-[${Math.floor(Math.random() * 80 + 20)}%]`} />
            ))}
        </div>
    </div>
);
