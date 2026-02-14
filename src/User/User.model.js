import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const UserSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: [true, 'El nombre es obligatorio'],
            trim: true
        },
        surname: {
            type: String,
            required: [true, 'El apellido es obligatorio'],
            trim: true
        },
        email: {
            type: String,
            required: [true, 'El correo es obligatorio'],
            unique: true,
            lowercase: true,
            match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Por favor ingresa un correo válido']
        },
        password: {
            type: String,
            required: [true, 'La contraseña es obligatoria'],
            minlength: [6, 'La contraseña debe tener mínimo 6 caracteres'],
            select: false
        },
        phone: {
            type: String,
            required: [true, 'El teléfono es necesario para notificaciones'],
            match: [/^[0-9]{7,15}$/, 'Por favor ingresa un teléfono válido']
        },
        address: {
            type: String,
            trim: true
        },
        profileImage: {
            type: String,
            default: null
        },
        role: {
            type: String,
            enum: ['PLATFORM_ADMIN', 'RESTAURANT_ADMIN', 'CLIENT'],
            default: 'CLIENT',
            required: true
        },
        status: {
            type: String,
            enum: ['ACTIVO', 'INACTIVO', 'SUSPENDIDO'],
            default: 'INACTIVO',
            required: true  
        },
        emailVerified: {
            type: Boolean,
            default: false
        },
        verificationToken: {
            type: String,
            default: null,
            select: false
        },
        resetPasswordToken: {
            type: String,
            default: null,
            select: false
        },
        resetPasswordExpires: {
            type: Date,
            default: null,
            select: false
        },

    },
    { timestamps: true }
);

UserSchema.pre('save', async function() {
    if (!this.isModified('password')) {
        return;
    }

    try {
        const salt = await bcrypt.genSalt(10);
        this.password = await bcrypt.hash(this.password, salt);
    } catch (error) {
        throw error;
    }
});

UserSchema.methods.matchPassword = async function(passwordIngresada) {
    try {
        return await bcrypt.compare(passwordIngresada, this.password);
    } catch (error) {
        throw error;
    }
};

UserSchema.methods.generarJWT = function() {
    const token = jwt.sign(
        {
            id: this._id,
            email: this.email,
            role: this.role
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || '30m',
            issuer: process.env.JWT_ISSUER,
            audience: process.env.JWT_AUDIENCE
        }
    );
    return token;
};

UserSchema.methods.generarRefreshJWT = function() {
    const refreshToken = jwt.sign(
        {
            id: this._id,
            email: this.email,
            type: 'refresh'
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '7d',
            issuer: process.env.JWT_ISSUER
        }
    );
    return refreshToken;
};

UserSchema.methods.generarVerificationToken = function() {
    const token = jwt.sign(
        {
            id: this._id,
            email: this.email,
            tipo: 'email_verification'
        },
        process.env.JWT_SECRET,
        {
            expiresIn: `${process.env.VERIFICATION_EMAIL_EXPIRY_HOURS || 24}h`
        }
    );
    
    this.verificationToken = token;
    return token;
};

UserSchema.methods.generarResetPasswordToken = function() {
    const token = jwt.sign(
        {
            id: this._id,
            email: this.email,
            tipo: 'password_reset'
        },
        process.env.JWT_SECRET,
        {
            expiresIn: `${process.env.PASSWORD_RESET_EXPIRY_HOURS || 1}h`
        }
    );
    
    this.resetPasswordToken = token;
    this.resetPasswordExpires = new Date(Date.now() + (process.env.PASSWORD_RESET_EXPIRY_HOURS || 1) * 60 * 60 * 1000);
    return token;
};

export default mongoose.model('User', UserSchema);