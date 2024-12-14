package com.Aquatech.web.ContactFormService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

import com.Aquatech.web.ContactFormrepository.ContactFormRepository;
import com.Aquatech.web.Entity.ContactForm;

@Service
public class ContactFormService {

    @Autowired
    private ContactFormRepository contactFormRepository;

    @Autowired
    private JavaMailSender mailSender;

    private final String ADMIN_EMAIL = "your_mail";

    public void submitContactForm(ContactForm contactForm) {


        sendConfirmationEmail(contactForm);

        sendContactDetailsToAdmin(contactForm);
    }

    private void sendConfirmationEmail(ContactForm contactForm) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(contactForm.getEmail());
        message.setSubject("Thank You for Contacting Us");
        message.setText("Dear " + contactForm.getName() + ",\n\nThank you for reaching out to us. We have received your message and will get back to you shortly.\n\nBest Regards,\nAquatech Team");
        mailSender.send(message);
    }

    private void sendContactDetailsToAdmin(ContactForm contactForm) {
        SimpleMailMessage message = new SimpleMailMessage();
        message.setTo(ADMIN_EMAIL);
        message.setSubject("New Contact Form Submission");
        message.setText("You have received a new contact form submission:\n\n"
                + "Name: " + contactForm.getName() + "\n"
                + "Email: " + contactForm.getEmail() + "\n"
                + "Phone: " + contactForm.getPhone() + "\n"
                + "Message: " + contactForm.getMessage());
        mailSender.send(message);
    }
}
