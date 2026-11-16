// ==========================================
// SPOTLIGHT EFFECT
// ==========================================
const spotlight = document.getElementById('spotlight');
if (spotlight) {
    document.addEventListener('mousemove', (e) => {
        spotlight.style.setProperty('--x', `${e.clientX}px`);
        spotlight.style.setProperty('--y', `${e.clientY}px`);
    });
}

// ==========================================
// REVEAL ANIMATIONS - ENHANCED
// ==========================================
function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .tilt-target');

    const checkInitialVisibility = () => {
        revealElements.forEach(el => {
            const rect = el.getBoundingClientRect();
            const windowHeight = window.innerHeight || document.documentElement.clientHeight;
            if (rect.top < windowHeight * 0.9) el.classList.add('active');
        });
    };

    checkInitialVisibility();
    setTimeout(checkInitialVisibility, 100);

    const revealObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('active');
                if (entry.target.classList.contains('stat-counter')) animateCounter(entry.target);
            }
        });
    }, { root: null, rootMargin: '0px 0px -50px 0px', threshold: 0.05 });

    revealElements.forEach(el => { if (!el.classList.contains('active')) revealObserver.observe(el); });
    document.querySelectorAll('.stat-counter').forEach(el => { if (!el.classList.contains('active')) revealObserver.observe(el); });
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRevealAnimations);
} else {
    initRevealAnimations();
}

// ==========================================
// STATS COUNTER ANIMATION
// ==========================================
function animateCounter(element) {
    if (element.dataset.animated === 'true') return;
    element.dataset.animated = 'true';

    const target = parseInt(element.dataset.target);
    const suffix = element.dataset.suffix || '';
    const prefix = element.dataset.prefix || '';
    const duration = 2000;
    const step = target / (duration / 16);
    let current = 0;

    const timer = setInterval(() => {
        current += step;
        if (current >= target) { current = target; clearInterval(timer); }
        element.textContent = prefix + Math.floor(current).toLocaleString() + suffix;
    }, 16);
}

// ==========================================
// MOBILE MENU TOGGLE
// ==========================================
const mobileMenuBtn = document.getElementById('mobile-menu-btn');
const mobileMenu = document.getElementById('mobile-menu');

if (mobileMenuBtn && mobileMenu) {
    mobileMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        mobileMenu.classList.toggle('hidden');
        mobileMenu.classList.toggle('flex');
        const icon = mobileMenuBtn.querySelector('.iconify');
        if (icon) icon.setAttribute('data-icon', mobileMenu.classList.contains('flex') ? 'lucide:x' : 'lucide:menu');
    });

    document.addEventListener('click', (e) => {
        if (!mobileMenuBtn.contains(e.target) && !mobileMenu.contains(e.target)) {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('flex');
            const icon = mobileMenuBtn.querySelector('.iconify');
            if (icon) icon.setAttribute('data-icon', 'lucide:menu');
        }
    });

    window.addEventListener('resize', () => {
        if (window.innerWidth >= 768) {
            mobileMenu.classList.add('hidden');
            mobileMenu.classList.remove('flex');
            const icon = mobileMenuBtn.querySelector('.iconify');
            if (icon) icon.setAttribute('data-icon', 'lucide:menu');
        }
    });
}

// ==========================================
// SMOOTH SCROLL FOR ANCHOR LINKS
// ==========================================
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        const href = this.getAttribute('href');
        if (href && href !== '#') {
            const target = document.querySelector(href);
            if (target) {
                e.preventDefault();
                const headerOffset = 120;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.scrollY - headerOffset;

                window.scrollTo({ top: offsetPosition, behavior: 'smooth' });

                if (mobileMenu && !mobileMenu.classList.contains('hidden')) {
                    mobileMenu.classList.add('hidden');
                    mobileMenu.classList.remove('flex');
                    const icon = mobileMenuBtn?.querySelector('.iconify');
                    if (icon) icon.setAttribute('data-icon', 'lucide:menu');
                }
            }
        }
    });
});

// ==========================================
// BACK TO TOP BUTTON
// ==========================================
const backToTopBtn = document.getElementById('back-to-top');
if (backToTopBtn) {
    window.addEventListener('scroll', () => {
        backToTopBtn.classList.toggle('opacity-0', window.scrollY <= 500);
        backToTopBtn.classList.toggle('pointer-events-none', window.scrollY <= 500);
        backToTopBtn.classList.toggle('opacity-100', window.scrollY > 500);
    });
    backToTopBtn.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
}

// ==========================================
// NAVBAR SCROLL EFFECT & SCROLL PROGRESS
// ==========================================
const navbar = document.querySelector('nav');
const scrollProgressBar = document.getElementById('scroll-progress');

window.addEventListener('scroll', () => {
    const currentScroll = window.pageYOffset;
    if (navbar) navbar.classList.toggle('shadow-xl', currentScroll > 50);
    if (scrollProgressBar) {
        const progress = (document.documentElement.scrollTop / (document.documentElement.scrollHeight - document.documentElement.clientHeight)) * 100;
        scrollProgressBar.style.width = `${progress}%`;
    }
});

// ==========================================
// READING PROGRESS (Article/Blog)
// ==========================================
const readingProgressBar = document.getElementById('reading-progress');
const progressBar = document.getElementById('progress-bar');
const progressPercent = document.getElementById('progress-percent');
const articleContent = document.getElementById('article-content');

if (articleContent) {
    const updateReadingProgress = () => {
        const progress = Math.min(Math.max(((window.scrollY - articleContent.offsetTop + window.innerHeight * 0.3) / articleContent.offsetHeight) * 100, 0), 100);
        if (readingProgressBar) readingProgressBar.style.width = `${progress}%`;
        if (progressBar) progressBar.style.width = `${progress}%`;
        if (progressPercent) progressPercent.textContent = `${Math.round(progress)}%`;
    };
    window.addEventListener('scroll', updateReadingProgress);
    updateReadingProgress();
}

// ==========================================
// SIDEBAR & TOC ACTIVE STATE (Unified)
// Supports: .toc-link, .sidebar-link, h2[id], h3[id], section[id]
// Uses requestAnimationFrame throttling for performance
// ==========================================
const tocLinks = document.querySelectorAll('.toc-link');
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const tocSections = document.querySelectorAll('h2[id], h3[id], section[id]');

function updateActiveNavigation() {
    if ((!tocLinks.length && !sidebarLinks.length) || !tocSections.length) return;

    let current = '';

    tocSections.forEach(section => {
        const sectionTop = section.offsetTop - 150;
        if (window.scrollY >= sectionTop) {
            current = section.getAttribute('id');
        }
    });

    // Update TOC links
    tocLinks.forEach(link => {
        const isActive = link.getAttribute('href') === `#${current}`;
        link.classList.toggle('active', isActive);
        link.classList.toggle('text-[#31BCBC]', isActive);
        link.classList.toggle('font-medium', isActive);
        link.classList.toggle('text-slate-600', !isActive);

        const dot = link.querySelector('.toc-dot');
        if (dot) {
            dot.classList.toggle('bg-[#31BCBC]', isActive);
            dot.classList.toggle('scale-125', isActive);
            dot.classList.toggle('bg-slate-300', !isActive);
        }
    });

    // Update Sidebar links
    sidebarLinks.forEach(link => {
        const isActive = link.getAttribute('href') === `#${current}`;
        link.classList.toggle('active', isActive);

        if (isActive) {
            link.classList.add('text-[#31BCBC]', 'font-medium', 'bg-[#31BCBC]/5', 'border-l-2', 'border-[#31BCBC]');
            link.classList.remove('text-slate-600', 'hover:text-slate-900');
        } else {
            link.classList.remove('text-[#31BCBC]', 'font-medium', 'bg-[#31BCBC]/5', 'border-l-2', 'border-[#31BCBC]');
            link.classList.add('text-slate-600', 'hover:text-slate-900');
        }
    });
}

if (tocLinks.length || sidebarLinks.length) {
    let tocTicking = false;
    window.addEventListener('scroll', () => {
        if (!tocTicking) {
            window.requestAnimationFrame(() => {
                updateActiveNavigation();
                tocTicking = false;
            });
            tocTicking = true;
        }
    });
    updateActiveNavigation();
}

// ==========================================
// CODE BLOCK COPY BUTTONS
// ==========================================
document.querySelectorAll('.copy-btn').forEach(button => {
    button.addEventListener('click', async () => {
        const codeBlock = button.closest('.relative')?.querySelector('code');
        if (!codeBlock) return;

        const text = codeBlock.textContent
            .replace(/&lt;/g, '<')
            .replace(/&gt;/g, '>')
            .replace(/&amp;/g, '&');

        try {
            await navigator.clipboard.writeText(text);

            // Visual feedback
            const iconSpan = button.querySelector('.iconify');
            const originalIcon = iconSpan?.getAttribute('data-icon');
            if (iconSpan) iconSpan.setAttribute('data-icon', 'lucide:check');
            button.classList.remove('bg-slate-700');
            button.classList.add('bg-green-600');

            const textNode = button.childNodes[button.childNodes.length - 1];
            if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                textNode.textContent = ' Copied!';
            }

            setTimeout(() => {
                if (iconSpan && originalIcon) iconSpan.setAttribute('data-icon', originalIcon);
                button.classList.remove('bg-green-600');
                button.classList.add('bg-slate-700');
                if (textNode && textNode.nodeType === Node.TEXT_NODE) {
                    textNode.textContent = ' Copy';
                }
            }, 2000);
        } catch (err) {
            console.error('Failed to copy:', err);
            showToast('Failed to copy code', 'error');
        }
    });
});

// ==========================================
// VIDEO DATA (Tutorials Page)
// ==========================================
const videoData = {
    'featured': { title: 'Complete Providhy Onboarding Guide', description: 'Everything you need to know to get started with Providhy ERP. Learn how to set up your company, add products, create your first invoice, and more.' },
    'v1': { title: 'Getting Started with Providhy', description: 'Complete onboarding guide for new users. Learn company setup, products, and more.' },
    'v2': { title: 'Inventory Management Basics', description: 'Learn to manage stock, godowns, transfers, and stock adjustments.' },
    'v3': { title: 'Creating VAT Invoices', description: 'Tax-compliant billing made easy. Create professional VAT invoices.' },
    'v4': { title: 'Chart of Accounts Setup', description: 'Configure your accounting structure with custom accounts and groups.' },
    'v5': { title: 'Sales Analytics Dashboard', description: 'Master the analytics dashboard for actionable business insights.' },
    'v6': { title: 'Barcode Scanning Setup', description: 'Configure barcode scanners for faster inventory and billing.' },
    'v7': { title: 'Payment Receipts & Credits', description: 'Record customer payments and manage credit balances.' },
    'v8': { title: 'User Roles & Permissions', description: 'Set up team access with role-based permissions and security.' },
    'v9': { title: 'Multi-Branch Management', description: 'Manage multiple branches with centralized inventory and reports.' }
};

const videoCategoryNames = {
    'all': 'All Videos',
    'getting-started': 'Getting Started',
    'inventory': 'Inventory',
    'billing': 'Billing & Invoicing',
    'accounting': 'Accounting',
    'reports': 'Reports & Analytics',
    'settings': 'Settings & Config',
    'advanced': 'Advanced Features'
};

// ==========================================
// CATEGORY FILTER & SEARCH (Blog + Video)
// ==========================================
const categoryPills = document.querySelectorAll('.category-pill');
const blogCards = document.querySelectorAll('.blog-card');
const videoCards = document.querySelectorAll('.video-card');
const blogSearch = document.getElementById('blog-search');
const videoSearch = document.getElementById('video-search');
const categoryTitle = document.getElementById('category-title');
const videoCount = document.getElementById('video-count');
const videoGrid = document.getElementById('video-grid');

categoryPills.forEach(pill => {
    pill.addEventListener('click', () => {
        categoryPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const category = pill.dataset.category;

        blogCards.forEach(card => {
            const show = category === 'all' || card.dataset.category === category;
            card.style.display = show ? 'block' : 'none';
            if (show) {
                card.style.opacity = '0'; card.style.transform = 'translateY(20px)';
                setTimeout(() => { card.style.transition = 'opacity 0.3s ease, transform 0.3s ease'; card.style.opacity = '1'; card.style.transform = 'translateY(0)'; }, 50);
            }
        });

        let visibleVideoCount = 0;
        videoCards.forEach(card => {
            const show = category === 'all' || card.dataset.category === category;
            card.style.display = show ? 'block' : 'none';
            if (show) visibleVideoCount++;
        });

        if (categoryTitle) categoryTitle.textContent = videoCategoryNames[category] || 'All Videos';
        if (videoCount) videoCount.textContent = `${visibleVideoCount} tutorials available`;

        if (videoGrid && window.innerWidth < 1024 && videoCards.length) {
            videoGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    });
});

if (blogSearch) {
    const debounce = (func, wait) => { let timeout; return (...args) => { clearTimeout(timeout); timeout = setTimeout(() => func(...args), wait); }; };
    const performBlogSearch = debounce((query) => {
        const q = query.toLowerCase().trim();
        blogCards.forEach(card => {
            const matches = (card.querySelector('h3')?.textContent.toLowerCase() || '').includes(q) || (card.querySelector('p')?.textContent.toLowerCase() || '').includes(q) || (card.dataset.tags?.toLowerCase() || '').includes(q) || (card.dataset.category?.toLowerCase() || '').includes(q);
            card.style.display = (matches || q === '') ? 'block' : 'none';
            card.classList.toggle('ring-2', matches && q !== '');
            card.classList.toggle('ring-[#31BCBC]/50', matches && q !== '');
        });
        categoryPills.forEach(p => p.classList.remove('active'));
        if (categoryPills[0]) categoryPills[0].classList.add('active');
    }, 200);
    blogSearch.addEventListener('input', (e) => performBlogSearch(e.target.value));
    blogSearch.addEventListener('keydown', (e) => { if (e.key === 'Escape') { blogSearch.value = ''; performBlogSearch(''); blogSearch.blur(); } });
}

if (videoSearch) {
    videoSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase();
        videoCards.forEach(card => {
            const title = (card.querySelector('h3')?.textContent || '').toLowerCase();
            const description = (card.querySelector('p')?.textContent || '').toLowerCase();
            card.style.display = (title.includes(query) || description.includes(query)) ? 'block' : 'none';
        });
        categoryPills.forEach(p => p.classList.remove('active'));
        if (categoryPills[0]) categoryPills[0].classList.add('active');
    });
}

// ==========================================
// VIDEO VIEW TOGGLE (Grid/List)
// ==========================================
const viewGrid = document.getElementById('view-grid');
const viewList = document.getElementById('view-list');

if (viewGrid && viewList && videoGrid) {
    viewGrid.addEventListener('click', () => {
        viewGrid.classList.add('bg-slate-100', 'text-slate-700');
        viewGrid.classList.remove('text-slate-400');
        viewList.classList.remove('bg-slate-100', 'text-slate-700');
        viewList.classList.add('text-slate-400');
        videoGrid.classList.remove('grid-cols-1');
        videoGrid.classList.add('grid-cols-1', 'md:grid-cols-2', 'xl:grid-cols-3');
    });

    viewList.addEventListener('click', () => {
        viewList.classList.add('bg-slate-100', 'text-slate-700');
        viewList.classList.remove('text-slate-400');
        viewGrid.classList.remove('bg-slate-100', 'text-slate-700');
        viewGrid.classList.add('text-slate-400');
        videoGrid.classList.remove('md:grid-cols-2', 'xl:grid-cols-3');
        videoGrid.classList.add('grid-cols-1');
    });
}

// ==========================================
// VIDEO SORT
// ==========================================
const sortSelect = document.getElementById('sort-select');
if (sortSelect && videoCards.length) {
    sortSelect.addEventListener('change', (e) => {
        const sortBy = e.target.value;
        const cardsArray = Array.from(videoCards);

        cardsArray.sort((a, b) => {
            const durationA = a.querySelector('.bg-black\\/70')?.textContent || '0:00';
            const durationB = b.querySelector('.bg-black\\/70')?.textContent || '0:00';
            const viewsA = parseInt((a.querySelector('.text-xs.text-slate-400 span')?.textContent || '0').replace(/[^0-9]/g, ''));
            const viewsB = parseInt((b.querySelector('.text-xs.text-slate-400 span')?.textContent || '0').replace(/[^0-9]/g, ''));

            const parseTime = (t) => { const parts = t.trim().split(':'); return parseInt(parts[0]) * 60 + parseInt(parts[1] || 0); };

            switch (sortBy) {
                case 'popular': return viewsB - viewsA;
                case 'duration-asc': return parseTime(durationA) - parseTime(durationB);
                case 'duration-desc': return parseTime(durationB) - parseTime(durationA);
                default: return 0;
            }
        });

        if (videoGrid) cardsArray.forEach(card => videoGrid.appendChild(card));
    });
}

// ==========================================
// CHANGELOG FILTER PILLS
// ==========================================
const filterPills = document.querySelectorAll('.filter-pill');
const releaseItems = document.querySelectorAll('.release-item');

filterPills.forEach(pill => {
    pill.addEventListener('click', () => {
        filterPills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');
        const filter = pill.dataset.filter;
        releaseItems.forEach(item => {
            const types = item.dataset.types ? item.dataset.types.split(',') : [];
            if (filter === 'all' || types.includes(filter)) {
                item.style.display = 'block';
                item.style.opacity = '0'; item.style.transform = 'translateY(20px)';
                setTimeout(() => { item.style.transition = 'opacity 0.3s ease, transform 0.3s ease'; item.style.opacity = '1'; item.style.transform = 'translateY(0)'; }, 50);
            } else { item.style.display = 'none'; }
        });
    });
});

// ==========================================
// VERSION JUMP (Changelog)
// ==========================================
const versionSelect = document.getElementById('version-select');
if (versionSelect) {
    versionSelect.addEventListener('change', (e) => {
        const version = e.target.value;
        if (!version) return;
        const targetRelease = document.getElementById(`release-${version}`);
        if (targetRelease) {
            targetRelease.scrollIntoView({ behavior: 'smooth', block: 'center' });
            targetRelease.classList.add('ring-2', 'ring-[#31BCBC]', 'ring-offset-4');
            setTimeout(() => { targetRelease.classList.remove('ring-2', 'ring-[#31BCBC]', 'ring-offset-4'); }, 2000);
        }
    });
}

// ==========================================
// SHARE RELEASE (Changelog)
// ==========================================
function shareRelease(version) {
    const url = `${window.location.origin}${window.location.pathname}#release-${version}`;
    if (navigator.share) {
        navigator.share({ title: `Release v${version} Notes`, url: url }).catch(() => copyLink(url));
    } else { copyLink(url); }
}

// ==========================================
// LOAD MORE RELEASES (Changelog)
// ==========================================
const loadMoreReleasesBtn = document.getElementById('load-more-releases');
if (loadMoreReleasesBtn) {
    loadMoreReleasesBtn.addEventListener('click', () => {
        loadMoreReleasesBtn.innerHTML = `<span class="iconify" data-icon="lucide:check"></span> All Releases Loaded`;
        loadMoreReleasesBtn.disabled = true;
        loadMoreReleasesBtn.classList.add('opacity-50', 'cursor-not-allowed');
        loadMoreReleasesBtn.classList.remove('hover:border-[#31BCBC]', 'hover:text-[#31BCBC]');
    });
}

// ==========================================
// LOAD MORE VIDEOS (Tutorials Page)
// ==========================================
const loadMoreVideosBtn = document.getElementById('load-more-btn');
let videoLoadedCount = 9;
const videosPerLoad = 6;

if (loadMoreVideosBtn && videoGrid) {
    loadMoreVideosBtn.addEventListener('click', () => {
        const newVideos = [
            { id: 'v10', category: 'getting-started', gradient: 'from-teal-500 to-cyan-500', icon: 'lucide:book-open', duration: '5:20', badge: null, badgeColor: null, categoryLabel: 'GETTING STARTED', categoryBg: 'bg-emerald-100', categoryText: 'text-emerald-700', title: 'Understanding the Dashboard', description: 'Navigate your Providhy dashboard like a pro.', views: '420', date: 'Dec 10, 2024' },
            { id: 'v11', category: 'inventory', gradient: 'from-indigo-500 to-blue-500', icon: 'lucide:truck', duration: '7:15', badge: null, badgeColor: null, categoryLabel: 'INVENTORY', categoryBg: 'bg-blue-100', categoryText: 'text-blue-700', title: 'Purchase Order Management', description: 'Create and track purchase orders efficiently.', views: '680', date: 'Dec 8, 2024' },
            { id: 'v12', category: 'billing', gradient: 'from-orange-500 to-red-500', icon: 'lucide:file-text', duration: '6:00', badge: null, badgeColor: null, categoryLabel: 'BILLING', categoryBg: 'bg-amber-100', categoryText: 'text-amber-700', title: 'Credit Notes & Returns', description: 'Handle sales returns and issue credit notes.', views: '510', date: 'Dec 5, 2024' },
            { id: 'v13', category: 'accounting', gradient: 'from-violet-500 to-purple-500', icon: 'lucide:wallet', duration: '8:45', badge: null, badgeColor: null, categoryLabel: 'ACCOUNTING', categoryBg: 'bg-purple-100', categoryText: 'text-purple-700', title: 'Bank Reconciliation', description: 'Reconcile your bank statements with ease.', views: '390', date: 'Dec 2, 2024' },
            { id: 'v14', category: 'reports', gradient: 'from-pink-500 to-rose-500', icon: 'lucide:pie-chart', duration: '9:30', badge: 'NEW', badgeColor: 'bg-green-500', categoryLabel: 'REPORTS', categoryBg: 'bg-rose-100', categoryText: 'text-rose-700', title: 'Profit & Loss Statements', description: 'Generate and analyze P&L reports.', views: '720', date: 'Nov 28, 2024' },
            { id: 'v15', category: 'settings', gradient: 'from-gray-600 to-slate-700', icon: 'lucide:printer', duration: '4:15', badge: null, badgeColor: null, categoryLabel: 'SETTINGS', categoryBg: 'bg-slate-200', categoryText: 'text-slate-700', title: 'Invoice Print Templates', description: 'Customize your invoice print layouts.', views: '340', date: 'Nov 25, 2024' }
        ];

        newVideos.forEach(video => {
            const cardHTML = `
                <div class="video-card group bg-white rounded-2xl overflow-hidden border border-slate-200 hover:border-slate-300 hover:shadow-xl transition-all duration-300 cursor-pointer" data-category="${video.category}" onclick="openVideoModal('${video.id}')" tabindex="0" role="button" aria-label="${video.title}">
                    <div class="relative aspect-video bg-slate-200 overflow-hidden">
                        <div class="thumbnail absolute inset-0 bg-gradient-to-br ${video.gradient} flex items-center justify-center transition-transform duration-500">
                            <span class="iconify text-white/20 text-6xl" data-icon="${video.icon}"></span>
                        </div>
                        <div class="play-icon absolute inset-0 flex items-center justify-center transition-transform duration-300">
                            <div class="w-14 h-14 bg-white rounded-full flex items-center justify-center shadow-lg">
                                <span class="iconify text-[#1D4F50] text-2xl ml-1" data-icon="lucide:play"></span>
                            </div>
                        </div>
                        <div class="absolute bottom-3 right-3 px-2 py-1 bg-black/70 text-white text-xs rounded font-medium">${video.duration}</div>
                        ${video.badge ? `<div class="absolute top-3 left-3 px-2 py-1 ${video.badgeColor} text-white text-[10px] font-bold rounded">${video.badge}</div>` : ''}
                    </div>
                    <div class="p-5">
                        <div class="flex items-center gap-2 mb-2">
                            <span class="px-2 py-0.5 ${video.categoryBg} ${video.categoryText} text-[10px] font-semibold rounded">${video.categoryLabel}</span>
                        </div>
                        <h3 class="font-bold text-slate-900 mb-2 group-hover:text-[#31BCBC] transition-colors">${video.title}</h3>
                        <p class="text-sm text-slate-500 mb-3 line-clamp-2">${video.description}</p>
                        <div class="flex items-center justify-between text-xs text-slate-400">
                            <span class="flex items-center gap-1">
                                <span class="iconify" data-icon="lucide:eye"></span>
                                ${video.views} views
                            </span>
                            <span>${video.date}</span>
                        </div>
                    </div>
                </div>`;

            videoGrid.insertAdjacentHTML('beforeend', cardHTML);
            videoData[video.id] = { title: video.title, description: video.description };
        });

        videoLoadedCount += videosPerLoad;

        if (videoLoadedCount >= 15) {
            loadMoreVideosBtn.innerHTML = `<span class="iconify" data-icon="lucide:check"></span> All Videos Loaded`;
            loadMoreVideosBtn.disabled = true;
            loadMoreVideosBtn.classList.add('opacity-50', 'cursor-not-allowed');
            loadMoreVideosBtn.classList.remove('hover:border-[#31BCBC]', 'hover:text-[#31BCBC]');
        }

        setTimeout(() => {
            document.querySelectorAll('.video-card:not(.revealed)').forEach((card, index) => {
                setTimeout(() => {
                    card.classList.add('revealed');
                    card.style.opacity = '1';
                    card.style.transform = 'translateY(0)';
                }, index * 100);
            });
        }, 100);

        applyWatchedStates();
    });
}

// ==========================================
// VIDEO PROGRESS TRACKING
// ==========================================
function markAsWatched(videoId) {
    const watchedVideos = JSON.parse(localStorage.getItem('watchedVideos') || '[]');
    if (!watchedVideos.includes(videoId)) {
        watchedVideos.push(videoId);
        localStorage.setItem('watchedVideos', JSON.stringify(watchedVideos));
    }
}

function getWatchedVideos() {
    return JSON.parse(localStorage.getItem('watchedVideos') || '[]');
}

function applyWatchedStates() {
    const watched = getWatchedVideos();
    watched.forEach(videoId => {
        const card = document.querySelector(`[onclick="openVideoModal('${videoId}')"]`);
        if (card) {
            const thumbnail = card.querySelector('.aspect-video');
            if (thumbnail && !thumbnail.querySelector('.bg-emerald-500')) {
                const badge = document.createElement('div');
                badge.className = 'absolute top-3 right-3 px-2 py-1 bg-emerald-500 text-white text-[10px] font-bold rounded flex items-center gap-1';
                badge.innerHTML = '<span class="iconify" data-icon="lucide:check"></span> WATCHED';
                thumbnail.appendChild(badge);
            }
        }
    });
}

applyWatchedStates();

// ==========================================
// URL HASH HANDLING
// ==========================================
function handleUrlHash() {
    if (window.location.hash) {
        const targetId = window.location.hash.substring(1);
        const targetElement = document.getElementById(targetId);
        if (targetElement) {
            setTimeout(() => {
                targetElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                targetElement.classList.add('ring-2', 'ring-[#31BCBC]', 'ring-offset-4');
                setTimeout(() => { targetElement.classList.remove('ring-2', 'ring-[#31BCBC]', 'ring-offset-4'); }, 2000);
            }, 500);
        }
    }
}
handleUrlHash();
window.addEventListener('hashchange', handleUrlHash);

// ==========================================
// CONTACT FORM HANDLER
// ==========================================
function initContactForms() {
    const contactForms = document.querySelectorAll('form[data-contact], #contact-form, .contact-form');

    contactForms.forEach(form => {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            const submitBtn = form.querySelector('button[type="submit"], input[type="submit"]');
            const originalBtnText = submitBtn ? submitBtn.innerHTML : '';

            const requiredFields = form.querySelectorAll('[required]');
            let isValid = true;

            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    field.classList.add('border-red-500', 'ring-2', 'ring-red-200');
                    setTimeout(() => { field.classList.remove('border-red-500', 'ring-2', 'ring-red-200'); }, 3000);
                }
            });

            const emailField = form.querySelector('input[type="email"]');
            if (emailField && emailField.value && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailField.value)) {
                isValid = false;
                emailField.classList.add('border-red-500', 'ring-2', 'ring-red-200');
                showToast('Please enter a valid email address', 'error');
                return;
            }

            if (!isValid) { showToast('Please fill in all required fields', 'error'); return; }

            if (submitBtn) { submitBtn.disabled = true; submitBtn.innerHTML = `<span class="iconify animate-spin" data-icon="lucide:loader-2"></span> Sending...`; }

            try {
                await new Promise(resolve => setTimeout(resolve, 1500));
                showToast('Thank you for your message! We will get back to you within 24 hours.', 'success');
                form.reset();
                if (typeof gtag !== 'undefined') { gtag('event', 'form_submission', { 'form_name': form.id || 'contact_form' }); }
            } catch (error) {
                showToast('Sorry, something went wrong. Please try again.', 'error');
            } finally {
                if (submitBtn) { submitBtn.disabled = false; submitBtn.innerHTML = originalBtnText; }
            }
        });

        form.querySelectorAll('input, textarea, select').forEach(input => {
            input.addEventListener('blur', () => { if (input.hasAttribute('required') && !input.value.trim()) input.classList.add('border-red-300'); else input.classList.remove('border-red-300', 'border-red-500', 'ring-2', 'ring-red-200'); });
            input.addEventListener('input', () => { input.classList.remove('border-red-300', 'border-red-500', 'ring-2', 'ring-red-200'); });
        });
    });
}
initContactForms();

// ==========================================
// SITE-WIDE SEARCH & DOCUMENTATION SEARCH
// Supports: redirect mode (404/global) + inline
// section filtering mode (docs pages)
// ==========================================
const siteSearchInput = document.getElementById('search-input');
const docSections = document.querySelectorAll('section[id]');

if (siteSearchInput) {
    // Documentation mode: live filter sections on the page
    if (docSections.length > 0) {
        siteSearchInput.addEventListener('input', (e) => {
            const query = e.target.value.toLowerCase().trim();

            if (query.length === 0) {
                docSections.forEach(section => { section.style.display = ''; });
                return;
            }

            docSections.forEach(section => {
                const text = section.textContent.toLowerCase();
                section.style.display = text.includes(query) ? '' : 'none';
            });
        });

        siteSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                siteSearchInput.value = '';
                docSections.forEach(section => { section.style.display = ''; });
                siteSearchInput.blur();
            }
        });
    } else {
        // Global/404 mode: redirect on Enter
        siteSearchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                const query = siteSearchInput.value.trim();
                if (query) window.location.href = `/search?q=${encodeURIComponent(query)}`;
            }
        });
    }
}

function performSearch() {
    const searchInput = document.getElementById('search-input');
    const query = searchInput ? searchInput.value.trim() : '';
    if (query) { window.location.href = `/search?q=${encodeURIComponent(query)}`; }
}

// ==========================================
// REPORT BROKEN LINK & 404 ANALYTICS
// ==========================================
function reportBrokenLink() {
    console.log('Broken link reported:', { url: window.location.href, referrer: document.referrer });
    if (typeof showToast === 'function') showToast('Thank you for reporting this broken link!', 'success');
}

function log404Analytics() {
    if (typeof gtag !== 'undefined') { gtag('event', 'page_not_found', { 'page_location': window.location.href, 'page_referrer': document.referrer }); }
    if (typeof ga !== 'undefined') { ga('send', 'event', 'Error', '404', window.location.href); }
}
if (document.body.classList.contains('error-page') || document.querySelector('[data-page="404"]')) { log404Analytics(); }

// ==========================================
// MODULE TABS - UNIFIED
// ==========================================
const moduleTabs = document.querySelectorAll('.module-tab');
const moduleContents = document.querySelectorAll('.module-content');

if (moduleTabs.length && moduleContents.length) {
    moduleTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const targetModule = tab.dataset.module;
            if (targetModule) {
                moduleTabs.forEach(t => { t.classList.remove('active', 'bg-white', 'shadow-lg', 'text-[#1D4F50]'); t.classList.add('text-slate-600', 'text-slate-700', 'hover:text-[#1D4F50]'); });
                tab.classList.add('active', 'bg-white', 'shadow-lg', 'text-[#1D4F50]');
                tab.classList.remove('text-slate-600', 'text-slate-700', 'hover:text-[#1D4F50]');
                moduleContents.forEach(content => {
                    if (content.dataset.module === targetModule) { content.classList.remove('hidden'); content.style.animation = 'none'; content.offsetHeight; content.style.animation = 'fadeInUp 0.4s ease-out'; }
                    else { content.classList.add('hidden'); }
                });
            }
        });
    });
}

function switchModule(moduleName) {
    document.querySelectorAll('.module-tab').forEach(tab => { tab.classList.remove('active', 'bg-white', 'shadow-lg', 'text-[#1D4F50]'); tab.classList.add('text-slate-700', 'text-slate-600'); });
    document.querySelectorAll('.module-content').forEach(content => content.classList.add('hidden'));
    const activeTab = document.getElementById(`tab-${moduleName}`) || document.querySelector(`.module-tab[data-module="${moduleName}"]`);
    if (activeTab) { activeTab.classList.add('active', 'bg-white', 'shadow-lg', 'text-[#1D4F50]'); activeTab.classList.remove('text-slate-700', 'text-slate-600'); }
    const activeContent = document.getElementById(`module-${moduleName}`) || document.querySelector(`.module-content[data-module="${moduleName}"]`);
    if (activeContent) { activeContent.classList.remove('hidden'); activeContent.style.animation = 'none'; activeContent.offsetHeight; activeContent.style.animation = 'fadeInUp 0.4s ease-out'; }
}

// ==========================================
// PAIN POINTS & WORKFLOW ANIMATIONS
// ==========================================
const painSection = document.getElementById('pain-points-section');
if (painSection) {
    new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    document.querySelectorAll('.pain-point').forEach((point, i) => {
                        setTimeout(() => {
                            point.classList.add('line-through', 'text-slate-400');
                            const solution = document.querySelectorAll('.solution-point')[i];
                            if (solution) { solution.classList.add('animate-slideIn'); solution.classList.remove('opacity-0'); }
                        }, i * 300);
                    });
                }, 500);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 }).observe(painSection);
}

const workflowSection = document.getElementById('workflow-section');
if (workflowSection) {
    new IntersectionObserver((entries, obs) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    document.querySelectorAll('.workflow-step').forEach((step, i) => {
                        setTimeout(() => {
                            step.classList.add('active'); step.classList.remove('opacity-50');
                            const line = document.querySelectorAll('.workflow-line')[i];
                            if (line) line.classList.add('active');
                        }, i * 400);
                    });
                }, 300);
                obs.unobserve(entry.target);
            }
        });
    }, { threshold: 0.3 }).observe(workflowSection);
}

// ==========================================
// COMPARISON TABLE HOVER
// ==========================================
document.querySelectorAll('.comparison-row').forEach(row => {
    row.addEventListener('mouseenter', () => row.classList.add('bg-[#31BCBC]/5'));
    row.addEventListener('mouseleave', () => row.classList.remove('bg-[#31BCBC]/5'));
});

// ==========================================
// VIDEO MODAL (Unified)
// ==========================================
const videoModal = document.getElementById('video-modal');
const videoIframe = document.getElementById('video-iframe');
const modalTitle = document.getElementById('modal-video-title');
const modalDescription = document.getElementById('modal-video-description');

function openVideoModal(videoId) {
    if (!videoModal) return;

    if (modalTitle && videoData[videoId]) {
        modalTitle.textContent = videoData[videoId].title;
        if (modalDescription) modalDescription.textContent = videoData[videoId].description;
    }

    if (videoIframe) {
        videoIframe.src = `https://www.youtube.com/embed/${videoId || 'RCmK4k9gHDc'}?autoplay=1`;
    }

    videoModal.classList.remove('hidden');
    videoModal.classList.add('flex');
    document.body.style.overflow = 'hidden';

    if (videoData[videoId]) markAsWatched(videoId);
}

function closeVideoModal() {
    if (!videoModal) return;
    videoModal.classList.add('hidden');
    videoModal.classList.remove('flex');
    if (videoIframe) videoIframe.src = '';
    document.body.style.overflow = '';
}

if (videoModal) {
    videoModal.addEventListener('click', (e) => {
        if (e.target === videoModal || e.target.classList.contains('video-backdrop')) closeVideoModal();
    });
}

// ==========================================
// TESTIMONIAL CAROUSEL
// ==========================================
const testimonialTrack = document.getElementById('testimonial-track');
const testimonialPrev = document.getElementById('testimonial-prev');
const testimonialNext = document.getElementById('testimonial-next');
const testimonialDots = document.querySelectorAll('.testimonial-dot');
let currentTestimonial = 0, testimonialCount = document.querySelectorAll('.testimonial-card').length, autoplayInterval;

function goToTestimonial(index) {
    if (index < 0) index = testimonialCount - 1; if (index >= testimonialCount) index = 0;
    currentTestimonial = index;
    if (testimonialTrack) testimonialTrack.style.transform = `translateX(-${currentTestimonial * 100}%)`;
    testimonialDots.forEach((dot, i) => { dot.classList.toggle('bg-[#31BCBC]', i === currentTestimonial); dot.classList.toggle('bg-slate-300', i !== currentTestimonial); });
}

function startAutoplay() { autoplayInterval = setInterval(() => goToTestimonial(currentTestimonial + 1), 5000); }
function resetAutoplay() { clearInterval(autoplayInterval); startAutoplay(); }

if (testimonialPrev) testimonialPrev.addEventListener('click', () => { goToTestimonial(currentTestimonial - 1); resetAutoplay(); });
if (testimonialNext) testimonialNext.addEventListener('click', () => { goToTestimonial(currentTestimonial + 1); resetAutoplay(); });
testimonialDots.forEach((dot, i) => dot.addEventListener('click', () => { goToTestimonial(i); resetAutoplay(); }));

if (testimonialTrack) {
    startAutoplay();
    testimonialTrack.addEventListener('mouseenter', () => clearInterval(autoplayInterval));
    testimonialTrack.addEventListener('mouseleave', () => startAutoplay());
}

// ==========================================
// FEATURE SEARCH
// ==========================================
const featureSearch = document.getElementById('feature-search');
const featureCards = document.querySelectorAll('.feature-card');

if (featureSearch) {
    featureSearch.addEventListener('input', (e) => {
        const query = e.target.value.toLowerCase().trim();
        featureCards.forEach(card => {
            const matches = (card.querySelector('h3, h4')?.textContent.toLowerCase() || '').includes(query) || (card.querySelector('p')?.textContent.toLowerCase() || '').includes(query) || (card.dataset.tags?.toLowerCase() || '').includes(query);
            card.style.display = matches || query === '' ? '' : 'none';
            card.classList.toggle('ring-2', matches && query !== ''); card.classList.toggle('ring-[#31BCBC]', matches && query !== '');
        });
        const noResults = document.getElementById('no-results');
        if (noResults) noResults.classList.toggle('hidden', document.querySelectorAll('.feature-card:not([style*="display: none"])').length > 0);
    });
    featureSearch.addEventListener('keydown', (e) => { if (e.key === 'Escape') { featureSearch.value = ''; featureSearch.dispatchEvent(new Event('input')); featureSearch.blur(); } });
}

// ==========================================
// ROI CALCULATOR
// ==========================================
const roiCalculator = document.getElementById('roi-calculator');
if (roiCalculator) {
    const invoicesInput = document.getElementById('monthly-invoices'), hoursInput = document.getElementById('manual-hours'), productsInput = document.getElementById('product-count'), resultMoney = document.getElementById('roi-money'), resultTime = document.getElementById('roi-time');
    const calculateROI = () => {
        const invoices = parseInt(invoicesInput?.value) || 0, hours = parseInt(hoursInput?.value) || 0, products = parseInt(productsInput?.value) || 0;
        if (resultMoney) resultMoney.textContent = `NPR ${Math.round((invoices * 5) + (hours * 200) + (products * 2)).toLocaleString()}`;
        if (resultTime) resultTime.textContent = `${Math.round(hours * 0.7)} hours`;
    };
    [invoicesInput, hoursInput, productsInput].forEach(input => { if (input) input.addEventListener('input', calculateROI); });
}

// ==========================================
// TOAST NOTIFICATIONS
// ==========================================
function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    const bgColor = type === 'success' ? 'bg-emerald-500' : type === 'error' ? 'bg-red-500' : 'bg-slate-800';
    const icon = type === 'success' ? 'lucide:check-circle' : type === 'error' ? 'lucide:x-circle' : 'lucide:info';
    toast.className = `fixed bottom-6 left-1/2 -translate-x-1/2 px-6 py-3 ${bgColor} text-white rounded-xl shadow-lg z-50 flex items-center gap-2 animate-slideUp toast-animate`;
    toast.innerHTML = `<span class="iconify" data-icon="${icon}"></span>${message}`;
    document.body.appendChild(toast);
    setTimeout(() => { toast.classList.add('animate-slideDown'); setTimeout(() => toast.remove(), 300); }, 3000);
}

// ==========================================
// COPY & SHARE FUNCTIONS
// ==========================================
function copyLink(url) { navigator.clipboard.writeText(url || window.location.href).then(() => showToast('Link copied to clipboard!')).catch(() => showToast('Failed to copy link', 'error')); }
function copyFeatureLink(featureId) { copyLink(`${window.location.origin}${window.location.pathname}#${featureId}`); }
function shareOnTwitter(text, url) { window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text || document.title)}&url=${encodeURIComponent(url || window.location.href)}`, '_blank', 'width=550,height=420'); }
function shareOnFacebook(url) { window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url || window.location.href)}`, '_blank', 'width=550,height=420'); }
function shareOnLinkedIn(url) { window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url || window.location.href)}`, '_blank', 'width=550,height=420'); }
function shareOnWhatsApp(text, url) { window.open(`https://wa.me/?text=${encodeURIComponent((text || document.title) + ' ' + (url || window.location.href))}`, '_blank'); }

// ==========================================
// LAZY LOAD IMAGES
// ==========================================
if ('IntersectionObserver' in window) {
    const imageObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => { if (entry.isIntersecting) { const img = entry.target; img.src = img.dataset.src; img.removeAttribute('data-src'); img.classList.add('loaded'); imageObserver.unobserve(img); } });
    }, { rootMargin: '50px' });
    document.querySelectorAll('img[data-src]').forEach(img => imageObserver.observe(img));
} else {
    document.querySelectorAll('img[data-src]').forEach(img => img.src = img.dataset.src);
}

// ==========================================
// PARALLAX EFFECT
// ==========================================
const parallaxElements = document.querySelectorAll('.parallax');
if (parallaxElements.length) window.addEventListener('scroll', () => { const scrolled = window.pageYOffset; parallaxElements.forEach(el => el.style.transform = `translateY(${scrolled * (el.dataset.speed || 0.5)}px)`); }, { passive: true });

// ==========================================
// ACCORDION
// ==========================================
document.querySelectorAll('.accordion-trigger').forEach(trigger => {
    trigger.addEventListener('click', () => { trigger.nextElementSibling.classList.toggle('hidden'); trigger.querySelector('.accordion-icon')?.classList.toggle('rotate-180'); });
});

// ==========================================
// TILT CARD EFFECT
// ==========================================
document.querySelectorAll('.tilt-card').forEach(card => {
    card.addEventListener('mousemove', (e) => { const rect = card.getBoundingClientRect(); card.style.transform = `perspective(1000px) rotateX(${((e.clientY - rect.top) - rect.height / 2) / 20}deg) rotateY(${(rect.width / 2 - (e.clientX - rect.left)) / 20}deg) scale3d(1.02, 1.02, 1.02)`; });
    card.addEventListener('mouseleave', () => card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale3d(1, 1, 1)');
});

// ==========================================
// SIMPLE BILLING TOGGLE
// ==========================================
const simpleBillingToggle = document.getElementById('billingToggle'), starterPrice = document.getElementById('starterPrice'), starterOriginal = document.getElementById('starterOriginal'), starterBilling = document.getElementById('starterBilling');
let isStarterYearly = true;

if (simpleBillingToggle && starterPrice) {
    simpleBillingToggle.addEventListener('click', () => {
        isStarterYearly = !isStarterYearly;
        const toggleDot = simpleBillingToggle.querySelector('.toggle-dot');
        if (isStarterYearly) { simpleBillingToggle.dataset.active = 'yearly'; if (toggleDot) { toggleDot.style.right = '4px'; toggleDot.style.left = 'auto'; } starterPrice.textContent = 'रू 499'; if (starterOriginal) { starterOriginal.textContent = 'रू 625/mo'; starterOriginal.style.display = 'inline'; } if (starterBilling) starterBilling.textContent = 'Billed annually'; }
        else { simpleBillingToggle.dataset.active = 'monthly'; if (toggleDot) { toggleDot.style.left = '4px'; toggleDot.style.right = 'auto'; } starterPrice.textContent = 'रू 625'; if (starterOriginal) starterOriginal.style.display = 'none'; if (starterBilling) starterBilling.textContent = 'Billed monthly'; }
    });
}

// ==========================================
// PRICING DATA & COMPONENT (Minified)
// ==========================================
const pricingData={monthly:{1:{price:499,original:null},2:{price:499,original:null},3:{price:998,original:1497},4:{price:1497,original:1996},5:{price:1996,original:2495},6:{price:2495,original:2994},7:{price:2994,original:3493},8:{price:3493,original:3992},9:{price:3992,original:4491},10:{price:4491,original:4990},11:{price:4990,original:5489},12:{price:5489,original:5988},13:{price:5988,original:6487},14:{price:6487,original:6986},15:{price:6986,original:7485},16:{price:7485,original:7984},17:{price:7984,original:8483},18:{price:8483,original:8982},19:{price:8982,original:9481},20:{price:9481,original:9980},21:{price:9980,original:10479},22:{price:10479,original:10978},23:{price:10978,original:11477},24:{price:11477,original:11976},25:{price:11976,original:12475},26:{price:12475,original:12974},27:{price:12974,original:13473},28:{price:13473,original:13972},29:{price:13972,original:14471},30:{price:14471,original:14970},31:{price:14970,original:15469},32:{price:15469,original:15968},33:{price:15968,original:16467},34:{price:16467,original:16966},35:{price:16966,original:17465},36:{price:17465,original:17964},37:{price:17964,original:18463},38:{price:18463,original:18962},39:{price:18962,original:19461},40:{price:19461,original:19960}},yearly:{1:{price:5888,original:5988},2:{price:5888,original:11976},3:{price:11976,original:17964},4:{price:17864,original:23952},5:{price:23852,original:29940},6:{price:29840,original:35928},7:{price:35828,original:41916},8:{price:41816,original:47904},9:{price:47804,original:53892},10:{price:53792,original:59880},11:{price:59780,original:65868},12:{price:65768,original:71856},13:{price:71756,original:77844},14:{price:77744,original:83832},15:{price:83732,original:89820},16:{price:89720,original:95808},17:{price:95708,original:101796},18:{price:101696,original:107784},19:{price:107684,original:113772},20:{price:113672,original:119760},21:{price:119660,original:125748},22:{price:125648,original:131736},23:{price:131636,original:137724},24:{price:137624,original:143712},25:{price:143612,original:149700},26:{price:149600,original:155688},27:{price:155588,original:161676},28:{price:161576,original:167664},29:{price:167564,original:173652},30:{price:173552,original:179640},31:{price:179540,original:185628},32:{price:185528,original:191616},33:{price:191516,original:197604},34:{price:197504,original:203592},35:{price:203492,original:209580},36:{price:209480,original:215568},37:{price:215468,original:221556},38:{price:221456,original:227544},39:{price:227444,original:233532},40:{price:233432,original:239520}}};

(function(){let currentPeriod='yearly',currentUsers=2,tempUsers=2,isDropdownOpen=false;const billingToggle=document.getElementById('billing-toggle'),toggleDot=document.getElementById('toggle-dot'),monthlyLabel=document.getElementById('monthly-label'),yearlyLabel=document.getElementById('yearly-label'),priceEl=document.getElementById('delite-price'),periodEl=document.getElementById('delite-period'),originalEl=document.getElementById('delite-original'),savingsEl=document.getElementById('delite-savings'),perUserEl=document.getElementById('delite-per-user'),selectedUsersDisplay=document.getElementById('selected-users-display'),dropdownContainer=document.getElementById('user-dropdown-container'),dropdownBtn=document.getElementById('user-dropdown-btn'),dropdownPanel=document.getElementById('user-dropdown-panel'),dropdownIcon=document.getElementById('user-dropdown-icon'),dropdownValue=document.getElementById('user-dropdown-value'),userInput=document.getElementById('user-input'),quickBtns=document.querySelectorAll('.user-quick-btn'),decrementBtn=document.getElementById('user-decrement'),incrementBtn=document.getElementById('user-increment'),applyBtn=document.getElementById('user-apply-btn');if(!billingToggle||!dropdownBtn)return;const formatCurrency=(a)=>'रू '+a.toLocaleString('en-IN');function updatePrice(){const d=pricingData[currentPeriod][currentUsers];if(!d)return;priceEl.style.opacity='0';priceEl.style.transform='translateY(-10px)';setTimeout(()=>{priceEl.textContent=formatCurrency(d.price);periodEl.textContent=currentPeriod==='yearly'?'/year':'/month';selectedUsersDisplay.textContent=currentUsers+(currentUsers===1?' User':' Users');if(d.original){originalEl.textContent=formatCurrency(d.original);originalEl.style.display='inline';savingsEl.textContent='Save '+formatCurrency(d.original-d.price);savingsEl.style.display='inline-flex';}else{originalEl.style.display='none';savingsEl.style.display='none';}perUserEl.textContent=formatCurrency(Math.round(d.price/currentUsers))+'/user/'+(currentPeriod==='yearly'?'year':'month');priceEl.style.opacity='1';priceEl.style.transform='translateY(0)';},150);}function updateToggleUI(){if(currentPeriod==='yearly'){toggleDot.style.left='auto';toggleDot.style.right='4px';billingToggle.classList.remove('bg-slate-200');billingToggle.classList.add('bg-slate-900');yearlyLabel.classList.remove('text-slate-400');yearlyLabel.classList.add('text-slate-900');monthlyLabel.classList.remove('text-slate-900');monthlyLabel.classList.add('text-slate-400');}else{toggleDot.style.right='auto';toggleDot.style.left='4px';billingToggle.classList.remove('bg-slate-900');billingToggle.classList.add('bg-slate-200');monthlyLabel.classList.remove('text-slate-400');monthlyLabel.classList.add('text-slate-900');yearlyLabel.classList.remove('text-slate-900');yearlyLabel.classList.add('text-slate-400');}}function toggleBilling(){currentPeriod=currentPeriod==='yearly'?'monthly':'yearly';updateToggleUI();updatePrice();}function openDropdown(){isDropdownOpen=true;dropdownPanel.classList.remove('hidden');dropdownIcon.style.transform='rotate(180deg)';tempUsers=currentUsers;userInput.value=tempUsers;updateQuickBtnStyles();}function closeDropdown(){isDropdownOpen=false;dropdownPanel.classList.add('hidden');dropdownIcon.style.transform='rotate(0deg)';}function toggleDropdown(e){e.preventDefault();e.stopPropagation();isDropdownOpen?closeDropdown():openDropdown();}function updateQuickBtnStyles(){quickBtns.forEach(b=>{const u=parseInt(b.dataset.users);if(u===tempUsers){b.classList.remove('bg-slate-100','text-slate-600','hover:bg-[#31BCBC]','hover:text-white');b.classList.add('bg-[#31BCBC]','text-white');}else{b.classList.remove('bg-[#31BCBC]','text-white');b.classList.add('bg-slate-100','text-slate-600','hover:bg-[#31BCBC]','hover:text-white');}});}function applyUserSelection(){currentUsers=tempUsers;dropdownValue.textContent=currentUsers+(currentUsers===1?' User':' Users');closeDropdown();updatePrice();}billingToggle.addEventListener('click',(e)=>{e.preventDefault();e.stopPropagation();toggleBilling();});monthlyLabel.addEventListener('click',(e)=>{e.preventDefault();if(currentPeriod!=='monthly')toggleBilling();});yearlyLabel.addEventListener('click',(e)=>{e.preventDefault();if(currentPeriod!=='yearly')toggleBilling();});dropdownBtn.addEventListener('click',toggleDropdown);dropdownPanel.addEventListener('click',(e)=>e.stopPropagation());document.addEventListener('click',(e)=>{if(isDropdownOpen&&!dropdownContainer.contains(e.target))closeDropdown();});window.addEventListener('scroll',()=>{if(isDropdownOpen)closeDropdown();},{passive:true});quickBtns.forEach(b=>b.addEventListener('click',(e)=>{e.preventDefault();e.stopPropagation();tempUsers=parseInt(b.dataset.users);userInput.value=tempUsers;updateQuickBtnStyles();}));decrementBtn.addEventListener('click',(e)=>{e.preventDefault();e.stopPropagation();if(tempUsers>1){tempUsers--;userInput.value=tempUsers;updateQuickBtnStyles();}});incrementBtn.addEventListener('click',(e)=>{e.preventDefault();e.stopPropagation();if(tempUsers<40){tempUsers++;userInput.value=tempUsers;updateQuickBtnStyles();}});userInput.addEventListener('input',(e)=>{let v=parseInt(e.target.value);if(isNaN(v)||v<1)v=1;if(v>40)v=40;tempUsers=v;updateQuickBtnStyles();});userInput.addEventListener('blur',(e)=>{let v=parseInt(e.target.value);if(isNaN(v)||v<1){e.target.value=1;tempUsers=1;}else if(v>40){e.target.value=40;tempUsers=40;}updateQuickBtnStyles();});applyBtn.addEventListener('click',(e)=>{e.preventDefault();e.stopPropagation();applyUserSelection();});priceEl.style.transition='opacity 0.15s ease, transform 0.15s ease';toggleDot.style.transition='left 0.3s ease, right 0.3s ease';dropdownIcon.style.transition='transform 0.2s ease';updateToggleUI();dropdownValue.textContent=currentUsers+' Users';userInput.value=currentUsers;updateQuickBtnStyles();updatePrice();})();

// ==========================================
// GLOBAL KEYBOARD SHORTCUTS
// ==========================================
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeVideoModal();

    if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        const searchInput = document.getElementById('video-search') ||
                           document.getElementById('feature-search') ||
                           document.getElementById('blog-search') ||
                           document.getElementById('search-input') ||
                           document.querySelector('input[type="search"]') ||
                           document.querySelector('input[type="text"]');
        if (searchInput) searchInput.focus();
    }

    if (e.key === 'Enter' && document.activeElement && document.activeElement.classList.contains('video-card')) {
        document.activeElement.click();
    }
});

// ==========================================
// PRINT STYLES
// ==========================================
window.addEventListener('beforeprint', () => document.querySelectorAll('.accordion-content').forEach(c => c.classList.remove('hidden')));

// ==========================================
// VIDEO CARD ACCESSIBILITY
// ==========================================
function initVideoCardAccessibility() {
    document.querySelectorAll('.video-card').forEach(card => {
        if (!card.hasAttribute('tabindex')) card.setAttribute('tabindex', '0');
        if (!card.hasAttribute('role')) card.setAttribute('role', 'button');
        const title = card.querySelector('h3');
        if (title && !card.hasAttribute('aria-label')) card.setAttribute('aria-label', title.textContent);
    });
}

// ==========================================
// INITIALIZE
// ==========================================
document.addEventListener('DOMContentLoaded', () => {
    const firstTabById = document.getElementById('tab-inventory');
    const firstTabByData = document.querySelector('.module-tab[data-module]');
    if (firstTabById) switchModule('inventory'); else if (firstTabByData) firstTabByData.click();

    const firstPill = document.querySelector('.category-pill');
    if (firstPill && !document.querySelector('.category-pill.active')) firstPill.classList.add('active');

    const firstFilterPill = document.querySelector('.filter-pill');
    if (firstFilterPill && !document.querySelector('.filter-pill.active')) firstFilterPill.classList.add('active');

    initVideoCardAccessibility();

    console.log('All scripts initialized');
});