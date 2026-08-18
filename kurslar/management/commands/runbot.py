import os
import re
import telebot
import sqlite3
from django.core.management.base import BaseCommand
from django.conf import settings

# Initialize SQLite for Telegram users
def init_db():
    conn = sqlite3.connect('telegram_bot_users.sqlite3')
    cursor = conn.cursor()
    cursor.execute('''
        CREATE TABLE IF NOT EXISTS users (
            chat_id INTEGER PRIMARY KEY
        )
    ''')
    conn.commit()
    conn.close()

def save_user(chat_id):
    conn = sqlite3.connect('telegram_bot_users.sqlite3')
    cursor = conn.cursor()
    try:
        cursor.execute('INSERT INTO users (chat_id) VALUES (?)', (chat_id,))
        conn.commit()
    except sqlite3.IntegrityError:
        pass
    finally:
        conn.close()

def get_all_users():
    conn = sqlite3.connect('telegram_bot_users.sqlite3')
    cursor = conn.cursor()
    cursor.execute('SELECT chat_id FROM users')
    users = [row[0] for row in cursor.fetchall()]
    conn.close()
    return users

class Command(BaseCommand):
    help = 'Starts the Telegram Bot for Q&A feedback'

    def handle(self, *args, **options):
        init_db()
        bot_token = os.environ.get('TELEGRAM_BOT_TOKEN')
        admin_id_str = os.environ.get('ADMIN_TELEGRAM_ID')

        if not bot_token or not admin_id_str:
            self.stdout.write(self.style.ERROR("TELEGRAM_BOT_TOKEN and ADMIN_TELEGRAM_ID must be set in .env"))
            return

        admin_id = int(admin_id_str)
        bot = telebot.TeleBot(bot_token)

        self.stdout.write(self.style.SUCCESS(f"Starting bot... Admin ID: {admin_id}"))

        @bot.message_handler(commands=['start', 'help'])
        def send_welcome(message):
            save_user(message.chat.id)
            if message.chat.id == admin_id:
                bot.reply_to(message, "Assalomu alaykum, Admin! Sizga kelgan savollarga shu yerda 'Reply' (Javob berish) orqali javob qaytarishingiz mumkin. Yoki hammaga bittada xabar yuborish (Broadcast) uchun shunchaki xabar yozing (hech qaysi xabarga reply qilmasdan).")
            else:
                bot.reply_to(message, "Assalomu alaykum! Savolingizni yozib qoldiring, adminlarimiz tez orada javob berishadi.")

        @bot.message_handler(func=lambda message: message.chat.id != admin_id, content_types=['text', 'photo', 'document', 'video', 'audio', 'voice'])
        def handle_user_message(message):
            save_user(message.chat.id)
            # Foydalanuvchidan kelgan xabarni adminga yuborish
            header = f"💬 Yangi xabar!\n(ID: {message.chat.id})\nFoydalanuvchi: {message.from_user.first_name} {message.from_user.last_name or ''} (@{message.from_user.username or 'yoq'})\n\n"
            
            try:
                if message.content_type == 'text':
                    bot.send_message(admin_id, header + message.text)
                elif message.content_type == 'photo':
                    bot.send_photo(admin_id, message.photo[-1].file_id, caption=header + (message.caption or ''))
                elif message.content_type == 'document':
                    bot.send_document(admin_id, message.document.file_id, caption=header + (message.caption or ''))
                else:
                    bot.send_message(admin_id, header + f"[{message.content_type} formatidagi xabar jo'natildi. Buni korish uchun forward_message qila olamiz, lekin hozircha nusxasi.]")
                
                bot.reply_to(message, "Xabaringiz adminga yuborildi. Javobni shu yerda kutib oling.")
            except Exception as e:
                self.stdout.write(self.style.ERROR(f"Xatolik adminga yuborishda: {e}"))

        @bot.message_handler(func=lambda message: message.chat.id == admin_id, content_types=['text', 'photo', 'video', 'document', 'audio', 'voice'])
        def handle_admin_reply(message):
            # Admin xabarga reply qilgan bo'lsa
            if message.reply_to_message and message.reply_to_message.text:
                original_text = message.reply_to_message.text
                
                # ID ni ajratib olamiz
                match = re.search(r"\(ID: (\d+)\)", original_text)
                if match:
                    user_id = int(match.group(1))
                    try:
                        bot.copy_message(user_id, message.chat.id, message.message_id)
                        bot.reply_to(message, "Javobingiz foydalanuvchiga yuborildi! ✅")
                    except Exception as e:
                        bot.reply_to(message, f"Xatolik yuz berdi (Foydalanuvchi botni bloklagan bo'lishi mumkin): {e}")
                else:
                    bot.reply_to(message, "Bu xabarda foydalanuvchi ID si topilmadi. Faqat '(ID: ...)' yozuvi bor xabarlarga reply qiling.")
            else:
                # Agar admin reply qilmasdan xabar yozsa -> Hammaga bittada yuborish (Broadcast)
                users = get_all_users()
                success = 0
                for uid in users:
                    if uid == admin_id:
                        continue
                    try:
                        bot.copy_message(uid, message.chat.id, message.message_id)
                        success += 1
                    except:
                        pass
                bot.reply_to(message, f"✅ Xabaringiz jami {success} ta foydalanuvchiga muvaffaqiyatli yetkazildi!")

        # Start polling
        bot.infinity_polling()
