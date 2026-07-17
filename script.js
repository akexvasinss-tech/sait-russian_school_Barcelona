const faqAccordionBoundButtons = new WeakSet();
const accordionMobileMedia = window.matchMedia('(max-width: 720px)');

function compensateButtonShift(button, topBeforeOpen) {
	if (!accordionMobileMedia.matches) return;
	const panelId = button.getAttribute('aria-controls');
	if (!panelId) return;
	const panel = document.getElementById(panelId);
	if (!panel) return;

	requestAnimationFrame(() => {
		window.setTimeout(() => {
			if (button.classList.contains('ages-tab-button')) {
				const target =
					panel.querySelector('.ages-left') ||
					panel.querySelector('.ages-panel-title') ||
					panel;
				const targetTop = target.getBoundingClientRect().top;
				if (targetTop !== 0) {
					window.scrollBy({ top: targetTop, behavior: 'smooth' });
				}
				return;
			}

			const rect = panel.getBoundingClientRect();
			const overflowBottom = rect.bottom - window.innerHeight;
			if (overflowBottom > 0) {
				window.scrollBy({ top: overflowBottom, behavior: 'smooth' });
			}
		}, 30);
	});
}

function initFaqAccordion(buttons, options = {}) {
	const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const singleOpen = options.singleOpen !== false;
	const compensateShift = options.compensateShift !== false;
	const onStateChange = typeof options.onStateChange === 'function' ? options.onStateChange : null;

	function getPanel(button) {
		const panelId = button.getAttribute('aria-controls');
		return panelId ? document.getElementById(panelId) : null;
	}

	function open(panel, button, topBeforeOpen) {
		button.setAttribute('aria-expanded', 'true');
		if (onStateChange) onStateChange(button, true);
		if (prefersReduced) {
			panel.style.height = 'auto';
			if (compensateShift) {
				requestAnimationFrame(() => compensateButtonShift(button, topBeforeOpen));
			}
			return;
		}

		panel.style.display = 'block';
		panel.style.willChange = 'height';
		const height = panel.scrollHeight;
		panel.style.height = '0px';
		requestAnimationFrame(() => panel.style.height = height + 'px');

		const onEnd = (e) => {
			if (e.propertyName !== 'height') return;
			panel.style.height = 'auto';
			panel.style.willChange = '';
			if (compensateShift) compensateButtonShift(button, topBeforeOpen);
			panel.removeEventListener('transitionend', onEnd);
		};
		panel.addEventListener('transitionend', onEnd);
	}

	function close(panel, button) {
		button.setAttribute('aria-expanded', 'false');
		if (onStateChange) onStateChange(button, false);
		if (prefersReduced) {
			panel.style.height = '0px';
			return;
		}

		const height = panel.scrollHeight;
		panel.style.willChange = 'height';
		panel.style.height = height + 'px';
		requestAnimationFrame(() => panel.style.height = '0px');

		const onEnd = (e) => {
			if (e.propertyName !== 'height') return;
			panel.style.display = '';
			panel.style.willChange = '';
			panel.removeEventListener('transitionend', onEnd);
		};
		panel.addEventListener('transitionend', onEnd);
	}

	function toggle(button, panel) {
		const isOpen = button.getAttribute('aria-expanded') === 'true';
		if (isOpen) {
			close(panel, button);
			return;
		}

		const topBeforeOpen = compensateShift ? button.getBoundingClientRect().top : 0;

		if (singleOpen) {
			buttons.forEach((other) => {
				if (other === button) return;
				const otherPanel = getPanel(other);
				if (!otherPanel) return;
				if (other.getAttribute('aria-expanded') === 'true') close(otherPanel, other);
			});
		}

		open(panel, button, topBeforeOpen);
	}

	buttons.forEach((button) => {
		const panel = getPanel(button);
		if (!panel) return;
		panel.style.height = '0px';
		panel.style.overflow = 'hidden';

		if (faqAccordionBoundButtons.has(button)) return;
		button.addEventListener('click', () => toggle(button, panel));
		faqAccordionBoundButtons.add(button);
	});
}

// script.js — basic JS для аккордеона FAQ
document.addEventListener('DOMContentLoaded', () => {
	const questions = Array.from(document.querySelectorAll('.faq-question'));
	if (!questions.length) return;
	initFaqAccordion(questions, { singleOpen: true });
});

/* Ages photo sliders */
document.addEventListener('DOMContentLoaded', () => {
	const sliderPhotos = {
		'1': [
			{ src: 'assets/images/age-group-1.jpg', alt: 'Дошкольники на занятиях' },
			{ src: 'assets/images/preschool-2.jpg',  alt: 'Дошкольники' },
			{ src: 'assets/images/preschool-3.jpg',  alt: 'Дошкольники' }
		],
		'2': [
			{ src: 'assets/images/age-group-2.jpg', alt: 'Начальная школа на занятиях' },
			{ src: 'assets/images/primary-2.jpg',   alt: 'Начальная школа' },
			{ src: 'assets/images/primary-3.jpg',   alt: 'Начальная школа' }
		],
		'3': [
			{ src: 'assets/images/age-group-3.jpg', alt: 'Средняя школа на занятиях' },
			{ src: 'assets/images/middle-2.jpg',    alt: 'Средняя школа' },
			{ src: 'assets/images/middle-3.jpg',    alt: 'Средняя школа' }
		],
		'4': [
			{ src: 'assets/images/age-group-4.jpg', alt: 'Кружки и студии' },
			{ src: 'assets/images/clubs-2.jpg',     alt: 'Кружки и студии' },
			{ src: 'assets/images/clubs-3.jpg',     alt: 'Кружки и студии' }
		]
	};

	const state = { '1': 0, '2': 0, '3': 0, '4': 0 };

	function goTo(panelId, index) {
		const photos = sliderPhotos[panelId];
		const slider = document.querySelector(`.ages-slider[data-panel="${panelId}"]`);
		if (!slider) return;
		const img = slider.querySelector('.ages-image');
		const n = photos.length;
		state[panelId] = (index + n) % n;
		img.classList.add('fading');
		setTimeout(() => {
			img.src = photos[state[panelId]].src;
			img.alt = photos[state[panelId]].alt;
			img.classList.remove('fading');
		}, 250);
	}

	document.querySelectorAll('.ages-slider').forEach(slider => {
		const panelId = slider.dataset.panel;
		slider.querySelector('.slider-btn--prev').addEventListener('click', () => goTo(panelId, state[panelId] - 1));
		slider.querySelector('.slider-btn--next').addEventListener('click', () => goTo(panelId, state[panelId] + 1));
	});

});

/* Ages programs accordion (single delegated handler) */
document.addEventListener('DOMContentLoaded', () => {
	const ages = document.querySelector('.ages');
	if (!ages) return;

	const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
	const SCROLL_TOP_GAP = 24;
	const TRANSITION_MS = 340;
	const animationState = new WeakMap();

	const groupButtons = Array.from(ages.querySelectorAll('button.ages-tab-button'));
	const subjectButtons = Array.from(ages.querySelectorAll('button.activity-title'));
	if (!groupButtons.length) return;

	function getPanel(button) {
		const panelId = button.getAttribute('aria-controls');
		return panelId ? document.getElementById(panelId) : null;
	}

	function smoothScrollToElement(el) {
		const targetY = window.scrollY + el.getBoundingClientRect().top - SCROLL_TOP_GAP;
		window.scrollTo({ top: Math.max(0, targetY), behavior: 'smooth' });
	}

	function stopAnimation(panel) {
		const stop = animationState.get(panel);
		if (stop) stop();
		animationState.delete(panel);
	}

	function expand(button, panel, onDone, topBeforeOpen) {
		stopAnimation(panel);
		button.setAttribute('aria-expanded', 'true');
		button.classList.add('active');
		panel.classList.add('active');
		panel.style.display = 'block';
		panel.style.overflow = 'hidden';

		if (prefersReduced) {
			panel.style.height = 'auto';
			requestAnimationFrame(() => compensateButtonShift(button, topBeforeOpen));
			if (typeof onDone === 'function') onDone();
			return;
		}

		const targetHeight = panel.scrollHeight;
		panel.style.height = '0px';
		panel.style.willChange = 'height';
		requestAnimationFrame(() => {
			panel.style.height = targetHeight + 'px';
		});

		const finalize = () => {
			stopAnimation(panel);
			panel.style.height = 'auto';
			panel.style.willChange = '';
			compensateButtonShift(button, topBeforeOpen);
			if (typeof onDone === 'function') onDone();
		};

		const onEnd = (e) => {
			if (e.propertyName !== 'height') return;
			finalize();
		};

		panel.addEventListener('transitionend', onEnd);
		const timer = window.setTimeout(finalize, TRANSITION_MS);
		animationState.set(panel, () => {
			window.clearTimeout(timer);
			panel.removeEventListener('transitionend', onEnd);
		});
	}

	function collapse(button, panel) {
		stopAnimation(panel);
		button.setAttribute('aria-expanded', 'false');
		button.classList.remove('active');

		if (prefersReduced) {
			panel.style.height = '0px';
			panel.style.display = '';
			panel.classList.remove('active');
			return;
		}

		panel.style.display = 'block';
		panel.style.overflow = 'hidden';
		panel.style.height = panel.scrollHeight + 'px';
		panel.style.willChange = 'height';
		requestAnimationFrame(() => {
			panel.style.height = '0px';
		});

		const finalize = () => {
			stopAnimation(panel);
			panel.style.display = '';
			panel.style.willChange = '';
			panel.classList.remove('active');
		};

		const onEnd = (e) => {
			if (e.propertyName !== 'height') return;
			finalize();
		};

		panel.addEventListener('transitionend', onEnd);
		const timer = window.setTimeout(finalize, TRANSITION_MS);
		animationState.set(panel, () => {
			window.clearTimeout(timer);
			panel.removeEventListener('transitionend', onEnd);
		});
	}

	function getSubjectParentPanel(button) {
		return button.closest('.ages-panel');
	}

	function isSubjectGroupOpen(button) {
		const parentPanel = getSubjectParentPanel(button);
		if (!parentPanel) return false;
		const parentButtonId = parentPanel.getAttribute('aria-labelledby');
		const parentButton = parentButtonId ? document.getElementById(parentButtonId) : null;
		return Boolean(parentButton && parentButton.getAttribute('aria-expanded') === 'true');
	}

	function closeSubjectPanel(button, panel) {
		stopAnimation(panel);
		button.setAttribute('aria-expanded', 'false');
		button.classList.remove('active');

		if (prefersReduced) {
			panel.style.height = '0px';
			panel.style.display = '';
			return;
		}

		panel.style.display = 'block';
		panel.style.overflow = 'hidden';
		panel.style.height = panel.scrollHeight + 'px';
		panel.style.willChange = 'height';
		requestAnimationFrame(() => {
			panel.style.height = '0px';
		});

		const finalize = () => {
			stopAnimation(panel);
			panel.style.display = '';
			panel.style.willChange = '';
		};

		const onEnd = (e) => {
			if (e.propertyName !== 'height') return;
			finalize();
		};

		panel.addEventListener('transitionend', onEnd);
		const timer = window.setTimeout(finalize, TRANSITION_MS);
		animationState.set(panel, () => {
			window.clearTimeout(timer);
			panel.removeEventListener('transitionend', onEnd);
		});
	}

	function openSubjectPanel(button, panel, topBeforeOpen) {
		stopAnimation(panel);
		button.setAttribute('aria-expanded', 'true');
		button.classList.add('active');
		panel.style.display = 'block';
		panel.style.overflow = 'hidden';

		if (prefersReduced) {
			panel.style.height = 'auto';
			requestAnimationFrame(() => compensateButtonShift(button, topBeforeOpen));
			return;
		}

		const targetHeight = panel.scrollHeight;
		panel.style.height = '0px';
		panel.style.willChange = 'height';
		requestAnimationFrame(() => {
			panel.style.height = targetHeight + 'px';
		});

		const finalize = () => {
			stopAnimation(panel);
			panel.style.height = 'auto';
			panel.style.willChange = '';
			compensateButtonShift(button, topBeforeOpen);
		};

		const onEnd = (e) => {
			if (e.propertyName !== 'height') return;
			finalize();
		};

		panel.addEventListener('transitionend', onEnd);
		const timer = window.setTimeout(finalize, TRANSITION_MS);
		animationState.set(panel, () => {
			window.clearTimeout(timer);
			panel.removeEventListener('transitionend', onEnd);
		});
	}

	function closeOtherSubjectsInCurrentGroup(currentButton) {
		const parentPanel = getSubjectParentPanel(currentButton);
		if (!parentPanel) return;
		parentPanel.querySelectorAll('button.activity-title').forEach((subjectButton) => {
			if (subjectButton === currentButton) return;
			if (subjectButton.getAttribute('aria-expanded') !== 'true') return;
			const subjectPanel = getPanel(subjectButton);
			if (!subjectPanel) return;
			closeSubjectPanel(subjectButton, subjectPanel);
		});
	}

	function closeAllSubjectsInPanel(panel) {
		panel.querySelectorAll('button.activity-title').forEach((subjectButton) => {
			const subjectPanel = getPanel(subjectButton);
			if (!subjectPanel) return;
			closeSubjectPanel(subjectButton, subjectPanel);
		});
	}

	function initializeSubjectButton(button) {
		const panel = getPanel(button);
		if (!panel) return;

		button.setAttribute('aria-expanded', 'false');
		button.classList.remove('active');
		panel.style.height = '0px';
		panel.style.display = '';
		panel.style.overflow = 'hidden';

		button.addEventListener('click', () => {
			if (!isSubjectGroupOpen(button)) return;

			const isOpen = button.getAttribute('aria-expanded') === 'true';
			if (isOpen) {
				closeSubjectPanel(button, panel);
				return;
			}

			const topBeforeOpen = button.getBoundingClientRect().top;

			closeOtherSubjectsInCurrentGroup(button);
			openSubjectPanel(button, panel, topBeforeOpen);
		});
	}

	groupButtons.forEach((groupButton) => {
		const groupPanel = getPanel(groupButton);
		if (!groupPanel) return;
		const isOpen = groupButton.getAttribute('aria-expanded') === 'true';

		if (isOpen) {
			groupButton.classList.add('active');
			groupPanel.classList.add('active');
			groupPanel.style.display = 'block';
			groupPanel.style.height = 'auto';
		} else {
			groupButton.classList.remove('active');
			groupPanel.classList.remove('active');
			groupPanel.style.display = '';
			groupPanel.style.height = '0px';
		}

		groupPanel.style.overflow = 'hidden';
	});

	subjectButtons.forEach(initializeSubjectButton);

	ages.addEventListener('click', (e) => {
		const target = e.target instanceof Element ? e.target : null;
		if (!target) return;

		const button = target.closest('button.ages-tab-button');
		if (!button || !ages.contains(button)) return;

		const panel = getPanel(button);
		if (!panel) return;
		const isOpen = button.getAttribute('aria-expanded') === 'true';
		if (isOpen) {
			closeAllSubjectsInPanel(panel);
			collapse(button, panel);
			return;
		}

		const topBeforeOpen = button.getBoundingClientRect().top;

		groupButtons.forEach((otherButton) => {
			if (otherButton === button) return;
			if (otherButton.getAttribute('aria-expanded') !== 'true') return;
			const otherPanel = getPanel(otherButton);
			if (!otherPanel) return;
			closeAllSubjectsInPanel(otherPanel);
			collapse(otherButton, otherPanel);
		});

		expand(button, panel, () => {
			const title = panel.querySelector('.ages-panel-title') || panel;
			smoothScrollToElement(title);
		}, topBeforeOpen);
	});
});

/* Lightbox */
document.addEventListener('DOMContentLoaded', () => {
	const galleries = {
		theatre: [
			{ src: 'assets/images/theatre-event-1.jpg', alt: 'Театральные постановки' },
			{ src: 'assets/images/theatre-event-2.jpg', alt: 'Театральные постановки' },
			{ src: 'assets/images/theatre-event-3.jpg', alt: 'Театральные постановки' }
		],
		reading: [
			{ src: 'assets/images/reading-1.jpg', alt: 'Конкурсы чтецов' },
			{ src: 'assets/images/reading-2.jpg', alt: 'Конкурсы чтецов' },
			{ src: 'assets/images/reading-3.jpg', alt: 'Конкурсы чтецов' }
		],
		holiday: [
			{ src: 'assets/images/holiday-1.jpg', alt: 'Традиционные праздники' },
			{ src: 'assets/images/holiday-2.jpg', alt: 'Традиционные праздники' },
			{ src: 'assets/images/holiday-3.jpg', alt: 'Традиционные праздники' }
		]
	};

	const lb = document.getElementById('lightbox');
	const lbImg = lb.querySelector('.lightbox-img');
	const lbPrev = lb.querySelector('.lightbox-prev');
	const lbNext = lb.querySelector('.lightbox-next');
	const lbClose = lb.querySelector('.lightbox-close');
	const lbBackdrop = lb.querySelector('.lightbox-backdrop');

	let current = { key: null, index: 0 };
	let singleImage = null;

	function open(key, index) {
		singleImage = null;
		lb.classList.remove('is-single');
		current = { key, index };
		const photo = galleries[key][index];
		lbImg.src = photo.src;
		lbImg.alt = photo.alt;
		lb.hidden = false;
		document.documentElement.style.overflow = 'hidden';
		document.body.style.overflow = 'hidden';
		requestAnimationFrame(() => lb.classList.add('is-open'));
	}

	function close() {
		lb.classList.remove('is-open');
		lb.classList.remove('is-single');
		singleImage = null;
		setTimeout(() => {
			lb.hidden = true;
			document.documentElement.style.overflow = '';
			document.body.style.overflow = '';
		}, 280);
	}

	function goTo(index) {
		if (singleImage) return;
		const photos = galleries[current.key];
		current.index = (index + photos.length) % photos.length;
		lbImg.classList.add('fading');
		setTimeout(() => {
			lbImg.src = photos[current.index].src;
			lbImg.alt = photos[current.index].alt;
			lbImg.classList.remove('fading');
		}, 250);
	}

	document.querySelectorAll('[data-gallery]').forEach(btn => {
		btn.addEventListener('click', () => open(btn.dataset.gallery, 0));
	});

	document.addEventListener('click', (e) => {
		const target = e.target;
		if (!(target instanceof HTMLImageElement)) return;
		if (!target.matches('.teacher-avatar img')) return;

		target.style.cursor = 'pointer';
		singleImage = { src: target.currentSrc || target.src, alt: target.alt || 'Фото преподавателя' };
		lb.classList.add('is-single');
		lbImg.src = singleImage.src;
		lbImg.alt = singleImage.alt;
		lb.hidden = false;
		document.documentElement.style.overflow = 'hidden';
		document.body.style.overflow = 'hidden';
		requestAnimationFrame(() => lb.classList.add('is-open'));
	});

	lbPrev.addEventListener('click', () => goTo(current.index - 1));
	lbNext.addEventListener('click', () => goTo(current.index + 1));
	lbClose.addEventListener('click', close);
	lbBackdrop.addEventListener('click', close);

	window.addEventListener('keydown', (e) => {
		if (lb.hidden) return;
		if (e.key === 'Escape') close();
		if (e.key === 'ArrowLeft') goTo(current.index - 1);
		if (e.key === 'ArrowRight') goTo(current.index + 1);
	});
});

/* Teachers carousel */
document.addEventListener('DOMContentLoaded', () => {
	const teachers = [
		{ photo: 'assets/images/teacher-1.jpg', name: 'Катерина', role: 'Директор школы', desc: 'Per aspera ad astra' },
		{ photo: 'assets/images/teacher-2.jpg', name: 'Алёна', role: 'Руководитель школьного отделения. Преподаватель окружающего мира', desc: 'Каждое большое открытие начинается с маленького «Почему?»' },
		{ photo: 'assets/images/teacher-3.jpg', name: 'Мария', role: 'Руководитель дошкольного отделения', desc: '' },
		{ photo: 'assets/images/teacher-4.jpg', name: 'Евгений', role: 'История', desc: '«Рай - это место, где бессонный сосед читает бесконечную книгу при свете вечной свечи» — Владимир Владимирович Набоков' },
		{ photo: 'assets/images/teacher-5.jpg', name: 'Ирина', role: 'Музыка', desc: 'Когда ты счастлив- ты наслаждаешься музыкой.. когда тебе грустно- ты понимаешь текст песни..' },
		{ photo: 'assets/images/teacher-6.jpg', name: 'Ксения', role: 'Литература', desc: '«Быть можно дельным человеком и думать о красе ногтей» — Александр Сергеевич Пушкин' },
		{ photo: 'assets/images/teacher-7.jpg', name: 'Виктория', role: 'География', desc: 'Я не знаю, где встретиться\nНам придется с тобой, –\nГлобус крутится, вертится,\nСловно шар голубой.\nИ мелькают города и страны,\nПараллели и меридианы,\nНо таких еще пунктиров нету,\nПо которым нам бродить по свету' },
		{ photo: 'assets/images/teacher-9.jpg', name: 'Анна', role: 'Педагог по шахматам', desc: 'Дисциплина — ключ к прогрессу в учёбе' },
		{ photo: 'assets/images/teacher-10.jpg', name: 'Анна', role: 'Педагог по творчеству', desc: '«Счастье человека где-то между свободой и дисциплиной» — Иван Петрович Павлов' },
		{ photo: 'assets/images/teacher-11.jpg', name: 'Людмила', role: 'Логопед', desc: 'Будущее зависит от того, что вы делаете сегодня!' },
		{ photo: 'assets/images/teacher-12.jpg', name: 'Виктория', role: 'Нейропсихолог', desc: '' },
		{ photo: 'assets/images/teacher-8.jpg', name: 'Татьяна', role: 'Русский язык', desc: '«Нет слов плохих вообще, неприемлемых вообще: каждое слово хорошо на своем месте, впору и кстати» — Нора Галь' },
		{ photo: 'assets/images/teacher-13.jpg', name: 'Алина', role: 'Педагог чтения и подготовительной группы', desc: 'Будь то дом, звёзды или пустыня — самое прекрасное в них то, чего не увидишь глазами!' }
	];

	const DESKTOP_PAGE_SIZE = 4;
	const MOBILE_PAGE_SIZE = 1;
	const MOBILE_MEDIA_QUERY = '(max-width: 720px)';
	const SLIDE_MS = 300;
	const teamSection = document.querySelector('#team');
	if (!teamSection) return;
	const grid = teamSection.querySelector('.teachers-grid');
	if (!grid) return;

	const carousel = teamSection.querySelector('.teachers-carousel');
	if (!carousel) return;

	let btnPrev = carousel.querySelector('.teacher-carousel-prev');
	let btnNext = carousel.querySelector('.teacher-carousel-next');
	const dotsWrap = carousel.querySelector('.teacher-carousel-dots');
	if (!btnPrev || !btnNext) return;
	const mobileMedia = window.matchMedia(MOBILE_MEDIA_QUERY);

	let page = 0;
	let isAnimating = false;
	let touchStartX = 0;
	let touchEndX = 0;

	function getPageSize() {
		return mobileMedia.matches ? MOBILE_PAGE_SIZE : DESKTOP_PAGE_SIZE;
	}

	function getTotalPages() {
		return Math.max(1, Math.ceil(teachers.length / getPageSize()));
	}

	function getPageStartIndex(p) {
		return p * getPageSize();
	}

	function renderCards(list, startIndex = 0) {
		return list.map((t, i) => `
			<article class="teacher-card" data-teacher-index="${startIndex + i + 1}" role="listitem" tabindex="0">
				<div class="teacher-avatar"><img src="${t.photo}" alt="${t.name}" loading="lazy"></div>
				<div class="teacher-info">
					<div class="teacher-name">${t.name}</div>
					<div class="teacher-role">${t.role}</div>
					<div class="teacher-desc">${t.desc || ''}</div>
				</div>
			</article>`).join('');
	}

	function getPageSlice(p) {
		const pageSize = getPageSize();
		return teachers.slice(p * pageSize, p * pageSize + pageSize);
	}

	function updateDots() {
		if (!dotsWrap) return;
		const totalPages = getTotalPages();
		dotsWrap.innerHTML = Array.from({ length: totalPages }, (_, i) => `
			<button class="teacher-dot${i === page ? ' is-active' : ''}" type="button" aria-label="Страница ${i + 1}"></button>
		`).join('');
		Array.from(dotsWrap.querySelectorAll('.teacher-dot')).forEach((dot, i) => {
			dot.addEventListener('click', () => {
				if (i !== page) slideTo(i);
			});
		});
	}

	function renderPage(p) {
		const totalPages = getTotalPages();
		grid.innerHTML = renderCards(getPageSlice(p), getPageStartIndex(p));
		btnPrev.disabled = p === 0;
		btnNext.disabled = p >= totalPages - 1;
		updateDots();
	}

	function toggleArrows() {
		const hide = teachers.length <= getPageSize();
		btnPrev.style.display = hide ? 'none' : '';
		btnNext.style.display = hide ? 'none' : '';
		if (dotsWrap) dotsWrap.style.display = hide ? 'none' : '';
		if (!hide) {
			btnPrev.style.visibility = 'visible';
			btnNext.style.visibility = 'visible';
			btnPrev.style.opacity = '1';
			btnNext.style.opacity = '1';
		}
	}

	function slideTo(nextPage) {
		const totalPages = getTotalPages();
		if (isAnimating || nextPage === page || nextPage < 0 || nextPage >= totalPages) return;
		isAnimating = true;

		const direction = nextPage > page ? 1 : -1;
		const currentHTML = renderCards(getPageSlice(page), getPageStartIndex(page));
		const nextHTML = renderCards(getPageSlice(nextPage), getPageStartIndex(nextPage));
		const prevHeight = grid.offsetHeight;

		grid.style.position = 'relative';
		grid.style.overflow = 'hidden';
		grid.style.height = `${prevHeight}px`;

		const gridStyle = window.getComputedStyle(grid);
		const columns = gridStyle.gridTemplateColumns;
		const gap = gridStyle.columnGap;

		const outgoing = document.createElement('div');
		outgoing.className = 'teachers-page teachers-page--out';
		outgoing.style.position = 'absolute';
		outgoing.style.inset = '0';
		outgoing.style.display = 'grid';
		outgoing.style.gridTemplateColumns = columns;
		outgoing.style.columnGap = gap;
		outgoing.style.rowGap = gridStyle.rowGap;
		outgoing.style.transform = 'translateX(0%)';
		outgoing.style.transition = `transform ${SLIDE_MS}ms ease`;
		outgoing.innerHTML = currentHTML;

		const incoming = document.createElement('div');
		incoming.className = 'teachers-page teachers-page--in';
		incoming.style.position = 'absolute';
		incoming.style.inset = '0';
		incoming.style.display = 'grid';
		incoming.style.gridTemplateColumns = columns;
		incoming.style.columnGap = gap;
		incoming.style.rowGap = gridStyle.rowGap;
		incoming.style.transform = `translateX(${direction > 0 ? '100%' : '-100%'})`;
		incoming.style.transition = `transform ${SLIDE_MS}ms ease`;
		incoming.innerHTML = nextHTML;

		grid.innerHTML = '';
		grid.append(outgoing, incoming);

		requestAnimationFrame(() => {
			outgoing.style.transform = `translateX(${direction > 0 ? '-100%' : '100%'})`;
			incoming.style.transform = 'translateX(0%)';
		});

		setTimeout(() => {
			page = nextPage;
			renderPage(page);
			grid.style.height = '';
			isAnimating = false;
		}, SLIDE_MS);
	}

	function prevPage() {
		if (page > 0) slideTo(page - 1);
	}

	function nextPage() {
		const totalPages = getTotalPages();
		if (page < totalPages - 1) slideTo(page + 1);
	}

	function applyResponsiveLayout() {
		const oldPageSize = getPageSize() === MOBILE_PAGE_SIZE ? DESKTOP_PAGE_SIZE : MOBILE_PAGE_SIZE;
		const startIndex = page * oldPageSize;
		const newPageSize = getPageSize();
		page = Math.min(Math.floor(startIndex / newPageSize), getTotalPages() - 1);
		toggleArrows();
		renderPage(page);
	}

	btnPrev.addEventListener('click', prevPage);
	btnNext.addEventListener('click', nextPage);

	carousel.addEventListener('touchstart', (e) => {
		if (!mobileMedia.matches) return;
		touchStartX = e.changedTouches[0].clientX;
	}, { passive: true });

	carousel.addEventListener('touchend', (e) => {
		if (!mobileMedia.matches) return;
		touchEndX = e.changedTouches[0].clientX;
		const delta = touchEndX - touchStartX;
		if (Math.abs(delta) < 40) return;
		if (delta < 0) nextPage();
		else prevPage();
	}, { passive: true });

	if (typeof mobileMedia.addEventListener === 'function') mobileMedia.addEventListener('change', applyResponsiveLayout);
	else mobileMedia.addListener(applyResponsiveLayout);

	toggleArrows();
	renderPage(0);
});

document.addEventListener('DOMContentLoaded', () => {
	const mapWrap = document.querySelector('.contact-map-wrap');
	if (!mapWrap || !('IntersectionObserver' in window)) {
		if (mapWrap) mapWrap.classList.add('in-view');
		return;
	}
	const obs = new IntersectionObserver((entries) => {
		if (entries[0].isIntersecting) {
			mapWrap.classList.add('in-view');
			obs.disconnect();
		}
	}, { threshold: 0.15 });
	obs.observe(mapWrap);
});

/* Header: burger, smooth scroll, active link highlight, lock scroll */
document.addEventListener('DOMContentLoaded', () => {
	const header = document.querySelector('.site-header');
	const burger = document.querySelector('.burger');
	const mobileMenu = document.getElementById('mobile-menu');
	const navLinks = Array.from(document.querySelectorAll('.nav-link'));
	const mobileLinks = Array.from(document.querySelectorAll('.mobile-link'));
	const mobileCtas = Array.from(document.querySelectorAll('.mobile-cta'));
	const mobileMedia = window.matchMedia('(max-width: 767.98px)');
	const headerHeight = () => document.querySelector('.header-inner')?.offsetHeight || 80;

	if (!mobileMenu || !burger) return;

	let closeBtn = mobileMenu.querySelector('.mobile-menu-close');
	if (!closeBtn) {
		closeBtn = document.createElement('button');
		closeBtn.type = 'button';
		closeBtn.className = 'mobile-menu-close';
		closeBtn.setAttribute('aria-label', 'Закрыть меню');
		closeBtn.textContent = '✕';
		mobileMenu.appendChild(closeBtn);
	}

	// Smooth scroll with offset for sticky header
	function smoothScrollTo(hash) {
		const el = document.querySelector(hash);
		if (!el) return;
		const y = el.getBoundingClientRect().top + window.pageYOffset - headerHeight() - 12;
		window.scrollTo({top: y, behavior: 'smooth'});
	}

	// Attach smooth scroll to header links
	[...navLinks, ...mobileLinks, ...mobileCtas].forEach(a => {
		a.addEventListener('click', (e) => {
			const href = a.getAttribute('href');
			if (!href || !href.startsWith('#')) return;
			e.preventDefault();
			// close mobile menu if open
			if (mobileMenu && mobileMenu.getAttribute('aria-hidden') === 'false') toggleMenu(false);
			smoothScrollTo(href === '#content' ? '#content' : href);
		});
	});

	// Burger toggle
	function toggleMenu(open) {
		if (!mobileMedia.matches && open !== false) return;
		const currentlyOpen = burger.getAttribute('aria-expanded') === 'true';
		const shouldOpen = open === undefined ? !currentlyOpen : Boolean(open);
		if (!shouldOpen) {
			burger.setAttribute('aria-expanded', 'false');
			mobileMenu.setAttribute('aria-hidden', 'true');
			mobileMenu.hidden = true;
			document.documentElement.style.overflow = '';
			document.body.style.overflow = '';
		} else {
			burger.setAttribute('aria-expanded', 'true');
			mobileMenu.removeAttribute('hidden');
			mobileMenu.setAttribute('aria-hidden', 'false');
			document.documentElement.style.overflow = 'hidden';
			document.body.style.overflow = 'hidden';
		}
	}

	burger.addEventListener('click', () => toggleMenu());
	closeBtn.addEventListener('click', () => toggleMenu(false));
	mobileMedia.addEventListener('change', () => {
		if (!mobileMedia.matches) toggleMenu(false);
	});

	// Close on ESC
	window.addEventListener('keydown', (e) => {
		if (e.key === 'Escape') {
			if (mobileMenu && mobileMenu.getAttribute('aria-hidden') === 'false') toggleMenu(false);
		}
	});

	// Active link highlighting using IntersectionObserver
	const sections = ['#content', '#benefits', '#ages', '#team', '#schedule', '#faq', '#contact']
		.map(s => document.querySelector(s)).filter(Boolean);

	if ('IntersectionObserver' in window && sections.length) {
		const obs = new IntersectionObserver((entries) => {
			entries.forEach(entry => {
				const id = entry.target.id;
				const link = document.querySelector(`.nav-link[href="#${id}"]`);
				if (link) link.classList.toggle('active', entry.isIntersecting && entry.intersectionRatio > 0.45);
			});
		}, {threshold:[0.45, 0.6]});
		sections.forEach(s => obs.observe(s));
	}

	// Header scrolled state
	const onScroll = () => {
		if (!header) return;
		const scrolled = window.scrollY > 12;
		header.classList.toggle('scrolled', scrolled);
	};
	onScroll();
	window.addEventListener('scroll', onScroll, {passive:true});
});

/* Signup form: Web3Forms submit */
document.addEventListener('DOMContentLoaded', () => {
	const form = document.querySelector('.signup-form');
	if (!form) return;

	const submitBtn = form.querySelector('button[type="submit"]');
	const consentCheckbox = form.querySelector('input[name="consent"]');
	const consentError = form.querySelector('.consent-error');
	const childAgeHidden = form.querySelector('input[name="child_age"]');
	const interestedProgramHidden = form.querySelector('input[name="interested_program"]');
	const originalBtnContent = submitBtn ? submitBtn.innerHTML : '';

	const notify = (() => {
		let el = null;
		let timer = null;
		return (message, type = 'success') => {
			if (!el) {
				el = document.createElement('div');
				el.className = 'form-toast';
				el.setAttribute('role', 'status');
				el.setAttribute('aria-live', 'polite');
				document.body.appendChild(el);
				Object.assign(el.style, {
					position: 'fixed',
					right: '20px',
					bottom: '20px',
					maxWidth: '420px',
					padding: '14px 16px',
					borderRadius: '12px',
					fontSize: '0.95rem',
					lineHeight: '1.45',
					boxShadow: '0 14px 34px rgba(34,20,12,0.16)',
					zIndex: '10000',
					opacity: '0',
					transform: 'translateY(8px)',
					transition: 'opacity .24s ease, transform .24s ease'
				});
			}

			if (timer) clearTimeout(timer);

			el.textContent = message;
			if (type === 'success') {
				el.style.background = '#ffffff';
				el.style.color = '#1f5f35';
				el.style.border = '1px solid rgba(43,133,74,0.25)';
			} else {
				el.style.background = '#ffffff';
				el.style.color = '#8a2f2f';
				el.style.border = '1px solid rgba(190,58,58,0.25)';
			}

			requestAnimationFrame(() => {
				el.style.opacity = '1';
				el.style.transform = 'translateY(0)';
			});

			timer = setTimeout(() => {
				el.style.opacity = '0';
				el.style.transform = 'translateY(8px)';
			}, 4200);
		};
	})();

	function setSubmitting(isSubmitting) {
		if (!submitBtn) return;
		submitBtn.disabled = isSubmitting;
		if (isSubmitting) {
			submitBtn.innerHTML = '<span class="btn-spinner" aria-hidden="true"></span><span>Отправка...</span>';
			submitBtn.style.opacity = '0.9';
			submitBtn.style.pointerEvents = 'none';
		} else {
			submitBtn.innerHTML = originalBtnContent;
			submitBtn.style.opacity = '';
			submitBtn.style.pointerEvents = '';
		}
	}

	function syncHiddenFields() {
		if (childAgeHidden) childAgeHidden.value = 'Не указано';
		if (interestedProgramHidden) interestedProgramHidden.value = 'Не указана';
	}

	if (consentCheckbox && consentError) {
		consentCheckbox.addEventListener('change', () => {
			if (consentCheckbox.checked) consentError.hidden = true;
		});
	}

	form.addEventListener('submit', async (e) => {
		e.preventDefault();
		if (!submitBtn) return;

		if (consentCheckbox && !consentCheckbox.checked) {
			if (consentError) consentError.hidden = false;
			notify('Для отправки заявки необходимо согласиться с обработкой персональных данных.', 'error');
			return;
		}

		if (consentError) consentError.hidden = true;
		syncHiddenFields();
		setSubmitting(true);

		try {
			const formData = new FormData(form);
			const response = await fetch('https://api.web3forms.com/submit', {
				method: 'POST',
				body: formData
			});

			const result = await response.json().catch(() => ({}));
			if (!response.ok || !result.success) {
				throw new Error(result.message || 'submit_failed');
			}

			form.reset();
			syncHiddenFields();
			if (consentError) consentError.hidden = true;
			notify('Спасибо! Ваша заявка успешно отправлена. Мы свяжемся с вами в ближайшее время.', 'success');
		} catch (_) {
			notify('Не удалось отправить заявку. Попробуйте ещё раз.', 'error');
		} finally {
			setSubmitting(false);
		}
	});
});

/* Cookie consent and settings */
document.addEventListener('DOMContentLoaded', () => {
	const STORAGE_KEY = 'school_cookie_preferences_v1';
	const banner = document.getElementById('cookie-banner');
	const modal = document.getElementById('cookie-modal');
	if (!banner || !modal) return;

	const acceptBtn = document.getElementById('cookie-accept-btn');
	const settingsBtn = document.getElementById('cookie-settings-btn');
	const saveBtn = document.getElementById('cookie-save-btn');
	const acceptAllBtn = document.getElementById('cookie-accept-all-btn');
	const cancelBtn = document.getElementById('cookie-cancel-btn');
	const analyticsInput = document.getElementById('cookie-analytics');
	const marketingInput = document.getElementById('cookie-marketing');
	const openSettingsLinks = Array.from(document.querySelectorAll('[data-open-cookie-settings]'));
	const closeModalTargets = Array.from(modal.querySelectorAll('[data-cookie-close]'));

	function readPrefs() {
		try {
			const raw = localStorage.getItem(STORAGE_KEY);
			if (!raw) return null;
			const parsed = JSON.parse(raw);
			if (!parsed || typeof parsed !== 'object') return null;
			return {
				required: true,
				analytics: Boolean(parsed.analytics),
				marketing: Boolean(parsed.marketing),
				consentGiven: Boolean(parsed.consentGiven)
			};
		} catch (_) {
			return null;
		}
	}

	function writePrefs(prefs) {
		localStorage.setItem(STORAGE_KEY, JSON.stringify({
			required: true,
			analytics: Boolean(prefs.analytics),
			marketing: Boolean(prefs.marketing),
			consentGiven: true,
			updatedAt: new Date().toISOString()
		}));
	}

	function applyPrefsToUI(prefs) {
		if (analyticsInput) analyticsInput.checked = Boolean(prefs && prefs.analytics);
		if (marketingInput) marketingInput.checked = Boolean(prefs && prefs.marketing);
	}

	function hideBanner() {
		banner.hidden = true;
	}

	function showBanner() {
		banner.hidden = false;
	}

	function openModal() {
		const prefs = readPrefs();
		applyPrefsToUI(prefs || { analytics: false, marketing: false });
		modal.hidden = false;
		document.documentElement.style.overflow = 'hidden';
		document.body.style.overflow = 'hidden';
	}

	function closeModal() {
		modal.hidden = true;
		document.documentElement.style.overflow = '';
		document.body.style.overflow = '';
	}

	function acceptAll() {
		writePrefs({ analytics: true, marketing: true });
		hideBanner();
		closeModal();
	}

	function saveCurrentSettings() {
		writePrefs({
			analytics: analyticsInput ? analyticsInput.checked : false,
			marketing: marketingInput ? marketingInput.checked : false
		});
		hideBanner();
		closeModal();
	}

	const initialPrefs = readPrefs();
	if (initialPrefs && initialPrefs.consentGiven) {
		hideBanner();
		applyPrefsToUI(initialPrefs);
	} else {
		showBanner();
	}

	if (acceptBtn) acceptBtn.addEventListener('click', acceptAll);
	if (settingsBtn) settingsBtn.addEventListener('click', openModal);
	if (saveBtn) saveBtn.addEventListener('click', saveCurrentSettings);
	if (acceptAllBtn) acceptAllBtn.addEventListener('click', acceptAll);
	if (cancelBtn) cancelBtn.addEventListener('click', closeModal);

	openSettingsLinks.forEach(link => {
		link.addEventListener('click', (e) => {
			e.preventDefault();
			openModal();
		});
	});

	closeModalTargets.forEach(el => el.addEventListener('click', closeModal));

	window.addEventListener('keydown', (e) => {
		if (e.key === 'Escape' && !modal.hidden) closeModal();
	});
});

