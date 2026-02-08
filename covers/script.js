// Interaction: click the album to reveal the vinyl, click again to toggle spinning.
(() => {
	const toggleOut = album => {
		album.classList.add('album--out');
		album.classList.remove('album--playing');
		album.setAttribute('aria-pressed', 'false');
	};

	const togglePlaying = album => {
		const playing = album.classList.toggle('album--playing');
		album.setAttribute('aria-pressed', String(playing));
	};

	const handleActivate = album => {
		if (!album.classList.contains('album--out')) {
			toggleOut(album);
			return;
		}
		// if visible -> toggle play/pause
		togglePlaying(album);
	};

	document.addEventListener('DOMContentLoaded', () => {
		const albums = Array.from(document.querySelectorAll('.album'));
		albums.forEach(album => {
			album.setAttribute('tabindex', '0');
			album.setAttribute('role', 'button');
			album.setAttribute('aria-pressed', 'false');

			album.addEventListener('click', () => handleActivate(album));
			album.addEventListener('keydown', e => {
				if (e.key === 'Enter' || e.key === ' ') {
					e.preventDefault();
					handleActivate(album);
				}
			});
		});
	});
})();