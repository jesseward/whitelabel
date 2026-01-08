export const SEARCH_CONFIG = {
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
