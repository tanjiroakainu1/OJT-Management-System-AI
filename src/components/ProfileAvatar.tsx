import type { UserRole } from '../types';

export function getInitials(name?: string): string {
  return (name ?? '?')
    .split(' ')
    .filter(Boolean)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
    .toUpperCase();
}

const sizeClasses = {
  sm: 'h-9 w-9 text-xs rounded-xl',
  md: 'h-14 w-14 text-lg rounded-2xl',
  lg: 'h-28 w-28 text-3xl rounded-3xl',
  xl: 'h-36 w-36 text-4xl rounded-[2rem]',
};

const ringClasses = {
  sm: 'ring-2 ring-violet-500/40',
  md: 'ring-2 ring-violet-500/50',
  lg: 'ring-4 ring-fuchsia-400/50 shadow-[0_0_32px_rgba(232,121,249,0.35)]',
  xl: 'ring-4 ring-fuchsia-400/60 shadow-[0_0_40px_rgba(168,85,247,0.45)]',
};

const roleGradients: Record<UserRole, string> = {
  admin: 'from-fuchsia-600 via-[#7c3aed] to-[#e879f9]',
  coordinator: 'from-purple-600 via-[#7c3aed] to-indigo-500',
  supervisor: 'from-cyan-600 via-[#7c3aed] to-[#e879f9]',
  student: 'from-[#7c3aed] via-[#e879f9] to-[#f472b6]',
};

interface ProfileAvatarProps {
  name?: string;
  avatarUrl?: string | null;
  role?: UserRole;
  size?: keyof typeof sizeClasses;
  className?: string;
}

export function ProfileAvatar({
  name,
  avatarUrl,
  role = 'student',
  size = 'md',
  className = '',
}: ProfileAvatarProps) {
  const gradient = roleGradients[role];
  const initials = getInitials(name);

  if (avatarUrl?.startsWith('data:image/')) {
    return (
      <div
        className={`relative shrink-0 overflow-hidden bg-[#12102a] ${sizeClasses[size]} ${ringClasses[size]} ${className}`}
      >
        <img
          src={avatarUrl}
          alt={name ? `${name} profile` : 'Profile'}
          className="h-full w-full object-cover"
        />
      </div>
    );
  }

  return (
    <div
      className={`flex shrink-0 items-center justify-center bg-gradient-to-br ${gradient} font-bold text-white ${sizeClasses[size]} ${ringClasses[size]} ${className}`}
      aria-hidden
    >
      {initials}
    </div>
  );
}
