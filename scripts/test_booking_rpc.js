import { createClient } from '@supabase/supabase-js';

// Usage: SUPABASE_URL=... SUPABASE_ANON_KEY=... node scripts/test_booking_rpc.js
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
    console.error('Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const BARBER_ID = 'ecff02ff-5b65-4bf5-a291-4f15503b5555';
const SERVICE_ID = '8fea3a44-7e64-4962-b6b7-291db06e5ff3';
const CLIENT_ID = '2dde0ccb-097c-4dc5-b3f2-78de4a0d7ae2';

async function createBooking(startTime, endTime, status, title) {
    console.log(`Creating booking: ${title} at ${startTime}`);
    const { data, error } = await supabase.from('bookings').insert({
        barber_id: BARBER_ID,
        service_id: SERVICE_ID,
        client_id: CLIENT_ID,
        start_time: startTime,
        end_time: endTime,
        status: status,
        client_name: 'Test Client',
        price_at_booking: 100,
        duration_minutes: 60,
        notes: title
    }).select().single();
    if (error) {
        console.error(`Error creating ${title}:`, JSON.stringify(error, null, 2));
        throw new Error(`Create ${title} failed: ${error.message}`);
    }
    console.log(`Created booking ${title} with ID: ${data.id}`);
    return data;
}

async function runTests() {
    console.log('Starting RPC verification...');

    // Clean up previous test data
    console.log('Cleaning up previous test data...');
    const { error: cleanError } = await supabase.from('bookings').delete().eq('client_name', 'Test Client');
    if (cleanError) console.error('Cleanup warning:', cleanError);

    // Setup Dates
    const baseDate = new Date();
    baseDate.setDate(baseDate.getDate() + 1);
    const dateStr = baseDate.toISOString().split('T')[0];

    // Ensure UTC format 'YYYY-MM-DDTHH:mm:ssZ'
    const time10 = `${dateStr}T10:00:00+00:00`;
    const time11 = `${dateStr}T11:00:00+00:00`;
    const time12 = `${dateStr}T12:00:00+00:00`;
    const time13 = `${dateStr}T13:00:00+00:00`;
    const time14 = `${dateStr}T14:00:00+00:00`;
    const time15 = `${dateStr}T15:00:00+00:00`;
    const time16 = `${dateStr}T16:00:00+00:00`;
    const time17 = `${dateStr}T17:00:00+00:00`;
    const time18 = `${dateStr}T18:00:00+00:00`;
    const time19 = `${dateStr}T19:00:00+00:00`;

    try {
        // 1. Setup Data
        console.log('Setting up data...');
        const bookingA = await createBooking(time10, time11, 'scheduled', 'Booking A');
        const bookingB = await createBooking(time14, time15, 'scheduled', 'Booking B (Scheduled Block)');
        const bookingC = await createBooking(time16, time17, 'completed', 'Booking C (Completed)');
        const bookingD = await createBooking(time18, time19, 'cancelled', 'Booking D (Cancelled)');
        const bookingE = await createBooking(time12, time13, 'in_progress', 'Booking E (In Progress)');

        console.log('Data setup complete.');

        // Test 1
        console.log('Test 1: Valid Update (Move to free slot)...');
        const { error: err1 } = await supabase.rpc('update_booking_safe', {
            p_booking_id: bookingA.id,
            p_barber_id: BARBER_ID,
            p_start_time: time11,
            p_end_time: time12
        });
        if (err1) console.error('FAILED Test 1:', err1);
        else console.log('PASSED Test 1');

        // Test 2
        console.log('Test 2: Conflict with Scheduled...');
        const { error: err2 } = await supabase.rpc('update_booking_safe', {
            p_booking_id: bookingA.id,
            p_barber_id: BARBER_ID,
            p_start_time: time14,
            p_end_time: time15
        });
        if (err2 && (err2.code === '23P01' || err2.message.includes('Conflict'))) console.log('PASSED Test 2 (Conflict detected)');
        else console.error('FAILED Test 2:', err2);

        // Test 3
        console.log('Test 3: Conflict with In Progress...');
        const { error: err3 } = await supabase.rpc('update_booking_safe', {
            p_booking_id: bookingA.id,
            p_barber_id: BARBER_ID,
            p_start_time: time12,
            p_end_time: time13
        });
        if (err3 && (err3.code === '23P01' || err3.message.includes('Conflict'))) console.log('PASSED Test 3 (Conflict detected)');
        else console.error('FAILED Test 3:', err3);

        // Test 4
        console.log('Test 4: Completed doesn\'t block...');
        const { error: err4 } = await supabase.rpc('update_booking_safe', {
            p_booking_id: bookingA.id,
            p_barber_id: BARBER_ID,
            p_start_time: time16,
            p_end_time: time17
        });
        if (err4) console.error('FAILED Test 4:', err4);
        else console.log('PASSED Test 4');

        // Test 5
        console.log('Test 5: Cancelled doesn\'t block...');
        const { error: err5 } = await supabase.rpc('update_booking_safe', {
            p_booking_id: bookingA.id,
            p_barber_id: BARBER_ID,
            p_start_time: time18,
            p_end_time: time19
        });
        if (err5) console.error('FAILED Test 5:', err5);
        else console.log('PASSED Test 5');

    } catch (e) {
        console.error('Test Execution Error:', e);
    } finally {
        console.log('Cleaning up...');
        await supabase.from('bookings').delete().eq('client_name', 'Test Client');
    }
}

runTests().catch(err => {
    console.error('Top-level error:', err);
    process.exit(1);
});
