import { Router } from 'express';
import { requireAuth, requireRole } from '../middleware/auth.js';

// ============================================================================
// 1. 🔴 THE MODEL IMPORT
// ============================================================================
// CHANGE THIS: Replace `YourNewModel` with the EXACT name of the file you made in `server/src/models/`
// EXAMPLE: If your model is `Campaign.ts`, change this to:
// import Campaign from '../models/Campaign.js';
import YourNewModel from '../models/YourNewModel.js';

const router = Router();

// ============================================================================
// 2. 🔴 REGISTERING THIS FILE (Instructions)
// ============================================================================
// Before these routes work, you MUST connect this whole file to `server/src/app.ts`.
// Step 1: Open `app.ts`
// Step 2: Add to the top: import myNewRoute from './routes/TheNameOfThisFile.js';
// Step 3: Add to the bottom inside createApp(): app.use('/api/my-new-feature', myNewRoute);


// ----------------------------------------------------------------------------
// ROUTE 1: CREATE DATA (POST)
// What it does: Takes data typed into the frontend form and saves it to the Database.
// Frontend code that triggers this: fetch('/api/my-new-feature', { method: 'POST', body: JSON.stringify(...) })
// ----------------------------------------------------------------------------

// 🔴 CHANGE THE ROLE: Inside `requireRole(...)`, change 'buyer' to who is allowed to do this.
// Options: 'buyer', 'seller', 'marketer', 'driver', or 'admin'. (Delete requireRole entirely if anyone can do it).
router.post('/', requireAuth, requireRole('buyer'), async (req: any, res: any) => {
  try {
    // 🔴 CHANGE THE VARIABLES: Look at your Frontend `fetch` body. What are you sending?
    // EXAMPLE: If frontend sends JSON.stringify({ price: 50, color: "red" }), then write:
    // const { price, color } = req.body;
    const { title, description } = req.body;

    // Optional: Check if they left the form blank!
    if (!title) {
      return res.status(400).json({ error: 'Title is required!' });
    }

    // 🔴 CHANGE THE MODEL SAVING: 
    // 1. Replace `YourNewModel` with your actual Model name (e.g. Campaign.create)
    // 2. Add the variables you extracted above.
    const newItem = await YourNewModel.create({
      userId: req.user.id, // We usually want to remember who clicked the button!
      title: title, 
      description: description,
    });

    // Send the successfully saved item back to the frontend
    res.status(201).json(newItem); 

  } catch (error: any) {
    console.error('Crash in POST route:', error);
    res.status(500).json({ error: 'Failed to save to database.' });
  }
});


// ----------------------------------------------------------------------------
// ROUTE 2: READ ALL DATA FOR A LIST (GET)
// What it does: Grabs a list of items from MongoDB to show on the Dashboard.
// Frontend code that triggers this: fetch('/api/my-new-feature', { method: 'GET' })
// ----------------------------------------------------------------------------

// 🔴 CHANGE THE ROLE (Just like above)
router.get('/', requireAuth, requireRole('buyer'), async (req: any, res: any) => {
  try {
    // 🔴 CHANGE THE QUERY: 
    // Replace `YourNewModel` with your actual Model name.
    // Look at `.find()`. If you want to show ALL items to everyone, leave it empty: `.find()`
    // If you only want to show items made by this specific user, use `.find({ userId: req.user.id })`
    const items = await YourNewModel.find({ userId: req.user.id }).sort({ createdAt: -1 });

    res.json(items);
  } catch (error: any) {
    console.error('Crash in GET route:', error);
    res.status(500).json({ error: 'Failed to fetch items from database.' });
  }
});


// ----------------------------------------------------------------------------
// ROUTE 3: UPDATE EXISTING DATA (PATCH)
// What it does: Edits a specific item (like changing its status or price).
// Frontend code that triggers this: fetch('/api/my-new-feature/THE_ITEM_ID', { method: 'PATCH', body: JSON.stringify({ status: "active" }) })
// ----------------------------------------------------------------------------

// 🔴 CHANGE THE ROLE (Just like above)
// Notice the `/:id`. This means the URL must have the item's ID at the end!
router.patch('/:id', requireAuth, requireRole('buyer'), async (req: any, res: any) => {
  try {
    const { id } = req.params; // This grabs the ID from the URL link
    const updateData = req.body; // This grabs the new data sent from frontend

    // 🔴 CHANGE THE MODEL UPDATE:
    // Replace `YourNewModel`.
    const updatedItem = await YourNewModel.findByIdAndUpdate(
      id,                   // 1. Find the item with this ID
      { $set: updateData }, // 2. Replace its old data with this new data
      { new: true }         // 3. (Important!) Forces Mongoose to return the *newly* updated item
    );

    if (!updatedItem) return res.status(404).json({ error: 'Item not found in database!' });

    res.json(updatedItem);
  } catch (error: any) {
    console.error('Crash in PATCH route:', error);
    res.status(500).json({ error: 'Failed to update item.' });
  }
});


// ----------------------------------------------------------------------------
// ROUTE 4: DELETE DATA (DELETE)
// What it does: Permanently removes a record from MongoDB.
// Frontend code that triggers this: fetch('/api/my-new-feature/THE_ITEM_ID', { method: 'DELETE' })
// ----------------------------------------------------------------------------

// 🔴 CHANGE THE ROLE (Just like above)
router.delete('/:id', requireAuth, requireRole('buyer'), async (req: any, res: any) => {
  try {
    const { id } = req.params;

    // 🔴 CHANGE THE MODEL DELETE: 
    // Replace `YourNewModel`.
    const deletedItem = await YourNewModel.findByIdAndDelete(id);

    if (!deletedItem) {
      return res.status(404).json({ error: 'Item not found or already deleted!' });
    }

    res.json({ message: 'Item successfully deleted forever.' });
  } catch (error: any) {
    console.error('Crash in DELETE route:', error);
    res.status(500).json({ error: 'Failed to delete item.' });
  }
});

// Finally, we export this whole file so Node.js can use it globally.
export default router;