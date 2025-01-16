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
    
            // Response'un başarılı olup olmadığını kontrol et
            if (!response.ok) {
                throw new Error(`HTTP Error: ${response.status}`);
            }
    
            // Yanıtın JSON formatında olup olmadığını kontrol et
            const text = await response.text(); // JSON verisini almadan önce metin olarak al
            let data;
    
            try {
                // Metin verisini JSON formatına dönüştür
                data = JSON.parse(text);
            } catch (error) {
                throw new Error('Beklenmeyen formatta veri alındı');
            }
    
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
