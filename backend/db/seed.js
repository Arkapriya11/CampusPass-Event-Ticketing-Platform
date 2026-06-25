/**
 * Seed script — creates an admin user and sample event for testing.
 * Run with: node db/seed.js
 */
const bcrypt = require('bcryptjs');
const { supabase } = require('../lib/supabase');

async function seed() {
  console.log('🌱 Seeding database...\n');

  // 1. Create Admin user
  const adminPassword = 'admin123';
  const salt = await bcrypt.genSalt(10);
  const password_hash = await bcrypt.hash(adminPassword, salt);

  const { data: admin, error: adminError } = await supabase
    .from('users')
    .upsert(
      {
        name: 'Admin User',
        email: 'admin@campuspass.com',
        password_hash,
        role: 'ADMIN',
      },
      { onConflict: 'email' }
    )
    .select()
    .single();

  if (adminError) {
    console.error('Failed to create admin:', adminError.message);
  } else {
    console.log('✅ Admin user created:', admin.email);
  }

  // 2. Create a sample Seller
  const sellerHash = await bcrypt.hash('seller123', salt);
  const { data: seller, error: sellerError } = await supabase
    .from('users')
    .upsert(
      {
        name: 'Seller User',
        email: 'seller@campuspass.com',
        password_hash: sellerHash,
        role: 'SELLER',
      },
      { onConflict: 'email' }
    )
    .select()
    .single();

  if (sellerError) {
    console.error('Failed to create seller:', sellerError.message);
  } else {
    console.log('✅ Seller user created:', seller.email);
  }

  // 3. Create a sample Checker
  const checkerHash = await bcrypt.hash('checker123', salt);
  const { data: checker, error: checkerError } = await supabase
    .from('users')
    .upsert(
      {
        name: 'Checker User',
        email: 'checker@campuspass.com',
        password_hash: checkerHash,
        role: 'CHECKER',
      },
      { onConflict: 'email' }
    )
    .select()
    .single();

  if (checkerError) {
    console.error('Failed to create checker:', checkerError.message);
  } else {
    console.log('✅ Checker user created:', checker.email);
  }

  // 4. Create sample event
  const { data: event, error: eventError } = await supabase
    .from('events')
    .insert({
      name: 'Tech Fest 2026',
      venue: 'Main Auditorium',
      start_time: '2026-05-01T18:00:00Z',
      end_time: '2026-05-01T22:00:00Z',
    })
    .select()
    .single();

  if (eventError) {
    console.error('Failed to create event:', eventError.message);
  } else {
    console.log('✅ Event created:', event.name);

    // 5. Create ticket types for the event
    const { error: ttError } = await supabase.from('ticket_types').insert([
      { event_id: event.id, name: 'Delegate', price: 100 },
      { event_id: event.id, name: 'Executive', price: 200 },
    ]);

    if (ttError) {
      console.error('Failed to create ticket types:', ttError.message);
    } else {
      console.log('✅ Ticket types created: Delegate (₹100), Executive (₹200)');
    }
  }

  console.log('\n🎉 Seeding complete!');
  console.log('\nTest Credentials:');
  console.log('  Admin:   admin@campuspass.com / admin123');
  console.log('  Seller:  seller@campuspass.com / seller123');
  console.log('  Checker: checker@campuspass.com / checker123');
}

seed().catch(console.error);
