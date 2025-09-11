import React from 'react';

const SkeletonBlock: React.FC<{className?: string}> = ({className}) => (
    <div className={`bg-slate-700/50 rounded-md animate-pulse ${className}`} />
)

export const LessonSkeleton: React.FC = () => {
  return (
    <div className="max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-8">
        <SkeletonBlock className="h-6 w-48" />
        <SkeletonBlock className="h-8 w-8" />
      </div>

      <SkeletonBlock className="h-64 w-full mb-12 rounded-xl" />

      <div className="text-center mb-12">
        <SkeletonBlock className="h-12 w-3/4 mx-auto mb-4" />
        <SkeletonBlock className="h-6 w-1/2 mx-auto" />
      </div>

      <div className="space-y-8">
        {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-brand-secondary/50 rounded-xl p-6 shadow-lg border border-slate-700/50">
                <SkeletonBlock className="h-8 w-1/3 mb-6" />
                <div className="space-y-3">
                    <SkeletonBlock className="h-4 w-full" />
                    <SkeletonBlock className="h-4 w-5/6" />
                    <SkeletonBlock className="h-4 w-full" />
                </div>
            </div>
        ))}
      </div>
    </div>
  );
};
