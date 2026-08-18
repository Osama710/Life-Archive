import type { LucideIcon } from 'lucide-react'
import {
  BookOpen,
  CalendarDays,
  Library,
  Mail,
  PlusCircle,
  Search,
  Settings,
  Sparkles,
  TrendingUp,
  Users,
} from 'lucide-react'

export type AppFeatureStatus = 'ready' | 'partial'

export interface AppFeature {
  href: string
  title: string
  description: string
  emoji: string
  icon: LucideIcon
  status: AppFeatureStatus
  statusNote?: string
  section: 'core' | 'kids' | 'extras' | 'account'
  showOnHome?: boolean
}

export const APP_FEATURES: AppFeature[] = [
  {
    href: '/dashboard/timeline',
    title: 'Timeline',
    description: 'Every memory in order — your main feed.',
    emoji: '📖',
    icon: BookOpen,
    status: 'ready',
    section: 'core',
    showOnHome: true,
  },
  {
    href: '/dashboard/memory/create',
    title: 'Add memory',
    description: 'Capture a moment with photos, story, and date.',
    emoji: '➕',
    icon: PlusCircle,
    status: 'ready',
    section: 'core',
    showOnHome: true,
  },
  {
    href: '/dashboard/calendar',
    title: 'Calendar',
    description: 'Tap a day to see what happened that date.',
    emoji: '📅',
    icon: CalendarDays,
    status: 'ready',
    section: 'core',
    showOnHome: true,
  },
  {
    href: '/dashboard/search',
    title: 'Search',
    description: 'Find memories by title or story text.',
    emoji: '🔍',
    icon: Search,
    status: 'ready',
    section: 'core',
    showOnHome: true,
  },
  {
    href: '/dashboard/family',
    title: 'Family',
    description: 'Invite your partner — share the archive on both phones.',
    emoji: '👨‍👩‍👧',
    icon: Users,
    status: 'ready',
    section: 'core',
    showOnHome: true,
  },
  {
    href: '/dashboard/on-this-day',
    title: 'On This Day',
    description: 'Memories from this date in past years.',
    emoji: '✨',
    icon: Sparkles,
    status: 'ready',
    section: 'kids',
    showOnHome: true,
  },
  {
    href: '/dashboard/growth',
    title: 'Growth',
    description: 'Track height and weight for your child.',
    emoji: '📈',
    icon: TrendingUp,
    status: 'ready',
    section: 'kids',
    showOnHome: true,
  },
  {
    href: '/dashboard/collections',
    title: 'Collections',
    description: 'Create themed albums (e.g. first year, Aqiqa).',
    emoji: '📚',
    icon: Library,
    status: 'ready',
    section: 'extras',
    showOnHome: true,
  },
  {
    href: '/dashboard/letters',
    title: 'Letters',
    description: 'Seal a note for future-you or your child.',
    emoji: '💌',
    icon: Mail,
    status: 'ready',
    section: 'extras',
    showOnHome: true,
  },
  {
    href: '/dashboard/settings',
    title: 'Settings',
    description: 'Profile, trash, sign out.',
    emoji: '⚙️',
    icon: Settings,
    status: 'ready',
    section: 'account',
    showOnHome: false,
  },
]

export const APP_FEATURE_SECTIONS: { id: AppFeature['section']; label: string }[] = [
  { id: 'core', label: 'Everyday' },
  { id: 'kids', label: 'Kids & milestones' },
  { id: 'extras', label: 'More ways to save' },
  { id: 'account', label: 'Account' },
]

export const HOME_FEATURES = APP_FEATURES.filter((f) => f.showOnHome)

export const NOT_BUILT_YET = [
  'Push notifications for invites or On This Day',
  'Reading sealed Letters before unlock date',
  'Offline mode / sync queue',
] as const
