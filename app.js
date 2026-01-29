// 🎯 Ñammy - Food & Business Social Discovery PWA
// Arquitectura optimizada con Service Worker Network First

// 🔧 Estado global de la aplicación
class AppState {
    constructor() {
        this.likedItems = new Set();
        this.currentCategory = 'para-ti';
        this.isInitialized = false;
        this.loadState();
    }

    // Persistencia en localStorage
    saveState() {
        try {
            localStorage.setItem('nammy-state', JSON.stringify({
                likedItems: Array.from(this.likedItems),
                currentCategory: this.currentCategory
            }));
        } catch (error) {
            console.warn('⚠️ No se pudo guardar estado:', error);
        }
    }

    loadState() {
        try {
            const saved = localStorage.getItem('nammy-state');
            if (saved) {
                const state = JSON.parse(saved);
                this.likedItems = new Set(state.likedItems || []);
                this.currentCategory = state.currentCategory || 'para-ti';
            }
        } catch (error) {
            console.warn('⚠️ No se pudo cargar estado:', error);
        }
    }

    // Toggle like con persistencia
    toggleLike(itemId) {
        if (this.likedItems.has(itemId)) {
            this.likedItems.delete(itemId);
        } else {
            this.likedItems.add(itemId);
        }
        this.saveState();
    }
}

// 📊 Datos del feed con precios colombianos
const feedData = {
    'para-ti': [
        {
            id: 1,
            title: 'Hamburguesa Doble Carne Premium',
            business: 'Burger Palace',
            category: 'Comida Rápida',
            price: '$28.900',
            likes: 342,
            image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=400&h=500&fit=crop'
        },
        {
            id: 2,
            title: 'Pizza Quattro Stagioni Artesanal',
            business: 'Nonna Rosa',
            category: 'Italiana',
            price: '$42.500',
            likes: 256,
            image: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=400&h=500&fit=crop'
        },
        {
            id: 3,
            title: 'Sushi Roll Especial Salmón',
            business: 'Tokyo Express',
            category: 'Japonesa',
            price: '$35.800',
            likes: 189,
            image: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=400&h=500&fit=crop'
        },
        {
            id: 4,
            title: 'Tacos al Pastor Tradicionales',
            business: 'El Mexicano',
            category: 'Mexicana',
            price: '$18.500',
            likes: 298,
            image: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=400&h=500&fit=crop'
        },
        {
            id: 5,
            title: 'Arepa Rellena Mixta',
            business: 'Arepas La Abuela',
            category: 'Colombiana',
            price: '$15.900',
            likes: 156,
            image: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=400&h=500&fit=crop'
        },
        {
            id: 6,
            title: 'Bowl Açaí con Granola',
            business: 'Healthy Corner',
            category: 'Saludable',
            price: '$22.300',
            likes: 134,
            image: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=400&h=500&fit=crop'
        }
    ],
    'restaurantes': [
        {
            id: 7,
            title: 'Bandeja Paisa Completa',
            business: 'Típico Antioqueño',
            category: 'Tradicional',
            price: '$32.000',
            likes: 445,
            image: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=400&h=500&fit=crop'
        },
        {
            id: 8,
            title: 'Paella Valenciana para 2',
            business: 'España en Casa',
            category: 'Española',
            price: '$68.500',
            likes: 223,
            image: 'https://images.unsplash.com/photo-1534080564583-6be75777b70a?w=400&h=500&fit=crop'
        }
    ],
    'farmacias': [
        {
            id: 9,
            title: 'Kit Vitaminas + Minerales',
            business: 'Farmacias del Ahorro',
            category: 'Suplementos',
            price: '$45.600',
            likes: 89,
            image: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=400&h=500&fit=crop'
        }
    ],
    'tiendas': [
        {
            id: 10,
            title: 'Mercado Orgánico Semanal',
            business: 'Verde Natural',
            category: 'Orgánicos',
            price: '$38.900',
            likes: 167,
            image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=400&h=500&fit=crop'
        }
    ]
};

// 🌍 Variables globales para compatibilidad
let likedItems = new Set();
let currentCategory = 'para-ti';
const appState = new AppState();

// 🚀 Inicialización de la aplicación
async function initializeApp() {
    try {
        console.log('🔄 Inicializando Ñammy PWA...');
        
        // Sincronizar estado legacy
        likedItems = appState.likedItems;
        currentCategory = appState.currentCategory;
        
        // Setup de eventos
        setupEventListeners();
        
        // Renderizar feed inicial
        await renderFeed(currentCategory);
        
        // Marcar como inicializado
        appState.isInitialized = true;
        console.log('✅ App inicializada correctamente');
        
        // Performance monitoring
        if (window.performance) {
            const loadTime = Math.round(performance.now());
            console.log(`⚡ Tiempo de carga: ${loadTime}ms`);
        }
        
    } catch (error) {
        console.error('❌ Error inicializando app:', error);
        // Fallback: inicializar con datos mínimos
        setupEventListeners();
        renderFeed('para-ti');
    }
}

// 🎛️ Configuración de event listeners
function setupEventListeners() {
    // Navegación de categorías
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        tab.addEventListener('click', handleCategoryClick);
    });

    // WhatsApp FAB con mejor UX
    const whatsappFab = document.querySelector('.whatsapp-fab');
    if (whatsappFab) {
        whatsappFab.addEventListener('click', handleWhatsAppFab);
    }
    
    console.log('🔧 Event listeners configurados');
}

// Handler para clicks de categoría
function handleCategoryClick(event) {
    const category = event.target.dataset.category;
    if (category && category !== currentCategory) {
        switchCategory(category);
    }
}

// Cambiar categoría con animación
function switchCategory(category) {
    currentCategory = category;
    appState.currentCategory = category;
    appState.saveState();
    
    // Actualizar UI de tabs
    const categoryTabs = document.querySelectorAll('.category-tab');
    categoryTabs.forEach(tab => {
        if (tab.dataset.category === category) {
            tab.classList.add('active');
        } else {
            tab.classList.remove('active');
        }
    });
    
    // Renderizar nuevo feed
    renderFeed(category);
    console.log(`🔄 Categoría cambiada a: ${category}`);
}

// 🔄 Renderizado del feed con mejor performance
async function renderFeed(category) {
    const container = document.getElementById('feed-container');
    const items = feedData[category] || [];
    
    if (!container) {
        console.error('❌ Feed container no encontrado');
        return;
    }
    
    try {
        // Loading state
        container.innerHTML = '<div class="col-span-2 flex justify-center p-8"><div class="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div></div>';
        
        // Simular delay de carga (remover en producción con API real)
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Aplicar grid responsive al contenedor (usar CSS definido en style.css)
        container.className = ''; // Limpiar clases existentes
        
        // Generar HTML
        const htmlContent = items.map(item => createCardHTML(item)).join('');
        container.innerHTML = htmlContent;
        
        // Setup de eventos de las cards
        setupCardEventListeners();
        
        console.log(`🎨 Feed renderizado: ${items.length} items en categoría "${category}"`);
        
    } catch (error) {
        console.error('❌ Error renderizando feed:', error);
        container.innerHTML = '<div class="col-span-2 p-8 text-center text-red-500">Error cargando contenido</div>';
    }
}

function createCardHTML(item) {
    const isLiked = likedItems.has(item.id);
    const heartClass = isLiked ? 'heart-liked' : 'heart-unliked';
    
    return `
        <div class="product-card overflow-hidden relative w-full" style="background-color: #FFF9F2;">
            <!-- Heart Button -->
            <button class="floating-heart rounded-2xl p-2 hover:bg-white hover:bg-opacity-80 transition-colors like-btn" data-id="${item.id}">
                <i data-lucide="heart" class="w-4 h-4 ${heartClass}"></i>
            </button>
            
            <!-- Image Container con aspect ratio 4:5 -->
            <div class="relative overflow-hidden bg-gray-100 rounded-t-2xl" style="aspect-ratio: 4/5;">
                <img 
                    src="${item.image}" 
                    alt="${item.title}"
                    class="w-full h-full object-cover"
                    loading="lazy"
                    onerror="this.src='https://via.placeholder.com/320x400/f3f4f6/9ca3af?text=Imagen+no+disponible'"
                >
                
                <!-- Price Tag -->
                <div class="absolute bottom-2 left-2 bg-black bg-opacity-70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-semibold">
                    ${item.price}
                </div>
            </div>
            
            <!-- Card Content -->
            <div class="card-content">
                <!-- Título -->
                <h3 class="card-title">${item.title}</h3>
                
                <!-- Negocio y Categoría -->
                <p class="card-subtitle">${item.business} • ${item.category}</p>
                
                <!-- Like Counter -->
                <div class="flex items-center justify-between mb-2">
                    <div class="flex items-center space-x-1">
                        <i data-lucide="heart" class="w-3 h-3" style="color: #FF8A00;"></i>
                        <span class="like-count font-semibold text-xs" style="color: #2D2D2D;" data-id="${item.id}">${item.likes + (isLiked ? 1 : 0)}</span>
                    </div>
                </div>
                
                <!-- Action Button -->
                <button class="want-btn pulse-subtle" data-id="${item.id}">
                    ¡Lo quiero! 🤤
                </button>
            </div>
        </div>
    `;
}

function setupCardEventListeners() {
    // Event delegation para botones de like
    document.addEventListener('click', (e) => {
        if (e.target.closest('.like-btn')) {
            const btn = e.target.closest('.like-btn');
            const itemId = parseInt(btn.dataset.id);
            handleLike(itemId);
        }
        
        if (e.target.closest('.want-btn')) {
            const btn = e.target.closest('.want-btn');
            const itemId = parseInt(btn.dataset.id);
            handleWantAction(itemId);
        }
    });
    
    // Re-inicializar iconos de Lucide
    if (typeof lucide !== 'undefined' && lucide.createIcons) {
        lucide.createIcons();
    }
}

// 💖 Manejar likes con animación
function handleLike(itemId) {
    appState.toggleLike(itemId);
    likedItems = appState.likedItems; // Sincronizar
    
    // Actualizar UI
    const heartIcon = document.querySelector(`.like-btn[data-id="${itemId}"] i`);
    const likeCount = document.querySelector(`.like-count[data-id="${itemId}"]`);
    
    if (heartIcon && likeCount) {
        const isLiked = likedItems.has(itemId);
        const item = Object.values(feedData).flat().find(item => item.id === itemId);
        
        if (item) {
            heartIcon.className = `w-4 h-4 ${isLiked ? 'heart-liked' : 'heart-unliked'}`;
            likeCount.textContent = item.likes + (isLiked ? 1 : 0);
            
            // Animación de feedback
            heartIcon.style.transform = 'scale(1.2)';
            setTimeout(() => {
                heartIcon.style.transform = 'scale(1)';
            }, 150);
        }
    }
    
    console.log(`💖 Item ${itemId} ${likedItems.has(itemId) ? 'liked' : 'unliked'}`);
}

// 🛒 Manejar acción "Lo quiero"
function handleWantAction(itemId) {
    const item = Object.values(feedData).flat().find(item => item.id === itemId);
    
    if (item) {
        const message = `¡Hola! Me interesa: *${item.title}* de ${item.business} por ${item.price}. ¿Está disponible? 🍕`;
        const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
        
        // Feedback visual
        const btn = document.querySelector(`.want-btn[data-id="${itemId}"]`);
        if (btn) {
            const originalText = btn.textContent;
            btn.textContent = '¡Enviando! 📱';
            btn.disabled = true;
            
            setTimeout(() => {
                btn.textContent = originalText;
                btn.disabled = false;
            }, 2000);
        }
        
        // Abrir WhatsApp
        window.open(whatsappUrl, '_blank');
        console.log(`🛒 Producto solicitado: ${item.title}`);
    }
}

// 💬 Manejar WhatsApp FAB
function handleWhatsAppFab() {
    const message = "¡Hola! Estoy navegando en Ñammy y me gustaría conocer más sobre sus servicios 🍕✨";
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
    console.log('💬 WhatsApp FAB activado');
}

// 🔄 Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

// 🌟 Exportar funciones para uso global (si es necesario)
window.NammyApp = {
    initializeApp,
    switchCategory,
    handleLike,
    handleWantAction,
    appState
};