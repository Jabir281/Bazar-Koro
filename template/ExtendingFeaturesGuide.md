# Guide to Modifying and Extending Features

**Yes, 100%. In fact, extending or modifying an existing feature is much easier than building one from scratch, and your current toolkit is built perfectly for exactly that.** 

Because of the way we set up the cheat sheet and templates, you have a massive advantage. If your team lead asks you to extend a feature, you already have the 3-step pipeline mapped out perfectly.

Here is exactly how you will use what I provided to handle tasks:

### Scenario 1: The Team Lead asks you to "Extend" a feature 
*(Example: "Add a 'Discount Percentage' to the Product creation")*
1. **The Database:** You open the corresponding Model file (found via your Cheat Sheet), copy the "`Number`" example from `template/DatabaseModelTemplate.ts`, and paste it in to add `discount: { type: Number, default: 0 }`.
2. **The Frontend Form:** You go to the React page (found via your Cheat Sheet), copy the Number `<input>` block from `template/FrontendPageTemplate.tsx`, and change `amount` to `discount`.
3. **The Backend:** You don't even need to touch the backend if it's already saving the form data! But if you do, your `BackendRouteTemplate.ts` shows exactly where `req.body.discount` comes from.

### Scenario 2: The Team Lead asks you to "Modify" a feature's rule
*(Example: "Only allow Sellers to create Ads, not Marketers")*
1. You look at your Cheat Sheet under **RBAC / User Roles**.
2. You find the exact backend route file for Ads.
3. You look at the `req.user.role` or `x-active-role` check (which is heavily explained in `template/BackendRouteTemplate.ts`) and simply delete or change the word `"marketer"` to `"seller"`.

### Scenario 3: The Team Lead asks for a "Brand New Basic Feature"
*(Example: "Create a 'Support Tickets' page where users can submit complaints")*
1. You simply copy-paste the three template files.
2. CTRL+F to find `🔴 CHANGE THIS`.
3. Change the word "MyNewFeature" to "SupportTicket" and you instantly have a working, full-stack database-connected page.

You are completely covered. The **Cheat Sheet** tells you exactly *where* to go for your 6 core features. The **Templates** tell you exactly *how* to copy-paste the correct code (React inputs, MongoDB models, Express routes) to make any changes requested. 

As long as you practice `npm run dev:local` once or twice so you are comfortable booting it up, you can handle any modifications easily!