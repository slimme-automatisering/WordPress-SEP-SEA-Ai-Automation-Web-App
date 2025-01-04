import nodemailer from 'nodemailer';

describe('Email Service Tests', () => {
    let testAccount;
    let testTransporter;

    beforeAll(async () => {
        // Maak een test account aan voor de tests
        testAccount = await nodemailer.createTestAccount();
        
        // Maak een test SMTP transporter aan
        testTransporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: testAccount.user,
                pass: testAccount.pass
            }
        });
    });

    test('moet een test email kunnen versturen', async () => {
        // Verstuur een test email
        const info = await testTransporter.sendMail({
            from: '"Test Gebruiker" <test@example.com>',
            to: testAccount.user,
            subject: "Test Email",
            text: "Als je dit kunt lezen, werkt NodeMailer correct!",
            html: "<b>Als je dit kunt lezen, werkt NodeMailer correct!</b>"
        });

        // Verificaties
        expect(info).toBeDefined();
        expect(info.messageId).toBeDefined();
        expect(nodemailer.getTestMessageUrl(info)).toBeDefined();
    });

    test('moet een fout geven bij ongeldige credentials', async () => {
        const invalidTransporter = nodemailer.createTransport({
            host: 'smtp.ethereal.email',
            port: 587,
            secure: false,
            auth: {
                user: 'invalid',
                pass: 'invalid'
            }
        });

        await expect(
            invalidTransporter.sendMail({
                from: '"Test" <test@example.com>',
                to: "test@example.com",
                subject: "Test",
                text: "Test"
            })
        ).rejects.toThrow();
    });
});
