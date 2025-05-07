import { db } from './db/index.js';
import { users } from './db/schema/auth.js';

async function viewUsers() {
  try {
    console.log('Fetching all users from database...\n');
    const allUsers = await db.select().from(users);
    
    if (allUsers.length === 0) {
      console.log('No users found in the database.');
    } else {
      console.log('Users in database:');
      allUsers.forEach((user, index) => {
        console.log(`\nUser ${index + 1}:`);
        console.log('ID:', user.id);
        console.log('Username:', user.username);
        console.log('Name:', user.name);
        console.log('Created at:', user.createdAt);
        console.log('Updated at:', user.updatedAt);
        console.log('----------------------------------------');
      });
    }
  } catch (error) {
    console.error('Error fetching users:', error);
  } finally {
    process.exit(0);
  }
}

viewUsers(); 