import express, { Request, Response } from 'express';
import { body, validationResult } from 'express-validator';
import { auth } from '../middleware/auth';
import ApiKey from '../models/ApiKey';

const router = express.Router();

interface AuthRequest extends Request {
  user?: {
    id: string;
  };
}

// @route   POST api/keys
// @desc    Create a new API key
router.post(
  '/',
  [
    auth,
    body('keyName').not().isEmpty().trim(),
    body('apiKey').not().isEmpty().trim(),
    body('providers').isArray({ min: 1 }),
    body('type').optional().isIn(['paid', 'free'])
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { keyName, apiKey, providers, type } = req.body;

      // Check if key name already exists
      const existingKey = await ApiKey.findOne({ keyName });
      if (existingKey) {
        return res.status(400).json({ message: 'Key name already exists' });
      }

      const newApiKey = new ApiKey({
        keyName,
        apiKey,
        providers,
        type: type || 'free',
        userId: req.user?.id
      });

      const savedApiKey = await newApiKey.save();
      res.json(savedApiKey);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// @route   GET api/keys
// @desc    Get all API keys for the authenticated user
router.get('/', auth, async (req: AuthRequest, res: Response) => {
  try {
    const apiKeys = await ApiKey.find({ userId: req.user?.id });
    res.json(apiKeys);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// @route   GET api/keys/:keyName
// @desc    Get a specific API key by name
router.get('/:keyName', auth, async (req: AuthRequest, res: Response) => {
  try {
    const apiKey = await ApiKey.findOne({
      keyName: req.params.keyName,
      userId: req.user?.id
    });

    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }

    res.json(apiKey);
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

// @route   PUT api/keys/:keyName
// @desc    Update an API key
router.put(
  '/:keyName',
  [
    auth,
    body('apiKey').optional().trim(),
    body('providers').optional().isArray(),
    body('status').optional().isIn(['active', 'inactive']),
    body('type').optional().isIn(['paid', 'free'])
  ],
  async (req: AuthRequest, res: Response) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      let apiKey = await ApiKey.findOne({
        keyName: req.params.keyName,
        userId: req.user?.id
      });

      if (!apiKey) {
        return res.status(404).json({ message: 'API key not found' });
      }

      const updateData = {
        ...(req.body.apiKey && { apiKey: req.body.apiKey }),
        ...(req.body.providers && { providers: req.body.providers }),
        ...(req.body.status && { status: req.body.status }),
        ...(req.body.type && { type: req.body.type })
      };

      apiKey = await ApiKey.findOneAndUpdate(
        { keyName: req.params.keyName, userId: req.user?.id },
        { $set: updateData },
        { new: true }
      );

      res.json(apiKey);
    } catch (err) {
      console.error(err);
      res.status(500).send('Server error');
    }
  }
);

// @route   DELETE api/keys/:keyName
// @desc    Delete an API key
router.delete('/:keyName', auth, async (req: AuthRequest, res: Response) => {
  try {
    const apiKey = await ApiKey.findOneAndDelete({
      keyName: req.params.keyName,
      userId: req.user?.id
    });

    if (!apiKey) {
      return res.status(404).json({ message: 'API key not found' });
    }

    res.json({ message: 'API key removed' });
  } catch (err) {
    console.error(err);
    res.status(500).send('Server error');
  }
});

export default router; 