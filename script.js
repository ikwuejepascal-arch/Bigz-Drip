const loadingStartedAt = performance.now();
const loadingScreen = document.createElement('div');
loadingScreen.className = 'loading-screen';
loadingScreen.setAttribute('role', 'status');
loadingScreen.setAttribute('aria-label', 'Loading BigZ Drip');
loadingScreen.innerHTML = '<div class="loading-mark"><span>BIG</span>Z<span class="brand-dot">.</span></div><div class="loading-track"><span></span></div><small>Loading the drop</small>';
document.body.prepend(loadingScreen);
document.documentElement.classList.add('is-loading');

function hideLoadingScreen() {
	const minimumDisplayTime = 650;
	const remainingTime = Math.max(0, minimumDisplayTime - (performance.now() - loadingStartedAt));
	setTimeout(() => {
		loadingScreen.classList.add('is-hidden');
		document.documentElement.classList.remove('is-loading');
		setTimeout(() => loadingScreen.remove(), 500);
	}, remainingTime);
}

 // ========== NAVBAR AUTO-HIDE ON SCROLL STOP ==========
        const head = document.querySelector(".header");
        let scrollTimeout;

        window.addEventListener("scroll", () => {
            // Show navbar while scrolling
            head.classList.remove("hidden");

            // Clear any existing timeout
            clearTimeout(scrollTimeout);

            // If not at the top, set a timeout to hide after scrolling stops
            if (window.scrollY > 0) {
                scrollTimeout = setTimeout(() => {
                    head.classList.add("hidden");
                }, 5000); // 500ms after scrolling stops
            } else {
                // At the top, ensure it's visible
                head.classList.remove("hidden");
            }
        });



		
if (document.readyState === 'complete') hideLoadingScreen();
else window.addEventListener('load', hideLoadingScreen, { once: true });

const slides = document.querySelectorAll('.slide');
const slideNumber = document.querySelector('#slide-number');
const nextButton = document.querySelector('.next');
const previousButton = document.querySelector('.previous');
let currentSlide = 0;

function showSlide(index) {
	currentSlide = (index + slides.length) % slides.length;
	slides.forEach((slide, slideIndex) => slide.classList.toggle('is-active', slideIndex === currentSlide));
	slideNumber.textContent = String(currentSlide + 1).padStart(2, '0');
}

if (slides.length && slideNumber && nextButton && previousButton) {
	nextButton.addEventListener('click', () => showSlide(currentSlide + 1));
	previousButton.addEventListener('click', () => showSlide(currentSlide - 1));
	setInterval(() => showSlide(currentSlide + 1), 6000);
}

const menuButton = document.querySelector('.menu-button');
const navigation = document.querySelector('.header nav');
if (menuButton && navigation) {
	const mobileNavigation = document.createElement('div');
	mobileNavigation.className = 'mobile-nav';
	mobileNavigation.innerHTML = `${navigation.innerHTML}<small>BigZ Drip / Wear your story</small>`;
	document.querySelector('.header').appendChild(mobileNavigation);
	menuButton.setAttribute('aria-expanded', 'false');
	menuButton.addEventListener('click', () => {
		const isOpen = mobileNavigation.classList.toggle('is-open');
		menuButton.setAttribute('aria-expanded', String(isOpen));
		menuButton.setAttribute('aria-label', isOpen ? 'Close menu' : 'Open menu');
	});
	mobileNavigation.querySelectorAll('a').forEach((link) => link.addEventListener('click', () => {
		mobileNavigation.classList.remove('is-open');
		menuButton.setAttribute('aria-expanded', 'false');
	}));
}

const collectionFilters = document.querySelectorAll('.collection-filter-button');
const collectionSections = document.querySelectorAll('[data-collection]');
const cartStorageKey = 'bigz-cart';

function readCart() {
	try { return JSON.parse(localStorage.getItem(cartStorageKey)) || []; } catch (error) { return []; }
}

function saveCart(cart) {
	localStorage.setItem(cartStorageKey, JSON.stringify(cart));
}

function updateBagCounts(cart = readCart()) {
	const itemCount = cart.reduce((total, item) => total + item.quantity, 0);
	document.querySelectorAll('.bag span').forEach((count) => { count.textContent = String(itemCount); });
}

function addToCart(card) {
	const product = {
		id: `${card.querySelector('img')?.getAttribute('src')}-${card.querySelector('h3')?.textContent.trim()}`,
		name: card.querySelector('h3')?.textContent.trim() || 'BigZ item',
		description: card.querySelector('.product-info p')?.textContent.trim() || '',
		image: card.querySelector('img')?.getAttribute('src') || '',
		price: Number.parseFloat(card.querySelector('.product-info strong')?.textContent.replace(/[^0-9.]/g, '')) || 0,
		quantity: 1
	};
	const cart = readCart();
	const existingItem = cart.find((item) => item.id === product.id);
	if (existingItem) existingItem.quantity += 1;
	else cart.push(product);
	saveCart(cart);
	updateBagCounts(cart);
}

function renderCart() {
	const cartItems = document.querySelector('[data-cart-items]');
	const cartTotal = document.querySelector('[data-cart-total]');
	if (!cartItems || !cartTotal) return;
	const cart = readCart();
	const subtotal = cart.reduce((total, item) => total + item.price * item.quantity, 0);
	cartTotal.textContent = `$${subtotal.toFixed(2)}`;
	updateBagCounts(cart);
	if (!cart.length) {
		cartItems.innerHTML = '<p class="cart-empty">Your bag is waiting for something good.</p>';
		return;
	}
	cartItems.innerHTML = cart.map((item) => `
		<article class="cart-item" data-cart-item="${escapeDropText(item.id)}">
			<img class="cart-item-image" src="${escapeDropText(item.image)}" alt="${escapeDropText(item.name)}">
			<div><h2>${escapeDropText(item.name)}</h2><p>${escapeDropText(item.description)}</p><p class="cart-item-price">$${item.price.toFixed(2)}</p></div>
			<div class="cart-item-actions"><div class="quantity-control"><button type="button" data-cart-decrease="${escapeDropText(item.id)}" aria-label="Decrease ${escapeDropText(item.name)} quantity">-</button><span>${item.quantity}</span><button type="button" data-cart-increase="${escapeDropText(item.id)}" aria-label="Increase ${escapeDropText(item.name)} quantity">+</button></div><button class="cart-remove" type="button" data-cart-remove="${escapeDropText(item.id)}">Remove</button></div>
		</article>`).join('');
}

document.addEventListener('click', (event) => {
	const target = event.target.closest('[data-cart-increase], [data-cart-decrease], [data-cart-remove], [data-cart-clear], [data-cart-checkout]');
	if (!target) return;
	if (target.matches('[data-cart-checkout]')) {
		window.alert('Checkout is ready to connect to your payment provider.');
		return;
	}
	let cart = readCart();
	if (target.matches('[data-cart-clear]')) cart = [];
	else if (target.dataset.cartRemove) cart = cart.filter((item) => item.id !== target.dataset.cartRemove);
	else {
		const item = cart.find((entry) => entry.id === (target.dataset.cartIncrease || target.dataset.cartDecrease));
		if (item) item.quantity += target.dataset.cartIncrease ? 1 : -1;
		cart = cart.filter((entry) => entry.quantity > 0);
	}
	saveCart(cart);
	renderCart();
});



function filterCollections(filter) {
	collectionSections.forEach((section) => {
		section.hidden = filter !== 'all' && section.dataset.collection !== filter;
	});
	collectionFilters.forEach((button) => {
		const isActive = button.dataset.filter === filter;
		button.classList.toggle('is-active', isActive);
		button.setAttribute('aria-selected', String(isActive));
	});
}

collectionFilters.forEach((button) => {
	button.addEventListener('click', () => filterCollections(button.dataset.filter));
});

if (collectionFilters.length && collectionSections.length) {
	filterCollections('all');
}

const accessoryFilters = document.querySelectorAll('[data-accessory-filter]');
const accessoryProducts = document.querySelectorAll('[data-accessory-category]');

function filterAccessories(filter) {
	accessoryProducts.forEach((product) => {
		product.hidden = filter !== 'all' && product.dataset.accessoryCategory !== filter;
	});
	accessoryFilters.forEach((button) => {
		const isActive = button.dataset.accessoryFilter === filter;
		button.classList.toggle('is-active', isActive);
		button.setAttribute('aria-selected', String(isActive));
	});
}

accessoryFilters.forEach((button) => {
	button.addEventListener('click', () => filterAccessories(button.dataset.accessoryFilter));
});

if (accessoryFilters.length && accessoryProducts.length) {
	filterAccessories('all');
}

renderCart();

const homeFilters = document.querySelectorAll('[data-home-filter]');
const homeProducts = document.querySelectorAll('[data-home-category]');

function filterHomeProducts(filter) {
	homeProducts.forEach((product) => {
		product.hidden = filter !== 'all' && product.dataset.homeCategory !== filter;
	});
	homeFilters.forEach((button) => {
		const isActive = button.dataset.homeFilter === filter;
		button.classList.toggle('active', isActive);
		button.setAttribute('aria-selected', String(isActive));
	});
}

homeFilters.forEach((button) => {
	button.addEventListener('click', () => filterHomeProducts(button.dataset.homeFilter));
});

if (homeFilters.length && homeProducts.length) {
	filterHomeProducts('all');
}

const productBackImages = {
	'IMG/Z.jpeg': 'IMG/Z 2.jpeg',
	'IMG/25.jpeg': 'IMG/25back.jpeg',
	'IMG/woman.jpeg': 'IMG/backwo.jpeg',
	'IMG/wome.jpeg': 'IMG/backwo.jpeg',
	'IMG/bzd.jpeg': 'IMG/bzd back.jpeg',
	'IMG/ziz.jpeg': 'IMG/zizback.jpeg',
	'IMG/jes.jpeg': 'IMG/jesback.jpeg',
	'IMG/back.jpeg': 'IMG/back 2.jpeg',
	'IMG/twopice.jpeg': 'IMG/two 3.jpeg',
	'IMG/two.jpeg': 'IMG/two 3.jpeg',
	'IMG/cap.jpeg': 'IMG/cap black.jpeg',
	'IMG/cap2.jpeg': 'IMG/cap whait.jpeg',
	'IMG/cap black.jpeg': 'IMG/cap whait.jpeg',
	'IMG/cap whait.jpeg': 'IMG/cap black.jpeg'
};

document.querySelectorAll('.product-card .product-image').forEach((productImage) => {
	const frontImage = productImage.querySelector('img');
	if (!frontImage || productImage.querySelector('.product-back-image')) return;
	const frontSource = frontImage.getAttribute('src');
	const backSource = productBackImages[frontSource] || 'IMG/back.jpeg';
	frontImage.classList.add('product-front');
	const backImage = document.createElement('img');
	backImage.className = 'product-back-image';
	backImage.src = backSource;
	backImage.alt = `${frontImage.alt} back view`;
	backImage.setAttribute('aria-hidden', 'true');
	productImage.appendChild(backImage);
});

updateBagCounts();

document.querySelectorAll('.quick-add').forEach((button) => {
	button.addEventListener('click', () => {
		addToCart(button.closest('.product-card'));
		button.textContent = '✓';
		button.setAttribute('aria-label', 'Added to bag');
		setTimeout(() => { button.textContent = '+'; }, 1300);
	});
});
const headerActions = document.querySelector('.header-actions');
if (headerActions && !headerActions.querySelector('.site-search')) {
	const siteSearch = document.createElement('div');
	siteSearch.className = 'site-search';
	siteSearch.innerHTML = '<button class="icon-button" aria-label="Open search" type="button" data-search-toggle>⌕</button><input type="search" id="menu-search" placeholder="Search clothes or posts" aria-label="Search clothes or posts" autocomplete="off"><div class="search-results" id="search-results" role="status" aria-live="polite"></div>';
	headerActions.insertBefore(siteSearch, headerActions.firstElementChild);
}

const searchInput = document.getElementById('menu-search');
const searchToggle = document.querySelector('[data-search-toggle]');
const searchResults = document.getElementById('search-results');

function searchSite(query) {
	if (!searchResults) return;
	const normalizedQuery = query.trim().toLowerCase();
	if (!normalizedQuery) {
		searchResults.innerHTML = '';
		searchResults.hidden = true;
		return;
	}
	const clothingResults = [...document.querySelectorAll('.product-card')]
		.map((card) => ({
			name: card.querySelector('h3')?.textContent.trim() || '',
			description: card.querySelector('.product-info p')?.textContent.trim() || '',
			image: card.querySelector('img')?.getAttribute('src') || '',
			price: card.querySelector('.product-info strong')?.textContent.trim() || '',
			section: card.closest('[id]')?.id || 'shop'
		}))
		.filter((item) => `${item.name} ${item.description}`.toLowerCase().includes(normalizedQuery))
		.slice(0, 8);
	const postResults = readLocalDropPosts()
		.filter((post) => `${post.title} ${post.text || post.body || ''}`.toLowerCase().includes(normalizedQuery))
		.slice(0, 5);
	const results = [
		...clothingResults.map((item) => `<a class="search-result" href="#${escapeDropText(item.section)}"><span>Clothing</span><strong>${escapeDropText(item.name)}</strong><small>${escapeDropText(item.description)} / ${escapeDropText(item.price)}</small></a>`),
		...postResults.map((post) => `<a class="search-result" href="blog.html#drop-board"><span>Post</span><strong>${escapeDropText(post.title)}</strong><small>${escapeDropText(post.text || post.body || '')}</small></a>`)
	];
	searchResults.innerHTML = results.length ? results.join('') : '<p class="search-empty">No clothing or posts found.</p>';
	searchResults.hidden = false;
}

if (searchInput) {
	searchInput.addEventListener('input', () => searchSite(searchInput.value));
	searchInput.addEventListener('keydown', (event) => {
		if (event.key === 'Escape') {
			searchInput.value = '';
			searchSite('');
			searchInput.blur();
		}
	});
}

if (searchToggle && searchInput) {
	searchToggle.addEventListener('click', () => {
		const isOpen = document.querySelector('.site-search.is-open');
		document.querySelector('.site-search').classList.toggle('is-open', !isOpen);
		if (!isOpen) searchInput.focus();
	});
}

const dropStorageKey = 'bigz-drop-posts';
const dropForms = document.querySelectorAll('[data-drop-form]');
const dropFeeds = document.querySelectorAll('[data-drop-feed]');
const publisherPage = Boolean(document.querySelector('.post-page'));
const hasSupabase = window.supabase && window.BIGZ_SUPABASE_URL && window.BIGZ_SUPABASE_ANON_KEY;
const supabaseClient = hasSupabase ? window.supabase.createClient(window.BIGZ_SUPABASE_URL, window.BIGZ_SUPABASE_ANON_KEY) : null;

function escapeDropText(value) {
	return String(value).replace(/[&<>'"]/g, (character) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' }[character]));
}

function readLocalDropPosts() {
	try { return JSON.parse(localStorage.getItem(dropStorageKey)) || []; } catch (error) { return []; }
}

function saveLocalDropPosts(posts) {
	localStorage.setItem(dropStorageKey, JSON.stringify(posts));
}

async function readDropPosts() {
	if (!supabaseClient) return readLocalDropPosts();
	const { data, error } = await supabaseClient.from('drop_posts').select('*, drop_replies(*)').order('created_at', { ascending: false });
	if (error) throw error;
	return data.map((post) => ({ ...post, text: post.body, date: new Date(post.created_at).toLocaleDateString('en-GB'), media: post.media_url, replies: post.drop_replies || [] }));
}

function renderDropFeeds(posts) {
	dropFeeds.forEach((feed) => {
		feed.innerHTML = posts.length ? posts.map((post) => `
			<article class="drop-post" id="drop-${escapeDropText(post.id)}" data-post-id="${escapeDropText(post.id)}">
				${post.media ? (post.mediaType?.startsWith('video/') ? `<video controls src="${post.media}"></video>` : `<img src="${post.media}" alt="${escapeDropText(post.title)}">`) : ''}
				<div class="drop-post-copy">
					<span class="drop-date">${escapeDropText(post.date)}</span><h4>${escapeDropText(post.title)}</h4><p>${escapeDropText(post.text)}</p>
					<div class="drop-post-actions">
					<button class="post-action" type="button" data-like-post="${post.id}" aria-label="Like this drop" title="Like">
					<span class="action-icon" aria-hidden="true">♡</span><span>${post.likes}</span></button><button class="post-action" type="button" data-comments-post="${post.id}" aria-label="View comments" title="Comments"><span class="action-icon" aria-hidden="true">💬</span><span>${post.replies.length}</span></button><button class="post-action share-action" type="button" data-share-post="${post.id}" data-share-title="${escapeDropText(post.title)}" aria-label="Share this drop" title="Share"><span class="action-icon" aria-hidden="true">↗️</span></button>${publisherPage ? `<button class="post-action delete-action" type="button" data-delete-post="${post.id}" aria-label="Cancel this post" title="Cancel post"><span class="action-icon" aria-hidden="true">⌫</span></button>` : ''}</div>
					<div class="comments-panel" data-comments-panel="${post.id}" hidden><div class="drop-replies">${post.replies.map((reply) => `<p><strong>${escapeDropText(reply.name)}:</strong> ${escapeDropText(reply.body || reply.text)}</p>`).join('')}</div><form class="reply-form" data-reply-form="${post.id}"><input name="name" placeholder="Your name" required><input name="reply" placeholder="Write a comment" required><button type="submit" aria-label="Post comment" title="Post comment">↗</button></form></div>
				</div>
			</article>`).join('') : '<p class="drop-empty">Your published drops and buyer comments will appear here.</p>';
	});
}

async function refreshDropFeeds() {
	try { renderDropFeeds(await readDropPosts()); } catch (error) { renderDropFeeds(readLocalDropPosts()); }
}

async function publishDrop(form, file) {
	let mediaUrl = '';
	if (file && supabaseClient) {
		const path = `${crypto.randomUUID()}-${file.name}`;
		const upload = await supabaseClient.storage.from('drop-media').upload(path, file);
		if (upload.error) throw upload.error;
		mediaUrl = supabaseClient.storage.from('drop-media').getPublicUrl(path).data.publicUrl;
	} else if (file) {
		mediaUrl = await new Promise((resolve) => { const reader = new FileReader(); reader.addEventListener('load', () => resolve(reader.result)); reader.readAsDataURL(file); });
	}
	if (supabaseClient) {
		const { error } = await supabaseClient.from('drop_posts').insert({ title: form.elements.title.value.trim(), body: form.elements.text.value.trim(), media_url: mediaUrl || null, media_type: file?.type || null });
		if (error) throw error;
	} else {
		const posts = readLocalDropPosts();
		posts.unshift({ id: Date.now(), date: new Date().toLocaleDateString('en-GB'), title: form.elements.title.value.trim(), text: form.elements.text.value.trim(), media: mediaUrl, mediaType: file?.type || '', likes: 0, replies: [] });
		saveLocalDropPosts(posts);
	}
}

dropForms.forEach((form) => {
	const fileInput = form.querySelector('input[type="file"]');
	const fileName = form.querySelector('[data-file-name]');
	fileInput.addEventListener('change', () => { fileName.textContent = fileInput.files[0]?.name || 'No file selected'; });
	form.addEventListener('submit', async (event) => {
		event.preventDefault();
		try { await publishDrop(form, fileInput.files[0]); form.reset(); fileName.textContent = 'No file selected'; await refreshDropFeeds(); } catch (error) { window.alert('The drop could not be published. Check your Supabase setup.'); }
	});
});

document.addEventListener('click', async (event) => {
	const likeButton = event.target.closest('[data-like-post]');
	if (likeButton) {
		if (supabaseClient) await supabaseClient.rpc('increment_drop_like', { post_id: likeButton.dataset.likePost });
		else { const posts = readLocalDropPosts(); const post = posts.find((item) => String(item.id) === likeButton.dataset.likePost); if (post) { post.likes += 1; saveLocalDropPosts(posts); } }
		await refreshDropFeeds();
		return;
	}
	const commentsButton = event.target.closest('[data-comments-post]');
	if (commentsButton) {
		const post = commentsButton.closest('.drop-post');
		const panel = post?.querySelector('[data-comments-panel]');
		if (panel && post) {
			panel.hidden = !panel.hidden;
			post.classList.toggle('is-comments-open', !panel.hidden);
		}
		return;
	}
	const shareButton = event.target.closest('[data-share-post]');
	if (shareButton) {
		const shareUrlObject = new URL('index.html', window.location.href);
		shareUrlObject.hash = `drop-${shareButton.dataset.sharePost}`;
		const shareUrl = shareUrlObject.href;
		try {
			if (navigator.share) await navigator.share({ title: shareButton.dataset.shareTitle, text: `Check out ${shareButton.dataset.shareTitle} from BigZ Drip.`, url: shareUrl });
			else if (navigator.clipboard) { await navigator.clipboard.writeText(shareUrl); window.alert('Post link copied.'); }
			else { window.prompt('Copy this post link:', shareUrl); }
		} catch (error) { if (error.name !== 'AbortError') window.alert('The post link could not be shared.'); }
		return;
	}
	const deleteButton = event.target.closest('[data-delete-post]');
	if (deleteButton) {
		if (!window.confirm('Cancel this post? Buyers will no longer see it.')) return;
		try {
			if (supabaseClient) {
				const { error } = await supabaseClient.from('drop_posts').delete().eq('id', deleteButton.dataset.deletePost);
				if (error) throw error;
			} else {
				saveLocalDropPosts(readLocalDropPosts().filter((post) => String(post.id) !== deleteButton.dataset.deletePost));
			}
			await refreshDropFeeds();
		} catch (error) { window.alert('The post could not be cancelled. Check your Supabase setup.'); }
	}
});

document.addEventListener('submit', async (event) => {
	const replyForm = event.target.closest('[data-reply-form]');
	if (!replyForm) return;
	event.preventDefault();
	if (supabaseClient) await supabaseClient.from('drop_replies').insert({ post_id: replyForm.dataset.replyForm, name: replyForm.elements.name.value.trim(), body: replyForm.elements.reply.value.trim() });
	else { const posts = readLocalDropPosts(); const post = posts.find((item) => String(item.id) === replyForm.dataset.replyForm); if (post) { post.replies.push({ name: replyForm.elements.name.value.trim(), text: replyForm.elements.reply.value.trim() }); saveLocalDropPosts(posts); } }
	await refreshDropFeeds();
});

refreshDropFeeds();
