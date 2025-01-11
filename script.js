document.addEventListener('DOMContentLoaded', () => {
    const video = document.getElementById('video');
    const container = document.getElementById('created-container');
    const fileInput = document.getElementById('file-input');
    const emoji = document.getElementById('emoji-btn');
    const emojiInput = document.getElementById('emoji-input');
    const playBtn = document.getElementById('play-btn');
    const progress = document.querySelector('.progress');
    const ASCII_CHARS = ["@", "#", "S", "%", "?", "*", "+", ";", ":", ",", " "].reverse();
    
    const state = {
        frameSize: 240,
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

        let frame = ''; //reset frame buffer for each frame

        for (let i = 0; i < canvas.height; i++) {
            for (let j = 0; j < canvas.width; j++) {
                const idx = (i * canvas.width + j) * 4;
                //grayscale based on luminances
                const gray = pixels[idx] * 0.299 + pixels[idx + 1] * 0.587 + pixels[idx + 2] * 0.114;
                if (state.ascii) {
                    frame += getAsciiCharacter(gray);
                } else {
                    if (gray > 0.7){
                        frame += emojiInput.value.substring(0,2);
                    } else {
                        frame += "  ";
                    }
                    
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
        if (!state.ascii) {
            canvas.height = Math.floor(state.frameSize * aspectRatio * 0.7);
        } else {
            canvas.height = Math.floor(state.frameSize * aspectRatio * 0.5);
        }
        canvas.width = state.frameSize;

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
        if (state.ascii) {
            container.classList.remove('emoji-mode'); 
        } else {
            container.classList.add('emoji-mode');
        }
    });

    video.addEventListener('loadedmetadata', updateCanvasSize);

    video.addEventListener('timeupdate', () => {
        const percent = (video.currentTime / video.duration) * 100;
        progress.style.width = percent + '%';
    });

    //load default
    if (video.src === '') {
        video.src = 'BadApple.mp4';
        video.load();
    }

    container.classList.add('emoji-mode');
});
