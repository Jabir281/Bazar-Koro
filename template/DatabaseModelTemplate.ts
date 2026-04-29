import mongoose, { Schema, Document, Types } from 'mongoose';

// ============================================================================
// 1. THE TYPESCRIPT INTERFACE 
// This tells your VS Code what to expect when you type "model.something".
// ============================================================================
export interface IYourNewModel extends Document {
  // 🔴 CHANGE THESE TO MATCH THE EXAM REQUIREMENTS:
  // Examples of different types you might need:
  userId: Types.ObjectId; // Always leave this to track who owns the data!
  title: string;          // Write `string` for text.
  amount: number;         // Write `number` for prices, quantity, or counts.
  isActive: boolean;      // Write `boolean` for True/False checkboxes.
  tags: string[];         // Write `string[]` for a list of words.
  createdAt: Date;        // Automatically added by Mongoose below.
  updatedAt: Date;        // Automatically added by Mongoose below.
}

// ============================================================================
// 2. THE DATABASE SCHEMA 
// This is the strict blueprint that stops bad data from entering the database.
// ============================================================================
const YourNewModelSchema = new Schema<IYourNewModel>(
  {
    // 🔴 CHANGE THESE TO MATCH THE INTERFACE ABOVE:
    
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User', // Matches the User model exactly
      required: true,
    },
    
    // Example of a required String (Text) field:
    title: {
      type: String, // Notice it's capital 'S' string here inside the Schema!
      required: true, // "required: true" means the database will crash if they submit without it
      trim: true,     // Removes "  spaces  " at the ends
    },
    
    // Example of a Number field:
    amount: {
      type: Number, // Capital 'N' Number
      required: true,
      min: [0, 'Amount cannot be negative!'], // You can add custom math validations!
      default: 0,
    },
    
    // Example of a Boolean (True/False) field:
    isActive: {
      type: Boolean, // Capital 'B' Boolean
      default: true, // Will automatically be `true` if they don't specify
    },
    
    // Example of an Array of Strings field:
    tags: [{
      type: String,
      trim: true,
    }]
  },
  {
    // This automatically creates and manages `createdAt` and `updatedAt` for you!
    timestamps: true,
  }
);

// ============================================================================
// 3. EXPORTING THE MODEL
// ============================================================================
// 🔴 CHANGE THIS: Replace 'YourNewModel' with your actual feature name (e.g., 'Discount', 'ProductAnalytics')
// 1st argument: The name of the collection in MongoDB.
// 2nd argument: The schema blueprint we just made above.
const YourNewModel = mongoose.model<IYourNewModel>('YourNewModel', YourNewModelSchema);

export default YourNewModel;