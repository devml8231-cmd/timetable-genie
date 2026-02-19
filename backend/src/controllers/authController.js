const { supabase, supabaseAdmin } = require('../config/supabase');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/AppError');
const logger = require('../config/logger');

/**
 * @route   POST /api/auth/register
 * @desc    Register a new user
 * @access  Public
 */
const register = asyncHandler(async (req, res, next) => {
  const { email, password, name, role, department } = req.body;

  // Validate role
  const validRoles = ['admin', 'faculty', 'student'];
  if (!validRoles.includes(role)) {
    return next(new AppError('Invalid role specified', 400));
  }

  // Create user with Supabase Auth
  const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
    email,
    password,
    email_confirm: true
  });

  if (authError) {
    logger.error('Auth registration error:', authError);
    return next(new AppError(authError.message, 400));
  }

  // Create user record in users table
  const { data: userData, error: userError } = await supabase
    .from('users')
    .insert([
      {
        id: authData.user.id,
        email,
        name,
        role,
        department
      }
    ])
    .select()
    .single();

  if (userError) {
    logger.error('User creation error:', userError);
    // Rollback - delete auth user
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id);
    return next(new AppError('Failed to create user profile', 500));
  }

  logger.info(`New user registered: ${email}`);

  res.status(201).json({
    success: true,
    message: 'User registered successfully',
    data: {
      user: userData
    }
  });
});

/**
 * @route   POST /api/auth/login
 * @desc    Login user
 * @access  Public
 */
const login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // Sign in with Supabase Auth
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password
  });

  if (error) {
    logger.warn(`Failed login attempt for ${email}`);
    return next(new AppError('Invalid credentials', 401));
  }

  // Fetch user details
  const { data: userData, error: userError } = await supabase
    .from('users')
    .select('*')
    .eq('id', data.user.id)
    .single();

  if (userError) {
    logger.error('Error fetching user data:', userError);
    return next(new AppError('Failed to fetch user details', 500));
  }

  logger.info(`User logged in: ${email}`);

  res.status(200).json({
    success: true,
    message: 'Login successful',
    data: {
      user: userData,
      session: {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      }
    }
  });
});

/**
 * @route   POST /api/auth/logout
 * @desc    Logout user
 * @access  Private
 */
const logout = asyncHandler(async (req, res, next) => {
  const { error } = await supabase.auth.signOut();

  if (error) {
    return next(new AppError('Logout failed', 500));
  }

  res.status(200).json({
    success: true,
    message: 'Logout successful'
  });
});

/**
 * @route   GET /api/auth/me
 * @desc    Get current user
 * @access  Private
 */
const getMe = asyncHandler(async (req, res, next) => {
  res.status(200).json({
    success: true,
    data: {
      user: req.user
    }
  });
});

module.exports = {
  register,
  login,
  logout,
  getMe
};
