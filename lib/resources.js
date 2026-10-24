// Every CMS and church-management section is described here. The admin list,
// form and API are generated from these definitions.
// Field types: text, textarea, date, datetime, number, money, select, image, checkbox, relation, email, password

const yesNo = { type: 'checkbox' };

export const RESOURCES = {
  // ---------- Website CMS ----------
  slides: {
    group: 'Website', label: 'Homepage Slides', singular: 'Slide', icon: '🖼️', order: 'sort_order ASC, id ASC',
    list: ['image', 'title', 'sort_order', 'active'],
    fields: {
      title: { type: 'text', required: true }, subtitle: { type: 'textarea' }, image: { type: 'image', required: true },
      button_text: { type: 'text' }, button_link: { type: 'text', help: 'e.g. /events' },
      sort_order: { type: 'number', label: 'Order' }, active: { ...yesNo, default: true },
    },
  },
  events: {
    group: 'Website', label: 'Events', singular: 'Event', icon: '📅', order: 'start_date DESC',
    list: ['image', 'title', 'start_date', 'category', 'featured', 'published'],
    fields: {
      title: { type: 'text', required: true }, description: { type: 'textarea', rows: 7 },
      start_date: { type: 'datetime', label: 'Starts', required: true }, end_date: { type: 'datetime', label: 'Ends' },
      location: { type: 'text' }, image: { type: 'image' },
      category: { type: 'select', options: ['Celebration', 'Spiritual', 'Music', 'Outreach', 'Youth', 'Feast Day', 'Meeting', 'Other'] },
      featured: { ...yesNo, label: 'Feature on homepage' }, published: { ...yesNo, default: true },
    },
  },
  news: {
    group: 'Website', label: 'News & Announcements', singular: 'Post', icon: '📰', order: 'published_at DESC, id DESC',
    list: ['image', 'title', 'category', 'published_at', 'published'],
    fields: {
      title: { type: 'text', required: true }, summary: { type: 'textarea', rows: 2 }, body: { type: 'textarea', rows: 10 },
      image: { type: 'image' }, category: { type: 'select', options: ['Announcement', 'Parish News', 'Bulletin', 'Homily', 'Diocesan News'] },
      author: { type: 'text' }, published_at: { type: 'date', label: 'Publish date' }, published: { ...yesNo, default: true },
    },
  },
  gallery_albums: {
    group: 'Website', label: 'Gallery Albums', singular: 'Album', icon: '📸', order: 'event_date DESC NULLS LAST, id DESC',
    list: ['cover_image', 'title', 'event_date', 'published'],
    fields: {
      title: { type: 'text', required: true }, description: { type: 'textarea' }, cover_image: { type: 'image' },
      event_date: { type: 'date' }, published: { ...yesNo, default: true },
    },
  },
  gallery_photos: {
    group: 'Website', label: 'Gallery Photos', singular: 'Photo', icon: '🖼', order: 'album_id, sort_order, id DESC',
    list: ['image', 'caption', 'album_id', 'sort_order'], bulkUpload: true,
    fields: {
      album_id: { type: 'relation', table: 'gallery_albums', display: 'title', label: 'Album', required: true },
      image: { type: 'image', required: true }, caption: { type: 'text' }, sort_order: { type: 'number', label: 'Order' },
    },
  },
  mass_times: {
    group: 'Website', label: 'Mass & Confession Times', singular: 'Schedule', icon: '⛪', order: 'sort_order, id',
    list: ['day', 'time', 'title', 'category', 'language'],
    fields: {
      day: { type: 'text', required: true, help: 'e.g. Sunday, Monday – Friday' }, time: { type: 'text', required: true, help: 'e.g. 7:00 AM' },
      title: { type: 'text' }, category: { type: 'select', options: ['Mass', 'Confession', 'Adoration', 'Devotion', 'Benediction'] },
      language: { type: 'text' }, notes: { type: 'text' }, sort_order: { type: 'number', label: 'Order' },
    },
  },
  clergy: {
    group: 'Website', label: 'Clergy & Staff', singular: 'Person', icon: '✝️', order: 'sort_order, id',
    list: ['photo', 'name', 'role'],
    fields: {
      name: { type: 'text', required: true }, role: { type: 'text' }, bio: { type: 'textarea', rows: 5 }, photo: { type: 'image' },
      email: { type: 'email' }, phone: { type: 'text' }, sort_order: { type: 'number', label: 'Order' },
    },
  },
  ministries: {
    group: 'Website', label: 'Societies & Ministries', singular: 'Ministry', icon: '🤝', order: 'name',
    list: ['image', 'name', 'category', 'leader', 'meeting_time'],
    fields: {
      name: { type: 'text', required: true }, description: { type: 'textarea' },
      category: { type: 'select', options: ['Society', 'Pious Society', 'Liturgy', 'Youth', 'Charity', 'Children', 'Other'] },
      leader: { type: 'text' }, meeting_time: { type: 'text' }, image: { type: 'image' },
    },
  },

  // ---------- Church Management ----------
  parishioners: {
    group: 'Church Management', label: 'Parishioners', singular: 'Parishioner', icon: '👥', order: 'last_name, first_name',
    list: ['first_name', 'last_name', 'phone', 'zone', 'ministry_id', 'status'],
    search: ['first_name', 'last_name', 'phone', 'email', 'family_name'],
    fields: {
      first_name: { type: 'text', required: true }, last_name: { type: 'text', required: true },
      gender: { type: 'select', options: ['Male', 'Female'] }, date_of_birth: { type: 'date' },
      phone: { type: 'text' }, email: { type: 'email' }, address: { type: 'textarea', rows: 2 },
      family_name: { type: 'text', label: 'Family / Household' },
      marital_status: { type: 'select', options: ['Single', 'Married', 'Widowed', 'Separated', 'Religious'] },
      occupation: { type: 'text' },
      ministry_id: { type: 'relation', table: 'ministries', display: 'name', label: 'Society / Ministry' },
      zone: { type: 'text', label: 'Zone / Station / BEC' },
      baptized: yesNo, first_communion: { ...yesNo, label: 'First Holy Communion' }, confirmed: yesNo,
      status: { type: 'select', options: ['Active', 'Inactive', 'Moved', 'Deceased'] },
      joined_on: { type: 'date', label: 'Registered on' }, notes: { type: 'textarea' },
    },
  },
  sacraments: {
    group: 'Church Management', label: 'Sacramental Register', singular: 'Record', icon: '📖', order: 'date DESC NULLS LAST, id DESC',
    list: ['sacrament', 'person_name', 'date', 'minister', 'register_no'],
    search: ['person_name', 'register_no', 'minister'],
    fields: {
      sacrament: { type: 'select', required: true, options: ['Baptism', 'First Holy Communion', 'Confirmation', 'Marriage', 'Holy Orders', 'Anointing of the Sick', 'Funeral'] },
      person_name: { type: 'text', required: true, label: 'Name(s)' },
      parishioner_id: { type: 'relation', table: 'parishioners', display: "first_name || ' ' || last_name", label: 'Linked parishioner' },
      date: { type: 'date' }, minister: { type: 'text' }, parents: { type: 'text' }, sponsors: { type: 'text', label: 'Sponsors / Witnesses' },
      register_no: { type: 'text', label: 'Register No.' }, notes: { type: 'textarea' },
    },
  },
  donations: {
    group: 'Church Management', label: 'Offerings & Donations', singular: 'Donation', icon: '💰', order: 'date DESC, id DESC',
    list: ['date', 'donor_name', 'parishioner_id', 'category', 'amount', 'method'],
    search: ['donor_name', 'reference', 'category'],
    fields: {
      date: { type: 'date', required: true },
      parishioner_id: { type: 'relation', table: 'parishioners', display: "first_name || ' ' || last_name", label: 'Parishioner' },
      donor_name: { type: 'text', label: 'Donor name (if not a parishioner)' },
      category: { type: 'select', options: ['Offertory', 'Tithe', 'Building Fund', 'Thanksgiving', 'Harvest', 'Charity', 'Mass Stipend', 'Other'] },
      amount: { type: 'money', required: true }, method: { type: 'select', options: ['Cash', 'Bank Transfer', 'POS', 'Cheque', 'Online'] },
      reference: { type: 'text' }, notes: { type: 'textarea' },
    },
  },
  mass_intentions: {
    group: 'Church Management', label: 'Mass Intentions', singular: 'Intention', icon: '🕯️', order: 'mass_date DESC NULLS LAST, id DESC',
    list: ['requested_by', 'intention_type', 'mass_date', 'mass_time', 'stipend', 'status'],
    search: ['requested_by', 'intention'],
    fields: {
      requested_by: { type: 'text', required: true }, phone: { type: 'text' }, email: { type: 'email' },
      intention_type: { type: 'select', options: ['Thanksgiving', 'Repose of Soul', 'Special Intention', 'Birthday', 'Anniversary', 'Healing'] },
      intention: { type: 'textarea', required: true }, mass_date: { type: 'date' }, mass_time: { type: 'text' },
      stipend: { type: 'money' }, status: { type: 'select', options: ['Pending', 'Scheduled', 'Celebrated', 'Cancelled'] },
    },
  },
  messages: {
    group: 'Church Management', label: 'Inbox & Prayer Requests', singular: 'Message', icon: '✉️', order: 'created_at DESC',
    list: ['type', 'name', 'subject', 'created_at', 'status'], noCreate: true,
    search: ['name', 'email', 'subject', 'message'],
    fields: {
      type: { type: 'select', options: ['Contact', 'Prayer Request', 'Volunteer'] }, name: { type: 'text' }, email: { type: 'email' },
      phone: { type: 'text' }, subject: { type: 'text' }, message: { type: 'textarea', rows: 8 },
      status: { type: 'select', options: ['New', 'Read', 'Replied', 'Prayed For', 'Archived'] }, created_at: { type: 'datetime', label: 'Received', readonly: true },
    },
  },
  users: {
    group: 'System', label: 'Admin Users', singular: 'User', icon: '🔐', order: 'id',
    list: ['name', 'email', 'role'],
    fields: {
      name: { type: 'text', required: true }, email: { type: 'email', required: true },
      password: { type: 'password', help: 'Leave blank to keep the current password' },
      role: { type: 'select', options: ['admin', 'editor', 'secretary'] },
    },
  },
};

export function labelFor(key, field) {
  return field?.label || key.replace(/_id$/, '').replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}
