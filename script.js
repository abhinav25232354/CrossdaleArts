const navbar = document.getElementById("navbar");
const navToggle = navbar ? navbar.querySelector(".nav-toggle") : null;

if (navbar && navToggle) {
    navToggle.addEventListener("click", () => {
        const isOpen = navbar.classList.toggle("nav-open");
        navToggle.setAttribute("aria-expanded", String(isOpen));
    });

    window.addEventListener("resize", () => {
        if (window.innerWidth > 768) {
            navbar.classList.remove("nav-open");
            navToggle.setAttribute("aria-expanded", "false");
        }
    });
}

// Add image/video paths directly in this single array.
// String form (easy): "Videos/gallery-video-1.mov"
// Object form (optional): { src: "Videos/gallery-video-1.mov", alt: "Studio Clip" }
const galleryMedia = [
    "Videos/gallery-video-2.mov.mp4",
    "images/Gallery/gallery-image-1.jpeg",
    "images/Gallery/gallery-image-2.jpeg",
    "images/Gallery/gallery-image-3.jpeg",
    "images/Gallery/gallery-image-4.jpeg",
    "images/Gallery/gallery-image-5.jpeg",
    "images/Gallery/gallery-image-6.jpeg",
    "images/Gallery/gallery-image-7.jpeg",
    "images/Gallery/gallery-image-8.jpeg",
    "images/Gallery/gallery-image-9.jpeg",
    "images/Gallery/gallery-image-10.jpeg",
    "images/Gallery/gallery-image-11.jpeg",
    "images/Gallery/gallery-image-12.jpeg",
    "images/Gallery/gallery-image-13.jpeg",
    "images/Gallery/gallery-image-14.jpeg",
    "images/Gallery/gallery-image-15.jpeg",
    "images/Gallery/gallery-image-16.jpeg",
    "images/Gallery/gallery-image-17.jpeg",
    "images/Gallery/gallery-image-18.jpeg",
    "images/Gallery/gallery-image-19.jpeg",
    "images/Gallery/gallery-image-20.jpeg",
    "images/Gallery/gallery-image-21.jpeg",
    "images/Gallery/gallery-image-22.jpeg",
    "images/Gallery/gallery-image-23.jpeg"
];

const VIDEO_EXTENSIONS = new Set(["mp4", "mov", "webm", "ogg", "ogv", "m4v"]);

function getFileExtension(path = "") {
    const cleanPath = path.split("?")[0].split("#")[0];
    const parts = cleanPath.split(".");
    return parts.length > 1 ? parts[parts.length - 1].toLowerCase() : "";
}

function inferMediaType(item) {
    if (item.type === "video" || item.type === "image") return item.type;
    return VIDEO_EXTENSIONS.has(getFileExtension(item.src || "")) ? "video" : "image";
}

function normalizeVideoSources(item) {
    if (Array.isArray(item.sources) && item.sources.length > 0) {
        return item.sources
            .map((source) => {
                if (typeof source === "string") return { src: source, type: "" };
                if (!source || !source.src) return null;
                return { src: source.src, type: source.type || "" };
            })
            .filter(Boolean);
    }
    if (item.src) {
        return buildFallbackSources(item.src).map((src) => ({ src, type: "" }));
    }
    return [];
}

function buildGalleryItem(item) {
    const type = inferMediaType(item);
    if (type === "video") {
        return {
            ...item,
            type,
            sources: normalizeVideoSources(item)
        };
    }
    return { ...item, type };
}

function normalizeGalleryEntry(entry, index) {
    if (typeof entry === "string") {
        return { src: entry, alt: `Gallery item ${index + 1}` };
    }
    if (entry && typeof entry === "object") {
        return entry;
    }
    return { src: "", alt: `Gallery item ${index + 1}` };
}

const galleryItems = galleryMedia
    .map((entry, index) => normalizeGalleryEntry(entry, index))
    .filter((entry) => entry.src)
    .map((entry) => buildGalleryItem(entry));

const track = document.getElementById("art-gallery-images");
const prevBtn = document.getElementById("gallery-prev");
const nextBtn = document.getElementById("gallery-next");
const galleryViewport = track ? track.parentElement : null;

if (track && prevBtn && nextBtn) {
    let currentIndex = 0;
    let visibleSlides = 3;
    let wheelDeltaX = 0;
    let wheelCooldown = false;
    let touchStartX = 0;
    let touchStartY = 0;
    const lightbox = createGalleryLightbox();

    function getVisibleSlides() {
        if (window.innerWidth <= 600) return 1;
        if (window.innerWidth <= 900) return 2;
        return 3;
    }

    function renderSlides() {
        track.innerHTML = "";

        galleryItems.forEach((item, index) => {
            const slide = document.createElement("div");
            slide.className = "slide";
            slide.setAttribute("role", "button");
            slide.setAttribute("tabindex", "0");
            slide.setAttribute("aria-label", `Open ${item.alt || "gallery item"} in full view`);

            const mediaEl = item.type === "video" ? document.createElement("video") : document.createElement("img");
            mediaEl.className = "gallery-media";

            if (item.type === "video") {
                const hasVideoSource = setVideoSources(mediaEl, item.sources, () => {
                    slide.classList.add("media-error");
                });
                mediaEl.muted = true;
                mediaEl.defaultMuted = true;
                mediaEl.loop = true;
                mediaEl.autoplay = true;
                mediaEl.playsInline = true;
                mediaEl.preload = "metadata";
                mediaEl.setAttribute("aria-label", item.alt || "Gallery video");
                mediaEl.addEventListener("canplay", () => {
                    mediaEl.play().catch(() => {});
                });
                if (!hasVideoSource) {
                    slide.classList.add("media-error");
                }
            } else {
                mediaEl.src = item.src;
                mediaEl.alt = item.alt || "Gallery image";
                mediaEl.loading = "lazy";
            }

            slide.addEventListener("click", () => openLightbox(index));
            slide.addEventListener("keydown", (event) => {
                if (event.key === "Enter" || event.key === " ") {
                    event.preventDefault();
                    openLightbox(index);
                }
            });

            slide.appendChild(mediaEl);
            track.appendChild(slide);
        });
    }

    function updateSlider() {
        visibleSlides = getVisibleSlides();
        const maxIndex = Math.max(galleryItems.length - visibleSlides, 0);

        if (currentIndex > maxIndex) {
            currentIndex = maxIndex;
        }

        const offset = (100 / visibleSlides) * currentIndex;
        track.style.transform = `translateX(-${offset}%)`;

        prevBtn.disabled = currentIndex === 0;
        nextBtn.disabled = currentIndex === maxIndex;
    }

    function slidePrev() {
        if (currentIndex > 0) {
            currentIndex -= 1;
            updateSlider();
        }
    }

    function slideNext() {
        const maxIndex = Math.max(galleryItems.length - visibleSlides, 0);
        if (currentIndex < maxIndex) {
            currentIndex += 1;
            updateSlider();
        }
    }

    function openLightbox(index) {
        const item = galleryItems[index];
        if (!item) return;

        lightbox.content.innerHTML = "";

        if (item.type === "video") {
            const video = document.createElement("video");
            video.className = "gallery-lightbox-media";
            video.controls = true;
            video.autoplay = true;
            video.playsInline = true;
            video.preload = "metadata";
            video.muted = false;
            const hasVideoSource = setVideoSources(video, item.sources, () => {
                showVideoFallback(lightbox.content, item);
            });
            if (!hasVideoSource) {
                showVideoFallback(lightbox.content, item);
                return;
            }
            lightbox.content.appendChild(video);
            video.play().catch(() => {});
        } else {
            const img = document.createElement("img");
            img.src = item.src;
            img.alt = item.alt || "Gallery image";
            img.className = "gallery-lightbox-media";
            lightbox.content.appendChild(img);
        }

        lightbox.root.classList.add("is-open");
        lightbox.root.setAttribute("aria-hidden", "false");
        document.body.classList.add("gallery-lightbox-open");
    }

    function closeLightbox() {
        lightbox.root.classList.remove("is-open");
        lightbox.root.setAttribute("aria-hidden", "true");
        lightbox.content.innerHTML = "";
        document.body.classList.remove("gallery-lightbox-open");
    }

    lightbox.closeBtn.addEventListener("click", closeLightbox);
    lightbox.root.addEventListener("click", (event) => {
        if (event.target === lightbox.root) closeLightbox();
    });

    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && lightbox.root.classList.contains("is-open")) {
            closeLightbox();
        }
    });

    prevBtn.addEventListener("click", slidePrev);
    nextBtn.addEventListener("click", slideNext);

    if (galleryViewport) {
        galleryViewport.addEventListener(
            "wheel",
            (event) => {
                const isHorizontalIntent = Math.abs(event.deltaX) > Math.abs(event.deltaY) || event.shiftKey;
                if (!isHorizontalIntent) return;

                event.preventDefault();
                if (wheelCooldown) return;

                wheelDeltaX += event.deltaX !== 0 ? event.deltaX : event.deltaY;
                if (Math.abs(wheelDeltaX) < 36) return;

                if (wheelDeltaX > 0) slideNext();
                else slidePrev();

                wheelDeltaX = 0;
                wheelCooldown = true;
                window.setTimeout(() => {
                    wheelCooldown = false;
                }, 180);
            },
            { passive: false }
        );

        galleryViewport.addEventListener(
            "touchstart",
            (event) => {
                const touch = event.changedTouches[0];
                touchStartX = touch.clientX;
                touchStartY = touch.clientY;
            },
            { passive: true }
        );

        galleryViewport.addEventListener(
            "touchmove",
            (event) => {
                const touch = event.changedTouches[0];
                const deltaX = touch.clientX - touchStartX;
                const deltaY = touch.clientY - touchStartY;

                if (Math.abs(deltaX) > Math.abs(deltaY)) {
                    event.preventDefault();
                }
            },
            { passive: false }
        );

        galleryViewport.addEventListener(
            "touchend",
            (event) => {
                const touch = event.changedTouches[0];
                const deltaX = touch.clientX - touchStartX;
                const deltaY = touch.clientY - touchStartY;

                if (Math.abs(deltaX) > Math.abs(deltaY) && Math.abs(deltaX) > 48) {
                    if (deltaX < 0) slideNext();
                    else slidePrev();
                }
            },
            { passive: true }
        );
    }

    window.addEventListener("resize", updateSlider);

    renderSlides();
    updateSlider();
}

function createGalleryLightbox() {
    const existing = document.getElementById("gallery-lightbox");
    if (existing) {
        return {
            root: existing,
            closeBtn: existing.querySelector(".gallery-lightbox-close"),
            content: existing.querySelector(".gallery-lightbox-content")
        };
    }

    const root = document.createElement("div");
    root.id = "gallery-lightbox";
    root.className = "gallery-lightbox";
    root.setAttribute("aria-hidden", "true");

    const box = document.createElement("div");
    box.className = "gallery-lightbox-box";

    const closeBtn = document.createElement("button");
    closeBtn.type = "button";
    closeBtn.className = "gallery-lightbox-close";
    closeBtn.setAttribute("aria-label", "Close full view");
    closeBtn.textContent = "Close";

    const content = document.createElement("div");
    content.className = "gallery-lightbox-content";

    box.appendChild(closeBtn);
    box.appendChild(content);
    root.appendChild(box);
    document.body.appendChild(root);

    return { root, closeBtn, content };
}

setupCourseImagePreview();

function setVideoSources(videoEl, sources, onAllFailed) {
    const safeSources = prioritizeSources((sources || []).filter((sourceDef) => sourceDef && sourceDef.src));
    if (safeSources.length === 0) {
        if (typeof onAllFailed === "function") onAllFailed();
        return false;
    }

    let sourceIndex = 0;

    const trySource = () => {
        if (sourceIndex >= safeSources.length) return false;
        videoEl.src = safeSources[sourceIndex].src;
        videoEl.load();
        return true;
    };

    const onError = () => {
        sourceIndex += 1;
        if (!trySource()) {
            videoEl.removeEventListener("error", onError);
            if (typeof onAllFailed === "function") onAllFailed();
        }
    };

    videoEl.addEventListener("error", onError);
    return trySource();
}

function showVideoFallback(container, item) {
    container.innerHTML = "";

    const wrapper = document.createElement("div");
    wrapper.className = "gallery-video-fallback";

    const text = document.createElement("p");
    text.textContent = "This video format is not supported by your browser.";

    const primary = (item.sources && item.sources[0] && item.sources[0].src) || item.src || "#";
    const link = document.createElement("a");
    link.href = primary;
    link.target = "_blank";
    link.rel = "noopener noreferrer";
    link.textContent = "Open or download video";

    wrapper.appendChild(text);
    wrapper.appendChild(link);
    container.appendChild(wrapper);
}

function setupCourseImagePreview() {
    const courseImages = document.querySelectorAll("#course-content img");
    if (!courseImages.length) return;

    const lightbox = createGalleryLightbox();
    let openedFromCourse = false;

    const openCourseImage = (imgEl) => {
        lightbox.content.innerHTML = "";

        const img = document.createElement("img");
        img.src = imgEl.src;
        img.alt = imgEl.alt || "Course image";
        img.className = "gallery-lightbox-media";
        lightbox.content.appendChild(img);

        lightbox.root.classList.add("is-open");
        lightbox.root.setAttribute("aria-hidden", "false");
        document.body.classList.add("gallery-lightbox-open");
        openedFromCourse = true;
    };

    const closeCourseImage = () => {
        if (!openedFromCourse) return;
        lightbox.root.classList.remove("is-open");
        lightbox.root.setAttribute("aria-hidden", "true");
        lightbox.content.innerHTML = "";
        document.body.classList.remove("gallery-lightbox-open");
        openedFromCourse = false;
    };

    courseImages.forEach((imgEl) => {
        imgEl.setAttribute("role", "button");
        imgEl.setAttribute("tabindex", "0");
        imgEl.setAttribute("aria-label", "Open image in full view");

        imgEl.addEventListener("click", () => openCourseImage(imgEl));
        imgEl.addEventListener("keydown", (event) => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                openCourseImage(imgEl);
            }
        });
    });

    lightbox.closeBtn.addEventListener("click", closeCourseImage);
    lightbox.root.addEventListener("click", (event) => {
        if (event.target === lightbox.root) closeCourseImage();
    });
    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape") closeCourseImage();
    });
}

function buildFallbackSources(src = "") {
    const ext = getFileExtension(src);
    const out = [src];
    const dotExt = ext ? `.${ext}` : "";
    const base = dotExt && src.toLowerCase().endsWith(dotExt)
        ? src.slice(0, -dotExt.length)
        : src;

    if (ext === "mov") {
        out.push(`${base}.mp4`, `${base}.webm`);
    } else if (ext === "mp4" || ext === "m4v") {
        out.push(`${base}.webm`, `${base}.mov`);
    } else if (ext === "webm") {
        out.push(`${base}.mp4`, `${base}.mov`);
    }

    return [...new Set(out)];
}

function prioritizeSources(sources) {
    const scoreByExt = { mp4: 3, m4v: 3, webm: 2, ogg: 1, ogv: 1, mov: 0 };
    return [...sources].sort((a, b) => {
        const aExt = getFileExtension(a.src);
        const bExt = getFileExtension(b.src);
        return (scoreByExt[bExt] || 0) - (scoreByExt[aExt] || 0);
    });
}

const FEEDBACK_ROTATION_MS = 2000;
const FEEDBACK_DATA_URL = "/data/feedbacks.json";
const FEEDBACK_STORAGE_KEY = "crossdale_feedbacks";

async function initFeedbackWidget() {
    const anchor = document.getElementById("feedback-widget-anchor");
    if (!anchor) return;

    let feedbacks = await loadFeedbackList();

    let currentIndex = 0;
    let rotationTimer = null;
    let pointerActive = false;
    let pointerStartX = 0;
    let pointerStartY = 0;
    let suppressNextClick = false;

    const widget = document.createElement("section");
    widget.className = "feedback-widget";

    const header = document.createElement("div");
    header.className = "feedback-widget-header";

    const title = document.createElement("h4");
    title.textContent = "Learners Feedback";

    const count = document.createElement("span");
    count.className = "feedback-count";

    const card = document.createElement("article");
    card.className = "feedback-card";
    card.setAttribute("role", "button");
    card.setAttribute("tabindex", "0");
    card.setAttribute("aria-label", "Open full feedback");

    const starsEl = document.createElement("div");
    starsEl.className = "feedback-stars";

    const nameEl = document.createElement("div");
    nameEl.className = "feedback-name";

    const messageEl = document.createElement("p");
    messageEl.className = "feedback-message";

    card.appendChild(starsEl);
    card.appendChild(nameEl);
    card.appendChild(messageEl);

    header.appendChild(title);
    header.appendChild(count);

    const actions = document.createElement("div");
    actions.className = "feedback-widget-actions";

    const leaveBtn = document.createElement("button");
    leaveBtn.type = "button";
    leaveBtn.className = "feedback-leave-btn";
    leaveBtn.textContent = "Leave Feedback";

    actions.appendChild(leaveBtn);

    widget.appendChild(header);
    widget.appendChild(card);
    widget.appendChild(actions);
    anchor.appendChild(widget);

    const detailModal = createFeedbackModal();

    function renderCurrent() {
        if (!feedbacks.length) {
            starsEl.textContent = renderStars(5);
            nameEl.textContent = "CrossdaleArts";
            messageEl.textContent = "No feedback yet. Be the first to share your experience.";
            count.textContent = "0 reviews";
            return;
        }
        const item = feedbacks[currentIndex];
        starsEl.textContent = renderStars(item.rating);
        nameEl.textContent = item.name;
        messageEl.textContent = truncateFeedback(item.message, 120);
        count.textContent = `${feedbacks.length} reviews`;
    }

    function goNext() {
        if (feedbacks.length <= 1) return;
        card.classList.add("is-flipping");
        window.setTimeout(() => {
            currentIndex = (currentIndex + 1) % feedbacks.length;
            renderCurrent();
            card.classList.remove("is-flipping");
        }, 220);
    }

    function goPrev() {
        if (feedbacks.length <= 1) return;
        card.classList.add("is-flipping");
        window.setTimeout(() => {
            currentIndex = (currentIndex - 1 + feedbacks.length) % feedbacks.length;
            renderCurrent();
            card.classList.remove("is-flipping");
        }, 220);
    }

    function startRotation() {
        stopRotation();
        rotationTimer = window.setInterval(goNext, FEEDBACK_ROTATION_MS);
    }

    function stopRotation() {
        if (!rotationTimer) return;
        window.clearInterval(rotationTimer);
        rotationTimer = null;
    }

    function openFullFeedback() {
        if (!feedbacks.length) return;
        const selected = feedbacks[currentIndex];
        openFeedbackDetailModal(detailModal, selected);
    }

    async function onSubmitFeedback(entry) {
        const newEntry = sanitizeFeedback(entry);
        if (!newEntry) return { ok: false, message: "Invalid feedback details." };

        const saveResult = await saveFeedbackEntry(newEntry);
        if (!saveResult.ok) return saveResult;

        feedbacks = [newEntry, ...feedbacks];
        currentIndex = 0;
        renderCurrent();
        startRotation();
        return { ok: true, warning: saveResult.warning || "" };
    }

    leaveBtn.addEventListener("click", () => {
        openFeedbackFormModal(detailModal, onSubmitFeedback);
    });

    card.addEventListener("click", () => {
        if (suppressNextClick) {
            suppressNextClick = false;
            return;
        }
        openFullFeedback();
    });
    card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            openFullFeedback();
        }
    });

    widget.addEventListener("mouseenter", stopRotation);
    widget.addEventListener("mouseleave", startRotation);

    const SWIPE_THRESHOLD = 42;

    function onPointerStart(clientX, clientY) {
        pointerActive = true;
        pointerStartX = clientX;
        pointerStartY = clientY;
        stopRotation();
    }

    function onPointerMove(clientX, clientY) {
        if (!pointerActive) return;
        const dx = clientX - pointerStartX;
        const dy = clientY - pointerStartY;
        if (Math.abs(dx) < SWIPE_THRESHOLD || Math.abs(dx) <= Math.abs(dy)) return;

        pointerActive = false;
        suppressNextClick = true;
        if (dx < 0) goNext();
        else goPrev();
        startRotation();
    }

    function onPointerEnd() {
        if (!pointerActive) return;
        pointerActive = false;
        startRotation();
    }

    card.addEventListener(
        "touchstart",
        (event) => {
            const touch = event.changedTouches[0];
            onPointerStart(touch.clientX, touch.clientY);
        },
        { passive: true }
    );

    card.addEventListener(
        "touchmove",
        (event) => {
            const touch = event.changedTouches[0];
            onPointerMove(touch.clientX, touch.clientY);
        },
        { passive: true }
    );

    card.addEventListener(
        "touchend",
        () => {
            onPointerEnd();
        },
        { passive: true }
    );

    card.addEventListener("mousedown", (event) => {
        if (event.button !== 0) return;
        onPointerStart(event.clientX, event.clientY);
    });

    window.addEventListener("mousemove", (event) => {
        onPointerMove(event.clientX, event.clientY);
    });

    window.addEventListener("mouseup", () => {
        onPointerEnd();
    });

    renderCurrent();
    startRotation();
}

function createFeedbackModal() {
    const overlay = document.createElement("div");
    overlay.className = "feedback-overlay";
    overlay.setAttribute("aria-hidden", "true");

    const modal = document.createElement("div");
    modal.className = "feedback-modal";

    overlay.appendChild(modal);
    document.body.appendChild(overlay);

    function close() {
        overlay.classList.remove("is-open");
        overlay.setAttribute("aria-hidden", "true");
        modal.innerHTML = "";
        document.body.classList.remove("gallery-lightbox-open");
    }

    overlay.addEventListener("click", (event) => {
        if (event.target === overlay) close();
    });

    window.addEventListener("keydown", (event) => {
        if (event.key === "Escape" && overlay.classList.contains("is-open")) close();
    });

    return { overlay, modal, close };
}

function openFeedbackDetailModal(detailModal, feedback) {
    const safe = sanitizeFeedback(feedback);
    if (!safe) return;

    detailModal.modal.innerHTML = `
        <div class="feedback-modal-top">
            <h4>Student Feedback</h4>
            <button type="button" class="feedback-modal-close">Close</button>
        </div>
        <div class="feedback-modal-stars">${renderStars(safe.rating)}</div>
        <div class="feedback-modal-name">${escapeHTML(safe.name)}</div>
        <p class="feedback-modal-message">${escapeHTML(safe.message)}</p>
    `;

    detailModal.modal.querySelector(".feedback-modal-close").addEventListener("click", detailModal.close);
    detailModal.overlay.classList.add("is-open");
    detailModal.overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("gallery-lightbox-open");
}

function openFeedbackFormModal(detailModal, onSubmit) {
    const saveModeLabel = "Crossdale Arts Database";

    detailModal.modal.innerHTML = `
        <div class="feedback-modal-top">
            <h4>Leave Feedback</h4>
            <button type="button" class="feedback-modal-close">Close</button>
        </div>
        <form class="feedback-form" id="feedback-form">
            <label>
                Your Name
                <input type="text" name="name" maxlength="60" required />
            </label>
            <label>
                Rating
                <select name="rating" required>
                    <option value="5">5 Stars</option>
                    <option value="4">4 Stars</option>
                    <option value="3">3 Stars</option>
                    <option value="2">2 Stars</option>
                    <option value="1">1 Star</option>
                </select>
            </label>
            <label>
                Feedback
                <textarea name="message" maxlength="500" required></textarea>
            </label>
            <button type="submit" class="feedback-form-submit">Submit Feedback</button>
            <p class="feedback-form-note">Saved to ${saveModeLabel}.</p>
        </form>
    `;

    detailModal.modal.querySelector(".feedback-modal-close").addEventListener("click", detailModal.close);

    const form = detailModal.modal.querySelector("#feedback-form");
    form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const submitBtn = form.querySelector(".feedback-form-submit");
        submitBtn.disabled = true;
        submitBtn.textContent = "Saving...";

        const formData = new FormData(form);
        const payload = {
            name: String(formData.get("name") || "").trim(),
            rating: Number(formData.get("rating")),
            message: String(formData.get("message") || "").trim()
        };

        const result = await onSubmit(payload);
        if (result.ok) {
            detailModal.close();
            if (result.warning) {
                window.alert(result.warning);
            }
            return;
        }

        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Feedback";
        window.alert(result.message || "Could not save feedback. Try again.");
    });

    detailModal.overlay.classList.add("is-open");
    detailModal.overlay.setAttribute("aria-hidden", "false");
    document.body.classList.add("gallery-lightbox-open");
}

async function loadFeedbackList() {
    const localList = getLocalFeedbacks();

    try {
        const response = await fetch(FEEDBACK_DATA_URL, { method: "GET", cache: "no-store" });
        if (!response.ok) throw new Error("Fetch failed");
        const data = await response.json();
        const remoteList = Array.isArray(data) ? data : data.feedbacks;
        const normalizedRemote = Array.isArray(remoteList) ? remoteList.map(sanitizeFeedback).filter(Boolean) : [];
        return [...localList, ...normalizedRemote];
    } catch (_) {
        return localList;
    }
}

async function saveFeedbackEntry(entry) {
    const localList = getLocalFeedbacks();
    localStorage.setItem(FEEDBACK_STORAGE_KEY, JSON.stringify([entry, ...localList]));
    return { ok: true };
}

function getLocalFeedbacks() {
    try {
        const parsed = JSON.parse(localStorage.getItem(FEEDBACK_STORAGE_KEY) || "[]");
        return Array.isArray(parsed) ? parsed.map(sanitizeFeedback).filter(Boolean) : [];
    } catch (_) {
        return [];
    }
}

function sanitizeFeedback(raw) {
    if (!raw || typeof raw !== "object") return null;
    const name = String(raw.name || "").trim().slice(0, 60);
    const message = String(raw.message || "").trim().slice(0, 500);
    const rating = Math.max(1, Math.min(5, Number(raw.rating) || 0));
    if (!name || !message || !rating) return null;
    return { name, message, rating };
}

function renderStars(rating) {
    const safeRating = Math.max(1, Math.min(5, Number(rating) || 0));
    return `${"★".repeat(safeRating)}${"☆".repeat(5 - safeRating)}`;
}

function truncateFeedback(text, maxLen) {
    const safe = String(text || "").trim();
    if (safe.length <= maxLen) return safe;
    return `${safe.slice(0, maxLen - 1).trimEnd()}...`;
}

function escapeHTML(text) {
    return String(text || "")
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

initFeedbackWidget();
