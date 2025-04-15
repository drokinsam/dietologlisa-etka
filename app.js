class DietCoachApp {
    constructor() {
        this.currentUser = {
            id: 'web_' + Math.random().toString(36).substring(2, 9),
            name: 'Гость',
            isTelegram: false
        };
        
        this.initElements();
        this.setupEventListeners();
        this.initApp();
    }

    async initApp() {
        try {
            // 1. Инициализация Supabase
            await this.initSupabase();
            
            // 2. Проверка пользователя Telegram
            await this.checkTelegramUser();
            
            // 3. Загрузка данных пользователя
            await this.loadUserData();
            
            // 4. Загрузка дополнительных данных
            await this.loadAdditionalData();
            
            console.log('Приложение успешно инициализировано');
        } catch (error) {
            console.error('Ошибка инициализации:', error);
            this.showError('Ошибка загрузки приложения');
        }
    }

    async initSupabase() {
        try {
            this.supabaseUrl = 'https://wdkbjwqxvbsovhpgrmff.supabase.co';
            this.supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Indka2Jqd3F4dmJzb3ZocGdybWZmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDQ3NTA3NDgsImV4cCI6MjA2MDMyNjc0OH0.pUpf0hMuLW6jsZ4NappfMbwQK3M8WpZtLpUY6f9gHRI';
            
            if (typeof supabase === 'undefined') {
                throw new Error('Библиотека Supabase не загружена');
            }
            
            this.supabase = supabase.createClient(this.supabaseUrl, this.supabaseKey);
            console.log('Supabase инициализирован');
        } catch (error) {
            console.error('Ошибка инициализации Supabase:', error);
            throw error;
        }
    }

    async checkTelegramUser() {
        try {
            const tgUser = window.Telegram?.WebApp?.initDataUnsafe?.user;
            if (tgUser) {
                this.currentUser = {
                    id: tgUser.id.toString(),
                    name: tgUser.first_name || 'Пользователь',
                    isTelegram: true
                };
                console.log('Обнаружен пользователь Telegram:', this.currentUser);
            }
        } catch (error) {
            console.error('Ошибка проверки пользователя Telegram:', error);
            throw error;
        }
    }

    async loadUserData() {
        try {
            console.log('Загрузка данных для пользователя:', this.currentUser.id);
            
            const { data, error } = await this.supabase
                .from('users')
                .select('*')
                .eq('telegram_id', this.currentUser.id)
                .maybeSingle();
            
            if (error) throw error;
            
            if (data) {
                this.currentUser = { ...this.currentUser, ...data };
                this.nameInput.value = data.name || '';
                this.weightInput.value = data.weight || '';
                this.heightInput.value = data.height || '';
                console.log('Данные пользователя загружены:', data);
            } else {
                console.log('Пользователь не найден, будет создан новый');
            }
        } catch (error) {
            console.error('Ошибка загрузки данных пользователя:', error);
            throw error;
        }
    }

    async loadAdditionalData() {
        try {
            await Promise.all([
                this.loadMeals(),
                this.loadChatMessages()
            ]);
            this.initWeightChart();
        } catch (error) {
            console.error('Ошибка загрузки дополнительных данных:', error);
            throw error;
        }
    }

    async loadMeals() {
        try {
            console.log('Загрузка дневника питания для:', this.currentUser.id);
            
            const { data, error } = await this.supabase
                .from('meals')
                .select('*')
                .eq('user_id', this.currentUser.id)
                .order('created_at', { ascending: false });
            
            if (error) throw error;
            
            this.renderMeals(data || []);
            console.log('Загружено записей питания:', data?.length || 0);
        } catch (error) {
            console.error('Ошибка загрузки дневника питания:', error);
            throw error;
        }
    }

    async loadChatMessages() {
        try {
            console.log('Загрузка сообщений чата для:', this.currentUser.id);
            
            const { data, error } = await this.supabase
                .from('messages')
                .select('*')
                .or(`sender_id.eq.${this.currentUser.id},receiver_id.eq.${this.currentUser.id}`)
                .order('created_at', { ascending: true });
            
            if (error) throw error;
            
            this.renderChatMessages(data || []);
            console.log('Загружено сообщений:', data?.length || 0);
        } catch (error) {
            console.error('Ошибка загрузки чата:', error);
            throw error;
        }
    }

    // Остальные методы (renderMeals, renderChatMessages, initWeightChart и т.д.) 
    // остаются без изменений, как в предыдущей версии
}

document.addEventListener('DOMContentLoaded', () => {
    new DietCoachApp();
});
