export const SEARCH_CONFIG = {
  BATCH_SIZE: 16,
  REGEX: {
    ARTIST: /artist:\s*(?:"([^"]+)"|'([^']+)'|(\S+))/i,
    ALBUM: /album:\s*(?:"([^"]+)"|'([^']+)'|(\S+))/i,
  },
  PLACEHOLDERS: [
    'default_album_artwork',
    'no-cover',
    'spacer.gif',
    'placeholder'
  ]
};
