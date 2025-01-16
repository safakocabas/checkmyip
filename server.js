const express = require('express');
const axios = require('axios');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const cors = require('cors');
const session = require('express-session');
const hpp = require('hpp');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const path = require('path');

require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(helmet({
    contentSecurityPolicy: {
        directives: {
            defaultSrc: ["'self'"], // Genel kaynaklar sadece kendi domain'den
            scriptSrc: ["'self'", "'unsafe-inline'", "cdnjs.cloudflare.com"], // Script kaynakları
            styleSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"], // Font Awesome ve diğer stil kaynakları
            fontSrc: ["'self'", "https://cdnjs.cloudflare.com"], // Font Awesome fontları için izin
            imgSrc: ["'self'", "data:", "https:"], // Resimler
            connectSrc: ["'self'", "https://api.ipify.org", "https://ipapi.co"], // Bağlantılar
            frameSrc: ["'none'"], // Çerçeve kaynakları engelleniyor
            objectSrc: ["'none'"], // Object ve embed kaynakları engelleniyor
            upgradeInsecureRequests: [], // HTTP'den HTTPS'ye otomatik yükseltme
        }
    },
    crossOriginEmbedderPolicy: true, // Cross-origin embedding engelleniyor
    crossOriginOpenerPolicy: true, // Cross-origin opener engelleniyor
    crossOriginResourcePolicy: { policy: "same-site" }, // Kaynak paylaşımı politikası
    dnsPrefetchControl: { allow: false }, // DNS önbelleği devre dışı
    frameguard: { action: "deny" }, // Frame kullanımı engelleniyor
    hsts: { maxAge: 31536000, includeSubDomains: true, preload: true }, // HSTS ayarı
    ieNoOpen: true, // Internet Explorer için güvenlik
    noSniff: true, // MIME türü denetimi
    referrerPolicy: { policy: "strict-origin-when-cross-origin" }, // Referrer politikasını ayarlıyoruz
    xssFilter: true // XSS filtresi etkin
}));


// DOS saldırılarına karşı rate limiting
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 dakika
    max: 1000, // IP başına maksimum istek sayısını artırdık
    message: 'Çok fazla istek gönderdiniz, lütfen daha sonra tekrar deneyin.',
    standardHeaders: true,
    legacyHeaders: false
});

// Brute force saldırılarına karşı captcha rate limiting
const captchaLimiter = rateLimit({
    windowMs: 60 * 60 * 1000, // 1 saat
    max: 100, // Captcha deneme limitini artırdık
    message: 'Çok fazla başarısız deneme yaptınız, lütfen daha sonra tekrar deneyin.'
});

// Session güvenliği
const sessionConfig = {
    secret: process.env.SESSION_SECRET || 'gizli-anahtar',
    name: 'sessionId', // varsayılan 'connect.sid' ismini değiştir
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: process.env.NODE_ENV === 'production',
        httpOnly: true,
        sameSite: 'strict',
        maxAge: 1000 * 60 * 15, // 15 dakika
        path: '/',
        domain: process.env.NODE_ENV === 'production' ? '.myip.xyz' : undefined
    }
};

if (process.env.NODE_ENV === 'production') {
    app.set('trust proxy', 1);
    sessionConfig.cookie.secure = true;
}

app.use(session(sessionConfig));

// CORS ayarları
const corsOptions = {
    origin: process.env.NODE_ENV === 'production' ? 'https://myip.xyz' : 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true,
    maxAge: 3600
};
app.use(cors(corsOptions));

// Diğer güvenlik middleware'leri
app.use(express.json({ limit: '10kb' })); // Body boyutunu sınırla
app.use(express.urlencoded({ extended: true, limit: '10kb' }));
app.use(hpp()); // Parameter pollution koruması
app.use(mongoSanitize()); // NoSQL injection koruması
app.use(xss()); // XSS koruması

// Global rate limiting yerine sadece API endpointlerine uygulayalım
app.use('/api/', limiter); // Sadece API isteklerini sınırla

// Captcha endpoint'i için özel rate limiting
app.use('/api/captcha', captchaLimiter);

// Request logging middleware
app.use((req, res, next) => {
    const clientIP = req.ip;
    const method = req.method;
    const url = req.url;
    const userAgent = req.headers['user-agent'];
    
    console.log(`[${new Date().toISOString()}] ${clientIP} ${method} ${url} ${userAgent}`);
    next();
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({
        error: 'Internal Server Error',
        message: process.env.NODE_ENV === 'development' ? err.message : 'Bir hata oluştu'
    });
});

app.use(express.static(path.join(__dirname, 'public')));

// SEO dosyaları için özel route'lar
app.get('/robots.txt', (req, res) => {
    res.type('text/plain');
    res.sendFile(path.join(__dirname, 'public', 'robots.txt'));
});

app.get('/sitemap.xml', (req, res) => {
    res.type('application/xml');
    res.sendFile(path.join(__dirname, 'public', 'sitemap.xml'));
});

// Statik sayfa route'ları
app.get('/about', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'about.html'));
});

app.get('/privacy', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'privacy.html'));
});

app.get('/terms', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'terms.html'));
});

app.get('/contact', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'contact.html'));
});

app.get('/cookies', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'cookies.html'));
});

// Contact form endpoint'i
app.post('/api/contact', async (req, res) => {
    try {
        const { name, email, subject, message } = req.body;
        
        // Burada e-posta gönderme işlemi yapılabilir
        // Örnek: await sendEmail(name, email, subject, message);
        
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('Contact form error:', error);
        res.status(500).json({ error: 'Failed to send message' });
    }
});

// Captcha endpoint'i
app.get('/api/captcha', (req, res) => {
    try {
        const num1 = Math.floor(Math.random() * 10) + 1;
        const num2 = Math.floor(Math.random() * 10) + 1;
        const operators = ['+', '-', '*'];
        const operator = operators[Math.floor(Math.random() * operators.length)];
        
        const question = `${num1} ${operator} ${num2}`;
        const answer = eval(`${num1} ${operator} ${num2}`);
        
        // Session'a doğru cevabı kaydet
        req.session.captchaAnswer = answer;
        
        res.json({ question });
    } catch (error) {
        console.error('Captcha generation error:', error);
        res.status(500).json({ error: 'Failed to generate captcha' });
    }
});

// Captcha doğrulama endpoint'i
app.post('/api/captcha/verify', (req, res) => {
    try {
        const { answer } = req.body;
        const correctAnswer = req.session.captchaAnswer;

        if (!correctAnswer) {
            return res.status(400).json({ error: 'Captcha expired' });
        }

        const isCorrect = parseInt(answer) === correctAnswer;
        
        // Bir kez kullanıldıktan sonra session'dan sil
        delete req.session.captchaAnswer;

        res.json({ success: isCorrect });
    } catch (error) {
        console.error('Captcha verification error:', error);
        res.status(500).json({ error: 'Failed to verify captcha' });
    }
});

// IP bilgileri endpoint'i
app.get('/api/ip-info', async (req, res) => {
    try {
        const captchaAnswer = req.query.captcha;
        const correctAnswer = req.session.captchaAnswer;

        // Captcha doğrulaması
        if (!correctAnswer || parseInt(captchaAnswer) !== correctAnswer) {
            return res.status(403).json({ error: 'Invalid captcha' });
        }

        // IP bilgilerini al
        const ipResponse = await axios.get('https://api.ipify.org?format=json');
        const ip = ipResponse.data.ip;

        // Lokasyon bilgilerini al
        const geoResponse = await axios.get(`https://ipapi.co/${ip}/json/`);
        const { country_name, city, org } = geoResponse.data;

        res.json({
            ip: ip,
            country: country_name,
            city: city,
            isp: org
        });

    } catch (error) {
        console.error('IP info error:', error);
        res.status(500).json({ error: 'Failed to get IP information' });
    }
});





app.listen(PORT, () => {
    console.log(`Server http://localhost:${PORT} adresinde çalışıyor`);
}); 