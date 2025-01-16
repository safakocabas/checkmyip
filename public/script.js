document.addEventListener('DOMContentLoaded', () => {
    const ipInfo = document.getElementById('ipInfo');
    const loader = document.getElementById('loader');

    // IP bilgisi elementleri
    const ipElements = {
        ipAddress: document.getElementById('ipAddress'),
        country: document.getElementById('country'),
        city: document.getElementById('city'),
        isp: document.getElementById('isp')
    };

    // IP bilgilerini getirme fonksiyonu
    async function getIPInfo() {
        try {
            // Loading durumunu göster
            if (loader) loader.style.display = 'block';
            if (ipInfo) ipInfo.style.display = 'none';

            // IP bilgilerini al
            const response = await fetch('/api/ip-info');

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

        } catch (error) {
            console.error('Hata:', error);
            if (loader) loader.style.display = 'none';
            if (ipInfo) ipInfo.style.display = 'block';
            alert(error.message);
        }
    }

    // Sayfa yüklendiğinde IP bilgilerini al
    getIPInfo();
});
