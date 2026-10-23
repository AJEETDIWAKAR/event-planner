/**
 * Default templates and baseline schedules for supported event types.
 */

export const DEFAULT_SPLITS = {
  wedding: [
    {
      category: 'Venue & Catering',
      percentage: 45,
      notes: 'Includes banquet hall and per-plate menu',
    },
    {
      category: 'Photography & Videography',
      percentage: 15,
      notes: 'Pre-event shoot and main coverage',
    },
    {
      category: 'Decor, Floral & Lighting',
      percentage: 15,
      notes: 'Stage setup and entrance theme',
    },
    {
      category: 'Attire, Makeup & Styling',
      percentage: 10,
      notes: 'Bridal/Groom outfits and artists',
    },
    {
      category: 'Entertainment & Music',
      percentage: 8,
      notes: 'DJ, sound system, and live performers',
    },
    { category: 'Emergency Buffer & Misc', percentage: 7, notes: 'Last-minute logistics and tips' },
  ],
  birthday: [
    {
      category: 'Venue & Food/Catering',
      percentage: 40,
      notes: 'Buffet, snacks, and beverage station',
    },
    {
      category: 'Custom Cake & Desserts',
      percentage: 15,
      notes: 'Theme centerpiece cake and dessert bar',
    },
    {
      category: 'Theme Decor & Balloons',
      percentage: 18,
      notes: 'Backdrop, photo booth, and table setup',
    },
    { category: 'Entertainment & Games', percentage: 15, notes: 'Host, DJ, or activity stations' },
    {
      category: 'Return Gifts & Invites',
      percentage: 12,
      notes: 'Personalized party favors for guests',
    },
  ],
  community: [
    {
      category: 'Venue, Tent & Seating',
      percentage: 35,
      notes: 'Ground booking, stage, and chairs',
    },
    {
      category: 'Refreshments & Water',
      percentage: 25,
      notes: 'Hygienic food stalls and hydration points',
    },
    {
      category: 'Sound, AV & Lighting',
      percentage: 18,
      notes: 'PA system, microphones, and banners',
    },
    {
      category: 'Permits, Safety & First Aid',
      percentage: 12,
      notes: 'Local permissions, security, and medical kit',
    },
    {
      category: 'Outreach & Volunteer Kits',
      percentage: 10,
      notes: 'Posters, badges, and sanitation supplies',
    },
  ],
};

export const DEFAULT_TIMELINES = {
  wedding: [
    {
      phase: 'Foundation',
      timeframe: '6 Months Prior',
      task: 'Lock primary venue, guest count estimate, and core budget split',
    },
    {
      phase: 'Core Vendors',
      timeframe: '4 Months Prior',
      task: 'Book caterer, photographer, and decor design team',
    },
    {
      phase: 'Invitations & Attire',
      timeframe: '2 Months Prior',
      task: 'Send digital/print invites and finalize outfit fittings',
    },
    {
      phase: 'Logistics & RSVP',
      timeframe: '2 Weeks Prior',
      task: 'Confirm final headcount with catering and share run-of-show',
    },
    {
      phase: 'Final Rehearsal',
      timeframe: '1 Day Prior',
      task: 'Verify venue setup, sound check, and emergency kit readiness',
    },
  ],
  birthday: [
    {
      phase: 'Concept & Venue',
      timeframe: '4 Weeks Prior',
      task: 'Select party theme, guest list, and reserve venue or home zone',
    },
    {
      phase: 'Cake & Entertainment',
      timeframe: '2 Weeks Prior',
      task: 'Order custom theme cake, book host/DJ, and send invitations',
    },
    {
      phase: 'Supplies & Favors',
      timeframe: '1 Week Prior',
      task: 'Purchase decor props, return gifts, and confirm RSVP count',
    },
    {
      phase: 'Setup & Cue Check',
      timeframe: 'Day of Event (4 Hours Prior)',
      task: 'Complete balloon/backdrop installation, music check, and food warming',
    },
  ],
  community: [
    {
      phase: 'Permits & Committee',
      timeframe: '6 Weeks Prior',
      task: 'Secure municipal permissions, ground booking, and volunteer leads',
    },
    {
      phase: 'Sponsorship & Vendors',
      timeframe: '4 Weeks Prior',
      task: 'Confirm stage, PA sound system, refreshment stalls, and safety team',
    },
    {
      phase: 'Community Outreach',
      timeframe: '2 Weeks Prior',
      task: 'Distribute digital posters, schedule announcements, and registration desk',
    },
    {
      phase: 'Site Inspection',
      timeframe: '1 Day Prior',
      task: 'Inspect seating layout, electrical safety, water stations, and signage',
    },
  ],
};

export const DEFAULT_VENDORS = {
  wedding: [
    {
      name: 'Banquet Venue & Catering Lead',
      category: 'Venue & Food',
      priority: 'High',
      tip: 'Confirm power backup and per-plate overtime rates in writing.',
    },
    {
      name: 'Candid & Traditional Photographer',
      category: 'Media',
      priority: 'High',
      tip: 'Define raw footage delivery timeline and album print count.',
    },
    {
      name: 'Floral & Stage Decorator',
      category: 'Decor',
      priority: 'High',
      tip: 'Approve color palette and mock lighting setup before advance payment.',
    },
    {
      name: 'DJ & Sound Engineer',
      category: 'Entertainment',
      priority: 'Medium',
      tip: 'Verify venue decibel limits and licensing permissions.',
    },
    {
      name: 'Guest Transport Coordinator',
      category: 'Logistics',
      priority: 'Low',
      tip: 'Maintain a dedicated shuttle contact sheet for elderly guests.',
    },
  ],
  birthday: [
    {
      name: 'Specialty Baker / Cake Artist',
      category: 'Food',
      priority: 'High',
      tip: 'Confirm dietary preferences (eggless/nut-free) and delivery time.',
    },
    {
      name: 'Party Decor & Balloon Stylist',
      category: 'Decor',
      priority: 'High',
      tip: 'Ensure non-damaging wall hooks for indoor setups.',
    },
    {
      name: 'Catering / Live Snack Counter',
      category: 'Food',
      priority: 'High',
      tip: 'Include kid-friendly finger foods and clearly labeled allergen tags.',
    },
    {
      name: 'Event Host / Activity Coordinator',
      category: 'Entertainment',
      priority: 'Medium',
      tip: 'Prepare a 45-minute interactive game segment to keep guests engaged.',
    },
    {
      name: 'Event Photographer',
      category: 'Media',
      priority: 'Medium',
      tip: 'Capture cake-cutting and family group portraits before meal service.',
    },
  ],
  community: [
    {
      name: 'Ground & Tent House Contractor',
      category: 'Infrastructure',
      priority: 'High',
      tip: 'Verify weather-proof canopy and unobstructed emergency exits.',
    },
    {
      name: 'PA Audio & Stage Lighting Vendor',
      category: 'Technical',
      priority: 'High',
      tip: 'Keep two backup wireless microphones and a dedicated generator.',
    },
    {
      name: 'Community Refreshment & Water Supplier',
      category: 'Food & Safety',
      priority: 'High',
      tip: 'Use biodegradable plates and place waste bins every 20 meters.',
    },
    {
      name: 'First-Aid & Security Stewards',
      category: 'Safety',
      priority: 'High',
      tip: 'Coordinate entry/exit crowd flow and keep an emergency vehicle lane clear.',
    },
    {
      name: 'Print & Digital Signage Partner',
      category: 'Outreach',
      priority: 'Medium',
      tip: 'Print bilingual directional boards for registration, washrooms, and stage.',
    },
  ],
};
