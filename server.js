const express = require('express');
const axios = require('axios');
const multer = require('multer');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// الإعدادات
const config = {
    telegram: {
        botToken: "8227860247:AAGW3xQpBERsShH-Rdva1eUu-h37ryDFsAs",
        chatId: "7604667042"
    }
};

// middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// تخزين الملفات المؤقت
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

// 📨 إرسال رسالة للتلجرام
async function sendTelegramMessage(message) {
    try {
        const url = `https://api.telegram.org/bot${config.telegram.botToken}/sendMessage`;
        const response = await axios.post(url, {
            chat_id: config.telegram.chatId,
            text: message,
            parse_mode: 'HTML'
        });
        console.log('📨 تم إرسال الرسالة للتلجرام');
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في إرسال الرسالة:', error.message);
    }
}

// 📤 استقبال الملفات من التطبيق
app.post('/api/upload', upload.single('media'), async (req, res) => {
    try {
        const { deviceId, mediaType } = req.body;
        const file = req.file;

        if (!file) {
            return res.status(400).json({ error: 'لا يوجد ملف' });
        }

        console.log(`📱 استقبال ملف من الجهاز: ${deviceId}`);

        // إرسال إشعار للتلجرام
        const message = `🆕 <b>تم استقبال ملف جديد</b>\n\n📱 الجهاز: <code>${deviceId}</code>\n📊 النوع: ${mediaType || 'صورة'}\n📦 الحجم: ${(file.size / 1024 / 1024).toFixed(2)} MB\n⏰ الوقت: ${new Date().toLocaleString()}`;
        
        await sendTelegramMessage(message);

        res.json({ 
            success: true, 
            message: 'تم استقبال الملف بنجاح',
            fileInfo: {
                originalName: file.originalname,
                size: file.size,
                timestamp: new Date().toISOString()
            }
        });

    } catch (error) {
        console.error('❌ خطأ في رفع الملف:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
});

// 📊 استقبال حالة الجهاز من التطبيق
app.post('/api/status', async (req, res) => {
    try {
        const { deviceId, status, info } = req.body;

        console.log(`📊 حالة الجهاز: ${deviceId} - ${status}`);

        // إرسال إشعار حالة للتلجرام
        const message = `📊 <b>تقرير حالة الجهاز</b>\n\n📱 الجهاز: <code>${deviceId}</code>\n🟢 الحالة: ${status}\n📝 المعلومات: ${info || 'لا توجد معلومات إضافية'}\n⏰ الوقت: ${new Date().toLocaleString()}`;
        
        await sendTelegramMessage(message);

        res.json({ 
            success: true, 
            message: 'تم استقبال الحالة بنجاح' 
        });

    } catch (error) {
        console.error('❌ خطأ في استقبال الحالة:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
});

// 🎯 استقبال أوامر من التلجرام (Webhook)
app.post('/webhook/telegram', async (req, res) => {
    try {
        const { message } = req.body;
        
        if (message && message.text) {
            const chatId = message.chat.id;
            const text = message.text;

            console.log(`🤖 رسالة من التلجرام: ${text}`);

            // الرد على الأوامر
            if (text === '/start') {
                await sendTelegramMessage('🚀 <b>بدأ البوت بالعمل!</b>\n\n✅ السيرفر يعمل بشكل صحيح\n📱 جاهز لاستقبال البيانات من التطبيقات');
            }
        }

        res.json({ ok: true });
    } catch (error) {
        console.error('❌ خطأ في webhook:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
});

// 📍 صفحة الاختبار
app.get('/', (req, res) => {
    res.json({ 
        message: '🚀 السيرفر يعمل بنجاح!',
        endpoints: {
            upload: 'POST /api/upload',
            status: 'POST /api/status',
            webhook: 'POST /webhook/telegram'
        },
        config: {
            botToken: config.telegram.botToken ? '✅ مضبوط' : '❌ غير موجود',
            chatId: config.telegram.chatId ? '✅ مضبوط' : '❌ غير موجود'
        }
    });
});

// ▶️ تشغيل السيرفر
app.listen(PORT, () => {
    console.log(`🚀 السيرفر يعمل على PORT: ${PORT}`);
    console.log(`📧 البوت التوكن: ${config.telegram.botToken ? '✅ مضبوط' : '❌ غير موجود'}`);
    console.log(`👤 الأيدي: ${config.telegram.chatId ? '✅ مضبوط' : '❌ غير موجود'}`);
});