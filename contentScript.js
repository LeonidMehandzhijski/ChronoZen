// Listen for messages from the background script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  switch (request.type) {
    case 'CHECK_MEDIA_PLAYER':
      const spotifyPlayer = document.querySelector('.spotify-player');
      const youtubePlayer = document.querySelector('.youtube-player');
      sendResponse({
        hasSpotify: !!spotifyPlayer,
        hasYoutube: !!youtubePlayer
      });
      break;

    case 'CONTROL_MEDIA':
      handleMediaControl(request.action);
      break;
  }
  return true;
});

// Handle media player controls
function handleMediaControl(action) {
  // Find media players on the page
  const spotifyPlayButton = document.querySelector('[data-testid="play-button"]');
  const youtubeMusicPlayButton = document.querySelector('.play-pause-button');
  
  switch (action) {
    case 'play':
      if (spotifyPlayButton) spotifyPlayButton.click();
      if (youtubeMusicPlayButton) youtubeMusicPlayButton.click();
      break;
      
    case 'pause':
      if (spotifyPlayButton) spotifyPlayButton.click();
      if (youtubeMusicPlayButton) youtubeMusicPlayButton.click();
      break;
      
    case 'next':
      const nextButton = document.querySelector('[data-testid="next-button"]') || 
                        document.querySelector('.next-button');
      if (nextButton) nextButton.click();
      break;
      
    case 'previous':
      const prevButton = document.querySelector('[data-testid="previous-button"]') || 
                        document.querySelector('.previous-button');
      if (prevButton) prevButton.click();
      break;
  }
}

// Observe DOM changes for media player updates
const observer = new MutationObserver((mutations) => {
  mutations.forEach((mutation) => {
    if (mutation.type === 'childList' || mutation.type === 'attributes') {
      // Check if media player state has changed
      const mediaInfo = getMediaInfo();
      if (mediaInfo) {
        chrome.runtime.sendMessage({
          type: 'MEDIA_UPDATE',
          info: mediaInfo
        });
      }
    }
  });
});

// Get current media information
function getMediaInfo() {
  // Try Spotify
  const spotifyTrack = document.querySelector('[data-testid="now-playing-widget"]');
  if (spotifyTrack) {
    return {
      service: 'spotify',
      title: spotifyTrack.querySelector('.track-title')?.textContent || 'Unknown',
      artist: spotifyTrack.querySelector('.artist-name')?.textContent || 'Unknown',
      isPlaying: !!document.querySelector('[data-testid="pause-button"]')
    };
  }

  // Try YouTube Music
  const youtubeTrack = document.querySelector('.ytmusic-player-bar');
  if (youtubeTrack) {
    return {
      service: 'youtube',
      title: youtubeTrack.querySelector('.title')?.textContent || 'Unknown',
      artist: youtubeTrack.querySelector('.byline')?.textContent || 'Unknown',
      isPlaying: !!document.querySelector('.playing-mode')
    };
  }

  return null;
}

// Start observing the document for media player changes
observer.observe(document.body, {
  childList: true,
  subtree: true,
  attributes: true,
  attributeFilter: ['class', 'data-testid']
}); 