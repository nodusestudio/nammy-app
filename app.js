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

// 📊 Base de Datos Extendida de Aliados por Categoría
const aliados = {
    'restaurantes': [
        {
            id: 1,
            nombre: 'Roal Burger',
            titulo: 'Hamburguesa Doble Carne Premium',
            categoria: 'Hamburguesas Gourmet',
            precio: '$32.900',
            likes: 456,
            imagen: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=320&h=320&fit=crop',
            descripcion: 'La hamburguesa más jugosa con doble carne premium'
        },
        {
            id: 2,
            nombre: 'Pizza Nonna Italiana',
            titulo: 'Pizza Quattro Stagioni Artesanal',
            categoria: 'Pizza Italiana',
            precio: '$45.500',
            likes: 389,
            imagen: 'https://images.unsplash.com/photo-1513104890138-7c749659a591?w=320&h=320&fit=crop',
            descripcion: 'Pizza artesanal con ingredientes frescos'
        },
        {
            id: 3,
            nombre: 'Sushi Tokyo Express',
            titulo: 'Rolls Especiales Salmón',
            categoria: 'Comida Japonesa',
            precio: '$38.800',
            likes: 234,
            imagen: 'https://images.unsplash.com/photo-1579584425555-c3ce17fd4351?w=320&h=320&fit=crop',
            descripcion: 'Sushi fresco preparado por maestros japoneses'
        },
        {
            id: 4,
            nombre: 'Tacos El Azteca',
            titulo: 'Tacos al Pastor Tradicionales',
            categoria: 'Comida Mexicana',
            precio: '$21.500',
            likes: 367,
            imagen: 'https://images.unsplash.com/photo-1551504734-5ee1c4a1479b?w=320&h=320&fit=crop',
            descripcion: 'Auténticos tacos mexicanos con carne al trompo'
        },
        {
            id: 5,
            nombre: 'Arepas Doña María',
            titulo: 'Arepa Rellena Mixta',
            categoria: 'Comida Colombiana',
            precio: '$18.900',
            likes: 298,
            imagen: 'https://images.unsplash.com/photo-1626645738196-c2a7c87a8f58?w=320&h=320&fit=crop',
            descripcion: 'Arepas tradicionales con relleno casero'
        },
        {
            id: 6,
            nombre: 'Healthy Bowl Station',
            titulo: 'Bowl Açaí Energético',
            categoria: 'Comida Saludable',
            precio: '$26.300',
            likes: 187,
            imagen: 'https://images.unsplash.com/photo-1511690743698-d9d85f2fbf38?w=320&h=320&fit=crop',
            descripcion: 'Bowl nutritivo con açaí y superalimentos'
        },
        {
            id: 7,
            nombre: 'Parrilla Don Carlos',
            titulo: 'Bandeja Paisa Completa',
            categoria: 'Comida Tradicional',
            precio: '$35.000',
            likes: 445,
            imagen: 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=320&h=320&fit=crop',
            descripcion: 'La bandeja paisa más completa de la ciudad'
        },
        {
            id: 8,
            nombre: 'Café Barista Premium',
            titulo: 'Cappuccino Artesanal',
            categoria: 'Café Especialidad',
            precio: '$12.500',
            likes: 156,
            imagen: 'https://images.unsplash.com/photo-1541167760496-1628856ab772?w=320&h=320&fit=crop',
            descripcion: 'Café premium preparado por baristas expertos'
        },
        {
            id: 9,
            nombre: 'Panadería El Trigo Dorado',
            titulo: 'Croissant Francés Relleno',
            categoria: 'Panadería Francesa',
            precio: '$8.900',
            likes: 203,
            imagen: 'https://images.unsplash.com/photo-1555507036-ab794f17fe58?w=320&h=320&fit=crop',
            descripcion: 'Croissants horneados diariamente'
        },
        {
            id: 10,
            nombre: 'Mariscos La Costa',
            titulo: 'Ceviche Peruano Premium',
            categoria: 'Mariscos Frescos',
            precio: '$42.000',
            likes: 334,
            imagen: 'https://images.unsplash.com/photo-1579952363873-27d3bfad9c0?w=320&h=320&fit=crop',
            descripcion: 'Ceviche fresco con pescado del día'
        }
    ],
    'farmacias': [
        {
            id: 11,
            nombre: 'Droguería Salud Vital',
            titulo: 'Kit Vitaminas Completo',
            categoria: 'Suplementos Vitamínicos',
            precio: '$45.600',
            likes: 89,
            imagen: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=320&h=320&fit=crop',
            descripcion: 'Complejo vitamínico para toda la familia'
        },
        {
            id: 12,
            nombre: 'Farmacia San Rafael',
            titulo: 'Botiquín de Primeros Auxilios',
            categoria: 'Emergencias Médicas',
            precio: '$32.400',
            likes: 145,
            imagen: 'https://images.unsplash.com/photo-1576671081837-49000212a370?w=320&h=320&fit=crop',
            descripcion: 'Kit completo para emergencias del hogar'
        },
        {
            id: 13,
            nombre: 'Droguería Moderna',
            titulo: 'Suero Hidratante Facial',
            categoria: 'Cuidado Personal',
            precio: '$28.900',
            likes: 234,
            imagen: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=320&h=320&fit=crop',
            descripcion: 'Hidratación profunda para todo tipo de piel'
        },
        {
            id: 14,
            nombre: 'Farmacia del Centro',
            titulo: 'Termómetro Digital',
            categoria: 'Equipos Médicos',
            precio: '$18.500',
            likes: 167,
            imagen: 'https://images.unsplash.com/photo-1559757175-0eb30cd8c063?w=320&h=320&fit=crop',
            descripcion: 'Medición precisa y rápida de temperatura'
        },
        {
            id: 15,
            nombre: 'Droguería La Salud',
            titulo: 'Proteína en Polvo Premium',
            categoria: 'Nutrición Deportiva',
            precio: '$89.900',
            likes: 78,
            imagen: 'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=320&h=320&fit=crop',
            descripción: 'Proteína de alta calidad para deportistas'
        },
        {
            id: 16,
            nombre: 'Farmacia Integral',
            titulo: 'Kit Cuidado Dental',
            categoria: 'Higiene Bucal',
            precio: '$24.700',
            likes: 198,
            imagen: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?w=320&h=320&fit=crop',
            descripcion: 'Cepillo eléctrico + pasta dental premium'
        },
        {
            id: 17,
            nombre: 'Droguería Bienestar',
            titulo: 'Crema Anti-Edad Avanzada',
            categoria: 'Cosmética Farmacéutica',
            precio: '$67.500',
            likes: 287,
            imagen: 'https://images.unsplash.com/photo-1596755389378-c31d21fd1273?w=320&h=320&fit=crop',
            descripcion: 'Tratamiento anti-edad con tecnología avanzada'
        },
        {
            id: 18,
            nombre: 'Farmacia Confianza',
            titulo: 'Tensiómetro Automático',
            categoria: 'Monitoreo Salud',
            precio: '$125.000',
            likes: 156,
            imagen: 'https://images.unsplash.com/photo-1559757165-e6332136b5e5?w=320&h=320&fit=crop',
            descripcion: 'Control preciso de presión arterial'
        },
        {
            id: 19,
            nombre: 'Droguería Familiar',
            titulo: 'Kit Medicamentos Básicos',
            categoria: 'Medicina General',
            precio: '$38.600',
            likes: 203,
            imagen: 'https://images.unsplash.com/photo-1550572017-edd951aa8f72?w=320&h=320&fit=crop',
            descripcion: 'Medicamentos esenciales para el hogar'
        },
        {
            id: 20,
            nombre: 'Farmacia Cruz Verde Plus',
            titulo: 'Glucómetro Digital',
            categoria: 'Control Diabético',
            precio: '$95.400',
            likes: 134,
            imagen: 'https://images.unsplash.com/photo-1576091160399-112ba8d25d1f?w=320&h=320&fit=crop',
            descripcion: 'Medición precisa de glucosa en sangre'
        }
    ],
    'tiendas': [
        {
            id: 21,
            nombre: 'Supermercado Verde Natural',
            titulo: 'Canasta Orgánica Semanal',
            categoria: 'Alimentos Orgánicos',
            precio: '$85.900',
            likes: 267,
            imagen: 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=320&h=320&fit=crop',
            descripcion: 'Frutas y verduras orgánicas frescas'
        },
        {
            id: 22,
            nombre: 'Tienda Tech Solutions',
            titulo: 'Auriculares Bluetooth Premium',
            categoria: 'Tecnología Audio',
            precio: '$189.900',
            likes: 345,
            imagen: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=320&h=320&fit=crop',
            descripcion: 'Audio de alta calidad con cancelación de ruido'
        },
        {
            id: 23,
            nombre: 'Moda Urbana Store',
            titulo: 'Camiseta Algodón Premium',
            categoria: 'Ropa Casual',
            precio: '$45.500',
            likes: 198,
            imagen: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=320&h=320&fit=crop',
            descripcion: '100% algodón, diseños únicos y modernos'
        },
        {
            id: 24,
            nombre: 'Librería El Saber',
            titulo: 'Pack Libros Bestsellers',
            categoria: 'Literatura Moderna',
            precio: '$125.000',
            likes: 178,
            imagen: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=320&h=320&fit=crop',
            descripcion: 'Los 5 libros más vendidos del año'
        },
        {
            id: 25,
            nombre: 'Deportes Activos',
            titulo: 'Kit Entrenamiento Completo',
            categoria: 'Fitness Equipment',
            precio: '$234.900',
            likes: 289,
            imagen: 'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=320&h=320&fit=crop',
            descripcion: 'Todo lo necesario para entrenar en casa'
        },
        {
            id: 26,
            nombre: 'Hogar & Decoración',
            titulo: 'Set Plantas Purificadoras',
            categoria: 'Decoración Verde',
            precio: '$67.500',
            likes: 234,
            imagen: 'https://images.unsplash.com/photo-1463320726281-696a485928c7?w=320&h=320&fit=crop',
            descripcion: 'Plantas que purifican el aire de tu hogar'
        },
        {
            id: 27,
            nombre: 'Electro Mundo',
            titulo: 'Licuadora Multifuncional',
            categoria: 'Electrodomésticos',
            precio: '$156.900',
            likes: 156,
            imagen: 'https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=320&h=320&fit=crop',
            descripcion: 'Potente licuadora para smoothies y más'
        },
        {
            id: 28,
            nombre: 'Mascotas Felices',
            titulo: 'Kit Cuidado Canino',
            categoria: 'Cuidado Mascotas',
            precio: '$89.400',
            likes: 267,
            imagen: 'https://images.unsplash.com/photo-1601758228041-f3b2795255f1?w=320&h=320&fit=crop',
            descripcion: 'Todo para el cuidado e higiene de tu perro'
        },
        {
            id: 29,
            nombre: 'Belleza Total',
            titulo: 'Kit Maquillaje Profesional',
            categoria: 'Cosméticos Premium',
            precio: '$198.500',
            likes: 378,
            imagen: 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=320&h=320&fit=crop',
            descripcion: 'Set completo para maquillaje profesional'
        },
        {
            id: 30,
            nombre: 'Juguetes & Diversión',
            titulo: 'Set Juegos Educativos',
            categoria: 'Juguetes Didácticos',
            precio: '$75.600',
            likes: 145,
            imagen: 'https://images.unsplash.com/photo-1558060370-d644479cb6f7?w=320&h=320&fit=crop',
            descripcion: 'Juguetes que estimulan el aprendizaje'
        }
    ],
    'para-ti': [] // Se llenará dinámicamente con productos destacados
};

// 🎨 Función para generar imágenes fallback por categoría
function getImagenFallback(categoria) {
    const fallbacks = {
        'restaurantes': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgdmlld0JveD0iMCAwIDMyMCAzMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMzIwIiBmaWxsPSIjRkZDMTA3Ii8+CjxjaXJjbGUgY3g9IjE2MCIgY3k9IjE2MCIgcj0iNDAiIGZpbGw9IiNGRjhBMDAiLz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeD0iMTQwIiB5PSIxNDAiIHN0cm9rZT0iI0ZGRjlGMiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgo8cGF0aCBkPSJtMTkgMy0xIDktNSA1LTQtMS0yIDItMyAzLTItNHoiLz4KPHBhdGggZD0ibTcgOS02IDZ2Mmg4di0yTDMgOWwzLTNaIi8+Cjwvc3ZnPgo8L3N2Zz4K',
        'farmacias': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgdmlld0JveD0iMCAwIDMyMCAzMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMzIwIiBmaWxsPSIjRkZDMTA3Ii8+CjxjaXJjbGUgY3g9IjE2MCIgY3k9IjE2MCIgcj0iNDAiIGZpbGw9IiNGRjhBMDAiLz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeD0iMTQwIiB5PSIxNDAiIHN0cm9rZT0iI0ZGRjlGMiIgc3Ryb2tlLXdpZHRoPSIzIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgo8cGF0aCBkPSJtOCA4aDgiLz4KPHN0cm9rZSBkPSJtMTIgNHY4Ii8+Cjwvc3ZnPgo8L3N2Zz4K',
        'tiendas': 'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgdmlld0JveD0iMCAwIDMyMCAzMjAiIGZpbGw9Im5vbmUiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyI+CjxyZWN0IHdpZHRoPSIzMjAiIGhlaWdodD0iMzIwIiBmaWxsPSIjRkZDMTA3Ii8+CjxjaXJjbGUgY3g9IjE2MCIgY3k9IjE2MCIgcj0iNDAiIGZpbGw9IiNGRjhBMDAiLz4KPHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeD0iMTQwIiB5PSIxNDAiIHN0cm9rZT0iI0ZGRjlGMiIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiPgo8cGF0aCBkPSJtNSAxMSA0LTciLz4KPHN0cm9rZSBkPSJtMTkgMTEtNC03Ii8+CjxwYXRoIGQ9Ik0yIDExaDIwdi05SDJ2OXoiLz4KPHN0cm9rZSBkPSJtNyAyMWgtNGwtMSA5aDEzdi05eiIvPgo8L3N2Zz4K'
    };
    return fallbacks[categoria] || fallbacks['tiendas'];
}

// 🔄 Función global para manejar errores de carga de imágenes
function handleImageError(img, categoria) {
    img.src = getImagenFallback(categoria);
    img.onerror = null; // Prevenir bucles infinitos
    console.log(`🖼️ Imagen fallback aplicada para categoría: ${categoria}`);
}

// 🎯 Generar productos destacados para "Para Ti" 
function generarParaTi() {
    const destacados = [
        ...aliados.restaurantes.slice(0, 3),
        ...aliados.farmacias.slice(0, 2), 
        ...aliados.tiendas.slice(0, 3)
    ];
    return destacados.sort(() => Math.random() - 0.5); // Mezclar aleatoriamente
}

// 🗂️ Datos del feed estructurados por aliados
const feedData = {
    'para-ti': generarParaTi(),
    'restaurantes': aliados.restaurantes,
    'farmacias': aliados.farmacias,
    'tiendas': aliados.tiendas
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
    
    // Determinar categoría para fallback de imagen
    const categoria = currentCategory === 'para-ti' ? 
        (item.categoria?.toLowerCase().includes('comida') || item.categoria?.toLowerCase().includes('hambur') || item.categoria?.toLowerCase().includes('pizza') ? 'restaurantes' : 
         item.categoria?.toLowerCase().includes('salud') || item.categoria?.toLowerCase().includes('vitamin') ? 'farmacias' : 'tiendas') : 
        currentCategory;
    
    return `
        <div class="product-card overflow-hidden relative w-full" style="background-color: #FFF9F2;">
            <!-- Heart Button -->
            <button class="floating-heart rounded-2xl p-2 hover:bg-white hover:bg-opacity-80 transition-colors like-btn" data-id="${item.id}">
                <i data-lucide="heart" class="w-4 h-4 ${heartClass}"></i>
            </button>
            
            <!-- Image Container cuadrado 1:1 -->
            <div class="relative overflow-hidden bg-gray-100 rounded-t-2xl" style="aspect-ratio: 1/1;">
                <img 
                    src="${item.imagen || item.image}" 
                    alt="${item.titulo || item.title}"
                    class="w-full h-full object-cover"
                    loading="lazy"
                    onerror="handleImageError(this, '${categoria}')"
                >
                
                <!-- Price Tag -->
                <div class="absolute bottom-2 left-2 bg-black bg-opacity-70 backdrop-blur-sm text-white px-2 py-1 rounded-full text-xs font-semibold">
                    ${item.precio || item.price}
                </div>
            </div>
            
            <!-- Card Content -->
            <div class="card-content">
                <!-- Título del producto -->
                <h3 class="card-title">${item.titulo || item.title}</h3>
                
                <!-- Nombre del Negocio Aliado - Prominente -->
                <p style="font-size: 14px; color: #FF8A00; font-weight: 700; margin: 4px 0 6px 0; text-transform: uppercase;">
                    ${item.nombre || item.business}
                </p>
                
                <!-- Categoría -->
                <p class="card-subtitle" style="font-size: 11px; margin-bottom: 8px;">
                    ${item.categoria || item.category}
                </p>
                
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
        const titulo = item.titulo || item.title;
        const nombre = item.nombre || item.business;
        const precio = item.precio || item.price;
        
        const message = `¡Hola! Me interesa: *${titulo}* de ${nombre} por ${precio}. ¿Está disponible? 🍕`;
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
        console.log(`🛒 Producto solicitado: ${titulo} de ${nombre}`);
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