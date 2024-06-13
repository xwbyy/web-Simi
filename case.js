require("./config");
const fs = require('fs');
const util = require('util');
const axios = require('axios');

let conversationCount = 0;

async function getMessage(yourMessage, langCode) {
    try {
        const res = await axios.post(
            'https://api.simsimi.vn/v2/simtalk',
            new URLSearchParams({
                'text': yourMessage,
                'lc': langCode
            })
        );
        return res.data.message;
    } catch (error) {
        console.error('[SimiSimi API] Error:', error);
        return 'Maaf, saya mengalami kesalahan.';
    }
}

function addEmotion(response, userMessage) {
    const lowerCaseMessage = userMessage.toLowerCase();

    const emojiMap = {
        happy: ["😀", "😃", "😄", "😁", "😅", "🤣", "🥳", "🤩", "😍", "🥰", "😘", "😗", "🙃", "🙂", "😊", "😏"],
        sad: ["😭", "😔", "😢", "😥", "🥺"],
        angry: ["😡", "😠", "😤", "😾"],
        tired: ["😴", "🥱", "😪", "😓"],
        surprised: ["😲", "😯", "😳", "🤯", "😱"],
        love: ["❤️", "😍", "😘", "💖", "💘", "💝"],
        sick: ["🤧", "🤒", "🤢", "🤮", "🥵", "🥶", "😷"]
    };

    if (lowerCaseMessage.includes("senang") || lowerCaseMessage.includes("bahagia") || lowerCaseMessage.includes("gembira")) {
        response += " " + emojiMap.happy[Math.floor(Math.random() * emojiMap.happy.length)];
    } else if (lowerCaseMessage.includes("sedih") || lowerCaseMessage.includes("down") || lowerCaseMessage.includes("galau")) {
        response += " " + emojiMap.sad[Math.floor(Math.random() * emojiMap.sad.length)];
    } else if (lowerCaseMessage.includes("marah") || lowerCaseMessage.includes("kesal")) {
        response += " " + emojiMap.angry[Math.floor(Math.random() * emojiMap.angry.length)];
    } else if (lowerCaseMessage.includes("capek") || lowerCaseMessage.includes("lelah") || lowerCaseMessage.includes("ngantuk")) {
        response += " " + emojiMap.tired[Math.floor(Math.random() * emojiMap.tired.length)];
    } else if (lowerCaseMessage.includes("kaget") || lowerCaseMessage.includes("terkejut")) {
        response += " " + emojiMap.surprised[Math.floor(Math.random() * emojiMap.surprised.length)];
    } else if (lowerCaseMessage.includes("cinta") || lowerCaseMessage.includes("sayang") || lowerCaseMessage.includes("kasih")) {
        response += " " + emojiMap.love[Math.floor(Math.random() * emojiMap.love.length)];
    } else if (lowerCaseMessage.includes("sakit") || lowerCaseMessage.includes("tidak enak badan") || lowerCaseMessage.includes("mual")) {
        response += " " + emojiMap.sick[Math.floor(Math.random() * emojiMap.sick.length)];
    }

    return response;
}

module.exports = async (ptz, m) => {
    try {
        const body = (
            (m.mtype === 'conversation' && m.message.conversation) ||
            (m.mtype === 'imageMessage' && m.message.imageMessage.caption) ||
            (m.mtype === 'documentMessage' && m.message.documentMessage.caption) ||
            (m.mtype === 'videoMessage' && m.message.videoMessage.caption) ||
            (m.mtype === 'extendedTextMessage' && m.message.extendedTextMessage.text) ||
            (m.mtype === 'buttonsResponseMessage' && m.message.buttonsResponseMessage.selectedButtonId) ||
            (m.mtype === 'templateButtonReplyMessage' && m.message.templateButtonReplyMessage.selectedId)
        ) ? (
            (m.mtype === 'conversation' && m.message.conversation) ||
            (m.mtype === 'imageMessage' && m.message.imageMessage.caption) ||
            (m.mtype === 'documentMessage' && m.message.documentMessage.caption) ||
            (m.mtype === 'videoMessage' && m.message.videoMessage.caption) ||
            (m.mtype === 'extendedTextMessage' && m.message.extendedTextMessage.text) ||
            (m.mtype === 'buttonsResponseMessage' && m.message.buttonsResponseMessage.selectedButtonId) ||
            (m.mtype === 'templateButtonReplyMessage' && m.message.templateButtonReplyMessage.selectedId)
        ) : '';
        
        if (body) {
            console.log('[Message] From User:', body);
            conversationCount++;
            
            let response = await getMessage(body, 'id');
            if (body.toLowerCase().includes("owner") || body.toLowerCase().includes("developer")) {
                response = "*Vynaa Valerie* adalah owner dan developer saya. Ini Instagram-nya: https://instagram.com/vynaa_valerie";
            } else if (body.toLowerCase().includes("source code") || body.toLowerCase().includes("sc")) {
                response = "Source code saya ada di GitHub: https://github.com/VynaaValerie";
            } else if (body.toLowerCase().includes("hai") || body.toLowerCase().includes("kamu siapa")) {
                response = "Hallo selamat datang di dunia percakapan yang penuh warna dengan saya, Bot SimSimi! Saya adalah teman virtual Anda yang siap mengisi waktu luang Anda dengan obrolan yang seru dan menghibur. Dibuat khusus oleh *Vynaa Valerie* untuk memberikan pengalaman percakapan yang menyenangkan, saya hadir untuk menjelajahi topik apa pun yang ingin Anda diskusikan. Dari cerita lucu hingga pembicaraan serius, saya siap untuk menjadi pendengar setia dan teman setia Anda dalam dunia virtual ini. Mari mulai petualangan percakapan kita dan temukan keajaiban kata-kata bersama!";
            }
            response = addEmotion(response, body);
            if ([10, 40, 60, 80, 130, 200].includes(conversationCount)) {
                response += "\n\nSudah beberapa kali kita ngobrol nih! Yuk join ke saluran WhatsApp kami untuk info lebih lanjut tentang bot SimSimi: https://whatsapp.com/channel/0029VaHPYh6LNSa81M9Xcq1K";
            }

            console.log('[Message] From Simi:', response);
            await ptz.sendText(m.key.remoteJid, response);
        }

    } catch (err) {
        console.error('Error:', util.format(err));
    }
}

let file = require.resolve(__filename);
fs.watchFile(file, () => {
    fs.unwatchFile(file);
    console.log(`Update ${__filename}`);
    delete require.cache[file];
    require(file);
});
