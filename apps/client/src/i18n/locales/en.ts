export const en = {
  common: {
    save: 'Save',
    cancel: 'Cancel',
    delete: 'Delete',
    search: 'Search...',
    active: 'Active',
    restricted: 'Restricted',
    restrictedAccess: 'Restricted Access',
    accessDenied: 'Access Denied',
    close: 'Close',
    closeModal: 'Close modal',
    signOut: 'Sign out',
    openSidebar: 'Open Navigation Menu',
    copy: 'Copy',
    copied: 'Copied!',
    notProvided: 'Not provided',
    all: 'All',
    of: 'of',
    avatar: 'Avatar',
  },
  brand: {
    productName: 'TvNa',
    systemTitle: 'TVNA',
    systemTagline: 'Find somewhere to go.',
  },
  nav: {
    groups: {
      general: 'GENERAL',
      resources: 'RESOURCES',
      administration: 'ADMINISTRATION',
    },
    items: {
      dashboard: 'Dashboard',
      pokemon: 'Pokemon',
      users: 'Users & Roles',
    },
  },
  list: {
    countLabel: 'results',
    showing: 'showing',
    clearAllFilters: 'Clear all filters',
    clearSearch: 'Clear search',
    searchPlaceholder: 'Search...',
    route: 'Group',
    filters: 'Filters',
    readOnlyLocked: 'Locked (Read-only access)',
  },
  status: {
    active: 'Active',
    suspended: 'Suspended',
    pending: 'Pending',
    inactive: 'Inactive',
  },
  errors: {
    pokemon_not_found: 'No pokemon matches that name.',
    upstream_unavailable: 'The upstream service is unavailable. Try again shortly.',
    validation_error: 'Please check your input and try again.',
    unknown: 'Something went wrong. Please try again.',
  },
  photoUpload: {
    label: 'Image',
    optional: '(Optional)',
    uploadButton: 'Upload Photo',
    changeButton: 'Change Photo',
    removeButton: 'Remove Photo',
    dragDropText: 'Drag & drop image here or click to browse',
    supportedFormats: 'JPG, PNG, WebP up to 5MB',
    fileSizeError: 'File size exceeds 5MB limit',
    fileTypeError: 'Please select a valid image file (JPG, PNG, WebP)',
    enterUrl: 'Or paste image URL',
    urlPlaceholder: 'https://example.com/photo.jpg',
    imageSelected: 'Image Selected',
    uploadedFromDevice: 'Uploaded from device',
    apply: 'Apply',
    readError: 'Failed to read image file',
  },
  unsavedChanges: {
    title: 'Discard Unsaved Changes?',
    description:
      'You have unsaved changes in this form. If you leave now, all your unsaved modifications will be permanently lost.',
    keepEditing: 'Keep Editing',
    discard: 'Discard Changes',
  },
};

type DeepString<T> = {
  readonly [K in keyof T]: T[K] extends Record<string, unknown>
    ? DeepString<T[K]>
    : string;
};

export type TranslationSchema = DeepString<typeof en>;
