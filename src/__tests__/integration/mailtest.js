import nodemailer from 'nodemailer';

// Functie om de mail te testen
async function testEmail() {
    try {
        // Eerst maken we een test account aan
        const testAccount = await nodemailer.createTestAccount();
        
        // Maak een test SMTP transporter aan met de test credentials
        const testTransporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
        
        // Verstuur een test email
        const info = await testTransporter.sendMail({
            from: '"Test Gebruiker" <test@example.com>',
            to: testAccount.user,
            subject: "Test Email ",
            text: "Als je dit kunt lezen, werkt NodeMailer correct!",
            html: "<b>Als je dit kunt lezen, werkt NodeMailer correct!</b>"
        });

        console.log('Bericht verzonden: %s', info.messageId);
        console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
    } catch (error) {
        console.error('Er is een fout opgetreden:', error);
    }
}

// Voer de test uit
testEmail();
