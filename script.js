document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const container = document.getElementById('created-container');
    const fileInput = document.getElementById('file-input');
    const emoji = document.getElementById('emoji-btn');
    const emojiInput = document.getElementById('emoji-input');
    const playBtn = document.getElementById('play-btn');

    const ASCII_CHARS = ["@", "#", "S", "%", "?", "*", "+", ";", ":", ",", " "].reverse();
    
    const state = {
        frameSize: 200,
        isPlaying: false,
        ascii: false
    };

    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    function getAsciiCharacter(value) {
        return ASCII_CHARS[Math.floor(value / 256 * ASCII_CHARS.length)];
    }

    function processFrame() {
        if (!state.isPlaying) return;

        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        const pixels = imageData.data;

        let frame = ''; // Reset frame buffer for each frame

        for (let i = 0; i < canvas.height; i++) {
            for (let j = 0; j < canvas.width; j++) {
                const idx = (i * canvas.width + j) * 4;
                if (state.ascii) {
                    const gray = pixels[idx] * 0.299 + pixels[idx + 1] * 0.587 + pixels[idx + 2] * 0.114;
                    frame += getAsciiCharacter(gray);
                } else {
                    frame += emoji.value;
                }
            }
            frame += '\n';
        }
        container.textContent = frame;

        if (!video.ended) {
            requestAnimationFrame(processFrame);
        } else {
            state.isPlaying = false;
            playBtn.textContent = 'Play';
        }
    }

    function updateCanvasSize() {
        const aspectRatio = video.videoHeight / video.videoWidth;
        canvas.width = state.frameSize;
        canvas.height = Math.floor(state.frameSize * aspectRatio * 0.5);
    }

    fileInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            const url = URL.createObjectURL(file);
            video.src = url;
            video.load();
        }
    });

    playBtn.addEventListener('click', () => {
        if (!video.src) {
            alert('Please select a video file first');
            return;
        }

        if (state.isPlaying) {
            video.pause();
            state.isPlaying = false;
            playBtn.textContent = 'Play';
        } else {
            video.play();
            state.isPlaying = true;
            playBtn.textContent = 'Pause';
            processFrame();
        }
    });

    emoji.addEventListener('click', () => {
        state.ascii = !state.ascii;
        emoji.textContent = state.ascii ? 'Ascii' : 'Emoji';
        emojiInput.style.display = state.ascii ? 'none' : 'block';
    });

    video.addEventListener('loadedmetadata', updateCanvasSize);

    // Optional: Load default video
    if (video.src === '') {
        video.src = 'BadApple.mp4';
        video.load();
    }
});