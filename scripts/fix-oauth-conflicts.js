const { MongoClient, ObjectId } = require('mongodb');

async function fixOAuthConflicts() {
  const uri = process.env.MONGODB_URI || "mongodb://admin:Dhiraj%40123@localhost:27017/cyperboard?authSource=admin";
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const accountsCollection = db.collection('accounts');
    const usersCollection = db.collection('users');
    
    // Find duplicate providerAccountIds
    const duplicates = await accountsCollection.aggregate([
      {
        $group: {
          _id: { 
            provider: '$provider', 
            providerAccountId: '$providerAccountId' 
          },
          count: { $sum: 1 },
          accounts: { $push: '$$ROOT' }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]).toArray();
    
    console.log(`Found ${duplicates.length} duplicate provider account IDs`);
    
    for (const duplicate of duplicates) {
      console.log(`\nProcessing duplicate for ${duplicate._id.provider}:${duplicate._id.providerAccountId}`);
      console.log(`Found ${duplicate.count} accounts`);
      
      // Sort by creation time (keep the oldest one)
      const sortedAccounts = duplicate.accounts.sort((a, b) => {
        return new Date(a.createdAt || 0) - new Date(b.createdAt || 0);
      });
      
      const keepAccount = sortedAccounts[0];
      const removeAccounts = sortedAccounts.slice(1);
      
      console.log(`Keeping account with userId: ${keepAccount.userId}`);
      console.log(`Removing ${removeAccounts.length} duplicate accounts`);
      
      // Remove duplicate accounts
      for (const removeAccount of removeAccounts) {
        console.log(`Removing account with userId: ${removeAccount.userId}`);
        
        // Check if the user exists and has other accounts
        const user = await usersCollection.findOne({ _id: removeAccount.userId });
        const userAccounts = await accountsCollection.find({ userId: removeAccount.userId }).toArray();
        
        if (userAccounts.length === 1) {
          // This is the only account for this user, remove the user too
          console.log(`Removing user ${user?.email} (no other accounts)`);
          await usersCollection.deleteOne({ _id: removeAccount.userId });
        }
        
        await accountsCollection.deleteOne({ _id: removeAccount._id });
      }
    }
    
    // Verify the fix
    const remainingDuplicates = await accountsCollection.aggregate([
      {
        $group: {
          _id: { 
            provider: '$provider', 
            providerAccountId: '$providerAccountId' 
          },
          count: { $sum: 1 }
        }
      },
      {
        $match: { count: { $gt: 1 } }
      }
    ]).toArray();
    
    console.log(`\n✅ Fix completed. Remaining duplicates: ${remainingDuplicates.length}`);
    
    // Show final state
    const finalAccounts = await accountsCollection.find({}).toArray();
    console.log(`\nFinal accounts count: ${finalAccounts.length}`);
    
    const finalUsers = await usersCollection.find({}).toArray();
    console.log(`Final users count: ${finalUsers.length}`);
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
    console.log('Disconnected from MongoDB');
  }
}

fixOAuthConflicts();
