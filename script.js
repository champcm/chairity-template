document.addEventListener("DOMContentLoaded", () => {
    // --- Global Element Selectors ---
    const header = document.querySelector("header");
    const nav = header ? header.querySelector("nav") : null;
    const menuToggle = header ? header.querySelector(".menu-toggle") : null;
    const navLinks = header ? header.querySelectorAll("nav ul li a") : [];
    const sectionsWithId = document.querySelectorAll("section[id]");

    // --- 1. Mobile Menu Toggle ---
    function initMobileMenu() {
        if (menuToggle && nav) {
            menuToggle.addEventListener("click", () => {
                nav.classList.toggle("active");
                menuToggle.classList.toggle("active");
            });
        }
    }

    // --- 2. Header Scroll Effects & Active Link Highlighting ---
    function initHeaderScrollAndNav() {
        if (!header) return;
        const scrollThreshold = 50;

        const updateActiveLink = () => {
            let currentSectionId = "";
            const headerHeight = header.offsetHeight;

            sectionsWithId.forEach(section => {
                const sectionTop = section.offsetTop - headerHeight - 20;
                if (window.scrollY >= sectionTop) {
                    currentSectionId = section.id;
                }
            });

            if (sectionsWithId.length > 0 && window.scrollY < (sectionsWithId[0].offsetTop - headerHeight - 20)) {
                currentSectionId = sectionsWithId[0].id; // Default to first section if at top
            }

            if ((window.innerHeight + window.scrollY + 20) >= document.body.offsetHeight) {
                if (sectionsWithId.length > 0) {
                    currentSectionId = sectionsWithId[sectionsWithId.length - 1].id;
                }
            }
            
            navLinks.forEach(link => {
                link.classList.remove("active");
                if (link.hash === "#" + currentSectionId) {
                    link.classList.add("active");
                }
            });
        };

        window.addEventListener("scroll", () => {
            if (window.scrollY > scrollThreshold) {
                header.classList.add("scrolled");
            } else {
                header.classList.remove("scrolled");
            }
            updateActiveLink();
        });

        navLinks.forEach(link => {
            link.addEventListener("click", () => {
                navLinks.forEach(l => l.classList.remove("active"));
                link.classList.add("active");
                if (nav && nav.classList.contains("active")) {
                    nav.classList.remove("active");
                    menuToggle.classList.remove("active");
                }
            });
        });
        updateActiveLink(); // Initial check on load
    }
    
    // --- 3. On-Scroll Animations (Intersection Observer) ---
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll(".animate-on-scroll, .animate-list-on-scroll, .animate-testimonial-on-scroll");
        
        const observer = new IntersectionObserver((entries, observer) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add("in-view");
                    observer.unobserve(entry.target);
                }
            });
        }, { threshold: 0.15 });

        animatedElements.forEach(element => observer.observe(element));
    }
    
    // --- 4. Hero Section Special Animations ---
    function initHeroAnimations() {
        // Grid Animation
        const heroGridContainer = document.querySelector(".hero-grid-overlay");
        if (heroGridContainer) {
            // --- OPTIMIZATION: Check if the device is likely mobile ---
            const isMobile = window.innerWidth <= 768;

            // --- UPDATED VARIABLES based on device type ---
            const cellSize = isMobile ? 100 : 250; // Use larger, fewer cells on mobile
            const RANDOM_HIGHLIGHT_INTERVAL_TIME = 1200;

            let cells = [];
            let randomHighlightInterval = null;

            const createGrid = () => {
                heroGridContainer.innerHTML = '';
                cells = [];
                const cols = Math.ceil(heroGridContainer.offsetWidth / cellSize);
                const rows = Math.ceil(heroGridContainer.offsetHeight / cellSize);
                heroGridContainer.style.gridTemplateColumns = `repeat(${cols}, 1fr)`;
                heroGridContainer.style.gridTemplateRows = `repeat(${rows}, 1fr)`;
                for (let i = 0; i < cols * rows; i++) {
                    const cell = document.createElement("div");
                    cell.classList.add("grid-cell");
                    heroGridContainer.appendChild(cell);
                    cells.push(cell);
                }
            };
            
            const stopRandomHighlight = () => {
                clearInterval(randomHighlightInterval);
                document.querySelectorAll(".grid-cell.is-active").forEach(cell => cell.classList.remove("is-active"));
            };

            // --- "CHASER" HIGHLIGHT LOGIC ---
            const startRandomHighlight = () => {
                stopRandomHighlight();
                
                // OPTIMIZATION: On mobile, we won't run the complex JS animation.
                // The hover effect via CSS will still work.
                
                const trailLength = 8;
                let activeCellsQueue = [];

                randomHighlightInterval = setInterval(() => {
                    if (activeCellsQueue.length < trailLength) {
                        let randomIndex;
                        let newCell;
                        do {
                            randomIndex = Math.floor(Math.random() * cells.length);
                            newCell = cells[randomIndex];
                        } while (newCell && newCell.classList.contains('is-active'));
                        
                        if (newCell) {
                            newCell.classList.add("is-active");
                            activeCellsQueue.push(newCell);
                        }
                    } else {
                        const oldestCell = activeCellsQueue.shift();
                        if (oldestCell) {
                            oldestCell.classList.remove("is-active");
                        }

                        let randomIndex;
                        let newCell;
                        let attempts = 0;
                        do {
                            randomIndex = Math.floor(Math.random() * cells.length);
                            newCell = cells[randomIndex];
                            attempts++;
                        } while (newCell && activeCellsQueue.includes(newCell) && attempts < 50);
                        
                        if (newCell) {
                            newCell.classList.add("is-active");
                            activeCellsQueue.push(newCell);
                        }
                    }
                }, RANDOM_HIGHLIGHT_INTERVAL_TIME);
            };

            heroGridContainer.addEventListener('mouseenter', stopRandomHighlight);
            heroGridContainer.addEventListener('mouseleave', startRandomHighlight);
            
            const heroObserver = new IntersectionObserver((entries) => {
                entries.forEach(entry => {
                    if (entry.isIntersecting) {
                        startRandomHighlight();
                    } else {
                        stopRandomHighlight();
                    }
                });
            }, { threshold: 0 });

            createGrid();
            heroObserver.observe(heroGridContainer);
            
            let resizeTimeout;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimeout);
                resizeTimeout = setTimeout(() => {
                    stopRandomHighlight();
                    // Re-check mobile status on resize
                    const wasMobile = window.innerWidth <= 768;
                    createGrid(); // Will use the appropriate cell size
                    // Only restart animation if not on mobile
                    if (!wasMobile) {
                        startRandomHighlight();
                    }
                }, 250);
            });
        }

        // "Equality" Text Animation (This part remains the same)
        const heroEqualityText = document.querySelector(".animate-equality-text");
        if (heroEqualityText) {
            setTimeout(() => heroEqualityText.classList.add("start-animation"), 500);
        }
    }

    // --- 5. "About Us" Chained Animation ---
    function initAboutUsAnimation() {
        const animatedList = document.querySelector(".animate-list-on-scroll");
        const quoteElement = document.querySelector(".about-quote");

        // Ensure all necessary elements exist before proceeding
        if (animatedList) {
          // --- 1. Prepare a function to start the list animation ---
          function startListAnimation() {
            if (animatedList) {
              animatedList.classList.add("in-view");
            }
          }

          // --- 2. Prepare the Typing Effect ---
          const textElement = quoteElement.querySelector("p");
          if (textElement) {
            const fullText = textElement.innerText;
            let charIndex = 0;

            // Hide the text initially
            textElement.innerText = "";
            textElement.style.visibility = "hidden";

            // --- 3. Create a function to start the typing animation ---
            function startTypingEffect() {
              // Make the text element visible and add the typing class for the cursor
              textElement.style.visibility = "visible";
              textElement.classList.add("is-typing");

              //Start typing character by character
              const typingInterval = setInterval(() => {
                if (charIndex < fullText.length) {
                  textElement.textContent += fullText.charAt(charIndex);
                  charIndex++;
                } else {
                  // Typing finished, clear the interval
                  clearInterval(typingInterval);

                  // --- TRIGGER THE NEXT ANIMATION ---
                  // Now that typing is complete, start the list animation.
                  startListAnimation();

                  // Optional: remove the blinking cursor after a delay
                  setTimeout(() => {
                    textElement.classList.remove("is-typing");
                  }, 30000); // Keep cursor blinking for 3 seconds after finishing
                }
              }, 10); // Typing speed in milliseconds
              // setTimeout(() => {
              //   textElement.classList.remove("is-typing");
              // }, 30000);
              startListAnimation();
            }

            // --- 4. Create an Intersection Observer to start the sequence ---
            // This observer will watch the quote element.
            const sequenceObserver = new IntersectionObserver(
              (entries, observer) => {
                entries.forEach((entry) => {
                  if (entry.isIntersecting) {
                    // a. When the quote is visible, start the typing effect.
                    startTypingEffect();

                    // b. Stop observing the element so the animation only runs once.
                    observer.unobserve(entry.target);
                  }
                });
              },
              {
                threshold: 0.5, // Start animation when 50% of the quote box is visible
              }
            );

            sequenceObserver.observe(quoteElement);
          }
        }
    }

    // --- 6. YouTube Slider ---
    function initYouTubeSlider() {
        const YOUTUBE_API_KEY = "AIzaSyAY1JTyafrC4ebpfTxVjG8RfsnbZ0AIaFE";
        const YOUTUBE_CHANNEL_ID = "UCFBdaMNlTBUNWfXRxSMGJvA";
        const MAX_VIDEO_RESULTS = 10;
        const videoScrollContainer = document.querySelector("#portfolio .video-scroll-container");
        const prevArrow = document.getElementById("videoPrevArrow");
        const nextArrow = document.getElementById("videoNextArrow");
        const featScrollContainer = document.querySelector(
            "#featured-content .cards-grid"
        ); // Target the specific cards-grid
        const featPrevArrow = document.getElementById("featPrevArrow");
        const featNextArrow = document.getElementById("featNextArrow");
        
        if (!videoScrollContainer || !prevArrow || !nextArrow) return;
        

        async function fetchYouTubeChannelVideos(apiKey, channelId, maxResults) {
            if (!videoScrollContainer) return;
            videoScrollContainer.innerHTML =
            '<p style="padding: 20px; color: var(--text-dark);">Loading videos...</p>'; // Loading message

            try {
            // Step 1: Get the uploads playlist ID from the channel ID
            const channelResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/channels?part=contentDetails&id=${channelId}&key=${apiKey}`
            );
            if (!channelResponse.ok) {
                const errorData = await channelResponse.json();
                throw new Error(
                `YouTube API Error (Channel): ${errorData.error.message}`
                );
            }
            const channelData = await channelResponse.json();

            if (!channelData.items || channelData.items.length === 0) {
                throw new Error(
                "YouTube channel not found or has no content details."
                );
            }
            const uploadsPlaylistId =
                channelData.items[0].contentDetails.relatedPlaylists.uploads;

            // Step 2: Get videos from the uploads playlist
            const playlistResponse = await fetch(
                `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=${maxResults}&key=${apiKey}`
            );
            if (!playlistResponse.ok) {
                const errorData = await playlistResponse.json();
                throw new Error(
                `YouTube API Error (Playlist): ${errorData.error.message}`
                );
            }
            const playlistData = await playlistResponse.json();

            displayVideos(playlistData.items);
            } catch (error) {
            console.error("Error fetching YouTube videos:", error);
            if (videoScrollContainer) {
                videoScrollContainer.innerHTML = `<p style="padding: 20px; color: red;">Failed to load videos: ${error.message}. Please check your API key and Channel ID.</p>`;
            }
            }
        }

        function displayVideos(videos) {
            if (!videoScrollContainer) return;
            videoScrollContainer.innerHTML = ""; // Clear loading message or previous videos

            if (!videos || videos.length === 0) {
            videoScrollContainer.innerHTML =
                '<p style="padding: 20px; color: var(--text-dark);">No videos found.</p>';
            return;
            }

            videos.forEach((video) => {
            const snippet = video.snippet;
            const videoId = snippet.resourceId.videoId;
            const title = snippet.title;
            // Using mqdefault (320x180) for decent quality and size. Others: default, hqdefault, sddefault, maxresdefault
            const thumbnailUrl = snippet.thumbnails.medium
                ? snippet.thumbnails.medium.url
                : "https://via.placeholder.com/320x180?text=No+Thumbnail";

            const videoItemHTML = `
                <div class="video-item">
                    <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank" rel="noopener noreferrer" title="${title}">
                        <img src="${thumbnailUrl}" alt="${title}">
                        <div class="video-info">
                            <h4>${title}</h4>
                        </div>
                    </a>
                </div>
            `;
            videoScrollContainer.innerHTML += videoItemHTML;
            });
        }

        // Call the function to fetch videos when the page loads
        // Ensure API Key and Channel ID are set before calling
        if (
            YOUTUBE_API_KEY !== "YOUR_YOUTUBE_API_KEY" &&
            YOUTUBE_CHANNEL_ID !== "YOUR_YOUTUBE_CHANNEL_ID"
        ) {
            fetchYouTubeChannelVideos(
            YOUTUBE_API_KEY,
            YOUTUBE_CHANNEL_ID,
            MAX_VIDEO_RESULTS
            );
        } else if (videoScrollContainer) {
            videoScrollContainer.innerHTML =
            '<p style="padding: 20px; color: var(--text-dark);">Please configure YouTube API Key and Channel ID in the script.</p>';
        }

        // Scroll Arrow Functionality
        if (prevArrow && nextArrow && videoScrollContainer) {
            const scrollAmount = 300; // Amount to scroll in pixels, adjust as needed (e.g., video item width + margin)

            nextArrow.addEventListener("click", () => {
            videoScrollContainer.scrollLeft += scrollAmount;
            });

            prevArrow.addEventListener("click", () => {
            videoScrollContainer.scrollLeft -= scrollAmount;
            });
        }

        if (featPrevArrow && featNextArrow && featScrollContainer) {
            const featScrollAmount = 330; // Amount to scroll in pixels (approx. card width + margin)
            // Card width (310px) + margin-right (20px) = 330px

            featNextArrow.addEventListener("click", () => {
            featScrollContainer.scrollLeft += featScrollAmount;
            });

            featPrevArrow.addEventListener("click", () => {
            featScrollContainer.scrollLeft -= featScrollAmount;
            });
        }
    }

    // --- Initialize All Components ---
    initMobileMenu();
    initHeaderScrollAndNav();
    initScrollAnimations();
    initHeroAnimations();
    initAboutUsAnimation();
    initYouTubeSlider(); // Call this to start the YouTube API fetch
});
