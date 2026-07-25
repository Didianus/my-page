# Task 12: Profile & Notifications Pages

## Summary
Built the full-featured Profile and Notifications pages for the KasKu financial management app with modern glassmorphism design, emerald/teal accents, framer-motion animations, and comprehensive form handling.

## Files Replaced

1. `/src/components/pages/profile-page.tsx` - Complete rewrite from stub to full page component
2. `/src/components/pages/notifications-page.tsx` - Complete rewrite from stub to full page component

## Profile Page Features

1. **Header** - "Profil Saya" title with User icon (emerald), description text

2. **Profile Card** (large, centered, glassmorphism):
   - Large avatar (h-24 w-24) with emerald-to-teal gradient initials fallback
   - Camera overlay on hover for potential avatar upload
   - User name (text-2xl bold), email with Mail icon, role badge with Shield icon
   - Member number and join date (if member data exists) in pill badges
   - Gradient background (emerald-50 → teal-50 → cyan-50)

3. **Edit Profile Form** (in Card, left column on desktop):
   - Nama Lengkap (Input with User icon prefix, required)
   - Email (read-only, grayed out with bg-muted/50, note "Email tidak dapat diubah")
   - Nomor HP (Input with Phone icon prefix)
   - Alamat (Textarea with MapPin icon prefix, min-h-[80px])
   - Jenis Kelamin (Select dropdown: Laki-laki/Perempuan)
   - "Simpan Perubahan" button (emerald-to-teal gradient, CheckCircle2 icon, Loader2 spinner)
   - On success: updates profile state AND Zustand store via setUser (preserves existing token)

4. **Change Password Card** (right column on desktop):
   - Kata Sandi Lama (password input with Lock icon, Eye/EyeOff toggle)
   - Kata Sandi Baru (password input with Lock icon, Eye/EyeOff toggle)
   - Konfirmasi Kata Sandi Baru (password input with Lock icon, Eye/EyeOff toggle)
   - Password requirements card (amber-themed):
     - Min 6 characters (green dot indicator when met)
     - Confirm password match (green dot indicator when met)
   - "Ubah Password" button (amber-to-orange gradient, Lock icon, Loader2 spinner)
   - Validation: required fields, min 6 chars, password match
   - Clears form on success

5. **Account Info Card** (full width, read-only):
   - 4 info items in responsive 2x2 grid:
     - Jabatan (Shield icon, role badge with getRoleBadgeColor)
     - Status (CheckCircle2 icon, Aktif=emerald / Nonaktif=gray badge)
     - Terdaftar Sejak (CalendarDays icon, teal theme, formatted date)
     - Terakhir Diperbarui (Clock icon, cyan theme, formatted date)
   - Each item in rounded-xl card with icon, label, and value

6. **Loading Skeleton** (ProfilePageSkeleton component)

7. **Error State** with AlertCircle icon, error message, and retry button

## Notifications Page Features

1. **Header** - "Notifikasi" title with Bell icon (emerald), unread count badge, description text, "Tandai Semua Dibaca" button (outline with emerald border, CheckCheck icon, visible only when unreadCount > 0)

2. **Notification List** (in Card with max-h-[600px] scrollable area):
   - Each notification item shows:
     - Left border color by type (border-l-4)
     - Type icon in rounded-xl background:
       - info: Info icon (sky/blue theme)
       - success: CheckCircle2 icon (emerald/green theme)
       - warning: AlertTriangle icon (amber/orange theme)
       - error: XCircle icon (red theme)
     - Title (bold, text-sm font-semibold)
     - Message (text-sm text-muted-foreground, line-clamp-2)
     - Relative time (Clock icon, formatRelativeTime helper):
       - "Baru saja", "X menit lalu", "X jam lalu", "X hari lalu", "X minggu lalu", "X bulan lalu", or formatted date
     - Unread indicator: colored dot (matching notification type color) with ring
     - Unread items have emerald-50 background highlight
   - Click to mark as read (optimistic update with revert on error)
   - "Mark All as Read" batch operation (optimistic update with Promise.all)
   - Smooth framer-motion animations (AnimatePresence with popLayout mode)
   - Empty state: Bell icon in emerald circle + "Tidak ada notifikasi" message

3. **Loading Skeleton** (NotificationsPageSkeleton component)

4. **Error State** with AlertCircle icon, error message, and retry button

## Technical Details

### Profile Page
- Export: `export function ProfilePage()` (named export)
- Directive: `'use client'`
- Uses `useAppStore` for user data and `setUser` for store updates (preserves token)
- Uses `api.get` and `api.put` from `@/lib/api-client`
- Uses `formatDate`, `getRoleLabel`, `getRoleBadgeColor` from `@/lib/constants`
- Toast notifications via `sonner`
- shadcn/ui components: Card, Avatar, Badge, Button, Input, Label, Textarea, Select, Skeleton
- framer-motion: containerVariants + itemVariants for staggered page entry, hover scale on profile card
- TypeScript types: ProfileData, MemberData, ProfileResponse, UpdateProfileResponse, ChangePasswordResponse
- Responsive: 2-column grid on lg (edit profile + change password), 1-column on mobile
- Glassmorphism: bg-white/60 dark:bg-gray-900/60 backdrop-blur-sm
- Emerald/teal accent color scheme for profile, amber/orange for password section
- Password validation with clear error messages per field
- Form state clears on successful password change

### Notifications Page
- Export: `export function NotificationsPage()` (named export)
- Directive: `'use client'`
- Uses `api.get` and `api.put` from `@/lib/api-client`
- Toast notifications via `sonner`
- shadcn/ui components: Card, Button, Badge, Skeleton
- framer-motion: containerVariants + itemVariants for page entry, listItemVariants for notification items, AnimatePresence with popLayout for list transitions
- TypeScript types: Notification, NotificationType, NotificationsResponse, MarkReadResponse
- notificationConfig: maps type to icon, iconBg, iconColor, dotColor, borderColor
- formatRelativeTime: Indonesian relative time strings
- Optimistic updates for both single and batch mark-as-read with error revert
- Responsive design with scrollable notification list
- Glassmorphism card design matching app theme
- Dark mode compatible throughout

## Lint & Testing Results
- ESLint passes with zero errors
- Dev server compiles successfully
- No errors in dev server log
