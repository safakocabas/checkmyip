document.addEventListener('DOMContentLoaded', () => {
    const contactForm = document.getElementById('contactForm');
    const captchaContainer = document.getElementById('captchaContainer');
    const captchaQuestion = document.getElementById('captchaQuestion');
    const captchaInput = document.getElementById('captchaInput');
    const refreshCaptcha = document.getElementById('refreshCaptcha');

    // Captcha oluşturma
    function generateCaptcha() {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const operators = ['+', '-', '*'];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        
        captchaQuestion.textContent = `${num1} ${operator} ${num2} = ?`;
        return eval(`${num1} ${operator} ${num2}`);
    }

    let currentCaptchaResult = generateCaptcha();

    // Captcha yenileme
    refreshCaptcha.addEventListener('click', () => {
        currentCaptchaResult = generateCaptcha();
        captchaInput.value = '';
    });

    // Form gönderimi
    contactForm.addEventListener('submit', async (e) => {
        e.preventDefault();

        if (parseInt(captchaInput.value) !== currentCaptchaResult) {
            alert('Incorrect captcha answer. Please try again.');
            currentCaptchaResult = generateCaptcha();
            captchaInput.value = '';
            return;
        }

        const formData = new FormData(contactForm);
        const data = Object.fromEntries(formData.entries());

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(data)
            });

            if (!response.ok) {
                throw new Error('Failed to send message');
            }

            alert('Message sent successfully! We will get back to you soon.');
            contactForm.reset();
            currentCaptchaResult = generateCaptcha();

        } catch (error) {
            console.error('Error:', error);
            alert('Failed to send message. Please try again later.');
        }
    });
}); 