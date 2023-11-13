require('dotenv').config();
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const connectionOptions = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

mongoose.connect(process.env.MONGODB_URI, connectionOptions)
  .then(() => console.log('MongoDB connected'))
  .catch(err => console.error('MongoDB connection error:', err));

// Old userProfile schema
const OldUserProfileSchema = new mongoose.Schema({
  userId: { type: Number, required: true, unique: true },
  petId: { type: String, default: () => uuidv4(), unique: true },
  petName: { type: String, default: "", maxlength: [25, "Pet name cannot be more than 25 characters"] },
  petType: { type: Number, default: 0 },
  hasPet: { type: Boolean, default: false },
  lifeStage: { type: Number, default: 0 },
  age: { type: Number, default: 0 },
  health: { type: Number, default: 100 },
  isSick: { type: Boolean, default: false },
  medicineCount: { type: Number, default: 0 },
  discipline: { type: Number, default: 0 },
  trainingLevel: { type: Number, default: 0 },
  happiness: { type: Number, default: 50 },
  energy: { type: Number, default: 100 },
  hunger: { type: Number, default: 50 },
  thirst: { type: Number, default: 50 },
  cleanliness: { type: Number, default: 50 },
  exerciseLevel: { type: Number, default: 0 },
  huntCount: { type: Number, default: 0 },
  sleepLevel: { type: Number, default: 100 },
  isAsleep: { type: Boolean, default: false },
  sleepUntil: { type: Date, default: null },
  educationLevel: { type: Number, default: 0 },
  affection: { type: Number, default: 50 },
  miniGameScores: { type: Object, default: {} },
  patCount: { type: Number, default: 0 },
  cuddleCount: { type: Number, default: 0 },
  feedCount: { type: Number, default: 0 },
  drinkCount: { type: Number, default: 0 },
  cleanedCount: { type: Number, default: 0 },
  vetCount: { type: Number, default: 0 },
  socialisation: {
    friends: { type: Array, default: [] },
    competitionsEntered: { type: Number, default: 0 },
  },
  accessories: { type: Array, default: [] },
  housingCustomisations: { type: Array, default: [] },
  actionTimeStamp: {
    lastFed: { type: [Date], default: [] },
    lastDrank: { type: [Date], default: [] },
    lastCleaned: { type: [Date], default: [] },
    lastGroomed: { type: [Date], default: [] },
    lastMedicine: { type: [Date], default: [] },
    lastPlayed: { type: [Date], default: [] },
    lastEducated: { type: [Date], default: [] },
    lastRan: { type: [Date], default: [] },
    lastWalked: { type: [Date], default: [] },
    lastPat: { type: [Date], default: [] },
    lastCuddled: { type: [Date], default: [] },
    lastVetVisit: { type: [Date], default: [] },
    lastSlept: { type: [Date], default: [] },
    lastHunted: { type: [Date], default: [] },
  },
}, { collection: 'userprofiles' });

const OldUserProfile = mongoose.model('userprofiles', OldUserProfileSchema);

const PetProfileSchema = new mongoose.Schema({
    userId: { type: Number, required: true, unique: true },
    petId: { type: String, default: () => uuidv4(), unique: true },
    petName: { type: String, default: "", maxlength: [25, "Pet name cannot be more than 25 characters"] },
    petType: { type: Number, default: 0 },
    petVariant: { type: Number, default: 0 },
    hasPet: { type: Boolean, default: false },
    lifeStage: { type: Number, default: 0 },
    age: { type: Number, default: 0 },
    health: { type: Number, default: 100 },
    isSick: { type: Boolean, default: false },
    medicineCount: { type: Number, default: 0 },
    discipline: { type: Number, default: 0 },
    trainingLevel: { type: Number, default: 0 },
    happiness: { type: Number, default: 50 },
    energy: { type: Number, default: 100 },
    hunger: { type: Number, default: 50 },
    thirst: { type: Number, default: 50 },
    cleanliness: { type: Number, default: 50 },
    exerciseLevel: { type: Number, default: 0 },
    huntCount: { type: Number, default: 0 },
    sleepLevel: { type: Number, default: 100 },
    isAsleep: { type: Boolean, default: false },
    sleepUntil: { type: Date, default: null },
    educationLevel: { type: Number, default: 0 },
    affection: { type: Number, default: 50 },
    miniGameScores: { type: Object, default: {} },
    patCount: { type: Number, default: 0 },
    cuddleCount: { type: Number, default: 0 },
    feedCount: { type: Number, default: 0 },
    drinkCount: { type: Number, default: 0 },
    cleanedCount: { type: Number, default: 0 },
    vetCount: { type: Number, default: 0 },
    socialisation: {
      friends: { type: Array, default: [] },
      competitionsEntered: { type: Number, default: 0 },
    },
    accessories: { type: Array, default: [] },
    housingCustomisations: { type: Array, default: [] },
    actionTimeStamp: {
      lastFed: { type: [Date], default: [] },
      lastDrank: { type: [Date], default: [] },
      lastCleaned: { type: [Date], default: [] },
      lastGroomed: { type: [Date], default: [] },
      lastMedicine: { type: [Date], default: [] },
      lastPlayed: { type: [Date], default: [] },
      lastEducated: { type: [Date], default: [] },
      lastRan: { type: [Date], default: [] },
      lastWalked: { type: [Date], default: [] },
      lastPat: { type: [Date], default: [] },
      lastCuddled: { type: [Date], default: [] },
      lastVetVisit: { type: [Date], default: [] },
      lastSlept: { type: [Date], default: [] },
      lastHunted: { type: [Date], default: [] },
    },
}, { timestamps: true });

const PetProfile = mongoose.model('petprofiles', PetProfileSchema); // Use 'petprofiles' as the model name

async function migrateUserData() {
    try {
      const users = await OldUserProfile.find({});
  
      if (users.length === 0) {
        console.log('No documents found in userprofiles collection to migrate.');
        return;
      }
  
      console.log(`Found ${users.length} documents to migrate.`);
  
      for (const user of users) {
        const userData = user.toObject();
        const userId = userData.userId;
  
        // Update or insert a document by userId in the petprofiles collection
        await PetProfile.updateOne({ userId }, userData, { upsert: true });
      }
  
      console.log('Data migration completed.');
    } catch (error) {
      console.error('Migration error:', error);
    } finally {
      mongoose.disconnect();
      console.log('MongoDB Disconnected.');
    }
  }
  
  migrateUserData();