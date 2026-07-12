require('dotenv').config();
const { Client } = require('pg');
const bcrypt = require('bcryptjs');
const { v4: uuidv4 } = require('uuid');

async function createTestUser() {
  const client = new Client({
    connectionString: process.env.DATABASE_URL
  });

  try {
    await client.connect();
    console.log('🔄 Creating test user...\n');

    // Hash password
    const password = 'password123';
    const hashedPassword = await bcrypt.hash(password, 10);

    // Get ADMIN role ID
    const roleResult = await client.query(
      `SELECT id FROM roles WHERE name = 'ADMIN' LIMIT 1`
    );

    if (roleResult.rows.length === 0) {
      console.error('❌ ERROR: ADMIN role not found in database');
      process.exit(1);
    }

    const adminRoleId = roleResult.rows[0].id;
    const userId = uuidv4();
    
    // Create test user
    const insertResult = await client.query(
      `INSERT INTO users (id, email, password_hash, full_name, employee_code, status, role_id)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       ON CONFLICT (email) DO NOTHING
       RETURNING id, email, full_name`,
      [
        userId,
        'admin@assetflow.com',
        hashedPassword,
        'Admin User',
        'EMP001',
        'ACTIVE',
        adminRoleId
      ]
    );

    if (insertResult.rows.length === 0) {
      console.log('⚠️  User already exists (admin@assetflow.com)');
    } else {
      const user = insertResult.rows[0];
      console.log('✅ TEST USER CREATED!\n');
      console.log('📧 Email: admin@assetflow.com');
      console.log('🔑 Password: password123');
      console.log(`👤 Name: ${user.full_name}`);
      console.log(`🆔 User ID: ${user.id}\n`);
    }

    console.log('📝 NEXT STEPS:');
    console.log('   1. Go to http://localhost:3000');
    console.log('   2. Login with: admin@assetflow.com / password123');
    console.log('   3. You will get a JWT token');
    console.log('   4. Backend will work properly!\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ ERROR:', error.message);
    process.exit(1);
  } finally {
    await client.end();
  }
}

createTestUser();
