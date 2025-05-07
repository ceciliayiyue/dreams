import { db } from './db/index.js';
import { users, sessions } from './db/schema/auth.js';
import { eq } from 'drizzle-orm';

async function testDatabase() {
  try {
    // Test 1: List all users
    console.log('Fetching all users...');
    const allUsers = await db.select().from(users);
    console.log('Users in database:', allUsers);

    // Test 2: Create a test user
    console.log('\nCreating a test user...');
    const [newUser] = await db.insert(users).values({
      id: 'test-user-1',
      username: 'testuser',
      password: 'hashed_password_here',
      name: 'Test User',
    }).returning();
    console.log('Created user:', newUser);

    // Test 3: Query specific user
    console.log('\nQuerying specific user...');
    const foundUser = await db
      .select()
      .from(users)
      .where(eq(users.username, 'testuser'));
    console.log('Found user:', foundUser);

    // Test 4: List all sessions
    console.log('\nFetching all sessions...');
    const allSessions = await db.select().from(sessions);
    console.log('Sessions in database:', allSessions);

  } catch (error) {
    console.error('Error testing database:', error);
  } finally {
    // Close the connection pool
    await db.$pool.end();
  }
}

// Run the tests
console.log('Starting database tests...');
testDatabase(); 