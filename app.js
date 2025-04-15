class DietCoachApp {
    constructor() {
        // Инициализация свойств
        this.currentUser = {
            id: 'web_' + Math.random().toString(36).substring(2, 9),
            name: 'Гость',
            isTelegram: false
        };
        this.supabase = null;
        this.weightChart = null;
        
        // Привязка методов к контексту
        this.loadChatMessages = this.loadChatMessages.bind(this);
        this.showError = this.showError.bind(this);
        
        // Инициализация элементов
        this.initElements();
        this.setupEventListeners();
        this.initApp();
        
        // Изменение названия на ДОК.ЛИЗА
        this.updateAppTitle();
    }

    // Добавляем недостающие методы
    loadChatMessages = async () => {
        try {
            if (!this.supabase) throw new Error('Supabase не инициализирован');
            if (!this.chatMessages) return;
            
            const { data, error } = await this.supabase
                .from('messages')
                .select('*')
                .order('created_at', { ascending: true });
            
            if (error) throw error;
            
            this.chatMessages.innerHTML = data.map(msg => 
                `<div class="message">
                    <strong>${msg.sender}:</strong> ${msg.text}
                </div>`
            ).join('');
        } catch (error) {
            console.error('Ошибка загрузки сообщений:', error);
            throw error;
        }
    };

    showError = (message) => {
        console.error(message);
        // Можно добавить отображение ошибки в интерфейсе
        if (this.profileError) {
            this.profileError.textContent = message;
            this.profileError.style.display = 'block';
            setTimeout(() => {
                this.profileError.style.display = 'none';
            }, 5000);
        }
    };

    updateAppTitle = () => {
        // Изменяем заголовок приложения на ДОК.ЛИЗА
        const titleElements = [
            document.querySelector('header h1'),
            document.querySelector('.app-title'),
            document.title
        ];
        
        titleElements.forEach(el => {
            if (el) {
                if (el.textContent) {
                    el.textContent = el.textContent.replace('Diet Coach', 'ДОК.ЛИЗА');
                } else if (el.innerText) {
                    el.innerText = el.innerText.replace('Diet Coach', 'ДОК.ЛИЗА');
                }
            }
        });
        
        // Если title в head
        if (document.title.includes('Diet Coach')) {
            document.title = document.title.replace('Diet Coach', 'ДОК.ЛИЗА');
        }
    };

    // Остальные методы остаются без изменений
    initElements = () => {
        // ... существующий код ...
    };

    setupEventListeners = () => {
        // ... существующий код ...
    };

    initApp = async () => {
        try {
            await this.initSupabase();
            await this.checkTelegramUser();
            await this.loadUserData();
            await this.loadAdditionalData();
            console.log('Приложение инициализировано');
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showError('Ошибка загрузки приложения');
        }
    };

    loadAdditionalData = async () => {
        try {
            await this.loadChatMessages();
            // Другие операции загрузки данных
        } catch (error) {
            console.error('Ошибка загрузки дополнительных данных:', error);
            throw error;
        }
    };

    // ... остальные существующие методы ...
}

// Инициализация приложения
document.addEventListener('DOMContentLoaded', () => {
    new DietCoachApp();
});
