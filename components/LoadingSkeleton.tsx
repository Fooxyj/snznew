import React from 'react';

export const AdCardSkeleton: React.FC = () => {
    return (
        <div className="group relative bg-surface rounded-xl md:rounded-2xl flex flex-col h-full overflow-hidden border border-gray-200 animate-pulse">
            {/* Image Skeleton */}
            <div className="relative aspect-square md:aspect-[4/3] overflow-hidden bg-gray-200 shrink-0">
                <div className="w-full h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-shimmer"></div>
            </div>

            {/* Content Skeleton */}
            <div className="p-2.5 md:p-4 flex flex-col flex-grow">
                {/* Title */}
                <div className="mb-2">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-4 bg-gray-200 rounded w-1/2"></div>
                </div>

                {/* Description */}
                <div className="mb-2">
                    <div className="h-3 bg-gray-100 rounded w-full mb-1"></div>
                    <div className="h-3 bg-gray-100 rounded w-5/6"></div>
                </div>

                {/* Price */}
                <div className="mt-auto mb-1">
                    <div className="h-5 bg-gray-200 rounded w-24"></div>
                </div>

                {/* Footer */}
                <div className="hidden md:block pt-2 border-t border-gray-100">
                    <div className="h-3 bg-gray-100 rounded w-20"></div>
                </div>
            </div>
        </div>
    );
};

export const AdListSkeleton: React.FC<{ count?: number }> = ({ count = 8 }) => {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-2 md:gap-6">
            {Array.from({ length: count }).map((_, i) => (
                <AdCardSkeleton key={i} />
            ))}
        </div>
    );
};
