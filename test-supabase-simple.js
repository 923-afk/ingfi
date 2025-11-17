/**
 * Simple Supabase Test (no dependencies)
 * Run with: node test-supabase-simple.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Read .env.local
function loadEnv() {
  const envPath = path.join(__dirname, '.env.local');
  if (!fs.existsSync(envPath)) {
    console.error('❌ .env.local file not found');
    process.exit(1);
  }
  
  const envContent = fs.readFileSync(envPath, 'utf8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    const trimmed = line.trim();
    if (trimmed && !trimmed.startsWith('#')) {
      const [key, ...valueParts] = trimmed.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
}

const env = loadEnv();
const supabaseUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Missing Supabase credentials');
  console.error('   Found URL:', !!supabaseUrl);
  console.error('   Found Key:', !!supabaseKey);
  process.exit(1);
}

console.log('🔗 Connecting to:', supabaseUrl.replace(/\/\/.*@/, '//***@'));
console.log('');

const supabase = createClient(supabaseUrl, supabaseKey);

async function test() {
  console.log('🧪 Testing Supabase Connection...\n');
  
  // Test 1: Connection
  console.log('1️⃣ Testing connection...');
  try {
    const { error } = await supabase.from('jobs').select('count').limit(1);
    
    if (error) {
      if (error.code === '42P01') {
        console.log('   ⚠️  Tables not created yet');
        console.log('   ✅ Connection works!');
        console.log('\n💡 Next step: Run supabase-schema.sql in Supabase Dashboard');
        return;
      }
      throw error;
    }
    
    console.log('   ✅ Connection successful!');
    console.log('   ✅ Tables exist!');
  } catch (err) {
    console.error('   ❌ Connection failed:', err.message);
    return;
  }
  
  // Test 2: Check tables
  console.log('\n2️⃣ Checking tables...');
  const tables = ['user_profiles', 'jobs', 'timeline_entries', 'professionals'];
  let allExist = true;
  
  for (const table of tables) {
    try {
      const { error } = await supabase.from(table).select('count').limit(1);
      if (error) {
        console.log(`   ❌ ${table}: ${error.message}`);
        allExist = false;
      } else {
        console.log(`   ✅ ${table}: OK`);
      }
    } catch (err) {
      console.log(`   ❌ ${table}: ${err.message}`);
      allExist = false;
    }
  }
  
  // Test 3: Check professionals
  if (allExist) {
    console.log('\n3️⃣ Checking professionals...');
    try {
      const { data, count, error } = await supabase
        .from('professionals')
        .select('*', { count: 'exact' })
        .limit(1);
      
      if (error) {
        console.log('   ⚠️  Error:', error.message);
      } else {
        console.log(`   ✅ Found ${count || 0} professionals`);
        if (count === 0) {
          console.log('   💡 Tip: Run the professionals seed SQL');
        }
      }
    } catch (err) {
      console.log('   ⚠️  Error:', err.message);
    }
  }
  
  console.log('\n✅ Test complete!');
}

test().catch(err => {
  console.error('\n❌ Test failed:', err.message);
  process.exit(1);
});

