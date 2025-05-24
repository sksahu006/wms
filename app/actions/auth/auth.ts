// 'use server';

// import { prisma } from '@/lib/prisma';
// import { z } from 'zod';
// import { nanoid } from 'nanoid';
// import { sendEmail } from '@/lib/email'; // Your email sending utility
// import { revalidatePath } from 'next/cache';

// // Validation schema for password reset request
// const requestPasswordResetSchema = z.object({
//   email: z.string().email({ message: 'Invalid email address' }),
// });

// export async function requestPasswordReset(formData: FormData) {
//   try {
//     // Parse and validate input
//     const data = requestPasswordResetSchema.parse({
//       email: formData.get('email'),
//     });

//     // Find user by email
//     const user = await prisma.user.findUnique({
//       where: { email: data.email },
//     });

//     if (!user) {
//       // Don't reveal if the email exists for security
//       return {
//         success: true,
//         message: 'If an account exists, a reset link has been sent.',
//       };
//     }

//     // Generate a reset token
//     const token = nanoid(32);
//     const expiresAt = new Date(Date.now() + 1000 * 60 * 60); // 1 hour expiry

//     // Save reset token to the database
//     await prisma.resetToken.create({
//       data: {
//         userId: user.id,
//         token,
//         expiresAt,
//       },
//     });

//     // Send reset email
//     const resetLink = `${process.env.NEXT_PUBLIC_APP_URL}/reset-password?token=${token}`;
//         await sendEmail({
//           to: data.email,
//           subject: 'Password Reset Request',
//           text: `Hello,
    
//     You requested a password reset. Use the following link to reset your password:
//     ${resetLink}
    
//     This link will expire in 1 hour.
    
//     If you didn't request this, please ignore this email.
//           `,
//           html: `
//             <p>Hello,</p>
//             <p>You requested a password reset. Click the link below to reset your password:</p>
//             <p><a href="${resetLink}">Reset Password</a></p>
//             <p>This link will expire in 1 hour.</p>
//             <p>If you didn't request this, please ignore this email.</p>
//           `,
//         });

//     return {
//       success: true,
//       message: 'A password reset link has been sent to your email.',
//     };
//   } catch (error) {
//     console.error('Request password reset error:', error);
//     return {
//       success: false,
//       error:
//         error instanceof z.ZodError
//           ? error.errors.map((e) => e.message).join(', ')
//           : error instanceof Error
//           ? error.message
//           : 'Failed to request password reset',
//     };
//   }
// }

// const resetPasswordSchema = z.object({
//   token: z.string().min(1, { message: 'Invalid reset token' }),
//   password: z.string().min(8, { message: 'Password must be at least 8 characters' }),
// });

// export async function resetPassword(formData: FormData) {
//   try {
//     // Parse and validate input
//     const data = resetPasswordSchema.parse({
//       token: formData.get('token'),
//       password: formData.get('password'),
//     });

//     // Find reset token
//     const resetToken = await prisma.resetToken.findUnique({
//       where: { token: data.token },
//       include: { user: true },
//     });

//     if (!resetToken || !resetToken.user) {
//       throw new Error('Invalid or expired reset token');
//     }

//     if (resetToken.expiresAt < new Date()) {
//       throw new Error('Reset token has expired');
//     }

//     // Hash new password
//     const hashedPassword = await hash(data.password, 10);

//     // Update user password and delete token
//     await prisma.$transaction([
//       prisma.user.update({
//         where: { id: resetToken.userId },
//         data: { password: hashedPassword },
//       }),
//       prisma.resetToken.delete({ where: { id: resetToken.id } }),
//     ]);

//     return {
//       success: true,
//       message: 'Password reset successfully',
//     };
//   } catch (error) {
//     console.error('Reset password error:', error);
//     return {
//       success: false,
//       error:
//         error instanceof z.ZodError
//           ? error.errors.map((e) => e.message).join(', ')
//           : error instanceof Error
//           ? error.message
//           : 'Failed to reset password',
//     };
//   }
// }
//------------------------------add karibu schema r-------------------
// model ResetToken {
//   id         String    @id @default(cuid())
//   userId     String
//   token      String    @unique
//   expiresAt  DateTime
//   createdAt  DateTime  @default(now())
//   user       User      @relation(fields: [userId], references: [id], onDelete: Cascade)
// }