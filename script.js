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
