import express, { Router, Request, Response } from 'express';
import nodemailer from 'nodemailer';
import { authenticateToken, AuthRequest } from '../middleware/auth.js';
import { logAuthEvent } from '../middleware/logger.js';
import { supabaseAdmin } from '../config/supabase.js';
import { SUPER_ADMIN_EMAIL, SUPER_ADMIN_PASSWORD, ensureSuperAdminProfile } from '../utils/superAdmin.js';

const formatLoginTime = (date: Date = new Date()) => {
  return new Intl.DateTimeFormat('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Asia/Kolkata',
  }).format(date);
};

const sendAuthEmail = async (to: string, subject: string, text: string, html?: string) => {
  const host = process.env.SMTP_HOST;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;

  if (!host || !user || !pass) {
    console.warn('[auth email] SMTP is not configured; skipping email send for', to);
    return;
  }

  try {
    const transporter = nodemailer.createTransport({
      host,
      port: Number(process.env.SMTP_PORT || 587),
      secure: Number(process.env.SMTP_PORT || 587) === 465,
      auth: { user, pass },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || user,
      to,
      subject,
      text,
      html: html || text,
    });
  } catch (error) {
    console.error('[auth email] Failed to send email:', error);
  }
};

const authRouter = Router();

// ============================================================================
// SIGN UP  — profiles-table auth (no Supabase Auth)
// ============================================================================

authRouter.post('/signup', async (req, res) => {
  try {
    const {
      email,
      password,
      full_name,
      mobile_number,
      address,
      city,
      state,
      pincode,
      preferred_location,
      pet_name,
      pet_type,
      pet_breed,
      pet_age,
      vaccination_date,
      medical_records,
    } = req.body;

    // Validation
    if (!email || !password || !full_name) {
      return res.status(400).json({ error: 'Email, password, and full name are required' });
    }
    if (password.length < 6) {
      return res.status(400).json({ error: 'Password must be at least 6 characters' });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      return res.status(400).json({ error: 'Please enter a valid email address' });
    }

    const requestedPetType = typeof pet_type === 'string' ? pet_type.trim().toLowerCase() : '';
    if (requestedPetType && !['dog', 'cat'].includes(requestedPetType)) {
      return res.status(400).json({ error: 'Only Dog and Cat are allowed as pet types' });
    }

    // Validate pincode if provided
    if (pincode && !/^[1-9][0-9]{5}$/.test(pincode.trim())) {
      return res.status(400).json({ error: 'Invalid PIN code. Must be 6 digits starting with 1-9.' });
    }

    const trimmedEmail = email.trim().toLowerCase();
    
    // Prevent admin emails from signing up through customer portal
    if (trimmedEmail.includes('admin@')) {
      return res.status(400).json({ error: 'This email is reserved for administrators. Please use a different email.' });
    }

    // Check if email already exists
    const { data: existing } = await supabaseAdmin
      .from('profiles')
      .select('id')
      .eq('email', trimmedEmail)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ error: 'This email is already registered. Please log in instead.' });
    }

    // Insert profile
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .insert({
        full_name,
        email: trimmedEmail,
        password,
        mobile_number: mobile_number || null,
        address: address || null,
        city: city || null,
        state: state || null,
        pincode: pincode || null,
        preferred_location: preferred_location || null,
      })
      .select('id, full_name, email, mobile_number, address, avatar_url, city, state, pincode, preferred_location, created_at, updated_at')
      .single();

    if (profileError) {
      console.error('Profile creation error:', profileError);
      return res.status(400).json({ error: profileError.message });
    }

    // Assign default customer role
    await supabaseAdmin
      .from('user_roles')
      .insert({ profile_id: profile.id, role: 'customer' })
      .select();

    if (pet_name || pet_type || pet_breed || pet_age || vaccination_date || medical_records) {
      try {
        await supabaseAdmin.from('pets').insert({
          profile_id: profile.id,
          name: pet_name || 'Pet',
          type: requestedPetType || 'dog',
          breed: pet_breed || null,
          age_months: pet_age ? Number(pet_age) || null : null,
          vaccination_status: vaccination_date || null,
          medical_conditions: medical_records || null,
          special_instructions: medical_records || null,
          is_active: true,
        });
      } catch (petError) {
        console.warn('[auth signup] Pet profile storage skipped:', petError);
      }
    }

    logAuthEvent('User signup', profile.id, { email: trimmedEmail, role: 'customer' });

    await sendAuthEmail(
      trimmedEmail,
      'Welcome to Pawtectors',
      `Hello ${full_name},\n\nYour Pawtectors account has been created successfully. We have saved your pet details and your signup is complete.\n\nEmail: ${trimmedEmail}\nPet type: ${requestedPetType || 'Not provided'}\n\nIf you need help, contact us at pawtectorsorg@gmail.com.\n\nThank you for joining Pawtectors.`,
      `<p>Hello <strong>${full_name}</strong>,</p><p>Your Pawtectors account has been created successfully.</p><p><strong>Email:</strong> ${trimmedEmail}</p><p><strong>Pet type:</strong> ${requestedPetType || 'Not provided'}</p><p>If you need help, contact us at <a href="mailto:pawtectorsorg@gmail.com">pawtectorsorg@gmail.com</a>.</p><p>Thank you for joining Pawtectors.</p>`
    );

    res.status(201).json({
      message: 'User created successfully',
      user: { ...profile, role: 'customer' },
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Signup failed' });
  }
});

// ============================================================================
// LOGIN  — profiles-table auth (no Supabase Auth)
// ============================================================================

authRouter.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const trimmedEmail = email.trim().toLowerCase();

    if (trimmedEmail === SUPER_ADMIN_EMAIL && password === SUPER_ADMIN_PASSWORD) {
      const profile = await ensureSuperAdminProfile();
      const { password: _pw, ...safeProfile } = profile as Record<string, unknown>;

      logAuthEvent('Super admin login', String(profile.id), { email: trimmedEmail, role: 'admin' });

      return res.json({
        message: 'Login successful',
        user: { ...safeProfile, role: 'admin' },
      });
    }

    // Look up user in profiles table
    let { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, password, mobile_number, address, avatar_url, city, state, pincode, preferred_location, created_at, updated_at')
      .eq('email', trimmedEmail)
      .maybeSingle();

    // Auto-create/ensure demo doctor and provider profiles if missing from Supabase
    const DEMO_PROVIDERS: Record<string, { full_name: string; role: string; password: string }> = {
      'dr.amit@vetclinic.com': { full_name: 'Dr. Amit Veterinary', role: 'provider', password: 'password123' },
      'doctor@vetclinic.com': { full_name: 'Dr. Eleanor Vance', role: 'provider', password: 'password123' },
      'sarah@groomers.com': { full_name: 'Sarah Pet Groomer', role: 'provider', password: 'password123' },
    };

    if (!profile && DEMO_PROVIDERS[trimmedEmail]) {
      const demo = DEMO_PROVIDERS[trimmedEmail];
      if (password === demo.password) {
        const demoId = `00000000-0000-0000-0000-00000000000` + (trimmedEmail.includes('amit') ? '2' : '3');
        try {
          const { data: createdProfile } = await supabaseAdmin
            .from('profiles')
            .upsert({
              id: demoId,
              full_name: demo.full_name,
              email: trimmedEmail,
              password: demo.password,
              mobile_number: '9876543220',
              address: 'Clinic Building, MG Road',
              city: 'Mumbai',
              state: 'Maharashtra',
              pincode: '400001',
              preferred_location: 'Mumbai',
              is_active: true
            })
            .select('id, full_name, email, password, mobile_number, address, avatar_url, city, state, pincode, preferred_location, created_at, updated_at')
            .single();
          
          if (createdProfile) {
            profile = createdProfile;
            profileError = null;
            await supabaseAdmin.from('user_roles').upsert({ profile_id: demoId, role: demo.role });
          }
        } catch (err) {
          console.warn('[demo provider login fallback]', err);
          profile = {
            id: demoId,
            full_name: demo.full_name,
            email: trimmedEmail,
            password: demo.password,
            created_at: new Date().toISOString()
          } as any;
          profileError = null;
        }
      }
    }

    if (profileError || !profile) {
      return res.status(401).json({ error: 'No account found with this email.' });
    }

    // Verify password (plain-text comparison for demo)
    if (profile.password !== password) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Check if user has a role assigned
    const { data: userRole } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('profile_id', profile.id)
      .maybeSingle();
    
    const role = userRole?.role || 'customer';

    logAuthEvent('User login', profile.id, { email: trimmedEmail, role });

    const loginTime = formatLoginTime();
    await sendAuthEmail(
      trimmedEmail,
      'Pawtectors — Login Successful',
      `Hi ${profile.full_name || 'there'},\n\nWe detected a login to your Pawtectors account (${trimmedEmail}) on ${loginTime}. If this was you, no action is required. If you did not sign in, please reset your password immediately at https://pawtectors.in/account/password-reset or contact us at pawtectorsorg@gmail.com.\n\nThanks,\nThe Pawtectors Team`,
      `<p>Hi <strong>${profile.full_name || 'there'}</strong>,</p>
      <p>We detected a login to your Pawtectors account (<strong>${trimmedEmail}</strong>) on <strong>${loginTime}</strong>.</p>
      <p>If this was you, no action is required. If you did not sign in, please <a href="https://pawtectors.in/account/password-reset">reset your password</a> immediately or contact us at <a href="mailto:pawtectorsorg@gmail.com">pawtectorsorg@gmail.com</a>.</p>
      <p>Thanks,<br/>The Pawtectors Team</p>`
    );

    // Strip password before sending
    const { password: _pw, ...safeProfile } = profile;

    res.json({
      message: 'Login successful',
      user: { ...safeProfile, role },
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Login failed' });
  }
});

// ============================================================================
// LOGOUT  (just clears cookie, no session table)
// ============================================================================

authRouter.post('/logout', (_req, res) => {
  res.json({ message: 'Logout successful' });
});

// ============================================================================
// PASSWORD CHANGE
// ============================================================================

authRouter.post('/password-change', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { current_password, new_password } = req.body;
    if (!current_password || !new_password) {
      return res.status(400).json({ error: 'Current password and new password are required' });
    }
    if (new_password.length < 6) {
      return res.status(400).json({ error: 'New password must be at least 6 characters' });
    }

    // Verify current password
    const { data: prof } = await supabaseAdmin
      .from('profiles')
      .select('password')
      .eq('id', req.user.id)
      .single();

    if (!prof || prof.password !== current_password) {
      return res.status(401).json({ error: 'Current password is incorrect' });
    }

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({ password: new_password })
      .eq('id', req.user.id);

    if (error) return res.status(400).json({ error: error.message });

    logAuthEvent('Password changed', req.user.id);
    res.json({ message: 'Password changed successfully' });
  } catch (error) {
    console.error('Password change error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Password change failed' });
  }
});

// ============================================================================
// GET CURRENT USER  — reads user id from X-User-Id header
// ============================================================================

authRouter.get('/me', authenticateToken, async (req: AuthRequest, res) => {
  try {
    if (!req.user) return res.status(401).json({ error: 'Unauthorized' });

    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('id, full_name, email, mobile_number, address, avatar_url, city, state, pincode, preferred_location, created_at, updated_at')
      .eq('id', req.user.id)
      .single();

    if (profileError || !profile) {
      return res.status(404).json({ error: 'Profile not found' });
    }

    const { data: roles } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('profile_id', req.user.id);

    res.json({
      user: {
        ...profile,
        roles: (roles || []).map((r: { role: string }) => r.role),
      },
    });
  } catch (error) {
    console.error('Get current user error:', error);
    res.status(500).json({ error: error instanceof Error ? error.message : 'Failed to fetch user' });
  }
});

export default authRouter;
