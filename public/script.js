document.addEventListener('DOMContentLoaded', () => {
    const ipInfo = document.getElementById('ipInfo');
    const loader = document.getElementById('loader');
    const captchaContainer = document.getElementById('captchaContainer');
    const captchaQuestion = document.getElementById('captchaQuestion');
    const captchaForm = document.getElementById('captchaForm');
    const captchaInput = document.getElementById('captchaInput');
    const refreshCaptcha = document.getElementById('refreshCaptcha');

    // IP bilgisi elementleri
    const ipElements = {
        ipAddress: document.getElementById('ipAddress'),
        country: document.getElementById('country'),
        city: document.getElementById('city'),
        isp: document.getElementById('isp')
    };

    let currentCaptcha = '';

    // Captcha yenileme fonksiyonu
    async function refreshCaptchaQuestion() {
        try {
            const response = await fetch('/api/captcha');
            if (!response.ok) {
                throw new Error('Failed to fetch captcha');
            }
            const data = await response.json();
            document.getElementById('captchaQuestion').textContent = data.question;
        } catch (error) {
            console.error('Captcha yenileme hatası:', error);
        }
    }

    // IP bilgilerini getirme fonksiyonu
    async function getIPInfo(captchaAnswer) {
        try {
            // Loading durumunu göster
            if (loader) loader.style.display = 'block';
            if (ipInfo) ipInfo.style.display = 'none';

            // IP bilgilerini al
            const response = await fetch(`/api/ip-info?captcha=${encodeURIComponent(captchaAnswer)}`);

            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || 'IP bilgileri alınamadı');
            }

            const data = await response.json();

            // Bilgileri göster
            if (ipElements.ipAddress) ipElements.ipAddress.textContent = data.ip;
            if (ipElements.country) ipElements.country.textContent = data.country;
            if (ipElements.city) ipElements.city.textContent = data.city;
            if (ipElements.isp) ipElements.isp.textContent = data.isp;

            // Loading durumunu gizle
            if (loader) loader.style.display = 'none';
            if (ipInfo) ipInfo.style.display = 'block';
            if (captchaContainer) captchaContainer.style.display = 'none';

        } catch (error) {
            console.error('Hata:', error);
            // Hata durumunda captcha'yı yenile
            await refreshCaptchaQuestion();
            if (loader) loader.style.display = 'none';
            if (ipInfo) ipInfo.style.display = 'block';
            alert(error.message);
        }
    }

    // Captcha doğrulama fonksiyonu
    async function verifyCaptcha(answer) {
        try {
            const response = await fetch('/api/captcha/verify', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ answer })
            });

            if (!response.ok) {
                throw new Error('Failed to verify captcha');
            }

            const data = await response.json();
            return data.success;
        } catch (error) {
            console.error('Captcha doğrulama hatası:', error);
            return false;
        }
    }

    // Event listeners
    if (refreshCaptcha) {
        refreshCaptcha.addEventListener('click', refreshCaptchaQuestion);
    }

    if (captchaForm) {
        captchaForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const answer = captchaInput.value;
            if (!answer) {
                alert('Lütfen captcha cevabını girin');
                return;
            }
            await getIPInfo(answer);
            captchaInput.value = '';
        });
    }

    // Sayfa yüklendiğinde captcha'yı göster
    refreshCaptchaQuestion();
}); 


