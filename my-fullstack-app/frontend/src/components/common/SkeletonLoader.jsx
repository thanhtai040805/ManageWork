import React from 'react';

export const Skeleton = ({ className }) => (
  <div className={`skeleton ${className}`} />
);

export const ProjectCardSkeleton = () => (
  <div className="bg-white p-6 rounded-[24px] border border-slate-100 shadow-sm space-y-4">
    <div className="flex justify-between items-start">
      <Skeleton className="h-10 w-10 rounded-2xl" />
      <Skeleton className="h-6 w-16 rounded-full" />
    </div>
    <div className="space-y-2">
      <Skeleton className="h-6 w-3/4" />
      <Skeleton className="h-4 w-full" />
    </div>
    <div className="pt-4 flex justify-between">
      <Skeleton className="h-4 w-20" />
      <Skeleton className="h-4 w-12" />
    </div>
  </div>
);

export const TaskCardSkeleton = () => (
  <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm space-y-3">
    <div className="flex justify-between">
      <Skeleton className="h-4 w-20 rounded-full" />
      <Skeleton className="h-4 w-4 rounded-full" />
    </div>
    <Skeleton className="h-5 w-full" />
    <Skeleton className="h-4 w-2/3" />
    <div className="flex justify-between pt-2">
      <Skeleton className="h-6 w-6 rounded-lg" />
      <Skeleton className="h-4 w-16" />
    </div>
  </div>
);

export const HeaderSkeleton = () => (
  <div className="w-full flex p-5 bg-white border-b border-slate-100 items-center justify-between">
    <Skeleton className="h-8 w-32" />
    <Skeleton className="h-12 w-[50%] rounded-xl" />
    <div className="flex gap-4">
      <Skeleton className="h-10 w-10 rounded-full" />
      <Skeleton className="h-10 w-10 rounded-full" />
    </div>
  </div>
);
