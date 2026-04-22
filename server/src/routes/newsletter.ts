import { Router } from 'express';
import { sendWeeklyNewsletter, sendTestNewsletter } from '../services/newsletter.js';
import { requireAuth, AuthedRequest } from '../middleware/auth.js';

const router = Router();

// POST /api/newsletter/send - Send weekly newsletter (admin only)
router.post('/send', requireAuth, async (req: AuthedRequest, res) => {
  try {
    // Check if user is admin
    if (!req.user!.roles.includes('admin')) {
      return res.status(403).json({ error: 'Admin access required' });
    }

    await sendWeeklyNewsletter();
    res.json({ message: 'Newsletter sent successfully' });
  } catch (error) {
    console.error('Error sending newsletter:', error);
    res.status(500).json({ error: 'Failed to send newsletter' });
  }
});

// POST /api/newsletter/test - Send test newsletter to specific emails (admin or marketer)
router.post('/test', requireAuth, async (req: AuthedRequest, res) => {
  try {
    // Check if user is admin or marketer
    if (!['admin', 'marketer'].includes(req.user!.activeRole)) {
      return res.status(403).json({ error: 'Admin or marketer access required' });
    }

    const { emails, neighborhood } = req.body;
    if (!emails || !Array.isArray(emails) || emails.length === 0) {
      return res.status(400).json({ error: 'emails array is required' });
    }

    await sendTestNewsletter(emails, neighborhood || 'Test Neighborhood');
    res.json({ message: `Test newsletter sent to ${emails.length} email(s)` });
  } catch (error) {
    console.error('Error sending test newsletter:', error);
    res.status(500).json({ error: 'Failed to send test newsletter' });
  }
});

export default router;