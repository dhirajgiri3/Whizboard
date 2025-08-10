const { MongoClient } = require('mongodb');

async function cleanupAuth() {
  const uri = process.env.MONGODB_URI;
  if (!uri) {
    console.error('MONGODB_URI environment variable is required');
    process.exit(1);
  }

  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    
    // List all collections
    const collections = await db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Check for users collection
    const usersCollection = db.collection('users');
    const usersCount = await usersCollection.countDocuments();
    console.log(`Users collection has ${usersCount} documents`);
    
    // Check for accounts collection
    const accountsCollection = db.collection('accounts');
    const accountsCount = await accountsCollection.countDocuments();
    console.log(`Accounts collection has ${accountsCount} documents`);
    
    // Check for sessions collection
    const sessionsCollection = db.collection('sessions');
    const sessionsCount = await sessionsCollection.countDocuments();
    console.log(`Sessions collection has ${sessionsCount} documents`);
    
    // Check for verificationTokens collection
    const verificationTokensCollection = db.collection('verificationTokens');
    const verificationTokensCount = await verificationTokensCollection.countDocuments();
    console.log(`VerificationTokens collection has ${verificationTokensCount} documents`);
    
    // Show sample users
    const sampleUsers = await usersCollection.find({}).limit(5).toArray();
    console.log('Sample users:', sampleUsers.map(u => ({ 
      id: u._id, 
      email: u.email, 
      name: u.name,
      createdAt: u.createdAt 
    })));
    
    // Show sample accounts
    const sampleAccounts = await accountsCollection.find({}).limit(5).toArray();
    console.log('Sample accounts:', sampleAccounts.map(a => ({ 
      userId: a.userId, 
      provider: a.provider,
      providerAccountId: a.providerAccountId 
    })));
    
    // Check for potential conflicts
    const email = 'devdhiraj33@gmail.com'; // Replace with the email causing issues
    const usersWithEmail = await usersCollection.find({ email }).toArray();
    const accountsWithEmail = await accountsCollection.find({}).toArray();
    
    console.log(`\nUsers with email ${email}:`, usersWithEmail.length);
    console.log(`Total accounts:`, accountsWithEmail.length);
    
    if (usersWithEmail.length > 1) {
      console.log('⚠️  Multiple users found with same email - this could cause OAuthAccountNotLinked error');
      console.log('Consider removing duplicate users or linking accounts');
    }
    
    // Option to clean up (uncomment to use)
    /*
    if (process.argv.includes('--cleanup')) {
      console.log('\n🧹 Cleaning up authentication data...');
      
      // Remove all authentication-related collections
      await db.collection('users').drop();
      await db.collection('accounts').drop();
      await db.collection('sessions').drop();
      await db.collection('verificationTokens').drop();
      
      console.log('✅ Cleanup completed');
    }
    */
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

cleanupAuth();
