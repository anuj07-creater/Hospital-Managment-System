import { Request, Response } from 'express';
import bcrypt from 'bcryptjs';
import { User } from '../models/User';
import { Doctor } from '../models/Doctor';
import { Patient } from '../models/Patient';
import { isMongoConnected } from '../config/db';
import { generateToken } from '../utils/generateToken';
import { sendSuccess, sendError } from '../utils/apiResponse';
import { hospitalStore } from '../services/storeService';
import { AuthenticatedRequest } from '../middleware/auth';
import { patientService } from '../services/patientService';

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/**
 * Register a new user (defaults to PATIENT role for self-registration)
 */
export async function register(req: Request, res: Response) {
  try {
    const { name, email, password, role, phone, age, gender, bloodGroup, address } = req.body;

    // Validate required fields
    if (!name || !name.trim()) {
      return sendError(res, 'Full name is required', 400);
    }
    if (!email || !email.trim()) {
      return sendError(res, 'Email address is required', 400);
    }
    if (!password) {
      return sendError(res, 'Password is required', 400);
    }

    // Validate email format
    const normalizedEmail = email.toLowerCase().trim();
    if (!EMAIL_REGEX.test(normalizedEmail)) {
      return sendError(res, 'Please provide a valid email address format (e.g. name@domain.com)', 400);
    }

    // Validate password strength
    if (password.length < 6) {
      return sendError(res, 'Password must be at least 6 characters long', 400);
    }

    // Self-registration is restricted to PATIENT
    const targetRole = role === 'PATIENT' || !role ? 'PATIENT' : 'PATIENT';

    if (isMongoConnected()) {
      // Check for duplicate email
      const existingUser = await User.findOne({ email: normalizedEmail });
      if (existingUser) {
        return sendError(res, 'A user account with this email address already exists. Please sign in or use another email.', 409);
      }

      // Create User document (pre-save hook hashes password)
      const user = await User.create({
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: targetRole,
        phone: phone ? phone.trim() : '',
        avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80',
      });

      // Create linked Patient document if role is PATIENT
      let patientDoc = null;
      if (targetRole === 'PATIENT') {
        patientDoc = await patientService.createPatient({
          name: user.name,
          email: user.email,
          phone: user.phone || '+91 98000 00000',
          bloodGroup: bloodGroup || 'B+',
          age: Number(age) || 30,
          gender: gender || 'MALE',
          address: address || 'Pune, Maharashtra',
          userId: user._id.toString(),
        });
      }

      // Generate signed JWT
      const token = generateToken({
        id: user._id.toString(),
        role: user.role,
        email: user.email,
      });

      const userSafe = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        avatar: user.avatar || '',
        patientProfile: patientDoc
          ? {
              id: patientDoc.id,
              medicalRecordNumber: patientDoc.medicalRecordNumber,
              bloodGroup: patientDoc.bloodGroup,
            }
          : undefined,
      };

      return sendSuccess(res, { token, user: userSafe }, 'Account registered successfully', 201);
    }

    // Fallback store
    const existing = hospitalStore.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (existing) {
      return sendError(res, 'A user account with this email address already exists', 409);
    }

    const salt = bcrypt.genSaltSync(10);
    const passwordHash = bcrypt.hashSync(password, salt);
    const newUser = {
      id: `usr-${Date.now().toString().slice(-4)}`,
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: targetRole as any,
      phone: phone || '',
      isActive: true,
      createdAt: new Date().toISOString(),
    };
    hospitalStore.users.push(newUser);

    const token = generateToken({
      id: newUser.id,
      role: newUser.role,
      email: newUser.email,
    });

    const userSafe = {
      id: newUser.id,
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      phone: newUser.phone,
    };

    return sendSuccess(res, { token, user: userSafe }, 'Account registered successfully', 201);
  } catch (error) {
    return sendError(res, 'Registration failed', 500, (error as Error).message);
  }
}

/**
 * Authenticate user with email and password
 */
export async function login(req: Request, res: Response) {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return sendError(res, 'Please provide both email and password', 400);
    }

    const normalizedEmail = email.toLowerCase().trim();

    if (isMongoConnected()) {
      // Find user in MongoDB and explicitly select the hidden password field
      const user = await User.findOne({ email: normalizedEmail }).select('+password');

      if (!user) {
        return sendError(res, 'Invalid email or password', 401);
      }

      if (user.isActive === false) {
        return sendError(res, 'Your hospital staff account has been deactivated. Please contact an administrator.', 403);
      }

      // Securely compare password hash using bcrypt
      const isMatch = await user.comparePassword(password);
      if (!isMatch) {
        return sendError(res, 'Invalid email or password', 401);
      }

      // Generate signed JWT
      const token = generateToken({
        id: user._id.toString(),
        role: user.role,
        email: user.email,
      });

      // Find role-specific linked information (e.g. MRN for patients, room for doctors)
      let patientData = null;
      let doctorData = null;

      if (user.role === 'PATIENT') {
        const p = await Patient.findOne({ userId: user._id });
        if (p) {
          patientData = {
            id: p._id.toString(),
            medicalRecordNumber: p.medicalRecordNumber,
            bloodGroup: p.bloodGroup,
          };
        }
      } else if (user.role === 'DOCTOR') {
        const d = await Doctor.findOne({ userId: user._id });
        if (d) {
          doctorData = {
            id: d._id.toString(),
            specialization: d.specialization,
            department: d.department,
            roomNumber: d.roomNumber,
          };
        }
      }

      // Safe user object without sensitive fields
      const userSafe = {
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone || '',
        avatar: user.avatar || '',
        patientProfile: patientData,
        doctorProfile: doctorData,
      };

      return sendSuccess(res, { token, user: userSafe }, 'Logged in successfully');
    }

    // Fallback store
    const user = hospitalStore.users.find((u) => u.email.toLowerCase() === normalizedEmail);
    if (!user) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const isMatch = bcrypt.compareSync(password, user.passwordHash);
    if (!isMatch) {
      return sendError(res, 'Invalid email or password', 401);
    }

    const token = generateToken({
      id: user.id,
      role: user.role,
      email: user.email,
    });

    const userSafe = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    };

    return sendSuccess(res, { token, user: userSafe }, 'Logged in successfully');
  } catch (error) {
    return sendError(res, 'Authentication failed', 500, (error as Error).message);
  }
}

/**
 * Logout endpoint (invalidates client session)
 */
export async function logout(req: Request, res: Response) {
  return sendSuccess(res, null, 'Logged out successfully');
}

/**
 * Retrieve currently authenticated user profile
 */
export async function getMe(req: AuthenticatedRequest, res: Response) {
  try {
    if (!req.user) {
      return sendError(res, 'Authentication required', 401);
    }

    if (isMongoConnected()) {
      const user = await User.findById(req.user.id);
      if (!user) {
        return sendError(res, 'User record not found in MongoDB', 404);
      }

      let patientData = null;
      let doctorData = null;

      if (user.role === 'PATIENT') {
        const p = await Patient.findOne({ userId: user._id });
        if (p) {
          patientData = {
            id: p._id.toString(),
            medicalRecordNumber: p.medicalRecordNumber,
            bloodGroup: p.bloodGroup,
          };
        }
      } else if (user.role === 'DOCTOR') {
        const d = await Doctor.findOne({ userId: user._id });
        if (d) {
          doctorData = {
            id: d._id.toString(),
            specialization: d.specialization,
            department: d.department,
            roomNumber: d.roomNumber,
          };
        }
      }

      return sendSuccess(
        res,
        {
          id: user._id.toString(),
          name: user.name,
          email: user.email,
          role: user.role,
          phone: user.phone || '',
          avatar: user.avatar || '',
          patientProfile: patientData,
          doctorProfile: doctorData,
        },
        'Current user retrieved'
      );
    }

    const user = hospitalStore.users.find((u) => u.id === req.user?.id);
    if (!user) {
      return sendError(res, 'User record not found', 404);
    }

    const userSafe = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    };

    return sendSuccess(res, userSafe, 'Current user retrieved');
  } catch (error) {
    return sendError(res, 'Failed to retrieve user', 500, (error as Error).message);
  }
}

/**
 * Alias for getMe for REST profile standard
 */
export async function getProfile(req: AuthenticatedRequest, res: Response) {
  return getMe(req, res);
}

/**
 * Demo login helper for seamless testing with real seeded users
 */
export async function demoLogin(req: Request, res: Response) {
  try {
    const { role } = req.body;
    const requestedRole = (role || 'ADMIN').toUpperCase();

    if (isMongoConnected()) {
      let user = await User.findOne({ role: requestedRole });
      if (!user) {
        user = await User.findOne({});
      }

      if (user) {
        const token = generateToken({
          id: user._id.toString(),
          role: user.role,
          email: user.email,
        });

        return sendSuccess(
          res,
          {
            token,
            user: {
              id: user._id.toString(),
              name: user.name,
              email: user.email,
              role: user.role,
              phone: user.phone || '',
              avatar: user.avatar || '',
            },
          },
          `Authenticated as ${user.role} from MongoDB Atlas`
        );
      }
    }

    // Fallback store
    const user =
      hospitalStore.users.find((u) => u.role === requestedRole) || hospitalStore.users[0];

    const token = generateToken({
      id: user.id,
      role: user.role,
      email: user.email,
    });

    const userSafe = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phone,
      avatar: user.avatar,
    };

    return sendSuccess(
      res,
      { token, user: userSafe },
      `Authenticated as ${user.role}`
    );
  } catch (error) {
    return sendError(res, 'Demo login failed', 500, (error as Error).message);
  }
}
