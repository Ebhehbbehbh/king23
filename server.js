const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 10000;

// ⚙️ الإعدادات - ضع توكنك وأيديك هنا
const BOT_TOKEN = "8227860247:AAGW3xQpBERsShH-Rdva1eUu-h37ryDFsAs";
const CHAT_ID = "7604667042";

// 📦 middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// 🔔 دالة إرسال رسالة للتلجرام
async function sendTelegramMessage(chatId, text) {
    try {
        const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
        const response = await axios.post(url, {
            chat_id: chatId,
            text: text,
            parse_mode: 'HTML'
        });
        console.log('✅ تم إرسال رسالة للتلجرام');
        return response.data;
    } catch (error) {
        console.error('❌ خطأ في إرسال الرسالة:', error.message);
    }
}

// 🎯 ويب هوك التلجرام - مهم!
app.post('/webhook/telegram', async (req, res) => {
    console.log('📨 استقبال webhook:', JSON.stringify(req.body));
    
    try {
        const { message } = req.body;
        
        if (message && message.text) {
            const chatId = message.chat.id;
            const text = message.text;

            console.log(`🤖 رسالة من ${chatId}: ${text}`);

            // الرد على /start
            if (text === '/start') {
                await sendTelegramMessage(chatId, 
                    '🚀 <b>تم توصيل البوت بنجاح!</b>\n\n' +
                    '✅ السيرفر يعمل بشكل صحيح\n' +
                    '📱 جاهز لاستقبال البيانات\n' +
                    '🔗 الرابط: https://king23.onrender.com'
                );
            }
            
            // الرد على /test
            if (text === '/test') {
                await sendTelegramMessage(chatId, 
                    '🧪 <b>اختبار الاتصال</b>\n\n' +
                    '✅ البوت متصل بالسيرفر\n' +
                    '📡 جميع الأنظمة تعمل\n' +
                    '⏰ الوقت: ' + new Date().toLocaleString()
                );
            }
            
            // الرد على أي رسالة
            if (text !== '/start' && text !== '/test') {
                await sendTelegramMessage(chatId, 
                    '📝 <b>تم استقبال رسالتك</b>\n\n' +
                    `📩 الرسالة: ${text}\n` +
                    '✅ تم المعالجة بنجاح'
                );
            }
        }

        res.json({ ok: true, message: "Webhook processed" });
    } catch (error) {
        console.error('❌ خطأ في webhook:', error);
        res.status(200).json({ ok: true }); // دائماً رد بـ 200
    }
});

// 📤 استقبال بيانات من التطبيق
app.post('/api/upload', async (req, res) => {
    try {
        const { deviceId, mediaType, data } = req.body;
        
        console.log(`📱 استقبال بيانات من: ${deviceId}`);
        
        // إرسال إشعار للتلجرام
        await sendTelegramMessage(CHAT_ID,
            '🆕 <b>بيانات جديدة من التطبيق</b>\n\n' +
            `📱 الجهاز: ${deviceId}\n` +
            `📊 النوع: ${mediaType || 'غير محدد'}\n` +
            `⏰ الوقت: ${new Date().toLocaleString()}\n` +
            `📦 الحجم: ${data ? data.length : 0} bytes`
        );

        res.json({ 
            success: true, 
            message: 'تم استقبال البيانات',
            received: new Date().toISOString()
        });

    } catch (error) {
        console.error('❌ خطأ في api/upload:', error);
        res.status(500).json({ error: 'خطأ في الخادم' });
    }
});

// 📊 صفحة الاختبار الرئيسية
app.get('/', (req, res) => {
    res.json({ 
        status: '✅ يعمل',
        message: '🚀 سيرفر التلجرام يعمل بنجاح',
        timestamp: new Date().toISOString(),
        endpoints: {
            webhook: 'POST /webhook/telegram',
            upload: 'POST /api/upload',
            test: 'GET /test'
        },
        bot: {
            token: BOT_TOKEN ? '✅ مضبوط' : '❌ مفقود',
            chatId: CHAT_ID ? '✅ مضبوط' : '❌ مفقود'
        }
    });
});

// 🧪 صفحة اختبار إضافية
app.get('/test', (req, res) => {
    res.json({ 
        test: 'نجح',
        server: 'يعمل',
        time: new Date().toLocaleString()
    });
});

// ▶️ بدء السيرفر
app.listen(PORT, () => {
    console.log('🚀 =================================');
    console.log('🚀 سيرفر التلجرام يعمل بنجاح!');
    console.log(`🚀 PORT: ${PORT}`);
    console.log(`🔗 الرابط: https://king23.onrender.com`);
    console.log(`🤖 البوت: ${BOT_TOKEN ? '✅ متصل' : '❌ غير متصل'}`);
    console.log(`👤 الأيدي: ${CHAT_ID}`);
    console.log('🚀 =================================');
    
    // إرسال رسالة بدء التشغيل
    sendTelegramMessage(CHAT_ID, 
        '🟢 <b>بدء تشغيل السيرفر</b>\n\n' +
        '✅ السيرفر يعمل الآن\n' +
        `🔗 الرابط: https://king23.onrender.com\n` +
        `⏰ الوقت: ${new Date().toLocaleString()}`
    );
});
