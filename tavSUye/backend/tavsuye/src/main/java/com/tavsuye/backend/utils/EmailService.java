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
            helper.setSubject("Hesap Doğrulama Kodu");
            helper.setText("Merhaba,\n\nHesabınızı doğrulamak için aşağıdaki kodu kullanın:\n\n" + verificationCode + "\n\nBu kod 3 dakika boyunca geçerlidir.", false);
            helper.setFrom("tavsuye@gmail.com");

            mailSender.send(message);
            System.out.println("Doğrulama maili gönderildi: " + toEmail);
        } catch (MessagingException e) {
            e.printStackTrace();
            System.out.println("Mail gönderme hatası: " + e.getMessage());
        }
    }
}
