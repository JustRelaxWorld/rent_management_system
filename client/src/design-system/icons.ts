// Icon System for RentEase
import {
  HomeIcon,
  Bars3Icon,
  XMarkIcon,
  UserIcon,
  UserCircleIcon,
  BuildingOfficeIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  ExclamationCircleIcon,
  WrenchIcon,
  DocumentTextIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  LockClosedIcon,
  BellIcon,
  EnvelopeIcon,
  CalendarIcon,
  ClockIcon,
  CreditCardIcon,
  SunIcon,
  MoonIcon,
} from '@heroicons/react/24/outline';

// Icon Categories
export const iconCategories = {
  navigation: {
    home: HomeIcon,
    menu: Bars3Icon,
    close: XMarkIcon,
  },
  user: {
    user: UserIcon,
    userCircle: UserCircleIcon,
  },
  property: {
    building: BuildingOfficeIcon,
    location: MapPinIcon,
    money: CurrencyDollarIcon,
  },
  actions: {
    add: PlusIcon,
    edit: PencilIcon,
    delete: TrashIcon,
    view: EyeIcon,
    search: MagnifyingGlassIcon,
  },
  status: {
    success: CheckCircleIcon,
    error: ExclamationCircleIcon,
  },
  maintenance: {
    wrench: WrenchIcon,
  },
  documents: {
    document: DocumentTextIcon,
  },
  analytics: {
    chart: ChartBarIcon,
  },
  settings: {
    cog: Cog6ToothIcon,
  },
  security: {
    lock: LockClosedIcon,
  },
  notifications: {
    bell: BellIcon,
    email: EnvelopeIcon,
  },
  time: {
    calendar: CalendarIcon,
    clock: ClockIcon,
  },
  finance: {
    creditCard: CreditCardIcon,
  },
  weather: {
    sun: SunIcon,
    moon: MoonIcon,
  },
};

// Icon Sizes
export const iconSizes = {
  xs: 'h-3 w-3',      // 12px
  sm: 'h-4 w-4',      // 16px
  md: 'h-5 w-5',      // 20px
  lg: 'h-6 w-6',      // 24px
  xl: 'h-8 w-8',      // 32px
  '2xl': 'h-10 w-10', // 40px
  '3xl': 'h-12 w-12', // 48px
  '4xl': 'h-16 w-16', // 64px
};

// Icon Usage Guidelines
export const iconGuidelines = {
  sizes: {
    navigation: 'md',      // 20px
    buttons: 'sm',         // 16px
    formInputs: 'sm',      // 16px
    status: 'md',          // 20px
    actions: 'sm',         // 16px
    decorative: 'lg',      // 24px
    large: 'xl',           // 32px
  },
  colors: {
    primary: 'text-primary-500',
    secondary: 'text-neutral-500',
    success: 'text-green-500',
    warning: 'text-amber-500',
    error: 'text-red-500',
    info: 'text-blue-500',
    disabled: 'text-neutral-400',
    inverse: 'text-white',
  },
  animations: {
    hover: 'transition-colors duration-200',
    click: 'transition-transform duration-100',
    loading: 'animate-spin',
    pulse: 'animate-pulse',
  },
};

export default iconCategories; 