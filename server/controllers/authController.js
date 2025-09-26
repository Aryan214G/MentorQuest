const User = require('../models/User');
const generateToken = require('../utils/generateToken');
const { OAuth2Client } = require('google-auth-library');
const { createStudentQuestionsForNewUser } = require('../utils/studentQuestionSync');
const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

exports.register = async (req, res) => {
  try {
    const { name, email, password, role = 'student' } = req.body;
    const exists = await User.findOne({ email });
    if (exists) return res.status(400).json({ message: 'User already exists' });

    const user = await User.create({ name, email, password, role });
    
    // If the user is a student, sync them with all active questions
    if (role === 'student') {
      try {
        await createStudentQuestionsForNewUser(user._id);
        console.log(`Synced new student ${user._id} with active questions`);
      } catch (syncError) {
        console.error('Error syncing student with questions:', syncError);
        // Don't fail registration if sync fails, just log it
      }
    }
    
    res.status(201).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      totalPoints: user.totalPoints || 0,
      currentStreak: user.currentStreak || 0,
      maxStreak: user.maxStreak || 0,
      badges: user.badges || [],
      token: generateToken(user._id),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate('badges.badgeId');
    if (user && (await user.matchPassword(password))) {
      res.json({
        _id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar,
        totalPoints: user.totalPoints,
        currentStreak: user.currentStreak,
        maxStreak: user.maxStreak,
        badges: user.badges,
        token: generateToken(user._id),
      });
    } else {
      res.status(401).json({ message: 'Invalid email or password' });
    }
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// Google sign-in: we receive id_token from client, verify it, then create/find user
exports.googleAuth = async (req, res) => {
  try {
    const { token } = req.body; // id_token from Google Identity Services
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });
    const payload = ticket.getPayload();
    const { sub: googleId, email, name, picture } = payload;

    let user = await User.findOne({ email });
    let isNewUser = false;
    
    if (!user) {
      user = await User.create({ name, email, googleId, avatar: picture });
      isNewUser = true;
    } else if (!user.googleId) {
      user.googleId = googleId;
      user.avatar = user.avatar || picture;
      await user.save();
    }
    
    // If this is a new student user, sync with active questions
    if (isNewUser && user.role === 'student') {
      try {
        await createStudentQuestionsForNewUser(user._id);
        console.log(`Synced new Google student ${user._id} with active questions`);
      } catch (syncError) {
        console.error('Error syncing Google student with questions:', syncError);
        // Don't fail login if sync fails, just log it
      }
    }

    res.json({
      _id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      avatar: user.avatar,
      totalPoints: user.totalPoints || 0,
      currentStreak: user.currentStreak || 0,
      maxStreak: user.maxStreak || 0,
      badges: user.badges || [],
      token: generateToken(user._id),
    });
  } catch (err) {
    console.error(err);
    res.status(401).json({ message: 'Google token verification failed' });
  }
};
