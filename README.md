# “A Little Light, Always” — A Diwali Story by Payal

An award-winning interactive, scroll-controlled cinematic Diwali short film following a contemporary Gujarati Indian family through the five sacred days of Diwali.

Built with **Three.js (WebGL)**, **Procedural Web Audio API**, and **Smooth Scroll Choreography**.

---

## 🎨 Creative & Art Direction

### Color Palette
- **Deep Oxblood**: `#410F20`
- **Rich Burgundy**: `#6E2338` (Signature identity)
- **Dark Wine**: `#2A111B`
- **Antique Champagne Gold**: `#C5A46D`
- **Muted Gold Highlights**: `#D8BD8A`
- **Warm Ivory**: `#F5EBDD`
- **Espresso**: `#211A1B`

### Typography
- **Cormorant Garamond**: Editorial headlines and poetic verse.
- **Inter**: Modern labels, metadata, and chapter navigation.
- **Great Vibes**: Calligraphic handwritten signature for Payal.

---

## 📜 Continuous 5-Day Story Structure

1. **Chapter 1 — Dhanteras: The First Gift**
   - *Theme:* Abundance, anticipation, and gratitude.
   - *Scene:* Warm afternoon in an authentic Gujarati home. A family member arrives carrying a velvet burgundy gift box tied with a satin champagne-gold ribbon. The camera moves towards the entrance and pushes gently into the polished teakwood table.
   - *Transition:* The gold ribbon sweeps close to the camera lens, creating a seamless metallic gold and velvet wipe.
   - *Interactive:* Click to unwrap a personal Dhanteras blessing.

2. **Chapter 2 — Kali Chaudas: A Fresh Beginning**
   - *Theme:* Renewal, clarity, and letting go.
   - *Scene:* Crisp morning light. The 3D carved wooden shutters smoothly swing open on their hinges as the user scrolls. Volumetric shafts of morning sunlight flood the hall, illuminating floating dust motes.
   - *Transition:* The sunlight beam expands into an exposure bloom that brightens the room for the festive evening.

3. **Chapter 3 — Diwali: The House Comes Alive**
   - *Theme:* Joy, togetherness, celebration, and possibility (The Climax).
   - *Scene:* The home is illuminated by dozens of glowing oil diyas with flickering flames and a massive brass urli filled with marigold petals and floating tea lights. The grand title **“HAPPY DIWALI”** emerges with gold foil reflections.
   - *Transition:* A family member hands a burgundy gift box across the camera foreground, sweeping the lens into the next chapter.

4. **Chapter 4 — Bestu Varas: Doors to Tomorrow**
   - *Theme:* Gujarati New Year, fresh perspective, and optimism.
   - *Scene:* The camera tracks through the carved teak doorway into an open, sunlit limestone courtyard adorned with a colorful floral rangoli mandala and marigold torans.
   - *Greeting:* Restrained *“Saal Mubarak!”* badge.
   - *Transition:* Gliding smoothly through the courtyard archway into the quiet verandah.

5. **Chapter 5 — Bhai Bij: What Matters Most**
   - *Theme:* Family affection, belonging, and gratitude.
   - *Scene:* Soft golden hour twilight on the verandah. A silver aarti thali with an oil diya and sweets sets the scene for a warm brother-sister moment. The camera pulls back into an expansive, peaceful cinematic wide shot.
   - *Final Greeting Card:*
     > **“A Little Light, Always.”**  
     > *“Wishing you and your loved ones a beautiful Diwali and a wonderful year ahead.”*  
     > **With warmth, Payal**
   - *Features:* Functional **“Share this wish”** (Web Share API + clipboard fallback) and **“Replay the story”** (smooth rewind).

---

## 💻 Technical Highlights

- **Continuous 3D Spline Camera Tracking**: The camera glides on a continuous Catmull-Rom spline without disjointed cuts or slideshow cards.
- **100% Offline-Ready Procedural Audio**: Built using the Web Audio API with zero external audio assets. Synthesizes a meditative Indian Tanpura drone, brass temple bell (*Ghanti*) chimes on chapter transitions, and warm evening breeze textures. Begins muted to comply with modern browser policies.
- **5-Day Discreet Chapter Navigation**: Jump to any chapter with one click; keyboard navigation support (`Arrow keys`, `Space`, `1-5` number keys).
- **Reduced Motion & Accessibility**: Detects OS `prefers-reduced-motion` and includes a manual toggle button in the header.
- **Responsive Mobile Engine**: Dynamic aspect ratio and FOV adjustments for smooth 60fps performance on mobile devices.

---

## 🚀 How to Run

### Option 1: Direct File Preview
Simply double-click or open `index.html` in any modern web browser (Chrome, Edge, Safari, Firefox). All dependencies (including Three.js) are stored locally in the folder!

### Option 2: Local Web Server
```bash
# Using Node.js
npx serve .

# Or using Python
python -m http.server 3000
```
Open `http://localhost:3000` in your browser.
