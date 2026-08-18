import telebot
import sqlite3

TOKEN = 'SIZNING_BOT_TOKENINGIZNI_SHU_YERGA_YOZING'
ADMIN_ID = 'SIZNING_TELEGRAM_ID_RAQAMINGIZNI_SHU_YERGA_YOZING' # Misol uchun: 123456789

bot = telebot.TeleBot(TOKEN)

# Ma'lumotlar bazasini yaratish
def init_db():
    conn = sqlite3.connect('bot_users.db')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            chat_id INTEGER PRIMARY KEY
        )
    ''')
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS messages (
            admin_msg_id INTEGER PRIMARY KEY,
            user_id INTEGER
        )
    ''')
    conn.commit()
    conn.close()

def save_user(chat_id):
    conn = sqlite3.connect('bot_users.db')
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT INTO users (chat_id) VALUES (?)', (chat_id,))
        conn.commit()
    except sqlite3.IntegrityError:
        pass
    finally:
        conn.close()

def get_all_users():
    conn = sqlite3.connect('bot_users.db')
    cursor = conn.cursor()
    cursor.execute('SELECT chat_id FROM users')
    users = [row[0] for row in cursor.fetchall()]
    conn.close()
    return users

def save_message_mapping(admin_msg_id, user_id):
    conn = sqlite3.connect('bot_users.db')
    cursor = conn.cursor()
    cursor.execute('INSERT OR REPLACE INTO messages (admin_msg_id, user_id) VALUES (?, ?)', (admin_msg_id, user_id))
    conn.commit()
    conn.close()

def get_user_id_from_mapping(admin_msg_id):
    conn = sqlite3.connect('bot_users.db')
    cursor = conn.cursor()
    try:
        cursor.execute('SELECT user_id FROM messages WHERE admin_msg_id = ?', (admin_msg_id,))
        res = cursor.fetchone()
        return res[0] if res else None
    except:
        return None
    finally:
        conn.close()

@bot.message_handler(commands=['start'])
def send_welcome(message):
    save_user(message.chat.id)
    bot.reply_to(message, "Assalomu alaykum! Kurslarimiz haqida savollaringiz bo'lsa bemalol yozishingiz mumkin. Tez orada javob beramiz.")

@bot.message_handler(func=lambda message: True, content_types=['text', 'photo', 'video', 'document', 'audio', 'voice'])
def handle_all_messages(message):
    # Agar admin yozayotgan bo'lsa
    if str(message.chat.id) == ADMIN_ID:
        # Admin qaysidir xabarga "Reply" qilib yozayotgan bo'lsa
        if message.reply_to_message:
            user_id = get_user_id_from_mapping(message.reply_to_message.message_id)
            if user_id:
                try:
                    bot.copy_message(user_id, message.chat.id, message.message_id)
                except Exception as e:
                    bot.reply_to(message, "Xabar yetkazilmadi. Foydalanuvchi botni bloklagan bo'lishi mumkin.")
            else:
                bot.reply_to(message, "Bu xabar qaysi foydalanuvchiga tegishli ekanligini topa olmadim.")
        else:
            # Reply qilmasdan yozsa -> Hammaga (Broadcast) yuboriladi
            users = get_all_users()
            success = 0
            for uid in users:
                if str(uid) == ADMIN_ID:
                    continue
                try:
                    bot.copy_message(uid, message.chat.id, message.message_id)
                    success += 1
                except:
                    pass
            bot.reply_to(message, f"✅ Xabar barcha {success} ta foydalanuvchiga yuborildi!")
    
    else:
        # Oddiy foydalanuvchi yozyapti -> Adminga yo'naltiramiz
        save_user(message.chat.id)
        try:
            # Xabarni adminga yuborib, xabar ID sini saqlab qo'yamiz (Admin keyin reply qila olishi uchun)
            msg = bot.forward_message(ADMIN_ID, message.chat.id, message.message_id)
            save_message_mapping(msg.message_id, message.chat.id)
        except Exception as e:
            pass

if __name__ == '__main__':
    init_db()
    print("Bot ishga tushdi...")
    bot.infinity_polling()
