'use client';

import Image from 'next/image';
import { useUserAvatar } from '@/app/lib/useUserAvatar';

interface UserAvatarProps {
  userId: number;
  size?: number;
  className?: string;
}

export default function UserAvatar({ userId, size = 200, className = '' }: UserAvatarProps) {
  const { avatarUrl, loading, error } = useUserAvatar(userId);

  if (loading) {
    return (
      <div 
        className={`bg-gray-300 rounded-full animate-pulse ${className}`}
        style={{ width: size, height: size }}
      />
    );
  }

  if (error || !avatarUrl) {
    return (
      <div 
        className={`bg-gray-400 rounded-full flex items-center justify-center ${className}`}
        style={{ width: size, height: size }}
      >
        <span className="text-white text-sm">?</span>
      </div>
    );
  }

  return (
    <Image
      src={avatarUrl}
      alt="User avatar"
      width={size}
      height={size}
      className={`rounded-full object-cover ${className}`}
      onError={(e) => {
        e.currentTarget.style.display = 'none';
      }}
    />
  );
}