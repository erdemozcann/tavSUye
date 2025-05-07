package com.tavsuye.backend.utils;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {
    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    public void sendVerificationEmail(String toEmail, String verificationCode) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(toEmail);
            helper.setSubject("Account Verification Code / Hesap Doğrulama Kodu");
            helper.setText(
                "Hello,\n\n" +
                "To verify your account, please use the following code:\n\n" +
                verificationCode + "\n\n" +
                "This code is valid for 3 minutes.\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Merhaba,\n\n" +
                "Hesabınızı doğrulamak için aşağıdaki kodu kullanın:\n\n" +
                verificationCode + "\n\n" +
                "Bu kod 3 dakika boyunca geçerlidir.\n\n" +
                "Eğer bu işlemi siz yapmadıysanız, lütfen bu e-postayı görmezden gelin.",
                false
            );
            helper.setFrom("tavsuye@gmail.com");

            mailSender.send(message);
            System.out.println("Verification email sent to: " + toEmail);
        } catch (MessagingException e) {
            e.printStackTrace();
            System.out.println("Error sending email: " + e.getMessage());
        }
    }

    public void sendPasswordResetEmail(String email, String resetToken) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(email);
            helper.setSubject("Password Reset Request / Şifre Sıfırlama Talebi");
            helper.setText(
                "Hello,\n\n" +
                "You requested a password reset. Use the following token to reset your password:\n\n" +
                resetToken + "\n\n" +
                "If you did not request this, please ignore this email.\n\n" +
                "Merhaba,\n\n" +
                "Şifre sıfırlama talebinde bulundunuz. Şifrenizi sıfırlamak için aşağıdaki kodu kullanın:\n\n" +
                resetToken + "\n\n" +
                "Eğer bu işlemi siz yapmadıysanız, lütfen bu e-postayı görmezden gelin.",
                false
            );
            helper.setFrom("tavsuye@gmail.com");

            mailSender.send(message);
            System.out.println("Password reset email sent to: " + email);
        } catch (MessagingException e) {
            e.printStackTrace();
            System.out.println("Error sending email: " + e.getMessage());
        }
    }

    public void sendBanNotificationEmail(String email, String reason) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true);

            helper.setTo(email);
            helper.setSubject("Account Banned / Hesabınız Yasaklandı");
            helper.setText(
                "Hello,\n\n" +
                "Your account has been banned due to the following reason:\n\n" +
                reason + "\n\n" +
                "If you believe this is a mistake, please contact support.\n\n" +
                "Merhaba,\n\n" +
                "Hesabınız aşağıdaki sebepten dolayı yasaklanmıştır:\n\n" +
                reason + "\n\n" +
                "Eğer bunun bir hata olduğunu düşünüyorsanız, lütfen destek ile iletişime geçin.",
                false
            );
            helper.setFrom("tavsuye@gmail.com");

            mailSender.send(message);
            System.out.println("Ban notification email sent to: " + email);
        } catch (MessagingException e) {
            e.printStackTrace();
            System.out.println("Error sending ban notification email: " + e.getMessage());
        }
    }
}
