// Plyr control color override
var plyrStyle = document.createElement("style");
plyrStyle.textContent = "--plyr-color-main: #f33f32;" +
  ".plyr--full-ui input[type=range]{color:#f33f32}" +
  ".plyr__control--overlaid{background:#f33f32}" +
  ".plyr__control--overlaid:hover{background:#d63529}" +
  ".plyr__menu__container [role=menuitemradio][aria-checked=true]::before{background:#f33f32}";
document.head.appendChild(plyrStyle);

document.addEventListener("DOMContentLoaded", function () {
  console.log("DOMContentLoaded");
  var OFFSET = 82 + 16; // navbar height + 16px breathing room
  var ACTIVE_COLOR = "#8D4CDD";
  var tocLinks = document.querySelectorAll(".toc-link");
  var sections = [];

  // Build sections array from TOC link hrefs
  tocLinks.forEach(function (link) {
    var href = link.getAttribute("href");
    if (!href) return;
    var id = href.replace("#", "");
    var target = document.getElementById(id);
    if (target) {
      sections.push({ id: id, el: target, link: link });
    }
  });

  // Store each link's original color
  tocLinks.forEach(function (link) {
    link.dataset.originalColor = getComputedStyle(link).color;
  });

  // Disable Webflow's native smooth scroll on TOC links
  tocLinks.forEach(function (link) {
    link.removeAttribute("data-wf-id");
    link.removeAttribute("data-wf-element");
  });

  // Disable CSS scroll-behavior so we control it entirely
  document.documentElement.style.scrollBehavior = "auto";

  // Smooth scroll on click with offset
  tocLinks.forEach(function (link) {
    link.addEventListener("click", function (e) {
      e.preventDefault();
      e.stopPropagation();

      // Remove hash from URL to prevent browser jump
      history.pushState(null, null, " ");

      var id = this.getAttribute("href").replace("#", "");
      var target = document.getElementById(id);
      if (!target) return;

      // Collapse mobile TOC on click below 991px by triggering Webflow's own interaction
      if (window.innerWidth < 991) {
        var mToc = document.getElementById("m-toc");
        if (mToc && mToc.offsetHeight > 60) {
          mToc.click();
        }
      }

      var top = target.getBoundingClientRect().top + window.pageYOffset - OFFSET;
      window.scrollTo({ top: top, behavior: "smooth" });
    }, true); // capture phase to fire before Webflow's handler
  });

  // Close #m-toc when clicking anywhere else on the page
  document.addEventListener("click", function (e) {
    if (window.innerWidth >= 991) return;
    var mToc = document.getElementById("m-toc");
    if (!mToc) return;
    if (mToc.contains(e.target)) return;
    if (mToc.offsetHeight > 60) {
      mToc.click();
    }
  });

  var lastActive = null;

  // Highlight active link on scroll
  function setActiveLink() {
    var current = null;
    var viewportBottom = window.innerHeight;

    for (var i = 0; i < sections.length; i++) {
      var rect = sections[i].el.getBoundingClientRect();
      // Becomes active once 30px into viewport from bottom, stays active after scrolling past
      if (rect.top <= viewportBottom - 30) {
        current = sections[i];
      }
    }

    // Keep last highlighted if nothing new qualifies
    if (current) {
      lastActive = current;
    } else {
      current = lastActive;
    }

    tocLinks.forEach(function (link) {
      link.style.color = link.dataset.originalColor;
      link.style.fontWeight = "";
    });

    if (current) {
      current.link.style.color = ACTIVE_COLOR;
      current.link.style.fontWeight = "bold";
    }
  }

  // Throttle scroll events
  var ticking = false;
  window.addEventListener("scroll", function () {
    if (!ticking) {
      window.requestAnimationFrame(function () {
        setActiveLink();
        ticking = false;
      });
      ticking = true;
    }
  });

  // Set initial state
  setActiveLink();

  // ── Plyr Video Player (CLS-safe) ──
  var videoBlock = document.querySelector(".plyr_video_block");
  if (videoBlock) {
    // Reserve space to prevent layout shift (16:9)
    videoBlock.style.position = "relative";
    videoBlock.style.paddingBottom = "56.25%";
    videoBlock.style.height = "0";
    videoBlock.style.overflow = "hidden";
    videoBlock.style.background = "#000";

    // Create Vimeo embed
    var wrapper = document.createElement("div");
    wrapper.style.position = "absolute";
    wrapper.style.top = "0";
    wrapper.style.left = "0";
    wrapper.style.width = "100%";
    wrapper.style.height = "100%";
    wrapper.setAttribute("data-plyr-provider", "vimeo");
    wrapper.setAttribute("data-plyr-embed-id", "1073204727");
    videoBlock.appendChild(wrapper);

    // Init Plyr
    var player = new Plyr(wrapper, {
      resetOnEnd: true
    });

    // Custom frosted glass play overlay
    var overlay = document.createElement("div");
    overlay.style.cssText = "position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;z-index:10;cursor:pointer;";

    var pill = document.createElement("div");
    pill.style.cssText = "display:flex;align-items:center;gap:12px;padding:14px 32px;border-radius:999px;background:rgba(0,0,0,0.39);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);border:none;color:#fff;font-size:18px;font-weight:500;transition:background 0.2s;";

    // Play triangle icon
    var icon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    icon.setAttribute("viewBox", "0 0 24 24");
    icon.setAttribute("fill", "white");
    icon.setAttribute("width", "22");
    icon.setAttribute("height", "22");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    path.setAttribute("d", "M8 5v14l11-7z");
    icon.appendChild(path);

    var label = document.createElement("span");
    label.textContent = "Play video";

    pill.appendChild(icon);
    pill.appendChild(label);
    overlay.appendChild(pill);

    // Append overlay to the Webflow wrapper which has real dimensions
    var videoWrapper = document.querySelector(".video_wrapper");
    if (videoWrapper) {
      videoWrapper.style.position = "relative";
      videoWrapper.appendChild(overlay);
    }

    // Magnetic follow effect on pill
    pill.style.transition = "background 0.2s";
    pill.style.pointerEvents = "none";

    overlay.addEventListener("mousemove", function (e) {
      var rect = overlay.getBoundingClientRect();
      var x = e.clientX - rect.left - rect.width / 2;
      var y = e.clientY - rect.top - rect.height / 2;
      gsap.to(pill, {
        x: x * 0.3,
        y: y * 0.3,
        duration: 0.4,
        ease: "power2.out"
      });
      pill.style.background = "rgba(0,0,0,0.5)";
    });

    overlay.addEventListener("mouseleave", function () {
      gsap.to(pill, {
        x: 0,
        y: 0,
        duration: 0.6,
        ease: "elastic.out(1, 0.5)"
      });
      pill.style.background = "rgba(0,0,0,0.39)";
    });

    // Click to play and hide overlay
    overlay.addEventListener("click", function () {
      player.play();
      overlay.style.display = "none";
    });

    // Show overlay again when video ends
    player.on("ended", function () {
      overlay.style.display = "flex";
    });

    // Hide Plyr's default big play button
    player.on("ready", function () {
      videoBlock.style.paddingBottom = "";
      videoBlock.style.height = "";
      videoBlock.style.position = "";
      videoBlock.style.overflow = "";

      var plyrBtn = videoBlock.querySelector(".plyr__control--overlaid");
      if (plyrBtn) plyrBtn.style.display = "none";
    });
  }

  // ── Mark video (Plyr, 16:9, circle play overlay, full controls) ──
  var markVideo = document.querySelector(".mark-video");
  if (markVideo) {
    // Reserve 16:9 space to prevent layout shift
    markVideo.style.position = "relative";
    markVideo.style.paddingBottom = "56.25%";
    markVideo.style.height = "0";
    markVideo.style.overflow = "hidden";
    markVideo.style.background = "#000";

    var markWrapper = document.createElement("div");
    markWrapper.style.cssText = "position:absolute;top:0;left:0;width:100%;height:100%;";
    markWrapper.setAttribute("data-plyr-provider", "vimeo");
    markWrapper.setAttribute("data-plyr-embed-id", "1176092719");
    markVideo.appendChild(markWrapper);

    var markPlayer = new Plyr(markWrapper, {
      resetOnEnd: true
    });

    // Circle play button overlay
    var markOverlay = document.createElement("div");
    markOverlay.style.cssText = "position:absolute;top:0;left:0;right:0;bottom:0;display:flex;align-items:center;justify-content:center;z-index:10;cursor:pointer;";

    var markCircle = document.createElement("div");
    markCircle.style.cssText = "display:flex;align-items:center;justify-content:center;width:60px;height:60px;border-radius:50%;background:rgba(0,0,0,0.39);backdrop-filter:blur(16px);-webkit-backdrop-filter:blur(16px);transition:background 0.2s;";

    var markIcon = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    markIcon.setAttribute("viewBox", "0 0 24 24");
    markIcon.setAttribute("fill", "white");
    markIcon.setAttribute("width", "22");
    markIcon.setAttribute("height", "22");
    var markPath = document.createElementNS("http://www.w3.org/2000/svg", "path");
    markPath.setAttribute("d", "M8 5v14l11-7z");
    markIcon.appendChild(markPath);

    markCircle.appendChild(markIcon);
    markOverlay.appendChild(markCircle);
    markVideo.appendChild(markOverlay);

    markOverlay.addEventListener("mouseenter", function () {
      markCircle.style.background = "rgba(0,0,0,0.5)";
    });
    markOverlay.addEventListener("mouseleave", function () {
      markCircle.style.background = "rgba(0,0,0,0.39)";
    });

    markOverlay.addEventListener("click", function () {
      markPlayer.play();
      markOverlay.style.display = "none";
    });

    markPlayer.on("ended", function () {
      markOverlay.style.display = "flex";
    });

    markPlayer.on("ready", function () {
      markVideo.style.paddingBottom = "";
      markVideo.style.height = "";
      markVideo.style.position = "";
      markVideo.style.overflow = "";

      var markPlyrBtn = markVideo.querySelector(".plyr__control--overlaid");
      if (markPlyrBtn) markPlyrBtn.style.display = "none";
    });
  }

  // ── Hero staggered fade-up animation ──
  gsap.set([".aw_logo_top", ".cross_icon", ".zuora_logo_top"], {
    opacity: 0,
    y: 40
  });
  var heroTl = gsap.timeline({ delay: 0.3 });

  heroTl.to([".aw_logo_top", ".cross_icon", ".zuora_logo_top"], {
    opacity: 1,
    y: 0,
    duration: 1.2,
    ease: "power2.out",
    stagger: 0.35
  });

  // ── Hero text word-by-word fade-up ──
  var heroTxt = document.getElementById("hero_txt");
  if (heroTxt) {
    var words = heroTxt.textContent.trim().split(/\s+/);
    heroTxt.innerHTML = words.map(function (word) {
      return '<span style="display:inline-block;opacity:0;transform:translateY(20px)">' + word + '</span>';
    }).join(' ');

    var wordSpans = heroTxt.querySelectorAll("span");
    heroTl.to(wordSpans, {
      opacity: 1,
      y: 0,
      duration: 0.9,
      ease: "power2.out",
      stagger: 0.12
    }, "-=1.2"); // start when logo animation is roughly midway

    // ── PM pointers fade-up ──
    gsap.set(".pm-pointers-wraper", { opacity: 0, y: 40 });
    heroTl.to(".pm-pointers-wraper", {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out"
    }, "-=1.0"); // start early during text animation

    // ── Video wrapper fade-up ──
    gsap.set(".video_wrapper", { opacity: 0, y: 40 });
    heroTl.to(".video_wrapper", {
      opacity: 1,
      y: 0,
      duration: 1,
      ease: "power2.out"
    }, "-=0.5");
  }

  // ── Content section scroll-triggered fade-up (waits for hero) ──
  gsap.registerPlugin(ScrollTrigger);

  gsap.set([".case_study_toc_wrapper", ".case_study_block"], {
    opacity: 0,
    y: 40
  });

  heroTl.eventCallback("onComplete", function () {
    ScrollTrigger.create({
      trigger: "#content_section",
      start: "top 80%",
      once: true,
      onEnter: function () {
        var contentTl = gsap.timeline();
        contentTl.to(".case_study_toc_wrapper", {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out"
        }).to(".case_study_block", {
          opacity: 1,
          y: 0,
          duration: 1,
          ease: "power2.out"
        }, "-=0.5");
      }
    });
  });
});
